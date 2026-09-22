# Unit U-H4 — Hot-Remove (the drain-then-teardown remove): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-08.
- **Derived from DOCUMENTATION ONLY** — `docs/specs/unit-h4-hot-remove.md` §4
  (the pinned design decisions + the §7 Architect ruling: REMOVE-ORCHESTRATION-HOME
  to a NEW module + additive async `hotRemove` with the N1 pin STAYING GREEN (Q1
  option-b); HOT-REMOVE-METHOD co-existence with the legacy `hotApply({kind:'remove'})`
  ORPHAN (Q2); DRAIN-ORDER store-then-engine; UNREGISTER-EVERYWHERE;
  DEFAULT-REMOVAL-IMPOSSIBLE (loader F12); NO-OP-ON-ABSENT (write-level
  W-remove-unknown); D3-ORPHAN-STRAND; D6/A-P2-7 scope boundary; UNBOUNDED drain
  (Q4)), §5.1 (the `hotRemove(name): Promise<HotRemoveResult>` + `HotRemoveResult`
  addition to `RagStoreRuntimeController`), §5.2/§5.4 (the NEW module
  `drainAndReleaseEntry`/`RemovedEntry`/`RemovedEntryReleaseResult` + the exact
  drain→store.teardown→engine.teardown→`{drained:0}` order), §5.3 (the six-step
  `hotRemove` ordering + the EARLY-return-on-write-throw + the defensive absent-entry
  skip), §5.5 (the propagated W-remove-* / loader-F12 / native-fs error set; **0**
  new message templates), §5.6 (happy paths H1–H6), §5.7 (fail-states F1–F8), §5.8
  (the negative pins D6/D8/A-P2-7/A-P2-8/D3 + the N1/N2 stays-green), §5.10 (the
  census). Consumed/landed contracts read for fixture shapes: the U-H5
  `teardown()`/`inFlight()` member signatures in `src/main/rag-store.ts:287` /
  `src/main/retrieval.ts:611-616`, the `RagStoreEntry`/`buildRagStoreDirectory`
  surface (`rag-store-directory.ts`), the `loadRagStoreRegistry`/`ResolvedRagStore`
  surface (`rag-store-registry.ts`), the `createJsonRagStore`/`RagStore` surface
  (`rag-store.ts`), and the `createRetrieval`/`RetrievalEngine` surface
  (`retrieval.ts`). The `rag-store-runtime.ts` source was read ONLY to confirm the
  co-existing `hotApply({kind:'remove'})` orphan path exists (task allowance) and
  for the §5.8 N1/A-P2-8 grep scans.
- **NOT read:** the `hotRemove` implementation body, the `drainAndReleaseEntry`
  implementation body (constructed + CALLED only), and the SpecWriter-pinned
  `tests/unit-h4-hot-remove.test.ts`. All behavior is derived from the spec text +
  the public factory signatures. The RUN record (§Run) was filled in AFTER the
  scenarios were authored. `src/` and the landed test suite were not modified by
  this pass.
- **Modules under test (the live seam):** `createRagStoreRuntimeController`
  (`rag-store-runtime.js`) — the `hotRemove(name)` controller method imported and
  CALLED only; `drainAndReleaseEntry` (`rag-store-remove.js`) imported and CALLED
  only (direct scenario DRAIN-1); the consumed fixture factories
  `createJsonRagStore`/`loadRagStoreRegistry`/`buildRagStoreDirectory` used for a
  real 2-store boot.
- **Harness:** ONE throwaway vitest runner
  `tests/__h4blinds__/unit-h4-hot-remove-blind-greens-run.test.ts` (a NEW file,
  node environment) executed with the repo's vitest
  (`npx vitest run tests/__h4blinds__/unit-h4-hot-remove-blind-greens-run.test.ts`).
  Every boot uses a fresh `mkdtemp` dir under `os.tmpdir()` and a real
  `loadRagStoreRegistry`+`buildRagStoreDirectory` 2-store boot (`main` default +
  `research-2026-09` non-default), each on a derived persistence file; the real
  userData is never touched. Byte-pinned message assertions are exact against
  §5.5/§5.7/§5.6. The runner is DELETED after the run — this document is the
  artifact.
- **Legend:** PASS = behavior matches the spec; FAIL = doc/spec drift OR an
  un-hardened regression (never a pass); DEFERRED = the precondition cannot be
  constructed blindly (with the reason).

---

## Boot fixture (real 2-store boot, per the U-H2 fixture convention)

`<d>` = a fresh `mkdtemp`; `<path>` = `<d>/provident-rag-stores.json` written as

```json
{ "version": 1, "stores": [ { "name": "main", "default": true }, { "name": "research-2026-09" } ] }
```

1. `registry = loadRagStoreRegistry({ path: <path> })` (implicit:false, corrupt:false).
2. plant each store's persistence file via `createJsonRagStore({ path: s.persistenceFile })`
   + `putNode(node('n1','alpha'))` (so the boot captures `missing:false`, `corrupt:false`).
3. `plan = buildRagStoreDirectory(registry, { userDataPath: <d>, embedderKind: 'lexical', provider: null })`
   (`vectorBoot` null under lexical).
4. `defaultEntry = plan.directory.entries.get(plan.defaultName)`.
5. `controller = createRagStoreRuntimeController({ registry, directory: plan.directory,
   defaultEntry, vectorBoot: plan.vectorBoot, registryPath: <path>, userDataPath: <d>,
   embedderKind: 'lexical', provider: null })`.

The captured pre-remove `RagStoreEntry` (`.store`, `.engine`, `.name`) is the orphan the drain tears down. `RagNode` helper: `node(id, content) = { id, type:'p', content, ownedNodeIds:[], createdAt:T0, updatedAt }`.

---

## A. §5.6 Happy paths H1–H6

### H1. Remove a present IDLE non-default → drained + teardown + unregistered + file stranded (D7/D3)
- **Setup:** 2-store boot; snapshot the `research-2026-09` persistence bytes; capture `getDefaultStore()`.
- **Action:** `res = await controller.hotRemove('research-2026-09')`.
- **Expected PASS:** `res.drained === 0`; `res.delta` deep-equals
  `{ added:[], removed:['research-2026-09'], renamed:[] }`; `res.loaded.implicit === false`
  and `res.loaded.corrupt === false`; `res.loaded.stores` names `['main']`;
  `getDirectory().entries.get('research-2026-09') === undefined`; `currentStores()` names
  `['main']` (the surviving default remains); `statusOf('research-2026-09')` THROWS
  `rag-store-runtime: unknown store 'research-2026-09'` (R-status-unknown, synchronous);
  `getDefaultStore()` is the SAME object identity; the research persistence file is
  BYTE-IDENTICAL before/after (D3 strand).

### H2. The removed engine + store are genuinely TORN DOWN
- **Setup:** as H1; capture the pre-remove `researchEntry.store` + `.engine` + bytes.
- **Action:** after `hotRemove`, exercise the captured store/engine.
- **Expected PASS:** `engine.query('alpha')` fails loud `` retrieval engine: torn down ``;
  `store.putNode(...)` fails loud `` rag store: torn down ``; `store.getNode('n1')` still
  RESOLVES (read-safe teardown); a FRESH `createJsonRagStore` over the stranded file still
  lists the node (stranded + intact); the file is byte-identical.

### H3. Remove with an in-flight query DRAINS first (A-P2-2)
- **Setup:** 2-store boot; swap a HOLDING embedder into the research engine
  (`engine.setEmbedder(holding)` where `score` awaits a test deferred); fire
  `q = engine.query('alpha')` NOT-awaited; assert `engine.inFlight() === 1`.
- **Action:** `rh = controller.hotRemove('research-2026-09')` (not awaited); tick the loop;
  while held assert `engine.inFlight() === 1` and `rh` NOT settled; `hold()` (release).
- **Expected PASS:** the drain gate blocks — the engine is NOT torn down while
  `inFlight() === 1`; after release the query settles on the OLD embedder
  (`qres.ranked[0].nodeId === 'n1'`, `score === 1`), `rh` resolves `{ drained: 0 }`,
  `engine.inFlight() === 0`, a NEW `query('gamma')` throws `` retrieval engine: torn down ``;
  the store file byte-identical throughout. The removed engine is never torn down mid-query.

### H4. 3-store registry — remove one, the survivor + default survive
- **Setup:** boot `[main+research-2026-09+research-2026-10]`; capture the default object.
- **Action:** `hotRemove('research-2026-09')`.
- **Expected PASS:** `delta.removed === ['research-2026-09']`; the entry is gone from
  `getDirectory().entries`; `research-2026-10` REMAINS in entries + `currentStores()`
  (`['main','research-2026-10']`) (rebuilt fresh per the U-H2 coarse path — identity may
  change, the documented survivor-rebuild churn §5.11); the default object is untouched.

### H5. The write is re-readable (D2)
- **Setup:** 2-store boot; `hotRemove('research-2026-09')`.
- **Action:** `reread = loadRagStoreRegistry({ path: <path> })`.
- **Expected PASS:** `reread.stores` names `['main']`, `implicit:false`, `corrupt:false`
  — persisted == live (D2).

### H6. Torn-down store/engine `teardown()` is a safe NO-OP (primitive-level idempotency)
- **Setup:** 2-store boot; `hotRemove('research-2026-09')`; capture the pre-remove store+engine.
- **Action:** call `store.teardown()` and `engine.teardown()` again (twice each).
- **Expected PASS:** all four resolve `undefined` immediately — the removal is idempotent at
  the drain/teardown layer (even though the WRITE is not: W-remove-unknown on repeat, §5.7 F2).

---

## B. §5.7 Fail-states F1–F7

`live-untouched` = `getDirectory().entries` still has the target + the registry file
byte-identical + NO teardown ran (`engine.query`/`store.putNode` still resolve); `disk-untouched`
= the registry + target store persistence files byte-identical. Fail-loud = the pinned message.

### F1. bad name (`null` / `5` / `''`) → W-remove-arg; live+disk untouched; NO teardown
- **Action:** `controller.hotRemove(null)` / `(5)` / `('')`.
- **Expected PASS:** each rejects `` rag-store-registry-write: name required `` (the §7
  addendum top-of-method arg guard reuses the LANDED W-remove-arg string — 0 new templates);
  live + disk untouched; NO teardown (`engine.query`/`store.putNode` still serve).

### F2. unknown / already-removed → W-remove-unknown; live+disk untouched; NO teardown
- **Action:** `controller.hotRemove('nope')` then a successful remove of
  `research-2026-09` then `controller.hotRemove('research-2026-09')` again.
- **Expected PASS:** the first rejects `` rag-store-registry-write: cannot remove unknown
  store 'nope' ``; live untouched + NO teardown (remove is NOT a silent no-op at the write
  level); the repeat remove of the now-removed name rejects `` rag-store-registry-write:
  cannot remove unknown store 'research-2026-09' `` (the drain/teardown is primitive-level
  idempotent, the write is not).

### F3. the DEFAULT store → loader F12; live+disk untouched; NO teardown
- **Setup:** 2-store boot; capture the `main` entry + its file bytes + the registry bytes.
- **Action:** `controller.hotRemove('main')`.
- **Expected PASS:** rejects `` rag-store-registry: exactly one store must have default: true
  (found 0) `` (the write module's candidate re-validation of a zero-default registry;
  NO `W-remove-default` message exists) BEFORE any drain; live + disk untouched; NO teardown
  (the default `engine.query`/`store.putNode` still serve).

### F4. a persist native fs failure → the native fs Error PROPAGATES; live+disk untouched; NO teardown
- **Setup:** 2-store boot; snapshots; `chmod` `<d>` to `0o500` (non-writable).
- **Action:** `controller.hotRemove('research-2026-09')`, then `chmod` back `0o700`.
- **Expected PASS:** rejects with the NATIVE fs Error (code `EACCES`, message contains
  `EACCES` — propagated unchanged, not a wrapped R-*/W-* message); live-untouched (research
  still an entry); the registry + research persistence files byte-identical; NO teardown
  (`engine.query` still serves).

### F5. store teardown HANGS on a never-settling queued promise (F-H5-3 awareness) — **DEFERRED**
- **Reason:** the §7 Q4 Architect ruling confirms the drain is **UNBOUNDED** (correctness-first;
  no timeout, 0 new messages). The only observable outcome of a never-settling store queue is an
  indefinite hang of `hotRemove`, which a bounded greens battery cannot ASSERT without either a
  NEW (forbidden) timeout message or leaking a permanently-pending promise. Not blind-constructible
  as a PASS/FAIL from the documented surface (the never-settling enqueued promise would need to be
  injected into the U-H5-internal single-writer queue). The gate's bounded counterpart is behaviorally
  covered by H3 (the drain never proceeds while `inFlight() > 0`, and the store file stays
  byte-identical throughout). F-H5-3 is recorded as pre-existing U-H5 awareness, NOT a U-H4 regression.

### F6. the drain awaits a NEVER-settling in-flight query — **DEFERRED**
- **Reason:** same UNBOUNDED (§7 Q4) outcome — a never-settling query hangs `hotRemove`
  (A-P2-2 correctness), which cannot be asserted as an observable PASS in a bounded battery
  (no timeout message; F-H5-3 documented awareness). H3 covers the SETTLING in-flight case:
  the teardown is gated behind `inFlight()===0` and the engine is never torn down mid-query.

### F7. a query entered BEFORE teardown completes on the OLD embedder — not corrupted
- **Setup:** 2-store boot; holding embedder on the research engine; `q = engine.query('alpha')`
  in-flight; `inFlight() === 1`.
- **Action (the drain-bypass / caller-error path, U-H5 F8 the gate builds on):**
  `await engine.teardown()` directly while `q` is in-flight; `hold()`; `await q`.
- **Expected PASS:** `teardown()` resolves `undefined` WITHOUT cancelling the in-flight query;
  `q` completes on the OLD embedder (`qres.ranked[0].score === 1`) — not silently corrupted;
  `inFlight()` returns to 0; ONLY a new `query` throws `` retrieval engine: torn down ``.
  This is exactly the guarantee the `hotRemove` drain gate makes a mid-query teardown
  unreachable through the controller (verified by H3).

### F8. defensive `orphan === undefined` after a successful write — **DEFERRED**
- **Reason:** §5.3 step 3 + §5.7 F8 mark this "not a documented fail-state; a defensive D2-invariant
  bug guard, never asserted as reachable behavior." A blind construction would require a
  persisted-and-live divergence that the D2 invariant + the U-H2 write path make unreachable by
  contract. Not blind-constructible from the documented surface.

---

## C. §5.2/§5.4 direct — `drainAndReleaseEntry`

### DRAIN-1. The remove module's helper (RemovedEntry → drained 0, teardown, strand)
- **Setup:** 2-store boot; capture `researchEntry.store` + `.engine`; snapshot the file bytes.
- **Action:** `res = await drainAndReleaseEntry({ store: researchEntry.store, engine: researchEntry.engine })`.
- **Expected PASS:** `res.drained === 0`; `engine.inFlight() === 0`; `engine.query('alpha')`
  throws `` retrieval engine: torn down ``; `store.putNode(...)` throws `` rag store: torn down ``;
  the persistence file byte-identical (D3). (Composes exactly the DRAIN-ORDER §5.4 pins:
  await `inFlight()===0` → `store.teardown()` → `engine.teardown()` → `{drained:0}`.)

---

## D. §5.8 Negative pins (grep/static — A-P2-8 / D3 / D6)

### N1. `rag-store-runtime.ts` has NO `teardown(` literal + no lowercase delete primitive (§5.8 A-P2-8/N1 + N2)
- **Action:** read the runtime source; assert NO `\b(teardown|close|destroy)\s*\(` and NO
  `\b(unlink|rm|rmdir|remove|truncate)\s*\(`.
- **Expected PASS:** both regexes have no match — the N1/A-P2-8 grep pin STAYS GREEN with
  ZERO re-pin (Q1 option-b), and the runtime makes no lowercase delete call. The §5.8 HARD
  REQUIREMENT (no literal `teardown(` — the identifier/member, while a bare prose "teardown"
  without the paren is permitted) holds. (Confirmed independently by the §5.5 "0 teardown call
  sites in the runtime" census.)

### N2. `rag-store-remove.ts` carries the D3 no-delete + D6 no-MCP/no-IPC negative pins (§5.8)
- **Action:** read the remove-module source; assert NO filesystem-delete USAGE (no delete
  primitive `(unlink|rm|rmdir|truncate|remove)(` call, no `fs.(rm|unlink|rmdir|truncate)` call,
  no `.unlink(`/`.rm(`/… member call) and NO MCP/IPC surface
  (`ALL_TOOLS`/`RpcMethod`/`MUTATING_METHODS`/`ipcMain`/`webContents.send`/`IPC_[A-Z_]+`).
- **Expected PASS:** no delete-primitive usage (D3 — the D3 strand is ALSO verified behaviorally
  in H1/H2/DRAIN-1: the file is byte-identical); no MCP/IPC surface (D6/A-P2-7). The module MAY
  mention the delete primitives in its D3 header prose; it must not USE them.

### N3. `hotRemove` + a failed `hotRemove` emit ZERO `console.*` lines (the 0-log census, §5.10)
- **Action:** spy `console.log/error/warn/info` across a successful `hotRemove` and a
  fail-loud `hotRemove('nope')`.
- **Expected PASS:** ZERO console output on both paths (failures are thrown, never logged).

---

## §Run — results (filled in after execution)

| id | Scenario | Result |
| --- | --- | --- |
| H1 | Remove idle non-default: drained 0, delta, unregister-everywhere, default object identity, file stranded | ✅ PASS |
| H2 | Removed engine + store torn down (query/putNode fail loud; getNode resolves; stranded file reloads with nodes) | ✅ PASS |
| H3 | In-flight query DRAINS first — never torn down mid-query; drained 0; query settles on the old embedder | ✅ PASS |
| H4 | 3-store registry — only the named store removed; survivor + default survive | ✅ PASS |
| H5 | Fresh `loadRagStoreRegistry` shows the store gone; implicit/corrupt false (D2) | ✅ PASS |
| H6 | Second store/engine `teardown()` resolves immediately (primitive-level idempotency) | ✅ PASS |
| F1 | `null`/`5`/`''` → W-remove-arg; live+disk untouched; no teardown | ✅ PASS |
| F2 | unknown + repeat (already-removed) → W-remove-unknown; live untouched; no teardown | ✅ PASS |
| F3 | default → loader F12; live+disk untouched; no teardown | ✅ PASS |
| F4 | native EACCES on persist propagates; live+disk untouched; no teardown | ✅ PASS |
| F5 | never-settling store queue hangs `hotRemove` (UNBOUNDED) | ⏸️ DEFERRED |
| F6 | never-settling in-flight query hangs the drain (UNBOUNDED) | ⏸️ DEFERRED |
| F7 | mid-query teardown (caller-error bypass) does NOT corrupt — completes on the old embedder | ✅ PASS |
| F8 | defensive orphan-undefined after a successful write (unreachable by contract) | ⏸️ DEFERRED |
| DRAIN-1 | `drainAndReleaseEntry(RemovedEntry)` → drained 0, store+engine torn down, file stranded | ✅ PASS |
| N1 | runtime: no `teardown(`/``(\bteardown|close|destroy\s*\()`` literal; no lowercase delete primitive | ✅ PASS |
| N2 | remove module: no delete-primitive usage (D3); no MCP/IPC surface (D6) | ✅ PASS |
| N3 | zero `console.*` across successful + failed `hotRemove` | ✅ PASS |

**Run:** `npx vitest run tests/__h4blinds__/unit-h4-hot-remove-blind-greens-run.test.ts`
(the repo's vitest, node env) — **15 tests, 15 passed.**

**Tally: PASS 15 / FAIL 0 / DEFERRED 3.** No spec/code drift and no un-hardened regression
observed against `docs/specs/unit-h4-hot-remove.md` §4/§5.1/§5.2/§5.3/§5.4/§5.6/§5.7/§5.8 on
this host. Every byte-pinned message reproduced byte-exact: `rag-store-registry-write: name
required`, `rag-store-registry-write: cannot remove unknown store '<name>'`,
`rag-store-registry: exactly one store must have default: true (found 0)`,
`rag-store-runtime: unknown store '<name>'`, `retrieval engine: torn down`,
`rag store: torn down`, and the propagated native `EACCES` fs Error. The three DEFERRED rows
(F5/F6/F8) are documented UNBOUNDED/unreachable states, not fabricated PASS. The `hotRemove`
behavioral surface (H1–H6, F1–F4, F7, DRAIN-1) all reproduce from the LIVE modules exactly as
the spec pins (§5.6/§5.7/§5.4), and the U-H2 H4-orphan `hotApply({kind:'remove'})` path is
confirmed co-existing and unchanged behind the new async `hotRemove`.

**RCA-3 adversarial close-out note (doc-review reconciliation):** the landed
`tests/unit-h4-hot-remove.test.ts` carries two adversarial REGRESSIONS beyond this blind
battery's §5.6/§5.7/§5.4 surface — **F-H4-1** (drain-gate TOCTOU: a query entered DURING the
`store.teardown()` yield is never torn down mid-flight, because the `inFlight()===0` gate is
RE-ENTERED immediately before `engine.teardown()`) and **F-H4-2** (default-drift throw-path:
the store dropped from the live map by the F15/F16 sync is STILL drained+teardown before the
byte-pinned error rethrows). These adversarial regressions therefore independently pin the same
drain-gate (`inFlight()===0`) and drift-path behavior the blind battery's H3/F4 verify from the
documented surface — §5.4's re-entered gate (per the doc-review §5.4 note) and §5.3/F-H4-2.

### Run-iteration note (transparency — no self-verification of behavior)
- The three N-pin scenario expectations were each tightened once after a false-FAIL that was a
  **greens-scenario construct error, not a module defect**: my initial negative-pin regexes were
  broader than the spec's §5.8 regexes and matched the D3/N1 **header comments** (the modules
  legitimately DOCUMENT the pins in prose — e.g. the runtime's "teardown orchestration" note,
  which §5.8 explicitly permits, and the remove module's "imports NO `unlink`/`rm`/… " header).
  The regexes were aligned to the spec's exact `\s*\(`-call form, matching zero. No behavioral
  scenario was changed; only the grep-level expected-condition regexes were corrected to the
  spec's own regex shape.
- **Blind-run disclosure (RCA-4 item 10a):** during the N2 debug, one failing `not.toMatch`
  assertion caused vitest to PRINT the `rag-store-remove.ts` source as the assertion's
  `received` value, exposing the `drainAndReleaseEntry` body (an UNBOUNDED `while
  (inFlight()!==0)` poll with a 1 ms sleep, then `store.teardown()` then `engine.teardown()`,
  `{drained:0}`). This confirms the spec's §5.4/§7-Q4 pins (store-then-engine, unbounded) but
  was seen AFTER all behavioral scenarios were authored and independently passed; no scenario
  assertion was derived from it. The `hotRemove` body and the test file were never read.

## Spec ambiguities / drift surfaced (for the proofreader/doc-review gate)

- **None in the behavioral contract.** Every §5.6 H1–H6, §5.7 F1–F4/F7, §5.4, and §5.8 pin
  reproduced from the live modules. The three iterations above were greens-runner regex
  corrections (matching the spec's exact §5.8 regex shape), not spec/code drift.
- **One readability note (not a defect):** the §5.8 HARD-REQUIREMENT sentence permits a bare
  prose "teardown" mention (no paren) in `rag-store-runtime.ts`, so a case-insensitive
  `/teardown/i` grep would FALSE-POSITIVE on the runtime header docstring. The correct pin is
  the spec's exact `/\b(teardown|close|destroy)\s*\(/`. Worth a one-line cross-reference in the
  N1 row so a future greens writer does not repeat my first iteration. (No spec change required;
  the §5.8 N1 row already states this.)
- **The F8 DEFERRED (defensive `orphan === undefined`)** is explicitly marked "not asserted as
  reachable behavior" by §5.3 step 3/§5.7; recorded DEFERRED per the task rule (no fabricated PASS).

## What a live-app session should later exercise (the §6 live gate is PARKED per user instruction)

The §6 live-scenario gate is **PARKED** (per the user instruction — do NOT launch the app; a
live app session is unavailable). The drain-then-teardown remove is fully node-testable in this
battery (no live app needed). When a live-app session does run, it should exercise the **U-H8**
operator path end-to-end (the operator-UI confirmation dialog → `controller.hotRemove(name)` on
a real live store/engine) plus the U-H5/H4 live-pending note's "real operator-triggered remove
that drains then tears down a live store/engine" — i.e. `tests/unit-h4-hot-remove-live-pending-battery.md`
(§6 note) is NOT authored now.
