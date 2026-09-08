# Spec — Unit U-H6: Hot-Rename — the DRAIN-THEN-TEARDOWN rename (`hotRename(from, to)`) on the runtime controller

> **STATE (2026-09-08): U-H6 IS A SPEC AWAITING THE §7 ARCHITECT RULING — NOT
> YET LANDED.** This document is the exhaustive behavior contract for U-H6.
> The §7 design questions (below) are RESOLVED PROVISIONALLY and MUST be
> arbitrated CONFIRMED by the Architect BEFORE the TestWriter derives the red set.
> The two genuine either/or decisions are **Q1** (the `hotRename` surface + the
> drain-teardown home — reuse `rag-store-remove.ts` `drainAndReleaseEntry`
> directly vs a NEW rename module) and **Q2** (the D4 no-ids precondition —
> inherit `R-rename-ids-present` from the underlying `hotApply({kind:'rename'})`
> vs re-inspect at the `hotRename` level). Q3/Q4 are confirmations of the
> recommended reading (mirror of the U-H4 Q2/Q3/Q4 ruling). The current landed
> baseline this unit builds on: U-H1 (write module incl. `renameRegistryStore` +
> the `W-rename-default`/`W-rename-target-exists`/`W-rename-unknown-from`
> byte-pinned rejections + the D4 no-persisted-ids doc), U-H2a (runtime
> controller with the `hotApply({kind:'rename'})` REBUILD path + the D4
> `R-rename-ids-present` inspect), U-H2b (closure rewiring), U-H3 (confirmatory),
> U-H5 (teardown primitives + `inFlight()`), U-H4 (hot-remove — the
> drain-then-teardown `hotRemove` + the `rag-store-remove.ts` orchestration
> module). Execution order: U-H1 → U-H2 (a+b) → U-H3 → U-H5 → **U-H4 (LANDED)** →
> **U-H6 (this — hot-rename, NEXT)** → U-H7 (default reassignment) → U-H8
> (operator-UI editor).**

- **Status: SPEC (2026-09-08 — awaiting the §7 Architect ruling; the
  TestWriter runs only AFTER the ruling is arbitrated CONFIRMED)** — the
  registry hot-apply/removal/rename slice, Unit U-H6 (hot-rename, the
  drain-then-teardown upgrade of the rename path). Gate reference:
  `docs/specs/registry-hot-apply-review.md` §2 **D4** (rename semantics —
  restricted to NON-default stores with NO persisted `<name>:`-prefixed ids, no
  id rewrite; the DEFAULT's rename folds into **D5** / U-H7),
  **A-P2-5** ("rename restricted to non-default stores with no persisted
  `<name>:` ids"), **D6** (operator-UI IPC only — NO new MCP tool, NO new IPC
  channel), **D8** (unit decomposition — execution order … U-H4 → U-H6 → U-H7 →
  U-H8), **D7** (mid-flight consistency — the RENAME must, like remove,
  drain-then-teardown so a renamed-away engine is never mid-query; "rename
  reject-at-resolution" is already enforced), **A-P2-8** (the teardown
  primitives landed in U-H5; the U-H4/U-H6/U-H7 units are their callers);
  §5 "Impact on existing contracts" (**SINGLE-WRITER-STORE-PER-STORE** unaffected
  per store; hot-rename never deletes — D3); §6 (live-scenario PARKED). Consumed
  dependencies: `docs/specs/unit-h4-hot-remove.md` §5.2–§5.8 + §7 (the landed
  homolog — **U-H6 mirrors this structure precisely**: the Q1
  orchestration-home resolution = reuse `src/main/rag-store-remove.ts`
  `drainAndReleaseEntry` so the N1/A-P2-8 grep pin stays GREEN; the F1
  name-arg addendum mirrored as the from/to arg guard; the **F-H4-1**
  drain-gate TOCTOU re-entry + the **F-H4-2** default-drift orphan-leak fix
  inherited as contract), `docs/specs/unit-h5-teardown.md` §4/§5 (the
  `teardown()`/`inFlight()` primitives the drain consumes, byte-pinned
  messages + the F-H5-3 never-settling-queue awareness),
  `docs/specs/unit-h2-runtime-controller.md` §4 (§4 **HOT-APPLY-TRIGGER-RESOLVED**,
  **ATOMIC-APPLY**, **REBUILD-ALL-OF-NON-DEFAULT**, **DEFAULT-STABLE-APPLY**,
  **D4-NO-IDS-CALLER-PRECONDITION**) + §5.2 (`RagStoreRuntimeController`),
  §5.4 (`hotApply` steps — the rename write+swap this unit reuses), §5.6 H6
  (the current REBUILD-+ORPHAN rename happy path), §5.7 F9/F10 (the
  W-rename-default + R-rename-ids-present pins), §5.7 (the N1/N2 negative
  pins), `docs/specs/unit-h1-registry-write.md` §5.5 (§5.5 the W-rename-*
  message set incl. **W-rename-unknown-from** /
  **W-rename-target-exists** / **W-rename-default** / **W-rename-arg**
  `{from|to} required`, §5.3.2 the D4 no-ids U-H2-caller-precondition), and
  the source + test pins listed in §5.11.

- **Scope:** the controller/ORCHESTRATION-level rename MECHANISM — a NEW async
  runtime-controller method **`hotRename(from, to): Promise<HotRenameResult>`**
  that REUSES the LANDED synchronous `hotApply({kind:'rename', from, to})` for
  the write + default-stability + the D4 no-ids precondition + the live-map swap
  (which rebuilds the entry under `to` and ORPHANS the old under `from`), then
  drains + tears down the OLD renamed store/engine — the orphan under `from` —
  via the SAME U-H4/U-H5 `drainAndReleaseEntry` helper (D7: a renamed-away
  engine is NEVER left mid-query), strands the OLD `from` persistence file
  byte-identically (D3), and leaves the default + vector boot untouched
  (default-stable + non-default-only, A-P2-5/D5). The drain+teardown CALL SITES
  stay in the LANDED `src/main/rag-store-remove.ts` (`drainAndReleaseEntry`) —
  **reused directly, NOT re-authored** — so `rag-store-runtime.ts` does NOT
  lexically introduce `teardown(`, and the U-H2/U-H5 **N1/A-P2-8 grep pin STAYS
  GREEN** (§7 Q1 — `hotRename` references only `drainAndReleaseEntry(`, whose
  identifier contains no lowercase `teardown`). This unit does NOT add an MCP
  tool / IPC channel (D6 — the operator-UI trigger is **U-H8**), does NOT own
  the DEFAULT's rename (that FOLDS INTO **U-H7** — default reassignment), does
  NOT re-author the `stores:"all"` fan-out (UNTOUCHED, same as U-H4/U-H5), does
  NOT change the vector boot (a renamed non-default store is ALWAYS lexical,
  A6/R10), and does NOT change any page design.

- **TestWriter contract (PENDING — the §7 ruling must precede the red run):**
  every method/signature, return shape, throw pattern, happy-path state, and
  fail-state below is derivable from this spec ALONE (after the §7 ruling). The
  TestWriter writes the U-H6 red set into the SpecWriter-pinned file
  `tests/unit-h6-hot-rename.test.ts` (§5.9) in the house red-first order
  (RCA-1), reporting the failing set BEFORE the Implementer goes green. **The
  red set asserts the NEW orchestration surface does NOT exist on the
  pre-U-H6 code: `RagStoreRuntimeController` has NO `hotRename` (`typeof
  controller.hotRename === 'undefined'`), and the existing
  `hotApply({kind:'rename'})` REBUILDS + ORPHANS — it does NOT drain/teardown,
  so the H1–H6 bodies that assert teardown/strand/unregister each FAIL on the
  absent `hotRename`. The suite LOADS (the reused `rag-store-remove.js` exists
  — U-H4 landed it), so the red is the method-absence marker + the failing
  behavior bodies, NOT a suite-load failure (§5.9).**

---

## 1. What the unit does (the U-H6 slice)

The registry hot-apply slice (review §2 D4) restricts RENAME to NON-default
stores with NO persisted `<name>:`-prefixed ids (no id rewrite; id-migration for
populated non-default stores is a SEPARATE unit; the DEFAULT's rename folds into
U-H7). Today (post-U-H2), the rename path `hotApply({kind:'rename'})` REBUILDS
the non-default entry under the new name (`to`) on its new derived persistence
file and ORPHANS the OLD entry under `from` — a bounded resource hold (the old
store/engine is dropped from the live Map WITHOUT teardown, documented in the
U-H2 §3 "bounded hold"). U-H5 landed the teardown PRIMITIVES
(store/engine/boot `teardown()` + the `engine.inFlight()` drain CHECK, the R-H5
byte-pinned `rag store: torn down` / `retrieval engine: torn down` messages);
U-H4 landed the FIRST caller — the drain-then-teardown `hotRemove` + the
orchestration module `src/main/rag-store-remove.ts` `drainAndReleaseEntry`.
**U-H6 is the rename HOMOLOG of U-H4: it upgrades the rename path from
"rebuild under `to` + drop the orphan under `from`" to "rebuild under `to` +
DRAIN → TEARDOWN the old `from` store/engine → strand the old file."**

The unit's concrete obligations:

1. **A real drain-then-teardown rename (D7/A-P2-2):** renaming a present
   non-default store MUST (a) await the OLD renamed engine's `inFlight()===0`
   (the D7 drain guard — an old `from` engine is NEVER torn down mid-query),
   (b) `store.teardown()` (drain the single-writer queue, revoke mutations; the
   OLD `from` persistence file + journal STRANDED byte-identical — D3), (c)
   `engine.teardown()` (STOPPED — a post-rename `query()` on the old engine
   throws `retrieval engine: torn down`), and (d) leave the NEW `to` entry live
   in the entries Map (rebuilt by the underlying `hotApply` swap under `to`).
   The `from` entry is UNREGISTERED from the live Map + every accessor.
2. **D3 ORPHAN — never delete:** the rename NEVER deletes/touches the old
   `from` store's persistence file + journal (the strand). The write module's
   structural no-REMOVE pin + the drain/teardown's no-delete guarantee (the
   reused `rag-store-remove.ts` imports no `unlink`/`rm`/`rmdir`) hold.
3. **D6/D5/D4 — mechanism only, no operator surface, non-default-only, no id
   rewrite:** U-H6 exposes the CONTROLLER/ORCHESTRATION-level rename
   (node-testable), with NO MCP tool and NO IPC channel. The DEFAULT's rename
   PROPAGATES the write module's **W-rename-default** (folds into U-H7 —
   out of U-H6's scope). A rename whose `from` store carries persisted
   `<from>:`-prefixed ids is DECLINED by the inherited D4 caller precondition
   (**R-rename-ids-present**) BEFORE any write — U-H6 performs NO id rewrite.
4. **Stranded-file semantics for a renamed store:** the write module's rename
   changes ONLY the store's `name` (its `default`/`persistenceFile`/`corpusRoot`
   fields verbatim; an OMITTED `persistenceFile` stays omitted → re-DERIVED
   under `to`). Therefore the NEW `to` entry is rebuilt on its NEW derived file
   (`provident-rag-<to>.json`), while the OLD `from` store's persistence file
   (`provident-rag-<from>.json`) is STRANDED byte-identical (D3) and its data is
   NOT migrated/copied (rename never copies a persistence file). A fresh
   `loadRagStoreRegistry` after the rename shows `to` present on the new derived
   file and `from` absent (D2 persisted==live).
5. **Bounded/never-settling awareness (F-H5-3):** U-H5's F-H5-3 note registered
   that a `store.teardown()` may HANG on a never-settling queued promise; U-H6
   inherits the U-H4 drain awareness — the drain guard is a genuine
   `inFlight()===0` await (UNBOUNDED, Q4), and the drain does NOT assume
   teardown settles a caller-held resource.
6. **Inherited U-H4 fixes (F-H4-1/F-H4-2):** because U-H6 REUSES
   `drainAndReleaseEntry` (which already re-enters the drain gate immediately
   before `engine.teardown()` — the **F-H4-1** drain-gate TOCTOU close) and
   MIRRORS the `hotRemove` catch-and-drain on the default-drift throw path (the
   **F-H4-2** orphan-leak fix), both are inherited contract here (§3a/§5.3/§5.8).

This unit does NOT own: the U-H5 primitives (landed), the DEFAULT's rename
(U-H7), the MCP `stores:"all"` fan-out re-resolution (UNTOUCHED — §5.11), the
operator trigger/confirmation dialog (U-H8), a teardown-aware INCREMENTAL add
(U-H3 is confirmatory/EMPTY; add stays U-H2's coarse rebuild), the remove path
(U-H4), or id-migration for populated non-default stores (a SEPARATE unit, D4).

## 2. Feasibility verdict

**Feasible — grounded entirely in the three LANDED contracts (U-H4's
orchestration module + the U-H5 teardown primitives + the U-H2 runtime
controller's rename write+swap) plus the write module; no engine gap.**

- **The drain + teardown surfaces are LANDED and node-observable, and the
  helper already exists.** The OLD `from` `RagStoreEntry` owns its `store`
  (`createJsonRagStore` with `teardown(): Promise<void>`) + its engine
  (`createRetrieval` with `teardown(): Promise<void>` + `inFlight(): number`),
  exactly as the U-H4 removed entry does. The drain CHECK reads
  `orphan.engine.inFlight()`; the teardown calls `orphan.store.teardown()` +
  `orphan.engine.teardown()`. U-H4 already encoded this as
  `drainAndReleaseEntry(entry)` in `src/main/rag-store-remove.ts` — U-H6 REUSES
  that function verbatim for the renamed (old-`from`) orphan. No new module is
  authored; the teardown CALL SITES remain in `rag-store-remove.ts` (the
  only `rag-store-runtime.ts` mention is the identifier `drainAndReleaseEntry(`,
  which contains no lowercase `teardown` → the N1/A-P2-8 grep pin stays green).
- **The write + swap machinery is LANDED and reusable.** The U-H2 controller's
  `hotApply({kind:'rename', from, to})` already performs the atomic write
  (`writeRegistryMutation` — W-rename-unknown-from / W-rename-target-exists /
  W-rename-default / loader-F-set propagate), the default-stability check, the
  **D4 no-ids caller precondition** (the `R-rename-ids-present` inspect of the
  CURRENT `from` store's node ids, skipped when `from` is the default — HOST-2),
  and the live-map swap that rebuilds the entry under `to` (+ the old `from`
  ORPHANED from the live Map). U-H6's `hotRename` REUSES that write+swap,
  CAPTURING the `from` orphan BEFORE the call to drain/teardown it after. **No
  new write/persist/swap/D4-inspect logic is authored.**
- **The orchestration-home tension is already resolved by U-H4.** The teardown
  CALL SITES are owned by the LANDED `rag-store-remove.ts`; the runtime's
  `hotRename` merely references the helper by name (`drainAndReleaseEntry(`).
  Therefore the U-H2/U-H5 N1/A-P2-8 GREP regex `/\b(teardown|close|destroy)\s*\(/`
  STILL does NOT match `rag-store-runtime.ts` source — the pin stays green with
  NO re-pin (§7 Q1).
- **No default, no vector-boot, no fan-out surface.** Non-default stores are
  ALWAYS lexical (A6/R10), so a renamed-away engine's teardown has no
  vector-boot controller and no non-noop embedder hook. The default store and
  vector boot are never the target of U-H6 (a default rename is
  write-rejected W-rename-default; non-defaults are lexical).

No engine gap — every change is host-side (`src/`), additive to LANDED
controller + primitive contracts, node-testable.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The NEW async controller method `hotRename(from, to)` in `rag-store-runtime.ts` | Project-specific (reuses `hotApply`'s rename write+swap + the U-H4 `drainAndReleaseEntry`; adds the async drain orchestration ON the old-`from` orphan) | Low-medium cost; the first real drain-then-teardown RENAME caller. It makes the rename path ASYNC (a separate method, so the synchronous `hotApply` contract is NOT disrupted — §7 Q2). It reuses the LANDED helper, so NO new orchestration module and ZERO new teardown call sites. |
| The two-rename-path co-existence (`hotApply({kind:'rename'})` REBUILD+ORPHAN vs the new `hotRename`) | Project-specific (a deliberate scope boundary, §7 Q2 — the exact U-H4 Q2 mirror) | Zero cost to the LANDED U-H2 tests (H6/F9/F10/N1/N2 all stay green). The legacy `hotApply` rename remains the coarse rebuild+orphan path; the D7-satisfying, operator-facing rename is `hotRename` (U-H8 calls it). The alternative — re-scoping `hotApply` rename to drain+teardown — requires making `hotApply` async + re-pinning U-H2 H6. §7 Q2. |
| The survivor-rebuild orphan churn on rename | Project-specific (pre-existing U-H2 coarse behavior when >1 non-default store exists) | Out of U-H6's single-pair scope (documented, §5.11). U-H6 drains+tears down ONLY the old-`from` orphan; surviving non-defaults (incl. the rebuilt `to`) are rebuilt + orphaned exactly as U-H2 does today (unchanged behavior). |
| The D4 no-ids precondition duplicate-vs-inherit | Project-specific (the inspect already runs inside `hotApply`; decide whether `hotRename` re-inspects) | Inherit = zero cost (no re-read). Re-inspect at the `hotRename` level would duplicate the store-data read (allowed lexically — store reads, not teardown — but redundant). §7 Q2. |
| The never-settling-queue / never-settling-query hang (F-H5-3) | Project-specific (recorded awareness; U-H5 DID NOT fix it) | The drain guard awaits `inFlight()===0` unboundedly (correctness over liveness — an old renamed engine is never torn down mid-query, A-P2-2). A truly-never-settling query therefore hangs `hotRename`; surfacing (a timeout/fail-loud) vs leaving it unbounded is §7 Q4 (mirror of U-H4 Q4). |

No engine gap — the changes are entirely host-side (`src/`), node-testable, and
consume only LANDED contracts (U-H4's `rag-store-remove.ts` + the U-H5
primitives + the U-H2 controller + the U-H1 write).

### 3a. Adversarial findings (pre-registered — the U-H6 adversarial pass RUNS after the green, per RCA-3; placeholder + pre-registered probes)

The RCA-3 read-only adversarial pass on the U-H6 green runs BEFORE the unit is
reported done; host findings (ids `F-H6-*`) are fixed here + regression-tested;
an engine (provident-ssr) finding, should one ever surface, is a
`docs/defects.md` + `docs/HANDOFF.md` item, NEVER a package patch (AGENTS.md
item 7). **Pre-registered edge probes (the adversarial pass MUST confirm on the
landed code):**

- A `hotRename` whose OLD `from` engine had an in-flight query at call time
  NEVER tears down that engine until the query settles (`inFlight()` reaches 0)
  — the D7/A-P2-2 drain guard; the old `from` store file stays byte-identical
  throughout; the NEW `to` engine is live and serving.
- A second `hotRename` of the SAME (now-renamed-away) `from` name FAILS LOUD with
  the write module's **W-rename-unknown-from** (`rag-store-registry-write: cannot
  rename unknown store '<name>'`) — rename is NOT a silent no-op at the WRITE
  level (the drain/teardown IS idempotent at the primitive level — U-H5 — but
  the write is not).
- `hotRename('<default>', 'x')` is rejected BEFORE any drain by the propagated
  write-module **W-rename-default**; the live Map + disk are untouched and NO
  teardown runs (the D4 inspect is SKIPPED for the default rename — HOST-2 — so
  W-rename-default fires first).
- `hotRename(from, '<existing>')` (target exists) is rejected by the propagated
  **W-rename-target-exists**; live + disk untouched; NO teardown.
- `hotRename(from, to)` where the CURRENT `from` store carries persisted
  `<from>:`-prefixed ids is DECLINED by the inherited **R-rename-ids-present**
  (D4) BEFORE any write; live + disk untouched; NO drain/teardown — U-H6 performs
  NO id rewrite.
- The OLD `from` store's persistence file + journal are BYTE-IDENTICAL after
  `hotRename` (D3 strand); the old engine's `query()` throws `retrieval
  engine: torn down`; the old store's `putNode` throws `rag store: torn down`
  while its reads still resolve; a FRESH store over the stranded `from` file
  still serves the same nodes.
- The runtime module `rag-store-runtime.ts` shows NO `\b(teardown|close|destroy)\s*\(`
  lexical match (N1) and NO `\b(unlink|rm|rmdir)\s*\(` (N2) — the teardown calls
  are all in the (reused) `rag-store-remove.ts`.
- **NO U-H6 change adds an MCP tool / IPC channel / `stores:"all"` fan-out edit /
  page-design change** (D6/A-P2-5/§5.11); NO new module is authored
  (`rag-store-remove.ts` is REUSED, not forked or aliased).

**Adversarial findings (registered AFTER the U-H6 green — to be appended here
by the adversarial pass; each HOST finding fixed + regression-tested in
`tests/unit-h6-hot-rename.test.ts` §3a; an engine finding → defects.md/HANDOFF.md).**
*Placeholder — no findings yet (the pass has not run; the unit is pre-ruling).*

### 3b. Proposal-review findings folded in

From `docs/specs/registry-hot-apply-review.md`:
- **D4 (binding):** rename semantics = restricted to NON-default stores with NO
  persisted `<name>:`-prefixed ids (no id rewrite); id-migration for populated
  non-default stores is a SEPARATE unit; the DEFAULT's rename folds into **D5**
  (U-H7). Pinned §1/§4/§5.
- **A-P2-5 (bound):** "rename restricted to non-default stores with no persisted
  `<name>:` ids." Pinned §1/§4/§5.
- **D6 (bound):** operator-UI IPC only, NO new MCP tool, NO new IPC channel.
  U-H6 adds neither (§5.8).
- **D7 (bound):** mid-flight consistency — "rename reject-at-resolution" is
  already enforced (D4 + the write-module guards); the D7 DRAIN-THEN-TEARDOWN
  requirement that U-H4 applied to remove is applied here to RENAME: a
  renamed-away engine is never left mid-query (A-P2-2). Pinned §1/§4.
- **A-P2-8 (bound):** the teardown primitives landed in U-H5 with NO caller;
  U-H4 (remove) + U-H6 (rename) are the callers. The runtime module keeps its
  N1/A-P2-8 grep pin (§7 Q1 — satisfied by the U-H4-designed reuse).
- **D8 (bound):** unit decomposition — execution order … U-H4 → U-H6 → U-H7 →
  U-H8. U-H7 (default reassignment) is split out; the DEFAULT's rename folds
  there.

## 4. Design decisions pinned by this spec

> **§7 note:** all decisions below are PROVISIONALLY resolved; §7 Q1–Q4 must be
> arbitrated CONFIRMED before the TestWriter derives the red set. The two
> genuine either/or items are Q1 (the `hotRename` surface + the
> drain-teardown home + N1) and Q2 (the D4 precondition inheritance).

- **RENAME-ORCHESTRATION-HOME (new — §7 Q1, resolve to REUSE the U-H4 module
  + a controller method, NOT a new module):** the drain-then-teardown
  orchestration for a renamed (old-`from`) orphan lives HALF in the LANDED
  `src/main/rag-store-remove.ts` `drainAndReleaseEntry` (REUSED verbatim — the
  ONLY owner of `store.teardown()` / `engine.teardown()` / `engine.inFlight()`
  CALL SITES) and HALF in a NEW async controller method `hotRename(from, to)` on
  `RagStoreRuntimeController` in `rag-store-runtime.ts` (which performs the
  write + rebuild-and-unregister via the existing `hotApply({kind:'rename'})`,
  then AWAITS the module's drain helper). This keeps `hotApply` SYNCHRONOUS
  (unchanged contract), makes the RENAME ASYNC (the operator seam — U-H8 calls
  it), NO NEW module is authored, and `rag-store-runtime.ts` stays free of a
  LEXICAL `teardown(` — so the U-H2/U-H5 **N1/A-P2-8 grep pin STAYS GREEN**
  (`hotRename` references only `drainAndReleaseEntry(`, whose identifier
  contains no lowercase `teardown`).
- **HOT-RENAME-METHOD (new — §7 Q2/Q3, resolve to an ADDITIVE async method; the
  legacy `hotApply({kind:'rename'})` co-exists):** the runtime controller gains
  **`hotRename(from: string, to: string): Promise<HotRenameResult>`**. It REUSES
  the LANDED `hotApply({kind:'rename', from, to})` for the write +
  default-stability + the D4 no-ids precondition + the live-map swap (so all
  W-rename-* / the inherited R-rename-ids-present / loader-F-set / native-fs
  errors propagate unchanged and D2 is preserved), CAPTURES the old-`from`
  `RagStoreEntry` BEFORE the `hotApply` call (the orphan to drain — the entry
  that will be swapped away under `to`), and after the swap
  `await drainAndReleaseEntry({ store: orphan.store, engine: orphan.engine })`.
  `hotApply({kind:'rename'})` itself is UNCHANGED (the U-H2 H6 rebuild+orphan
  test + F9/F10 + N1/N2 stay green); the D7-satisfying, operator-facing rename is
  `hotRename` (the co-existing-two-path boundary is recorded in §5.11 + §7 Q2).
- **D4-PRECONDITION-INHERITANCE (new — §7 Q2, resolve to INHERIT):** `hotRename`
  does NOT re-inspect the `from` store's ids; it INHERITS the **R-rename-ids-present**
  rejection from the underlying `hotApply({kind:'rename'})` (the 
  D4-NO-IDS-CALLER-PRECONDITION inspect already runs FIRST — before
  `writeRegistryMutation` — so a populated `<from>:` rename throws before any
  write, disk + live untouched, and NO drain/teardown since the swap never ran).
  Re-inspecting at the `hotRename` level would duplicate the store-data read and
  is unnecessary. **HARD REQUIREMENT:** the D4 inspect + `hotRename` must not
  introduce a `teardown(` literal into `rag-store-runtime.ts` (the inspect is a
  store-`listNodes()` read — lexically permitted — but the runtime must stay
  N1-grep-clean). Confirmed by design: `hotRename` inherits the inspect from
  `hotApply` (which is already N1-clean).
- **DRAIN-ORDER (new — D7/A-P2-2):** the drain+teardown ORDER for the old-`from`
  orphan is pinned: (1) CAPTURE the orphan (the `from` entry) BEFORE the write;
  (2) write + rebuild-and-unregister (the `hotApply` swap) — the old-`from`
  engine is no longer routable from the live Map the moment the swap completes
  (the entry is swapped away under `to`), so no NEW query can reach it; (3) DRAIN
  — await `orphan.engine.inFlight() === 0` (never proceed to teardown while a
  query is mid-flight — A-P2-2); (4) `await orphan.store.teardown()` (drain the
  single-writer queue, revoke mutations; the old `from` file + journal STRANDED
  byte-identical — D3); (5) `await orphan.engine.teardown()` (STOPPED);
  (6) return `{ loaded, delta, drained: 0 }`. Store-then-engine is pinned
  deterministically (the engine does not mutate the store; both are drained to
  idle; §5.4). The F-H4-1 re-entry (the second `inFlight()===0` gate immediately
  before `engine.teardown()`) is INHERITED from the reused helper.
- **UNREGISTER-EVERYWHERE (new):** after `hotRename`, the OLD `from` store is gone
  from EVERY runtime accessor: `getDirectory().entries.get('from')` →
  `undefined` (replaced by the rebuilt `to` entry), `statusOf('from')` →
  **R-status-unknown**, `currentStores()` (= `_currentRegistry.stores`, advanced
  to the fresh `loaded`) lists `to` and NOT `from`, and the default-store
  accessors are untouched.
- **DEFAULT-RENAME-IMPOSSIBLE (new):** `hotRename('<default>', to)` FAILS LOUD
  via the propagated write-module **W-rename-default**
  (`rag-store-registry-write: the default store cannot be renamed (default
  reassignment is a separate unit)`) BEFORE any drain — the write module's
  semantic guard rejects a default rename (and the D4 inspect is SKIPPED for the
  default rename — HOST-2 — so W-rename-default fires first). The default's
  rename FOLDS INTO **U-H7** (D5) — OUT of U-H6's scope. Every reachable
  drain+teardown is therefore NON-default-only (A-P2-5).
- **NO-OP-ON-ABSENT (clarified — new):** rename is NOT a silent no-op at the
  WRITE level. A `hotRename` of an unknown `from` FAILS LOUD with the write
  module's **W-rename-unknown-from**; a `to` that already exists FAILS LOUD with
  **W-rename-target-exists** (live + disk untouched, NO drain/teardown in both).
  The IDEMPOTENCY lives at the DRAIN/teardown level (a torn-down store's/engine's
  `teardown()` is a safe immediate no-op — U-H5), not at the rename-write level.
- **D3-ORPHAN-STRAND (new):** the drain+teardown NEVER deletes/touches the old
  `from` store's persistence file + journal (U-H5 primitives are no-delete by
  contract, and the reused `rag-store-remove.ts` imports NO
  `unlink`/`rm`/`rmdir`/`remove`). The old file STRANDS byte-identical after
  every `hotRename` path; the NEW `to` entry is rebuilt on its NEW derived file.
- **D6/D5/A-P2-5-SCOPE-BOUNDARY (new):** U-H6 lands the CONTROLLER-level rename
  MECHANISM (`hotRename` reusing the drain helper), node-testable, with NO MCP
  tool and NO IPC channel. The operator trigger + confirmation are U-H8's row
  (the operator-UI editor calls `hotRename`). The DEFAULT's rename + the
  vector-boot re-warm handoff are U-H7's row. §5.8/§5.11.
- **Consumed decision rows (implemented by U-H2/U-H4/U-H5 or inherited,
  cite-only):** **HOT-APPLY-TRIGGER-RESOLVED** (`hotApply` is a programmatic
  synchronous seam; U-H6 adds the async `hotRename` beside it),
  **ATOMIC-APPLY** + **DEFAULT-STABLE-APPLY** + **REBUILD-ALL-OF-NON-DEFAULT**
  (U-H2's write+swap `hotRename` reuses) + **D4-NO-IDS-CALLER-PRECONDITION**
  (the `R-rename-ids-present` inspect `hotRename` inherits),
  **ENGINE-PER-STORE** (each entry owns the engine the drain tears down),
  **SINGLE-WRITER-STORE-PER-STORE** (`store.teardown()` drains ITS OWN queue),
  **D3 hot-remove ORPHAN** (never delete — applied to the rename strand),
  **TEARDOWN-ASYNC** + **STORE-TEARDOWN-REVOKES-MUTATION-ONLY** +
  **ENGINE-TEARDOWN-STOP-SERVING** + **DRAIN-SEAM-INFLIGHT** + **NO-FAIL** (the
  U-H5 primitives U-H6 consumes, `docs/specs/unit-h5-teardown.md` §4),
  **HOT-REMOVE-DRAIN-THEN-TEARDOWN** (U-H4's ruling — the remove homolog this
  rename mirrors, `docs/specs/unit-h4-hot-remove.md` §7).

## 5. The exhaustive contract

### 5.1 The runtime controller surface changes (exact TS shapes)

U-H6 ADDS one method + one result type to the U-H4 controller interface
(`src/main/rag-store-runtime.ts`); it does NOT change `hotApply`/`HotApplyResult`,
`hotRemove`/`HotRemoveResult`, or any of the existing 11 members.

```ts
// src/main/rag-store-runtime.ts — Unit U-H6 additions (ON TOP of the U-H2/U-H4
// shapes). The `drainAndReleaseEntry` import was ALREADY added by U-H4; U-H6
// REUSES it (NO new import). NOTE: the identifier `drainAndReleaseEntry`
// contains NO lowercase `teardown`, preserving the N1 grep pin (§5.8).

export interface RagStoreRuntimeController {
  // ... (all EXISTING U-H2 + U-H4 members unchanged: getDirectory,
  //      getDefaultEntry, getDefaultName, getDefaultStore, getDefaultEngine,
  //      getVectorBoot, getRegistryPath, currentStores, statusOf, hotApply,
  //      hotRemove) ...

  /** RELEASE U-H6 — the DRAIN-THEN-TEARDOWN rename: write + rebuild-under-`to`
   *  + unregister-the-old-`from` (via the existing `hotApply({kind:'rename'})`),
   *  then drain the OLD renamed engine (`inFlight()===0`), tear the old-`from`
   *  store + engine down (U-H5 primitives, owned by `rag-store-remove.js`), and
   *  STRAND the old `from` persistence file + journal (D3) while the NEW `to`
   *  entry becomes live. NON-DEFAULT-only (a default rename propagates
   *  `W-rename-default` — folds into U-H7); inherits the D4 `R-rename-ids-present`
   *  rejection from `hotApply`. ASYNC — the operator-facing rename seam U-H8
   *  calls. Throws propagate (W-rename-unknown-from / W-rename-target-exists /
   *  W-rename-default / R-rename-ids-present / loader F-set / native fs); the
   *  live Map + disk are untouched on a throw. */
  hotRename(from: string, to: string): Promise<HotRenameResult>
}

/** The successful drain-then-teardown rename result. `delta.renamed` is exactly
 *  `[{ from, to }]`; `drained` is the settled in-flight count at teardown of the
 *  OLD `from` engine — ALWAYS 0 (the drain gate never tears down mid-query,
 *  A-P2-2). */
export interface HotRenameResult {
  /** The FRESH `loaded` registry just written + re-read by the U-H2 write path. */
  loaded: LoadedRagStoreRegistry
  /** `{ added: [], removed: [], renamed: [{ from, to }] }` — the applied delta. */
  delta: RegistryDelta
  /** The settled in-flight query count on the OLD `from` engine at teardown —
   *  0 (the drain guarantee). */
  drained: number
}
```

### 5.2 The reused drain+teardown module (`src/main/rag-store-remove.ts` — REUSED VERBATIM, NOT RE-AUTHORED)

U-H6 does NOT create or edit `rag-store-remove.ts`. It REUSES the LANDED
`drainAndReleaseEntry` (and its `RemovedEntry` / `RemovedEntryReleaseResult`
types) verbatim as the drain-teardown home for the renamed old-`from` orphan:

```ts
// src/main/rag-store-remove.ts — Unit U-H4 (LANDED, REUSED BY U-H6 VERBATIM):
// THE drain-then-teardown caller of the U-H5 primitives for a RELEASED store
// (removed under U-H4; RENAMED-away under U-H6). The ONLY module that lexically
// calls `teardown(`/`inFlight()` for a released entry. NO Electron, NO IPC, NO
// MCP (D6), NO `unlink`/`rm`/`rmdir`/`remove` import (D3).

export interface RemovedEntry {
  store: RagStore
  engine: RetrievalEngine
}
export interface RemovedEntryReleaseResult {
  drained: number   // the settled in-flight count at teardown — ALWAYS 0
}
/** U-H6 REUSES this for the RENAMED (old-`from`) orphan — it only requires an
 *  { store, engine } pair captured from the live Map BEFORE the rename swap. */
export async function drainAndReleaseEntry(
  entry: RemovedEntry,
): Promise<RemovedEntryReleaseResult>
```

The LANDED behavior (§5.4 of the U-H4 spec, inherited verbatim) is: (1) UNBOUNDED
drain `while (engine.inFlight() !== 0) sleep(1)`; (2) `await store.teardown()`;
(3) **F-H4-1 re-entry** — re-drain `while (engine.inFlight() !== 0) sleep(1)`
immediately before `engine.teardown()` (closes the drain-gate TOCTOU so a query
entered during the store-teardown yield is never left in flight when the
sync STOPPED marking runs); (4) `await engine.teardown()`; (5) resolve
`{ drained: 0 }`. Store-then-engine pinned; D3 no-delete; NO-FAIL primitives.

### 5.3 `hotRename` — exact behavior (pinned)

`hotRename(from, to)` on the runtime controller:

1. **Top-of-method arg guard (the F1/F-H4-3 mirror for the rename):**
   - `if (typeof from !== 'string' || from.length === 0) throw new
     Error('rag-store-registry-write: from required')` — **W-rename-arg** for
     `from`, LOCALLY-THROWN byte-equal to the LANDED W-rename-arg template (the
     raw `hotApply` rename path, like the remove path, String()-coerces a bad
     arg, so it cannot produce the arg message — the guard synthesizes it,
     byte-equal, 0 new templates; §5.5/§5.7 F1).
   - `if (typeof to !== 'string' || to.length === 0) throw new
     Error('rag-store-registry-write: to required')` — **W-rename-arg** for
     `to`, LOCALLY-THROWN, same convention (§5.7 F1b).
   - A whitespace-only `from`/`to` (`'   '`) is a NON-EMPTY string, passes the
     guard, and routes through `hotApply` → the write module's rename branch (a
     genuinely-unknown/whitespace `from` → **W-rename-unknown-from** for the
     literal whitespace name; a whitespace `to` onto a present name →
     **W-rename-target-exists**), consistent with the U-H4 F-H4-5 "unknown
     non-empty string" contract (§5.7).
2. **Capture the orphan BEFORE the write:** `const orphan = directory.entries.get(from)`.
   This is the pre-rename live entry whose store + engine U-H6 drains/tears down
   (the entry the swap will remove under `from` and rebuild under `to`).
3. **Write + rebuild + unregister (the existing synchronous `hotApply`):** call
   `hotApply({ kind: 'rename', from, to })`. This runs the FULL U-H2 rename path:
   guard → **D4 no-ids caller precondition** (the `R-rename-ids-present` inspect
   of the CURRENT `from` store's ids, SKIPPED when `from === directory.defaultName`
   — HOST-2) → `writeRegistryMutation` (the ONLY disk touch; W-rename-unknown-from
   / W-rename-target-exists / W-rename-default / loader-F-set / native-fs errors
   PROPAGATE unchanged, live + disk untouched on a throw) → default-stability
   check (R-default-changed / R-default-mismatch2 drift sync retained, D2) →
   rebuild the non-default entries (the `from` entry dropped, a `to` entry
   constructed under the new derived file), advance `_currentRegistry = loaded`.
   The old-`from` engine is no longer routable from the live Map the moment this
   swap completes. **A non-drift throw at this step returns EARLY — the captured
   orphan is NEVER drained/teared down, and the live Map + disk are untouched.**
4. **Defensive absent-entry skip (unreachable per D2):** if `orphan` is
   `undefined` despite a successful write (the D2 "persisted-and-live never
   diverge" invariant is violated — an implementation-bug case only), SKIP the
   drain/teardown and return `{ loaded, delta, drained: 0 }`. Not a documented
   fail-state; a defensive no-op guard, recorded here so it is never asserted as
   reachable behavior (§5.7 F8 / §5.3 step 4 mirror).
5. **Drain + teardown the orphan:** `await drainAndReleaseEntry({ store: orphan.store, engine: orphan.engine })`
   (see §5.4). The old-`from` store + engine are torn down; the old `from` file
   + journal strand; the NEW `to` entry stays live.
6. **Return `{ loaded, delta, drained: 0 }`** — `delta.renamed === [{ from, to }]`.

### 5.4 `hotRename`'s drain via `drainAndReleaseEntry` — exact behavior (pinned)

U-H6 inherits §5.4 of the U-H4 spec verbatim (the reused helper). Elaborations a
TestWriter derives for the RENAME use:

- **The drain gate (A-P2-2):** the function does NOT call the old-`from` store's
  `teardown()` / engine's `teardown()` while `orphan.engine.inFlight() > 0`. It
  awaits the count to reach `0` (an in-flight `query()` entered on the OLD `from`
  engine before/at call time that settles — resolve OR reject — decrements per
  U-H5; a mid-query teardown completes the query on the OLD embedder per U-H5
  F8, THEN the teardown runs). Because `await store.teardown()` YIELDS to the
  event loop, the gate is RE-ENTERED (a second `while (inFlight() !== 0)
  sleep(1)`) immediately before `engine.teardown()` — **F-H4-1** (inherited)
  closes the drain-gate TOCTOU so a query entered DURING the store-teardown
  yield can never leave the old engine in flight when the (synchronous) STOPPED
  marking runs.
- **Drained value:** the returned `drained` is the settled `inFlight()` count on
  the old `from` engine at teardown time — ALWAYS `0`. Deterministic,
  node-testable.
- **Order:** `store.teardown()` THEN `engine.teardown()` (pinned; the engine
  does not mutate the store; the old `from` store's queue is drained + mutations
  revoked first, then the old engine is marked STOPPED).
- **D3 strand:** NEITHER primitive touches the old `from` persistence file +
  journal; `rag-store-remove.ts` imports NO `unlink`/`rm`/`rmdir`/`remove`. The
  old `from` file is byte-identical before and after every `hotRename` path; the
  NEW `to` entry is rebuilt on its NEW derived file.
- **NO-FAIL inherited:** both `teardown()` calls are NO-FAIL (U-H5 contract). If
  the old `from` store's teardown HANGS on a never-settling queued promise
  (F-H5-3), the `await` blocks — surfaced in §7 Q4; the drain gate does NOT
  assume teardown settles a caller-held resource.

### 5.5 The byte-pinned error set + the message census

U-H6 introduces **NO new byte-pinned message template**. All errors it surfaces
come from the LANDED write/loader/runtime sets (§5.3 step 1/3) — the only errors
the drain/teardown can produce are the POST-teardown serving throws of the LANDED
U-H5 primitives (NOT thrown by `hotRename`/`drainAndReleaseEntry` themselves —
observed by any later caller of a torn-down old-`from` store/engine).

| # | Trigger (on `hotRename(from, to)`) | Outcome | Exact thrown message (PROPAGATED / LOCALLY-THROWN — §5.3) |
| --- | --- | --- | --- |
| R-rename-arg-from | `from` not a non-empty string (`''`, null, non-string) | fail-loud; live + disk untouched; NO teardown | `rag-store-registry-write: from required` (**W-rename-arg**, LOCALLY-THROWN by the top-method guard, byte-equal to W-rename-arg — §5.7 F1) |
| R-rename-arg-to | `to` not a non-empty string (`''`, null, non-string) | fail-loud; live + disk untouched; NO teardown | `rag-store-registry-write: to required` (**W-rename-arg**, LOCALLY-THROWN by the top-method guard, byte-equal to W-rename-arg — §5.7 F1b) |
| R-rename-unknown | `from` not present (or already renamed-away) | fail-loud; live + disk untouched; NO teardown | `rag-store-registry-write: cannot rename unknown store '<from>'` (**W-rename-unknown-from**, write module) |
| R-rename-target | `to` already present | fail-loud; live + disk untouched; NO teardown | `rag-store-registry-write: store '<from>' cannot be renamed to '<to>': '<to>' already exists` (**W-rename-target-exists**, write module) |
| R-rename-default | `from` === the default store (the DEFAULT's rename — folds into U-H7/D5) | fail-loud; live + disk untouched; NO teardown | `rag-store-registry-write: the default store cannot be renamed (default reassignment is a separate unit)` (**W-rename-default**, write module) |
| R-rename-ids-present | the CURRENT `from` store has persisted `<from>:`-prefixed ids (D4 — INHERITED from `hotApply`) | fail-loud; DISK NOT WRITTEN; live + disk untouched; NO drain/teardown (the swap never ran — no id rewrite) | `rag-store-runtime: cannot rename store '<from>' — it has persisted '<from>:'-prefixed ids` (**R-rename-ids-present**, runtime — inherited from `hotApply`) |
| R-rename-fs | a native fs failure on persist | fail-loud Error (message native); live + disk untouched; NO teardown | propagated |
| (defensive) | `orphan === undefined` after a SUCCESSFUL write | no throw — drain/teardown SKIPPED (D2-invariant bug guard, §5.3 step 4) | — (not asserted as reachable) |

**Census (U-H6 additions):**
- New modules/files created (in `src/`): **0** — the drain-teardown module
  `rag-store-remove.ts` is REUSED (U-H4 landed it). [+1 SpecWriter-pinned test
  file `tests/unit-h6-hot-rename.test.ts`.]
- New controller members: **1** — `hotRename(from: string, to: string):
  Promise<HotRenameResult>`; 1 new result type `HotRenameResult`. The controller
  goes from 11 to **12** members. The reused helper's types (`RemovedEntry`,
  `RemovedEntryReleaseResult`) are unchanged.
- New `teardown(`/`inFlight()` CALL SITES: **0** (all such call sites remain the
  LANDED U-H4 4, inside `rag-store-remove.ts`; `rag-store-runtime.ts` references
  only `drainAndReleaseEntry(`, whose identifier contains no lowercase
  `teardown` — the N1 pin).
- New byte-pinned message templates: **0** (all errors propagate from LANDED
  sets; the locally-thrown arg guards reuse the W-rename-arg template).
- New MCP tools / IPC channels / `stores:"all"` fan-out changes: **0** (D6/A-P2-5/§5.11).
- New `console.*` lines: **0** (the runtime's existing 0-log census holds).
- Files this unit EDITS: `src/main/rag-store-runtime.ts` (adds `hotRename` +
  `HotRenameResult`; the `drainAndReleaseEntry` import already exists from U-H4).
- Files this unit ADDS: none (`src/`); `tests/unit-h6-hot-rename.test.ts`.
- **UNTOUCHED:** `rag-store-remove.ts` (REUSED, not edited), `main.ts`,
  `mcp-server.ts`, `rag-store.ts`, `retrieval.ts`, `vector-boot.ts`,
  `adjacency.ts`, `rag-store-registry.ts`, `rag-store-registry-write.ts`,
  `rag-store-directory.ts`, `preload.ts`, `shared/types.ts`, `security.ts`,
  `sidebar-panes.ts`.

### 5.6 U-H6 happy-path states (TestWriter red set — valid paths)

`<d>` is an absolute temp dir; a controller is constructed over a boot directory
from a 2-or-3-store registry (`main` default, `research-2026-09` non-default
[= `FROM`], optionally `research-2026-10`), each on a derived persistence file,
per the U-H4/U-H2 fixture. `<idle>` = no in-flight query on the old `from` engine.
The `from` store is SEEDED with a NON-`<from>:`-prefixed node id (so its old file
exists for the strand byte-compare AND the D4 inspect passes).

1. **H1 — rename a present, IDLE, CLEAN non-default → drained old + rebuilt new +
   old file stranded + default untouched (D7/D3/D4):** `await hotRename('research-2026-09', 'research-2026-10')`
   (the `from` store has NO `research-2026-09:`-prefixed ids) → resolves
   `{ loaded, delta:{added:[], removed:[], renamed:[{from:'research-2026-09', to:'research-2026-10'}]}, drained:0 }`;
   `getDirectory().entries.get('research-2026-09')` is `undefined` and
   `getDirectory().entries.get('research-2026-10')` is a FRESH entry (a REBUILT
   store on the NEW derived file `provident-rag-research-2026-10.json`);
   `currentStores()` lists `research-2026-10` and NOT `research-2026-09`;
   `statusOf('research-2026-09')` THROWS **R-status-unknown**; the OLD
   `research-2026-09` store's persistence file `provident-rag-research-2026-09.json`
   is **BYTE-IDENTICAL** before/after (never deleted/touched — D3 strand); the
   DEFAULT entry (`main`) object identity is UNCHANGED (`getDefaultStore()`
   returns the SAME object).
2. **H2 — the old renamed engine + store are GENUINELY TORN DOWN:** after H1, a
   `query()` on the OLD engine (captured pre-rename) throws `retrieval
   engine: torn down`; a `putNode` on the OLD store throws `rag store: torn
   down`; a `getNode` on the OLD store still RESOLVES (read-safe teardown); the
   OLD file still loads a store with the same nodes (stranded + intact); the NEW
   `to` entry's engine is LIVE (`query()` resolves).
3. **H3 — rename with an in-flight query on the OLD engine DRAINS first
   (A-P2-2):** fire a `query()` on the `from` engine (do not await; keep it
   pending), call `hotRename('research-2026-09','research-2026-10')` — while the
   query is pending, assert (via the captured reference) the OLD engine is NOT
   yet torn down (`inFlight()` is still ≥1); after the gated query SETTLES, the
   drain proceeds: the OLD engine becomes torn down, the OLD file is
   byte-identical, and `hotRename` resolves `{ drained: 0 }`. The old renamed
   engine is NEVER torn down while `inFlight() > 0`.
4. **H4 — rename when a second non-default survives (multi-store registry):**
   from a 3-store registry (`main` + `research-2026-09` + `research-2026-10`),
   `hotRename('research-2026-09', 'research-2026-11')` unregisters ONLY
   `research-2026-09` (drained+teardown) and rebuilds `research-2026-11`;
   `research-2026-10` remains (rebuilt fresh per the U-H2 coarse path — its
   object identity may change; the documented survivor-rebuild-orphan churn,
   §5.11); the default is untouched.
5. **H5 — the write is re-readable (D2):** after `hotRename`, a fresh
   `loadRagStoreRegistry({ path: registryPath })` shows `research-2026-10`
   present on the new derived file and `research-2026-09` gone, with
   `implicit:false`/`corrupt:false` — persisted == live.
6. **H6 — a torn-down old store/engine `teardown()` is a safe NO-OP
   (idempotency at the primitive level):** calling `store.teardown()` /
   `engine.teardown()` again on the OLD `from` pair (post-`hotRename`) resolves
   immediately — the RENAME is idempotent at the drain/teardown layer even
   though the WRITE is not (W-rename-unknown-from for a repeat `from`, §5.7 F2).

### 5.7 U-H6 fail-states (TestWriter red set — documented fail-states)

Outcomes: **fail-loud** = the propagated `Error`; **live-untouched** =
`getDirectory().entries` deep-equal to before + the registry file byte-identical
+ NO drain/teardown ran (the drain/teardown is skipped when the write throws —
§5.3 step 3 EARLY return; the D4 rejection is skipped because the swap never ran).

| # | Trigger | Outcome | Exact result |
| --- | --- | --- | --- |
| F1 | `hotRename(null,'b')` / `hotRename(5,'b')` / `hotRename('','b')` | fail-loud | **W-rename-arg** `rag-store-registry-write: from required` (LOCALLY-THROWN by the top-method guard, byte-equal to W-rename-arg — §5.3 step 1); live-untouched; NO teardown |
| F1b | `hotRename('a', null)` / `hotRename('a', 5)` / `hotRename('a', '')` | fail-loud | **W-rename-arg** `rag-store-registry-write: to required` (LOCALLY-THROWN, byte-equal to W-rename-arg); live-untouched; NO teardown |
| F2 | `hotRename('nope','b')` (unknown `from` / already renamed-away) | fail-loud | **W-rename-unknown-from** `rag-store-registry-write: cannot rename unknown store 'nope'` (PROPAGATES); live-untouched; NO teardown — the old entry is NOT drained (its swap never ran). A SECOND `hotRename(FROM, to)` after a successful first rename FAILS LOUD with W-rename-unknown-from for `FROM`. |
| F3 | `hotRename('a','research-2026-10')` where `research-2026-10` already exists | fail-loud | **W-rename-target-exists** `rag-store-registry-write: store 'a' cannot be renamed to 'research-2026-10': 'research-2026-10' already exists` (PROPAGATES); live-untouched; NO teardown |
| F4 | `hotRename('main','x')` (the DEFAULT — folds into U-H7/D5) | fail-loud | the write module's **W-rename-default** `rag-store-registry-write: the default store cannot be renamed (default reassignment is a separate unit)` (PROPAGATES; NOT `R-rename-ids-present` even for a POPULATED default rename — HOST-2 skips the D4 inspect); live-untouched; NO teardown |
| F5 | `hotRename('research-2026-09','z')` where the CURRENT `from` store carries persisted `research-2026-09:`-prefixed ids (D4 — INHERITED) | fail-loud | **R-rename-ids-present** `rag-store-runtime: cannot rename store 'research-2026-09' — it has persisted 'research-2026-09:'-prefixed ids` (inherited from `hotApply`); DISK NOT WRITTEN (byte-compare — unchanged); live-untouched (the `from` entry still present under `from`, no `z` entry); NO drain/teardown (the swap never ran) — NO id rewrite |
| F6 | `hotRename` whose persist hits a native fs failure (ENOSPC/EACCES/EROFS/EISDIR) | fail-loud | the native fs Error PROPAGATES; live-untouched; the ORIGINAL file intact; NO teardown |
| F7 | the DEFAULT-DRIFT throw path (F15/F16) during `hotRename` — an EXTERNAL mid-run registry default edit (the write persists + `syncLiveToLoaded(loaded, true)` drops `from`/rebuilds `to` before the throw) | fail-loud, then the old-`from` orphan is STILL drained+teardown | the byte-pinned **R-default-changed** / **R-default-mismatch2** propagates, BUT if the swap dropped `from` from the live map (`orphan !== undefined && !directory.entries.has('from')`), `hotRename` STILL `await drainAndReleaseEntry(orphan)` before rethrowing (the **F-H4-2** mirror — NO orphan leak of the renamed-away engine); the OLD file strands byte-identical; the `to` entry is live from the drift sync |
| F8 | the defensive `orphan === undefined` after a SUCCESSFUL write (D2-invariant bug — unreachable by contract) | no throw, no teardown | the drain is SKIPPED; `{ loaded, delta, drained: 0 }` returned — an implementation-bug guard, NOT a documented reachable fail-state (§5.3 step 4) |
| F7h | the old `from` store's `teardown()` HANGS on a never-settling queued promise (F-H5-3 awareness) | does NOT settle | `drainAndReleaseEntry`'s `await store.teardown()` blocks — surfaced (§7 Q4); the drain gate does NOT proceed past a torn-down/hung store; NOT a U-H5 regression (recorded U-H5 F-H5-3) |
| F8h | the drain awaits a NEVER-settling in-flight query on the OLD engine | does NOT settle | the drain gate blocks on `inFlight() === 0` (A-P2-2 correctness) — a never-settling query hangs `hotRename`; whether to surface via a bound is §7 Q4 |

### 5.8 Negative pins (D6 / D8 / A-P2-5 / A-P2-8 / D3 / D4 / D5 + the N1 re-pin status)

- **A-P2-8 / N1 (the runtime module — STAYS GREEN, NOT RELAXED):** the LANDED
  `tests/unit-h2-runtime-controller.test.ts` **N1**
  (`expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)` on the runtime
  source) and the U-H5 `tests/unit-h5-teardown.test.ts` A-P2-8 block **REMAIN
  GREEN and are NOT re-pinned.** U-H6 keeps the teardown CALLS physically in the
  LANDED `src/main/rag-store-remove.ts`; the runtime's `hotRename` references
  only `drainAndReleaseEntry(` (an identifier with NO lowercase `teardown`). The
  regex `\b(teardown|close|destroy)\s*\(` STILL does NOT match
  `rag-store-runtime.ts` source. **HARD REQUIREMENT on the Implementer (a
  TestWriter adversarial probe WILL check the raw source):** no comment,
  docstring, or identifier in `rag-store-runtime.ts` may contain the literal
  `teardown(` (a bare mention like "teardown orchestration" is fine — it lacks
  the paren — but `teardown(` and the identifier `...teardown(` are FORBIDDEN in
  that file). The D4 inspect that `hotRename` inherits lives inside the existing
  N1-clean `hotApply` (a `listNodes()` read, no teardown literal).
- **N2 (the runtime module — STAYS GREEN):** `rag-store-runtime.ts` keeps its
  no-MCP/no-IPC (`\bMUTATING_METHODS\b`/`\bALL_TOOLS\b`/`\bRpcMethod\b`/`\bIPC_[A-Z_]+\b`),
  no-delete (`\b(unlink|rm|rmdir|remove)\s*\(` — `hotRename`'s capital-R
  "Rename" + the lowercase regex do NOT match), and 0-console pins. The reused
  `rag-store-remove.ts` keeps the SAME no-delete / no-IPC / no-MCP negative pins
  (§5.5 census).
- **D6 / A-P2-5 — no MCP tool, no IPC channel, NON-DEFAULT-only:** U-H6 adds NO
  tool name to `ALL_TOOLS` (stays 41), NO `RpcMethod`/`MUTATING_METHODS` member,
  NO IPC constant. The rename is restricted to NON-default stores — the only
  renames that REACH the drain+teardown are non-default (a default rename
  propagates `W-rename-default`, folds into U-H7). The operator-facing trigger +
  confirmation dialog are **U-H8**.
- **D3 — teardown NEVER deletes / the OLD `from` file STRANDS:** the drain/
  teardown paths (the reused `rag-store-remove.ts`) import NO
  `unlink`/`rm`/`rmdir`/`truncate` primitive and call only the U-H5 no-delete
  `teardown()`s; the OLD `from` store's persistence file + journal are
  byte-identical after every `hotRename` path (§5.6 H1/H2/H3/H5, §5.7 F7).
- **D4 / A-P2-5 — no id rewrite:** `hotRename` NEVER rewrites a `<name>:`-prefixed
  id. A rename whose `from` store carries persisted `<from>:`-prefixed ids is
  DECLINED (R-rename-ids-present, inherited) BEFORE any write, with disk + live
  untouched — U-H6 performs NO id migration (id-migration is a SEPARATE unit).
- **D5 — the default's rename folds into U-H7:** U-H6 does NOT own the default's
  rename; `hotRename('<default>', to)` propagates `W-rename-default` out of
  U-H6's scope. U-H7 (default reassignment) owns the default's reassignment +
  the vector-boot re-warm handoff. U-H6 NEVER touches the default store/engine/
  vector-boot.
- **D8 — boot reads ONCE:** `hotRename` invokes the write path exactly per call
  (the U-H2 controlled re-read); the boot loader + the idle runtime read nothing
  new. The old-`from` persistence file is NEVER re-read/re-applied by the drain
  (it is stranded, D3).
- **`stores:"all"` fan-out — UNCHANGED:** the `mcp-server.ts` fan-out is NOT
  touched by U-H6 (its per-call resolve of each store's `engine` is unchanged).
  Same as U-H4/U-H5.

### 5.9 Unit → file → test-file mapping + the red-set expectation

| Unit | File | Test file | Red-set expectation (RCA-1) |
| --- | --- | --- | --- |
| **U-H6** (this spec) | `src/main/rag-store-runtime.ts` (ADD `hotRename(from, to): Promise<HotRenameResult>` + `HotRenameResult`; REUSES the U-H4 `drainAndReleaseEntry` import — NO new import, NO new module; `rag-store-remove.ts` is REUSED verbatim, NOT edited) | `tests/unit-h6-hot-rename.test.ts` (SpecWriter-pinned; the §5.4/§5.6 H1–H6 + §5.7 F1–F8 + §5.8 N-pin red set) | RED — the U-H6 orchestration does NOT EXIST on the pre-U-H6 code: the suite LOADS (the reused `rag-store-remove.js` exists — U-H4 landed it), so the fail is (i) `RagStoreRuntimeController` has NO `hotRename` (`typeof controller.hotRename === 'undefined'` — the P0 red marker); (ii) the existing `hotApply({kind:'rename'})` REBUILDS + ORPHANS — it does NOT drain/teardown, so the H1–H6 bodies that assert teardown/strand/unregister each FAIL on the absent/behaviorless `hotRename`. |

- **Existing tests that STAY GREEN:** the full U-H2 suite
  (`tests/unit-h2-runtime-controller.test.ts` — H6/F9/F10/N1/N2 + HOST-1/2/3,
  and the U-H2b B1–B13/M1–M4 + D6a/D6b/D8/A-P2-8 pins), the U-H4 suite
  (`tests/unit-h4-hot-remove.test.ts` — the LANDED `hotRemove` + its N1/A-P2-8
  pin; U-H6 edits `rag-store-runtime.ts` additively and does NOT touch
  `rag-store-remove.ts`, so the U-H4 pins cannot regress), the U-H5 suite
  (`tests/unit-h5-teardown.test.ts` incl. its A-P2-8 runtime grep), and the
  write-module suite (`tests/unit-h1-registry-write.test.ts`). U-H6 does not
  change `hotApply`, `rag-store-registry-write.ts`, `main.ts`, `mcp-server.ts`,
  or `rag-store-remove.ts`, so their pins cannot regress. **The
  `rag-store-runtime.ts` N1/A-P2-8 grep pin STAYS GREEN BY DESIGN (§5.8) — no
  U-H2/U-H4/U-H5 test is re-pinned or relaxed.**
- **Per RCA-2/RCA-5:** U-H6 runs its own TestWriter-red → Implementer-green →
  adversarial → blind-greens → doc-review cycle; the trio (`npm test` /
  `npm run typecheck` / `npm run build`) runs after the green. The §7 ruling is
  the gate BEFORE the TestWriter derives the red set. The live-scenario battery
  stays PARKED (§6).
- **Page design:** U-H6 is NOT a page-design change (the operator-UI editor +
  confirmation dialog is U-H8; the settings-pane listing is U-MS5's surface).
  The designing-pages skill and its test-use-case coverage matrix + demo-page
  index are UNCHANGED by U-H6.

### 5.10 Census / numeric claims

- **New modules/files this unit creates (in `src/`):** **0** — the drain-teardown
  module `rag-store-remove.ts` is REUSED (U-H4 landed it). [+1 SpecWriter-pinned
  `tests/unit-h6-hot-rename.test.ts`.]
- **Files EDITED:** **1** — `src/main/rag-store-runtime.ts` (adds `hotRename` +
  `HotRenameResult`; REUSES the U-H4 `drainAndReleaseEntry` import — does not
  change `hotApply`, `hotRemove`, or the other members). **NO edits** to
  `rag-store-remove.ts`/`rag-store.ts`/`retrieval.ts`/`vector-boot.ts`/
  `adjacency.ts`/`rag-store-registry.ts`/`rag-store-registry-write.ts`/
  `rag-store-directory.ts`/`main.ts`/`mcp-server.ts`/`preload.ts`/
  `shared/types.ts`/`security.ts`/`sidebar-panes.ts`.
- **New exports/methods:** `RagStoreRuntimeController.hotRename(from, to):
  Promise<HotRenameResult>` (1 method) + `HotRenameResult` (1 type) in
  `rag-store-runtime.ts`. Controller member count: **11 → 12**. **No new helper /
  type exports** in `rag-store-remove.ts` (reused verbatim).
- **New `teardown(`/`inFlight()` call sites:** **0** (the runtime references
  only `drainAndReleaseEntry(`, no lowercase `teardown`; the call sites remain
  the U-H4 4 in `rag-store-remove.ts`, UNCHANGED — the N1 pin).
- **New byte-pinned message templates:** **0** (all errors propagate from the
  LANDED write/loader/runtime sets; the locally-thrown arg guards reuse the
  `W-rename-arg` template; F7-h/F8-h hang rather than throw).
- **New MCP tools / IPC channels / fan-out edits / teardown calls in the
  runtime:** **0** (D6/A-P2-5/N1/§5.11).
- **New `console.*` lines:** **0** (the runtime's 0-log census holds).
- **Runtime re-builds per `hotRename`:** exactly the U-H2 coarse rebuild of the
  affected `from`→`to` rename (the old non-defaults + the new `to` rebuilt;
  `from` dropped) + the surviving non-default rebuild (U-H2 behavior); the
  default + vector-boot are NOT rebuilt.
- **Disk writes per successful `hotRename`:** exactly ONE registry write (U-H1's
  temp→fsync→rename) + the re-load read; ZERO writes to any store persistence
  file/journal (the old `from` file strands byte-identical, the new `to` file is
  derived fresh if absent); ZERO file deletions.
- **No page-design change** ⇒ `docs/skills/designing-pages.md` is UNCHANGED by U-H6.

### 5.11 Cross-references

- **Gate:** `docs/specs/registry-hot-apply-review.md` §2 **D4** (rename semantics —
  non-default-only, no persisted `<name>:` ids, no id rewrite; id-migration is a
  SEPARATE unit; the DEFAULT's rename folds into D5/U-H7), **A-P2-5** ("rename
  restricted to non-default stores with no persisted `<name>:` ids"), **D6**
  (operator-UI IPC only, NO new MCP tool), **D7** (mid-flight consistency —
  drain-then-teardown; the rename must never leave a renamed-away engine
  mid-query, A-P2-2), **D8** (unit decomposition — U-H6 is the hot-rename row,
  executing after U-H4 and before U-H7/U-H8), **A-P2-8** (the teardown primitives
  landed in U-H5 — U-H4/U-H6/U-H7 are their callers); §5 "Impact on existing
  contracts" (SINGLE-WRITER-STORE-PER-STORE unaffected; hot-rename orphans, never
  deletes); §6 (live-scenario PARKED).
- **Consumed — the U-H4 homolog (the structure U-H6 mirrors):**
  `docs/specs/unit-h4-hot-remove.md` §5.2–§5.8 (the landed `drainAndReleaseEntry`
  + `RemovedEntry`/`RemovedEntryReleaseResult` + the H1–H6/F1–F8/N-pin set the
  rename mirrors; the F-F-H4-1 TOCTOU re-entry + the F-H4-2 default-drift
  orphan-leak fixed contract, both INHERITED by U-H6), §7 (the Q1 option-b
  orchestration home + Q2 two-path co-existence + Q3 `HotRemoveResult` + Q4
  UNBOUNDED drain ruling); `src/main/rag-store-remove.ts` (REUSED by U-H6).
  **The §6/§7 note: U-H6 reuses the helper — the two remove/rename units (U-H4
  remove + U-H6 rename) are the ONLY callers of the shared drain-then-teardown
  path.**
- **Consumed — the U-H5 primitives:**
  `docs/specs/unit-h5-teardown.md` §4 (**TEARDOWN-ASYNC**,
  **STORE-TEARDOWN-REVOKES-MUTATION-ONLY**, **ENGINE-TEARDOWN-STOP-SERVING**,
  **DRAIN-SEAM-INFLIGHT** — `inFlight(): number`, **NO-FAIL**), §5.4–5.7 (the
  byte-pinned `rag store: torn down` / `retrieval engine: torn down` messages,
  the F8 "a mid-query teardown is a caller error, the drain is the guarantee"
  row, the F-H5-3 never-settling-queue awareness in §3a); `src/main/rag-store.ts`,
  `src/main/retrieval.ts`, `src/main/vector-boot.ts`.
- **Consumed — the U-H2 runtime controller:**
  `docs/specs/unit-h2-runtime-controller.md` §4 (**HOT-APPLY-TRIGGER-RESOLVED**,
  **ATOMIC-APPLY**, **REBUILD-ALL-OF-NON-DEFAULT**, **DEFAULT-STABLE-APPLY**,
  **D4-NO-IDS-CALLER-PRECONDITION**), §5.2 (`RagStoreRuntimeController` +
  `HotApplyResult`), §5.4 (`hotApply` steps — the rename write+swap U-H6 reuses,
  incl. the D4 inspect + the F15/F16 default-drift sync), §5.6 H6 (the current
  REBUILD+ORPHAN rename happy path), §5.7 F9 (W-rename-default) / F10
  (R-rename-ids-present) / N1/N2 (negative pins), §5.11 (census); `src/main/
  rag-store-runtime.ts` (the current rename path + the D4 no-ids inspect + the
  U-H4 `drainAndReleaseEntry` import U-H6 reuses).
- **Consumed — the write module (the propagated rename error set):**
  `docs/specs/unit-h1-registry-write.md` §5.5 (**W-rename-unknown-from**,
  **W-rename-target-exists**, **W-rename-default**, **W-rename-arg** `from|to
  required`), §5.3.2 (the D4 no-ids U-H2-caller-precondition); `src/main/
  rag-store-registry-write.ts:188-202` (the rename branch) + the
  `renameRegistryStore` wrapper with the arg guard (§5.7 F18).
- **Sibling slice units (cite-only):** U-H1 (write), U-H2 (runtime+rewiring),
  U-H3 (hot-add, confirmatory EMPTY), U-H5 (teardown primitives, LANDED), U-H4
  (hot-remove, LANDED — the homolog), U-H7 (default reassignment — owns the
  DEFAULT's rename + the vector-boot re-warm handoff; OUT of U-H6's scope),
  U-H8 (the operator-UI editor — invokes `hotRename` after the confirmation
  dialog; D6). **Execution order proceeding: U-H4 (LANDED) → U-H6 (this — NEXT)
  → U-H7 → U-H8.**
- **In-scope boundary vs U-H7/U-H8:** U-H6 lands the CONTROLLER/mechanism-level
  rename (`hotRename` reusing the drain helper), node-testable, NO IPC/MCP,
  NON-DEFAULT-only (the default's rename folds into U-H7). U-H8 lands the
  operator-facing trigger + confirmation dialog + the IPC channel that calls
  `hotRename` (the operator-UI editor). §5.8/§5.10.
- **`stores:"all"` fan-out (OUT):** the `mcp-server.ts` fan-out is UNCHANGED by
  U-H6 (same as U-H4/U-H5).
- **Test file (SpecWriter-pinned):** `tests/unit-h6-hot-rename.test.ts`.
- **Decision rows:** `docs/decisions.md` — U-H2's **RUNTIME-CONTROLLER**,
  **MUTABLE-LIVE-DIRECTORY**, **DEFAULT-STABLE-APPLY**,
  **REBUILD-ALL-OF-NON-DEFAULT**, **HOT-APPLY-TRIGGER-RESOLVED**, **ATOMIC-APPLY**,
  **D4-NO-IDS-CALLER-PRECONDITION**; U-H5's **TEARDOWN-ASYNC**,
  **ENGINE-TEARDOWN-STOP-SERVING**, **DRAIN-SEAM-INFLIGHT**; U-H4's
  **HOT-REMOVE-DRAIN-THEN-TEARDOWN** (the remove homolog this rename mirrors);
  the inherited **SINGLE-WRITER-STORE-PER-STORE**, **ENGINE-PER-STORE**,
  **D3 hot-remove ORPHAN**, **REGISTRY-ATOMIC-WRITE**/WRITE-module rows. U-H6
  records a NEW row (**HOT-RENAME-DRAIN-THEN-TEARDOWN**) on landing.

## 6. The live-scenario gate

**Live-scenario gate: PARKED (2026-09-08, per the user's instruction — the
registry hot-apply/removal/rename MCP/UI surface cannot be driven live because a
live app session is unavailable).** U-H6's live gate is PARKED accordingly: the
drain-then-teardown rename is node-testable in `tests/unit-h6-hot-rename.test.ts`
(no live app needed); a **live-pending battery**
(`tests/unit-h6-hot-rename-live-pending-battery.md`) SHOULD be authored in a
LATER live-app session, exercising a REAL operator-triggered rename (via U-H8)
that drains + tears down a live old-`from` store/engine end-to-end. It is NOT
authored now (PARKED).

## 7. Design questions surfaced to the Architect (arbitrate BEFORE the TestWriter runs)

> The §7 convention (U-H4/U-H5): the spec resolves PROVISIONALLY; the TestWriter
> derives the red set ONLY after the Architect rules CONFIRMED. **U-H6's two
> genuine either/or decisions are Q1 (the `hotRename` surface + the drain-teardown
> home + the N1 pin) and Q2 (the D4-precondition inheritance) — these need a
> positive ruling, not an "as-written" confirmation.**

1. **The `hotRename(from, to)` surface + the drain-teardown home — the KEY
   tension (RESOLVED provisionally to option (b): REUSE the landed
   `rag-store-remove.ts` `drainAndReleaseEntry` directly + an additive async
   `hotRename`; N1 STAYS GREEN. Needs a ruling.)**
   - **Option (a) — inside `hotApply({kind:'rename'})` in `rag-store-runtime.ts`:**
     would force `hotApply` to become ASYNC (or spawn a fire-and-forget
     teardown), RELAX the U-H2 **N1** grep AND the U-H5 A-P2-8 runtime grep, and
     re-pin both. It makes the runtime the teardown CALLER. REJECTED (same
     reasoning as U-H4 Q1 option (a)).
   - **Option (b) — RECOMMENDED — REUSE the landed orchestration home:** the
     teardown CALL SITES live ONLY in the LANDED `src/main/rag-store-remove.ts`
     (`drainAndReleaseEntry` — the U-H4-owned helper), reused VERBATIM (NO new
     module, NO alias, NO fork); the runtime gains an ADDITIVE async
     `hotRename(from, to)` that reuses the LANDED `hotApply({kind:'rename'})`
     for the write+swap, then AWAITS `drainAndReleaseEntry` on the old-`from`
     orphan. `rag-store-runtime.ts` never lexically contains `teardown(`, so
     **N1/A-P2-8 STAY GREEN with ZERO re-pin** — the least-invasive outcome, and
     it makes U-H4 (remove) + U-H6 (rename) the two callers of the SAME shared
     drain-then-teardown path. This is consistent with U-H5's
     TEARDOWN-NO-WIRE-UP and the runtime-as-orchestrator-but-not-teardown-owner
     model.
   - **Option (c) — a NEW `rag-store-rename.ts` module + a rename-named helper
     (e.g. `drainAndReleaseRenamed`):** would SPLIT the teardown call sites
     across two modules (a duplicate of `drainAndReleaseEntry`), ADD a new module
     + new types for a helper with byte-identical behavior, and give no N1
     benefit (the runtime would still reference a non-`teardown` identifier).
     REJECTED — heavier, no benefit over the existing module.
   - **Ruling requested:** confirm option (b) — the `hotRename(from, to)`
     surface + reuse of the LANDED `drainAndReleaseEntry` (NO new module), and
     that the U-H2/U-H5 N1/A-P2-8 grep pins STAY GREEN (not re-pinned), with the
     single hard requirement that `rag-store-runtime.ts` source contains no
     literal `teardown(` (§5.8). **This is the Q1 decision the TestWriter cannot
     proceed without.**
2. **The D4 no-ids precondition: does `hotRename` INHERIT `R-rename-ids-present`
   from the underlying `hotApply({kind:'rename'})`, or RE-INSPECT at the
   `hotRename` level? (RESOLVED provisionally to INHERIT — confirm.)** The D4
   `R-rename-ids-present` inspect ALREADY runs inside `hotApply` (the
   D4-NO-IDS-CALLER-PRECONDITION, §5.4 of the U-H2 spec) — it inspects the
   CURRENT `from` store's node ids FIRST (before `writeRegistryMutation`), and is
   SKIPPED when `from === directory.defaultName` (HOST-2). So `hotRename`,
   because it reuses `hotApply`, INHERITS the rejection for free: a populated
   `<from>:` rename throws `R-rename-ids-present` before any write, disk + live
   untouched, and NO drain/teardown (the swap never ran). The alternative —
   re-inspecting at the `hotRename` level (a store-`listNodes()` read, lexically
   permitted — NOT a teardown call) — would DUPLICATE the store-data read and
   add no behavioral safety (a TOCTOU between a `hotRename`-level inspect and
   the write is equally possible either way; the authoritative inspect is the
   one that runs immediately before the write, inside `hotApply`). The runtime
   does NOT need to add any store-data read at the `hotRename` level to satisfy
   the D4 precondition. **Confirm INHERIT (recommended) so the TestWriter locks
   §5.7 F5 (R-rename-ids-present inherited, disk NOT written, live untouched, NO
   drain) against the underlying `hotApply` behavior without any `hotRename`-level
   re-inspect.**
3. **The two-rename-path split + the return shape + the from/to arg guard
   (RESOLVED provisionally — confirm, mirror of U-H4 Q2/Q3 + the F1 addendum):**
   (i) the legacy `hotApply({kind:'rename'})` REBUILD+ORPHAN path CO-EXISTS
   UNCHANGED (U-H2 H6/F9/F10/N1/N2 stay green) and the new `hotRename` is the
   D7-satisfying, operator-facing rename (U-H8 calls `hotRename`, never
   `hotApply` rename); (ii) `hotRename` returns
   `Promise<HotRenameResult> = { loaded, delta:{added:[],removed:[],renamed:[{from,to}]}, drained: 0 }`
   where `drained` is the settled in-flight count on the OLD `from` engine at
   teardown (always 0); (iii) the top-of-method arg guard throws
   `rag-store-registry-write: from required` / `...: to required` (byte-equal to
   the LANDED W-rename-arg template, locally-thrown, 0 new templates — mirror of
   the U-H4 F-H4-3 addendum; the raw `hotApply` rename path, like the remove
   path, String()-coerces a bad arg and cannot produce the arg message). **Confirm
   (i)/(ii)/(iii) so the TestWriter locks H1–H6 against `hotRename` + the F1/F1b
   arg pins.**
4. **Bounded vs. unbounded drain on a never-settling in-flight query / store
   queue (F-H5-3) — the OTHER genuine either/or. (RESOLVED provisionally to
   UNBOUNDED — confirm, mirror of U-H4 Q4.)** A-P2-2/D7 say an old renamed
   engine is NEVER torn down mid-query, so the drain MUST await `inFlight()===0`.
   Options: (i) UNBOUNDED await (correctness-first — `hotRename` hangs on a
   genuinely never-settling query/queue; F-H5-3 documented this as a pre-existing
   awareness, NOT a U-H5 regression) — the recommended reading, keeping the
   census at "0 new messages" and honoring A-P2-2 absolutely; vs (ii) BOUNDED (a
   maxWaitMs → fail-loud + a new pinned message + a new fail-state row), which
   would relax A-P2-2 or add a byte-pinned surface. **Confirm UNBOUNDED (so the
   TestWriter locks §5.7 F7h/F8h as hang-not-throw) OR choose BOUNDED (adds a
   message + a fail-state to §5.5/§5.7).**

---

**Bottom line:** U-H6 upgrades the RENAME path from U-H2's REBUILD+ORPHAN to a
REAL **drain-then-teardown** — a new async controller seam **`hotRename(from,
to): Promise<HotRenameResult>`** that REUSES the LANDED
`hotApply({kind:'rename'})` write+rebuild+unregister (incl. the D4 no-ids
precondition), then drains (`inFlight()===0`), tears down the OLD renamed
store/engine (U-H5 primitives via the REUSED U-H4 `drainAndReleaseEntry`), and
STRANDS the old `from` persistence file + journal byte-identical (D3) while the
NEW `to` entry becomes live. The teardown CALL SITES stay in the LANDED
`src/main/rag-store-remove.ts` — REUSED, NOT re-authored — so `rag-store-runtime.ts`
keeps its N1/A-P2-8 grep pin GREEN (no re-pin). U-H6 exposes the controller
mechanism only — no MCP tool, no IPC channel (D6) — is NON-DEFAULT-only
(A-P2-5/D5; the default's rename folds into U-H7), performs NO id rewrite (D4),
and the operator trigger + confirmation dialog are U-H8's. **The two genuine §7
either/or items (Q1 the `hotRename` surface + the drain-teardown home + N1, Q2
the D4-precondition inheritance) MUST be arbitrated CONFIRMED before the
TestWriter derives the red set; Q3/Q4 are confirmations of the recommended
reading.**

---

### §7 Architect ruling (2026-09-08, Gate Supervisor / Architect)

All four §7 items **CONFIRMED** as provisionally resolved:

1. **Q1 — CONFIRMED.** `RagStoreRuntimeController.hotRename(from: string, to: string):
   Promise<HotRenameResult>` (ADDITIVE, async — the runtime goes to 12 methods +
   the `HotRenameResult` type). Drain-teardown via the LANDED
   `src/main/rag-store-remove.ts` `drainAndReleaseEntry` **reused verbatim — NO new
   module, no alias, no fork**. `rag-store-runtime.ts` references only the
   identifier `drainAndReleaseEntry(` (NO literal `teardown(`) → the N1/A-P2-8
   grep pin STAYS GREEN. **CONFIRMED.**
2. **Q2 — CONFIRMED (INHERIT).** The D4 no-ids precondition is **inherited** from
   `hotApply` (the `R-rename-ids-present` inspect already runs first inside
   `hotApply`, skipped for a default rename via HOST-2); `hotRename` does NOT
   re-inspect → a populated `<from>:` rename throws, disk NOT written, live
   untouched, NO drain/teardown. **CONFIRMED.**
3. **Q3 — CONFIRMED.** Two-path co-existence: `hotApply({kind:'rename'})` (REBUILD+
   ORPHAN) unchanged; `hotRename` is the drain-then-teardown, operator-facing
   rename. `HotRenameResult = { loaded, delta:{added:[],removed:[],renamed:[{from,to}]}, drained: 0 }`.
   The `from required`/`to required` arg guards are LOCALLY thrown at the top of
   `hotRename`, byte-equal to the landed `W-rename-arg` `from|to required` (0 new
   templates). **CONFIRMED.**
4. **Q4 — CONFIRMED (UNBOUNDED).** `hotRename` awaits `inFlight()===0` UNBOUNDED
   (the A-P2-2 drain guarantee; census stays at 0 new messages), mirroring U-H4's
   Q4 ruling. **CONFIRMED.**

The inherited U-H4 fixes — F-H4-1 (drain-gate TOCTOU re-entry, inside the reused
helper) and F-H4-2 (default-drift orphan-leak, mirrored in `hotRename`'s
catch-and-drain) — are pinned as inherited contract (§3a/§5.4/§5.7 F7). The
TestWriter may derive U-H6's red set against this ruling; no further arbitration
is required before the red run. The operator trigger + confirmation dialog remain
U-H8's (out of U-H6's scope).
