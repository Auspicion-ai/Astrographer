# Spec — Unit H1: The Registry Write Module (`rag-store-registry-write.ts`)

- **Status: LANDED (2026-09-08)** (the registry hot-apply/removal/rename slice,
  Unit U-H1 of 8 —
  the FIRST unit in the pinned execution order U-H1 → U-H2 → U-H3 → U-H5 → U-H4
  → U-H6 → U-H8; U-H7 (default reassignment) is split out). Gate reference:
  `docs/specs/registry-hot-apply-review.md` §2 **D2** (write path + supersession),
  §2 **D3** (hot-remove policy — ORPHAN), §2 **D4** (rename semantics), §2 **D5**
  (default reassignment split out), §2 **D8** (unit decomposition — the U-H1
  row); §5 "Impact on existing contracts" (REGISTRY-NO-WRITE refined, not
  broken; the `unit-ms1` banned-export census stays green); §6 the live-scenario
  PARK note; binding amendments **A-P2-3** (refine REGISTRY-NO-WRITE /
  boot-time contract to per-module; supersede `tests/unit-ms5-settings-listing.test.ts`
  Red 18 with refresh-on-apply). Revisit condition MET: `docs/pending.md` line 37
  (a live store-create/destroy workflow is wanted without a restart; the proposal
  gate completed 2026-09-08). **COMPLETE through the doc-review pass (2026-09-08):
  TestWriter red 46 → Implementer green 46 → adversarial F-H1-1/F-H1-2 (HOST,
  fixed + regression-tested; unit 49/49) → blind-greens 31 PASS / 0 FAIL → the
  doc-review pass `archive/reviews/2026-09-08-unit-h1-doc-review.md` (RCA-6).**
  The live-scenario gate is PARKED (deferred to a live-app session; the hot-apply
  surface awaits U-H2). The slice is NOT complete — ONLY U-H1 is landed;
  U-H2..H8 pending; U-H2 (the runtime controller) is the next cycle.
- **Scope:** ONE NEW module `src/main/rag-store-registry-write.ts` (PURE
  validate + atomic temp→fsync→rename disk write + a combined
  load-current → mutate → persist → re-load entry point). It imports and RE-USES
  the existing loader's validation surface (`resolveRegistry` from
  `src/main/rag-store-registry.ts` — the loader stays PURE and byte-unchanged; the
  write seam is a SEPARATE module per D2). This unit does NOT wire `main.ts`
  (U-H2), does NOT touch the runtime controller / live `RagStoreDirectory`
  (U-H2), does NOT own hot-add/hot-remove/hot-rename apply semantics in the
  running app (U-H3/U-H4/U-H6), does NOT own the operator-UI editor (U-H8), does
  NOT own default reassignment (U-H7/D5), does NOT add an MCP tool and does NOT
  add an IPC channel (D6 — operator UI IPC is U-H8), and does NOT create a
  teardown/apply runtime surface.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for
  `src/main/rag-store-registry-write.ts` from §5.5/§5.6 (plus the §5.7
  round-trip/atomicity acceptance rows) before any implementation, into the
  SpecWriter-pinned test file `tests/unit-h1-registry-write.test.ts` (§6),
  in the house red-first order (RCA-1) with the failing set reported per unit.

---

## 1. What the proposal asks (the U-H1 slice)

The registry hot-apply slice (`docs/specs/registry-hot-apply-review.md`) is the
reviewed Phase-2 extension of the boot-time-only multi-store registry: a
mid-run registry change (add, remove, or rename a configured store) takes
effect WITHOUT an app restart. Today the registry is BOOT-TIME-ONLY (U-MS1 D8,
`docs/pending.md:37`). For U-H1, the FIRST unit of the slice (review §2 D2/D8),
the proposal asks:

1. **A NEW write seam** — a pure module `src/main/rag-store-registry-write.ts`
   that (a) validates a mutation against the loader's rules, (b) derives a NEW
   validated registry state + the delta (added/removed/renamed names), and
   (c) persists the new state ATOMICALLY (temp + fsync + rename). It is a
   SEPARATE module from the loader (D2) — the existing
   `src/main/rag-store-registry.ts` and its three exports +
   `RAG_STORE_NAME_PATTERN` stay byte-unchanged, read-only, and PURE.
2. **Persisted-and-live never diverge (D2):** the write module always starts
   from the CURRENT disk state (re-read), applies the mutation, writes
   atomically, then RE-LOADS the written file so the returned state is exactly
   what the disk now holds. The disk file IS re-read + re-applied.
3. **The delta contract, not the runtime apply:** the write module returns the
   new registry state AND the delta (added/removed/renamed names). Applying the
   delta to the live runtime — teardown, engine construct, re-bind of the
   const-captured closures, `teardown()` primitives — is the RUNTIME
   controller's job (U-H2), explicitly NOT this unit's.
4. **The supersession (D2/A-P2-3):** the boot-time-only pin is superseded FOR
   THE WRITE MODULE (and, by designation, for the refresh-on-apply wiring that
   U-H2 lands). The loader stays read-only (REGISTRY-NO-WRITE refined to
   per-module). The `unit-ms1` banned-export census (tests 45–46 of
   `tests/unit-ms1-store-registry.test.ts`) stays green; the "registry change
   observed only after restart" wiring test (`tests/unit-ms5-settings-listing.test.ts`
   Red 18) is DESIGNATED superseded-with-refresh-on-apply (the mechanical
   refresh lands in U-H2).
5. **The policy context D3/D4 the write module must respect (at the registry
   level it CAN check):** remove is ORPHAN-unregister-only — the write module
   NEVER touches any store's persistence file or journal (D3); rename is
   RESTRICTED to non-default stores (a default-store rename folds into D5/U-H7),
   and the "no persisted `<name>:`-prefixed ids" half of D4 is a U-H2 CALLER
   precondition the pure module cannot verify (documented — it can only enforce
   the registry-level "non-default" half).

## 2. Feasibility verdict

**Feasible — grounded entirely in existing host primitives; no engine gap; the
loader's validation surface is reused directly.**

- **The atomic write idiom is established** and this module adopts its
  strengthened form: `mkdirSync(dirname, { recursive: true })` +
  `writeFileSync(tmp, JSON.stringify(..., null, 2))` + `renameSync(tmp, path)`
  (`template-store.ts:101-111`, `module-store.ts:130-142`). U-H1 ADDS an fsync
  of the temp file before the rename (the crash-atomicity point the siblings
  omit) and — deliberately — THROWS on a failed write instead of swallowing
  (the siblings' `catch {}` at `module-store.ts:139-141` /
  `template-store.ts:108-110` is NOT copied: an unobservable hot-write failure
  would let persisted-and-live silently diverge, violating D2).
- **The pure validation is a direct reuse** of the loader's already-pinned
  rules: `resolveRegistry(parsed, registryDir, reservedPath)` carries
  name charset/uniqueness, exactly-one-default, absolute
  `corpusRoot`/`persistenceFile`, the F13 persistence-collision guard, and the
  F14 registry-file self-collision seed (F-MS2-1) — NO reimplementation. The
  byte-pinned F1–F14/G-dir messages propagate unchanged.
- **The read-current step reuses the loader's read discipline** (existsSync
  probe + statSync isFile probe + read + strip ONE leading U+FEFF + JSON.parse,
  F-MS1-1/F-MS1-5), but with FAIL-LOUD instead of fail-soft on a corrupt file:
  a hot write onto an unreadable registry cannot preserve the operator's
  intent, so it aborts rather than clobbering from the implicit form.
- **The delta is a pure structural computation** over the candidate config
  array — no engine, no teardown, no re-registration; node-testable under the
  existing vitest suite (no Electron import).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The NEW write module (`rag-store-registry-write.ts`: pure mutation + atomic persist + combined write entry) | Project-specific (composes `node:fs` sync write/rename/fsync + `node:path` in the established store idiom + the loader's validation) | Low cost; the entire hot-apply write surface becomes node-testable before any runtime controller exists (U-H2). |
| The write module THROWS on a failed persist (vs the siblings' swallow) | Project-specific (a deliberate D2 divergence — persisted-and-live never diverge) | A hot-write failure is observable, never a silent split-brain; the controller (U-H2) can surface it. The cost is a stricter-than-siblings contract that U-H1's own tests must pin. |
| `applyRegistryMutation`'s first step VALIDATES the existing registry (fail-loud on an invalid current state) | Project-specific | An operator cannot mutate an already-invalid registry into a partial state; every write starts sound. Zero reimplementation — the loader's F-messages propagate. |
| Drop/write of unknown config keys on the persist path | Project-specific (the loader tolerates unknown keys on READ but never re-exposes them; a write NORMALIZES them away, preserving only the pinned fields) | Deterministic, byte-stable persistence; consistent with the loader's documented output discipline (U-MS1 §5.3). A typo'd key on disk is silently dropped on the next hot write (mirrors the read-side tolerance). |
| The "no persisted `<name>:` ids" half of D4 is NOT verifiable by the pure module | Project-specific (it needs store DATA, not registry state) | Documented as a U-H2 CALLER precondition; the write module enforces only the registry-level half (non-default-only rename). No engine gap. |
| D3/D4/D5/D6/D7 context (deferred to later units) | Project-specific (the write module does NOT own operator-UI IPC, MCP tools, teardown, or default reassignment) | Clean unit boundary; U-H1's contract is registry-shape-only. |
| The supersession of the "observed only after restart" test is DESIGNATED now but mechanically landed in U-H2 | Project-specific | A-P2-3/D2's designation is pinned in §5.10 so no later agent re-litigates the boot-time-only pin; the actual refresh wiring + test re-write is U-H2's row (scope-held from H1). |

No engine gap. The module is entirely host-side, node-testable, and reuses the
loader's validation — no store/engine/Electron import.

### 3a. Adversarial findings (registered — the U-H1 adversarial pass RAN; findings F-H1-1/F-H1-2 transcribed here)

Per RCA-3, the RCA-3 read-only adversarial pass on the U-H1 green ran before the
unit was reported done; its findings (ids F-H1-*) are transcribed here in the
same pass. Host findings are fixed here + regression-tested; an engine
(provident-ssr) finding, should one ever surface, is a `docs/defects.md` +
`docs/HANDOFF.md` item, NEVER a package patch (AGENTS.md item 7).

**Post-pass confirmations (the pre-registered probes held on the landed
module):** (a) the pure mutators never mutate their `parsed`/`stores` input — a
frozen + a reused input yield the same fresh result (H12/G7, deterministic);
(b) the persisted JSON is byte-stable for a config OMITTING
`persistenceFile`/`default`/`corpusRoot` (derived paths stay derived on
round-trip — H1/H7); (c) a mutation leaving zero stores fails loud via the
loader F12 `found 0` (F11/F19); (d) a non-default rename whose derived path
collides (F13) or resolves onto the registry file (F14) fails loud; (e) a
leftover `.tmp` is overwritten by the next write and ignored by the loader.

**Findings (registered 2026-09-08 — the U-H1 adversarial pass):**

- **F-H1-1 (HOST, LOW — FIXED-WITH-REGRESSION):** an ADDED store carrying
  unknown keys (e.g. `custom`) leaked those keys into `configs` / the persisted
  file on the ADD path (the §5.4 step-5 "existing configs verbatim + the new
  store appended" read as a raw spread of the added store, contradicting the
  pinned-fields-only persist contract). **Fix:** the add path now normalizes the
  ADDED store via `normalizeAddStore` — re-emit ONLY the pinned fields
  (`name`/`default`/`persistenceFile`/`corpusRoot`), dropping any unknown key,
  while `embedder` is deliberately PRESERVED verbatim so the loader F10
  (per-store embedder pinned fail-loud) can still fire on a poisoned add. A
  stray unknown key on the added store can no longer survive into `configs` or
  the persisted file (pinned-fields-only, matching the existing-config
  normalization). Regression tests **R-F-H1-1a** (the pure `applyRegistryMutation`
  add drops the unknown keys from `configs` + the resolved registry) + **R-F-H1-1b**
  (the combined `writeRegistryMutation` add persists WITHOUT the unknown keys;
  the re-loaded registry + the on-disk file never contain them) in
  `tests/unit-h1-registry-write.test.ts`.
- **F-H1-2 (HOST, MEDIUM — FIXED-WITH-REGRESSION):** a stat RACE in
  `writeRegistryMutation` — where `existsSync(path)` reports the registry
  present but the subsequent `statSync(path)` throws ENOENT (the file vanished
  between the probe and the stat) — surfaced as a raw native ENOENT instead of
  the pinned W-unreadable fail-state. **Fix:** the `isFile` stat probe now sits
  in the SAME try/catch as the read + parse in step 2, so a stat race (or a
  non-regular file, or a parse failure) all land on the pinned `W-unreadable`
  message — a hot write never surfaces a bare ENOENT. Regression test
  **R-F-H1-2a** (a module-wide `node:fs` `statSync` passthrough mock forced to
  throw ENOENT after `existsSync` returns, exercising the race) in
  `tests/unit-h1-registry-write.test.ts`.
- **No package/upstream (provident-ssr) findings** — both findings are HOST-side
  (`src/`), fixed here + regression-tested; `docs/defects.md`/`docs/HANDOFF.md`
  need NO U-H1 entry.

**Pre-registered edge probes the adversarial pass was asked to confirm (now
ruled by the post-pass confirmations above):**

- The pure mutation functions must never mutate their `parsed`/`stores` input
  (a frozen input and a reused input must both yield the same fresh result).
- The persisted JSON must be byte-stable for a config that OMITS
  `persistenceFile`/`default`/`corpusRoot`/name-`main` legacy carve-out (derived
  paths stay derived on round-trip).
- A mutation that produces a registry whose only store is removed (leave zero
  stores) must fail loud (the loader F12 `found 0`), never silently persist an
  empty or zero-default registry.
- `rename` of a non-default store whose DERIVED path collides with another
  store (F13) or with the registry file itself (F14) must fail loud.
- A leftover `.tmp` from a crashed prior write must not affect the next write
  (overwritten) or the loader (ignored).

### 3b. Proposal-review findings folded in

From `docs/specs/registry-hot-apply-review.md`:

- **D2 (binding):** the NEW pure write module validates + atomic temp→rename,
  then re-load + apply the delta; the disk file IS re-read + re-applied
  (persisted-and-live never diverge); supersedes the "registry change observed
  only after restart" test. Pinned in §5.4 (step 5 of `writeRegistryMutation`)
  + §5.7 (rows R1–R3) + §5.10.
- **D3 (hot-remove = ORPHAN):** the write module's `remove` drops ONLY the
  registry entry; it NEVER deletes/strands-touches the persistence file or the
  journal. Pinned as a NEGATIVE in §5.6 (W-remove touch-pin).
- **D4 (rename semantics):** renamed stores are restricted to NON-default with
  NO persisted `<name>:`-prefixed ids (no id rewrite). The write module enforces
  the registry-level NON-default half (W-rename-default); the no-ids half is a
  documented U-H2 caller precondition (§5.3.2, W-rename section). Id-migration
  for populated non-default stores is a SEPARATE unit.
- **D5 (default reassignment SPLIT OUT):** renaming the default store and any
  default-ness reassignment are OUT — the module rejects a default rename with
  a dedicated message; a remove that would leave zero defaults fails loud via
  the loader F12.
- **D6 (security/authorization — operator-UI IPC only, NO new MCP tool):**
  U-H1 adds neither an MCP tool nor an IPC channel. Pinned as a census/negative
  in §5.8/§5.9 (fail 10).
- **D7 (mid-flight consistency — add atomic / remove drain-then-teardown /
  rename reject-at-resolution):** the RUNTIME consistency primitives are U-H2's
  (`teardown()` lands in U-H5); the write module's only D7 contribution is that
  the persisted registry is validated BEFORE the atomic rename (a partial/mid-
  state registry is unpersistable), and the delta is structured so the
  controller can apply it atomically.
- **A-P2-3 (bound):** REGISTRY-NO-WRITE / boot-time contract refined to
  per-module — the loader keeps the no-write structural pin; the write moves to
  the NEW module; `tests/unit-ms5-settings-listing.test.ts` Red 18 superseded
  with refresh-on-apply (designated here, landed in U-H2). Pinned in §5.10.

## 4. Design decisions pinned by this spec

- **REGISTRY-WRITE-MODULE (new):** the registry WRITE seam is a SEPARATE pure
  module `src/main/rag-store-registry-write.ts`. The loader
  `src/main/rag-store-registry.ts` is byte-unchanged, read-only, and PURE; its
  `REGISTRY-NO-WRITE` pin is REFINED to be per-module (A-P2-3) — it governs the
  LOADER'S import set only. The `unit-ms1` banned-export census (tests 45–46)
  stays green because the loader's export surface + source are untouched.
- **REGISTRY-ATOMIC-WRITE (new):** every registry persist is atomic —
  `mkdirSync(dirname(path), { recursive: true })` → `writeFileSync(path + '.tmp',
  JSON.stringify({ version: 1, stores }, null, 2))` → fsync the temp file →
  `renameSync(tmp, path)`. A failed write leaves the ORIGINAL file intact; a
  crash between the temp write and the rename leaves the original intact plus a
  stale `.tmp` (harmless, overwritten by the next write, ignored by the loader).
  A written registry IS re-readable by `loadRagStoreRegistry` (round-trip).
- **REGISTRY-RELOAD-ON-WRITE (new, D2):** the combined write entry point reads
  the CURRENT disk registry first (fail-loud on corrupt, never the implicit form
  on hot-write), mutates, persists atomically, then RE-LOADS the written file
  and returns the fresh loaded form + the delta. Persisted-and-live never
  diverge. SUPERSEDES the boot-time-only "observed only after restart"
  assertion for this module and — by A-P2-3 designation — the
  `unit-ms5` Red 18 wiring test (the refresh wiring lands in U-H2).
- **REGISTRY-WRITE-FAILS-LOUD (new):** a persist/write failure THROWS (native
  fs Error), explicitly diverging from the sibling stores' catch-and-swallow
  (`module-store.ts:139-141`, `template-store.ts:108-110`). An unobservable
  hot-write failure would let persisted-and-live diverge silently.
- **REGISTRY-DELTA-RETURN (new):** the write module returns the new registry
  state AND the delta `{ added | removed | renamed }`; the delta is a pure
  structural computation. Applying the delta to the live runtime is U-H2's job,
  explicitly out of scope here.
- **Consumed decision rows (implemented by this unit or inherited, cite-only):**
  **MULTI-STORE-REGISTRY** + **REGISTRY-BOOT-SPLIT** /
  **REGISTRY-DERIVED-PATHS** / **REGISTRY-NO-WRITE** / **REGISTRY-CWD-TRANSPARENCY**
  (`docs/decisions.md` MULTI-STORE-REGISTRY row, U-MS1's sub-pins — the loader
  those pins govern is untouched; this module ADDS the write half),
  **SINGLE-WRITER-STORE-PER-STORE** (a hot write rewrites the REGISTRY file
  through ONE main-process writer — the per-store queues are unaffected),
  **STORE-ID-PREFIX** (rename names still match the colon-free charset, so a
  renamed store can never mint a `<name>:` prefix into the id namespace),
  **STORE-LISTING-BOOT-CACHED** / **STORE-LISTING-STATUS-SHARED** (the listing is
  refreshed-on-apply only after U-H2; this unit is purely additive),
  **UI-SELECTOR-DEFERRED** (no UI control here — U-H8).

## 5. The exhaustive contract

### 5.1 The module (`src/main/rag-store-registry-write.ts`)

- ONE new file. Node-testable under the existing vitest suite. NO Electron
  import (`electron` must NOT appear). NO store/engine import
  (`rag-store.ts`/`retrieval.ts`/`rag-store-directory.ts` are not imported). NO
  IPC, NO MCP.
- **The ONLY import from the loader module:** `resolveRegistry` +
  `RagStoreConfig`, `ResolvedRagStoreRegistry`, and `RagStoreRegistryFile` type
  imports from `./rag-store-registry.js`. It MUST NOT import
  `loadRagStoreRegistry` for the hot-mutation read (that would fail-soft a
  corrupt file into the implicit form — the write path needs a FAIL-LOUD raw
  read); the loader is imported and used ONLY for `resolveRegistry` + the
  types + the consts it needs. (**Design note:** `writeRegistryMutation` uses
  `loadRagStoreRegistry` ONLY for the final re-load in step 5, where the file is
  guaranteed valid — see §5.4 step 5.)
- **The pinned import set (write primitive structural pin):** the module imports
  `writeFileSync`, `renameSync`, `mkdirSync`, `existsSync`, `readFileSync`,
  `statSync`, and `openSync`/`fsyncSync`/`closeSync` (the fsync) from `node:fs`,
  and `dirname`, `isAbsolute`, `join`, `resolve` from `node:path`. It must NOT
  import `unlink`/`unlinkSync`/`rm`/`rmSync`/`rmdirSync`/`truncateSync` (NO
  removal/touch primitive — the D3 orphan pin: the module can WRITE the registry
  file but structurally CANNOT delete or truncate any other file). THIS is the
  mirror of the loader's no-write pin: the WRITE module's no-REMOVE pin is
  structural, closing the D3 orphan guarantee at the source level.
- **Purity/determinism (§5.1 requirement 6):** the pure validation+derive
  functions (`applyRegistryMutation` + the three named mutators) perform NO I/O,
  never mutate any input object/array, and are deterministic — the same
  parsed+mutation (with the same registryDir + reservedPath) returns a
  deep-equal result per call, and a caller reusing or freezing the input cannot
  change the output. The ONLY I/O in the module is `persistRagStoreRegistry`
  and the disk-read/re-load steps of `writeRegistryMutation`.
- The module header comment cites this spec (`docs/specs/unit-h1-registry-write.md`
  §5), the review (§2 D2/D3/D4/D5/D8 + A-P2-3), and the decision rows (§4).
- The module holds NO mutable state between calls.

### 5.2 Exported types (exact TS shapes)

```ts
// src/main/rag-store-registry-write.ts — the registry WRITE module (U-H1).

import { resolveRegistry } from './rag-store-registry.js' // READ-ONLY loader validation
import type { RagStoreConfig, ResolvedRagStoreRegistry } from './rag-store-registry.js'
import type { LoadedRagStoreRegistry } from './rag-store-registry.js'

/** The mutation the operator requests. Exactly ONE of the three kinds.
 *  'add' appends a new store; 'remove' unregisters a store BY NAME (orphan —
 *  D3: the persistence file + journal are NEVER touched by this module);
 *  'rename' renames a store, restricted to NON-default stores (D4/D5). */
export type RegistryMutation =
  | { kind: 'add'; store: RagStoreConfig }
  | { kind: 'remove'; name: string }
  | { kind: 'rename'; from: string; to: string }

/** The delta the runtime controller (U-H2) applies — NOT this module's job.
 *  Always exactly ONE non-empty member (a single mutation is one delta entry). */
export interface RegistryDelta {
  added: string[]
  removed: string[]
  renamed: { from: string; to: string }[]
}

/** The pure validate+derive output. `registry` is the new RESOLVED state (the
 *  loader's output shape the runtime consumes); `configs` is the new config
 *  array in a form ready for `persistRagStoreRegistry` (only the pinned
 *  fields, derived/absent fields preserved); `delta` is the structural delta. */
export interface RegistryMutationResult {
  registry: ResolvedRagStoreRegistry
  configs: RagStoreConfig[]
  delta: RegistryDelta
}

/** The combined write entry the runtime controller calls. `loaded` is the
 *  FRESH LoadedRagStoreRegistry re-read from the just-written file (the
 *  persisted-and-live round-trip guarantee, D2); `delta` is the applied delta. */
export interface RegistryWriteResult {
  loaded: LoadedRagStoreRegistry
  delta: RegistryDelta
}
```

### 5.3 Exported functions (exact signatures)

```ts
/** PURE validate + derive. Validates the EXISTING registry (the loader's
 *  rules), applies the mutation to a FRESH copy of its config array, validates
 *  the CANDIDATE (the loader's rules again, incl. F13/F14), and returns the
 *  new resolved registry + the new configs + the delta. Never mutates `parsed`
 *  or any of its arrays/objects. Never touches the filesystem. `reservedPath`
 *  is the same optional internal seed `resolveRegistry` takes (§5.3.2 F14) —
 *  the pure-usage form threads NOTHING; `writeRegistryMutation` threads its
 *  own path. */
export function applyRegistryMutation(
  parsed: unknown,
  registryDir: string,
  mutation: RegistryMutation,
  reservedPath?: string,
): RegistryMutationResult

/** The three named PURE conveniences — thin wrappers over
 *  `applyRegistryMutation` (§5.4). Each returns a validated new state.
 *  `reservedPath` optional as in `applyRegistryMutation`. */
export function addRegistryStore(
  parsed: unknown,
  registryDir: string,
  store: RagStoreConfig,
  reservedPath?: string,
): RegistryMutationResult

export function removeRegistryStore(
  parsed: unknown,
  registryDir: string,
  name: string,
  reservedPath?: string,
): RegistryMutationResult

export function renameRegistryStore(
  parsed: unknown,
  registryDir: string,
  from: string,
  to: string,
  reservedPath?: string,
): RegistryMutationResult

/** ATOMIC persist of a validated registry config array to `path`:
 *  mkdir(recursive) → writeFileSync(tmp) → fsync(tmp) → renameSync(tmp, path).
 *  Validates `configs` via `resolveRegistry(..., dirname(path), path)` FIRST
 *  (an invalid registry can never reach the disk; F14 fires if a store's path
 *  is the registry file itself). THROWS on ANY failure (native fs Error) —
 *  never swallows (§4 REGISTRY-WRITE-FAILS-LOUD). A failed write leaves the
 *  original file intact. */
export function persistRagStoreRegistry(path: string, configs: RagStoreConfig[]): void

/** The combined hot-apply entry: read CURRENT disk configs (fail-loud on
 *  corrupt) → apply the mutation (pure) → persist atomically → RE-LOAD the
 *  written file. Returns the fresh loaded registry + the delta. This is the
 *  D2 "persisted-and-live never diverge" guarantee. */
export function writeRegistryMutation(opts: { path: string; mutation: RegistryMutation }): RegistryWriteResult
```

The module has exactly these 7 exported functions (the 3 pure mutators + the
core `applyRegistryMutation` + `persistRagStoreRegistry` +
`writeRegistryMutation` — that is 6 functions + `add/remove/rename` wrappers
totals 6 distinct bodies: `applyRegistryMutation`, `addRegistryStore`,
`removeRegistryStore`, `renameRegistryStore`, `persistRagStoreRegistry`,
`writeRegistryMutation`), 4 exported types (`RegistryMutation`,
`RegistryDelta`, `RegistryMutationResult`, `RegistryWriteResult`). NO consts are
exported (the loader's `RAG_STORE_NAME_PATTERN` is not re-exported; the charset
check lives in the loader only).

**F-MS1-10 carry-over (JSON-shaped inputs):** all inputs to the exported
functions must be JSON-parse-shaped; inputs carrying getters or Proxies may
present different values per pass and are OUT of contract (U-MS1 §5.3).

### 5.4 Function behavior (pinned)

#### `applyRegistryMutation(parsed, registryDir, mutation, reservedPath?)` + the three wrappers

1. **Guard (mutation):** `mutation` must be a non-null object whose `kind` is
   exactly one of `'add'`/`'remove'`/`'rename'` — else throw:
   - `mutation` null/non-object → **W-mutation**
     `rag-store-registry-write: mutation required`.
   - a `kind` outside the union → **W-kind**
     `rag-store-registry-write: unknown mutation kind '<kind>'` (`<kind>` via
     the §5.5 `<json>` renderer — total + capped, reusing the loader's
     `jsonOf` discipline).
   For the wrappers, the wrapper-specific arg guards use the SAME message
   family:
   - `addRegistryStore` with a non-object/`null` `store` →
     **W-add-store** `rag-store-registry-write: add store required`.
   - `removeRegistryStore`/`renameRegistryStore` with a non-string/empty
     `from`/`name`/`to` → **W-rename-arg** / **W-remove-arg**
     `rag-store-registry-write: <name> required` (the `<name>` is the literal
     parameter name `'name'`/`'from'`/`'to'`).
2. **Validate the EXISTING registry:** `resolveRegistry(parsed, registryDir,
   reservedPath)` — a null/non-object `parsed`, a missing/wrong `version`, a
   missing/non-array `stores`, or any F4–F14 in the current config ⇒ the
   loader's byte-pinned message **PROPAGATES** unchanged (F1–F14 / G-dir). A
   non-string/empty `registryDir` ⇒ the loader's G-dir
   `rag-store-registry: registryDir required`. This is the sound-invariant:
   you cannot mutate an already-invalid registry.
3. **Extract the current configs (fresh deep copy, normalized):** read
   `(parsed as any).stores` as a `RagStoreConfig[]`. Build a NEW array where
   each entry re-emits ONLY the pinned fields with the loader's field-presence
   rule (a field present iff `!== undefined`), dropping `embedder` and any
   unknown keys:
   `{ name, ...(default !== undefined ? { default } : {}), ...(persistenceFile
   !== undefined ? { persistenceFile } : {}), ...(corpusRoot !== undefined ?
   { corpusRoot } : {}) }`. A config that OMITS `persistenceFile` keeps it
   omitted (derived paths stay derived — round-trip byte-stable). This fresh
   array is what the candidate is built from; the input `parsed` is NEVER
   mutated.
4. **Semantic checks (mutation-specific, byte-pinned — these are the
   write-module's OWN messages, checked BEFORE the candidate validation):**
   - **add — name already exists:** the `add` store's `name` is already in the
     current configs → **W-add-existing**
     `rag-store-registry-write: store '<name>' already exists`.
   - **remove — unknown name:** `name` not present → **W-remove-unknown**
     `rag-store-registry-write: cannot remove unknown store '<name>'`.
   - **rename — unknown source:** `from` not present → **W-rename-unknown-from**
     `rag-store-registry-write: cannot rename unknown store '<from>'`.
   - **rename — target exists:** `to` already present → **W-rename-target-exists**
     `rag-store-registry-write: store '<from>' cannot be renamed to '<to>': '<to>' already exists`.
   - **rename — default store (D4/D5):** `from ===
     (the current default's name)` → **W-rename-default**
     `rag-store-registry-write: the default store cannot be renamed (default reassignment is a separate unit)`.
   - **(D4 no-ids half, NOT enforced here):** whether a non-default store has
     persisted `<name>:`-prefixed ids requires reading store DATA; the pure
     module cannot check it. It is a DOCUMENTED U-H2 CALLER PRECONDITION: the
     runtime controller (U-H2) inspects the store before calling
     `writeRegistryMutation` with a `from` it suspects is populated, and
     declines an id-repacking rename. The write module accepts any non-default
     rename regardless.
5. **Build the candidate config array** (fresh, in registry array order):
   - `add` → the existing configs (verbatim, in order) + the new `store`
     APPENDED LAST (§5.3.2 no-reordering: registry array order is authoritative).
   - `remove` → the existing array with the entry whose `name` matches dropped
     (order of the survivors preserved).
   - `rename` → the existing array with the entry whose `name === from` having
     its `name` replaced by `to` IN PLACE (its `default`/`persistenceFile`/
     `corpusRoot` fields verbatim; explicit fields stay explicit, omitted stay
     omitted — renaming can CHANGE only the name). All other entries verbatim,
     in order.
6. **Validate the candidate:** `resolveRegistry({ version: 1, stores: candidate
   }, registryDir, reservedPath)` — ANY loader F-rule the candidate violates
   **PROPAGATES** unchanged. Reachable candidate-level failures: a default
   store added when one already exists (two defaults) → F12 `found 2`; a
   store added named such that its derived/explicit persistence file collides
   → F13; a rename/added store whose file resolves onto the registry file (when
   `reservedPath` threaded) → F14; a remove of the only default store (zero
   defaults) → F12 `found 0`; a remove of the store that leaves a
   `default: true` count NOT equal to 1 → F12. An add with a charset-violating
   `name` / relative `corpusRoot` / non-boolean `default` / present `embedder`
   → F6/F9/F7/F10 respectively.
7. **Compute the delta** — exactly ONE non-empty member:
   - add → `{ added: ['<name>'], removed: [], renamed: [] }`.
   - remove → `{ added: [], removed: ['<name>'], renamed: [] }`.
   - rename → `{ added: [], removed: [], renamed: [{ from: '<from>', to: '<to>' }] }`.
8. **Return `{ registry: <the candidate's resolved form>, configs: candidate,
   delta }`.** The `registry` is freshly constructed; a caller mutating it
   cannot affect the input or any later result.

The three named mutators are EXACTLY these calls:
`addRegistryStore(parsed, dir, store, rp)` ≡ `applyRegistryMutation(parsed, dir,
{ kind:'add', store }, rp)`; `removeRegistryStore(parsed, dir, name, rp)` ≡
`applyRegistryMutation(parsed, dir, { kind:'remove', name }, rp)`; and
`renameRegistryStore(parsed, dir, from, to, rp)` ≡ `applyRegistryMutation(parsed,
dir, { kind:'rename', from, to }, rp)`. (The `store`/`name`/`from`/`to` wrapper
guards of step 1 run in the wrapper.)

#### `persistRagStoreRegistry(path, configs)`

1. **Guard:** `path` not a non-empty string → **W-path**
   `rag-store-registry-write: path required`. `configs` not an array →
   **W-configs** `rag-store-registry-write: configs required`.
2. **Validate FIRST (nothing invalid reaches the disk):**
   `resolveRegistry({ version: 1, stores: configs }, dirname(path), path)` — a
   registry that fails the loader's rules, OR whose entry resolves onto the
   registry file itself (F14 with `reservedPath = path`), THROWS the loader's
   byte-pinned message. An empty `configs` array ⇒ F12 `found 0` (never persist
   a zero-store registry).
3. **Atomic write (pinned order):**
   - `mkdirSync(dirname(path), { recursive: true })` (the sibling idiom,
     `template-store.ts:103`).
   - `const tmp = path + '.tmp'` (pinned temp name).
   - `writeFileSync(tmp, JSON.stringify({ version: 1, stores: configs }, null, 2))`
     — 2-space indent (the sibling serialization, `module-store.ts:137`); the
     top-level object is `{ version: 1, stores }`.
   - **fsync the temp file** — `openSync(tmp, 'r')` + `fsyncSync(fd)` +
     `closeSync(fd)` (or the equivalent `writeFileSync` + fsync on an opened
     fd) — so the bytes are durable before the rename (the crash-atomicity
     point the siblings omit; §4 REGISTRY-ATOMIC-WRITE).
   - `renameSync(tmp, path)` — the atomic swap.
4. **Throw on ANY failure:** mkdir/writeFileSync/fsync/renameSync throwing ⇒ the
   NATIVE fs Error PROPAGATES (EACCES, EROFS, ENOENT, EISDIR, ENOTEMPTY, ENOSPC,
   …). NEVER caught/swallowed (§4 REGISTRY-WRITE-FAILS-LOUD). Preconditions for
   this guarantee's fail-state table: an unwritable PARENT dir (EACCES/EPERM on
   mkdir or on the temp write), a READ-ONLY filesystem (EROFS), the temp or
   target path being a DIRECTORY (writeFileSync against a dir → EISDIR; rename
   onto a dir → EISDIR/ENOTEMPTY), an ENOSPC disk. In EVERY failure the ORIGINAL
   file at `path` is intact (the swap has not happened).
5. **Round-trip (guarantee, asserted in §5.7):** after a successful persist,
   `loadRagStoreRegistry({ path })` reads the new file, `JSON.parse`es it (no
   BOM is added), and `resolveRegistry` passes → the reloaded registry's
   `stores`/`defaultStoreName` equal the candidate's resolved form, and
   `implicit: false`, `corrupt: false`.

#### `writeRegistryMutation(opts)`

1. **Guard:** `opts` null/not-an-object or `opts.path` not a non-empty string →
   **W-path** `rag-store-registry-write: path required`; `opts.mutation`
   invalid → the W-mutation/W-kind guards of §5.4 `applyRegistryMutation`.
2. **Read the CURRENT disk configs (D2 persisted-and-live):**
   - Absent file (`!existsSync(path)`) → `current = [{ name: 'main',
     default: true }]` — the loader's implicit form, in memory (matches the
     U-MS1 H1 state; the MIGRATION-LEGACY-PATH carve-out applies on the later
     re-load when the file is written).
   - Present: probe `statSync(path)`; a NON-REGULAR file (`!isFile()`, FIFO /
     device) ⇒ **W-unreadable**. Read `readFileSync(path, 'utf8')`, strip
     exactly ONE leading U+FEFF (F-MS1-1 discipline), `JSON.parse`. ANY throw
     from the probe/read/parse (byte garbage, empty file, trailing garbage, a
     directory path, a permission-denied file) ⇒ **W-unreadable**
     `rag-store-registry-write: registry file unreadable (<path>); refusing to mutate a corrupt registry`
     — FAIL-LOUD, never the implicit fallback (a hot write onto an unreadable
     registry cannot preserve the operator's intent).
   - Present + parsed: `resolveRegistry(parsed, dirname(path), path)` — the
     loader's F-rule violation ⇒ the loader's byte-pinned message PROPAGATES
     (you cannot safely mutate an invalid registry). Else
     `current = (parsed as any).stores`.
3. **Mutate (pure):** `const result = applyRegistryMutation({ version: 1,
   stores: current }, dirname(path), opts.mutation, path)` — the thread of the
   reserved path means F14 (a new store file resolving onto the registry file
   itself) fails here.
4. **Persist atomically:** `persistRagStoreRegistry(path, result.configs)`.
5. **RE-LOAD the written file (the D2 round-trip):**
   `const loaded = loadRagStoreRegistry({ path })` — the file was just written
   valid, so this loads `implicit: false`, `corrupt: false` (a non-valid write
   is an implementation error — the load would throw, pinning the invariant).
6. **Return `{ loaded, delta: result.delta }`.** The controller (U-H2) applies
   `delta` (or rebuilds the directory from `loaded`).

The module is deterministic: the same file state + same mutation → the same
written bytes (modulo re-serialization, which is fixed) and the same returned
`loaded`/`delta`.

### 5.5 The byte-pinned error set + the message census

**Message conventions.** The write module's OWN messages use the prefix
`rag-store-registry-write:`. Messages that PROPAGATE from the loader reuse the
loader's exact strings (F1–F14, G-load/G-dir — byte-pinned in
`docs/specs/unit-ms1-store-registry.md` §5.4 and NOT re-listed here). `<json>`
is the loader's TOTAL + CAPPED renderer (reused; `jsonOf` is loader-internal,
so this module carries its OWN copy of the same total/capped `<json>` behavior
for its `<kind>`/value interpolations — the loader's F-MS1-3/F-MS1-6 rules
apply identically: a throwing `JSON.stringify` renders `String(value)`; anything
over 200 chars renders as its first 197 chars + `…`).

| # | Trigger | Exact `Error` message |
| --- | --- | --- |
| W-path | `persistRagStoreRegistry`/`writeRegistryMutation` with a null/not-object opts or a non-string/empty `path` | `rag-store-registry-write: path required` |
| W-configs | `persistRagStoreRegistry` with a non-array `configs` | `rag-store-registry-write: configs required` |
| W-mutation | `applyRegistryMutation` with a null/non-object `mutation` | `rag-store-registry-write: mutation required` |
| W-kind | a `mutation.kind` outside `'add'`/`'remove'`/`'rename'` | `rag-store-registry-write: unknown mutation kind '<json>'` |
| W-add-store | `addRegistryStore` with a null/non-object `store` | `rag-store-registry-write: add store required` |
| W-remove-arg / W-rename-arg | `removeRegistryStore`/`renameRegistryStore` with a non-string/empty `name`/`from`/`to` | `rag-store-registry-write: <param> required` (`<param>` is `name`/`from`/`to`) |
| W-add-existing | add a store whose `name` is already in the current configs | `rag-store-registry-write: store '<name>' already exists` |
| W-remove-unknown | remove a `name` not present | `rag-store-registry-write: cannot remove unknown store '<name>'` |
| W-rename-unknown-from | rename a `from` not present | `rag-store-registry-write: cannot rename unknown store '<from>'` |
| W-rename-target-exists | rename a `from` onto an existing `to` | `rag-store-registry-write: store '<from>' cannot be renamed to '<to>': '<to>' already exists` |
| W-rename-default | rename the CURRENT default store (D5 split) | `rag-store-registry-write: the default store cannot be renamed (default reassignment is a separate unit)` |
| W-unreadable | `writeRegistryMutation` — the registry file is corrupt/unreadable/a non-regular file (FIFO/device) | `rag-store-registry-write: registry file unreadable (<path>); refusing to mutate a corrupt registry` |
| (persist fs) | `persistRagStoreRegistry`/`writeRegistryMutation` — mkdir/write/fsync/rename throws | the NATIVE fs Error PROPAGATES (`EACCES`/`EROFS`/`ENOENT`/`EISDIR`/`ENOTEMPTY`/`ENOSPC`/…) — the throw PATH is pinned, the message is the native one |
| (loader F) | any generic registry-rule failure on the existing OR candidate registry | the LOADER's message propagates unchanged (F1–F14 / G-dir) |

**Message census:** the module's only LOG output is `0` — NO `console.log`, NO
`console.warn`, NO `console.error` (unlike the loader's ONE corrupt-file log,
the write module is silent on success AND failure — failures are thrown, not
logged; the controller decides how to surface them). **Thrown-Error family:**
12 write-module-pinned message templates (W-path, W-configs, W-mutation,
W-kind, W-add-store, W-remove-arg/W-rename-arg — ONE shared `{param} required`
template, W-add-existing, W-remove-unknown,
W-rename-unknown-from, W-rename-target-exists, W-rename-default,
W-unreadable — 13 distinct message strings counting W-remove-arg and
W-rename-arg separately) + the propagating loader set + the native fs set.

### 5.6 Happy-path states (TestWriter red set — valid paths)

`<d>` is an absolute temp dir; `<d>/provident-rag-stores.json` is the registry
path. `<dir>` = `dirname(<d>/provident-rag-stores.json)` = `<d>`.

1. **H1 — pure add:** `applyRegistryMutation({version:1, stores:[{name:'main',
   default:true}]}, <d>, {kind:'add', store:{name:'research-2026-09'}})` →
   `registry.stores` = `[main (default:true), research-2026-09 (default:false)]`
   in order, `registry.defaultStoreName` = `'main'`; `configs` =
   `[{name:'main',default:true},{name:'research-2026-09'}]` (the omitted
   `persistenceFile` stays omitted on both); `delta` = `{added:['research-2026-09'],
   removed:[], renamed:[]}`.
2. **H2 — pure add with explicit fields preserved verbatim:** an add whose
   `store` carries `persistenceFile`/`corpusRoot` → those config fields returned
   EXACTLY as written (no normalization); the resolved store carries them
   verbatim (loader resolution rules).
3. **H3 — pure remove:** `removeRegistryStore({version:1, stores:[{name:'main',
   default:true},{name:'research-2026-09'}]}, <d>, 'research-2026-09')` →
   `registry.stores` = `[main]`, `defaultStoreName` = `'main'`; `delta =
   {added:[], removed:['research-2026-09'], renamed:[]}`; the survivor entry is
   byte-verbatim.
4. **H4 — pure rename (non-default):** `renameRegistryStore(..., 'research-2026-09',
   'research-2026-10')` → the entry's `name` becomes `research-2026-10` IN PLACE
   (its `default: false` and its omitted `persistenceFile` unchanged — the
   derived file becomes `<d>/provident-rag-research-2026-10.json` after the
   loader re-resolution), ORDER preserved; `delta = { added:[], removed:[],
   renamed:[{ from:'research-2026-09', to:'research-2026-10' }] }`.
5. **H5 — rename a non-default WITH an explicit persistenceFile:** the explicit
   path stays verbatim (rename changes only the name; a non-default with an
   explicit file does NOT re-derive).
6. **H6 — persistence round-trip is valid:** `applyRegistryMutation(...)` over
   any H1–H5 candidate → `resolveRegistry({version:1, stores: result.configs},
   <d>, <d>/provident-rag-stores.json)` PASSES (the candidate is always valid —
   the double-validation guarantee).
7. **H7 — persist writes the exact file + round-trips:
   `persistRagStoreRegistry('<d>/provident-rag-stores.json',
   [{name:'main',default:true},{name:'research-2026-09'}])` →
   `readFileSync(path,'utf8')` equals `JSON.stringify({version:1,
   stores:[{name:'main',default:true},{name:'research-2026-09'}]}, null, 2)`
   (2-space indent, `version: 1`); then `loadRagStoreRegistry({ path })` returns
   `{ ...resolved, path, implicit: false, corrupt: false }` whose
   `stores`/`defaultStoreName` match the candidate's resolved form; and NO
   `path + '.tmp'` file remains in `<d>` after the persist.
8. **H8 — writeRegistryMutation on an ABSENT file (the D3 first-write
   scenario):** `writeRegistryMutation({ path, mutation:{kind:'add',
   store:{name:'research-2026-09'}} })` with NO registry present → reads the
   implicit `main`, adds `research-2026-09`, writes the file, RE-LOADS →
   `loaded.stores` = main + research-2026-09 (the `main` entry derives the LEGACY
   `<d>/provident-rag.json`), `loaded.implicit:false`, `loaded.corrupt:false`;
   `delta = {added:['research-2026-09'], removed:[], renamed:[]}`. Existing zero-
   config data is preserved (D3).
9. **H9 — writeRegistryMutation add onto an existing multi-store file:** the
   CURRENT disk stores survive + the added store appends last; the re-loaded
   `loaded` matches disk order.
10. **H10 — writeRegistryMutation remove (orphan, D3):** removes the registry
    entry ONLY; the store's persistence file + journal on disk are UNTOUCHED
    (assert by byte-comparing the store file before/after — and by the
    structural no-remove pin of §5.1).
11. **H11 — writeRegistryMutation rename (non-default, no persisted ids):**
    renames the registry entry; a follow-up `loadRagStoreRegistry` shows the
    new name with the same `default:false` and re-derived/verbatim path.
12. **H12 — determinism / no-input-mutation:** calling an H1–H5 mutator twice
    on the SAME input returns deep-equal results; the INPUT `parsed` and its
    `stores` array are UNCHANGED after the call (deep-equal to before); a
    frozen `parsed` input is accepted; mutating the returned `registry.stores`
    does not affect a second call's result.
13. **H13 — reservedPath propagation:** `addRegistryStore(..., rp)` /
    `applyRegistryMutation(..., rp)` threads `rp` into the loader's Pass-D seed
    exactly like `resolveRegistry`'s optional third param (a derived/explicit
    file equal to `resolve(rp)` fails F14 before F13).
14. **H14 — delta is single-member:** every H1–H5 result's `delta` has exactly
    TWO empty arrays and ONE non-empty array (length 1).

### 5.7 Round-trip / atomicity acceptance rows (binding per D2/A-P2-3)

| # | Claim | Acceptance criterion |
| --- | --- | --- |
| R1 | Atomic write leaves the original intact on failure | A persist that fails at the temp write (e.g. an unwritable dir) leaves the ORIGINAL registry bytes untouched; a failed rename (target is a dir) leaves the original untouched. The temp is the ONLY file that may be partial. |
| R2 | A success is re-readable (round-trip) | After a successful `persistRagStoreRegistry`/`writeRegistryMutation`, `loadRagStoreRegistry({ path })` loads the new state with `implicit:false`, `corrupt:false`, and `stores`/`defaultStoreName` matching the candidate (H7/H9). The disk file IS re-read + re-applied (D2). |
| R3 | No `.tmp` residue after success | After a successful persist, `<path>.tmp` does not exist (the rename consumed it). |
| R4 | Persisted-and-live never diverge (the combined entry) | `writeRegistryMutation` starts from the CURRENT disk state (re-read), writes, and RE-LOADS — a caller can never receive a state that is not exactly the file's state (H8–H11). |
| R5 | Corrupt registry is never hot-mutated | `writeRegistryMutation` on a corrupt/unreadable registry FAILS LOUD (W-unreadable); it never clobbers from the implicit form (§5.6 fail F4). |

### 5.8 Happy-path census / numeric claims

- **New module:** 1 — `src/main/rag-store-registry-write.ts` (node-testable).
- **Exported functions:** 6 (`applyRegistryMutation`, `addRegistryStore`,
  `removeRegistryStore`, `renameRegistryStore`, `persistRagStoreRegistry`,
  `writeRegistryMutation`).
- **Exported types:** 4 (`RegistryMutation`, `RegistryDelta`,
  `RegistryMutationResult`, `RegistryWriteResult`). **Exported consts:** 0.
- **Distinct write-module-pinned message templates:** 12 (W-path, W-configs,
  W-mutation, W-kind, W-add-store, W-remove-arg/W-rename-arg — ONE shared
  `{param} required` template, W-add-existing, W-remove-unknown,
  W-rename-unknown-from, W-rename-target-exists, W-rename-default, W-unreadable
  — 13 distinct message STRINGS counting W-remove-arg and W-rename-arg
  separately) + the propagating loader set (F1–F14, G-load, G-dir) + the native
  fs set.
- **Log output:** 0 lines (no console.* calls at all). **Throws:** the pinned
  set + loader F-set + native fs-set.
- **Disk writes per successful `writeRegistryMutation`:** exactly ONE registry
  file write (temp + fsync + rename = one file, one atomic swap) + (step 5) a
  re-read. ZERO writes to any STORE persistence file or journal in every path
  (D3 orphan pin — structurally enforced by the no-remove/no-unlink import
  pin). ZERO directory removals, ZERO `unlink`/`rm`/`rmdir` calls in the module
  source.
- **Disk reads per `writeRegistryMutation`:** 1 existsSync + 1 statSync isFile
  probe + ≤1 readFileSync (step 2) + the step-5 re-load's own loader reads.
- **Files this unit creates/edits:** `src/main/rag-store-registry-write.ts` +
  `tests/unit-h1-registry-write.test.ts`. NOTHING else: the loader
  `src/main/rag-store-registry.ts` is UNTOUCHED; `main.ts`/`mcp-server.ts`/
  `preload.ts`/`shared/types.ts`/`sidebar-panes.ts` are UNTOUCHED (U-H2/U-H8);
  no store/engine file touched; no new MCP tool; no new IPC channel (D6).
- **Estimated new tests:** 18–26 (a write slice of the U-MS1 22–28 budget), all
  in ONE file — `tests/unit-h1-registry-write.test.ts` (the red set from §5.6
  H1–H14 + §5.6 fails + §5.7 R1–R5). **LANDED (2026-09-08): 49 tests** (the
  §5.6/§5.7/§5.9 red set 01–46 + the F-H1-1/F-H1-2 adversarial regression tests
  R-F-H1-1a/1b/R-F-H1-2a).

### 5.9 Fail-states (TestWriter red set — documented fail-states)

Outcomes: **fail-loud** = the pinned `Error` propagates (the loader's or the
write-module's or a native fs Error). There is NO fail-soft in this module.

| # | Trigger | Outcome | Exact result |
| --- | --- | --- | --- |
| F1 | `applyRegistryMutation(null, <d>, ...)` / `(5, ...)` / `([], ...)` / `('x', ...)` / `(true, ...)` | fail-loud | loader F1 `rag-store-registry: registry must be an object` |
| F2 | existing registry is invalid: `{}` / `{version:2}` / `{version:1}` (no stores) | fail-loud | loader F2 / F3 |
| F3 | `applyRegistryMutation(parsed, '')` / `(parsed, undefined)` (and the wrappers) | fail-loud | loader G-dir `rag-store-registry: registryDir required` |
| F4 | a CURRENT entry fails a loader rule (charset/absolute-path/duplicate/zero-or-two-default/collision) in `parsed` | fail-loud | the loader's F4–F14 message for that entry (validated at step 2, BEFORE any mutation) |
| F5 | add a store whose `name` is already present | fail-loud | W-add-existing `rag-store-registry-write: store 'a' already exists` |
| F6 | add a store with a charset-violating name, relative `corpusRoot`/`persistenceFile`, non-boolean `default`, or a present `embedder` | fail-loud | loader F6 / F9 / F8 / F7 / F10 (candidate validation) |
| F7 | add a store with `default: true` when one already exists | fail-loud | loader F12 `...default: true (found 2)` (candidate validation) |
| F8 | add/rename whose derived or explicit persistence file collides with another store | fail-loud | loader F13 (candidate validation; `<earlier>`, `<current>` in array order) |
| F9 | add/rename whose persistence file resolves onto the REGISTRY file itself (write path threads `reservedPath`) | fail-loud | loader F14 `...collision with the registry file: <path> (store '<name>')` |
| F10 | remove an UNKNOWN name | fail-loud | W-remove-unknown `rag-store-registry-write: cannot remove unknown store 'x'` |
| F11 | remove the ONLY default store (zero defaults after removal) | fail-loud | loader F12 `...default: true (found 0)` (candidate validation) |
| F12 | remove a name present but that leaves the default count ≠ 1 | fail-loud | loader F12 for that count |
| F13 | rename an UNKNOWN `from` | fail-loud | W-rename-unknown-from `rag-store-registry-write: cannot rename unknown store 'x'` |
| F14 | rename onto an EXISTING `to` | fail-loud | W-rename-target-exists |
| F15 | rename the DEFAULT store (D5) | fail-loud | W-rename-default |
| F16 | rename whose `to` is charset-invalid OR whose in-place rename creates an F8/F9 collision in the candidate | fail-loud | loader F6 / F13 / F14 (candidate validation) |
| F17 | `mutation` null / `{kind:'delete'}` / `{kind:'add'}` missing `store` | fail-loud | W-mutation / W-kind / (wrapper) W-add-store |
| F18 | `removeRegistryStore(..., '')` / `renameRegistryStore(..., '', 'b')` / non-string args | fail-loud | W-remove-arg / W-rename-arg |
| F19 | `persistRagStoreRegistry(path, [])` (zero stores) | fail-loud | loader F12 `...default: true (found 0)` — never persists an empty registry |
| F20 | `persistRagStoreRegistry(path, [<store whose file == path>])` | fail-loud | loader F14 (reservedPath = path) |
| F21 | `persistRagStoreRegistry('', configs)` / `(path, null)` | fail-loud | W-path / W-configs |
| F22 | `persistRagStoreRegistry`/`writeRegistryMutation` onto an UNWRITABLE target (parent dir missing + non-creatable, permission-denied `EACCES`, read-only fs `EROFS`) | fail-loud | the NATIVE fs Error propagates (the throw is pinned; the message is the native one) — original intact (R1) |
| F23 | `persistRagStoreRegistry`/`writeRegistryMutation` whose temp or target path is a DIRECTORY (rename `EISDIR`/`ENOTEMPTY`) | fail-loud | native fs Error propagates — original intact (R1) |
| F24 | `writeRegistryMutation` on a CORRUPT/unreadable/non-regular (FIFO/device) registry file | fail-loud | W-unreadable `rag-store-registry-write: registry file unreadable (<path>); refusing to mutate a corrupt registry` |
| F25 | `writeRegistryMutation` on a PRESENT but INVALID registry file | fail-loud | the loader's F-message propagates (step 2 — never mutated from an invalid start) |
| F26 | `writeRegistryMutation(null)` / `({ path: '' })` | fail-loud | W-path / W-mutation |

**Negative pin (grep-level, structural — the D3 orphan guarantee):** the module
source contains NO call/reference to `unlink`/`unlinkSync`/`rm`/`rmSync`/
`rmdirSync`/`truncateSync`/`chmodSync` (§5.1's no-remove pin). A white-box test
scans the source and a behavioral test byte-compares a store's persistence file
across a `removeRegistryStore`/`writeRegistryMutation({ kind:'remove' })`.

**Negative pin (D6):** NO new MCP tool and NO new IPC channel — the module adds
nothing to `RpcMethod`, `security.ts`'s tool→group map, `ALL_TOOLS`, or the
IPC-constant census, and it imports no `shared/types` constant (grep-level).

### 5.10 The supersession row (D2/A-P2-3) — which tests stay green vs which are superseded

**STAY GREEN (the loader's census — UNTOUCHED, byte-intact):**

- `tests/unit-ms1-store-registry.test.ts` **test 45** (§5.3/§5.8/D8 — the
  runtime exports are EXACTLY `implicitRegistry`/`resolveRegistry`/
  `loadRagStoreRegistry` + `RAG_STORE_NAME_PATTERN`; NO `set`/`persist`/`save`/
  `write`/`reload`/`refresh`/`create`/`remove`/`delete`/`derivePersistenceFile`
  export) — the loader is byte-unchanged, so this stays green.
- `tests/unit-ms1-store-registry.test.ts` **test 46** (§5.1/§5.4 — structural
  scan of the LOADER module source: no `writeFileSync`/`renameSync`/`mkdirSync`/
  … no `electron`, exactly ONE `console.error` site, ZERO other channels) — the
  loader's SOURCE is byte-unchanged, so its no-write + log-line census stays
  green. REGISTRY-NO-WRITE is REFINED to be per-module (A-P2-3): it governs the
  LOADER's import set; the WRITE moves to the NEW module, which has its own
  structural pin (no-REMOVE, §5.1/§5.9).

**SUPERSEDED (designated here; mechanically landed in U-H2):**

- `tests/unit-ms5-settings-listing.test.ts` **Red 18** (happy 15 — "reDerive/
  refresh do NOT re-fetch the listing (D8 boot-time only): after a
  rag-store-changed re-derive, the stores() call count STAYS 1") is SUPERSEDED
  by **refresh-on-apply** per A-P2-3/D2: after a registry hot-write lands, the
  runtime/settings-pane listing is REFRESHED from the new state rather than
  only-after-restart. **Scope-held:** H1 is the WRITE MODULE — it does NOT
  itself re-wire the listing or the re-derive. The supersession's MECHANICAL
  half (a new refresh path that re-fetches after a hot write, its call-count
  semantics, and the Red 18 re-write) lands in U-H2 as the runtime controller's
  job; this spec pin here is the DESIGNATION so no later agent re-litigates the
  boot-time-only pin (§4 REGISTRY-RELOAD-ON-WRITE + §3b A-P2-3). The U-MS5 spec
  §5.9 fail-state 10 ("a registry file edited while running ⇒ unchanged until
  restart") and its `STORE-LISTING-BOOT-CACHED` decision row keep holding for
  the PRE-H2 wiring; they are amended/superseded only when U-H2 lands the
  refresh.
- The U-MS1 `REGISTRY-BOOT-SPLIT`/`REGISTRY-NO-WRITE` boot-time-only letters
  (D8) are per-module-refined: the LOADER stays boot-time-only (green), and the
  WRITE module + (later) the runtime controller make hot changes live.

### 5.11 Cross-references

- **Gate:** `docs/specs/registry-hot-apply-review.md` §2 **D2** (the write
  module + supersession — THE load-bearing decision this unit implements),
  D3 (orphan remove), D4 (rename semantics — non-default/no-ids), D5 (default
  reassignment split out), D7 (mid-flight consistency — the registry part;
  teardown is U-H5), D8 (unit decomposition — the U-H1 row); §5 "Impact on
  existing contracts" (REGISTRY-NO-WRITE refined not broken; the `unit-ms1`
  census stays green); §6 (live-scenario PARKED). Binding amendments: **A-P2-3**
  (per-module REGISTRY-NO-WRITE + supersede ms5 Red 18 with refresh-on-apply).
- **Loader contract (the validation this module RE-USES — cite, do not
  restate):** `docs/specs/unit-ms1-store-registry.md` §5.3.2 (the pinned pass
  order A→B→C→D + F13/F14 + the resolution), §5.3.3 (the loader's read
  discipline — the BOM strip F-MS1-1, the isFile probe F-MS1-5), §5.4 (the
  byte-pinned F1–F14/G-load/G-dir messages this module propagates), §5.8 (the
  loader census — tests 45–46), and `src/main/rag-store-registry.ts` (the
  loader source, byte-unchanged; `resolveRegistry(parsed, registryDir,
  reservedPath?)` is the ONLY loader function the write module consumes).
- **Sibling hot-apply units (cite-only — their contracts are NOT built here):**
  U-H2 (the runtime controller — applies the delta, rebuilds/tears down the
  live directory, refreshes the listing/refresh-on-apply), U-H3 (hot-add),
  U-H4 (hot-remove), U-H5 (teardown primitives), U-H6 (hot-rename), U-H7
  (default reassignment — OUT), U-H8 (operator-UI editor — the D6 IPC-only
  operator surface).
- **Idiom sources (read, cited):** `src/main/module-store.ts:130-142` and
  `src/main/template-store.ts:101-111` (the atomic temp+rename persist the write
  module adopts + strengthens with an fsync; the `catch {}` swallow they use is
  EXPLICITLY NOT copied — §4 REGISTRY-WRITE-FAILS-LOUD), `src/main/security-store.ts:82`
  (the persist-failure log idiom — the write module emits NO log, it throws),
  `src/main/rag-store-registry.ts` (`resolveRegistry`, `jsonOf` discipline for
  the total/capped `<json>`).
- **Behavior anchors / supersession sources:** `tests/unit-ms5-settings-listing.test.ts`
  Red 18 (the test A-P2-3 supersedes), `tests/unit-ms1-store-registry.test.ts`
  tests 45–46 (stay green), `docs/decisions.md` MULTI-STORE-REGISTRY (the
  loader's sub-pins U-MS1 owns — REGISTRY-NO-WRITE refined per-module),
  `docs/pending.md:37` (the hot-apply row whose revisit condition is MET).
- **Parked/context docs:** `docs/specs/multi-store-fanout-review.md` (the
  `stores:"all"` slice — the qualified-`store` mechanics the hot slice must not
  break; cite-only), `docs/specs/multi-document-store-config-review.md` §2 D8
  (the Phase-1 boot-time-only registry THE hot slice supersedes).
- **Test file (SpecWriter-pinned):** `tests/unit-h1-registry-write.test.ts`.

## 6. Unit → file → test-file mapping

| Unit | File | Test file | Notes |
| --- | --- | --- | --- |
| **U-H1** (this spec) | NEW `src/main/rag-store-registry-write.ts` (PURE validate + atomic persist + combined write; imports ONLY `resolveRegistry` + types from the loader; NO Electron, NO store/engine, NO IPC/MCP) | `tests/unit-h1-registry-write.test.ts` (name SpecWriter-pinned) | node-testable; red set from §5.6 (H1–H14) + §5.6 fails (F1–F26) + the §5.7 round-trip rows (R1–R5) + the §5.9 negative pins; est. 18–26 tests (**LANDED 49** — spec §5.8). |

- **Out of this unit's mapping (owned by siblings, cited only):** `main.ts` /
  `mcp-server.ts` / `preload.ts` / `shared/types.ts` / `sidebar-panes.ts` (U-H2
  wiring + U-H3–U-H8), the runtime controller + closure rewiring + teardown
  (U-H2/U-H5), the operator-UI editor IPC (U-H8), default reassignment (U-H7).
- **Existing tests that must stay green:** `tests/unit-ms1-store-registry.test.ts`
  tests 45–46 (the loader census — byte-unchanged), the full ms1/ms2/ms4/ms3/
  ms5 suites (the write module is purely additive; the loader's export surface is
  untouched so `resolveRegistry`'s 2-arg form stays byte-identical and nothing a
  loader test asserts changes).
- **Per RCA-2/RCA-5:** U-H1 runs its own TestWriter-red → Implementer-green →
  adversarial (§3a) → blind-greens → doc-review cycle BEFORE U-H2 starts; the
  trio (`npm test` / `npm run typecheck` / `npm run build`) runs after the
  green. The live-scenario battery stays PARKED (the review §6 note — a live
  multi-store registry cannot be driven here).

---

**Bottom line:** U-H1 delivers the pure, node-testable registry WRITE surface
(validate + atomic temp→fsync→rename + combined load-mutate-persist-reload) that
the hot-apply slice builds every runtime unit on, reusing the loader's
byte-pinned validation and keeping the loader read-only per-module (A-P2-3). The
delta (added/removed/renamed) is returned to U-H2 to apply to the live runtime —
explicitly NOT this module's job. No engine gap, no page-design change (the
operator-UI editor is U-H8), no new MCP tool or IPC channel (D6).
