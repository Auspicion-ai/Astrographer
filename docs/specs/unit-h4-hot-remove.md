# Spec — Unit U-H4: Hot-Remove — the DRAIN-THEN-TEARDOWN remove (D7/A-P2-2) on the runtime controller

> **STATE (2026-09-08): U-H4 SPEC WRITTEN — AWAITING THE §7 ARCHITECT RULING.** U-H5
> (the teardown PRIMITIVES — `RagStore.teardown()`,
> `RetrievalEngine.teardown()+inFlight()`, `VectorBootController.teardown()`) is
> LANDED (22/22 via `tests/unit-h5-teardown.test.ts`; full trio green). U-H4 —
> the next cycle in the registry hot-apply slice — UPGRADES the remove path from
> U-H2's ORPHAN (unregister-only) to a REAL **drain-then-teardown**. This spec is
> the behavior contract for that upgrade. It does NOT touch `src/` or `tests/`
> (SpecWriter/TestWriter/Implementer units follow, per the house red→green→
> adversarial→blind-greens→doc-review gate). The TestWriter derives the U-H4 red
> set from §5.4/§5.6/§5.7/§5.8/§5.9 ONLY after the §7 design questions are
> arbitrated CONFIRMED (the §7 ruling is the gate — the two open items below are
> genuine either/or decisions, not hand-waves).** The live-scenario gate is
> PARKED per the slice-wide user instruction (§6).

- **Status: SPEC (written 2026-09-08; AWAITING the §7 Architect ruling)** — the
  registry hot-apply/removal/rename slice, Unit U-H4 (hot-remove, the
  drain-then-teardown upgrade). Execution order: U-H1 → U-H2 (a+b, LANDED) →
  U-H3 (hot-add CONFIRMATORY, EMPTY red) → U-H5 (teardown PRIMITIVES, LANDED) →
  **U-H4 (this — hot-remove, drain-then-teardown)** → U-H6 (hot-rename) → U-H8
  (operator-UI editor); U-H7 (default reassignment) is split out. Gate reference:
  `docs/specs/registry-hot-apply-review.md` §2 **D3** (hot-remove = ORPHAN —
  unregister-only, strand the persistence file + journal/undo; operator
  confirmation via the operator-UI control (D8), NOT MCP), **D7** (mid-flight
  consistency — "remove drain-then-teardown"; **REQUIRES NEW `teardown()` on
  `RagStore`/`RetrievalEngine`/`VectorBootController`**, landed in U-H5),
  **A-P2-2** ("for `stores:"all"`: drain-then-teardown so a removed engine is
  never mid-query"), **A-P2-8** (the teardown primitives land in U-H5 — U-H4 is
  their first CALLER), **A-P2-7** ("hot-remove = orphan via operator control,
  confirmation required, no MCP path"), **D6** (operator-UI IPC only, NO new MCP
  tool); §5 "Impact on existing contracts"; §6 (live-scenario PARKED). Consumed
  dependencies: `docs/specs/unit-h5-teardown.md` §4/§5 (the landed
  `teardown()`/`inFlight()` signatures + semantics + byte-pinned messages +
  **F-H5-3** the never-settling-queue hang note, §3a), `docs/specs/unit-h2-runtime-controller.md`
  §4 (§4 **HOT-APPLY-TRIGGER-RESOLVED**, **ATOMIC-APPLY**,
  **REBUILD-ALL-OF-NON-DEFAULT**, **DEFAULT-STABLE-APPLY**) + §5.2/§5.4
  (`hotApply(mutation): HotApplyResult`, `RagStoreRuntimeController`, the N1/
  A-P2-8 no-teardown negative pin), `docs/specs/unit-h1-registry-write.md` §5.5
  (the propagated W-remove-unknown / W-remove-arg / loader F12 set),
  `docs/specs/unit-ms2-store-wiring.md` §5.1 (`RagStoreEntry` — the per-entry
  `store`/`engine` the drain tears down).

- **Scope:** the controller/ORCHESTRATION-level remove MECHANISM — a NEW async
  runtime-controller method **`hotRemove(name): Promise<HotRemoveResult>`** that
  drains (awaits `engine.inFlight()===0`), then tears down the removed store's
  store + engine (via the U-H5 primitives), strands the persistence file +
  journal byte-identically (D3), and unregisters the removed entry from the live
  `entries` Map + every runtime accessor. The drain+teardown CALL SITES live in a
  NEW node-testable module **`src/main/rag-store-remove.ts`** (the U-H4-owned
  caller), so the runtime module `rag-store-runtime.ts` does NOT lexically
  introduce `teardown(`, and the U-H2 **N1/A-P2-8 grep pin STAYS GREEN** (§7 Q1 —
  the orchestration-home resolution; the §5.8 negative pins). This unit does NOT
  add an MCP tool (D6/A-P2-7), does NOT add an IPC channel (D6 — the operator-UI
  trigger + confirmation dialog is **U-H8**), does NOT re-author the
  `stores:"all"` fan-out in `mcp-server.ts` (the fan-out is UNTOUCHED, same as
  U-H5), does NOT change the default store (default removal is already rejected)
  or the vector boot (a removed non-default store is ALWAYS lexical, A6/R10), and
  does NOT change any page design.

- **TestWriter contract:** every method/signature, return shape, throw pattern,
  happy-path state, and fail-state below is derivable from this spec ALONE
  (after the §7 ruling). The TestWriter writes the U-H4 red set into the
  SpecWriter-pinned file `tests/unit-h4-hot-remove.test.ts` (§5.9), in the house
  red-first order (RCA-1), reporting the failing set BEFORE the Implementer goes
  green. **The red set asserts the new orchestration surface does NOT exist on
  the pre-U-H4 code: `rag-store-remove.ts` is absent (the `drainAndReleaseEntry`
  import fails), the runtime controller has NO `hotRemove`, and the runtime's
  remove does NOT drain+teardown (it orphans). §5.9.**

---

## 1. What the unit does (the U-H4 slice)

The registry hot-apply slice (review §2 D7) requires that removing a store at
runtime **drain then tear down** — so a removed engine is NEVER mid-query
(A-P2-2) — instead of U-H2's current ORPHAN (unregister-only, strand the
persistence resources un-drained). U-H5 landed the teardown PRIMITIVES
(store/engine/boot `teardown()` + the `engine.inFlight()` drain CHECK, the R-H5
byte-pinned `rag store: torn down` / `retrieval engine: torn down` messages) and
explicitly wired NO caller (A-P2-8 — the primitives EXIST but the runtime module
makes no teardown call). **U-H4 is the first caller: it upgrades the remove path
from "drop the orphan" to "drain → teardown → unregister → strand the file."**

The unit's concrete obligations:

1. **A real drain-then-teardown remove (D7/A-P2-2):** removing a present
   non-default store MUST (a) await the removed engine's `inFlight()===0`
   (the D7 drain guard — a removed engine is never torn down mid-query), (b)
   `store.teardown()` (drain the single-writer queue, revoke mutations; the
   persistence file + journal STRANDED byte-identical — D3), (c)
   `engine.teardown()` (STOPPED — post-remove `query()` throws `retrieval
   engine: torn down`), and (d) UNREGISTER the removed entry from the live
   `entries` Map + every runtime accessor.
2. **D3 ORPHAN — never delete:** the removal NEVER deletes/touches the store's
   persistence file + journal (the strand). The write module's structural no-REMOVE
   pin + the U-H4 drain/teardown's no-delete guarantee (the module imports no
   `unlink`/`rm`/`rmdir` and uses only the U-H5 no-delete primitives) hold.
3. **D6/A-P2-7 — mechanism only, no operator surface:** U-H4 exposes the
   CONTROLLER/ORCHESTRATION-level remove (node-testable), with NO MCP tool and NO
   IPC channel. Operator confirmation via the operator-UI control (D8) + the
   trigger wiring are deferred to **U-H8** (the operator-UI IPC editor).
4. **Non-default-only (verify, confirmed):** the DEFAULT store CANNOT be removed —
   `writeRegistryMutation` drops the name and the loader re-validates; removing
   the only `default:true` store leaves zero defaults → loader **F12**
   (`rag-store-registry: exactly one store must have default: true (found 0)`)
   fires BEFORE any teardown. There is NO dedicated `W-remove-default` message; the
   guard is the loader's exactly-one-default rule. Every removal that REACHES the
   drain+teardown is therefore a NON-default store.
5. **Bounded/never-settling awareness (F-H5-3):** U-H5's F-H5-3 note registered that
   a `store.teardown()` may HANG on a never-settling queued promise, and that the
   U-H4 drain must AWAIT `inFlight()===0` rather than assume teardown settles
   caller-held resources. U-H4 inherits that awareness: the drain guard is a
   genuine `inFlight()===0` await, and the bounded-vs-unbounded question is §7 Q4.

This unit does NOT own: the U-H5 primitives (landed), the MCP `stores:"all"`
fan-out re-resolution (UNTOUCHED — §5.11), the operator trigger/confirmation
dialog (U-H8), a teardown-aware INCREMENTAL add (U-H3 is confirmatory/EMPTY —
add stays U-H2's coarse rebuild), hot-rename (U-H6), default reassignment
(U-H7).

## 2. Feasibility verdict

**Feasible — grounded in the two LANDED contracts (U-H5 teardown primitives + the
U-H2 runtime controller) plus the write module; no engine gap.**

- **The drain + teardown surfaces are LANDED and node-observable.** Every removed
  non-default `RagStoreEntry` owns its `store` (`createJsonRagStore` with
  `teardown(): Promise<void>` + `inFlight` on its lexical
  engine (`createRetrieval` with `teardown(): Promise<void>` +
  `inFlight(): number`) (`rag-store-directory.ts` `RagStoreEntry`;
  `rag-store.ts:287/1354`; `retrieval.ts:611/730-743`). The drain CHECK reads
  `entry.engine.inFlight()`; the teardown calls `entry.store.teardown()` +
  `entry.engine.teardown()`. All three are deterministic and node-testable.
- **The write + unregister machinery is LANDED and reusable.** The U-H2
  controller's `hotApply` already performs the atomic write
  (`writeRegistryMutation` — W-remove-unknown / W-remove-arg / loader F12
  propagate), the default-stability check, and the live-map swap that drops the
  removed store and re-points `_currentRegistry`. U-H4's `hotRemove` REUSES
  `hotApply({kind:'remove'})` for that write+swap, capturing the removed entry
  BEFORE the call to drain/teardown the orphan. No new write/persist/swap logic
  is authored — only the async drain+teardown ON TOP of the removed orphan.
- **The orchestration-home tension is resolvable with the N1 pin intact.** The
  teardown CALL SITES are owned by a NEW module `rag-store-remove.ts`; the
  runtime's `hotRemove` merely references the helper by name (`drainAndReleaseEntry(`),
  whose identifier contains no lowercase `teardown`). Therefore the U-H2/ U-H5
  N1/A-P2-8 GREP regex `/\b(teardown|close|destroy)\s*\(/` STILL does NOT match
  `rag-store-runtime.ts` source — the pin stays green with NO re-pin (§7 Q1).
- **No default, no vector-boot, no fan-out surface.** Non-default stores are
  ALWAYS lexical (A6/R10), so a removed engine's teardown has no vector-boot
  controller and no non-noop embedder hook (lexical embedders carry no
  `teardown?`). The default store and the vector boot are never the target of
  U-H4 (default removal is loader-rejected; non-defaults are lexical).

No engine gap — every change is host-side (`src/`), additive to LANDED
controller + primitive contracts, node-testable.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The NEW orchestration module `src/main/rag-store-remove.ts` (the drain+teardown CALLER — the only `teardown(`/`inFlight()` call sites for a removed entry) | Project-specific (composes the U-H5 primitives against the removed `RagStoreEntry`) | Low cost; gives the removed store/engine a single node-testable drain+teardown home WITHOUT polluting the runtime module's N1-grep-clean surface. This closes the "removed engine is never mid-query" gap D7/A-P2-2 names. |
| The NEW async controller method `hotRemove(name)` in `rag-store-runtime.ts` | Project-specific (reuses `hotApply`'s write+swap; adds the async drain orchestration ON the removed orphan) | Low-medium cost; the first real drain-then-teardown caller of the U-H5 primitives. It makes the remove path ASYNC (a separate method, so the synchronous `hotApply` contract is NOT disrupted — §7 Q1/Q2). |
| The two-remove-path co-existence (`hotApply({kind:'remove'})` orphan vs the new `hotRemove`) | Project-specific (a deliberate scope boundary, §7 Q2) | Zero cost to the LANDED U-H2 tests (H4/F11/N1/N2 all stay green). The legacy `hotApply` remove remains the coarse orphan path; the D7-satisfying, operator-facing remove is `hotRemove` (U-H8 calls it). The alternative — re-scoping `hotApply` remove to drain+teardown — requires making `hotApply` async and re-pinning U-H2 H4. §7 Q2. |
| The survivor-rebuild orphan churn on remove | Project-specific (pre-existing U-H2 coarse behavior when >1 non-default store exists) | Out of U-H4's single-store scope (documented, §5.11). U-H4 tears down only the REMOVED store's orphan; surviving non-defaults are rebuilt + orphaned exactly as U-H2 does today (unchanged behavior, the U-H2 §3 "bounded hold"). |
| The never-settling-queue / never-settling-query hang (F-H5-3) | Project-specific (a documented awareness; U-H5's F-H5-3 registered it, DID NOT fix it) | The drain guard awaits `inFlight()===0` unboundedly (correctness over liveness — a removed engine is never torn down mid-query, A-P2-2). A truly-never-settling query therefore hangs `hotRemove`; surfacing (a timeout/fail-loud) vs. leaving it unbounded is §7 Q4. |

No engine gap — the changes are entirely host-side (`src/`), node-testable, and
consume only LANDED contracts (U-H5 primitives + U-H2 controller + U-H1 write).

### 3a. Adversarial findings (registered — the U-H4 adversarial pass RUNS after the green, per RCA-3; placeholder + pre-registered probes)

The RCA-3 read-only adversarial pass on the U-H4 green runs BEFORE the unit is
reported done; host findings (ids `F-H4-*`) are fixed here + regression-tested;
an engine (provident-ssr) finding, should one ever surface, is a
`docs/defects.md` + `docs/HANDOFF.md` item, NEVER a package patch (AGENTS.md
item 7).

**Pre-registered edge probes (the adversarial pass MUST confirm on the landed
code):**

- A `hotRemove` whose removed store had an in-flight query at call time NEVER
  tears down the engine until that query settles (`inFlight()` reaches 0) — the
  D7/A-P2-2 drain guard; the store file stays byte-identical throughout.
- A second `hotRemove` of the SAME (now-removed) name FAILS LOUD with the write
  module's **W-remove-unknown** (`rag-store-registry-write: cannot remove
  unknown store '<name>'`) — removal is NOT a silent no-op at the WRITE level
  (the drain/teardown IS idempotent at the primitive level — U-H5 — but the
  write is not). Consistent with U-H2 F11.
- `hotRemove('<default>')` is rejected BEFORE any drain by the propagated loader
  F12 (zero defaults); the live Map + disk are untouched and NO teardown runs.
- The removed store's persistence file + journal are BYTE-IDENTICAL after
  `hotRemove` (D3 strand); the removed engine's `query()` throws `retrieval
  engine: torn down`; the removed store's `putNode` throws `rag store: torn
  down` while its reads still resolve.
- The runtime module `rag-store-runtime.ts` shows NO `\b(teardown|close|destroy)\s*\(`
  lexical match (N1) and NO `\b(unlink|rm|rmdir)\s*\(` (N2) — the teardown calls
  are all in `rag-store-remove.ts`.
- **NO U-H4 change adds an MCP tool / IPC channel / `stores:"all"` fan-out
  edit / page-design change** (D6/A-P2-7/§5.11).

**Adversarial findings (registered after the U-H4 green):** *(to record
`F-H4-*` here in the same-session pass.)*

### 3b. Proposal-review findings folded in

From `docs/specs/registry-hot-apply-review.md`:
- **D3 (binding):** hot-remove = ORPHAN — unregister-only, strand the persistence
  file + journal/undo; operator confirmation via the operator-UI control (D8),
  NOT MCP; data deletion is not a free op. Pinned §4/§5.4/§5.8.
- **D7 (binding):** "remove drain-then-teardown" — REQUIRES the U-H5 teardown
  primitives. Pinned §4/§5.4.
- **A-P2-2 (bound):** `stores:"all"` resolves a current snapshot atomically;
  drain-then-teardown so a removed engine is never mid-query. U-H4 owns the
  single-store drain (the `inFlight()===0` guard); the `stores:"all"` fan-out
  re-resolution is OUT of U-H4's scope (UNTOUCHED — §5.11).
- **A-P2-8 (bound):** the teardown primitives landed in U-H5 with NO caller;
  U-H4 is the first caller. The runtime module keeps its N1/A-P2-8 grep pin
  (§7 Q1 — satisfied by design).
- **A-P2-7 (bound):** hot-remove = orphan via operator control, confirmation
  required, no MCP path. U-H4 = the controller mechanism; U-H8 = the
  operator-facing trigger + confirmation dialog (§5.8/§5.11).
- **D6 (bound):** operator-UI IPC only, no new MCP tool. U-H4 adds neither.

## 4. Design decisions pinned by this spec

> **§7 note:** all decisions below are PROVISIONALLY resolved; §7 Q1–Q4 must be
> arbitrated CONFIRMED before the TestWriter derives the red set. The two
> genuine either/or items are Q1 (orchestration home + N1) and Q4 (bounded vs.
> unbounded drain). Q2/Q3 are confirmations of the recommended reading.

- **REMOVE-ORCHESTRATION-HOME (new — §7 Q1, resolve to a SEPARATE module +
  controller method, NOT an in-`hotApply` upgrade):** the drain-then-teardown
  orchestration lives HALF in a NEW node-testable module
  `src/main/rag-store-remove.ts` (the ONLY owner of the `store.teardown()` /
  `engine.teardown()` / `engine.inFlight()` CALL SITES for a removed entry) and
  HALF in a NEW async controller method `hotRemove(name)` on
  `RagStoreRuntimeController` in `rag-store-runtime.ts` (which performs the
  write + unregister via the existing `hotApply({kind:'remove'})`, then AWAITS
  the module's drain+teardown helper). This keeps `hotApply` SYNCHRONOUS
  (unchanged contract), makes the remove ASYNC (the operator seam — U-H8 calls
  it), and keeps `rag-store-runtime.ts` free of a LEXICAL `teardown(` — so the
  U-H2/ U-H5 **N1/A-P2-8 grep pin STAYS GREEN** (the teardown calls are in
  `rag-store-remove.ts`; the runtime references only `drainAndReleaseEntry(`,
  whose identifier contains no lowercase `teardown`).
- **HOT-REMOVE-METHOD (new — §7 Q2, resolve to an ADDITIVE async method; the
  legacy `hotApply({kind:'remove'})` co-exists):** the runtime controller gains
  **`hotRemove(name: string): Promise<HotRemoveResult>`**. It REUSES the LANDED
  `hotApply({kind:'remove', name})` for the write + default-stability + live-map
  swap (so all W-remove-* / loader-F12 / fs errors propagate unchanged and D2 is
  preserved), CAPTURES the removed `RagStoreEntry` BEFORE the `hotApply` call
  (the orphan to drain), and after the swap `await drainAndReleaseEntry(orphan)`.
  `hotApply({kind:'remove'})` itself is UNCHANGED (the U-H2 H4 orphan test + F11
  + N1/N2 stay green); the D7-satisfying, operator-facing remove is `hotRemove`
  (the co-existing-two-path boundary is recorded in §5.11 + §7 Q2).
- **DRAIN-ORDER (new — D7/A-P2-2):** the drain+teardown ORDER is pinned:
  (1) CAPTURE the orphan entry; (2) write + unregister (the `hotApply` swap) —
  the removed engine is no longer routable from the live Map the moment the
  swap completes, so no NEW query can reach it; (3) DRAIN — await
  `orphan.engine.inFlight() === 0` (never proceed to teardown while a query is
  mid-flight — A-P2-2); (4) `await orphan.store.teardown()` (drain the
  single-writer queue, revoke mutations; the file + journal STRANDED
  byte-identical — D3); (5) `await orphan.engine.teardown()` (STOPPED);
  (6) return `{ loaded, delta, drained: 0 }`. Store-then-engine is pinned
  deterministically (the engine does not mutate the store; both are drained to
  idle; §5.4).
- **UNREGISTER-EVERYWHERE (new):** after `hotRemove`, the removed store is gone
  from EVERY runtime accessor: `getDirectory().entries.get(name)` →
  `undefined`, `statusOf(name)` → **R-status-unknown**, `currentStores()` (=
  `_currentRegistry.stores`, advanced to the fresh `loaded` by the `hotApply`
  swap) no longer lists it, and the default-store accessors are untouched.
- **DEFAULT-REMOVAL-IMPOSSIBLE (new):** `hotRemove('<default>')` FAILS LOUD via
  the propagated loader **F12** (`rag-store-registry: exactly one store must
  have default: true (found 0)`) BEFORE any drain — the write module's candidate
  re-validation rejects removing the only `default:true` store. There is NO
  `W-remove-default` message; the exactly-one-default loader rule is the guard.
  Every reachable drain+teardown is therefore NON-default-only.
- **NO-OP-ON-ABSENT (clarified — new):** removal is NOT a silent no-op at the
  WRITE level. A `hotRemove` of an unknown / already-removed name FAILS LOUD with
  the write module's **W-remove-unknown** (live + disk untouched, NO teardown).
  The IDEMPOTENCY lives at the DRAIN/teardown level (a torn-down store's/engine's
  `teardown()` is a safe immediate no-op — U-H5), not at the removal-write level.
- **D3-ORPHAN-STRAND (new):** the drain+teardown NEVER deletes/touches the store's
  persistence file + journal (U-H5 primitives are no-delete by contract, and
  `rag-store-remove.ts` imports NO `unlink`/`rm`/`rmdir`/`remove`). The strand is
  pinned byte-identical after every `hotRemove` path.
- **D6/A-P2-7-SCOPE-BOUNDARY (new):** U-H4 lands the CONTROLLER-level remove
  MECHANISM (`hotRemove` + the drain/teardown module), node-testable, with NO
  MCP tool and NO IPC channel. Operator confirmation + the trigger are U-H8's
  row (the operator-UI IPC editor calls `hotRemove` after the confirmation
  dialog). §5.11.
- **Consumed decision rows (implemented by U-H2/U-H5 or inherited, cite-only):**
  **HOT-APPLY-TRIGGER-RESOLVED** (`hotApply` is a programmatic synchronous seam;
  U-H4 adds the async `hotRemove` beside it), **ATOMIC-APPLY** +
  **DEFAULT-STABLE-APPLY** + **REBUILD-ALL-OF-NON-DEFAULT** (U-H2's write+swap
  `hotRemove` reuses), **ENGINE-PER-STORE** (each entry owns the engine the drain
  tears down), **SINGLE-WRITER-STORE-PER-STORE** (`store.teardown()` drains ITS
  OWN queue), **D3 hot-remove ORPHAN** (never delete), **TEARDOWN-ASYNC** +
  **STORE-TEARDOWN-REVOKES-MUTATION-ONLY** + **ENGINE-TEARDOWN-STOP-SERVING** +
  **DRAIN-SEAM-INFLIGHT** + **NO-FAIL** (the U-H5 primitives U-H4 consumes,
  `docs/specs/unit-h5-teardown.md` §4).

## 5. The exhaustive contract

### 5.1 The runtime controller surface changes (exact TS shapes)

U-H4 ADDS one method + one result type to the U-H2 controller interface
(`src/main/rag-store-runtime.ts`); it does NOT change `hotApply`/`HotApplyResult`
or any of the existing 9 methods.

```ts
// src/main/rag-store-runtime.ts — Unit U-H4 additions (ON TOP of the U-H2 shape).

import { drainAndReleaseEntry } from './rag-store-remove.js'  // U-H4 — the ONLY
// teardown CALLER referenced by this module. NOTE: the identifier `drainAndReleaseEntry`
// contains NO lowercase `teardown`, preserving the N1 grep pin (§5.8).

export interface RagStoreRuntimeController {
  // ... (all EXISTING U-H2 members unchanged: getDirectory, getDefaultEntry,
  //      getDefaultName, getDefaultStore, getDefaultEngine, getVectorBoot,
  //      getRegistryPath, currentStores, statusOf, hotApply) ...

  /** RELEASE U-H4 — the DRAIN-THEN-TEARDOWN remove: write + unregister the named
   *  NON-default store (via the existing `hotApply({kind:'remove'})` write+swap),
   *  then drain the removed engine (`inFlight()===0`), tear the removed store's
   *  store + engine down (U-H5 primitives, owned by `rag-store-remove.ts`), and
   *  STRAND the persistence file + journal (D3). ASYNC — the operator-facing
   *  remove seam U-H8 calls. Throws propagate (W-remove-unknown / W-remove-arg /
   *  loader F12 / fs); the live Map + disk are untouched on a throw. */
  hotRemove(name: string): Promise<HotRemoveResult>
}

/** The successful drain-then-teardown remove result. `delta.removed` is exactly
 *  `[name]`; `drained` is the settled in-flight count at teardown — ALWAYS 0
 *  (the drain gate never tears down mid-query, A-P2-2). */
export interface HotRemoveResult {
  /** The FRESH `loaded` registry just written + re-read by the U-H2 write path. */
  loaded: LoadedRagStoreRegistry
  /** `{ added: [], removed: [name], renamed: [] }` — the applied delta. */
  delta: RegistryDelta
  /** The settled in-flight query count at teardown — 0 (the drain guarantee). */
  drained: number
}
```

### 5.2 The new drain+teardown module (`src/main/rag-store-remove.ts` — exact TS)

```ts
// src/main/rag-store-remove.ts — Unit U-H4: THE drain-then-teardown caller of
// the U-H5 primitives for a REMOVED store. The ONLY module that lexically calls
// `teardown(`/`inFlight()` for a removed entry. NO Electron, NO IPC, NO MCP
// (D6), NO `unlink`/`rm`/`rmdir`/`remove` import (D3 — the file is NEVER
// deleted). Header cites this spec + docs/specs/unit-h5-teardown.md §4/§5 +
// the review D7/A-P2-2/A-P2-8.

import type { RagStore } from './rag-store.js'
import type { RetrievalEngine } from './retrieval.js'

/** The drain input — the removed `RagStoreEntry`'s `store` + `engine`
 *  (compatible with the `RagStoreEntry` type from `rag-store-directory.ts`). */
export interface RemovedEntry {
  store: RagStore
  engine: RetrievalEngine
}

/** The result of a drained + torn-down removal. */
export interface RemovedEntryReleaseResult {
  /** The settled in-flight count at teardown — ALWAYS 0 (the drain gate). */
  drained: number
}

/** DRAIN-THEN-TEARDOWN the removed entry's store + engine (D7/A-P2-2).
 *  1) AWAIT `entry.engine.inFlight() === 0` — NEVER proceed to teardown while a
 *     query is mid-flight (the gate; UNBOUNDED await — §7 Q4).
 *  2) `await entry.store.teardown()` — drain the single-writer queue, revoke
 *     mutations; the persistence file + journal are STRANDED byte-identical
 *     (D3). NO-FAIL by the U-H5 contract (may HANG on a never-settling queued
 *     promise — F-H5-3 awareness).
 *  3) `await entry.engine.teardown()` — STOPPED (post-remove query throws
 *     `retrieval engine: torn down`). NO-FAIL.
 *  4) Resolve `{ drained: 0 }`. */
export async function drainAndReleaseEntry(
  entry: RemovedEntry,
): Promise<RemovedEntryReleaseResult>
```

### 5.3 `hotRemove` — exact behavior (pinned)

`hotRemove(name)` on the runtime controller:

1. **Capture the orphan BEFORE the write:** `const orphan = directory.entries.get(name)`.
   This is the pre-remove live entry whose store + engine U-H4 drains/tears down.
2. **Write + swap (the existing synchronous `hotApply`):** call
   `hotApply({ kind: 'remove', name })`. This runs the FULL U-H2 remove path:
   guard → `writeRegistryMutation` (the ONLY disk touch; W-remove-unknown /
   W-remove-arg / loader F12 for a default-removal / native-fs errors PROPAGATE
   unchanged, live + disk untouched on a throw) → default-stability check (R-
   default-changed/R-default-mismatch2 drift sync retained, D2) → rebuild the
   non-default entries, drop the removed entry, advance `_currentRegistry =
   loaded`. The removed engine is no longer routable from the live Map the
   moment this swap completes. **A throw at this step returns EARLY — the
   captured orphan is NEVER drained/teared down, and the live Map + disk are
   untouched.**
3. **Defensive absent-entry skip (unreachable per D2):** if `orphan` is
   `undefined` despite a successful write (the D2 "persisted-and-live never
   diverge" invariant is violated — an implementation-bug case only), SKIP the
   drain/teardown and return `{ loaded, delta, drained: 0 }`. Not a documented
   fail-state; a defensive no-op guard, recorded here so it is never asserted as
   reachable behavior.
4. **Drain + teardown the orphan:** `await drainAndReleaseEntry(orphan)` (see
   §5.4). The store + engine are torn down; the file + journal strand.
5. **Return `{ loaded, delta, drained: 0 }`** — `delta.removed === [name]`.

### 5.4 `drainAndReleaseEntry` — exact behavior (pinned)

See §5.2. Elaborations that a TestWriter derives:

- **The drain gate (A-P2-2):** the function does NOT call `store.teardown()` /
  `engine.teardown()` while `entry.engine.inFlight() > 0`. It awaits the count
  to reach `0` (an in-flight query that settles — resolve OR reject — decrements
  per U-H5 — completes on the OLD embedder per U-H5 F8, THEN the teardown runs).
- **Drained value:** the returned `drained` is the settled `inFlight()` count at
  teardown time — ALWAYS `0`. Deterministic, node-testable.
- **Order:** `store.teardown()` THEN `engine.teardown()` (pinned). The store
  drain and the engine drain are independent (the engine does not mutate the
  store); the store's queue is drained + mutations revoked first, then the
  engine is marked STOPPED.
- **D3 strand:** NEITHER primitive touches the persistence file + journal;
  `rag-store-remove.ts` imports NO `unlink`/`rm`/`rmdir`/`remove`. The file is
  byte-identical before and after.
- **NO-FAIL inherited:** both `teardown()` calls are NO-FAIL (U-H5 contract —
  they never throw/reject; a store drain that itself rejects is failure-isolated
  by the single-writer queue; an embedder hook rejection is swallowed). If the
  STORE teardown HANGS on a never-settling queued promise (F-H5-3), the
  `await` blocks — surfaced in §7 Q4; the drain gate does NOT assume teardown
  settles a caller-held resource.

### 5.5 The byte-pinned error set + the message census

U-H4 introduces **NO new byte-pinned message template**. All errors it surfaces
come from the LANDED write/loader/runtime sets (§5.3 step 2) — the only errors
the drain/teardown can produce are the POST-teardown serving throws of the LANDED
U-H5 primitives (which are NOT thrown by `hotRemove`/`drainAndReleaseEntry`
themselves — they are observed by any later caller of a torn-down store/engine).

| # | Trigger (on `hotRemove(name)`) | Outcome | Exact thrown message (PROPAGATED — §5.3 step 2) |
| --- | --- | --- | --- |
| R-remove-unknown | `name` not present (or already removed) | fail-loud; live + disk untouched; NO teardown | `rag-store-registry-write: cannot remove unknown store '<name>'` (W-remove-unknown, write module) |
| R-remove-default | `name` === the default store (removing the only `default:true` leaves zero) | fail-loud; live + disk untouched; NO teardown | `rag-store-registry: exactly one store must have default: true (found 0)` (loader F12, candidate re-validation — NO `W-remove-default` message exists) |
| R-remove-arg | `name` not a non-empty string (`''`, null, non-string) | fail-loud; NO teardown | `rag-store-registry-write: name required` (W-remove-arg) |
| R-remove-fs | a native fs failure on persist | fail-loud Error (message native); live + disk untouched; NO teardown | propagated |
| (defensive) | `orphan === undefined` after a SUCCESSFUL write | no throw — drain/teardown SKIPPED (D2-invariant bug guard, §5.3 step 3) | — (not asserted as reachable) |

**Census (U-H4 additions):**
- New modules/files created: **1** — `src/main/rag-store-remove.ts`
  (+ the SpecWriter-pinned test file `tests/unit-h4-hot-remove.test.ts`).
- New controller members: **1** — `hotRemove(name): Promise<HotRemoveResult>`;
  1 new result type `HotRemoveResult`; 1 new exported interface + 1 factory-free
  type in `rag-store-remove.ts` (`RemovedEntry`, `RemovedEntryReleaseResult`).
- New `teardown(`/`inFlight()` CALL SITES (all in `rag-store-remove.ts`):
  **2** (`store.teardown()`, `engine.teardown()`) + **1** drain CHECK
  (`engine.inFlight()`). **ZERO** such call sites in `rag-store-runtime.ts`.
- New byte-pinned message templates: **0** (all errors propagate from LANDED
  sets).
- New MCP tools / IPC channels / `stores:"all"` fan-out changes: **0** (D6/
  A-P2-7/§5.11).
- New `console.*` lines: **0** (`rag-store-remove.ts` emits no logs; it throws
  nothing — it awaits + delegates; the runtime's existing 0-log census holds).
- Files this unit EDITs: `src/main/rag-store-runtime.ts` (adds `hotRemove` +
  `HotRemoveResult` + the `drainAndReleaseEntry` import). Files this unit ADDS:
  `src/main/rag-store-remove.ts`. **UNTOUCHED:** `main.ts`, `mcp-server.ts`,
  `rag-store.ts`, `retrieval.ts`, `vector-boot.ts`, `adjacency.ts`,
  `rag-store-registry.ts`, `rag-store-registry-write.ts`,
  `rag-store-directory.ts`, `preload.ts`, `shared/types.ts`, `security.ts`,
  `sidebar-panes.ts`.

### 5.6 U-H4 happy-path states (TestWriter red set — valid paths)

`<d>` is an absolute temp dir; a controller is constructed over a boot directory
from a 2-store registry (`main` default, `research-2026-09` non-default), each on
a derived persistence file, per the U-H2 fixture. `<idle>` = no in-flight query.

1. **H1 — remove a present, IDLE non-default → drained + teardown + unregistered +
   file stranded (D7/D3):** `await hotRemove('research-2026-09')` → resolves
   `{ loaded, delta:{added:[], removed:['research-2026-09'], renamed:[]}, drained:0 }`;
   `getDirectory().entries.get('research-2026-09')` is `undefined`;
   `currentStores()` no longer lists it (the surviving `main` default remains);
   `statusOf('research-2026-09')` THROWS **R-status-unknown**; the removed
   store's persistence file + journal are **BYTE-IDENTICAL** before/after (never
   deleted/touched — D3); the DEFAULT entry (`main`) object identity is UNCHANGED
   (`getDefaultStore()` returns the SAME object).
2. **H2 — the removed engine + store are genuinely TORN DOWN:** after H1, a
   `query()` on the removed engine (captured pre-Remove) throws `retrieval
   engine: torn down`; a `putNode` on the removed store throws `rag store: torn
   down`; a `getNode` on the removed store still RESOLVES (read-safe teardown);
   the removed file still loads a store with the same nodes (stranded +
   intact).
3. **H3 — remove with an in-flight query DRAINS first (A-P2-2):** fire a
   `query()` on `research-2026-09` (do not await; keep it pending), call
   `hotRemove('research-2026-09')` — while the query is pending, assert (via a
   captured reference) the engine is NOT yet torn down (a fresh `query()` on it
   still resolves OR the `inFlight()` is still ≥1); after the gated query
   SETTLES, the drain proceeds: the engine becomes torn down, the store file is
   byte-identical, and `hotRemove` resolves `{ drained: 0 }`. The removed engine
   is NEVER torn down while `inFlight() > 0`.
4. **H4 — remove when a second non-default survives (multi-store registry):**
   from a 3-store registry (`main` + `research-2026-09` + `research-2026-10`),
   `hotRemove('research-2026-09')` unregisters ONLY `research-2026-09`;
   `research-2026-10` remains (rebuilt fresh per the U-H2 coarse path — its
   object identity may change; this is the documented survivor-rebuild-orphan
   churn, §5.11); the default is untouched.
5. **H5 — the write is re-readable (D2):** after `hotRemove`, a fresh
   `loadRagStoreRegistry({ path: registryPath })` shows the removed store gone
   with `implicit:false`/`corrupt:false` — persisted == live.
6. **H6 — a torn-down store/engine `teardown()` is a safe NO-OP (idempotency at
   the primitive level):** calling `store.teardown()` / `engine.teardown()` again
   (post-`hotRemove`) resolves immediately — the removal is idempotent at the
   drain/teardown layer even though the WRITE is not (W-remove-unknown on repeat,
   §5.7 F2).

### 5.7 U-H4 fail-states (TestWriter red set — documented fail-states)

Outcomes: **fail-loud** = the propagated `Error`; **live-untouched** =
`getDirectory().entries` deep-equal to before + the registry file byte-identical
+ NO teardown ran (the drain/teardown is skipped when the write throws — §5.3
step 2 EARLY return).

| # | Trigger | Outcome | Exact result |
| --- | --- | --- | --- |
| F1 | `hotRemove(null)` / `hotRemove(5)` / `hotRemove('')` | fail-loud | **W-remove-arg** `rag-store-registry-write: name required` (PROPAGATES); live-untouched; NO teardown |
| F2 | `hotRemove('nope')` (unknown / already-removed) | fail-loud | **W-remove-unknown** `rag-store-registry-write: cannot remove unknown store 'nope'` (PROPAGATES); live-untouched; NO teardown — remove is NOT a silent no-op at the write level |
| F3 | `hotRemove('main')` (the DEFAULT) | fail-loud | the propagated loader **F12** `rag-store-registry: exactly one store must have default: true (found 0)` — the write module's candidate re-validation rejects a zero-default registry; live-untouched; NO teardown; NO `W-remove-default` message exists |
| F4 | `hotRemove` whose persist hits a native fs failure (ENOSPC/EACCES/EROFS) | fail-loud | the native fs Error PROPAGATES; live-untouched; the ORIGINAL file intact; NO teardown |
| F5 | the store's `teardown()` HANGS on a never-settling queued promise (F-H5-3 awareness) | does NOT settle | `drainAndReleaseEntry`'s `await store.teardown()` blocks — surfaced (§7 Q4); the drain gate does NOT proceed past a torn-down/hung store; NOT a U-H5 regression (recorded U-H5 F-H5-3) |
| F6 | the drain awaits a NEVER-settling in-flight query | does NOT settle | the drain gate blocks on `inFlight() === 0` (A-P2-2 correctness) — a never-settling query hangs `hotRemove`; whether to surface via a bound is §7 Q4 |
| F7 | a query entered BEFORE teardown (in-flight at teardown — a caller error, NOT the U-H4 drain guarantee if the drain was bypassed) | completes on the OLD embedder | the U-H4 drain (via `inFlight()===0`) is the guarantee; a mid-query teardown is not reachable through `hotRemove` (the gate precedes it) — documented, not silently corrupted (U-H5 F8) |
| F8 | a defensive `orphan === undefined` after a successful write (D2-invariant bug — unreachable by contract) | no throw, no teardown | the drain is SKIPPED; `{ loaded, delta, drained: 0 }` returned — an implementation-bug guard, NOT a documented reachable fail-state (§5.3 step 3) |

### 5.8 Negative pins (D6 / D8 / A-P2-7 / A-P2-8 / D3 + the N1 re-pin status)

- **A-P2-8 / N1 (the runtime module — STAYS GREEN, NOT RELAXED):** the LANDED
  `tests/unit-h2-runtime-controller.test.ts` **N1** (`expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)`
  on the runtime source, line 1043) and the U-H5 `tests/unit-h5-teardown.test.ts`
  A-P2-8 block (`:579-580`) **REMAIN GREEN and are NOT re-pinned.** U-H4's design
  keeps the teardown CALLS physically in `src/main/rag-store-remove.ts`; the
  runtime's `hotRemove` references only `drainAndReleaseEntry(` (an identifier
  with NO lowercase `teardown`). The regex `\b(teardown|close|destroy)\s*\(`
  STILL does NOT match `rag-store-runtime.ts` source. **HARD REQUIREMENT on the
  Implementer (a TestWriter adversarial probe WILL check the raw source):** no
  comment, docstring, or identifier in `rag-store-runtime.ts` may contain the
  literal `teardown(` (a bare mention like "teardown orchestration" is fine —
  it lacks the paren — but `teardown(` and the identifier `...teardown(` are
  FORBIDDEN in that file). The A-P2-8 PROSE "the runtime makes no teardown call"
  is SUPERSEDED in its remove-path sense — U-H4 (the designated caller) makes the
  runtime DRIVE the drain+teardown via the `rag-store-remove.ts` helper — but the
  structural GREP pin that U-H2/U-H5 assert is preserved byte-for-byte.
- **N2 (the runtime module — STAYS GREEN):** `rag-store-runtime.ts` keeps its
  no-MCP/no-IPC (`\bMUTATING_METHODS\b`/`\bALL_TOOLS\b`/`\bRpcMethod\b`/`\bIPC_[A-Z_]+\b`),
  no-delete (`\b(unlink|rm|rmdir|remove)\s*\(` — `hotRemove`'s capital-R
  "Remove" + the lowercase regex do NOT match), and 0-console pins. `rag-store-remove.ts`
  carries the SAME no-delete / no-IPC / no-MCP negative pins (§5.5 census).
- **D6 / A-P2-7 — no MCP tool, no IPC channel:** U-H4 adds NO tool name to
  `ALL_TOOLS` (stays 41), NO `RpcMethod`/`MUTATING_METHODS` member, NO IPC
  constant. The operator-facing trigger + confirmation dialog are **U-H8**.
- **D3 — teardown NEVER deletes:** the drain/teardown paths (`rag-store-remove.ts`)
  import NO `unlink`/`rm`/`rmdir`/`truncate` primitive and call only the U-H5
  no-delete `teardown()`s; the store file + journal are byte-identical after
  every `hotRemove` path.
- **D8 — boot reads ONCE:** `hotRemove` invokes the write path exactly per call
  (the U-H2 controlled re-read); the boot loader + the idle runtime read nothing
  new. The removed store's persistence file is NEVER re-read/re-applied by the
  drain (it is stranded, D3).
- **`stores:"all"` fan-out — UNCHANGED:** the `mcp-server.ts` fan-out is NOT
  touched by U-H4 (its per-call resolve of each store's `engine` is unchanged).
  The A-P2-2 snapshot/drain for the fan-out itself is a SEPARATE concern, out of
  U-H4's single-store scope (§5.11).

### 5.9 Unit → file → test-file mapping + the red-set expectation

| Unit | File | Test file | Red-set expectation (RCA-1) |
| --- | --- | --- | --- |
| **U-H4** (this spec) | `src/main/rag-store-remove.ts` (NEW — the drain+teardown caller `drainAndReleaseEntry`) + `src/main/rag-store-runtime.ts` (ADD `hotRemove`: Promise + `HotRemoveResult` + the `drainAndReleaseEntry` import) | `tests/unit-h4-hot-remove.test.ts` (SpecWriter-pinned; the §5.4/§5.6 H1–H6 + §5.7 F1–F8 + §5.8 N-pin red set) | RED — the U-H4 orchestration does NOT EXIST on the pre-U-H4 code: (i) the `rag-store-remove.ts` import FAILS (module absent → the suite's `import { drainAndReleaseEntry }` throws before any test body); (ii) `RagStoreRuntimeController` has NO `hotRemove` (`typeof controller.hotRemove === 'undefined'`); (iii) the existing `hotApply({kind:'remove'})` ORPHANS — it does NOT drain/teardown, so the H1–H6 bodies that assert teardown/unregister/strand each FAIL on the absent/behaviorless `hotRemove`. The suite FAILS on the missing orchestration surface BEFORE any behavior is exercised. |

- **Existing tests that STAY GREEN:** the full U-H2 suite
  (`tests/unit-h2-runtime-controller.test.ts` — H4/F11/N1/N2 + HOST-1/2/3, and
  the U-H2b B1–B13/M1–M4 + D6a/D6b/D8/A-P2-8 pins), the U-H5 suite
  (`tests/unit-h5-teardown.test.ts` incl. its A-P2-8 runtime grep), and the
  write-module suite (`tests/unit-h1-registry-write.test.ts`). U-H4 does not
  change `hotApply`, `rag-store-registry-write.ts`, `main.ts`, or `mcp-server.ts`,
  so their pins cannot regress. **The `rag-store-runtime.ts` N1/A-P2-8 grep pin
  STAYS GREEN BY DESIGN (§5.8) — no U-H2 test is re-pinned or relaxed.**
- **Per RCA-2/RCA-5:** U-H4 runs its own TestWriter-red → Implementer-green →
  adversarial → blind-greens → doc-review cycle; the trio (`npm test` /
  `npm run typecheck` / `npm run build`) runs after the green. The §7 ruling is
  the gate BEFORE the TestWriter derives the red set. The live-scenario battery
  stays PARKED (§6).
- **Page design:** U-H4 is NOT a page-design change (the operator-UI editor +
  confirmation dialog is U-H8; the settings-pane listing is U-MS5's surface).
  The designing-pages skill and its test-use-case coverage matrix + demo-page
  index are UNCHANGED by U-H4.

### 5.10 Census / numeric claims

- **New modules/files this unit creates:** **1** — `src/main/rag-store-remove.ts`
  (+ the SpecWriter-pinned `tests/unit-h4-hot-remove.test.ts`).
- **Files EDITED:** **1** — `src/main/rag-store-runtime.ts` (adds `hotRemove` +
  `HotRemoveResult` + the `drainAndReleaseEntry` import; does NOT change `hotApply`
  or the other 9 methods). **NO edits** to `rag-store.ts`/`retrieval.ts`/
  `vector-boot.ts`/`adjacency.ts`/`rag-store-registry.ts`/
  `rag-store-registry-write.ts`/`rag-store-directory.ts`/`main.ts`/`mcp-server.ts`/
  `preload.ts`/`shared/types.ts`/`security.ts`/`sidebar-panes.ts`.
- **New exports/methods:** `RagStoreRuntimeController.hotRemove(name): Promise<HotRemoveResult>`
  (1 method) + `HotRemoveResult` (1 type) in `rag-store-runtime.ts`;
  `drainAndReleaseEntry(entry): Promise<RemovedEntryReleaseResult>` (1 factory-free
  function) + `RemovedEntry` + `RemovedEntryReleaseResult` (2 types) in
  `rag-store-remove.ts`.
- **New `teardown(`/`inFlight()` call sites:** **3 TOTAL, ALL in `rag-store-remove.ts`**
  (`engine.inFlight()` drain ×1 poll, `store.teardown()` ×1, `engine.teardown()`
  ×1); **ZERO in `rag-store-runtime.ts`** (the N1 pin).
- **New byte-pinned message templates:** **0** (all `hotRemove` errors propagate
  from the LANDED write/loader/fs sets; F5/F6 hang rather than throw).
- **New MCP tools / IPC channels / fan-out edits / teardown calls in the runtime:**
  **0** (D6/A-P2-7/N1/§5.11).
- **New `console.*` lines:** **0** (`rag-store-remove.ts` awaits + delegates, no
  logs; the runtime's 0-log census holds).
- **Runtime re-builds per `hotRemove`:** exactly the U-H2 coarse rebuild of the
  surviving NON-default entries (unchanged); the removed entry is drained+teardown
  NOT rebuilt; the default + vector-boot are NOT rebuilt.
- **Disk writes per successful `hotRemove`:** exactly ONE registry write (U-H1's
  temp→fsync→rename) + the re-load read; ZERO writes to any store persistence
  file/journal; ZERO file deletions.
- **No page-design change** ⇒ the designing-pages skill is UNCHANGED by U-H4.

### 5.11 Cross-references

- **Gate:** `docs/specs/registry-hot-apply-review.md` §2 **D3** (hot-remove
  ORPHAN — strand the file + journal, operator confirmation via the operator-UI
  control, NOT MCP), **D7** (remove drain-then-teardown — REQUIRES the U-H5
  teardown primitives), **A-P2-2** (`stores:"all"` drain-then-teardown so a
  removed engine is never mid-query), **A-P2-7** (orphan via operator control,
  confirmation required, no MCP path), **A-P2-8** (teardown lands in U-H5 — U-H4
  is the first caller), **D6** (operator-UI IPC only, no new MCP tool); §5
  "Impact on existing contracts" (SINGLE-WRITER-STORE-PER-STORE unaffected;
  hot-remove orphans, never deletes); §6 (live-scenario PARKED).
- **Consumed — the U-H5 primitives:**
  `docs/specs/unit-h5-teardown.md` §4 (**TEARDOWN-ASYNC**,
  **STORE-TEARDOWN-REVOKES-MUTATION-ONLY**, **ENGINE-TEARDOWN-STOP-SERVING**,
  **DRAIN-SEAM-INFLIGHT** — `inFlight(): number`, **NO-FAIL**), §5.4–5.7 (the
  byte-pinned `rag store: torn down` / `retrieval engine: torn down` messages,
  the F8 "a mid-query teardown is a caller error, the drain is the guarantee"
  row, the F-H5-3 never-settling-queue awareness in §3a); `src/main/rag-store.ts:287/1354`,
  `src/main/retrieval.ts:611/730-743`, `src/main/vector-boot.ts:93/398`.
- **Consumed — the U-H2 runtime controller:**
  `docs/specs/unit-h2-runtime-controller.md` §4 (**HOT-APPLY-TRIGGER-RESOLVED**,
  **ATOMIC-APPLY**, **REBUILD-ALL-OF-NON-DEFAULT**, **DEFAULT-STABLE-APPLY**),
  §5.2 (`RagStoreRuntimeController`, `HotApplyResult`, the 10 methods), §5.4
  (`hotApply` steps — the remove write+swap U-H4 reuses), §5.7 (**F11**
  W-remove-unknown, **N1**/N2 negative pins, the D3 no-remove import pin);
  `src/main/rag-store-runtime.ts` (the current orphan remove path `:186-257` +
  `syncLiveToLoaded` `:285-305`).
- **Consumed — the write module (the propagated error set):**
  `docs/specs/unit-h1-registry-write.md` §5.5 (**W-remove-unknown**,
  **W-remove-arg**, the loader F12 zero-default rule for a default-removal, the
  structural no-REMOVE/D3 pin); `src/main/rag-store-registry-write.ts:181-187/145-148`
  + `rag-store-registry.ts:309-314` (the exactly-one-default loader rule).
- **Consumed — the entry shape:**
  `docs/specs/unit-ms2-store-wiring.md` §5.1 (`RagStoreEntry` — the per-entry
  `store`/`engine` the drain tears down); `rag-store-directory.ts`.
- **Sibling slice units (cite-only):** U-H3 (hot-add, confirmatory EMPTY), U-H5
  (teardown primitives, LANDED), U-H6 (hot-rename — its own teardown-aware
  caller), U-H7 (default reassignment — OUT), U-H8 (the operator-UI editor —
  invokes `hotRemove` after the confirmation dialog; D6/A-P2-7). **Execution
  order proceeding: U-H5 → U-H4 → U-H6 → U-H8; U-H7 split out.**
- **In-scope boundary vs U-H8:** U-H4 lands the CONTROLLER/mechanism-level remove
  (`hotRemove` + the drain module), node-testable, NO IPC/MCP. U-H8 lands the
  operator-facing trigger + confirmation dialog + the IPC channel that calls
  `hotRemove` (the operator-UI editor). §5.8/§5.11.
- **`stores:"all"` fan-out (OUT):** the `mcp-server.ts` fan-out that resolves each
  store's engine per call is UNCHANGED by U-H4; the A-P2-2 snapshot-drain for the
  fan-out (a removed engine absent from a concurrently-resolved `stores:"all"`
  snapshot) is a SEPARATE concern, noted here as NOT U-H4's single-store remove.
- **Test file (SpecWriter-pinned):** `tests/unit-h4-hot-remove.test.ts`.
- **Decision rows:** `docs/decisions.md` — U-H2's **RUNTIME-CONTROLLER**,
  **MUTABLE-LIVE-DIRECTORY**, **DEFAULT-STABLE-APPLY**,
  **REBUILD-ALL-OF-NON-DEFAULT**, **HOT-APPLY-TRIGGER-RESOLVED**, **ATOMIC-APPLY**,
  **D4-NO-IDS-CALLER-PRECONDITION**; U-H5's **TEARDOWN-ASYNC**,
  **ENGINE-TEARDOWN-STOP-SERVING**, **DRAIN-SEAM-INFLIGHT**; the inherited
  **SINGLE-WRITER-STORE-PER-STORE**, **ENGINE-PER-STORE**, **D3 hot-remove
  ORPHAN**, **REGISTRY-ATOMIC-WRITE**/WRITE-module rows. U-H4 records a NEW row
  (**HOT-REMOVE-DRAIN-THEN-TEARDOWN**) on landing.

## 6. The live-scenario gate

**Live-scenario gate: PARKED (2026-09-08, per the user's instruction — the
registry hot-apply/removal/rename MCP/UI surface cannot be driven live because a
live app session is unavailable).** U-H4's live gate is PARKED accordingly: the
drain-then-teardown remove is node-testable in `tests/unit-h4-hot-remove.test.ts`
(no live app needed); a **live-pending battery** (`tests/unit-h4-hot-remove-live-pending-battery.md`)
SHOULD be authored in a LATER live-app session, exercising a REAL
operator-triggered remove (via U-H8) that drains + tears down a live store/engine
end-to-end. It is NOT authored now (PARKED).

## 7. Design questions surfaced to the Architect (arbitrate BEFORE the TestWriter runs)

> The U-H5 §7 convention: the spec resolves PROVISIONALLY; the TestWriter derives
> the red set ONLY after the Architect rules CONFIRMED. **U-H4's two genuine
> either/or decisions are Q1 (orchestration home + the N1 pin) and Q4 (bounded
> vs. unbounded drain) — these need a positive ruling, not an "as-written"
> confirmation.**

1. **Where does the drain-then-teardown orchestration live — and what happens to
   the U-H2 N1/A-P2-8 no-teardown pin? (the KEY tension — RESOLVED provisionally
   to option (b): a separate module `rag-store-remove.ts` + an additive async
   `hotRemove` method; N1 STAYS GREEN. Needs a ruling.)**
   - **Option (a) — inside `hotApply({kind:'remove'})` in `rag-store-runtime.ts`:**
     would force `hotApply` to become ASYNC (or spawn a fire-and-forget teardown),
     RELAX the U-H2 **N1** grep (`/\b(teardown|close|destroy)\s*\(/` on the runtime
     source, `tests/unit-h2-runtime-controller.test.ts:1043`) AND the U-H5 A-P2-8
     runtime grep (`tests/unit-h5-teardown.test.ts:579`), and re-pin both. It makes
     the runtime the teardown CALLER, contradicting the architecture the U-H5 spec
     deliberately preserved (the teardown callers are U-H4/U-H6/U-H7, not the core
     runtime).
   - **Option (b) — RECOMMENDED — a separate orchestration home:** the teardown
     CALL SITES live ONLY in a NEW module `src/main/rag-store-remove.ts`
     (`drainAndReleaseEntry`); the runtime gains an ADDITIVE async `hotRemove(name)`
     that reuses the LANDED `hotApply({kind:'remove'})` for the write+swap, then
     AWAITS the helper. `rag-store-runtime.ts` never lexically contains `teardown(`,
     so **N1/A-P2-8 STAY GREEN with ZERO re-pin** — the least-invasive outcome. This
     is consistent with U-H5's `TEARDOWN-NO-WIRE-UP` ("U-H5 does NOT wire a caller;
     U-H4 does") and with the runtime-as-orchestrator-but-not-teardown-owner model.
   - **Option (c) — a controller-level drain guard / other home:** e.g. a
     `canTeardown(name)` guard on the controller (already DEFERRED in U-H5 §7 Q3 as
     impossible — the controller has no in-flight knowledge; A-P2-8), or the
     `mcp-server` fan-out (rejected — the fan-out is out of U-H4's scope).
   - **Ruling requested:** confirm option (b) and that the U-H2/U-H5 N1/A-P2-8 grep
     pins STAY GREEN (not re-pinned), with the single hard requirement that
     `rag-store-runtime.ts` source contains no literal `teardown(` (the Implementer
     note in §5.8). **This is the Q1 decision the TestWriter cannot proceed without.**
2. **The two-remove-path split: does the legacy `hotApply({kind:'remove'})` orphan
   path CO-EXIST with the new `hotRemove`, or is it re-scoped? (RESOLVED
   provisionally to CO-EXIST — confirm.)** The recommended design keeps
   `hotApply({kind:'remove'})` UNCHANGED (the U-H2 H4 orphan test + F11 + N1/N2 all
   stay green) and adds `hotRemove` as the D7-satisfying, operator-facing remove
   (U-H8 calls `hotRemove`, never `hotApply` remove). The alternative — re-scoping
   `hotApply({kind:'remove'})` to drain+teardown — requires making `hotApply` async
   and re-pinning U-H2 H4, a heavier, less-attractive change. **Confirm the
   co-existence + that the operator-facing remove is `hotRemove` (not `hotApply`
   remove), so the TestWriter locks H1–H6 against `hotRemove`.**
3. **Return shape + drained observability (RESOLVED — confirm):** `hotRemove`
   returns `Promise<HotRemoveResult> = { loaded, delta:{added:[],removed:[name],renamed:[]}, drained: 0 }`
   where `drained` exposes the settled in-flight count at teardown (always 0) for
   node-testability. Confirm this shape (and that the runtime keeps `hotApply`'s
   sync `HotApplyResult` untouched).
4. **Bounded vs. unbounded drain on a never-settling in-flight query / store
   queue (F-H5-3) — the OTHER genuine either/or. (RESOLVED provisionally to
   UNBOUNDED — confirm.)** A-P2-2/D7 say a removed engine is NEVER torn down
   mid-query, so the drain MUST await `inFlight()===0`. Options: (i) UNBOUNDED
   await (correctness-first — `hotRemove` hangs on a genuinely never-settling
   query/queue; F-H5-3 documented this as a pre-existing awareness, NOT a U-H5
   regression); vs. (ii) BOUNDED (a maxWaitMs → fail-loud with a NEW pinned message,
   e.g. `rag-store-remove: drain timed out — <name> still has N in-flight queries`,
   + a new message-template census entry + a new fail-state row). **Ruling
   requested:** confirm UNBOUNDED (the recommended reading, keeping the census at
   "0 new messages" and honoring A-P2-2 absolutely) OR choose BOUNDED (which adds a
   byte-pinned message + a fail-state to this spec's §5.5/§5.7). The TestWriter
   needs this before locking F5/F6.

---

**Bottom line:** U-H4 upgrades the remove path from U-H2's ORPHAN to a REAL
**drain-then-teardown** — a new async controller seam **`hotRemove(name)`** that
reuses the LANDED `hotApply({kind:'remove'})` write+unregister, then drains
(`engine.inFlight()===0`), tears down the removed store + engine (U-H5
primitives), and STRANDS the persistence file + journal byte-identical (D3).
The teardown CALL SITES live in a new module **`src/main/rag-store-remove.ts`**,
so `rag-store-runtime.ts` keeps its N1/A-P2-8 grep pin GREEN (no re-pin).
U-H4 exposes the controller mechanism only — no MCP tool, no IPC channel (D6) —
and the operator trigger + confirmation dialog are U-H8's. **Two §7 items need a
positive Architect ruling before the TestWriter derives the red set: Q1 (the
orchestration home + N1) and Q4 (unbounded vs. bounded drain).**

---

### §7 Architect ruling (2026-09-08, Gate Supervisor / Architect)

All four §7 items **CONFIRMED** as provisionally resolved:

1. **Q1 — OPTION (b).** The drain-then-teardown orchestration lives in a NEW
   module `src/main/rag-store-remove.ts` (`drainAndReleaseEntry`); the runtime
   gains an ADDITIVE async `hotRemove(name): Promise<HotRemoveResult>` that reuses
   the LANDED synchronous `hotApply({kind:'remove'})` (write + default-stability +
   live-map swap; all W-remove-unknown / W-remove-arg / loader-F12 errors propagate,
   live+disk untouched on throw), then `await drainAndReleaseEntry(orphan)`. The
   U-H2 N1 (`tests/unit-h2-runtime-controller.test.ts:1043`) and U-H5 A-P2-8
   (`tests/unit-h5-teardown.test.ts:579`) greps STAY GREEN — hard requirement:
   `rag-store-runtime.ts` source must contain NO literal `teardown(`. **CONFIRMED.**
2. **Q2 — CO-EXIST.** `hotApply({kind:'remove'})` (synchronous, ORPHAN) is
   UNCHANGED (U-H2 H4/F11/N1/N2 stay green); `hotRemove` is the D7-satisfying,
   operator-facing remove. U-H8 calls `hotRemove`, never `hotApply` remove.
   **CONFIRMED.**
3. **Q3 — return shape.** `hotRemove` returns `Promise<HotRemoveResult> =
   { loaded, delta:{added:[],removed:[name],renamed:[]}, drained: 0 }` (drained =
   the settled in-flight count at teardown, always 0); the runtime keeps
   `hotApply`'s synchronous `HotApplyResult` untouched. **CONFIRMED.**
4. **Q4 — UNBOUNDED drain.** `hotRemove` awaits `engine.inFlight()===0`
   (correctness-first, honoring A-P2-2/D7 absolutely; a genuinely never-settling
   query/queue hangs `hotRemove` — F-H5-3's documented pre-existing awareness, NOT
   a BOUNDED/timeout fail-state). Census stays at "0 new messages". **CONFIRMED.**

The TestWriter may derive U-H4's red set (the new `rag-store-remove.ts` module +
`hotRemove` + the drain-unregister semantics + `HotRemoveResult`) against this
ruling; no further arbitration is required before the red run. The operator
trigger + confirmation dialog remain U-H8's (out of U-H4's scope).
