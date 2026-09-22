# Unit O-0 — Per-stage freeze measurement (PRECONDITION ARTIFACT) — Spec

**Status:** **DONE — ARTIFACT ACCEPTED (user DEC-1, 2026-09-20) WITH ONE RECORDED STRUCTURAL
GAP; the report field stays `status:"OPEN-structural"`.** The live battery has now RAN THREE
times (2026-09-17, 2026-09-20, 2026-09-20) and every leg was committed honestly; the THIRD run
(`:0`, spawn mode, `driver.build.verified:true` both legs, census **226/226** pinned, §12.13)
executed the RUL-1..RUL-6 fixes and produced BOTH legs at `status:"OPEN-structural"`,
`pass:false`, **`selfValidation.ok:true` + `errors:[]` + `gatingReasons:[]`** — a COMPLETED
MEASUREMENT WITH ONE RECORDED STRUCTURAL GAP: O-0 is **DONE** (the artifact is accepted as the
ARCH-GNOSIS-OFFLOAD gate input) and the REPORT stays honest (`OPEN-structural`), so it is **a
DONE unit with a recorded structural gap — never a FAIL and never a reported `"OK"`.** The spec LANDED and the
harness LANDED (the 5 `o0_*` blocks + the §3.6 hook + the pure report module; red→green + trio
history in §11). The committed artifact
(`docs/specs/unit-o-0-per-stage-breakdown.md`) is written by the live pass — **now in its THIRD
edition (run 3, host clock 2026-09-20; runs 1-2 named superseded inside it, raw JSON embedded)**:
the first run left 6 of the 11 stages `unseparated` (stages 1-3 structurally — §12 H2) with one
measured stage exceeding its own freeze window (§12 H3); the second run **fixed those two
classes** (stages 1-3 measured at the caller level, the window bound passing on all six rows) and
left **4** stages `unseparated` (`snapshot.clone`, `render.dom`, `render.ssr`, `post.style`) —
the state §12.12 records and RUL-1/RUL-3/RUL-4 re-rule; the third run **closed the RUL-1 emit
seams and the RUL-2 awaited round trip** (ids 9/10 now measured; `snapshot.pull` 85.9/179.2 ms
GPU-OFF) and leaves exactly **ONE structural id — `snapshot.clone`** (no main-side transport AND
the Electron IPC structured clone outside every host-side wrap) **plus the `derived` `post.style`
residual**. The adversarial pass found 4 MUST-FIX host defects (§7, now with the second run's
`L1`..`L12` dispositions in §7 §3c). **THE UNIT IS NOW DONE (DEC-1, 2026-09-20): the user ACCEPTED
the `snapshot.clone` structural gap, and §3.6b RUL-4 clause 7 was AMENDED — an
`OPEN-structural` report whose ONLY gap is the ACCEPTED structural set (`snapshot.clone` + the
therefore-derived `post.style`), with `selfValidation.ok:true`, `gatingReasons:[]`, the
window-bound check passing and the structural reasons recorded verbatim, DOES open the O-5
delegation gate (see clause 7 and §11).** The SUPERSEDED clause ("ONLY `status:"OK"` ⇔
`pass:true` opens the gate") is recorded in the decision row
**`O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`** (`docs/decisions.md`). A future main-side transport
carrying the main recorder's records remains a SEPARATE unit with its own gate; until it exists,
every O-0 report MUST stay `status:"OPEN-structural"` and may never be quietly reported `"OK"`.
Two OPEN defect rows the pass filed stay OPEN and are OWED (`docs/defects.md`:
`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS`, `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`) — the user
accepted the STRUCTURAL gap, **not** these two. The full records are **§12** (first run), **§12.12**
(second run) and **§12.13** (third run); the re-derived measurement rules are §2.2 (the stage set,
its seams and the closed TEN-id seam set — RUL-1), §3.4 (the corpus pin — RUL-5), §3.6 (the
awaited span — RUL-2) / §3.6b (the seam re-derivation, the main-transport ruling and the
structural-vs-pass contract — RUL-3/RUL-4), §4.2-§4.4 (the report `status`, the verdict forms),
§5 (`P-TP-3`, `P-HK-1`'s settlement clause), §6 (S14-S21 / F13-F22) and §7 (the adversarial
record + §3c the `L`-findings).

**Re-scoped per `docs/specs/gnosis-offload-review.md` §7 A-1 (`:400-402`):** O-0 is a
**PRECONDITION ARTIFACT, not a unit.** It is a **harness deliverable with a contract
on the REPORT SHAPE**, never on app behavior (`gnosis-offload-review.md:101-110`).
There is no red set to run and no user-visible end state to pin — the gate's
requirement is that the report be **falsifiable and non-imputable**.

**Layer (RCA-12, mandatory declaration — `gnosis-offload-review.md:90`, checklist
item 3 `:309`):** **`assembled-renderer`** — by construction. O-0 measures the
**executing `dist/` bundle driving a real CDP gesture against a real Electron
renderer** (`scripts/live-drive.mjs`'s `CDP` class, `live-drive.mjs:64`). This is
precisely the layer the node suite cannot see (`docs/specs/rca-live-bugs-green-pipeline.md`
§5 CA-2 `:126`, RCA-12 `AGENTS.md` item 12). An envelope-green or a node-green is
**not** O-0 evidence.

**Delivered by:** new `scripts/live-drive.mjs` blocks (§3) **plus a COMMITTED
artifact** (§4) — both now LANDED (§11) — **plus the measurement-only hook of §3.6,
which is IMPLEMENTED** (`src/shared/o0-hook.ts`, NEW; the five wrap-only call sites — **SEVEN
after RUL-1**; the guarded `window.__o0recorder` handle). **No `src/` behavior change:** the hook is
falsifiable and is inert when unarmed (no control-flow change, no reordering, no added
work — §3.6, §5 P-HK-1). **The re-derivation of §3.6b ADDS three caller-level/main-side
seams** (the H2 fix) — same discipline, still measurement-only, still inert when unarmed.

**Dependency (hard):** **no other unit — O-5, O-9(+O-3), O-10, O-1, O-2, O-4 — may be
delegated before this artifact exists** (`gnosis-offload-review.md:70-71` "a hard
precondition, not a unit"; `:365-366` "No unit lands before O-0's artifact and O-5's
budget row exist"; proposal §3.2 `:172-175`). The landing order is
**O-0 → O-5 → O-9(+O-3) → O-10 → O-1 → O-2** (`gnosis-offload-review.md:363`), each a
single-diff revert. **SATISFIED (2026-09-20, DEC-1): the artifact exists and is ACCEPTED under
the AMENDED §3.6b RUL-4 clause 7, so the precondition on O-5 is met and O-5 is the next queue
item after the two OWED O-0-area defect rows and the DEC-2 vitest-5 migration unit
(`docs/next-steps.md`).**

**Depends on (upstream of this spec):** the proposal gate
(`docs/specs/gnosis-offload-proposal.md`, O-0 row `:250`, §3.2 `:149-190`) and the
change-analysis verdict (`docs/specs/gnosis-offload-review.md`, §2.1(a) `:97-110`,
§3 O-0 row `:145-155`, §7 A-1/A-4/A-10 `:400-429`, §5 checklist `:305-317`).

**What O-0 fixes:** **nothing.** It changes no app behavior, no store, no IPC, no MCP
contract. It produces a number and a verdict string, and it **rules in or out**
cheap variants (A-4, `gnosis-offload-review.md:409-412`).

---

## 1. What the proposal asks

`docs/specs/gnosis-offload-proposal.md` **O-0** (`:250`) verbatim:

> **Discriminating measurement FIRST**: a named `scripts/live-drive.mjs` block that
> stages one freeze (`snapshot()` / derivation / assemble / `decorateShared` /
> reconcile / `render()` DOM / SSR / post-render layout) on a real folder-row click
> AND a real document-row click, at the operator corpus size; plus a **GPU-on vs
> GPU-off control** and a plain-`display:block` ablation of the 12 698.7 px grid
> track.

Acceptance (`:250`): *a recorded per-stage ms breakdown + the verdict "derivation is
X ms of the Y ms long task"; no fix is sequenced before this artifact exists.*

`docs/specs/gnosis-offload-review.md` §3 adds the load-bearing amendment
(**A-4**, `:409-412`):

> O-0 must measure the whole-store `IPC_RAG_SNAPSHOT` pull + serialization as a named
> stage, and must rule in/out "a doc-nav disclosure that performs no store read at
> all" (the cheapest possible variant of O-1).

and §4 (`:284-296`) states the gap that motivates it: the `'content'` path does **not
only** re-traverse and recompile — it first pulls the **whole store across IPC**
(`bridge.rag.snapshot()` → `IPC_RAG_SNAPSHOT` → `Runtime.getDefaultStore().listNodes()`
/ `listEdges()`; `src/renderer/sidebar-panes.ts:1995` → `src/main/main.ts:751-755`) plus
the doc-heads payload, **for a folder disclosure, which is client-side presentation
state and needs no store read at all**.

### 1.1 The evidence these stages must separate (each claim cited)

| Measure | Value | Source |
| --- | --- | --- |
| Real doc-nav **document-row** click (open a document) | page unresponsive **~1 011 ms**; `PerformanceObserver` long tasks `[439, 439]` | `docs/defects.md:26`; proposal `:22`; `docs/next-steps.md:30` |
| Real doc-nav **folder-row** click (pure disclosure) | **505 ms** long task, **39** DOM mutations, to reveal two rows | `docs/defects.md:26`; proposal `:23`; `docs/defects.md:52` (the generalized `PANE-SLOT-INSTABILITY-ON-DISCLOSURE` row) |
| Pane collapse / zone minimize (a class flip) | **2 556** DOM mutations, long tasks `[465, 52]`, gesture 2.5–2.9 s; `Profiler` self-time `translateNodeData` **13 ms**, `renderTree` **8 ms**, `enumPathWalks` **8 ms** | `docs/defects.md:40` (`PANE-TOGGLE-FULL-REASSEMBLY`, which records "`Profiler` self-time shows the JS is small (`translateNodeData` 13ms, `renderTree` 8ms, `enumPathWalks` 8ms)"); `docs/next-steps.md:24` (≈29 ms of ≈517 ms) |
| **Idle** window-resize round-trip (the control) | **6 ms** | `docs/defects.md:26`; proposal `:25` |
| The stage grid track | `#wiki-root` computed `grid-template-rows: 0px 12698.7px 0px`, `grid-template-columns: 220px 1583.91px 0px` | `docs/defects.md:27`; proposal `:50` (`A14`) |
| Every live run so far used `--no-gpu` | the GPU leg is **unmeasured** (listed as explicitly open in `A14`) | proposal `:49-53`; `scripts/live-drive.mjs:4397` (the `launchArgs` literal — `--no-gpu` unless `--gpu`; once `:2676`) |

**The honest position this spec encodes:** the dominant cost is asserted to be DOM
style/layout/paint (`docs/defects.md:40` — the `PANE-TOGGLE-FULL-REASSEMBLY` row, the
style/layout/paint argument's home in the tracker) — but the per-pass split has **never
been measured** (proposal `:44-46`, "the per-pass split is **NOT yet measured**").
O-0 exists to replace that assertion with a number, or to report the stage as
**unseparated** (§5).

---

## 2. Contract — the measurement (what, exactly, is measured)

**One freeze per block.** A block arms its observers, performs **exactly one**
hit-tested gesture, drains the observers, and reports. No block stages two freezes;
no block re-uses a previous block's timing.

### 2.1 The measured quantity

For every block the primary quantity is the **main-thread long-task total of the
measured window**: the sum of the `duration` of every `PerformanceObserver`
`longtask` entry (`entryTypes: ['longtask']`) that starts within the window
(`t0` = the mark immediately before the gesture dispatch; `t1` = the mark after the
renderer has quiesced — bounded by a poll on `requestAnimationFrame` + a
**recorded** quiesce timeout, never an unrecorded fixed sleep). This is the same
class of observation the motivating evidence used (`docs/defects.md:26`, `:40`), so
the O-0 numbers are comparable to it.

Alongside it, every block records:
- the **DOM mutation count** in the window (`MutationObserver` on `document.body`
  with `childList`+`subtree`+`attributes`+`characterData` — the `:40` method), and
- the **wall time** from the gesture dispatch to the first responsive
  `requestAnimationFrame` probe.

### 2.2 The stage set (CLOSED — 11 ids)

The stage ids are **closed** and are the report's stable join key. Every stage id is
present in **every** freeze row; a stage that cannot be separated is emitted with
`unseparated: true` and `ms: null` — **never imputed, never omitted** (§5, F4).

| # | Stage id | What it is | Boundary / evidence source | Layer of the work |
| --- | --- | --- | --- | --- |
| 1 | `snapshot.pull` | the whole-store `IPC_RAG_SNAPSHOT` pull — the SHELL'S OWN CALL SITE → IPC → main handler (`listNodes()`/`listEdges()`) + structured clone → renderer promise resolution (the whole ROUND TRIP, **end-to-end at the caller**) | `snapshot.roundtrip` — the `record()` wrap of the `await this.bridge.rag.snapshot()` call site in `src/renderer/sidebar-panes.ts` (symbols `loadEnvelopeCore` / the re-derive body; today at `:2009`, with the second pre-existing call site at `:1888`); main handler `IPC_RAG_SNAPSHOT` in `src/main/main.ts` (the `ipcMain.handle(IPC_RAG_SNAPSHOT, …)` body at `:785`, the recorder wrap `:786`); payload shape `src/shared/types.ts:481-502` | **renderer caller + IPC + main** |
| 2 | `snapshot.clone` | the **main-side handler share** of the round trip: the `IPC_RAG_SNAPSHOT` handler's store read + reply-payload construction. **It is NOT the structured clone** — Electron's own serialization of the handler's return value happens inside the IPC internals, *after* the handler returns and outside any span this repo can wrap (RUL-3) | `snapshot.clone` — the `record()` wrap *inside* the `IPC_RAG_SNAPSHOT` handler (`src/main/main.ts`, the `ipcMain.handle(IPC_RAG_SNAPSHOT, …)` body — the wrap at `:773`, the body `o0MainRecorder.record('snapshot.clone', () => ({ nodes: …listNodes(), edges: …listEdges(), store: … }))` `:773-777`), armed by the MAIN-side recorder instance (§3.6); **stays `structural: true` until a transport carries the main instance's records out** (§3.6b, RUL-3) | main + IPC |
| 3 | `docheads.pull` | the doc-heads payload fetch that rides the same path and aborts the re-derive on failure — the same CALLER-level round trip | `docheads.roundtrip` — the `record()` wrap of the `await this.bridge.rag.docHeads()` call site in `src/renderer/sidebar-panes.ts` (inside the same re-derive body; today at `:2019`, with the second pre-existing call site at `:1899`); `IPC_RAG_DOC_HEADS` `src/main/main.ts:653`; payload `RagDocHeadsPayload` `src/shared/types.ts:612-627` | **renderer caller + IPC + main** |
| 4 | `traversal.build` | `buildTraversal` — the derivation walk | `src/main/traversal.ts:326` (`export function buildTraversal(input: TraversalInput): TraversalResult`; the §3.6 wrap at `:331`) | renderer (in-process) |
| 5 | `envelope.assemble` | `assembleAppGraphEnvelope` — the pane-inclusive assembly | `src/renderer/pane-graph.ts:330` (`AppGraphAssemblyInput → AppGraphAssemblyResult`; the §3.6 wrap at `:335`) | renderer |
| 6 | `shared.decorate` | the C20 cross-document-shared pass | `src/renderer/sidebar-panes.ts:1493` (`private decorateShared(envelope)`; called at `:1520`, `:1576`, `:1655`, `:2499`; the §3.6 wrap at `:1499`) | renderer |
| 7 | `reconcile.roots` | `reconcileDocumentRoots` — the sole classifier | `src/renderer/content-reconcile.ts:422` (`NRootReconcileInput → NRootReconcileResult`; the §3.6 wrap at `:427`) | renderer |
| 8 | `reconcile.apply` | `Runtime.applyContentReconcile` — destroy/attach/replace of the classified roots | `src/renderer/runtime.ts:521` (`ApplyReconcileInput → ApplyReconcileReport`; the §3.6 wrap at `:527`) | renderer |
| 9 | `render.dom` | `render()` — the DOM emit: the `renderProducingProcess` call against the **`DomAdapter`** (`compilePath`/`rootNode.compile`/`mergePass2` are the *bootstrap* passes and are NOT inside this seam — RUL-1) | `src/renderer/runtime.ts` `render()`'s DOM emit — the `renderProducingProcess(liveActionable, byNode, this.adapter, this.domPrevMap, this.renderOptions)` call inside the `this.adapter.beginBatch()`/`endBatch()` pair (the `record()` wrap at `:324-325`; the `render()` body `:280-335`) | **assembled-renderer** |
| 10 | `render.ssr` | the SSR mirror emit: the SECOND `renderProducingProcess` pass in the same `render()`, against the **`SSRFragmentAdapter`** (`:167`) with its own `ssrPrevMap` | `src/renderer/runtime.ts` `render()`'s SSR mirror emit — the `renderProducingProcess(…, this.ssr, this.ssrPrevMap, …)` call (`:334` today). **`ssrHtml()` (`:1474` today) is the MCP READ surface, NOT the mirror emit**: it renders a fresh Markdown adapter and is never a stage. | renderer |
| 11 | `post.style` | post-render style/layout/paint inside the window — the residual after 1–10, derived from the long-task total | **derived** — see §5 P-TP-1; the residual is a computed field, never a timed probe | browser compositor (not separable by CDP) |

**Why stages 1-3 moved their seam to the CALLER (H2 re-derivation, §12 finding H2).** The
live pass proved the page-side seam is **structurally impossible**: `window.provident.rag.snapshot`
and `.docHeads` are `contextBridge` function properties with `writable:false,
configurable:false` (probed live; §12 H2), so a page-script wrap silently does not take and
all three stages came back `unseparated` in every leg (`hook.wraps: []`). The shell **owns**
the call: its own `await this.bridge.rag.snapshot()` / `docHeads()` sites are ordinary
`SidebarPanes` code, so a `record()` wrap there measures the **whole round trip** (call →
IPC → main-side `listNodes()`/`listEdges()` + structured clone → resolve) with the same
inertness discipline as the five render-path stages. **The A-4 discriminator is answered at
this CALLER level** — the count and ms the report names are the count and ms of the shell's
own reads, end-to-end; the main-side instance (§3.6) is an **optional refinement** that only
splits the round trip's inside from its outside, never a precondition for the discriminator.
`source` for a measured stage 1/2/3 is therefore **`'hook'`** (a recorder produced it), not
`'mark'`; `'mark'` remains the source of a stage no recorder could produce. **The `source`
value of an unseparated stage names where the value WOULD come from**, so an unseparated
1/2/3 whose recorder is absent/refused stays `'mark'` with the reason recorded (§3.6, §6 S14).

**RUL-1 — the closed seam set is TEN ids (was 8): `render.dom`/`render.ssr` get REAL seams, not `mark`-only.** The second live run reported ids 9/10 as `structural:true` with the reason "no seam exists in the executing bundle" (`L2s`) because the driver's `mark` source could never produce a value — **nothing marked the emit**. That is a **harness gap, not a structural absence**: the emit sites are ordinary calls in this repo's own code, so they are instrumented like every other seam. Pinned in §3.6 and the §3.6b seam table:
- the recorder's **PERMITTED set** (`O0_HOOK_SEAM_STAGES`) grows 8 → **10**: `snapshot.pull`, `snapshot.clone`, `docheads.pull`, the five render-path ids (`traversal.build`, `envelope.assemble`, `shared.decorate`, `reconcile.roots`, `reconcile.apply`) **plus `render.dom` and `render.ssr`**;
- the page-armable render-path set (`O0_RENDER_HOOK_STAGES`) grows 5 → **7** (the five + the two render emits), so the driver's page arm requests them — an armed id that is NOT in the armed set is off-set and DROPPED (§6 S9), which would otherwise leave ids 9/10 `unseparated` for a harness reason;
- `snapshot.clone` stays OUT of the page-arm set (no renderer seam can produce it, and arming it invites a phantom double-record — §6 F14);
- the boundary is a **closed set**: **for those ten stages only, and for no other id, may the hook bracket an existing call**. `post.style` (id 11) is `derived` and is never claimable by a recorder; an id outside the ten still throws `O0_HOOK_STAGE_NOT_ALLOWED` at construction AND at arm time (§3.6).
After RUL-1, ids 9/10 are **`source: 'hook'` when measured**; a run that still reports them `structural:true` must name the *instrumentation* gap (a bundle without the wrap), never "no seam exists" — the artifact's `L2s` reason string is **retired with its fix**.

**§2.3/§2.4 status after the live pass: UNCHANGED — the live run did not invalidate either**
(one ADDITIVE sequencing rule lands in §4.3, not here: the hook's armed window must equal
the freeze window — H3).
The two mandatory hit-tested gestures both resolved `path:'cdp'` (`realInput:true`, §12 §4.1's
`dispatch.hitAtDispatch`), and both controls ran (GPU-Δ and the `display:block` ablation, §12
§6.1/§6.2). One **caveat is recorded, not a re-derivation**: the §2.3 "largest child-row count"
pin degenerated on this corpus — the recorded `folderRowCensus` has **three** top-level rows
(`["archive"]`, `["docs"]`, `["notes"]`) each with `childRowCount: 0`, so the lexicographic
tie-break (not the count) chose `["archive"]` (§12 H7/H9). The pin stands as written; the
artifact's claim that the pick maximized child rows is **not** exercised by this run and says
so.

 the `Profiler` self-times
(13 + 8 + 8 ms — `docs/defects.md:40`) already exist and are **smaller than the
freeze by an order of magnitude**, which is the whole point — a JS-self-time-only
report is the mis-aimed lever the critique rejected (`docs/next-steps.md:24`).
`Profiler` output is permitted as a **supporting** diagnostic column, never as a
stage's `ms` for stages 1–10 and never as a verdict.

### 2.3 Gestures (both are mandatory, each in its own block)

Per `docs/specs/user-flow-audit.md` §3 (`:72`, `:81-83`), a row's evidence must prove
the gesture **path** via `elementFromPoint`; `live-drive.mjs` already implements this
as `ufHitProbe`/`ufRealClick` (`:169-206`), returning `path:'cdp'` only when the point
resolves to the target (or a descendant).

1. **Folder row** — a `#pane-doc-nav [data-folder-path]` row (the selector the existing
   `v3_docnav` block probes at `live-drive.mjs:1056-1058`; **re-read at the DOC-REVIEW
   pass: re-pin this anchor by symbol (`ufHitProbe`/`ufRealClick` + the `v3_docnav` block)
   before quoting a line**). **Row selection is pinned:**
   the block enumerates every `[data-folder-path]` row, picks the one with the largest
   child-row count (ties broken by lexicographic `data-folder-path` ascending — the
   `o0-2026-09-17` seed), and **records the chosen path** in the row
   (`target` + a `folderPath` field). A first-match pick would under-measure the
   operator corpus and make the artifact irreproducible, so the choice is pinned.
   The stage-1 evidence for this gesture is the **A-4 discriminator**: the report must
   state, per freeze, the **`snapshot.pull` count and ms for the folder gesture**
   (`0` / `null`, or a non-zero read). **Today's code always reads**
   (the unconditional snapshot read in `src/renderer/sidebar-panes.ts`'s re-derive body —
   cited by symbol, `loadEnvelopeCore` / the re-derive body); a report whose folder row
   shows a store read is the recorded proof of the A-4 finding, not a block failure.
2. **Document row** — a real doc-nav document row that focuses that document (the
   `U-1` / `uf_panes_12` gesture class — cited by symbol; the `MATRIX_ROWS` table no
   longer resolves by line).

Both gestures must be **hit-tested** (`path === 'cdp'`); a `native-fallback`,
`missing`, `zero-box` or `off-viewport` path forces `pass:false` (§5 P-TP-2, §6 F7).

### 2.4 Controls and ablation (mandatory)

- **GPU-on vs GPU-off.** Every O-0 run records the **GPU flag actually used** and the
  report must carry **both legs** for at least the two gesture blocks. Today the
  driver **hard-codes `--no-gpu`** in its launch args (`live-drive.mjs:4397` — the
  `launchArgs` literal), so the
  GPU-on leg is **not reproducible with the current driver**: the implementer adds a
  `--gpu` flag that makes the launch args conditional (`--no-gpu` unless `--gpu` is
  passed; default unchanged = safe). The flag name, default and effect are pinned
  here so the artifact is reproducible.
- **The 12 698.7 px track ablation.** The stage track is `grid-template-rows: 0px
  12698.7px 0px` (`docs/defects.md:27`); the ablation sets the stage's grid cell to a
  plain `display:block` (i.e. removes the grid-track sizing from the measurement path)
  and re-runs the **same** freeze, recording the delta. The ablation is applied to the
  rendered DOM for the measurement run only, is recorded in the artifact
  (`trackAblation.applied: true` + the exact style mutation), and is never persisted.
  If the platform/bundle cannot express the ablation (the stage cell is not a grid
  item in the executing bundle), the block reports `pass:false` with detail
  `ablation unavailable` — a **documented fail-state, never a park** (§6 F5).

---

## 3. The harness surface (specified against the real driver API)

### 3.1 Block names (CLOSED — 5)

| Block | Role | Emits |
| --- | --- | --- |
| `o0_folder_row` | one freeze, folder-row disclosure gesture | an O-0 freeze row (`gesture:'folder-row'`) |
| `o0_document_row` | one freeze, document-row open gesture | an O-0 freeze row (`gesture:'document-row'`) |
| `o0_gpu_control` | the GPU-on/off control: re-runs the two gesture freezes with the opposite GPU flag and pairs them | two freeze rows + the pairing record |
| `o0_track_ablation` | the `display:block` ablation of the 12 698.7 px track | two freeze rows (`trackAblation.applied` true/false) |
| `o0_repeat_determinism` | re-runs one gesture block and reports the **stage-id SET** of both runs (the determinism oracle, §5 P-SM-2) | the two run stage-id sets + `ms` values |

**Block count: 5.** Each drives **ONE** freeze (except `o0_gpu_control` /
`o0_track_ablation`, which are **paired control runs of the same gesture** — the
pairing, not a second measurement kind, is their point).

### 3.2 Block result shape (extends the §6.1 conventions, does NOT claim a row)

Every O-0 block returns **`diagResult(detail, extra)`** (`live-drive.mjs:406`, the
`function diagResult(detail, extra = {})` at `:406`) —
the driver's declared **non-row** shape for "measurement without a row verdict" —
with `extra` carrying the O-0 report fragment:

- `row: null`, `dclass: null`, `realInput: false`, `proxyPASS: false`, `pass: false`,
  `diagnostic: true` (from `diagResult`), and
- `extra.o0 = <the freeze row(s) of §4.3>`.

Three consequences, all deliberate:
1. **An O-0 block can never be promoted to a §5.U matrix verdict.** `MATRIX_ROWS` is
   the capped 8-row U-1..U-8 table (**cited BY SYMBOL — `export const MATRIX_ROWS`, once
   `:483-492`; it no longer resolves by line**) and `reconcileMatrixRows`
   (`export function`, once `:510-545`) treats a reported `U-<n>` row as a matrix row — O-0 reports **no matrix
   row and no extended row** (`ROW_EXTENDED`, `export const`, cited by symbol; once `:552-567`), so §5.U's cap of 8
   (`docs/specs/user-flow-audit.md:32`, `:94-103`) is untouched.
2. **`proxyPASS` stays `false`** because O-0's verdict is not a proxy for a
   user-visible end state — it is a measurement whose honesty rule is
   `unseparated:true` (§5). It therefore cannot manufacture a `proxyPASS` finding.
3. **A block that crashes is a loud FAIL**, not a silent skip: the driver's block loop
   prints `FAIL` and increments `fail` on a throw and sets
   a non-zero exit code (`process.exitCode = fail > 0 || !recon.ok ? 1 : 0`, then
   `process.exit(process.exitCode || 0)`; both cited by symbol — the block loop's numeric
   anchors are unstable).

#### 3.2.1 The driver's row assembly RECORDS the band it used (`hook.toleranceMs`)

**Pinned by the P-TP-3 remand (the band-channel fix).** The driver emits each freeze
row's `hook` block (`scripts/live-drive.mjs`'s O-0 row assembly, the `hook: {…}` literal
that already records `armWindow`/`freezeWindow`/`armCount`/`disarmCount`/`stageRecords` —
**cited by symbol**; once `:946-969`) and it MUST record, in that same block, the **exact band its own
window-bound test used** as `hook.toleranceMs`:

- the recorded value is the driver's configured band constant
  (`O0_HOOK_LONGTASK_TOLERANCE_MS`, **40** ms — `scripts/live-drive.mjs:518`), so the
  number written on the row and the number the driver judged the row with are **one
  value**;
- the band is **never** inferred from, or smuggled through, a **free-text** channel — not
  `failReasons`, not a reason's prose, not any other string in the row. The oracle,
  `deriveO0StageVerdict` and the validator read the **recorded field** (§4.3), never text;
- the driver's own derived stage verdict calls `deriveO0WindowBound(row)` with **no
  options** (`scripts/live-drive.mjs`'s `o0DeriveStageVerdict` — the `wb = …` line,
  cited **by symbol** because its numeric anchor is unstable), so the driver *already*
  depends on the row-recorded band; the
  driver's **inline window rule** does the same (the `EXCEEDS the freeze window` reason
  builder, also cited **by symbol**; it prints the row's recorded band). The pure module's
  validator **was** the one consumer that did not — it once passed the constant explicitly
  (the old `src/shared/o0-report.ts:298` call site) — and **the fix HAS LANDED**: the
  validator now calls `deriveO0WindowBound(run)` with **no options** at `:329-332`
  (see §8.2's band-source block), so all three consumers read ONE band.

A row that carries **no** `hook.toleranceMs` is judged at the 40 ms **default** (§4.3), so a
live run whose rows all omit the field is a **constant-inferred** band rather than a recorded
one — recorded as a defect, never read as a pass (§4.3's band rule, §12.11).

### 3.3 Args and CLI (pinned)

Existing flags honored unchanged: `--mode=` / `--port=` / `--cdp-port=` / `--home=` /
`--seed=` / `--groups=` / `--block=` / `--display=` / `--no-seed` / `--keep-home` /
`--connect` (`live-drive.mjs`'s CLI parse inside `main(argv)` — cited by symbol; once
`:2643-2659`). New for O-0 (both minimal, both default-safe):

| Flag | Default | Effect |
| --- | --- | --- |
| `--gpu` | off | launch args carry `--no-gpu` **unless** `--gpu` is passed (**`launchArgs`**, `live-drive.mjs:4397` — `...(opt.gpu ? [] : ['--no-gpu'])`; the "hard-coded `--no-gpu`" is now conditional). Default behavior is unchanged. **In `--connect` mode the driver does not spawn** (the `if (!opt.connect)` guard around the spawn — cited by symbol), so the GPU-on leg is produced by running the operator's app **without** `--no-gpu` and attaching with `--connect`; the artifact records the app-side flag per leg. |
| `--o0-corpus=<n>` | none | the operator corpus census the artifact is claimed at; the block compares it against `rag.list_documents` and the snapshot census and forces `pass:false` on mismatch (§6 F8). |
| `--o0-out=<path>` | none | **REQUIRED for an O-0 artifact run.** Writes the emitted report JSON to `<path>` (the driver today only prints; the artifact needs a file). A run without `--o0-out` produces console output only and **cannot** produce the committed artifact — recorded as a fail-state in the artifact's own provenance (`artifactPath: null`). |

`--display` propagates through the spawn env (the `spawn(...)` env object in `main()` —
`DISPLAY: ':' + (opt.display ?? '1')`, `live-drive.mjs:4405`, and the leading-colon
normalization at `:4351`); the repo's env note requires a delegated
live-runner to propagate the display (`docs/next-steps.md:67`).

### 3.4 Corpus (operator size; the determinism seed)

- **Size (THE PIN):** the **operator corpus — 226 documents** (`docs/defects.md:26`,
  `gnosis-offload-review.md:153`, proposal `:18`). O-0's *quantitative* claim must be
  at operator size; the two other states (empty corpus, single document) are only
  structural checks on the report shape (§6 S1/S2), never a substitute. **The SIZE is
  the pin; the SOURCE is a recorded variable (H7 re-derivation).** The live pass could
  not reach the operator's persisted store (it lived in `/tmp` and was gone; §12 H7),
  so the pinned **size** was reached by a driver **spawn** plus a seeded registry
  instead. A run that reaches 226 documents by ANY recorded source satisfies §3.4; a
  run that reaches a different size does not, whatever its source.
- **Source (RECORDED, not pinned):** the operator corpus is *reachable* only as a
  persisted store, so the sanctioned O-0 run path remains `--connect` against the
  operator's running app + its persisted store (launched with a writable user-data dir
  per `docs/next-steps.md:34`). Because that store is not always present, the run path
  is **one of two recorded sources**, and the artifact must state which one it used
  (`corpus.source`, plus `driver.runMode`):
  1. **`operator-store`** — `--connect`: the observed census is the operator's own
     (`corpus.documents` MUST then be 226 or the census gate fails, §6 F8); or
  2. **`--o0-corpus`** — **spawn + a seeded corpus**: the driver spawns the app and
     imports a deterministic markdown tree to reach the pinned **size**, via the three
     default-safe harness flags landed by the live pass (`--corpus-root=<dir>`,
     `--strict-seed`, and the existing `--seed=<dir>`; §12 H7 + §1). `driver.seedCorpus`
     alone (`live-drive.mjs`'s `seedCorpus`, two synthetic files `alpha.md`/`beta.md`)
     is the **S2** shape and can never satisfy this clause.
  **The document BYTES are then a recorded variable too**: a seeded corpus is
  corpus-representative *in structure*, not necessarily in byte size, and the artifact
  says so in its own words rather than implying the operator's numbers (§12 H7).
- **Pinned deterministic seed:** **`o0-2026-09-17`** — the string the block uses for
  (a) the ordering of the paired control runs, (b) the `run.seed` field, and (c) the
  seeded-corpus content when source 2 is used. It is a **recorded constant**, not a
  random value; the `ms` values are explicitly free under it (§5 P-SM-2).

### 3.5 Run commands (the artifact must record the exact ones used)

```bash
# 1) rebuild the EXECUTING bundle first (the launcher rebuilds internally)
npm run build

# 2) the GPU-OFF leg (today's sanctioned launch path). Run against the operator's
#    app on :3787/:9222 (--connect attaches; the driver does not spawn).
node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 \
  --display=:0 --o0-out=/tmp/o0-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism

# 3) the GPU-ON leg (paired). The APP must be (re)started WITHOUT --no-gpu; then
#    attach. --gpu records the leg's identity in the emitted run rows.
node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --gpu \
  --display=:0 --o0-out=/tmp/o0-gpuon.json --block=o0_gpu_control

# 4) the trio (required once the harness code lands)
npm test && npm run typecheck && npm run build
```

`DISPLAY` must be propagated (`--display=:0` or `DISPLAY=:0` in the env — the repo's
env note, `docs/next-steps.md:67`; the spawn sets it at `live-drive.mjs:4405`). A
run whose display is wrong cannot drive the rendered DOM and is a **documented
fail-state** (§6 F6), not a park.

### 3.6 Bundle identity (MANDATORY — the repo's ENV NOTE)

`docs/live-testing.md:119-124` requires: **"Rebuild first, then start, and verify the
EXECUTING bundle (compare the served `renderer.js` with the on-disk file) before
trusting a live verdict."** The O-0 artifact must therefore carry `driver.build` with
the identity of the bundle that actually executed: the mtime + byte length (and/or a
hash) of `dist/renderer/renderer.js` and `dist/main/main.cjs` **as served**, compared
against the on-disk files. A report whose `driver.build.verified !== true` is
**`pass:false`** (§6 F2) — never a provisional pass.

**Measurement-only hook — IMPLEMENTED (the honest limit, and its delivered seam).**
The renderer exposes **no handle to the app `Runtime` or the `SidebarPanes` host**
(`window.provident` is the preload bridge only — `src/main/preload.ts:642` + the
`sidebar` delegation surface `:578-636`), so stages 4-8
(traversal/assemble/decorate/reconcile) are **not** separable by a pure CDP probe. The
allowance below is therefore no longer merely "permitted": it is **delivered** as
`src/shared/o0-hook.ts` (NEW, PURE, node-testable — no `window`, no DOM, no import
side effect) + **five wrap-only call sites** (SEVEN after RUL-1 — the two render emits) + the guarded `window.__o0recorder` arm
target. The three binding constraints are unchanged:
(a) it is inert when unarmed and changes no control flow;
(b) it may only record `performance.mark`/`performance.measure` around the existing
call sites **without reordering, adding or removing work**;
(c) an armed hook that changes timing **is itself a falsifiable row** — now its own
register row **§5 P-HK-1** (split out of P-TP-1's "the hook is inert" clause) — and a
hook-induced change to the mutation count or the long-task total forces `pass:false`.

**The recorder (exact landed semantics).** `createO0HookRecorder({ stages?, perf? })`
(`src/shared/o0-hook.ts:202`) returns
`{ isArmed(), arm(stages?), disarm(), record<T>(stage, fn), records(), state(), reset() }`,
with:

- `O0_HOOK_STAGES` = the **five** render-path stages 4-8 in §2.2 order (`:29-47`);
  `O0_HOOK_MARK_PREFIX = 'o0:'` (`:70`); `O0_HOOK_STAGE_NOT_ALLOWED` (`:73`);
  `O0_HOOK_RECORD_INVALID` (`:76`); **`O0_HOOK_LONGTASK_TOLERANCE_MS = 40`** (`:79`) —
  the §3.6(c) band. It is **distinct** from `tolerance.reconcileMs`, the driver's
  residual band (`O0_RECONCILE_TOLERANCE_MS`, 50 ms).

  **The 40 is the DEFAULT, not the band channel (the P-TP-3 field pin).** The band a
  live run is judged with is the **RECORDED** row value `hook.toleranceMs` (an
  **additive, optional** field on the run's `hook` block, §4.3), and the band rule has
  exactly these semantics:
  - `deriveO0WindowBound(run)` with **NO options** uses the **row-recorded** band —
    `run.hook.toleranceMs` when it is a non-negative finite number, else the default
    **40 ms** (`O0_WINDOW_TOLERANCE_MS`, `src/shared/o0-report.ts:68`);
  - an explicit `{ hookToleranceMs }` argument **overrides** for the oracle's own tests
    (the drawn `tol ∈ {0, 40}` case, §5 `P-TP-3`), and the row still RECORDS the same
    band, so the argument and the row agree;
  - the **three consumers must agree** on that one band source: `deriveO0WindowBound`'s
    default, `deriveO0StageVerdict` (which takes **no** tolerance argument — so a band
    that is not recorded on the row is unrecoverable, and §4.4's two verdict forms would
    be undecidable for the same row), and the report validator (`validateO0Run`), which
    MUST call `deriveO0WindowBound(run)` **without** an explicit tolerance — **LANDED at
    `src/shared/o0-report.ts:329-332`** (§8.2's band-source block).
  - **The defect this rule closed (FIXED — the band fix LANDED):** the validator used to
    pass a hard-coded constant while the oracle honoured the recorded field
    (`src/shared/o0-report.ts:330`, once the defect site at `:298`) — a **one-line host
    defect**, so the two consumers judged the same row against **different** bands and a row
    recorded at a 0 ms band validated against 40 ms (§12.11). **The validator now calls
    `deriveO0WindowBound(run)` with NO options and reads the row-recorded field**, so all
    three consumers agree on ONE band again. A free-text
    band channel (the band recovered from a `failReasons` string) is **not** a legal
    substitute: the band is a recorded row FIELD or it is absent.
- **Unarmed `record()` is `return fn()`** (`:257-260`): no mark, no measure, no
  record, no throw, no control-flow change.
- **Armed**, it brackets the EXISTING call: `mark('o0:<stage>:start')` → the call →
  `mark('o0:<stage>:end')` + `measure('o0:<stage>', start, end)`, committing the span
  (`ms`, rounded to µs-precision) on completion (`:183-193`). A **throw propagates
  untouched and commits nothing** — the hook never swallows or rewraps.
- **The AWAITED span (RUL-2 — the `L5` fix, pinned HERE as the ONE shape).** A caller-level
  seam whose call returns a promise MUST be recorded with the span covering the round
  trip, not the promise's creation. `record` therefore gains an **overload** and the
  caller sites use a `async` thunk:

  > `record<T>(stage: string, fn: (() => T) | (() => Promise<T>)): T | Promise<T>`

  with the pinned semantics: the start mark is taken before `fn()`; the end mark +
  measure are committed **when the span settles** — on resolution, or on rejection. The
  `ms` is therefore measured **across settlement** (start → the settling timestamp), and
  the committed `O0HookRecord` keeps the same shape (`stage`/`ms`/`startMark`/`endMark`/
  `measureName`). The record is committed by the module, not by the caller: the caller's
  `await getO0HookRecorder().record('snapshot.pull', async () => this.bridge.rag.snapshot())`
  returns the same value the bridge's promise resolves to (never a wrapper, never a copy).
  - the **error path**: a rejected round trip **still closes the span** — end mark +
    measure committed, the error recorded on the record (`error: '<the rejection's
    message>'`) — and the rejection **propagates untouched** to the caller, so the
    existing abort-on-failure control flow of the re-derive body is unchanged. **A
    dangling start mark is a defect**: no arm/disarm, throw, rejection or refusal may
    leave an `o0:<stage>:start` mark without its `end`+`measure` pair.
  - an **unarmed** `record()` stays `return fn()`: it must NOT await, NOT wrap, and NOT
    change the returned value's identity (the inert-when-unarmed contract, `P-HK-1`).
  - **Which shape is pinned and which is rejected.** The rejected alternative is
    `record(stage, () => { const p = call(); return p })` with a caller-side
    `.finally()` closing the span: it moves the settlement semantics into every call
    site (N sites, N chances to forget), it cannot commit the measured `ms` from the
    module's own perf port, and it makes the error path a per-site concern. ONE shape is
    pinned — the async thunk above — and a site that passes a promise-returning thunk
    WITHOUT `async`/`await` is exactly the `L5` defect and is a review finding.
- An **off-set** stage (armed, but not in the armed set) is a pass-through counted in
  `state().dropped` (`:179-181`) — dropped, never measured.
- `arm()` on an already-armed recorder returns `false` and **never clears** the
  measurement window; `disarm()` on an unarmed recorder returns `false` — **double-arm
  / double-disarm are idempotent** and never double-count (`:157-172`).
- A stage id outside the recorder's PERMITTED set — the **TEN** seam ids of §2.2 (RUL-1)
  — **throws** `O0_HOOK_STAGE_NOT_ALLOWED` at construction
  AND at arm time (`:117-128`) — a mis-pinned stage is a loud config error, never a
  silently inert recorder. `post.style` (id 11) is NOT in the set: it is `derived` and
  is never claimable by a recorder.
- `stagesFromO0HookRecords(records, ids?)` → `{ stages, measured, unseparated }`
  (`:231-273`): a recorded stage's `ms` is the **SUM** over its call sites (the
  `decorateShared` 4-call-site case — one site would under-report); an **unrecorded**
  stage is `ms:null` + `unseparated:true` + `source: 'hook' | 'mark' | 'derived'`
  (`hook` = a permitted hook stage, `derived` = §2.2 stage 11, `mark` = a stage only
  the CDP probe can separate). A malformed, off-set or negative record **throws**
  `O0_HOOK_RECORD_INVALID` — a malformed record is never imputed into a stage `ms`
  (§6 F4).
- `deriveO0HookInertness(unarmed, armed, { longTaskToleranceMs? })` →
  `{ inert, deltaMutations, deltaLongTaskTotalMs, failReasons }` (`:299-332`):
  `inert` **iff** `Δmutations === 0` **and** `|ΔlongTaskTotalMs| ≤ tolerance` (default
  the recorded 40 ms band). A malformed pair is **never** silently inert, and every
  `failReasons` line NAMES the offending field.
- `getO0HookRecorder()` is the app-wide recorder, created **lazily** (`:219-223`);
  each `createO0HookRecorder()` value is independent (per-run state), and
  `records()`/`state()` hand back **copies** (`:129-131`, `:196-201`).

**The sealed call sites (file:line) — SEVEN after RUL-1.** Each wraps the EXISTING body
verbatim in `getO0HookRecorder().record('<stage>', …)`; the body is moved unchanged and no
work is reordered, added or removed:

| Stage | Declaration | The `record()` wrap |
| --- | --- | --- |
| `traversal.build` | `src/main/traversal.ts:326` | `:331` |
| `envelope.assemble` | `src/renderer/pane-graph.ts:330` | `:335` |
| `shared.decorate` | `src/renderer/sidebar-panes.ts:1493` | `:1499` — its **4** call sites stay 4 (`:1520`, `:1576`, `:1655`, `:2499`); each call site is one recorded span, summed by the aggregation |
| `reconcile.roots` | `src/renderer/content-reconcile.ts:422` | `:427` |
| `reconcile.apply` | `src/renderer/runtime.ts:521` | `:527` — the `result/next` guard stays inside the recorded span |
| **`render.dom`** (RUL-1) | `src/renderer/runtime.ts` `render()`'s DOM emit (the `record()` wrap at `:324-325`) | the wrap is the `renderProducingProcess(liveActionable, byNode, this.adapter, this.domPrevMap, this.renderOptions)` **call only** — **inside** the existing `this.adapter.beginBatch()`/`endBatch()` pair, which stays outside the span (`:316` / `:332` today); `this.domPrevMap = dom.prevMap` stays outside too |
| **`render.ssr`** (RUL-1) | `src/renderer/runtime.ts` `render()`'s SSR mirror emit (the `record()` wrap at `:334`) | the wrap is the second `renderProducingProcess(…, this.ssr, this.ssrPrevMap, …)` **call only**; `this.ssrPrevMap = ssr.prevMap` stays outside. `ssrHtml()` (`:1474` today) is NOT instrumented — it is the MCP read surface (§2.2 id 10) |

**The seven sites and the seven-stage split.** The five render-path ids 4-8 plus the two
render emits 9/10 are the **seven** stages the renderer's own instrumented call sites
produce; the three caller/main ids 1-3 come from the shell's `await … record(…, async () => …)`
pulls and the main-side handler (§3.6b). Together: **10 recorder seams**, 11 stage ids
(`post.style` is `derived`).

**The arm target and `refused[]` (corrected contract — §3a finding 5 / §6 F15).** The renderer
publishes a **hardened projection** of the app-wide recorder as the guarded
**`window.__o0recorder`** (`src/renderer/runtime.ts`, published today at `:83`, inside
`installO0RecorderHandle()` at `:80-90`). The published
value exposes **exactly five keys — `{arm, disarm, isArmed, records, state}`** and **neither
`record` nor `reset`**: a page script must not be able to commit a measurement or erase one. It
is installed **on first arm, from inside a function** — never at module scope — so importing the
renderer publishes nothing. (The landed code violates both halves today: it assigns the FULL
recorder at module scope. The corrected contract is the pin; §3a finding 5 is the record.)

The driver's page-side hook (`live-drive.mjs`, the `O0_HOOK_SOURCE` source string) installs
`window.__o0`, disarms any leftover recorder, then arms the render path through that handle
(its `state.renderer` half); the caller-level seams of §3.6b are recorded **inside the bundle**
and need no page-side wrap — the page hook's `O0_BRIDGE_STAGES` bridge-wrap map is therefore
**history, not contract** (the live pass proved it can never take: §12 H2). A seam that refuses
the wrap or is absent is **not** recorded as measured. **A refused or absent handle is
RECORDED, never silently measured**: `refused[]` carries `{ stages, reason }` (its
`state.renderer` push) and the freeze row records `hook.rendererArmed:false` + `hook.refused`
(the row's `hook` block), so the five stages come out `ms:null` + `unseparated:true` (§6
**S8**). The report then fails the reconciliation (§5 P-TP-1 / §6 F4) instead of imputing a
value.

### 3.6b The seam re-derivation (H2) + the two recorder instances

**The problem the live pass proved.** The page-side hook can wrap only what a page script
can reach. `window.provident.rag.snapshot` / `.docHeads` are **non-writable,
non-configurable `contextBridge` properties** (`{writable:false, configurable:false}`,
probed live — §12 H2), so `obj[key] = wrapped` silently does not take and the guard
(`obj[key] !== wrapped`) refuses: `hook.wraps: []` and stages 1-3 `unseparated` in
**every** leg. No page-side wrap can ever separate them; the seam must move into code the
shell already executes.

**The re-derived seam set (what each measures, and its `source`).** Every seam below is a
`getO0HookRecorder().record('<stage>', …)` / main-recorder `.record('<stage>', …)` wrap of
an EXISTING call, holding §3.6(a)/(b) unchanged: inert when unarmed, body moved verbatim,
no work reordered/added/removed.

| Seam (stage id) | Recorder instance | The wrapped existing call | What the span covers | `source` when measured | `source` when not measured |
| --- | --- | --- | --- | --- | --- |
| `snapshot.roundtrip` → **`snapshot.pull`** | the RENDERER app-wide recorder (`getO0HookRecorder()`) | the `await this.bridge.rag.snapshot()` call site in `src/renderer/sidebar-panes.ts`'s re-derive body (symbol `loadEnvelopeCore`), rewritten **per RUL-2** to `await getO0HookRecorder().record('snapshot.pull', async () => this.bridge.rag.snapshot())` (`:2009` today, second pre-existing site `:1888`) | the whole ROUND TRIP at the CALLER: call → IPC → main handler → store read → **Electron's structured clone + IPC round trip** → promise resolution. **This is the A-4 discriminator's ms, and per RUL-2 it is the `ms` ACROSS SETTLEMENT, never the promise-creation time** | `'hook'` | `'mark'` |
| `snapshot.clone` → **`snapshot.clone`** | the **MAIN-side** recorder instance (refinement) | the body of the `IPC_RAG_SNAPSHOT` handler in `src/main/main.ts` — the `record('snapshot.clone', () => ({nodes, edges, store}))` wrap (the `ipcMain.handle(IPC_RAG_SNAPSHOT, …)` body at `:785`, the wrap `:786`; `listNodes()`/`listEdges()` + the reply payload literal) | the MAIN-side **handler** share alone: the two store reads + the reply-payload construction. **NOT the structured clone** (RUL-3): the clone happens in Electron's IPC internals, after the handler returns, outside any wrap available to this repo | `'hook'` | `'mark'` |
| `docheads.roundtrip` → **`docheads.pull`** | the RENDERER app-wide recorder | the `await this.bridge.rag.docHeads()` call site in the same re-derive body, rewritten **per RUL-2** (`:2019` today, second site `:1899`) | the same CALLER-level round trip on the doc-heads payload, `ms` across settlement | `'hook'` | `'mark'` |
| **`render.dom`** (RUL-1) | the RENDERER app-wide recorder — the seam is **inside the bundle** (`src/renderer/runtime.ts` `render()`), so it needs no page-side wrap | the `renderProducingProcess(…, this.adapter, this.domPrevMap, …)` DOM emit (the `record()` wrap at `:324-325`), inside the existing `beginBatch()`/`endBatch()` pair | the DOM emit alone — the `DomAdapter` render pass, **not** `compilePath`/`rootNode.compile`/`mergePass2` and **not** the batch boundaries | `'hook'` | `'mark'` |
| **`render.ssr`** (RUL-1) | the RENDERER app-wide recorder (same bundle-internal seam) | the second `renderProducingProcess(…, this.ssr, this.ssrPrevMap, …)` SSR mirror emit (the `record()` wrap at `:334`) | the SSR mirror emit alone (`SSRFragmentAdapter`); `ssrHtml()` is NOT in the span (§2.2 id 10) | `'hook'` | `'mark'` |

**The A-4 discriminator is answered at the CALLER level.** The report's read count/ms is the
count/ms of the shell's **own** `snapshot.roundtrip` records inside the freeze window — an
end-to-end observation that does not depend on any main-side seam. The main/renderer split
(`snapshot.clone`) is an **optional refinement**: it separates the round trip's *inside* (the
main handler) from its *outside* (IPC + queue + the renderer's await), and a run without it
still answers A-4 with a real number (and additionally reports `snapshot.clone` as
structurally unseparated, §6 S14).

**RUL-2 — the caller-level span MUST cover the AWAIT (the `L5` fix), and this is the ONE pinned shape.** The second live run measured `snapshot.pull`/`docheads.pull` at **0.0-0.2 ms** because the landed seam wrapped only the **synchronous call** — `snapshot = await getO0HookRecorder().record('snapshot.pull', () => this.bridge.rag.snapshot())` (`src/renderer/sidebar-panes.ts:2009`, second site `:1888`; doc-heads `:2019`/`:1899`) — so the span closed at promise creation while the whole-store payload (**6 102 nodes / 9 266 edges**) crossed IPC **outside** it. That `ms` is **not the round trip**, and the real IPC + structured-clone cost hid in the row's `112-126 ms` residual. The pinned contract:
- the span is recorded **around the awaited expression**: `await getO0HookRecorder().record('<stage>', async () => this.bridge.rag.snapshot())` — the **async-thunk** shape of §3.6's widened `record()` signature;
- the committed `ms` is measured **across settlement** (start mark → the settling timestamp), so it covers call → IPC → main handler → store read → structured clone → resolve;
- the **error path** is explicit: a **rejected** round trip still **closes** the span (end mark + measure committed, the error recorded on the record) and the rejection **propagates untouched**, so the re-derive body's existing abort-on-failure path is unchanged. **A dangling start mark is a defect**;
- the unarmed path is unchanged: `return fn()`, no await, no wrapper, no identity change (`P-HK-1`);
- the rejected alternative (`record(stage, () => call())` with a caller-side settlement hook) is **NOT** the pin: it re-implements the settlement semantics at every call site and cannot commit the `ms` from the recorder's own perf port (§3.6).
Consequence for the numbers: after RUL-2 the **A-4 ms is measured** (the count was already real — `L4`'s 1 folder-row / 2 document-row reads), and the residual stops absorbing the unmeasured round trip (`L12`'s "the residual is not cleanly style/layout/paint" caveat narrows accordingly, and must be restated in the artifact).

**RUL-3 — the main-side transport: `snapshot.clone` stays `structural: true`, with the REASON corrected (and no reply-serialization seam is pinned).** The rule asks for the span that DOES measure the reply payload construction/serialization inside the `IPC_RAG_SNAPSHOT` handler, so `snapshot.clone` becomes a measured number. The audit result, pinned as the contract:
- **What the landed wrap measures:** the main handler's `record('snapshot.clone', …)` (`src/main/main.ts:785-786`; once `:773-777`) brackets the handler body — `listNodes()` + `listEdges()` + the reply-payload literal. That IS the main-side **reply-payload construction** share, and it is the right site for it.
- **What it canNOT measure, by construction:** Electron's **structured-clone serialization of the handler's return value** happens in the IPC internals *after* the handler returns. Nothing in `src/main/main.ts` (or any host code) is on that path, so no wrap in this repo can span it. The stage's §2.2 name therefore overstates the seam: the honest stage is the **main handler share** (store read + payload assembly), and the serialization share is named as **structurally unmeasurable from the host side**.
- **Therefore:** `snapshot.clone` remains `{ ms: null, unseparated: true, source: 'hook', structural: true }` with `structuralReason` naming **exactly** this: (i) the MAIN instance's records are **not transported** out of the main process into the renderer/report (the observed `L3s` state: `driver.mainSeamArmed:false`, `hook.stageRecords` carries **no** `instance:"main"` entry), **and** (ii) the IPC structured clone itself is outside every host-side wrap. The reason must name BOTH, and the report's residual explanation must name `snapshot.clone` as one of the stages whose share the residual therefore absorbs.
- **The one change that would make it measured** (not owed by O-0, recorded so the reason is falsifiable): a channel carrying the main instance's records into the report (or a preload/`ipcMain` hook on the reply path). Until such a channel exists in the executing bundle, the stage is structurally unseparated **and that is a legal, recorded outcome** under RUL-4 — never an imputed number.
- **A note on the inside/outside split, restated honestly:** with RUL-2's caller span measured and this handler span unmeasured, the *measured* pair is the round trip (1) **and** the render-path stages (4-10); the split of the round trip into "handler body" vs "IPC serialization + queue" is **not offered** by this harness. The report must say so wherever it discusses the split.

**The two recorder instances (arm/disarm, and the union).** The report carries ONE stage row
per stage id; the records may come from two recorder instances — the renderer's app-wide one
and a **second, separate main-side instance** (an independent `createO0HookRecorder()`, not
the app-wide singleton). Both are **inert when unarmed** (§3.6(a)), and both must be armed by
the driver for a freeze: the renderer instance through the published page handle (§6 F15), the
main instance through the driver's own spawn-side arm (the driver starts the app, so it can
arm the main instance without a page script; a `--connect` run cannot, which is recorded, not
silently assumed). If the two instances record the SAME stage id in one freeze window, the row
is `pass:false` with a reason naming the duplicated stage (§6 F14/S14) — one stage, one
measurement source.

**The union is aggregated by ONE pinned call.** `stagesFromO0HookRecords(records, ids)` takes
the **union of both instances' records** for the freeze window and emits exactly the ids it is
given (§3.6's landed module, `src/shared/o0-hook.ts:335` — `stagesFromO0HookRecords`); for the merged 11-row freeze
table it is called with the full `O0_STAGE_IDS` list, exactly as `tests/unit-o-0-hook-contract.test.ts`
H9's explicit-id-list row pins. The recorded `hook.stageRecords[]` must carry, per record, the
instance it came from (`'renderer' | 'main'`), so a reader can attribute every number.

**The recorder's permitted stage set widens BY CONSTRUCTION, to TEN ids (RUL-1), and the render-path armable set widens to SEVEN.** Two distinct constants, both recorded in the artifact:
- `O0_HOOK_SEAM_STAGES` = the **TEN** stage ids a recorder instance may be **configured** for:
  `snapshot.pull`, `snapshot.clone`, `docheads.pull` **plus** the five render-path ids
  (§2.2 ids 4-8) **plus the two render emits `render.dom` / `render.ssr`** (ids 9/10 — RUL-1).
  The construction/arm-time guard (`O0_HOOK_STAGE_NOT_ALLOWED`) accepts exactly this set —
  **10 ids, a closed set, for those stages only**; `post.style` (id 11) is never a recorder id.
- `O0_RENDER_HOOK_STAGES` = the **SEVEN** stages a page-side `arm()` may request: the five
  render-path ids 4-8 **plus** `render.dom` / `render.ssr`. Rationale: ids 9/10 are
  bundle-internal seams on the same render path, so a page script arming the render path
  arms them too; an armed id that is NOT requested is off-set and DROPPED (§6 S9), which
  would leave ids 9/10 `unseparated` for a harness reason (`L2s`'s failure mode). The
  boundary is unchanged: a page script may arm the render path, **never widen its own seam
  set** (it can request no id outside the ten), which is the §6 F15 hardening's runtime meaning.
- `snapshot.clone` stays in the **permitted** set (the main instance is created with it) but
  OUT of `O0_RENDER_HOOK_STAGES` (no page-side arm of it — §6 F14's double-record guard).

This is the **only** permitted change to §3.6's landed module: an ADDITIVE wider configuration
constant plus the render-path subset; no new wrapper shape (the async overload of §3.6 is the
`L5` fix and is its own pinned change), no new emission, no new work.

**If a sub-split stays impossible, say so — the exact `unseparated` reporting rule.** When the
main-side records are not transported (`--connect`, a refused arm, or a bundle without the main
seam), `snapshot.clone` is emitted `{ "ms": null, "unseparated": true, "structural": true }`
with `structuralReason` naming the missing transport + the out-of-host IPC serialization
(RUL-3, §6 S14/S15). Its `source` is **`'hook'`** — the stage IS a permitted seam id (§2.2),
so an unseparated `snapshot.clone` is *unseparated at a permitted seam*, and `'mark'` would
wrongly assert that no recorder could ever produce it (the second run's rows carried
`source:'hook'` for `snapshot.clone` and `'mark'` for `render.dom`/`render.ssr`; after RUL-1
all three are permitted seam ids, so `'mark'` survives only for a genuinely probe-only stage —
of the 11 ids there is currently **none**). When the caller-level
seam is missing, the same rule applies to `snapshot.pull`/`docheads.pull` — and, critically, the
**A-4 read count stays UNMEASURED** (never `0`): the derived verdict must say
`the <gesture> performed <n> whole-store IPC_RAG_SNAPSHOT read(s) … ` only from a measured
seam, and otherwise emit `the <gesture>'s whole-store IPC_RAG_SNAPSHOT read count is
UNMEASURED (snapshot.pull unseparated — <reason>)`, so a **"not measured" 0 can never be read
as a measured zero** (§12 H2's load-bearing caveat, promoted to a contract).


The §3.6(c) live falsification is the driver's `o0_repeat_determinism` block: an **unarmed** baseline and
an **armed** re-run of the same gesture, derived
`inert = Δmutations === 0 ∧ |ΔlongTaskTotalMs| ≤ 40`, pushed to `driver.hookInertness`,
and a non-inert or set-divergent pair is a report-level forcing reason
(`o0DeriveReportPass`).

**The mirror-fallback drift risk — RESOLVED (§3a finding 11): option (b), the mirror is
DELETED, not audited.** The driver's node-side aggregation **prefers the real module** — a
guarded dynamic import of `src/shared/o0-hook.ts` (type-stripped by node ≥ 22.18) — and
currently falls back to a **byte-equivalent mirror inside the driver** (the in-driver
`o0StagesFromHookRecords` — cited by symbol; once `scripts/live-drive.mjs:661-678`) when that import is unavailable.
Two implementations of ONE contract is a drift surface that no recording field can close: a
divergent mirror would silently produce different stage rows **and** a different `post.style`
residual on exactly the runs where the import failed, and the `hook.stageRowsSource` field only
makes the divergence *visible after the fact*. **The spec pins option (b):** the mirror is
**removed**, the driver imports the `.ts` twin exactly as it imports `src/shared/o0-report.ts`,
and an unavailable import is a **loud abort** — the driver's `main()` catch, `[live-drive]
ERROR:` + exit code 2 (§6 F6/F16), **never** a fallback that emits a number. Rationale: the
mirror's only justification was portability (running the driver on an older node), and the
artifact it produces is a *contract* artifact — a report produced by an unverifiable second
implementation is worth less than no report, while an abort is unambiguous. The recorded field
`hook.stageRowsSource` stays, with exactly one legal value
(`'src/shared/o0-hook.ts:stagesFromO0HookRecords'`); a row carrying the mirror value is
`pass:false` (§6 F16). This **supersedes** the previous "audit the mirror" disposition — the
§7 finding is closed by deletion, not by a comparison.

**The driver validates its OWN report before writing it (corrected contract — §3a finding 12).**
`o0BuildReport` must run the **pure validator over the report it just built** — `validateO0Run`
for every `runs[]` row and `validateO0Reports`/`validateO0Report` for the whole document,
through the **same guarded twin-import mechanism** the driver already uses (no mirror: §3.6b
above) — and **append the validator's `failReasons` to its own**, so a report can never be
written whose rows the pinned module would reject (`driver.selfValidation` records
`{ ok, attempts, runIds, errors }`). `o0DeriveReportPass` (cited **by symbol** —
`export function o0DeriveReportPass`; once `scripts/live-drive.mjs:1155`)
re-implements a SUBSET of the row rules inline (its `o0RowPass` — cited **by symbol**; once
`:693-716`) and never calls the
module: `o0RowPass` still re-implements a SUBSET of the row rules inline while
`o0ImportTwins()` + the `o0Twins.report.validateO0Report(report)` call in `o0DeriveReportPass`
is the module's own (corrected) path — the two can — and on this unit did — disagree about
which rows are acceptable, which is
the exact class of defect the mirror deletion above removes. A self-validation failure is a
report-level forcing reason (§6 F17); the report is still WRITTEN (the numbers stay
inspectable), with `pass:false`.

**RUL-4 — the structural-vs-pass contract (the decisive rule: what `ok`, `pass` and the report
STATUS each mean).** The second run's `driver.selfValidation.ok: false` (**24** GPU-OFF / **12**
GPU-ON validator errors) is **NOT** an honest FAIL: the emitted report was **SCHEMA-REJECTED
because structurally unmeasurable stages were present**. The landed module pushes every
`structural:true` stage into `errors` (`src/shared/o0-report.ts:329-341`), and `validateO0Run`'s
`ok` is `errors.length === 0`, so four *correctly labeled* stages made each row `ok:false`. That
conflates two different things; the re-derived contract is:

1. **`ok` is SCHEMA validity, never a verdict.** `validateO0Run` returns `ok:true` for a row
   whose only recorded defects are **structurally unmeasurable stages WITH a non-empty
   `structuralReason`** — the same class as a `pass:false` row carrying genuine `failReasons`
   (R-1, §7 row 1). The structural facts stay in `failReasons` (so the row's own verdict stays
   visible) and are NOT `errors`. A validator that "fixes" an honest report by rejecting it is
   the defect; the report was never malformed.
2. **`structural` is a LEGAL marker, and it may not be abused.** `structural: true` is legal
   **iff** the stage is `unseparated:true` AND carries a non-empty `structuralReason` naming the
   missing seam/transport. `structural:true` on a **separated** stage, or with an empty/absent
   reason, or on a stage a permitted seam could have produced in the executing bundle, is
   `ok:false` naming the stage (§6 F14/F18).
3. **`pass` remains `false` for the genuinely bad shapes — and ONLY those.** A row/report is
   `pass:false` iff at least one of: (a) a stage is **genuinely unmeasured** (a permitted seam
   exists in the executing bundle but was not armed — the row must NOT be labeled `structural`);
   (b) an **imputed** value (an `ms` on an unseparated stage, a fabricated record attribution);
   (c) a **falsifiability failure** (`path !== 'cdp'` / `realInput` disagreement, an unverified
   bundle, a hard-coded verdict, a missing required field); (d) a **violated window** (F13a).
   A report whose ONLY defects are structural stages is `pass:false` **because the measurement is
   incomplete** — `pass` keeps its meaning; what changes is that `ok` no longer contradicts it.
4. **`reconciliation.ok` vs the report STATUS — two fields, never merged.** P-TP-1's invariant
   ("any unseparated stage makes the reconciliation `ok:false`") is UNCHANGED: the residual
   arithmetic genuinely cannot close while a stage is unmeasured, so `reconciliation.ok` stays
   `false` on such a row. The report therefore carries an ADDITIVE **`status`** field whose value
   distinguishes the honest outcomes:
   - `"OPEN-structural"` — every unseparated stage in every row carries a valid
     `structural:true` + reason, `post.style` is `derived`/`unseparated` (never `structural` —
     §4.3), and no forcing reason outside the structural family exists. A **legal, incomplete**
     measurement — what O-0 produces while a structural seam is missing. **The O-5 gate
     consequence of this value is AMENDED by clause 7 (DEC-1, 2026-09-20): the report value
     stays the honest one, but the ACCEPTED structural set (`snapshot.clone` + the
     therefore-derived `post.style`) opens the gate — any OTHER structural id does not**;
   - `"FAIL"` — any forcing reason outside that family (an unmeasured permitted stage, an
     imputation, a falsifiability failure, a window violation, a broken control pairing, a
     census mismatch): the §6 F-state class;
   - `"OK"` — `pass:true` (only when every stage is measured or `derived`, §6 S3).
   `status` is a **derived** field (never hand-written) and is the ONE place the report states
   whether it is DONE, OPEN-structural or FAILED.
5. **The reconciliation note is mandatory and precise.** A report whose `status` is
   `OPEN-structural` MUST carry `reconciliation.note` naming, in one sentence, (i) which stages
   are structurally unseparated and why, (ii) that the residual is therefore **not computable**
   and `post.style` is `unseparated` (not a number), and (iii) that no value was imputed.
6. **`selfValidation.ok:true` is the required outcome for a structurally-open report.** After
   RUL-4, a report whose only defects are structural stages shows `driver.selfValidation.ok: true`
   with an **empty** `errors[]`, while the report's `status` is `"OPEN-structural"` and
   `pass:false` remains for the incompleteness. The second run's `ok:false` with 24/12 structural
   errors is therefore **a defect of the module, not evidence about the measurement** — the fix
   is in `src/shared/o0-report.ts` (reclassify structural stages out of `errors`; add clause 2's
   abuse check), with the driver changed only to record `status` + `reconciliation.note`.
7. **The gate consequence (AMENDED 2026-09-20 by user DEC-1 —
   `O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`, `docs/decisions.md`).** O-0 may be reported
   **DONE** at either of two report values:
   - **`status:"OK"` ⇔ `pass:true`** (every stage measured or `derived`) — the original clause,
     still sufficient; **or**
   - **`status:"OPEN-structural"` whose ONLY gap is the ACCEPTED structural set** — i.e. the
     report satisfies ALL of:
     (i) `snapshot.clone` is the ONLY `structural:true` id and `post.style` is the
     therefore-derived residual (`derived`, `ms:null`, `unseparated:true`) — the ACCEPTED
     structural set, nothing more;
     (ii) `driver.selfValidation.ok:true` with an EMPTY `errors[]`;
     (iii) `gatingReasons:[]` (no FAIL class fired — §4.4);
     (iv) the window-bound check PASSES on every row (§5 P-TP-3 / §6 F13a);
     (v) the structural reasons are recorded VERBATIM in both places they are owed (the stage's
     `structuralReason` and the run's forcing line — the RUL-3 reason: no channel carries the
     main recorder's records + the Electron IPC structured clone happens inside the IPC after
     the handler returns, outside every host-side wrap), plus the mandatory
     `reconciliation.note` (§3.6b clause 5).
   **The SUPERSEDED clause** ("ONLY `status:"OK"` ⇔ `pass:true` opens the O-5 delegation gate")
   is recorded in the decision row; this clause AMENDS it. **The accepted-structural open is
   NARROW:** an `OPEN-structural` report carrying ANY other structural id, an imputation, a
   falsifiability failure, a missing reason, a missing note or a gating reason does NOT open the
   gate, and the unit returns to OPEN with that id named as remaining work. **A FAIL is never a
   pass** (`status:"FAIL"` is the §6 F-state class) and **an accepted-structural report is never
   re-labelled `"OK"`** — the absence of a main-side transport must stay VISIBLE in every report
   (`status:"OPEN-structural"`) until such a transport exists. That transport is a SEPARATE unit
   with its own gate (its own red set, RCA-2); it is NOT a prerequisite of the O-5 gate any more,
   and it is NOT a patch inside O-0.

A stage that still cannot be isolated with the hook is reported **`unseparated`**
(§6 F4) — never imputed.

---

## 4. The report-shape contract (the harness's node contract)

### 4.1 The committed artifact

**Path:** `docs/specs/unit-o-0-per-stage-breakdown.md` — the committed breakdown,
containing the run commands (§3.5), the environment, the census, the per-stage table,
the long-task list, the control/ablation rows, and the **derived** verdict string.
The raw emitted JSON (the block output) is embedded verbatim as a fenced block inside
it, so no number in the readable table is unverifiable. **The artifact is a
deliverable, not a summary**: it is committed, it carries its run command, and it is
the gate's item-1 evidence (`gnosis-offload-review.md:307`).

### 4.2 Top-level schema

```json
{
  "artifact": "o-0-per-stage-breakdown",
  "spec": "docs/specs/unit-o-0-per-stage-measurement.md",
  "unit": "O-0",
  "date": "<YYYY-MM-DD>",
  "layer": "assembled-renderer (RCA-12)",
  "commands": ["<the exact §3.5 commands used>"],
  "driver": { "build": { "renderer": "<mtime+len|hash>", "main": "<mtime+len|hash>",
                         "served": "<the served bundle identity>", "verified": true|false } },
  "tolerance": { "reconcileMs": <number>, "source": "measured <date>" },
  "corpus": { "source": "operator-store|seed|--o0-corpus", "documents": <n>,
              "nodes": <n>, "edges": <n>, "seed": "o0-2026-09-17" },
  "env": { "mode": "lexical|vector|gnosis", "gpu": true|false,
           "engine": "ready|absent", "display": ":0", "paneFrames": <n> },
  "stageIds": ["snapshot.pull","snapshot.clone","docheads.pull","traversal.build",
               "envelope.assemble","shared.decorate","reconcile.roots",
               "reconcile.apply","render.dom","render.ssr","post.style"],
  "runs": [ <one freeze row per staged gesture, §4.3> ],
  "controls": [ { "id": "gpu-on|gpu-off|track-ablation-on|track-ablation-off",
                  "runRef": "<run.id>", "pairedWith": "<run.id>" } ],
  "reconciliation": { "ok": true|false, "note": "<§3.6b RUL-4 clause 5 — mandatory when status is OPEN-structural>" },
  "verdicts": [ "<derived verdict string> per §4.4" ],
  "status": "OK|OPEN-structural|FAIL",
  "pass": true|false
}
```

**`status` and `reconciliation` are the RUL-4 additions** (§3.6b): `status` is DERIVED
(`"OK"` ⇔ `pass:true`; `"OPEN-structural"` ⇔ `pass:false` whose every forcing reason is in the
structural family; `"FAIL"` otherwise), and `reconciliation.note` is mandatory whenever
`status === "OPEN-structural"`. A report whose `status` is absent, inconsistent with `pass`, or
whose `OPEN-structural` note is missing is `pass:false` (§6 F18). **What `status` decides for the
O-5 DELEGATION GATE is clause 7's AMENDED rule (DEC-1, 2026-09-20): `"OK"` opens it, AND an
`"OPEN-structural"` report whose only gap is the ACCEPTED structural set (`snapshot.clone` + the
derived `post.style`) opens it too, subject to the five conditions listed in §3.6b clause 7;
`"FAIL"` never opens it, and an `"OPEN-structural"` report carrying any OTHER structural id
does not.**

### 4.3 `runs[]` — the freeze row

```json
{
  "id": "o0-folder-row-gpuoff-r1",
  "block": "o0_folder_row",
  "gesture": "folder-row|document-row",
  "target": "<the exact CSS selector clicked>",
  "folderPath": "<the chosen data-folder-path, for a folder-row gesture; null otherwise>",
  "documentId": "<the focused document id, for a document-row gesture; null otherwise>",
  "path": "cdp|native-fallback|missing|zero-box|off-viewport",
  "realInput": true|false,
  "stageCount": 11,
  "stages": [
    { "id": "snapshot.pull", "ms": 412.5, "unseparated": false, "source": "hook|mark|derived",
      "structural": true|false, "structuralReason": "<the missing seam, or null>" }
  ],
  "longTasks": [ { "start": <n>, "duration": 439 }, { "start": <n>, "duration": 439 } ],
  "longTaskTotalMs": 878,
  "mutations": 39,
  "wallMs": 1011,
  "gpu": false,
  "trackAblation": { "applied": false, "mutation": null },
  "bundleVerified": true,
  "hook": { "armWindow": { "t0": <n>, "t1": <n>, "ms": <n> },
            "freezeWindow": { "t0": <n>, "t1": <n> },
            "toleranceMs": 40,
            "armCount": 1, "disarmCount": 1,
            "stageRecords": [ { "stage": "<id>", "instance": "renderer|main" } ],
            "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords" },
  "pass": true|false,
  "failReasons": ["<one line per §6 forcing condition>"]
}
```

**Field rules (each is a review input):**
- `stageCount` **must equal `stageIds.length` (11)**; a freeze row with a different
  `stageCount` is a schema error and forces `pass:false` (§6 F1).
- **Every** stage id in `stageIds` appears in `stages[]`, exactly once; a stage with
  `unseparated:true` carries `ms:null` — an **imputed** `ms` on an unseparated stage
  forces `pass:false` (§6 F4). An entry the row cannot use is named by its **INDEX**
  (`stages[<i>]`) in the reason, never through a coerced stage id (§3a finding 2).
- `path` is recorded from the hit-test; `realInput` is **derived** (`path === 'cdp'`),
  exactly as `rowResult` derives it (cited **by symbol**; `live-drive.mjs:437`, once `:429-432`).
- **Finiteness (R-2 — ONE rule for §4.3 and §4.4, stated once):**
  - `longTaskTotalMs` is the row's **PRIMARY ORACLE** and is **required**: it must be a
    **non-negative FINITE number**. `null`, `NaN`, `-1` (or any negative), or a string
    (`'878'`) is **`ok:false`**, with a reason NAMING the field
    (`longTaskTotalMs is <value> (the primary oracle must be a non-negative finite
    number — §4.3)`) — consistent with §4.4's `O-0 REPORT INVALID: longTaskTotalMs
    missing` rule. A total that cannot be computed from a measured value is a
    **report-invalid measurement**, not a `null` to be tolerated.
  - `mutations` and `wallMs` are **secondary counters** and may be `null` **iff they were
    genuinely unavailable** (`unavailable: true` recorded beside them); a `null` secondary
    counter is NOT a forcing condition, and `NaN`/negative/string is `ok:false` naming the
    field. `null` here never means `0` and is never summed, averaged or compared as a
    number.
  - every **stage** `ms` is a non-negative finite number, **or** `null` with
    `unseparated:true` (§6 F4) — `Infinity`/`NaN`/negative/string on a stage is `ok:false`
    naming the stage (§6 F3). `postStyle.ms === null` **implies**
    `postStyle.unseparated === true` (the two are one branch, never two — §3a finding 3).
- **Window bound (H3 — the arming rule and its fail-state).**
  - **The armed window EQUALS the freeze window**: the hook is armed at/after the `o0:t0`
    mark and disarmed at `o0:t1` (never before the gesture's hit-probe), and the row
    records the actual interval as `hook.armWindow { t0, t1, ms }` plus `hook.armCount` /
    `hook.disarmCount`. A row may instead **report the actual hook window** and be judged by
    the bound below; what is forbidden is an unreported window that is wider than the freeze.
  - **A stage cannot be larger than the freeze it belongs to:** a stage whose `ms` exceeds
    `longTaskTotalMs + tolerance` (the **row-recorded** hook band — `hook.toleranceMs`,
    default 40 ms; §3.2.1) forces `pass:false`
    with a reason naming **both** numbers
    (`stage <id> ms <ms> exceeds the freeze it belongs to (<longTaskTotalMs> ms + <tol> ms
    tolerance) — a stage cannot be larger than the window it is measured in`).
  - **The derived percentage verdict is REFUSED on that branch** (there is no legitimate
    `1698.82%`): the harness emits the explicit **window-bound-violated** verdict instead
    (§4.4, §6 F13a) and never a percentage computed from a violated window.
  - **Which band the bound is judged with (P-TP-3(a) — the band field).** The `<tol>` in the
    bound above is the row's **RECORDED** band: the **additive, optional** field
    **`hook.toleranceMs`**, defaulting to **40 ms** when absent (§3.6, `O0_WINDOW_TOLERANCE_MS`).
    `deriveO0WindowBound(run)` with **NO options** reads that field; an explicit
    `{ hookToleranceMs }` argument **overrides** it for the oracle's own tests (the generator
    draws `tol ∈ {0, 40}` and records it per row, §5 `P-TP-3`). The **three consumers must
    agree** on this one band source — `deriveO0WindowBound`'s default,
    `deriveO0StageVerdict` (no tolerance argument, so an unrecorded band is unrecoverable)
    and `validateO0Run` (which calls `deriveO0WindowBound(run)` **without** an explicit
    tolerance — the fix LANDED at `src/shared/o0-report.ts:329-332`). A validator
    hard-coding the 40 ms constant while the oracle honours the
    field **was** the defect the remand exposed and it is **FIXED** (`src/shared/o0-report.ts`;
    §12.11), and the
    band is **never** recovered from a `failReasons` string — the reasons name the stage and
    the freeze, the band is a field. A non-numeric / negative / non-finite `hook.toleranceMs`
    is **not** a band: it falls back to the default 40 ms and is a finiteness finding named
    by §6 F3.
- **Structural marker (§6 S14; the marker's LEGALITY pinned by RUL-4).** A stage that cannot be separated **by construction** — no seam exists in the executing bundle — carries `structural: true` plus a
  `structuralReason` naming the missing seam, **distinct** from a stage that is merely
  **unmeasured** in this run (a seam exists but was not armed). The distinction is
  contractual: it is what makes a report's `pass:false` reason precise and keeps the A-4 gap
  **visible** instead of laundered into a generic `unseparated`. Three legality rules (§3.6b
  RUL-4 clauses 1-2, §6 F14/F18): `structural:true` is legal **iff** `unseparated:true` **and**
  `structuralReason` is a non-empty string; it is `ok:false` on a **separated** stage, with an
  empty reason, or on a stage whose permitted seam (§2.2's closed ten) exists in the executing
  bundle but was not armed (that is *unmeasured*, and saying `structural` about it is a
  mislabel — the second run made exactly this mistake in the opposite direction, calling ids
  9/10 `mark`-only). After RUL-1 every one of the 11 ids except the `derived` `post.style` has a
  permitted seam, so the **expected `structural` set is normally empty or `{snapshot.clone}`
  (the RUL-3 transport gap) only** — a report claiming more must show the missing wrap per id.
- **`post.style` is `derived` and is NEVER `structural` — and it is `derived` in every table, row and verdict (RUL-5/L12).** Its row is
  `{ ms: null, unseparated: true, source: 'derived', structural: false, structuralReason: null }`
  while any other stage is unseparated: the residual is a **computed remainder** (§5 P-TP-1),
  not a stage whose seam is missing, so `structural:true` on id 11 is `ok:false` (§6
  F18) — the second run's rows correctly carried `structural:false` for it, and the reason
  field for it is the reconciliation note's job, not a `structuralReason`. Wherever the
  artifact shows a residual — the per-stage table's Σ/residual column, answers (b)/(d), the
  reconciliation note — the value is a **computed remainder**
  (`longTaskTotalMs − Σ(named stages)`), never a timed probe, and it is labeled `derived`.
  Concretely: the residual is **not** a stage measurement, it is **not** "style/layout/paint"
  (it absorbs whatever the unmeasured stages and the un-instrumented work contributed), and it
  may **never** be quoted as a style-cost figure. Any table cell or verdict presenting the
  residual as a measurement is `pass:false` with the reason `post.style is presented as a
  measurement (<value>) — the residual is a DERIVED remainder and must be labeled derived
  (§4.3/RUL-5)`.
- **The GPU delta + the cross-run rule (RUL-5/L9).** A `controls[]` GPU pair carries the deltas of
  **this** invocation's two legs and nothing else; the pair record names both runs and the corpus
  identity it was measured on. **A GPU delta is never carried across runs**: the first run's
  `+2173 / +2419 ms` and the second run's `−36 / −23 ms` are two measurements of two
  sessions/corpora, the second **contradicts** the first, and neither is a constant any unit may
  rely on. Prose in the artifact may cite another run's delta only as labeled provenance, naming
  that run and its corpus (§6 S20/F20).
- **`env.engine` is DERIVED from a positive signal (RUL-5/L1).** The field is `'ready'` only
  when the driver observed positive engine evidence (a live `gnosis-server`-backed status
  reporting availability), else `'absent'` **with the evidence string recorded**. "The
  `gnosis.status` MCP call resolved" is **not** evidence — an error payload also resolves, which
  is exactly how the second run recorded `ready` on a host with no engine (§6 S21/F22). The
  field never affects an O-0 stage (§6 S4).
- **The corpus SIZE is the gate; the bytes/nodes/edges are recorded provenance (RUL-5/L10).** The
  census gate is `corpus.documents === 226` (or `--o0-corpus=<n>`): the **size** is the pin. The
  corpus **bytes** and the derived `nodes`/`edges` counts are **recorded provenance**, not pins —
  the second run reached the pinned size with **6 102 / 9 266** nodes/edges where the first run
  measured **10 170 / 18 758** from a different generator, and both are honest. A report may NOT
  (a) claim byte-reproducibility across runs, (b) present a cross-run absolute ms comparison as a
  measurement, or (c) feed a cross-run node/edge count into a threshold: the node-ceiling input
  for the parked trigger (b) (§10) must be read **from the same run's corpus row** with the
  byte-size gap named. A report that treats the counts as a fixed pin is `pass:false`
  (`the corpus row presents <nodes>/<edges> as a pinned census — the SIZE is the gate and the
  bytes/counts are recorded provenance (§3.4/§4.3/RUL-5)`), and a cross-run absolute comparison
  is `pass:false` under §6 S20.
- **A `pass:false` row carrying a genuine `failReasons` line is SCHEMA-VALID.** It is a
  **legitimate FAILING MEASUREMENT**, not a schema error: `validateO0Run` returns `ok:true`
  for it, and the row-level `pass:false` propagates to the report through
  `o0DeriveReportPass`, which pushes every row's reasons into `driver.failReasons` (the
  architect's ruling **R-1**, recorded in §7 row 1 and §3b). The real defect class is the **opposite** shape — a `pass:false` row with an EMPTY
  `failReasons` — which is already caught (`src/shared/o0-report.ts`'s `pass !== true &&
  recorded.length === 0` branch). `failReasons` is **non-empty whenever `pass:false`**; a
  `pass:false` row with no reason is itself a schema error. **RUL-4 clause 1 extends this
  class**: a row whose only reasons are the structural family is `ok:true` too, and its report
  carries `status: "OPEN-structural"` (§4.2).
- **A record's error field (RUL-2).** A committed record may carry
  `error: "<the rejection's message>"` in addition to `stage`/`ms`/`startMark`/`endMark`/`measureName`
  — set when the recorded span settled by **rejection**. A record carrying `error` still carries a
  finite non-negative `ms`; an `error`-bearing record is a legal record (never
  `O0_HOOK_RECORD_INVALID`), and the **dangling-start-mark** case (no matching end/measure) is
  what §6 F19 forbids. For `snapshot.pull`/`docheads.pull` an error-bearing record means the
  re-derive abort path ran: the row must still name the read it attempted (the A-4 count comes
  from the recorded attempt), and the stage's `ms` is the **aborted** span, recorded as such.

### 4.4 The DERIVED verdict (never hard-coded)

At least one verdict string is emitted per gesture, computed by the harness from the
row — the formula is pinned, the number is not:

> `stage <id> is <ms> ms of the <longTaskTotalMs> ms long task (<pct>%) on <gesture> — <stage-id> is the largest identified stage`

and the discriminating verdict required by A-4:

> `the <gesture> performed <n> whole-store IPC_RAG_SNAPSHOT read(s) totalling <ms> ms (census <documents> docs / <nodes> nodes / <edges> edges)`

**Two further pinned verdict forms (added by H2/H3), plus the RUL-5/L8 and RUL-4 forms:**

> `stage <id> is <ms> ms, which EXCEEDS the freeze window it belongs to (<longTaskTotalMs> ms + <tol> ms tolerance) — WINDOW-BOUND VIOLATED: no percentage verdict is emitted for this row`

— emitted **instead of** the percentage form whenever §4.3's window-bound rule fires (the
`1698.82%` line the live run printed is exactly the string this verdict replaces, §12 H3).
The verdict's `<tol>` and its `(…) ms tolerance` clause are the **row-recorded** band
(`hook.toleranceMs`, default 40 ms), read through the same single band source as the oracle
and the validator (§3.2.1/§4.3, §12.11) — this string takes no tolerance argument of its
own, which is precisely why the band must be a recorded field; and

> `the <gesture>'s whole-store IPC_RAG_SNAPSHOT read count is UNMEASURED (snapshot.pull unseparated — <reason>)`

— emitted **instead of** the A-4 `performed <n> read(s)` form whenever `snapshot.pull` is
`unseparated`, so a **"not measured" 0 is never emitted as a measured zero** (§3.6b, §12 H2).

**RUL-5/L8 — the ZERO-WINDOW form: no percentage without a FINITE window (`(null%)` is
retired).** The second run printed
`stage traversal.build is 5.3 ms of the 0 ms long task (null%) on folder-row …` on the two
ablation rows: the `total > 0` guard refused the *division*, so the `%` slot emitted the literal
`null%`, which a reader can misread as a measurement. Pinned replacement — whenever
`longTaskTotalMs` is **0** (or the `longTaskTotalMs > 0` guard otherwise refuses):

> `stage <id> is <ms> ms of the <longTaskTotalMs> ms long task on <gesture> — no percentage is computed: the long-task window is zero (<longTaskTotalMs> ms), so this row has no finite window to divide by`

and the `pct` field for such a row is **`null`** with `pctReason: "zero-window"` recorded
(never the string `null`, never `NaN`). Rules: **no verdict string may contain `null%`**;
**no percentage is emitted without a finite, positive `longTaskTotalMs`**; and a row whose
`longTaskTotalMs` is 0 is **not** a violation of §5 `P-TP-3` (the zero window is a legal
measurement — `0` is the honest long-task total when nothing crossed the 50 ms threshold).
The same guard covers the `NaN`/absent case, which is an `ok:false` field defect (§4.3 R-2),
never a percentage.

**RUL-4 — the structural-vs-FAIL verdict pair (the report-level forms).** Two additive report
verdict strings make the §3.6b RUL-4 status readable without inspecting the JSON:

> `O-0 REPORT OPEN — <n> stage(s) structurally unseparated (<ids>): <the missing seam/transport, per id> — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed`

— emitted (once, report-level) whenever `status === "OPEN-structural"`, and

> `O-0 REPORT FAIL — <n> forcing reason(s) outside the structural family (<the first reason>, …) — the measurement or the report is not usable as evidence: <the F-state class(es) named>`

— emitted whenever `status === "FAIL"`. A report carrying the OPEN form **and** any F-state
class is `status: "FAIL"` and must not print the OPEN form (§6 F18). Neither form may be
hard-coded; both are computed from the row/`pass` data exactly like every other verdict
(D-GP-UFA-3).

**The falsifiability rule (D-GP-UFA-3, `docs/decisions.md:17`):** a verdict is
**never asserted `true`**. It is a string computed from the measured row; if the row's
required fields are absent, the harness emits the schema-error verdict
`O-0 REPORT INVALID: <field> missing` and `pass:false`. **A hard-coded verdict string
in the driver source is a review finding**, and the property layer (§5 P-IM-2/P-TP-1)
is what makes the absence of one checkable. `longTaskTotalMs` being **non-finite or
`null`** is exactly such an absence: it yields `O-0 REPORT INVALID: longTaskTotalMs
missing` + `pass:false` (§4.3, R-2) — never a tolerated `null`.

**What makes a row FALSIFIABLE (all four are required):**
1. a named observable field (above);
2. a predicate over that field whose falsity is observable — e.g. `stageCount === 11`,
   `stages[i].ms ≥ 0`, `path === 'cdp'`, `corpus.documents === 226`;
3. a **forcing** consequence (`pass:false` + a `failReasons` line), not a warning;
4. a counterexample that a reader can construct from the artifact alone (e.g. "delete
   one `stages[]` entry → F1 must appear").

---

## 5. §5.x Property register (PBT) — MANDATORY (typed, ≤8 rows)

Register convention (imported): rows typed **P-IM** (input-model), **P-SM**
(state-model), **P-TP** (transform) — **NEVER F-rows, never §6/FS-n**; **≤8 rows, at most
100 attempts/row** (the gate's PBT clause: "≤100 attempts/row" is the ceiling; earlier
editions of this spec compressed that to a `≤400 total` note, which the row count outgrew —
restated honestly below). **Landing at 8 rows, the budget must be stated as
`Σ(attempts/row)`, not as a fixed 400:** rows `P-IM-1`, `P-IM-2`, `P-SM-1`, `P-SM-2`,
`P-TP-1`, `P-TP-2` land at **60** attempts each, `P-HK-1` at **40**, and the new `P-TP-3` at
**50** → **60×6 + 40 + 50 = 470 attempts total, ≤ 800 at the ceiling (8 × 100), every row
≤ 100** — stop-after-5 in all rows. The landed constants are
`tests/unit-o-0-report-contract.test.ts` (`PBT_ATTEMPTS = 60`, the six report rows) and
`tests/unit-o-0-hook-contract.test.ts` (`PBT_ATTEMPTS = 40`); `P-TP-3`'s 50 is the
TestWriter's allocation for the new row and must be recorded in its own file's constant.
**A row that exceeds 100 attempts, or a total claimed as `≤400` at 8 rows, is a review
finding.**

**Where the property layer runs:** the register drives the two **PURE modules** —
`src/shared/o0-report.ts` (the report schema + reconciliation helpers) and
`src/shared/o0-hook.ts` (the §3.6 recorder + the inertness oracle) — and it runs under
**`npm test`** (`tests/unit-o-0-report-contract.test.ts` for the six report rows,
`tests/unit-o-0-hook-contract.test.ts` for `P-HK-1`; the `live-drive-contract.test.ts`
source-pin convention is reused for the five wrap-only call sites).
The **MEASUREMENT itself runs LIVE** (§3) and can never run in node: the property
layer validates the *report shape and its invariants*, and the live run produces the
*values*. **This is the RCA-12 split stated explicitly: a property-green is
schema-green, never app-green.**

| Row | T | Pinned invariant | Generator / strategy | Falsifiable oracle | Layer covered |
| --- | --- | --- | --- | --- | --- |
| `P-IM-1` | IM | **Every stage `ms`, the PRIMARY ORACLE `longTaskTotalMs`, and the secondary counters obey ONE finiteness rule (R-2).** `longTaskTotalMs` is **required** — a non-negative FINITE number; `null`/`NaN`/negative/string is `ok:false` naming the field (§4.3/§4.4). `mutations`/`wallMs` are non-negative finite numbers or an explicit `null` + `unavailable:true`. A stage `ms` is a non-negative finite number or an explicit `null` with `unseparated:true`. No `NaN`, no negative, no string, no missing `id`. | `strat:o0-stage-values` — generate rows from an 11-stage skeleton with values drawn from `{null, 0, 0.1, 1, 1e3, 1e6, NaN, -1, '12'}`, over the draw modes the row's generator carries (stage value; `longTaskTotalMs` `NaN`/`-1`/`'878'`/`null`; `mutations` `NaN`/`-1`/`'39'`; `wallMs` absent; stage `ms` `Infinity`; the LEGAL `ms:null` + `unseparated:true`) | the validator returns `ok:false` **iff** some stage value is not (`≥0` finite) and not (`null` ∧ `unseparated`) — **and** `longTaskTotalMs` is not `≥0` finite (the primary oracle carries NO `null` form), **and** a secondary counter is neither `≥0` finite nor `null`-with-`unavailable:true`; the counterexample is printed with the offending field path | report shape (pure) |
| `P-IM-2` | IM | **The stage set is TOTAL.** A freeze row's `stages[]` carries exactly the 11 `stageIds`, each once, and `stageCount === 11`; a missing or extra stage is `pass:false`, **never a silent skip**. The same totality rule applies to the run's `controls[]` set (a comparison run without its paired control row). | `strat:o0-stage-set` — a row per removal of each of the 11 ids, plus one row with a duplicate and one with an unknown `stage.id`, plus a control-set pair with one side removed | `missing = stageIds − rowIds` and `extra = rowIds − stageIds`; the oracle asserts `missing.length === 0 && extra.length === 0` AND that a row with a non-empty `missing` (or an unpaired `controls[]` entry) has `pass:false` + ≥1 `failReasons` line | report shape (pure) |
| `P-SM-1` | SM | **The census fields agree with the seeded/observed corpus.** `corpus.documents`, `corpus.nodes`, `corpus.edges` are cross-checked against the live `rag.list_documents` census + the snapshot payload's own census (nodes/edges lengths); a disagreement is `pass:false`. | `strat:o0-census` — a row per corpus of `{documents, nodes, edges}` with one field perturbed by ±1 and one with the same value | the oracle recomputes the census from the frozen payload fixture and asserts `recorded === recomputed`; a perturbed field must produce `pass:false` with a `failReasons` entry naming the field | report shape + one live read |
| `P-SM-2` | SM | **Determinism of the stage-id SET.** Re-running the same block over the same corpus yields the **same stage-id set**; the `ms` values are explicitly FREE under the seed `o0-2026-09-17`. | `strat:o0-determinism` — pairs of run records: identical sets with different `ms` (must pass), same set with different order (must pass), a set missing one id (must fail) | `set(runA.stageIds) === set(runB.stageIds)` AND `runA.pass && runB.pass`; the oracle asserts the id-set comparison is order-insensitive and `ms`-insensitive by construction | report shape (pure) |
| `P-TP-1` | TP | **Reconciliation + the `post.style` residual.** The identified stages' sum is reconciled with `longTaskTotalMs`: the residual `longTaskTotalMs − Σ(named stages)` is **computed** (never a timed probe), is non-negative within the recorded tolerance, and **any unseparated stage makes the reconciliation `ok:false`** (an unmeasured stage cannot be reconciled away). The measurement hook is inert when unarmed. | `strat:o0-reconcile` — rows from a generator over `{all separated, one unseparated, sum > total, sum ≪ total, negative residual}` | the oracle returns `ok:true` **iff** no stage is `unseparated` AND `0 ≤ residual ≤ tolerance.reconcileMs`; the "hook inert" clause asserts an unarmed run's mutation count and long-task total are byte-identical to the pre-instrumentation baseline fixture | transform (pure) + the live residual |
| `P-TP-2` | TP | **An unproven gesture forces `pass:false`.** A freeze row whose recorded `path !== 'cdp'` (OR `realInput` computed independently disagrees with `path === 'cdp'`) is `pass:false`; the derived verdict is still emitted with the fallback path named. | `strat:o0-gesture-path` — rows over `{cdp, native-fallback, missing, zero-box, off-viewport}` × `{realInput true, false}` | `pass ⇒ (path === 'cdp' ∧ realInput === true)`; each of the four non-`cdp` paths must yield `pass:false` **and** a `failReasons` line naming the path | report shape + live gesture |
| `P-HK-1` | TP | **The §3.6(c) hook is INERT under arm, and its recorded SPAN has settlement semantics (RUL-2, folded into this row).** An ARMED recorder's `Δmutations` must be **0** and `\|ΔlongTaskTotalMs\|` must be **within the RECORDED tolerance** (the landed band is 40 ms — `src/shared/o0-hook.ts:79`); an **off-set** stage (armed, but outside the armed set) is **dropped, not measured** (`fn` runs exactly once, no mark/measure/record, counted in `state().dropped`); a permitted stage with **no records** is `ms:null` + `unseparated:true` — **never a silent measured value** (the imputation ban); and for an **async thunk** (`record(stage, async () => …)`) the committed record's `ms` is measured **across settlement**, an **unarmed** `record()` returns `fn()`'s value **unawaited and unwrapped**, and a **rejection** commits the record (end mark + measure + `error`) while propagating untouched — **no dangling start mark**. | `strat:o0-hook-inert` — generated `(unarmed, armed, tolerance)` triples: `tol ∈ {0,10,40,120}` ms, `Δmutations ∈ [-3,3]`, `ΔlongTaskTotalMs ∈ [-40,40]` in 10 ms steps, over counters `mutations 0..200` / `longTaskTotalMs 100..2000`; the off-set-stage and zero-record halves ride the same file's H3/FS3 + H9/FS4 rows; the settlement half draws **promise bodies** over `{resolve after 0/1/25 ms, reject after 0/1/25 ms}` with a stub perf port whose `now()` advances per draw | `inert === (Δmutations === 0 ∧ \|ΔlongTaskTotalMs\| ≤ tol)`; the signed deltas are returned verbatim; a non-inert pair carries ≥1 `failReasons` line **naming** `mutations` (when `Δmutations ≠ 0`) or `longTaskTotalMs` (otherwise); an inert pair carries **none**; an off-set stage yields no record and stays `unseparated`; a zero-record stage yields `ms:null` + `unseparated:true`; for the settlement half: the async thunk's record `ms` equals the **stubbed settle delta** (NOT `≈0` at promise creation), a rejecting body yields exactly ONE record with a finite `ms` and a non-empty `error`, its rejection is observed by the caller, and `state().dropped`/`armCount` are unchanged by the await | transform (pure) + the LIVE armed-vs-unarmed pair (§3.6, `o0_repeat_determinism`) |
| `P-TP-3` | TP | **WINDOW-BOUNDEDNESS — no measured stage may exceed the freeze it belongs to, and no percentage may be derived from a violated window (H3).** For every row: (a) each **separated** stage satisfies `ms ≤ longTaskTotalMs + hookToleranceMs`, where that band is the row's **RECORDED** `hook.toleranceMs` (an **additive, optional** field, default **40 ms** when absent — §3.2.1/§4.3); (b) the row's `hook.armWindow` (or the recorded actual hook window) **equals** the freeze window within that **same recorded** band — an arming interval that starts before `o0:t0` or ends after `o0:t1` beyond the band is a violation, never a silent widening; (c) a percentage verdict is emitted **iff** no violation holds — on a violation the harness emits the WINDOW-BOUND VIOLATED verdict instead, so the derived `pct` is never `> 100` and never negative. | `strat:o0-window-bound` — generated rows from a skeleton of 11 stages: `stage ms ∈ {0, tol, tol+0.1, total, total+1, total×20}`, `longTaskTotalMs ∈ {0, 10, 110, 2283}`, tolerance `∈ {0, 40}` **recorded on the row** as `hook.toleranceMs` (the drawn band is a row FACT — the generator writes what it draws, so the oracle's no-options default and the verdict read the same band the oracle's explicit `{hookToleranceMs}` argument got), plus an `armWindow` starting 5/50/250 ms **before** `t0` and a pair with the window equal to the freeze | the oracle returns `violated:true` **iff** some separated stage `ms > total + tol` **or** the arm window starts before `t0` / ends after `t1` beyond tolerance; then `pass === false` **and** ≥1 `failReasons` line carrying **both** the stage `ms` and the `total + tol` bound AND naming NEITHER the band nor the freeze through a free-text channel (the band is the recorded field, the invariant text is the reason shape); `deriveO0StageVerdict(row)` — which takes NO tolerance argument — must derive the SAME band from the row and emit the WINDOW-BOUND VIOLATED form with no `%`; and `validateO0Run` must apply that same recorded band (no hard-coded constant) so a drawn `tol = 0` row cannot validate against 40 ms; an in-bound row emits the percentage form with `0 ≤ pct ≤ 100` | transform (pure) + the LIVE freeze window (§3.5's `o0:t0`/`o0:t1` marks) |

**Register count: 8 rows** (P-IM-1, P-IM-2, P-SM-1, P-SM-2, P-TP-1, P-TP-2, P-HK-1,
P-TP-3) — **exactly AT the ≤8 cap**, with the budget restated as ≤100 attempts/row and
`60×6 + 40 + 50 = 470` landed (≤800 at the ceiling).

**RUL-2/RUL-4 register outcome: NO new row was added; ONE existing row was WIDENED, with the
rationale recorded here (the cap did not grow, and nothing was folded silently).** The two
candidate invariants the second run's findings produced were assessed against the register's
own tests, and the outcomes are:
1. **The async settled span (RUL-2) — FOLDED INTO `P-HK-1`.** The counter is real: the landed
   row's oracles all concern the recorder's behaviour under arm, but none could fail on "the
   span closed at promise creation". The row above now carries the settlement clause
   (`ms` across settlement, unarmed = unawaited passthrough, rejection commits + propagates,
   no dangling start mark) with its own generator draws and oracle. Folding is the honest
   choice under the cap because the SUBJECT is one and the same object — **the recorder's
   span semantics under arm** — and the added counterexample class is a *shape* defect of
   the very function the row already pins (`record`), not a new invariant over a different
   field set. A separate row would have carried the same generator and the same module.
   `P-HK-1`'s existing clauses were NOT weakened, renumbered or removed; its budget constant
   stays 40 (the TestWriter's addition to this row is the settlement draws, recorded in the
   hook-contract file's constant).
2. **The structural-vs-pass contract (RUL-4) — NOT entered as a register row, and that is
   recorded as the deliberate outcome.** Two reasons: (a) the invariants are **cross-field
   schema relations over the report document** (`ok` vs structural-with-reason vs `pass` vs
   `status` vs `reconciliation.note`), which is the *input-model* domain already owned by
   `P-IM-1`/`P-IM-2`'s validator oracle — extending `P-IM-1`'s `strat:o0-stage-values` draws
   with the structural/`status` modes is the correct landing, not a ninth row; (b) a new row
   would breach the cap of 8, and the register convention forbids breaching it silently.
   The **full contract text is normative in §3.6b RUL-4 and §4.3/§4.4**, with the fail-states
   in §6 F18 — a register row is not the only place an invariant may live, and this one is
   already exercised by the schema rows with the modes added.
3. **RUL-5's smaller fixes (`L1`, `L8`, `L9`, `L10`, `L12`) — NOT register rows.** Each is
   either a *reporting-form* pin (L8's zero-window form, L12's `derived` marker: §4.4/§4.3),
   a *provenance* pin (L10's size-vs-bytes, L9's per-run GPU delta: §3.4/§2.4/§4.3), or a
   *derivation* pin (L1's engine state: §4.3). They are states/fail-states (§6 S18-S20,
   F20-F21), not invariants over generated inputs — promoting one would be padding to the cap,
   which is itself a review finding (§5's no-pad rationale).

**Why `P-TP-3` is a row of its own (and why the cap did not force a fold).** The live pass
produced a row whose largest stage (`traversal.build` **1868.7 ms**) was **larger than its
own freeze window** (`longTaskTotalMs` **110 ms**), which the harness then printed as
`1698.82%` with negative residuals (§12 H3). No existing row can fail on that: `P-TP-1`
reconciles a residual *band* (it will happily report a negative residual as `ok:false` for
the wrong reason), `P-IM-1` only requires values to be finite/non-negative, and `P-HK-1`
judges the hook's **deltas**, not the absolute window relation. `P-TP-3`'s counterexample
class is unique — *"the arithmetic was internally consistent but the measurement was taken
over the wrong interval"* — so folding it into a sibling would have dropped a distinct
invariant, exactly what the no-silent-drop rule forbids. The row also carries the **arming
discipline** (`armWindow` == freeze window) that makes the H3 defect non-recurrable, which
is a property of the harness's own sequencing rather than of any single row's values.

**Why `P-HK-1` is a row and not a restatement.** It was **added with the §3.6 hook
landing**, and it does not duplicate P-TP-1's "the hook is inert when unarmed" clause:
P-TP-1 asserts the **unarmed** half (an unarmed run is byte-identical to the
pre-instrumentation fixture); `P-HK-1` asserts the **armed** half — the deltas an ARMED
hook is *allowed* to introduce, judged against a **recorded** tolerance — and it is the
only row whose counterexample class is "**the instrumentation itself changed the
freeze**". A register that pinned only the unarmed half would be the "a block that
cannot fail is NOT evidence" failure this repo names
(`docs/specs/user-flow-audit.md:90-91`). It is typed **TP** (transform): the oracle is
a function of a state PAIR (`deriveO0HookInertness(unarmed, armed, { tol })`) plus the
record→stage-row aggregation, not a property of a single record set.

**No-pad rationale (the honest record).** Two further candidates were considered and
**NOT** entered as invariant rows, because neither is genuinely invariant:
1. *"the control rows are present whenever a comparison row is emitted"* — this is
   **structural presence**, i.e. already entailed by P-IM-2's totality rule applied to
   the `controls[]` array, and a separate row would be a restatement with no distinct
   counterexample class. It is instead a **forcing condition** in §6 F9.
2. *"the ablation is always available"* — this is **false** as an invariant (a platform
   or a bundle without a grid-item stage cell cannot express it), so it lives as a
   documented fail-state (§6 F5) rather than a property row.
**Padding a register to the cap with either would be a review finding.** The register now
sits **at** the cap with **8** rows, and it got there by **adding a genuinely new invariant**
(`P-TP-3`, forced by the live H3 finding), not by promoting a restatement: the two
candidates above remain excluded, and **no existing row was weakened, renumbered or folded**
— `P-TP-1` keeps its reconciliation + residual-band clause, and its "the hook is inert when
unarmed" clause stays **distinct** from `P-HK-1`'s armed half (a fold was considered under
the cap and rejected: a merged row would carry two unrelated counterexample classes, which
is a restatement inside a row, not a saving).

---

## 6. States, fail-states and throw patterns

### S — states (every state the TestWriter must derive)

| # | State | Expected observable |
| --- | --- | --- |
| **S1** | **Empty corpus** (`--no-seed`, no store) | the folder/document gesture rows are unreachable → `path:'missing'`; the report is emit-able and `pass:false` — **an empty corpus can never yield an O-0 pass**, and it is never silently substituted for the operator corpus |
| **S2** | **Single document** (the driver's `seedCorpus`: `alpha.md` + `beta.md`) | the report shape is exercised end-to-end (`stageCount === 11`, `longTasks` array, controls), and `corpus.documents === 2`; the **quantitative** claim is explicitly NOT made (`pass:false` on the census gate, §6 F8) |
| **S3** | **Operator corpus size** (226 documents, the sanctioned measurement) | the only state in which the report may be `pass:true`; `corpus.documents === 226` (or the `--o0-corpus=<n>` value) and the stage table is complete |
| **S4** | **Engine-absent boot** (no `gnosis-server`; the local store path) | O-0 is **unaffected**: the degraded-mode contract requires every local path to behave identically (`docs/specs/astrographer-scope-realignment-review.md:236-243`). The report records `env.engine: 'absent'`; the numbers are still the O-0 numbers, and no O-0 stage may depend on engine presence |
| **S5** | **Collapsed pane set / expanded pane set** | the gesture rows record the pane-set census at the moment of the freeze (`paneFrames`), so a freeze measured against a different pane set is distinguishable. A row whose pane census differs between the paired control runs forces `pass:false` (§6 F9) |
| **S6** | **GPU-on leg** / **GPU-off leg** | both legs present with the `gpu` flag recorded per run; a run whose `gpu` value disagrees with the flag the driver passed forces `pass:false` |
| **S7** | **Ablation applied** / **not applied** | `trackAblation.applied` + the exact style mutation recorded; the paired runs differ only in that mutation |
| **S8** | **Arm refused / recorder handle absent** (`window.__o0recorder` missing, or the handle refusing `arm()`) | the freeze row records `hook.rendererArmed: false` + a **non-empty** `hook.refused[]` carrying `{ stages, reason }`; the five hook stages (4-8) are emitted `ms:null` + `unseparated:true` — **stays `unseparated`, never a measured value** — so the reconciliation fails (§5 P-TP-1/§6 F4) and the report cannot pass. A PRELOAD seam that refuses the wrap follows the same rule (a refused wrap is not recorded as measured) |
| **S9** | **Off-set stage** (the recorder is ARMED, but for a stage outside the armed set) | `fn` runs exactly **once**, **no** mark/measure/record is emitted, the pass-through is counted in `state().dropped`, and nothing throws (`src/shared/o0-hook.ts:257-260`) — the stage is **dropped, not measured**, and its row stays `unseparated` |
| **S10** | **Double arm / double disarm** | **idempotent**: a redundant `arm()` returns `false` and does **not** clear the measurement window, reset `dropped`, or advance `armCount`; a `disarm()` on an unarmed recorder returns `false` and does not advance `disarmCount` (`src/shared/o0-hook.ts:224-240`). A recorder still armed from a previous freeze is disarmed before the next arm, so a freeze never inherits another window's records (the driver's `state.renderer` half) |
| **S11** | **Which aggregation produced the stage rows** (`hook.stageRowsSource`) — **now a closed field** | recorded on every freeze row, with **exactly ONE legal value**: `'src/shared/o0-hook.ts:stagesFromO0HookRecords'` (the real module, dynamically imported type-stripped). The former second value (`'driver-mirror:o0StagesFromHookRecords'`, the in-driver mirror) is **DELETED** (§3.6b finding 11 / F16), so a row carrying it — or any other value — is `pass:false`. There is no drift to audit because there is no second implementation (§3.6, §6 F16) |
| **S12** | **`longtask` unsupported in the executing renderer** | `hook.longtaskUnsupported` carries the recorded error string (else `null`) and `longTasks`/`longTaskTotalMs` are `[]`/`0`. **A recorded audit input, not a forcing condition today**: a zero long-task total is a *legal* measurement, and only the recorded field distinguishes it from a genuinely tiny freeze — the adversarial pass must confirm it is never relied on as a silent zero |
| **S13** | **A control leg emitted by the PAIRED invocation (cross-artifact pairing)** | the §3.5 command pair writes one artifact per leg, so a leg whose counterpart is not in this invocation declares `pairedWithStatus: 'cross-artifact'` (the driver's `o0ControlRows`, surfaced as `driver.crossArtifactControlPairs`); the counterpart is then verified only in the merged report and this is a **note**, not a forcing reason. A comparison row with **no** control row at all still forces `pass:false` (F9) |
| **S14** | **A stage is STRUCTURALLY unmeasurable** (no seam exists in the executing bundle — the H2 class; after RUL-1 the expected membership is `snapshot.clone` only, §2.2/§3.6b) | the stage is emitted `{ ms: null, unseparated: true, source: 'hook', structural: true, structuralReason: '<the missing seam/transport>' }` — `source:'hook'` because every `structural`-capable id is a **permitted seam id** (§3.6b; `'mark'` would assert that no recorder could ever produce it) — and the run's `unseparatedStages` distinguishes it from a merely-unmeasured stage. The report's `pass:false` reason names it as **structural** (`stage <id> is structurally unseparated — <reason>`), so a reader can tell "there is no seam" from "the seam was not armed". **This is the marker that keeps the A-4 gap visible rather than laundered** (§3.6b, §12 H2) — and per **RUL-4** it is a LEGAL marker that does **not** make the row `ok:false` (§6 S19/F18). `post.style` (id 11) is `derived` and is never `structural`. When BOTH recorder instances record the same stage id in one freeze window, the row is `pass:false` with `stage <id> recorded by two instances (renderer, main) in one freeze window` |
| **S15** | **The main-side transport is absent** (`--connect`, a refused main-side arm, or a bundle without a main-side channel) | `snapshot.clone` is `ms:null` + `unseparated:true` + `structural:true` (with the RUL-3 reason: no transport **and** the out-of-host IPC clone) while `snapshot.pull` (the caller-level round trip, now awaited per RUL-2) is still **measured** — the A-4 discriminator is answered and the inside/outside split is simply not offered. Recorded per leg: `driver.mainSeamArmed: true|false` (an **OBSERVED** fact — true only when a main-instance record was actually received, never inferred from the run mode, `L3`). A report that claims the split without the seam is `pass:false` (§6 F14) |
| **S16** | **The window bound is VIOLATED** (a stage larger than its freeze — the H3 class) | the offending stage is `pass:false` with a reason naming **both** its `ms` and `longTaskTotalMs + tolerance`; the row's verdict is the explicit WINDOW-BOUND VIOLATED string, **never** a percentage; `hook.armWindow` reveals the wider interval. A row may be otherwise perfectly formed and still be this state — that is exactly why it needs a state of its own (§4.3, §5 P-TP-3, §12 H3) |
| **S17** | **Inertness is measured but VACUOUS in its long-task HALF** (the repeat block was not in `--block`, so no armed/unarmed pair exists — OR the controlled pair carried no ≥50 ms task, so the comparison is 0-vs-0) | **Two distinct sub-states, each with its own record (RUL-6):** (a) **no pair at all** — a report whose runs **armed** the hook but carries **no** inertness comparison is `pass:false` with `no hook inertness comparison was recorded although <n> run(s) armed the hook — an unverified arm is not an inert arm (§3.6(c)/§6 F17)`. `driver.hookInertness: []` is only legal when **no** run armed the hook (§3a finding 13); (b) **a pair whose long-task half is vacuous** — the second run's real state: `nonVacuous: false` (both freezes carried `longTaskTotalMs: 0`, so the "within the 40 ms band" clause compared 0 to 0) while `Δmutations === 0` held. The pair is then a **MUTATION-HALF proof**, and the row/report MUST say which half carried it — the pinned form is `the hook inertness pair is a MUTATION-HALF proof: Δmutations <n> === 0 with <m> mutation(s) observed in each freeze; the long-task half is VACUOUS (both freezes totalled 0 ms — a 0-vs-0 comparison, `nonVacuous:false`), so no numeric long-task proof is claimed` — and the report may **never** print the unqualified form `Δmutations 0 and \|ΔlongTaskTotalMs\| 0 ≤ 40 ms → inert` for such a pair. `inert: true` stays the correct VALUE (the deltas did not move); what changes is the claim's precision (§4.4's falsifiability rule applied to the inertness sentence). A report that claims a long-task-bounded inertness proof while `nonVacuous:false` is `pass:false` (§6 F21) |
| **S18** | **RUL-1's two render seams are ARMED and MEASURED** (the `L2s` fix landed) | `render.dom` / `render.ssr` carry finite non-negative `ms` with `source:'hook'`, `structural:false`, and the row's `hook.stageRecords[]` names them with their instance (`'renderer'`); a **single-pass** freeze therefore produces **11** records — one per stage id: the 2 caller-level pulls + the 5 render-path ids (with `shared.decorate`'s 4 call sites **summed into its one row**) + the **2** render emits + `reconcile.apply` — where the second run produced **7** (ids 9/10 had no seam). **Read at the artifact (third run): the folder row recorded `hook.records: 11` and the document row `22` (TWO re-derive passes — the `M1` finding, §12.13 (4)), so 11 is the ONE-pass count and 9 was the pre-fix arithmetic.** If the bundle lacks the wraps, the stages are instead `{ms:null, unseparated:true, structural:true}` with the reason naming the **missing wrap in the executing bundle** — never "no seam exists" (§2.2 RUL-1) |
| **S19** | **The report is SCHEMA-VALID while structurally incomplete** (RUL-4's decisive state) | `driver.selfValidation.ok: true` with an empty `errors[]`, rows `ok:true`, `status: "OPEN-structural"`, `pass:false` whose every reason is in the structural family, `reconciliation.ok:false` with a `reconciliation.note` naming the stages + the non-computable residual, and the `O-0 REPORT OPEN …` verdict emitted (§3.6b RUL-4, §4.4). This is the state the **second run's `ok:false` (24/12 errors) must become**: the same numbers, the corrected classification. Any `status` inconsistent with `pass`, or an `OPEN-structural` report whose note is missing, is §6 F18 |
| **S20** | **The GPU delta is reported PER RUN / PER CORPUS, never carried across runs** (RUL-5/L9) | the report's GPU control rows carry the **current** run's paired deltas and the pair's corpus + session identity, and any prose naming a delta states the run/corpus it belongs to. The first run's **+2173 / +2419 ms** is recorded as **contradicted** by the second run's **−36 / −23 ms** and may appear only as provenance ("the first run's delta is contradicted by this run and is NOT a finding any unit may rest on"), never as the current GPU effect. A report that carries a cross-run absolute delta as if it were this run's measurement is `pass:false` (§6 F20) |
| **S21** | **The engine state is derived from a POSITIVE engine signal, not from "the MCP call resolved"** (RUL-5/L1) | `env.engine` is `'ready'` **iff** the driver observed a positive engine signal — a live `gnosis-server`-backed status whose payload reports the engine as available/connected — and `'absent'` otherwise; **an error payload satisfies "the call resolved" and is NOT evidence of readiness.** The second run recorded `engine: "ready"` on both legs while **no `gnosis-server` process existed** (`pgrep -af gnosis-server` → none) — a harness mis-derivation, and the honest state is engine-absent (§6 S4's legitimate degraded mode; no O-0 stage depends on the engine). A recorded `'ready'` with no positive signal is §6 F22 |

### FS — fail-states (each loud, each with an exact observable)

| # | Fail-state | Observable outcome + message shape |
| --- | --- | --- |
| **F1** | **Stage id absent / stageCount wrong** | `pass:false`; `failReasons` includes `stage <id> missing from run <id> (stageCount <n> ≠ 11)`; the block prints `DIAG o0_* ...` with the missing ids named. **Never a silent skip** (`docs/specs/user-flow-audit.md:90-91` "a block that cannot fail is NOT evidence"). |
| **F2** | **The executing bundle is stale / mismatched** | `driver.build.verified !== true` → `pass:false`; reason `executing bundle ≠ on-disk bundle (renderer <served> vs <disk>)`; the run's numbers are recorded but **not accepted** (`docs/live-testing.md:119-124`). |
| **F3** | **A non-numeric / negative / NaN stage or counter** | `pass:false`; reason `stage <id> ms is <value> (expected a non-negative finite number or null+unseparated)`; the raw value is printed unformatted. |
| **F4** | **A stage cannot be separated** | **NOT a schema error** — the row emits `"<id>": { "ms": null, "unseparated": true }` and the run reports `unseparatedStages: [<ids>]`; the **reconciliation** then fails (P-TP-1) with reason `unseparated stage(s) <ids> cannot be reconciled`; the block prints `DIAG ... unseparated=[...]` and the artifact's §"unseparated" table names each one. **An imputed `ms` on an unseparated stage forces `pass:false`** — "a stage that cannot be separated must be reported as *unseparated*, never imputed" (`gnosis-offload-review.md:106`). |
| **F5** | **The ablation is unavailable on the platform/bundle** | `pass:false`; reason `track ablation unavailable: the stage cell is not a grid item in the executing bundle (<selector> computed display=<v>)`; the ablation's paired run is emitted with `applied:false` and `mutation:null`. **A documented fail-state, never a park** (the RCA-11 park rule: only a structurally non-exercisable surface may be parked, WITH the recorded reason — `AGENTS.md` item 11; an ablation is exercisable by definition). |
| **F6** | **The display is unreachable / wrong** | the CDP connect (the `CDP.connect` half of the driver's `CDP` class) or the app boot fails; the driver's `main()` catch prints `[live-drive] ERROR: <message>` and exits with code `2` (the `main(...).catch(...)` tail of the driver); the O-0 run is `ABORTED` with **no artifact written**. Message shape: `[live-drive] ERROR: no page target on :9222` / `waitFor timed out after 60000ms`. |
| **F7** | **The gesture was not hit-tested** | `pass:false`; reason `gesture path <path> (not 'cdp') for <selector> — hit=<hit>`; the derived verdict string still emits, naming the fallback path (the truth must be visible even in failure). |
| **F8** | **The corpus census disagrees with the claimed corpus** | `pass:false`; reason `corpus census mismatch: claimed <n> document(s), observed <m> (nodes <a>/<b>, edges <c>/<d>)`. |
| **F9** | **A control/ablation row is missing or its pairing is broken** | `pass:false`; reason `comparison row emitted without its paired <gpu-on\|gpu-off\|ablation> control row (<id>)` / `paired runs differ in <pane census\|gesture target\|corpus>`. |
| **F10** | **A required top-level field is missing** | the harness emits the verdict `O-0 REPORT INVALID: <field> missing` and `pass:false` (never a partial artifact accepted as complete). |
| **F11** | **The driver mirror and `src/shared/o0-hook.ts` disagree** (the §3.6 drift risk) — **CLOSED by F16 (the mirror is deleted), retained as provenance** | the original shape: the two implementations could diverge whenever the dynamic import was unavailable, and the `hook.stageRowsSource` field (S11) made the divergence visible only after the fact. The §3a adversarial pass found the gap genuine (finding 11) and the re-derivation **removed the mirror** rather than auditing it: the driver now imports the pinned module and aborts loudly without it, so the S11 field has exactly ONE legal value and this row can no longer fire. Its counterexample class (a second implementation of the stage-row contract) is now structurally impossible. |
| **F12** | **A display value whose parse would have produced an invalid `DISPLAY`** — CLOSED in the harness | the parsed `--display` value has its leading colon(s) stripped before the spawn env is built, so `--display=:0` **and** `--display=0` both spawn `DISPLAY=:0`. Observable: the spawned app boots (no F6), and `driver.display` reads `:0`. Pre-fix symptom (a harness defect, NOT a wrong display): the child received `DISPLAY=::0` and Electron exited on `ozone_platform_x11.cc:245 Missing X server or $DISPLAY` — which F6 would have mis-attributed to the operator's display. |
| **F13** | **A `stages[]` entry the row cannot use, or a stage value outside the stage contract** | `pass:false`; the reason names the entry **by its index** — `stages[<i>] is <value> (a stage entry must be an object carrying a stage id — §4.3)` — never through a coerced stage id like `undefined`; and a stage value that is `Infinity`/`NaN`/negative/string is `stage <id> ms is <value> (expected a non-negative finite number or null + unseparated:true — §4.3/F3)`. **The counterexample must remain constructible from the reason alone** (§4.4 requirement 4, §3a finding 2) |
| **F13a** | **A stage exceeds the freeze window it belongs to** (H3) | `pass:false`; reason `stage <id> ms <ms> exceeds the freeze it belongs to (<longTaskTotalMs> ms + <tol> ms tolerance) — a stage cannot be larger than the window it is measured in`; the row's derived verdict is `… WINDOW-BOUND VIOLATED: no percentage verdict is emitted for this row` and **no `%` string is emitted for that row**; `hook.armWindow` is recorded. **Never a percentage** (§4.3/§4.4, §5 P-TP-3) |
| **F14** | **A stage is structurally unmeasurable, or a stage is double-recorded** | `pass:false`; reason `stage <id> is structurally unseparated — <the missing seam> (§6 S14: the seam does not exist in the executing bundle)` **or** `stage <id> recorded by two instances (renderer, main) in one freeze window`. The row still emits `ms:null` + `structural:true` for it — this fail-state is about the **reason's precision**, never about imputing a value |
| **F15** | **The page-global arm handle is missing, refused, or over-exposes the recorder** | three observables, all recorded: (a) `hook.rendererArmed:false` + a non-empty `hook.refused[]` when the handle is absent or refuses (the five render-path stages then stay `unseparated` — §6 S8); (b) the published value exposes **exactly `{arm, disarm, isArmed, records, state}`** — a handle reachable with `record` or `reset` is `pass:false` with `window.__o0recorder exposes <keys> (the page global must publish the sanctioned projection only — a page script must not be able to commit or erase a measurement)`; (c) a handle published at module scope (i.e. merely importing the renderer publishes it) is `pass:false` with `window.__o0recorder is installed at module scope — it must be installed on first arm, from inside a function` |
| **F16** | **The driver's aggregation is not the pinned module's** | the mirror fallback is **deleted** (§3.6b): the driver imports `src/shared/o0-hook.ts` exactly as it imports `src/shared/o0-report.ts`, and an unavailable import is a **loud abort** — the `main()` catch prints `[live-drive] ERROR: <message>` and exits **2** with **no artifact written** (the F6 discipline). A report whose `hook.stageRowsSource` is anything other than `'src/shared/o0-hook.ts:stagesFromO0HookRecords'` is `pass:false`. **No second implementation of the stage-row contract may exist in the driver** |
| **F17** | **The driver's self-validation failed, or the inertness comparison is vacuous** | (a) the driver runs `validateO0Run` over every emitted row and `validateO0Reports` over its own report **before** writing it and APPENDS their `failReasons` to `driver.failReasons`: a validator rejection that the driver's inline rules missed is `pass:false` with `driver self-validation rejected <n> row(s): <the validator's reason(s)> (§3.6b)`; (b) a report whose runs **armed** the hook but carries **no** inertness comparison (`driver.hookInertness: []`) is `pass:false` with `no hook inertness comparison was recorded although <n> run(s) armed the hook — an unverified arm is not an inert arm`. An empty `hookInertness` is legal **only** when no run armed the hook (§6 S17). **(c) RUL-4 clause 6 SUPERSEDES the second run's use of (a)**: a validator rejection whose ONLY content is the structural family (`stage <id> is structurally unseparated — <reason>`) is **not** a self-validation failure — it must be `ok:true`/empty `errors[]` with `status:"OPEN-structural"` (§3.6b RUL-4, §6 S19). A report that prints `driver self-validation rejected <n> row(s)` for structural-only content is itself a defect named by this row |
| **F18** | **The structural marker is abused, or the report STATUS contradicts its own data** (RUL-4 clauses 2/4) | `pass:false`; reasons are exactly one of: `stage <id> records structural:true while it is separated (ms <ms>) — §4.3/RUL-4: the marker describes an unmeasurable stage, never a measured one`; `stage <id> records structural:true with no structuralReason — an unseparated stage must name the missing seam/transport (§4.3/RUL-4)`; `stage <id> records structural:true although its permitted seam (§2.2's closed ten) exists in the executing bundle and was merely not armed — this is UNMEASURED, not structural (§4.3/S14)`; `stage post.style records structural:true — post.style is the DERIVED residual and is never structural (§4.3/RUL-4)`; `report status "<status>" contradicts pass:<bool> (§4.2/RUL-4: OK ⇔ pass:true, OPEN-structural ⇔ a pass:false whose reasons are all structural)`; `report status is "OPEN-structural" without a reconciliation.note naming the structural stages, the non-computable residual and the no-imputation statement (§3.6b RUL-4 clause 5)`. The report is still WRITTEN with the numbers inspectable |
| **F19** | **A committed span left a DANGLING start mark** (RUL-2's error path) | `pass:false`; the reason names the stage and the mark: `stage <id> left a dangling o0:<id>:start mark (no end mark/measure committed — the span must close on BOTH settlement paths, §3.6/RUL-2)`. Observable from the row: a `hook.stageRecordDetail` entry (or an `o0:*` performance entry) with a `start` mark and no matching record; the frozen recorder's `state().records` count for the stage is 0 while `armCount` advanced. An `error`-bearing record (a rejected round trip) is a **legal** record and never this fail-state |
| **F20** | **A cross-run GPU delta (or a cross-run absolute) is reported as this run's measurement** (RUL-5/L9) | `pass:false`; reason `the GPU control reports a delta carried from another run/corpus (<Δ>) — the GPU delta is reported per run/per corpus and is never carried across runs (§2.4/RUL-5; the first run's +2173/+2419 ms is CONTRADICTED by this run's −36/−23 ms)`. The provenance form is legal and must be labeled as such: a prose mention of another run's delta must name that run and its corpus |
| **F21** | **The inertness pair claims a long-task proof it does not have** (RUL-6) | `pass:false`; reason `the hook inertness pair is reported as a long-task-bounded proof while nonVacuous is false (both freezes totalled <n> ms) — a vacuous half proves nothing; report the MUTATION-HALF form instead (§6 S17/RUL-6)`. The correct observable is the mutation-half sentence of S17(b), which IS legal and does not force `pass:false` (the pair's `inert` value stands); only the unqualified claim is the fail-state |
| **F22** | **`env.engine` claims `ready` without a positive engine signal** (RUL-5/L1) | `pass:false`; reason `env.engine is "ready" but no positive engine signal was observed (<the observed evidence: no gnosis-server process / an error payload from the status call>) — the engine state must be DERIVED from a positive signal, never from "the MCP call resolved" (§4.3/S21/RUL-5)`. The correct record is `env.engine: "absent"` (the legal degraded mode, §6 S4); the O-0 numbers are unaffected, so the row's other fields stand. A run whose engine state cannot be derived at all records `"absent"` **with the evidence string**, never a guess |

**Throw patterns.** The driver's blocks never throw for a domain failure — they return
the report fragment with `pass:false` + `failReasons` (the `rowResult`/`diagResult`
discipline). Hard failures (no CDP page, a boot timeout, an evaluate error) **do** throw
and are caught by the driver's per-block `try/catch` — recorded as a `FAIL` line and a
non-zero exit code (the driver's block loop + its `process.exitCode` derivation). The
pure validator modules (§5 — `src/shared/o0-report.ts`, `src/shared/o0-hook.ts`) return
discriminated results (`{ ok, errors, ... }`, the `reconcileMatrixRows` pattern) and
**never throw** on malformed input — a malformed row is an `ok:false` with the field
path named. The one exception is `src/shared/o0-hook.ts`, whose **record-level** helpers
throw the pinned loud errors (`O0_HOOK_STAGE_NOT_ALLOWED` at construction/arm time,
`O0_HOOK_RECORD_INVALID` when a malformed record would otherwise be imputed into a stage
`ms`) — a config/record error is a programming error, never a report state.

---

## 7. §3a / §3b — Adversarial findings (RCA-3)

**§3a (adversarial pass on the landed harness):** **13 findings recorded — 1 REJECTED by
counter-evidence (finding 1, per the architect's ruling **R-1**), 4 MUST-FIX host defects,
5 SHOULD-fix, 3 TEST remands.**
Classified per `docs/specs/user-flow-audit.md:116-118` (`schema` / `imputation` / `proxy` /
`not-a-real-gesture` / `verdict-contested`) plus this unit's `unauthorized-access` and
`under-strong` classes. Every finding carries its site by **symbol** where the line drifted.

**§3b (re-audit after the fixes):** `PENDING in part — owed before O-0 is reported done.` §3b must
confirm, at minimum: (i) the four MUST-FIX fixes are in the tree with their rows GREEN and a
fresh trio; (ii) `R1` is **gone** (withdrawn) and no surviving row asserts it; (iii) the
mirror deletion (finding 11 / F16) landed with a loud-abort test; (iv) the driver's
self-validation (finding 12 / F17) runs the pure module over its own report — **with the
RUL-4 classification (structural-only content is `ok:true`)**; (v) the H3
window-bound row (`P-TP-3`) is green and the armed window is recorded per freeze; (vi) the
**RUL-1 render seams** are instrumented and measured (S18); (vii) the **RUL-2 awaited span**
is landed with the settlement/error semantics and its `P-HK-1` draws (S9/S17 unaffected);
(viii) the **RUL-4 `status`/`reconciliation.note`** are emitted and the structural
classification is the validator's (S19/F18); (ix) the **RUL-5 form pins** (`L1` engine
derivation, `L8` zero-window verdict, `L10` provenance-vs-pin, `L12` `derived`) and the
**RUL-6 mutation-half sentence** are observable in a fresh artifact.

**§3c — the SECOND-RUN live findings (`L1`..`L12`) and their rulings (recorded here as the
adversarial/audit record for the second run; the artifact's §11 is the evidence).** The
second run's own table (artifact §11) is the finding record; this table is the **spec's
disposition of each**, i.e. what the next red set must pin. Each row names its ruling and the
section that now carries the contract:

| L | Class | Finding (artifact §11) | Disposition in THIS spec |
| --- | --- | --- | --- |
| `L1` | `derivation` (harness) | `env.engine:"ready"` while **no `gnosis-server` process existed** — "the `gnosis.status` MCP call resolved" also matches an error payload | **RUL-5** → §6 **S21** + **F22**: the engine state is derived from a POSITIVE signal, `'absent'` + the evidence string otherwise. Does not affect any O-0 stage (§6 S4) |
| `L2` | spec-vs-live contradiction (harness, FIXED in the driver) | the page arm set was the 5 render-path ids, so the shell's own `record('snapshot.pull', …)` calls were **off-set and DROPPED** (`hook.dropped: 2`) and §11 gate item 7 was unsatisfiable by construction | **RUL-1** → the arm set is re-derived: the page arm requests `O0_RENDER_HOOK_STAGES` (**7** ids after RUL-1), never `snapshot.clone`; §3.6b pins the two constants and §11 item 7 stays |
| `L2s` | `schema` (harness gap, mislabeled as structural) | `render.dom`/`render.ssr` "have no seam at all" — nothing marked the emit | **RUL-1** → §2.2 + §3.6b: two REAL seams are added (ids 9/10 in the permitted set of **10**); after the fix, `structural:true` on them requires the *missing wrap* reason, never "no seam exists" (§6 S18/F14) |
| `L3` | `harness` (FIXED: observed, not assumed) | `mainSeamArmed` was inferred from the run mode and a fabricated `{stage:'snapshot.clone', instance:'main'}` attribution was pushed | **kept** — the observed-fact rule is the contract: a report may not claim a record it never read (§6 F14/S14); §3.6b's union rule already requires per-record instance attribution |
| `L3s` | `structural` | the MAIN instance is armed but **no channel transports its records** → the inside/outside split is structurally unavailable in `spawn` mode | **RUL-3** → §2.2 stage 2 + §3.6b: `snapshot.clone` stays `structural:true` with the reason naming the **transport gap + the out-of-host IPC clone**; the residual explanation must name it. **NOT** a new measurement |
| `L4` | `harness` (FIXED) | the A-4 read count came from the aggregated stage row, so `1` and `2` reads were indistinguishable | **kept**: the count is derived from `hook.stageRecordDetail` (one entry per recorded span); §4.4's A-4 form + §11 item 7 depend on it. The second run's **1 (folder) / 2 (document)** reads are the first real count |
| `L5` | `imputation` / `under-strong` (src-side) | the caller-level span wrapped only the **synchronous** call (`await` outside `record()`), so `snapshot.pull` measured `0.0-0.2 ms` and the real round trip hid in the 112-126 ms residual | **RUL-2** → §3.6: ONE pinned async/settled span shape (`ms` across settlement, rejection commits + propagates, no dangling start mark), §5 `P-HK-1` widened, §6 F19. The A-4 **ms** becomes measured; the count was already real |
| `L6` | `harness` (FIXED) | the arm-window end was taken 1-2 CDP round trips late → a manufactured WINDOW-BOUND VIOLATED (71.6 ms overshoot) | **kept** — the fix (one page-side drain+disarm evaluate, the in-page disarm timestamp) is the landed shape; §4.3's window rule + §5 `P-TP-3` stand unchanged. Second run: every row's overshoot ≤ **0.8 ms**, `violated:false` on all six |
| `L7` | `harness` (FIXED) | the repeat pair's freezes were not state-reset → a toggle no-op produced `Δmutations −166` "non-inert" and a vacuous 0-vs-0 pair | **kept** — the controlled pair (state reset before BOTH freezes + `controlledPair`/`stateReset`/`nonVacuous` recorded) is the landed shape; **RUL-6 closes the remaining claim gap** (§6 S17(b)/F21: a vacuous long-task half is a **mutation-half** proof and must say so) |
| `L8` | `verdict` (harness) | the derived verdict printed the literal **`(null%)`** on a zero-window row | **RUL-5** → §4.4's zero-window form: no percentage without a finite positive window, `pct:null` + `pctReason:"zero-window"`, **no `null%` string anywhere** |
| `L9` | `verdict` (harness/report) | the GPU delta is **CONTRADICTED** (+2173/+2419 → −36/−23) with identical mutation counts | **RUL-5** → §6 **S20** + **F20** + §4.3: the GPU delta is reported **per run/per corpus** and **never carried across runs**; the first run's delta may appear only as labeled, contradicted provenance. **No downstream conclusion may rest on it** |
| `L10` | `corpus` (report) | the corpus is **not byte-reproducible**: 226 docs both runs, but **6 102 / 9 266** vs **10 170 / 18 758** nodes/edges | **RUL-5** → §3.4/§4.3: the **SIZE** is the gate; bytes/nodes/edges are **recorded provenance**; cross-run absolute comparisons are not claims; trigger (b)'s node-ceiling input is read from the same run's corpus row with the byte gap named (§10 item 2) |
| `L12` | `derivation` (report) | `post.style` is a computed residual (`ms:null` + `unseparated:true` on every row) and the reconciliation cannot close; `selfValidation.ok:false` (24/12 errors) was read as "expected and correct" | **RUL-5 + RUL-4** → §4.3/§4.4 (`post.style` is `derived` in every table and verdict; the residual is never a measurement) **and** the decisive reclassification: `ok:false` for structural-only content is **a module defect, not correctness** (§3.6b RUL-4, §6 S19/F18); the report instead carries `status:"OPEN-structural"` with a reconciliation note |

**Two further artifact observations recorded by this pass (documentation-review inputs, not
rulings).** (1) The second run's rows label an unseparated `snapshot.clone` with
`source:"hook"` while §3.6b's older text said an unseparated main-side stage is `'mark'` — the
rows are right and the text was wrong: `snapshot.clone` IS a permitted seam id, so its
unseparated `source` is `'hook'` (§3.6b, corrected here). (2) Every row's
`disarmCount` is exactly one lower than its `armCount` (0/1, 1/2, 2/3, 3/4) because the
driver's `arm()` for the NEXT freeze precedes the previous freeze's disarm — a legal
sequencing artifact, **not** a defect, but the report should not present the pair as a
same-freeze count without stating that the disarm for freeze *n* is recorded on freeze *n+1*.

| # | Sev | Class | Site (verified against the tree) | Finding | Disposition |
| --- | --- | --- | --- | --- | --- |
| 1 | **REJECTED** | `verdict-contested` | `tests/unit-o0-report-contract.test.ts` row `R1` (`:610-625`), against `src/shared/o0-report.ts` `validateO0Run` (`:183`, the fail-loud branch) | The claim: `validateO0Run` accepting a `pass:false` row that carries a genuine `failReasons` line is a defect. | **REJECTED BY COUNTER-EVIDENCE (R-1).** A `pass:false` row carrying real reasons **is a legitimate FAILING MEASUREMENT** — the row's own verdict is what the row reports, and the report-level verdict is what aggregates it (`o0DeriveReportPass` pushes every row's reasons into `driver.failReasons`). Requiring `ok:false` here would make every honest failing row a *schema* error and destroy the distinction between "the measurement failed" and "the report is malformed". The existing row **`F5`** (`tests/unit-o-0-report-contract.test.ts:585-598`, asserting `r.ok === true` for a `pass:false` row with an ablation-unavailable reason) states the correct contract and **STANDS**. The adversarial `R1` has been **WITHDRAWN** (the TestWriter is removing it) and **must not be re-pinned**. **The real defect class is the opposite shape** — a `pass:false` row with an EMPTY `failReasons` — which the landed branch already catches; §4.3 now records that inversion explicitly so the class cannot be re-invented. |
| 2 | **MUST-FIX** | `schema` | `src/shared/o0-report.ts` `reconcileO0PostStyle`'s return (`:531` — the function declaration; the return shape is its first branch), vs the driver twin `o0ApplyPostStyle` (`scripts/live-drive.mjs:1009`); row `R3` (`:651-675`) | `postStyle` could be emitted as `{ ms: null, unseparated: false }` (when the residual is `null` from a non-finite total), and the module and the driver **twin disagree on the negative/over-tolerance branch**: the module leaves `post.style` out of `unseparatedStages` and reports it separated, while the twin pushes it into `unseparatedStages`. | **FIX (contract §4.3/§6 F13):** `postStyle.ms === null` **⇒** `postStyle.unseparated === true` (one branch, never two); a **negative or over-tolerance** residual is `ok:false` with a reason **naming the residual**; the module and the driver twin must agree on that branch (the twin's `post.style` insertion is the pinned shape). |
| 3 | **MUST-FIX** | `under-strong` | `src/shared/o0-report.ts` `compareO0StageIdSets` (`:457` — the declaration; the de-dupe is inside its body) and `unseparatedStageIds`'s `String(s.id)` (`:143`); row `R4` (`:677-706`) | The SET comparator de-dupes both sides, so a run carrying a **duplicated** stage id compares `equal:true` — the determinism oracle (P-SM-2) cannot see a set violation. `String(s.id)` leaks the literal **`'undefined'`** into `unseparatedStages` and into the derived verdict's "largest identified stage". | **FIX (contract §5 P-IM-2/§6 F13):** `compareO0StageIdSets` returns `equal:false` when any id **repeats** in either run (a SET comparison that cannot see a duplicate is under-strong); `unseparatedStageIds` (and every derived verdict) **skips non-string/`undefined` ids**, so no `'undefined'` phantom ever reaches a verdict. |
| 4 | **MUST-FIX** | `unauthorized-access` | `src/renderer/runtime.ts` `:80-90` (the handle's install function; the assignment at `:83` — once the module-scope publish at `:75-77`); row `B9` (`tests/unit-o-0-hook-contract.test.ts:808-852`) | The page global published the **FULL** recorder — `arm`/`disarm`/`record`/`reset` — at **module scope**, so any page script could commit a measurement (`record`) or wipe one (`reset`), and merely importing the renderer published the handle. | **FIX (contract §3.6/§6 F15):** the published value exposes **only `{arm, disarm, isArmed, records, state}`** (no `record`, no `reset`) and is installed **on first arm, from inside a function**. §3.6b pins the runtime meaning: a page-side `arm()` may request the render-path subset only. |
| 5 | **MUST-FIX** | `schema` | `scripts/live-drive.mjs` `o0DeriveReportPass` (`:1155-1200`) — it never imports/calls the pure validator; `o0RowPass` (`:693-716`) re-implements a subset inline; the ordering at `:966-967` | The driver never runs the **pure validator over its own report**: its inline rules can (and on this unit did) accept rows the pinned module would reject, and `o0ApplyPostStyle` runs **after** the reasons are computed, so a reconciliation-forced reason can be computed too late to be part of `failReasons`. | **FIX (contract §3.6b/§6 F17):** `o0BuildReport` must run `validateO0Run` per row and `validateO0Reports` per report **before writing**, through the **same guarded twin-import** (no mirror), and **append** their `failReasons` to `driver.failReasons`; `driver.selfValidation` records `{ok, attempts, runIds, errors}`. **RESOLVED 2026-09-21 — as an INVARIANT PIN, not as a landed defect (the TestWriter's counter-evidence, `tests/unit-o-0-driver-contract.test.ts` `D24`/`D25`).** The ordering half of this finding was verified to be a **HAZARD, not an observable defect**: `report.driver.openStructural` was read before the self-validation `derived.gating.push`, and nothing in the driver or the report consumed the pre-push reading — the stale field was **DEAD**, so no emitted artifact ever contradicted itself. What the finding therefore owes is an **invariant pin** (D24/D25: the emitted report's `status`/`pass`/`failReasons` must all read the SAME final reason set, recomputed after the late self-validation push), which has landed. The **one residual is now FIXED** (`scripts/live-drive.mjs`: `report.driver.openStructural` is recomputed AFTER that push; §12.14 (driver residual), artifact §7.5/§10.3 — pre-push and post-push readings are equal on the fourth run's legs, which is why the defect was latent there). The OTHER half of this finding (running the pure validator over its own report before writing) landed with F17(a)/RUL-4. **No open driver-ordering defect remains.** |
| 6 | **SHOULD** | `under-strong` | row `R2` (`:627-649`) | A `stages[]` entry the row cannot use is reported through a **coerced stage id** (`'undefined'`) rather than its `stages[<i>]` **INDEX**, so the §4.4 falsifiability counterexample ("delete one `stages[]` entry") is not constructible from the reason. | **FIX (contract §4.3/§6 F13):** name the offending entry by index. |
| 7 | **SHOULD** | `under-strong` | `tests/unit-o0-report-contract.test.ts` `P-IM-1` row's generator (`:720-802`) | The row text pins "every stage ms **and every counter**" but every draw perturbed only a stage value — a counter defect (`longTaskTotalMs`/`mutations`/`wallMs`) could not be exercised. | **FIX (TEST remand → now LANDED as modes 1-9).** Generator modes added; the `longTaskTotalMs === null` mode is additionally constrained by R-2 (§4.3: the primary oracle is required, so `null` is `ok:false`, not a legal unmeasured form). |
| 8 | **SHOULD** | `under-strong` | `P-IM-2` row's generator (`:803-852`) | No draw had `missing` and `extra` **both** non-empty, and no reversed-order legal row existed — the totality oracle was never exercised against a duplicate **plus** a removal. | **FIX (TEST remand → LANDED as modes 14/15).** |
| 9 | **SHOULD** | `under-strong` | `P-SM-1` row's generator (`:853-903`) | Only ONE field of a COMPLETE triplet was perturbed, so a **partial** object (a field missing on both sides) compared `equal` and validated `ok:true`. | **FIX (TEST remand → LANDED as modes 1-5).** |
| 10 | **SHOULD** | `under-strong` | `P-SM-2` / `P-TP-1` row generators (`:904-968`, `:969-1067`) | The determinism generator never drew a duplicate id, an unknown extra id, or an all-zero row (finding 9); the reconcile generator never drew the band edge, a zero/non-numeric tolerance, a **separated stage carrying `ms:null`** (silently summed as 0), or the `Σ > total` all-separated case (finding 10). | **FIX (TEST remand → LANDED as modes 3-5 and 5-10).** The `Σ > total` case is the one that exposed MUST-FIX finding 2's twin disagreement. |
| 11 | **MUST-FIX** | `under-strong` | `scripts/live-drive.mjs` `o0StagesFromHookRecords` mirror (`:661-678`) + the guarded import (`:649-656`); §3.6's "mirror-fallback drift risk" paragraph | Two implementations of ONE contract: the in-driver mirror can diverge from `src/shared/o0-hook.ts` whenever the dynamic import is unavailable — and the divergence would move **every** stage row and the `post.style` residual on exactly those runs. The recorded `stageRowsSource` made divergence *visible*, never impossible. | **FIX (contract §3.6b/§6 F16): the MIRROR IS DELETED (option (b)), not audited (option (a)).** The driver imports the `.ts` twin the same way it imports `src/shared/o0-report.ts`; an unavailable import is a **loud abort** (`[live-drive] ERROR:` + exit 2, no artifact), never a fallback. Rationale recorded in §3.6b: this artifact is a *contract* artifact — a report from an unverifiable second implementation is worth less than no report, and an abort is unambiguous. Option (a) ("run both and fail on disagreement") was rejected because it keeps the second implementation alive and adds a third comparison surface. |
| 12 | **MUST-FIX** | `verdict-contested` | `scripts/live-drive.mjs` `o0DeriveReportPass` (`:1192-1198`) + `o0Acc.hookPairs` | **Inertness is VACUOUS when the repeat block is not in `--block`**: the GPU-on leg ran `--block=o0_gpu_control` alone, so `driver.hookInertness` was `[]` while **both** runs were armed — the artifact then reports "the hook is inert" nowhere, and its `pass:false` reasons do not mention the unverified arm. | **FIX (contract §6 S17/F17):** a report whose runs **armed** the hook but carries **no** inertness comparison is `pass:false`; an empty `hookInertness` is legal **only** when no run armed the hook. §11's gate item 3 is restated accordingly. |
| 13 | **TEST REMAND** | `schema` | `tests/unit-o-0-driver-contract.test.ts` (18 rows, `D1..D18`) | The driver-contract file pins the driver's **source text** but has no row for the four new contracts above (self-validation, non-vacuous inertness, mirror deletion/abort, the window-bound rule, the two-instance seam union). | **REMAND:** the TestWriter adds the rows for §3.6b/§4.3/§6 S14-S17 (**and, after the second run, S18-S21 / F18-F22 / the RUL-4 `status` + `reconciliation.note` schema rows — §12.12**) **before** the Implementer touches the driver (RCA-1: red first). The driver's own emitted report is validated by the pure module (§3.6b), which is the non-vacuous half. |

**Superseded in-tree note (provenance).** The earlier edition of this section described the
`R1`..`R4` rows as "RED … the module carries none of the four fixes yet" and left §3a/§3b at
`NONE — pending`. That note was accurate for the state it read and is now **superseded** by
the table above: three of its four findings survive as MUST-FIX §3b entries (module-side) or
SHOULD TEST remands, and the fourth (`R1`) is **rejected and withdrawn**.

---

## 8. Census + cross-references

### 8.1 Census (the numeric claims of THIS spec)

| Deliverable | Count |
| --- | --- |
| Closed **stage** ids | **11** (§2.2) — **and the set is unchanged by the H2 re-derivation** (only the SEAMS moved, §3.6b) |
| **Hook-permitted** stages | **10 configurable seam ids** (`O0_HOOK_SEAM_STAGES` = the caller-level 1-3 **+ the 5 render-path ids 4-8 + the 2 render emits 9/10** — §2.2 RUL-1/§3.6b), **7 of which a page-side `arm()` may request** (`O0_RENDER_HOOK_STAGES` = ids 4-10) |
| New `live-drive.mjs` **blocks** | **5** (`o0_folder_row`, `o0_document_row`, `o0_gpu_control`, `o0_track_ablation`, `o0_repeat_determinism` — §3.1) |
| **Property-register rows** | **8** (§5 — `P-HK-1` added with the §3.6 hook; `P-TP-3` added by the H3 re-derivation; **`P-HK-1` WIDENED by RUL-2's settlement clause in the second-run pass, and NO ninth row added** — the RUL-4 structural contract and RUL-5's form pins land in §3.6b/§4.3/§4.4/§6 with their rationale recorded in §5) — **AT the cap**, budget `60×6 + 40 + 50 = 470` (≤100/row) |
| New PURE source modules | **2** (`src/shared/o0-report.ts`, `src/shared/o0-hook.ts`) — §4/§3.6 |
| Instrumented (`record()`-wrapped) call sites | **7 render-path/emit sites** (§3.6 — the five 4-8 **plus the DOM emit and the SSR mirror emit**, RUL-1; the `shared.decorate` body keeps its **4** call sites) **+ 3 caller-level/main-side seams** (`snapshot.pull`, `snapshot.clone`, `docheads.pull` — §3.6b) = **10**, i.e. 7 sites inside the bundle + 3 wraps |
| `snapshot.pull`/`docheads.pull` span shape | **async/settled** (RUL-2 — the span covers the awaited round trip, closing on resolution **or** rejection; §3.6) |
| Structural stages in a legal report | **0 or 1** (`snapshot.clone` only, while the RUL-3 transport gap stands): after RUL-1 every other id has a permitted seam, and `post.style` is `derived` (never `structural`) — §4.3/§6 S14 |
| Report `status` values | **3** (`"OK"`, `"OPEN-structural"`, `"FAIL"` — RUL-4, §4.2/§3.6b) |
| New test files / tests | **3** files, **114** rows GREEN at the FOURTH-run read (**114 = report-contract 50 + hook-contract 39 + driver-contract 25** — `tests/unit-o-0-report-contract.test.ts` **50**, `tests/unit-o-0-hook-contract.test.ts` **39**, `tests/unit-o-0-driver-contract.test.ts` **25**, `D1`..`D25`). The **106** (report-contract 44 + hook-contract 39 + driver-contract 23) was the third-run read and the **pre-fix** count: the `O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` fix added **6** report-contract rows (`PD1`..`PD5` + the `PD5b` legal control; the moved `ST2`/`ST4`/`ST5` rows kept their identity and gained the `pass:false` half) and the driver's ordering-invariant pin added **2** (`D24`/`D25`). Earlier readings stay provenance: **99** at the pre-fix edit (39/37/23) and **95** at the second run (23/37/35). The `P-TP-3` band read is **GREEN**: the validator band fix **LANDED** (`src/shared/o0-report.ts` calls `deriveO0WindowBound(run)` with **no** options), so no cycle-in-progress red is owed in this file (§12.11). **Counts move; re-read before quoting.** |
| `runs[]` rows in a full 4-block artifact | **6** (2 gesture freezes + 2 GPU-control freezes + 2 ablation freezes; the determinism block re-reports an existing run rather than adding a row) |
| `controls[]` rows in a full artifact | **4** (`gpu-on`, `gpu-off`, `track-ablation-on`, `track-ablation-off`) |
| New driver flags | **3** pinned (`--gpu`, `--o0-corpus=`, `--o0-out=`) (§3.3) **+ 2 landed by the live pass** (`--corpus-root=<dir>`, `--strict-seed`, both default-safe — §3.4/§12 H7) = **5** |
| New committed artifact files | **1** (`docs/specs/unit-o-0-per-stage-breakdown.md`) (§4.1) — **re-committed by the FOURTH live run (2026-09-21, the post-fix harness) and CURRENT per §12.14**: runs **1-3 are named SUPERSEDED** **inside** the artifact, its raw JSON is embedded verbatim (both legs, byte-exact round-trip verified), and **no number in it is awaiting a fix**; what stays incomplete is the MEASUREMENT (`snapshot.clone` `structural:true`, the therefore-derived `post.style`) — the ACCEPTED structural set per DEC-1. (§12.13 records the THIRD run, whose artifact revision is now SUPERSEDED by the fourth — RCA-11: a changed harness invalidates the prior live provenance.) |
| New `$`-row in `MATRIX_ROWS` / `ROW_EXTENDED` | **0** (O-0 claims no §5.U row and no extended row — §3.2) |
| Operator corpus census | **226 documents** pinned (`docs/defects.md:26`) — **the SIZE is the gate** (RUL-5/L10). The first run observed **226 / 10 170 / 18 758**; the second run observed **226 / 6 102 / 9 266** from a different generator — both legal, the bytes/nodes/edges being **recorded provenance, not pins** (§3.4/§4.3) — seed **`o0-2026-09-17`** (§3.4) |
| Trio | **`npm test` IS RED — and NOT for O-0.** The **NON-O-0 toolchain regression** (`SUITE-RED-AFTER-VITEST5-ELECTRON44`: the third-run read is `npm test` = **214 files / 25 failed / 4 820 pass / 58 skip** (**8 failed files of 214**, 206 passed), appearing with the user's `98ea185` vitest 2→5 / electron 33→44 / esbuild 0.24→0.28 bump; the first reading was **22 failed / 4 819 pass** in 7 files, and **run 2 also read 22**) is the blocker. **THE READINGS IN THIS CELL ARE HISTORICAL (third-run/O-0-record readings, kept as provenance): the blocker was CLOSED 2026-09-21. The current full-suite reading is 217 files passed (217) / 4 913 passed / 58 skipped / 0 failed (4 971 total), exit 0 (the 4 905 / 4 963 reading was the pre-fix tree; the O-0 fix adds the 6 report-contract + 2 driver-contract rows).** **The 22 → 25 drift across runs is NON-O-0 — recorded as drift, never attributed to O-0.** **O-0's own leg is GREEN in the same reading: 114/114** (**report-contract 50 + hook-contract 39 + driver-contract 25**; the third run read 106 = 44/39/23, run 2 read 95 = 23/37/35), all **8 register rows held** (the 470-attempt budget). **The AGENTS.md item 4 discipline this cell stated ("no unit may be reported DONE on a green-`npm test` claim while this regression stands") is SATISFIED as of 2026-09-21 — the regression is FIXED (see `docs/defects.md`), so it no longer blocks any unit** |
| `src/` **behavior** change | **0** at the reported trio — the §3.6 hook is inert when unarmed (`P-HK-1`); the contact is 2 new pure modules + 7 wrap-only call sites + 1 guarded `window.__o0recorder` handle (landed hardened: 5 keys, installed inside the runtime's construction). The RUL-1..RUL-6 **fixes HAVE LANDED** (the RUL-1 render wraps, the RUL-2 async span, the RUL-3 reason, the RUL-4 validator reclassification + `status`, the RUL-5 `L1`/`L8` derivations) and the third run executed on that bundle (§12.13); **still measurement-only and inert-when-unarmed**. The `src/` anchors for those wraps are re-pinned in §8.2 |

### 8.2 Cross-references

- **`docs/specs/unit-o-0-per-stage-breakdown.md`** — the live artifact (**re-committed by the
  THIRD run, host clock 2026-09-20**; the first run's record is §12 below, the second run's
  is §12.12, the third run's is §12.13).
  Read it **with §12.13**, which is its record: the run-3 artifact is **CURRENT** (the runs it
  supersedes are named SUPERSEDED INSIDE it, §12.13's status block is normative for that), and
  the unit is **DONE** per DEC-1 with the one ACCEPTED structural gap (§12.13 (8)/(9)).
- `docs/specs/gnosis-offload-proposal.md` — O-0 row `:250`, the staged stage list, §3.2
  architecture ruling `:149-190`, `A14` unmeasured alternatives `:49-53`, "what is NOT
  claimed" (§1's honest counter-consideration `:240-244`).
- `docs/specs/gnosis-offload-review.md` — §1 `:63-71` (the hard precondition), §2.1(a)
  `:97-110` (the re-scope + the `unseparated` rule), §3 O-0 row `:145-155` (LIVE row =
  **E**), §4 `:284-296` (the snapshot-pull finding), §5 items 1/3/4/9/10 `:307-316`,
  §6 `:321-394` (the O-1/O-2 risk the O-0 numbers feed), §7 A-1/A-4/A-10 `:400-429`,
  §8 `:433-485` (parked-track bookkeeping).
- `docs/specs/astrographer-scope-realignment-review.md` — §3.1/§3.2 `:193-221` (the shell
  keeps the render path; `buildTraversal` and `assembleAppGraphEnvelope` stay
  in-process), §3.4 `:236-243` (the engine-absent degraded-mode contract), §4 `:247-272`
  (the C1..C20 chrome table — the pane/zone elements O-0 measures: C2 stage, C5 collapse,
  C7 gutters, C9 UI-config serialization, C11 empty-zone, C12 minimize, C15 doc-nav),
  §8 items 1/6/12 `:406-417` (item 6 + item 12 remain OWED).
- `docs/specs/user-flow-audit.md` — §2 `:32-55` (the ≤8 capped §5.U matrix), §3 `:57-108`
  (the §6.1 row schema: `realInput`, `proxyPASS`, `evidence`, "a block that cannot fail
  is NOT evidence"), §4 `:110-120` (the §6.2 read-only audit).
- `docs/specs/rca-live-bugs-green-pipeline.md` — RCA-11 `:121-132` (the live battery is
  a mandatory pre-DONE gate; park only a structurally non-exercisable surface), CA-2
  `:126` (the rendered-DOM/assembly smoke gate = `live-drive.mjs` blocks), CA-6 `:130`
  (the final review includes a full-app boot + key-DOM check).
- `docs/next-steps.md` — the CURRENT WORK entry (this pass) + the env note `:67`
  (DISPLAY propagation).
- `docs/decisions.md` — `ARCH-GNOSIS-OFFLOAD` `:24` (the row that already pins O-0 as a
  hard precondition, the report-shape re-scope, and the landing order), `D-GP-UFA-3`
  `:17` (falsifiability + real-input proof), `D-GP-UFA-4` `:18` (§6.1 report shape +
  row-set reconciliation).
- `docs/defects.md` — `HEAVY-OPS-FREEZE-THE-PAGE` `:26`, `CANVAS-DIMENSIONS-JS-DRIVEN`
  `:27`, `PANE-TOGGLE-FULL-REASSEMBLY` `:40`, `PANE-SLOT-INSTABILITY-ON-DISCLOSURE`
  `:52` (the four rows whose numbers O-0 either reproduces or corrects; **re-pinned +4 at the
  first defect re-pin and +22 after the two O-0 rows were inserted at the top of the OPEN table
  — `:22 → :26`, `:23 → :27`, `:36 → :40`, `:48 → :52`, verified against the tree at this pass**).
- `docs/live-testing.md` — the launcher/bundle gotcha `:119-124` (the ENV NOTE the
  bundle identity field enforces).
- Build: `scripts/live-drive.mjs` (lines re-read against the file at the DOC-REVIEW pass,
  2026-09-20 — **and where a line is unstable the anchor is cited BY SYMBOL ONLY**):
  `class CDP` `:64`, `seedCorpus` `:137`, `ufHitProbe` `:177`, `ufRealClick` `:188`,
  `diagResult` `:406`, `rowResult` `:437`;
  **the §5.U matrix anchors are cited by symbol, NOT by line — they no longer resolve by
  line and must not be quoted as numbers**: `MATRIX_ROWS` (**`export const`, the capped
  8-row `U-1`..`U-8` table), `reconcileMatrixRows` (**`export function`**), `ROW_EXTENDED`
  (**`export const`**) — the O-0 harness inserted blocks ahead of them, so any line number
  for these three is stale by construction;
  **the O-0 symbols**: `O0_STAGE_IDS` / `O0_STAGE_COUNT` / `O0_BLOCK_NAMES` / `O0_SEED`
  (`o0-2026-09-17`) / `O0_OPERATOR_DOCUMENTS` (226) / `O0_DOCNAV` /
  `O0_FOLDER_SELECTOR` / `O0_DOCUMENT_SELECTOR` / `O0_QUIESCE_TIMEOUT_MS` /
  `O0_QUIESCE_FRAME_MS` / `O0_RECONCILE_TOLERANCE_MS` / **`O0_HOOK_LONGTASK_TOLERANCE_MS`**
  (**40 ms**, `:518` — the recorded hook-inertness band, written into the row as
  `hook.toleranceMs`: **the band emission** at `:1140`, `:1029`, `:1042`, `:4284`),
  `O0_RUN_COMMANDS`, `O0_CORPUS_PROVENANCE_NOTE`, **`O0_HOOK_SEAMS`** (the 10
  seam ids), `O0_HOOK_STAGES`, `O0_RENDER_EMIT_SEAMS`, `O0_RENDERER_ARM_STAGES`,
  `O0_HOOK_RENDERER_HANDLE` (`window.__o0recorder`), **`O0_HOOK_SOURCE`** (the page-arm
  source, `:579`), `O0_PAGE_ARM_STAGES`, **`O0_HOOK_STAGE_ROWS_SOURCE`**
  (`'src/shared/o0-hook.ts:stagesFromO0HookRecords'`, `:690` — the no-mirror pin),
  `O0_MAIN_SEAM_MISSING` / `O0_MAIN_SEAM_UNTRANSPORTED` / `O0_RENDERER_SEAM_MISSING`
  (the RUL-3 reason strings), `O0_ENGINE_HEALTH_STATES`;
  **the inline window rule** (the driver's own twin of the §4.3 bound — BY SYMBOL): the
  `EXCEEDS the freeze window` reason builders (once `:1329-1330`);
  **the derived-status call**: `o0DeriveReportPass` (`export`/`function`, `:1497`) →
  `o0RowPass` (`:730`) → `o0BuildReport`/`o0WriteReport` (the last two BY SYMBOL);
  **the `hook` block assembly** (once `:1130-1140`: `armWindow {t0,t1,ms}`, `freezeWindow`,
  `records`, `stageRecords`, `stageRecordDetail`, `stageRowsSource`) and the §4.3
  `toleranceMs` field at `:1140`;
  the **CLI parse** (`main(argv)` and its `--block=`/`--gpu`/`--o0-*` option handling),
  the **spawn** (`launchArgs` — `--no-gpu` unless `opt.gpu`, `:4397`), the **block loop**,
  and the **exit sites** (`process.exitCode = fail > 0 || !recon.ok ? 1 : 0` then
  `process.exit(process.exitCode || 0)`; the `main(...).catch` prints
  `[live-drive] ERROR: …` and sets exit **2**);
  `src/renderer/sidebar-panes.ts:1499` (**`shared.decorate`**, by symbol
  `record('shared.decorate', …)`), `:1888`/`:1899` and `:2009`/`:2019` (**the two
  caller-level `snapshot.pull`/`docheads.pull` pulls in their RUL-2 async shape**);
  `src/main/main.ts:751-755` (the snapshot handler), `:785-786` (**the MAIN-side
  `record('snapshot.clone', …)` wrap**, by symbol), the spawn arm `ASTROGRAPHER_O0_MAIN_ARM`
  (`:42-46`); `src/shared/types.ts:481-502`; `src/main/traversal.ts:331` (**`traversal.build`
  wrap**; the declaration `buildTraversal` sits directly above at `:326`);
  `src/renderer/pane-graph.ts:335` (**`envelope.assemble`**; `assembleAppGraphEnvelope`
  `:330`); `src/renderer/content-reconcile.ts:427` (**`reconcile.roots`**;
  `reconcileDocumentRoots` `:422`); `src/renderer/runtime.ts:324` (**the DOM emit**,
  `record('render.dom', …)`) and `:334` (**the SSR mirror emit**), `:527`
  (**`reconcile.apply`**), the `window.__o0recorder` handle installed by
  `installO0RecorderHandle()` (`:80-90`, called from the `Runtime` constructor),
  `:143`/`:164` (`Runtime`), `:253-298`; `src/main/preload.ts:578-642`
  (there is no `Runtime` handle on `window` — §3.6).
  **CITATION-STALENESS NOTE (the sweep is DONE at this pass).** Those `live-drive.mjs`
  anchors were originally written BEFORE the O-0 section landed; the O-0 harness inserted
  ~800 lines ahead of `MATRIX_ROWS`, so every driver anchor from `ufHitProbe` onward was
  stale (the file moved 3 764 → 3 770 → 3 789 → **3 849** → ~4 548 lines across the passes),
  and the `src/` anchors for stages 1/3, 9 and 10 drifted with the §3.6 imports. **This pass
  re-pinned every driver anchor against the file AND converted the unstable ones to
  symbol citations** (`MATRIX_ROWS`, `ROW_EXTENDED`, `reconcileMatrixRows`,
  `o0DeriveReportPass`, `o0RowPass`, the inline window rule, `o0BuildReport`/`o0WriteReport`,
  the CLI/spawn/block-loop/exit sites were never stable enough to quote by line).
  The **unstable-by-construction `src/` anchors are cited by symbol too** (`Runtime`'s
  emit/wrap call sites, `buildTraversal`, `assembleAppGraphEnvelope`,
  `reconcileDocumentRoots`, the `installO0RecorderHandle` handle, the two caller-level
  pulls, the `main.ts` arm + handler wrap).
- Build (the §3.6 hook): `src/shared/o0-report.ts` (the pure report schema +
  reconciliation helpers), `src/shared/o0-hook.ts` (the pure recorder + the inertness
  oracle), the seven wraps (`src/main/traversal.ts:326`+`:331`,
  `src/renderer/pane-graph.ts:330`+`:335`, `src/renderer/sidebar-panes.ts:1493`+`:1499`,
  `src/renderer/content-reconcile.ts:422`+`:427`,
  `src/renderer/runtime.ts` `applyContentReconcile` `:521`+`:527`, **`src/renderer/runtime.ts` `render()`'s DOM emit
  `:324`-`:325` (RUL-1)** and **its SSR mirror emit `:334` (RUL-1)**), the `window.__o0recorder`
  handle (`src/renderer/runtime.ts:80-90` — installed from inside
  `installO0RecorderHandle()`, called by the runtime's construction; it publishes exactly
  `{arm, disarm, isArmed, records, state}`), and the **two caller-level pulls in their
  RUL-2 async shape** (`src/renderer/sidebar-panes.ts` `:1888`/`:1899` and `:2009`/`:2019`).
  **The main-side seam** (RUL-3): `src/main/main.ts` — the instance
  `createO0HookRecorder({ stages: ['snapshot.clone'] })` + the spawn arm
  (`ASTROGRAPHER_O0_MAIN_ARM`, `:42-46`) and the handler wrap (`:785-786`).
  **Line-anchor caveat:** this tree's line numbers were re-read at the DOC-REVIEW pass (the
  `render()` emit pair `:324`/`:334`, the apply wrap `:521`/`:527`, the handle `:80-90`, the pulls `:1888`/`:1899`/
  `:2009`/`:2019`, the main seam `:42-46`/`:785-786`); **the driver anchors were re-pinned in
  the same pass** (§8.2 — the sweep is DONE, and every unstable anchor is now cited **by symbol**
  rather than by line).
- **The band source (§3.2.1/§4.3/§12.11 — the P-TP-3 field pin; the fix LANDED):**
  `src/shared/o0-report.ts`'s **`O0_WINDOW_TOLERANCE_MS`** (`:68`, the 40 ms default constant),
  **`deriveO0WindowBound`** (`export function`, `:718` — the no-options path reads
  `run.hook.toleranceMs`, defaulting to the constant at `:735`), **`deriveO0StageVerdict`**
  (`export function`, `:778` — it takes **no** tolerance argument; its internal read is at
  `:811`), and the **validator call site** (`:329-332`: `validateO0Run`'s window-bound block
  calls `deriveO0WindowBound(run)` with **NO options** — the P-TP-3 fix's landing site, once
  the hard-coded `:298`),
  plus the driver's row assembly that RECORDS the field
  (`scripts/live-drive.mjs` — the `toleranceMs: O0_HOOK_LONGTASK_TOLERANCE_MS` emission in the
  `hook` block, `:1140`; the band constant itself at `:518`) with its own no-options reads
  (`deriveO0WindowBound` / the inline window rule — cited by symbol; the numeric line anchors
  for these are unstable, §8.2's staleness note).

---

## 9. The decision-row ruling (zero-row rationale)

**RULING: O-0 owes NO new row in `docs/decisions.md`, and this pass adds none.** The
only edit made to that file is a **citation re-pin, not a decision**: the five
shell-keeps-the-render-path function lines in the existing ACTIVE
`ASTROGRAPHER-SCOPE-REALIGNMENT` row (`docs/decisions.md:235`) had drifted by the §3.6
import/wrap (e.g. `src/main/traversal.ts:325 → :326`, `src/renderer/runtime.ts:480 →
:521` — the declaration moved again after the 2026-09-20 doc-review re-read), so the row now
names the declaration AND its instrumented wrap line.

Reason. Every decision O-0 could be said to "pin" is **already carried** by the
existing ACTIVE row `DECIDED: ARCH-GNOSIS-OFFLOAD` (`docs/decisions.md:24`), which
states verbatim that **O-0 is "the staged measurement artifact — a HARD PRECONDITION,
incl. the snapshot-pull stage"**, that the work is "mitigations-first", that the shape
is Alt C, and that the landing order is **"O-0 → O-5 → O-9+O-3 → O-10 → O-1 → O-2,
each unit a single-diff revert with its own red set"**. The two further facts this
spec adds — (a) the **report-shape contract** on the artifact and (b) **no other unit
may be delegated before the artifact exists** — are the re-scope of a row and an
ordering clause of the same row; a second ACTIVE row restating them would be a
duplicate decision, not a new one, and duplicates are how a decision table drifts.

Two rows that a reader might expect from this pass are **explicitly NOT** O-0's:
- **`SNAPSHOT-REVISION-AUTHORITY`** — OWED and **unclosed by O-0**
  (`gnosis-offload-review.md:312`; `astrographer-scope-realignment-review.md:411`, §8
  item 6: "this pass adds only the two new rows; item 6 stays owed").
- **the implemented `revision` field + stale-drop** — OWED and **unclosed by O-0**
  (`astrographer-scope-realignment-review.md:417`, §8 item 12: "the owed revision
  unit (NOT this doc set)"; today the payload has `store`/`nodes`/`edges` and no
  `revision` — `src/shared/types.ts:481-502`, `src/main/main.ts:751-755`).

If, at O-5's spec gate, the harness contract is found to need a *separate* governing
row (§6.1-style, as `D-GP-UFA-4` does — `docs/decisions.md:18`), that row is **O-5's**
to land with its own report schema, not O-0's to pre-empt.

**AMENDMENT (2026-09-20, DEC-1): the zero-row ruling above was the ruling of the MEASUREMENT
pass, and it is superseded exactly once.** The `snapshot.clone` seam decision **has now been
made by the user** (ACCEPT the structural gap), so the row the measurement pass said was OWED
has LANDED: **`O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`** (ACTIVE, `docs/decisions.md:14`) — one row,
recording the acceptance, the AMENDED O-5 gate condition (**this spec's §3.6b clause 7 is the
canonical home of the amended clause**, which is why the decisions row does not restate the
spec's measurement clauses), the uncomputable `post.style` residual, the visibility invariant
(`status:"OPEN-structural"`, never quietly `"OK"`), the SUPERSEDED clause ("ONLY `status:"OK"`
⇔ `pass:true` opens the gate") and the two OWED defect rows
(`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS`, `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`) which the
acceptance does **not** close. The reasoning above is otherwise unchanged: no duplicate row was
added, and the two rows in the list above stay OWED and unclosed by O-0.

---

## 10. The downstream contract (exactly what O-0's artifact feeds)

1. **The parked engine track's trigger (c).** `O-0 shows the derivation WALK ITSELF
   (not compile/emit/layout) exceeds the budget` is trigger **(c)** of the three
   external triggers that would schedule O-6/O-7/O-8
   (`gnosis-offload-proposal.md:162-166`; `docs/pending.md` §"PARKED DESTINATION — the engine track",
   the **"Track trigger (any one)"** list — repointed 2026-09-21: the old `docs/pending.md:134-139`
   line citation no longer resolves). O-0's
   `traversal.build` stage measured against the long-task total is the **only** input
   that can fire it — so the engine track's re-opening is **gated on this artifact**,
   and nothing else may claim trigger (c). **Status at the THIRD (accepted) run: trigger (c) stays
   CANDIDATE-FIRED for the folder-row disclosure and NOT for the document open — with the
   window bound PASSING** (`traversal.build` **684.2 ms of the 990 ms** GPU-OFF / **69.34 %**
   GPU-ON folder window, the largest identified stage in both legs; document-row
   `traversal.build` only **14.7 ms** where `reconcile.apply` dominates at **2 085.1 ms
   (93.84 %)** and `render.ssr` is second at 1 742.5 ms — §12.13). It stays a **candidate**,
   not final, for two recorded reasons: (i) the derived `post.style` residual stays
   uncomputable (the ACCEPTED `snapshot.clone` gap, DEC-1), so `traversal.build`'s *share* is
   measured against a window whose style/layout half is not separated; and (ii) the corpus bytes
   are a recorded variable (**RUL-5/L10**). **The gate for reading (c) is O-0's ACCEPTED artifact
   (DEC-1) — no unit may treat (c) as fired on any other artifact.**
2. **The parked track's trigger (b) threshold.** `the operator corpus exceeds the local
   store's measured ceiling — the node-count threshold is pinned by O-0`
   (`gnosis-offload-review.md:445`; `docs/pending.md` §"PARKED DESTINATION — the engine track", the
   **O-7 / O-8 rows** — repointed 2026-09-21: the old `docs/pending.md:135-136` line citation no
   longer resolves). The artifact's
   `corpus.nodes` census at operator size is the input to that pin — **read from the SAME run's
   corpus row, with the byte-size gap named (RUL-5/L10)**: the three runs read **10 170**
   (first) and **6 102** (second and third) nodes at the identical pinned size of 226 documents,
   so a threshold pinned from any row is **corpus-specific**, and the pin must say which corpus
   produced it. The third run's row (**6 102 nodes / 9 266 edges at 226 documents**) is the
   current input (identical to the second run's — the third run's corpus row is the accepted
   one, §12.13).
3. **O-5's budget number — pinned FROM the accepted artifact (DEC-1: O-5 is now UNBLOCKED).**
   O-5's whole red set is
   the harness's own node contract, and its **threshold comes from this artifact**
   (`gnosis-offload-review.md:308`, `:112-120`; `docs/decisions.md` `ARCH-GNOSIS-OFFLOAD`
   "pinned after O-0"; the gate condition is the AMENDED §3.6b clause 7, DEC-1 —
   `O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`). The per-GPU-leg long-task totals are the input:
   folder **990 ms** GPU-OFF / **1 032 ms** GPU-ON, document **2 222 / 2 213 ms** (§12.13), with
   the §12 H8 caveat standing (the GPU-OFF legs do not reproduce the motivating 505/439 ms
   freeze). A TestWriter that invents a threshold is the anti-pattern the review named.
4. **O-4's conditional scheduling.** O-4 (traversal walk off the UI thread) is
   **conditional on O-0** and is not sequenced; if O-0 shows the walk is load-bearing,
   O-4 is re-decided then (worker vs engine route) — A-10,
   `gnosis-offload-review.md:428-429`; proposal `:254`.
5. **The O-1 spec amendment (the snapshot-pull separation).** Per A-4
   (`gnosis-offload-review.md:409-412`), O-0's `snapshot.pull` evidence **rules in or
   out** "a doc-nav disclosure that performs no store read at all" — recorded as an
   **O-0 output feeding an O-1 spec amendment, not as a new unit**
   (`gnosis-offload-review.md:293-296`). If the folder row shows a non-zero store read
   today, O-1's spec gains that as an explicit accept criterion; if it shows zero,
   the amendment records that the cheap variant is **already true** and O-1's scope
   shrinks accordingly. **Status at the SECOND run: the A-4 read COUNT IS OBSERVED — 1
   whole-store read for the folder-row disclosure and 2 for the document open** (both legs,
   from `hook.stageRecordDetail`), so the cheap variant **"a doc-nav disclosure that performs
   no store read at all" is REFUTED for both gestures** and O-1's spec gains that as an
   explicit accept criterion. What is **still owed** for this item is the read's **ms**: the
   caller-level span measured only the synchronous call (**RUL-2**), so the item stays OPEN on
   its ms half until the awaited span ships and the third run re-measures. A *"not measured"*
   `0` remains explicitly **not** the "already true" finding this clause needs.
6. **The §6 live-risk demands on O-1/O-2.** The O-0 numbers (mutation counts, long-task
   totals, the slot census) are the baseline the O-1/O-2 duplication/slot/MCP-parity
   censuses are compared against (`gnosis-offload-review.md:368-394`).
7. **Nothing else.** O-0 pins no budget, lands no fix, re-derives no invariant, and
   changes no app behavior (the §3.6 hook is measurement-only and inert when unarmed —
   `P-HK-1`, §8.1's `src/` row). **O-0 fixes nothing.**

---

## 11. The gate shape (how O-0 is accepted)

- **Delivery kind:** **doc + harness.** The spec (this file) + the new
  `scripts/live-drive.mjs` blocks (**LANDED**) + the committed artifact
  (`docs/specs/unit-o-0-per-stage-breakdown.md`, **RE-COMMITTED by the THIRD live run
  (2026-09-20) and CURRENT for this measurement — it is NOT "superseded-pending-fix"
  any more: the three runs it supersedes are named inside it, the raw JSON is embedded,
  and no number in it is awaiting a fix. What is still incomplete is the MEASUREMENT
  (`snapshot.clone` structural + `post.style` derived), not the artifact's accuracy**,
  §12.12/§12.13) + the §3.6 hook (**IMPLEMENTED + HARDENED**, inert when unarmed — no
  behavior change).
- **The CURRENT state (read this first): the unit is DONE — THE ARTIFACT IS ACCEPTED (DEC-1,
  2026-09-20) and the O-5 gate is OPEN.** The THIRD live run RAN on the RUL-1..RUL-6 bundle
  (2026-09-20; §12.13) and produced a COMPLETED MEASUREMENT WITH ONE RECORDED STRUCTURAL GAP.
  **UPDATE 2026-09-21 — the CURRENT accepted artifact is the artifact's FOURTH edition (§12.14):
  the post-fix harness (validator recompute + the driver `openStructural` residual) re-ran both
  legs and the same shape holds (both legs `status:"OPEN-structural"`, `pass:false`,
  `selfValidation.ok:true`, `errors:[]`, `gatingReasons:[]`, `failReasons` = the structural family
  only, NO newly surfaced reason); DEC-1's acceptance is re-affirmed UNCHANGED on that edition and
  the report is still NOT `"OK"`.**
  Both legs:
  `status:"OPEN-structural"`, `pass:false`, `selfValidation.ok:true`, `errors:[]`,
  `gatingReasons:[]` — **no FAIL class fired**; `snapshot.clone` is the one
  `structural:true` id and `post.style` is `derived`. **Gate items now CLOSED by the
  third run: 1, 2, 3, 5, 6, 8, 9, 10, and 7 in full** — bundle verified both legs;
  both gestures `path:'cdp'`/`realInput:true`; inertness non-empty in BOTH legs
  (`inert:true`, `Δmutations 0`, `carriedBy:["mutations"]`, the pinned MUTATION-HALF
  sentence — the long-task half is vacuous 0-vs-0 and says so); stage-id SET equal (11
  ids) with `ms` free; census **226/226** reached; **the window bound holds on all six
  rows** (max 0.8 ms overshoot, no `null %`, no pct > 100 — item 8 stays CLOSED and must
  not regress); the report STATUS is one of the three legal values, DERIVED and
  consistent (`OPEN-structural`, `reconciliation.note` present, the `O-0 REPORT OPEN …`
  verdict emitted) with an EMPTY `errors[]` — the second run's `ok:false` (24/12) is
  gone (item 9); **and a reason minted BEFORE the family/gating split can no longer leave
  `ok`/`status`/`failReasons` behind (the `O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` fix,
  LANDED 2026-09-21: `ok` is read after the LAST post-derivation block and the F18 pins now
  live at the `pass:false` level — §11's red→green row below; the FOURTH run re-confirms the
  shape on the executed fixed bundle, §12.14);** the RUL-5 form pins hold (no `null%`, `post.style` labeled `derived`,
  the GPU delta per run/corpus only — this run reads **−42 ms folder / +9 ms document**,
  never carried; the corpus size is the gate with nodes/edges as provenance; `env.engine`
  derived as `"absent"` WITH the `fetch failed` evidence string) (item 10); and item 7 is
  now COMPLETE — `snapshot.pull` is a **settled, non-null ms for BOTH gestures**
  (**85.9 ms** folder / **179.2 ms** document, GPU-OFF; 83.6 / 172.2 GPU-ON), the awaited
  round trip the second run's 0.0-0.2 ms sync-only seam missed (RUL-2). **Item 4's
  completeness half is ACCEPTED-STRUCTURAL (DEC-1, 2026-09-20) — no longer an OPEN item:**
  10 of the 11 stage ids are measured or `derived`, with `snapshot.clone` `structural:true`
  (the RUL-3 transport gap: no channel carries the
  main recorder's records out AND the IPC structured clone is outside every host-side
  wrap) so the DERIVED `post.style` residual stays uncomputable (negative on every row:
  the run-3 measurement shape, §12.13 `M1`). **THE DECISION THE UNIT OWED HAS BEEN MADE —
  option (a): the structural set is ACCEPTED as a recorded structural gap, the derived
  residual is recorded as UNCOMPUTABLE, and O-5 is gated on the `OPEN-structural` artifact
  under the AMENDED §3.6b clause 7 conditions** (user **DEC-1** 2026-09-20; decision row
  `O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED` in `docs/decisions.md`; the SUPERSEDED clause is
  recorded there too, and the spec is its canonical home). Option (b) — **building** the
  main-side transport channel carrying the main recorder's records — remains available as a
  SEPARATE unit (an engine/host seam, its own red set per RCA-2, never a patch inside O-0,
  its own gate); its absence must stay VISIBLE in every report (`status:"OPEN-structural"`,
  never quietly `"OK"`). **Nothing in this bullet is a park; the park rule (RCA-11 / `AGENTS.md`
  item 11) is unchanged and no O-0 surface is structurally non-exercisable except
  `post.style`'s residual (by construction a derived number, §2.2 id 11) and the RUL-3
  out-of-host IPC clone. **UPDATE 2026-09-21: of the two host/tracker rows filed and OWED by the
  third-run pass (§12.13) — which the user's DEC-1 acceptance did NOT cover — the validator row is
  now FIXED (`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS`: the post-derivation reasons reach the
  final `failReasons[]`/`ok`, §12.14), and the measurement-shape row remains OPEN and SCHEDULED as
  the NEXT unit (`O0-M1-M3-MEASUREMENT-SHAPE` / `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`: `M1`/`M2`/
  `M3`, re-witnessed unchanged by the fourth run).** **APPENDED 2026-09-21 (§12.15): the unit's
  FIFTH live run RAN and FAILED — both legs `status:"FAIL"`/`pass:false`/`selfValidation.ok:false`
  (`gatingReasons` 9 / 5), findings `F5-1`..`F5-6`, three test reds; the artifact's accepted
  evidence remains the FOURTH edition and DEC-1 is unchanged.**
- **The blind-greens artifact for O-0 is the §6.1 coverage report — NOT a greens doc.**
  Per `gnosis-offload-review.md:88` ("For O-0/O-5 the blind-greens artifact is the
  *coverage report* (`user-flow-audit.md` §6.1), not a greens doc") and §2.1(a)
  `:107-110` (the driver's `MATRIX_ROWS` reconciliation is the precedent for the
  mechanism). A `unit-o-0-*-greens.md` authored for O-0 would be a review finding.
- **A merely-parked O-0 battery is not a pass** (RCA-11,
  `docs/specs/rca-live-bugs-green-pipeline.md:121-132`; `AGENTS.md` item 11), and a
  `-live-pending-battery.md` for O-0 is a review finding. **The live battery RAN on
  2026-09-17, on 2026-09-20 and again on 2026-09-20 (the RUL-1..RUL-6 bundle); all
  three runs returned `pass:false` on both legs — the THIRD at
  `status:"OPEN-structural"` with `selfValidation.ok:true`/`errors:[]`** (§12, §12.12,
  §12.13): the harness is green-by-shape, the ARTIFACT EXISTS and is CURRENT, and the
  unit is **DONE (artifact accepted, DEC-1)** — the third run leaves **ONE** stage `structural`
  (`snapshot.clone`, ACCEPTED as a recorded structural gap)
  plus the `derived` `post.style` (second run: 4 `unseparated`; first run: 6). The live run
  (`scripts/live-drive.mjs`, §3.5's two commands, on a usable display, against the operator
  app + its 226-doc persisted store **or** a seeded corpus of the pinned size, §3.4) must
  prove, from the emitted report — **items 1, 2, 3, 5, 6, 7, 8, 9 and 10 are CLOSED by the
  third run as annotated below; item 4 is ACCEPTED-STRUCTURAL per DEC-1 (its completeness
  half — `snapshot.clone` stays `structural:true` by the accepted RUL-3 gap and `post.style`
  stays `derived`), NOT open**:
  1. `driver.build.verified === true` — the SERVED `dist/renderer/renderer.js` matches
     the on-disk file (byte length + hash) and `dist/main/main.cjs` is recorded;
     **CLOSED (third run: `true` on both legs, renderer `1789952537561+678270+a25b03a9`
     GPU-OFF / `1789952556962+678270+a25b03a9` GPU-ON)**;
  2. both gestures hit-tested: `path === 'cdp'` (hence `realInput:true`) on a real
     folder-row click AND a real document-row click; **CLOSED (third run: `cdp`/`true` in
     every row of both legs)**;
  3. **hook inertness**: an ARMED run's `Δmutations === 0` and
     `|ΔlongTaskTotalMs| ≤ 40 ms` vs the unarmed baseline (`o0_repeat_determinism` →
     `driver.hookInertness[].inert === true`, §5 P-HK-1/§3.6(c)); **and the comparison must
     EXIST** — a report whose runs armed the hook but carries an empty
     `driver.hookInertness` is `pass:false` (§6 S17/F17: an unverified arm is not an inert
     arm). The 2026-09-17 GPU-on leg violated exactly this (it ran `--block=o0_gpu_control`
     alone, §12 finding 12). **RUL-6 adds the precision clause**: when the pair's
     `nonVacuous` is false the report must state the **mutation-half** proof (§6 S17(b)) and
     may not claim a long-task-bounded one (§6 F21) — the second run's pair is exactly this
     shape (`nonVacuous:false`, both freezes 0 ms, `Δmutations 0` with 37 mutations each),
     and **so is the third run's** (both legs: `Δmutations 0` with 37 mutations in each
     freeze, `carriedBy:["mutations"]`, the pinned MUTATION-HALF sentence verbatim);
     **CLOSED (third run: non-empty in BOTH legs, `inert:true`, `setEqual:true`,
     `toleranceMs 40`)**;
  4. **non-null stage rows for the render path — SEVEN stages after RUL-1** (ids 4-8 **plus**
     `render.dom`/`render.ssr`): the artifact must discriminate every render-path stage
     (`hook.rendererArmed:true`, `hook.refused` empty, and `stages[i].ms !== null` for
     `traversal.build`/`envelope.assemble`/`shared.decorate`/`reconcile.roots`/
     `reconcile.apply`/**`render.dom`**/**`render.ssr`**); if the app's bundle does
     not expose `window.__o0recorder` (or lacks the two new wraps) the stages stay
     `unseparated`, the reason names the **missing wrap**, and the artifact must say
     so (§6 S8/S18), not report a number. The second run measured the five and reported ids
     9/10 as "no seam exists" — the `L2s` reason this ruling retires. **Third run: 10 of the
     11 ids are measured or `derived` — ids 4-10 all carry finite `ms` + `source:"hook"`
     (`render.dom` 59.8/74.0, `render.ssr` 76.1/1742.5 GPU-OFF; `hook.refused:[]`,
     `hook.rendererArmed:true`, `hook.dropped:0`, `stageRowsSource` = the real module).
     ITEM 4 IS **ACCEPTED-STRUCTURAL** PER DEC-1, NOT OPEN: `snapshot.clone`
     stays `structural:true` (RUL-3) and `post.style` stays `derived` — recorded in the
     decision row `O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED` (`docs/decisions.md`) and here —
     see §12.13**;
  5. **stage-id-set determinism** across the repeat runs (`o0_repeat_determinism` →
     `setEqual:true`; the `ms` values stay FREE under the seed, §5 P-SM-2); **CLOSED
     (third run: `setEqual:true`, `msFree:true`, 11 ids, in BOTH legs)**;
  6. the census gate at operator size (`corpus.documents === 226`, or the
     `--o0-corpus=<n>` value) with `driver.build.verified:true` — otherwise the run is
     a documented fail-state (§6 F2/F8), never a provisional pass. **The SIZE is the gate;
     the bytes/nodes/edges are recorded provenance (RUL-5/L10)** — a third run reaching 226
     docs by any recorded source satisfies this item, and no cross-run node/edge comparison
     may be treated as a claim. **CLOSED (third run: `corpus.documents` 226 = the claimed
     226 in BOTH legs, `corpus.gate:"documents"`, no census mismatch reason; the nodes/edges
     read 6 102 / 9 266 and are recorded provenance)**;
  7. **a non-null, settled `snapshot.pull` ms for BOTH gestures** — the CALLER-level seam of
     §3.6b in its **RUL-2 async shape** (`await … record(…, async () => …)`, so the `ms`
     covers the round trip and not the promise creation; `hook.stageRowsSource` = the real
     module, no mirror; the row's `hook.stageRecords[]` attributes each record to its
     instance) — so the A-4 discriminator is a **measured** number and **measured** ms, and
     not a "not measured" 0 and not the synchronous-call artifact `L5` found (0.0-0.2 ms).
     Every stage that remains `unseparated` carries `structural:true` + a non-empty
     `structuralReason` (§6 S14/S15) **only where a seam genuinely cannot exist** — the
     RUL-1/RUL-3 set (`snapshot.clone` while the transport gap stands; nothing else) — and
     `post.style` carries `derived`, never `structural` (§4.3). **CLOSED IN FULL (third run:
     `snapshot.pull` = 85.9 ms folder / 179.2 ms document GPU-OFF, 83.6 / 172.2 GPU-ON —
     the SETTLED round trip, so the run-2 112-126 ms residual collapsed into it;
     the A-4 read COUNT is 1 folder / 2 document; and the only `unseparated` ids are
     `snapshot.clone` (`structural:true` + the RUL-3 reason) and `post.style` (`derived`) —
     the RUL-1/RUL-3 set exactly, nothing more)**; and
  8. **the window bound holds** — no stage `ms` exceeds `longTaskTotalMs + <the band the row
     RECORDS>`, and no row's verdict contains a percentage above 100 or a negative residual
     (§5 P-TP-3, §6 F13a). The band is read from the row's recorded `hook.toleranceMs`
     (default 40 ms) by the oracle, `deriveO0StageVerdict` and the validator alike
     (§3.2.1/§4.3, §12.11) — never a constant in one consumer while another honours the
     field. The 2026-09-17 run violated the bound on `traversal.build` (1868.7 ms inside a
     110 ms window, printed as `1698.82%`, §12 H3); **the 2026-09-20 run PASSED it on all six
     rows** (largest overshoot Δt0 **0.8 ms**, `violated:false` everywhere, §12.12), and this
     item is therefore **CLOSED by the second run** — the third run must not regress it.
     **Third run: NOT REGRESSED — `violated:false` on all six rows, largest overshoot
     `armWindow.t0 − freezeWindow.t0` = 0.8 ms and largest shortfall 0.6 ms against the
     recorded 40 ms band, zero `null %` strings and no pct > 100 in either leg (the two
     zero-window ablation rows print the RUL-5/L8 "no percentage is computed: the long-task
     window is zero (0 ms)" form instead), §12.13**;
  9. **the report's own STATUS is one of the three legal values, DERIVED and consistent**
     (RUL-4): `status:"OK"` ⇔ `pass:true`; `status:"OPEN-structural"` ⇔ a `pass:false` whose
     every reason is in the structural family + a `reconciliation.note` + the report-level
     `O-0 REPORT OPEN …` verdict; `status:"FAIL"` otherwise (§4.2/§4.4, §6 F18). A report
     that is schema-**rejected** for structural-only content (`selfValidation.ok:false` with
     structural errors) fails this item — that is the second run's `ok:false` (24/12) and the
     defect RUL-4 closes. **CLOSED (third run: `status:"OPEN-structural"` in BOTH legs with
     `selfValidation.ok:true`, `errors:[]` (0), `gatingReasons:[]`, `structuralErrors:0` /
     `structuralFacts:4` GPU-OFF and `structuralFacts:2` GPU-ON, and the `reconciliation.note`
     + the report-level `O-0 REPORT OPEN …` verdict emitted verbatim — §12.13)**; and
  10. **the provenance/pin discipline of RUL-5 holds in the report's prose**: no `null%`
     string (§4.4), `post.style` labeled `derived` wherever it appears, the GPU delta reported
     per run/corpus and never carried across runs (§6 S20/F20), the corpus size presented as
     the gate with bytes/nodes/edges as provenance, and `env.engine` derived from a positive
     signal (§6 S21/F22). **CLOSED (third run: the GPU Δ is reported for THIS run only —
     −42 ms folder / +9 ms document, with the earlier runs' deltas labelled provenance
     and never carried; the two zero-window ablation rows print the no-percentage form; no
     `null %` string exists in either leg; `post.style` is `derived` in every row, table and
     verdict; the corpus row carries `gate:"documents"` + `provenanceOnly`; `env.engine` is
     `"absent"` WITH the recorded `fetch failed` evidence string and `driver.engineError:null`
     — §12.13)**.
  Only then may `docs/specs/unit-o-0-per-stage-breakdown.md` be committed as **CURRENT**
  and the delegation gate for O-5 open (see the last bullet). A run at
  `status:"OPEN-structural"` is an **honest measurement**: committed, recorded, and — under
  the AMENDED §3.6b RUL-4 clause 7 (DEC-1) — **ACCEPTED (hence O-0 DONE, gate open) when its
  only gap is the accepted structural set, and OPEN (gate closed) otherwise**.
  **The third run is the ACCEPTED case, and the user accepted it on 2026-09-20 (DEC-1,
  `O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`), so the gate is OPEN at this pass: O-5 is
  UNBLOCKED.** Building the `snapshot.clone` seam (a main-side transport channel carrying the
  main recorder's records — its own unit, its own gate) stays available as a separate unit and
  is NOT owed to open the gate; until it exists every report must stay
  `status:"OPEN-structural"` and the residual stays recorded as uncomputable (§11's
  CURRENT-state bullet, §12.13).
- **The validator-recompute fix is LANDED and the pin level moved (2026-09-21).** `O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` — the third run's filed HOST row — is **FIXED**: `validateO0Report` (`src/shared/o0-report.ts`) runs its three post-derivation `err()` blocks (F20 carried cross-run GPU delta, the corpus-gate provenance clause, F21 vacuous-half) **AHEAD** of the family/gating/status split, takes the split from the FINAL `failReasons` (`family` = the recorded structural + derived-residual sets; `gating` = every reason outside the family), records the four verdict-consistency clauses in **BOTH** `errors[]` and the returned `failReasons[]` (via `errVerdict`, never feeding the split they are derived from), and reads **`ok` after every reason is minted** (`ok: errors.length === 0 && gating.length === 0`) — so a non-empty `errors[]` can never read `ok:true` again. The missing-`reconciliation.note` clause is a **genuine forcing reason** (it derives `FAIL`). **The F18 pins therefore move from the `errors[]` level to the `pass:false`/`failReasons[]` level** (`PD1`..`PD5` + `PD5b` in `tests/unit-o-0-report-contract.test.ts`; red 8 → green 50/50, O-0 114/114). The driver's ordering residual (`report.driver.openStructural` read before the self-validation `derived.gating.push`) is fixed in `scripts/live-drive.mjs` (§7 §3a finding 5, resolved as an invariant pin + that one residual). **The FOURTH live run (2026-09-21, §12.14) re-executed the harness on the fixed module: both legs `status:"OPEN-structural"`/`pass:false`/`selfValidation.ok:true`/`errors:[]`/`gatingReasons:[]` with `failReasons` = the structural family only, NO newly surfaced reason, and the fix proven load-bearing by an OLD-vs-NEW differential on the executed artifact (pre-fix: `ok:true` with the reason stranded; fixed: `ok:false` with the reason in BOTH channels, `FAIL` where it gates) — while the unperturbed legs mask nothing (the defect's live exposure was LATENT).** The defect row is **FIXED (2026-09-21)** in `docs/defects.md`; the unit record is §12.14 and `archive/reviews/2026-09-21-unit-o0-validator-reason-drop-doc-review.md`.
- **Red→green history (recorded — RCA-1).** The harness landed through THREE red sets,
  in order:
  1. **TestWriter red 41 failing** — 26 pure-module rows
     (`tests/unit-o-0-report-contract.test.ts`) + 13 driver-contract rows
     (`tests/unit-o-0-driver-contract.test.ts`), **3 green-on-arrival by design** (the
     pure-module constants the driver already carried).
  2. **Implementer green 43/44.** The single remaining failure was **`P-SM-2`, and it
     was a TEST-generator bug — NOT a module defect**: the id-to-drop was re-drawn
     INSIDE the `filter` predicate (mulberry32 advances per call), so 4 of 18 seeded
     mode-2 draws dropped nothing and the row degenerated into mode 0. **One-pass
     remand:** the draw was hoisted ABOVE the `filter` in the `P-SM-2` row of
     `tests/unit-o-0-report-contract.test.ts`, the INVARIANT untouched, and 20/20 mode-2
     draws now drop exactly one id → **`P-SM-2` held**.
  3. **A NEW red set — 30 failing** for the §3.6 hook (the `src/shared/o0-hook.ts`
     module + the five wraps + the driver's stage→seam map) →
     **Implementer green 30/30** (`tests/unit-o-0-hook-contract.test.ts`).
  4. **A FOURTH red set (2026-09-21) — 8 failing for the post-derivation-reason fix**:
      `PD1`..`PD5` NEW (`tests/unit-o-0-report-contract.test.ts`) + `ST2`/`ST4`/`ST5`
      **MOVED** from the `errors[]` level to the final `failReasons[]`/`pass:false` level
      (the same rows, the forcing half added) → **Implementer green: the report-contract
      file 50/50, O-0's three suites 114/114, the full suite 217 / 4 913 / 58 / 0**, the
      register 8/8 `held`, typecheck 0, build 0. The fix's red set was RUN and reported
      before the implementation (RCA-1); the driver-contract `D24`/`D25`
      ordering-invariant pin lands with it. **This red set belongs to the DEFECT's own
      unit (§12.14), not to the measurement** — the measurement's own red set remains the
      property/pure-module register of §5.
  The measurement itself has no red set and this spec does not claim one (§5; RCA-1 does
  not apply to a measurement — `gnosis-offload-review.md:84`).
- **The trio (run by the Implementer after the green — `AGENTS.md` item 4):**
  **`npm test` = 214 files passed, 4 820 pass / 0 fail / 58 skipped (4 878)**;
  **`npm run typecheck` = 0**; **`npm run build` = clean** — renderer ≈ **659.9 kb**,
  `__o0recorder` present **once** in `dist/renderer/renderer.js` and **absent** from
  `dist/main/main.cjs` (the handle is renderer-only — §3.6). **A schema-green/node-green
  is ENVELOPE-green, NOT app-green (RCA-12): the trio proves the harness's contract, not
  one measured number.**
  **CAVEAT (DEC-2, 2026-09-20 — the DONE row must be read with this): the trio above is the
  HISTORICAL reading from the harness's own green. At the third run the same three legs read
  `npm run typecheck` 0 / `npm run build` clean (bundle 678 270 B renderer / 2 419 392 B main,
  both verified against disk) but `npm test` = **25 failed / 4 820 pass / 58 skip (8 failed
  files of 214)** — **all 25 failures are the pre-existing NON-O-0 toolchain regression**
  `SUITE-RED-AFTER-VITEST5-ELECTRON44` (vitest 2→5 / electron 33→44 / esbuild 0.24→0.28,
  commit `98ea185`), while O-0's own three suites read **106/106**. The repo-wide trio's
  `npm test` leg was therefore RED and O-0 was NOT reported on a green-trio claim; the vitest-5
  migration unit was SCHEDULED as the user's **DEC-2** (`docs/pending.md` SCHEDULED row,
  item (1) of the next queue in `docs/next-steps.md`). **UPDATE 2026-09-21: the blocker was
  CLOSED — DEC-2's unit and its Class-C sibling both LANDED; the final trio reads
  `npm test` = 217 files passed (217) / 4 905 passed / 58 skipped / 0 failed (4 963 total),
  exit 0, with typecheck 0 and build 0 (5 bundles). The 25/4 820/58 and 4 819/22 readings
  above stay HISTORICAL provenance. That 4 905 / 106/106 reading was the PRE-fix tree —
  **the CURRENT reading is 217 files passed (217) / 4 913 passed / 58 skipped / 0 failed (4 971
  total), exit 0, with O-0's three suites at 114/114** (§12.14 (6)).**
- **Post-trio drift observed DURING the doc pass, now RESOLVED INTO THE RECORD.** While this
  spec was being reconciled against the build, the tree moved under it: (a) the driver grew
  **3 764 → 3 789 → 3 849 lines** (the `--display` colon normalization of §6 F12 plus the
  O-0 arm/emit lines and the live pass's own H4/H5/H6 fixes) — which is why §8.2 declares the
  driver's line anchors owed a post-freeze re-pin; and (b) `tests/unit-o-0-report-contract.test.ts`
  gained an ADDITIVE **§3a adversarial-regression set `R1`..`R4`** (30 rows total) while
  `tests/unit-o-0-hook-contract.test.ts` gained **`B9`** (31 total). **R1 is WITHDRAWN (R-1,
  §7 row 1) and `R2`/`R3`/`R4`/`B9` stand RED**, against the module/handle as they are today
  (`src/shared/o0-report.ts` — `compareO0StageIdSets` `:457`, `reconcileO0PostStyle` `:531`,
  `unseparatedStageIds` `:143`; `src/renderer/runtime.ts` `:80-90`, the handle at `:83`,
  installed by `installO0RecorderHandle()`).
  The previous edition's "`R1`..`R4` are a NEW RED set" framing is superseded by §7's table
  (which records each finding's disposition) and by §12 (the live-run record).
- **The red set is the property/pure-module red set** (§5), run and reported BEFORE
  the validator/harness implementation — that is O-0's TDD surface
  (`gnosis-offload-review.md:117-120` names exactly this precedent for O-5;
  O-0's is the report schema + reconciliation).
- **The P-TP-3 band-channel remand (recorded in this cycle — NOT a green claim).** The
  TestWriter's remand landed the **test-side** half: the drawn band is a **recorded row
  field** (`hook.toleranceMs`, the generator writes `tol ∈ {0, 40}` per row) instead of a
  hidden **free-text** channel, so `deriveO0WindowBound(run)` with no options, the oracle's
  explicit `{hookToleranceMs}` argument and `deriveO0StageVerdict(row)` are pinned to ONE
  band (§3.2.1/§4.3/§5 `P-TP-3`; `tests/unit-o-0-report-contract.test.ts`'s `P-TP-3` row
  plus the §W `W1`–`W3` pins). **NO validator band fix is owed any more — it LANDED**:
  the validator (`src/shared/o0-report.ts` `validateO0Run`) now calls
  `deriveO0WindowBound(run)` with **no options** at `:329-332` and the band default constant
  is `O0_WINDOW_TOLERANCE_MS = 40` at `:68`, so the validator, `deriveO0WindowBound` and
  `deriveO0StageVerdict` read ONE band (the row's recorded `hook.toleranceMs`). The
  **driver-side half** stands as a pin, not as owed work: the driver's row assembly already
  emits `hook.toleranceMs` (`scripts/live-drive.mjs:1140`, at the band constant
  `O0_HOOK_LONGTASK_TOLERANCE_MS`, `:518`), and every read stays on the recorded field for
  every row path. §8.1's trio row carries the **run-3 reading (106/106 green)**; **no green is
  claimed here for the doc pass** (§12.11).
- **The adversarial pass (RCA-3) is RECORDED** — §7's table holds 13 findings (1 rejected,
  4 MUST-FIX, 5 SHOULD, 3 TEST remands) with sites verified against the tree. **The doc-review
  (RCA-6) RAN — record `archive/reviews/2026-09-20-unit-o-0-doc-review.md`** — reconciling this
  spec's census claims, the
  stage ids, the block names, the driver's line anchors and the artifact's actual numbers
  against the build (§8.2's re-pinned anchors are its output).
- **Doc-review record path convention:** `archive/reviews/<date>-unit-o-0-doc-review.md`
  (the AGENTS.md item 10d / RCA-6 convention) — **the O-0 record is
  `archive/reviews/2026-09-20-unit-o-0-doc-review.md`** (hyphens, the tree's convention). It ran
  after the FIXED live re-run (the third run) and reconciled
  this spec's census claims, the stage ids, the block names, the driver's line anchors and
  the artifact's actual numbers against the build.
- **Evidence for the gate:** (a) this spec file; (b) the harness blocks in
  `scripts/live-drive.mjs`; (c) the committed artifact with the run command + the
  bundle identity; (d) the trio output; (e) the doc-review record. **An O-0 accepted
  without (c) does not open the delegation gate for any unit** (§Status).

---

## 12. THE LIVE-RUN RECORD (first run, 2026-09-17) — artifact status

**STATUS (run-1/run-2 history — SUPERSEDED by the THIRD run; §12.13 is the run-3 record and
governs the artifact's CURRENT status).** At the run-2 edit the artifact
`docs/specs/unit-o-0-per-stage-breakdown.md` carried the **SECOND live run (host clock
2026-09-20; the JSON stamps UTC 2026-09-21)** and was **SUPERSEDED-PENDING-FIX again**: the
second run **superseded** the first run's record and **supersedes nothing in this spec** — its
numbers were then the current measured values (the first run's numbers appear in §12 below only as
provenance, and its GPU delta is **contradicted**, §7 `L9`/§6 S20). **The unit O-0 is OPEN, not
DONE** *(SUPERSEDED — DEC-1 2026-09-20: the third run ran, and the accepted form of its report
makes O-0 DONE and unblocks O-5; see §12.13 (8) and §11)*. A third live run on the bundle fixed for **RUL-1..RUL-6** was MANDATORY before the
delegation gate for O-5 may open, and the `status` it had to reach was `"OK"` (§3.6b RUL-4 clause
7) — `"OPEN-structural"` is honest but still keeps the gate closed *(SUPERSEDED — DEC-1: the
third run reached `"OPEN-structural"` with the accepted structural set only, and the AMENDED
clause 7 opens the gate on exactly that form)*. **The THIRD run then ran: it is §12.13's record,
the artifact is CURRENT per §12.13, and the two run-2 statements above are retained only as
history.** Where the artifact and this
spec disagree, **this spec governs the contract** and the artifact governs the **measurement**;
§7 §3c is the table of the places the two disagree (`L1`..`L12`, each with its ruling). The artifact below is the
**first** live evidence in this repo for the O-0 stage question; it is recorded in full
because its *numbers* are load-bearing (they are the only measured values the downstream
units have) and its *gaps* are the next cycle's work list. Where the artifact and this
spec disagree, **this spec governs** (the artifact was written against the pre-re-derivation
text; §7 and §12 are the record of why).

### 12.1 The run (environment, commands, mode)

- **Layer:** `assembled-renderer` (RCA-12) — the executing `dist/` bundle driven by real
  hit-tested CDP gestures against a real Electron renderer. **Not** a node run.
- **Display:** `:0` (Xwayland on KWin/Wayland); `DISPLAY=:0` propagated to the spawn.
- **Run mode: `runMode:"spawn"`** on BOTH legs — **not** `--connect`: the operator store
  (`/tmp/astrographer-demo-store`, 226 docs) was **gone with `/tmp`**, and `--connect`
  requires an already-running operator app (§12 H7).
- **Working dir:** the repo root. No app was already running (`:3787` and `:9222` both free).

```bash
# 0) rebuild the EXECUTING bundle FIRST (docs/live-testing.md:119-124)
npm run build

# 1) GPU-OFF leg (the sanctioned launch path: --no-gpu when --gpu is absent)
node scripts/live-drive.mjs --display=:0 --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism

# 2) GPU-ON leg (app (re)started WITHOUT --no-gpu; --gpu records the leg identity)
node scripts/live-drive.mjs --display=:0 --gpu --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0-gpuon.json --block=o0_gpu_control
```

**Bundle identity: `driver.build.verified: true` in BOTH legs** (§3.6/F2 closed) —
renderer `1789680723588+675765+10d4bd9b`, main `1789680723530+2395838+366b2663`, served
`675765+10d4bd9b` from `file:///…/dist/renderer/renderer.js`. `tolerance.reconcileMs = 50`
(measured 2026-09-17); hook band **40 ms**.

### 12.2 Corpus census reached (§3.4)

| field | pinned | observed (both legs) | source recorded |
| --- | --- | --- | --- |
| documents | **226** | **226** | `--o0-corpus` (driver-seeded; source 2 of §3.4) |
| nodes | — | **10 170** | (the trigger-(b) node-ceiling input, §10.2) |
| edges | — | **18 758** | — |

Read twice, independently (`rag.list_documents` = 226; the snapshot payload's own
lengths = 10 170 / 18 758). An earlier attempt at **228** documents (226 + the driver's two
synthetic seed files) was correctly rejected by the `--o0-corpus=226` census gate (F8) and
is recorded rather than softened.

### 12.3 Per-stage table (ms; `unsep` = `unseparated:true`, `ms:null`, never imputed)

GPU-OFF leg (4 runs) / GPU-ON leg (2 runs), same corpus, same gestures:

| stage id | folder-gpuoff | doc-gpuoff | ablation-off | ablation-on | folder-gpuon | doc-gpuon |
| --- | --- | --- | --- | --- | --- | --- |
| `snapshot.pull` | unsep (mark) | unsep | unsep | unsep | unsep | unsep |
| `snapshot.clone` | unsep (mark) | unsep | unsep | unsep | unsep | unsep |
| `docheads.pull` | unsep (mark) | unsep | unsep | unsep | unsep | unsep |
| `traversal.build` | **1868.7** | 14.1 | 16.7 | 14.1 | **1766.5** | 32.7 |
| `envelope.assemble` | 0.6 | 0.2 | 0.2 | 0.2 | 0.7 | 0.4 |
| `shared.decorate` | 23.9 | 1.0 | 1.4 | 0.7 | 23.3 | 2.3 |
| `reconcile.roots` | 21.8 | 1.3 | 0.1 | 0.1 | 20.7 | 1.4 |
| `reconcile.apply` | 242.8 | **2387.3** | 5.5 | 1.4 | 241.6 | **2358.5** |
| `render.dom` | unsep (mark) | unsep | unsep | unsep | unsep | unsep |
| `render.ssr` | unsep (mark) | unsep | unsep | unsep | unsep | unsep |
| `post.style` | unsep (derived) | unsep | unsep | unsep | unsep | unsep |

**Stages 4-8 were hook-measured in EVERY run** (`hook.rendererArmed:true`, `hook.refused:[]`,
`hook.records:5`, `hook.stageRowsSource` = the real module — no mirror fallback).
**Six stages were `unseparated` in every run**: 1/2/3 (the H2 seam defect), 9/10 (never
instrumented) and 11 (`post.style`, by construction — its residual exists only when the
reconciliation succeeds, which no run could satisfy). **The second run fixed 1/3 (the caller
seams) and left 2/9/10/11 — RUL-1 then instruments 9/10, RUL-3 keeps 2 structural with the
corrected reason, and 11 stays `derived` (§12.12).**

### 12.4 Long tasks + mutations

| run | long tasks (ms) | total | DOM mutations | wall (gesture → first responsive rAF) |
| --- | --- | --- | --- | --- |
| `o0-folder-row-gpuoff-r1` | `110` | **110** | 37 | 211.4 ms |
| `o0-document-row-gpuoff-r1` | `192` | **192** | 18 058 | 288.8 ms |
| `o0-fold-ablation-off` | (none) | **0** | 222 | 124.4 ms |
| `o0-fold-ablation-on` | (none) | **0** | 0 | 112.3 ms |
| `o0-folder-row-gpuon-r1` | `107, 2176` | **2283** | 37 | 4198.6 ms |
| `o0-document-row-gpuon-r1` | `192, 2419` | **2611** | 18 058 | 4295.5 ms |

Quiesce was rAF-based with a **recorded** bound (`timeoutMs 4000`, `quiesced:true`,
`frames:3`) — never an unrecorded sleep.

### 12.5 Controls

- **GPU-OFF vs GPU-ON (the A14 gap, previously unmeasured):** folder-row **110 → 2283 ms
  (Δ +2173)**; document-row **192 → 2611 ms (Δ +2419)** — with **identical JS work**
  (mutations 37/18 058 in both legs; hook stages within a few ms: `traversal.build`
  1868.7 vs 1766.5, `reconcile.apply` 242.8 vs 241.6). The entire delta is **non-JS**. The
  gesture wall time moved 211.4 → 4198.6 ms. Pairing recorded `cross-artifact` (one artifact
  per leg, §3.5); the app-side flag is recorded per leg.
- **The 12 698.7 px track `display:block` ablation:** `applied:true` on the ablated run,
  `reverted:true`, exact mutation recorded (`#zone:main (the stage grid cell of #wiki-root):
  display:block …`); Δ long-task total **0 ms** (both freezes below the 50 ms threshold),
  Δ mutations **−222**. The stage cell **is** a grid item in the executing bundle
  (`#wiki-root` computed `display:grid`) → the ablation is **available** (§6 F5 did not fire).
- **Repeat determinism + hook inertness (`o0_repeat_determinism`, GPU-OFF leg):** the same
  folder-row freeze staged twice, unarmed vs armed → Δmutations **0**, |ΔlongTaskTotalMs|
  **0 ms** (band 40), stage-id SET **equal** (11 ids), `ms` free → **inert = true**
  (§5 P-HK-1's live half closed). **Caveat (finding 12):** the GPU-ON leg ran
  `--block=o0_gpu_control` **alone**, so its report carries **no** inertness comparison
  while both its runs were armed — legal under the old text, `pass:false` under §6 S17/F17.

### 12.6 Derived verdicts (verbatim) and the honest FAIL

The harness emitted, per row, the pinned formula and the A-4 discriminator. Two representative
strings (GPU-ON leg):

- `stage traversal.build is 1766.5 ms of the 2283 ms long task (77.38%) on folder-row — traversal.build is the largest identified stage`
- `stage reconcile.apply is 2358.5 ms of the 2611 ms long task (90.33%) on document-row — reconcile.apply is the largest identified stage`
- `the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)` ← **a "not measured" 0, NOT a measured zero** (§12 H2; the re-derived contract refuses this string when the seam is unseparated)
- `stage traversal.build is 1868.7 ms of the 110 ms long task (1698.82%) on folder-row …` ← **the H3 window-bound violation** (§12 H3; the re-derived contract refuses the percentage form)

**Verdict per leg: `pass: false`, both legs.** Forcing reason (one class, both legs): the six
unseparated stages cannot be reconciled —
`run <id>: unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled (§5 P-TP-1/§6 F4)`,
plus `run <id>: unseparated stages [...]` per row. **No row was imputed and no number was
softened.** The measurement is a complete FAIL, honestly reported; it satisfies §11's gate
items 1, 2, 5 and 6 and fails items 3 (partially — the GPU-ON leg), 4 (partially — 5 of 5
hook stages measured), 7 (the A-4 seam) and 8 (the window bound).

### 12.7 The O-0 questions, answered with the numbers

- **(a) The whole-store `IPC_RAG_SNAPSHOT` pull + serialization: NOT MEASURED.** Stages 1-3
  were `unseparated` (§12 H2). The A-4 read count in the artifact is `0` **by
  non-measurement**, and the claim "a folder disclosure still performs a whole-store read"
  is neither confirmed nor refuted by this surface (the code path is unchanged:
  `src/renderer/sidebar-panes.ts`'s re-derive body still calls `bridge.rag.snapshot()`
  unconditionally). **The A-4 read count is NOT yet observed** — it is the next cycle's
  first target (§3.6b).
- **(b) Derivation/assemble/decorate/reconcile vs DOM/SSR emit vs style/layout/paint:**
  GPU-ON folder-row — the separable JS path (`traversal.build` 1766.5 +
  `envelope.assemble` 0.7 + `shared.decorate` 23.3 + `reconcile.roots` 20.7 +
  `reconcile.apply` 241.6) = **2052.8 ms of a 2283 ms window**; residual (unseparated
  `render.dom`+`render.ssr`+`post.style`) ≈ **230.2 ms**. GPU-ON document-row —
  **2395.3 ms of 2611 ms**, dominated by `reconcile.apply` 2358.5. **The DOM/SSR-emit vs
  style/layout/paint split is NOT separable** (`render.dom`/`render.ssr`/`post.style` all
  unseparated).
- **(c) GPU-off vs GPU-on delta:** **+2173 ms** (folder-row) / **+2419 ms** (document-row),
  identical JS (§12.5).
- **(d) The `display:block` ablation delta:** long-task **Δ 0 ms**, mutations **Δ −222**,
  wall 124.4 → 112.3 ms (§12.5).
- **(e) Is the derivation WALK load-bearing (O-4's trigger (c))?** **In this corpus: YES for
  the folder-row disclosure, NO for the document open.** folder-row `traversal.build`
  **1766.5 ms of 2283 ms (77.4%)** is the largest identified stage (and 1868.7 ms under
  GPU-OFF, where the window is only 110 ms — subject to H3's caveat); document-row
  `traversal.build` is **32.7 ms of 2611 ms (1.3%)** while `reconcile.apply` dominates at
  **2358.5 ms (90.3%)**. **Trigger (c) therefore fires for the disclosure path and not for
  the document-open path** — which is exactly what O-4's re-decision (§10 item 4) needs, and
  the re-run must confirm it under the window-bound rule before it is treated as final.

### 12.8 The harness fixes landed BY the live pass (recorded as history; not re-opened)

- **H1 — `--display` normalization.** The parser stored the flag value verbatim while the
  spawn prefixed `:`, so `--display=:0` reached Electron as `DISPLAY=::0` →
  `ozone_platform_x11.cc:245 Missing X server or $DISPLAY` — an F6 symptom for a **harness**
  reason. Fixed: a leading `:` is stripped (`:0` and `0` both normalize to `:0`). Recorded
  as §6 F12. **Without this fix no O-0 leg could start on this host.**
- **H4 — the served-vs-disk comparison.** `o0BundleIdentity` compared decoded
  `text.length` (UTF-16 units) against the on-disk **byte** count; the 660 kB renderer holds
  ~1.2 kB of multi-byte characters, so a byte-identical bundle reported `verified:false`
  (F2) for a harness reason. Fixed to `Buffer.byteLength(text,'utf8')` (hash unchanged), and
  `Page.enable` is now issued once at connect (without it `Page.getResourceContent` fails
  `Agent is not enabled`). `verified` is true in both legs.
- **H5 — the ablation selector.** `document.querySelector('#zone:main')` is an **invalid
  selector** (an unquoted id cannot carry `:`) → `SyntaxError` → the whole `o0_track_ablation`
  block FAILED. Fixed to `getElementById` (the recorded selector string is unchanged).
- **H6 — `[data-folder-path=…]` escaping.** Naive interpolation produced an invalid selector
  for a rendered path containing a quote (the importer renders such a path as
  `["archive"]`) and killed every O-0 block. Fixed by a CSS-attribute escaping helper; the
  recorded `folderPath` for this run (`["archive"]`) exercises it live.

### 12.9 The environment caveats (findings, NOT softened)

- **H7 — the corpus SOURCE was unreachable; the SIZE was reconstructed.** §3.4's pinned
  source (a persisted operator store reached via `--connect`) was destroyed with `/tmp`.
  The pinned **size** (226) was reached by spawning the app with a **seeded corpus** plus an
  operator registry file, via three default-safe flags (`--corpus-root=<dir>`,
  `--strict-seed`, `--seed=<dir>`). The census is the pinned one; the **document bytes are
  synthetic** (≈1.1 MB total), so the absolute ms values are corpus-representative in
  **structure, not in byte size**. **This is why §3.4 now pins the SIZE and records the
  SOURCE as a variable** (§3.4's re-derivation).
- **H8 — the GPU-OFF numbers are NOT the operator's numbers; the O-5 budget must be pinned
  PER LEG.** The GPU-OFF long tasks (110 / 192 ms) are far below the motivating live evidence
  (505 ms / two 439 ms tasks — `docs/defects.md:26`), while the **identical gesture** under
  GPU-ON reproduces that order (2283 / 2611 ms). The GPU-OFF leg ran `--disable-gpu` on a
  headless Xwayland session, where paint/composite work does not land on the renderer main
  thread as a long task. **Both legs are recorded, neither is preferred** (§2.4/S6), and the
  §12.5 deltas are the honest statement of what the flag changes. **Implication for O-5:**
  its budget row must be pinned **per GPU leg** (a single number would be violated by one leg
  and trivially met by the other) — recorded here as O-5's input, not as an O-0 decision.
- **H9 — the folder-row pick did not exercise its own rule (§2.3 caveat).** The recorded
  `folderRowCensus` on this corpus enumerated **three** top-level rows (`["archive"]`,
  `["docs"]`, `["notes"]`), each with `childRowCount: 0`, so the pinned lexicographic
  tie-break chose `["archive"]` and the "largest child-row count" rule was **not** exercised.
  The chosen row is a real hit-tested row (`path:'cdp'`), so the gesture evidence stands; the
  artifact's framing of the pick is what is overstated.

### 12.10 The NOTE the measurement forces on the parked-track framing (`ARCH-GNOSIS-OFFLOAD`)

**`docs/decisions.md` and `docs/pending.md` are deliberately NOT edited by this pass** (the
second run's record reaches the SAME conclusion — see the ruling below). The
ACTIVE row `DECIDED: ARCH-GNOSIS-OFFLOAD` (`docs/decisions.md:24`) and the proposal/critique
prose that frames the problem as **"the measured dominant cost is DOM style/layout/paint"**
(the critique's `29 ms of ≈517 ms` JS self-time argument) are **not contradicted outright but
are no longer the whole picture**: this run's separable JS work is **77.4%** of the
folder-row window (`traversal.build` 1766.5 ms / 2283 ms) and **90.3%** of the document-row
window (`reconcile.apply` 2358.5 ms / 2611 ms) — measured at the **assembled-renderer** layer,
which the earlier `Profiler` self-time numbers (13 + 8 + 8 ms) never covered (they measure
`translateNodeData`/`renderTree`/`enumPathWalks` self-time, not the freeze). **What is NOT
established:** the DOM/SSR-emit vs style/layout/paint split is **unmeasurable with this
harness** (§12.3), and the GPU-OFF leg's 110/192 ms windows do not reproduce the motivating
freeze at all (H8). So the honest statement is: **the assertion "the dominant cost is
style/layout/paint" is UNVERIFIED by O-0's first run, and the measured separable JS
derivation/reconcile path dominates the windows this run produced.** The **trigger decision**
is O-0's downstream output (§10) and the **engine track stays PARKED** (`docs/pending.md`'s
named external triggers, unchanged): this NOTE records a measurement, not a re-opening. It is
repeated in `docs/next-steps.md`'s O-0 entry so the next reader cannot miss it.

**THE SECOND RUN'S RE-RULING ON `docs/decisions.md` — the row STAYS UNTOUCHED, and that choice
is recorded here (the "which did you choose" answer).** The second run's numbers are **material**
for the parked track's framing — the derivation walk IS load-bearing for the disclosure
(`traversal.build` **694.5 ms of 997 ms = 69.66 %** GPU-OFF / **675.9 of 961 = 70.33 %** GPU-ON,
the largest identified stage in both legs) while the document open is dominated by
`reconcile.apply` (**2051.5 of 2180 = 94.11 %** / **2031.2 of 2157 = 94.17 %**) — which is
strictly stronger than the first run's reading (the window bound now passes, so the shares are
computed over a legal window). **It still adds NO decision row, for the §9 reason plus one
more:** (a) nothing in those numbers **pins behavior or scope** — the existing ACTIVE row
`DECIDED: ARCH-GNOSIS-OFFLOAD` (`docs/decisions.md:24`) already pins O-0 as the hard
precondition and the landing order, and the two facts this unit adds (the report-shape contract
and "no unit delegates before the artifact exists") are the re-scope of that same row; (b) the
numbers are a **measurement of a precondition's incompleteness**, not a ruling — one stage is
still structural (`snapshot.clone`), and
`post.style` is a derived residual, so a decision row built on them would pin a **moving**
number. *(The run-2 "the round trip's ms is not yet separated (RUL-2)" half is **CLOSED by the
THIRD run**: the awaited span now measures **85.9 / 179.2 ms**, §12.13 (2).)* **The numbers feed the O-4 / O-1 trigger evaluation, which IS O-0's downstream output
(§10 items 1/4/5)** — trigger (c) stays CANDIDATE (not fired) for the disclosure, trigger
(b)'s node-ceiling input reads from the same run's corpus row, and O-1's amendment gains the
**refuted** cheap variant (1 read folder / 2 reads document). **`docs/decisions.md` is
therefore NOT edited by this pass either** — the same zero-row ruling as §9, restated with this
run's numbers so a later reader can see it was re-decided rather than inherited.

### 12.11 The band-channel defect found DURING this cycle, and its resolution

**Defect (found by the TestWriter's remand on §5 `P-TP-3`): the window-bound band had no
recorded field, and the three consumers read it differently.** §5 `P-TP-3(a)` and §4.3 named
the band ("the recorded band, 40 ms"; the oracle param `hookToleranceMs`) but pinned **no row
FIELD** for it, so:

- the test side had a **hidden free-text channel** — the band was recoverable only from a
  reason string, which is not a recorded fact; and
- the **validator used to hard-code the 40 ms constant** while the oracle honoured the recorded
  value (`src/shared/o0-report.ts` — the old call site at `:298` passed
  `{ hookToleranceMs: O0_WINDOW_TOLERANCE_MS }`
  into `deriveO0WindowBound`), so a row recorded at a **0 ms** band validated against **40 ms**
  — two consumers judging ONE row against TWO bands. **THIS IS FIXED (landed): the validator
  now calls `deriveO0WindowBound(run)` with NO options at `:329-332` and reads the row's
  recorded field.**

**Resolution (one recorded field, three agreeing consumers).** The band is the row's
**RECORDED** `hook.toleranceMs` — an **additive, optional** field on the run's `hook` block,
default **40 ms** when absent (§3.2.1/§4.3). `deriveO0WindowBound(run)` with **no options**
reads it; an explicit `{ hookToleranceMs }` argument overrides **for the oracle's own tests**
(the generator draws `tol ∈ {0, 40}` and **records what it drew**, so the argument and the row
agree); and the **oracle, `deriveO0StageVerdict` and the report validator all read that one
band**. The free-text channel is **deleted**: `failReasons` names the stage and the freeze, the
band is a field. The driver already records the field in its row assembly
(the `toleranceMs: O0_HOOK_LONGTASK_TOLERANCE_MS` emission in the `hook` block,
`scripts/live-drive.mjs:1140`, at the band constant `:518`, 40 ms)
and its verdict + inline rules already call `deriveO0WindowBound(row)` with no options — cited
**by symbol** (the inline window rule and the derived-status call; their numeric anchors are
unstable, §8.2's staleness note) — so the live recorded band is **real** rather than
constant-inferred.

**Status at this edit — SUPERSEDED by the landing (kept for provenance).** Test-side fix
**landed** (`tests/unit-o-0-report-contract.test.ts`'s `P-TP-3` row + the §W `W1`..`W3` pins
assert the row-recorded band reaches the no-options oracle, the verdict and the validator), and
the **validator fix at that time owed — `deriveO0WindowBound(run)` with no explicit tolerance —
HAS SINCE LANDED** (`src/shared/o0-report.ts:329-332`, inside the `o0WindowRecorded(run)` block
that once sat at `:300-303`). The **driver-side half** stands as a pin (§3.2.1: keep the
driver's reads on the recorded field for every row path and re-record the band on any row the
assembly bypasses) — its reads **are** on the recorded field, no re-record is outstanding.
**Nothing is owed here now.** This doc pass ran **no** test/typecheck/build: the counts quoted
in §8.1/§11 are the third run's recorded reading (**106/106 green**, with `npm test` red
repo-wide for a NON-O-0 reason), never a claim made by this pass.

**Status after the SECOND run (§12.12) → resolved by the THIRD run.** The second run's **live**
rows carry `hook.toleranceMs: 40` on **every** row
with the band written **once** (`O0_HOOK_LONGTASK_TOLERANCE_MS`, 40 ms) and the window bound
passing on all six rows — so the *recorded-field* channel is a live-observed fact, not a
constant-inferred one. **The validator fix named here as "the ONE remaining band item" HAS
LANDED** (`src/shared/o0-report.ts:329-332`), closing the P-TP-3 remand: the oracle,
`deriveO0StageVerdict` (which takes no tolerance argument — **§11 item 8**) and the validator
now read the row's recorded band. The third run (§12.13) executed on that bundle and passed the
window bound on all six rows.

### 12.12 THE SECOND LIVE RUN (2026-09-20) — the honest FAIL, its numbers, and the rulings it forced

**What ran.** The **second live run** on the **fixed** bundle (the seams re-derived from the
first run's H2/H3 findings: the caller-level round-trip wraps, the recorded band
`hook.toleranceMs`, the window-bound rule, the driver's self-validation). The artifact
`docs/specs/unit-o-0-per-stage-breakdown.md` **is this run's record** and its §1-§12 are the
verbatim evidence; this section is the spec's summary + disposition (the `L`-findings' rulings
are tabulated in **§7 §3c**).

**Command shape (spawn mode, `:0` — the operator store was again absent after `/tmp` was
cleared, so §3.4's source 2 was used; the pinned SIZE was reached):**

```bash
npm run build          # dist/renderer/renderer.js 676469 B; dist/main/main.cjs 2417736 B
# corpus: 226 *.md rebuilt deterministically (docs 200 + archive 20 + notes 6), seed o0-2026-09-17
node scripts/live-drive.mjs --display=:0 --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0b-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism
node scripts/live-drive.mjs --display=:0 --gpu --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0b-gpuon.json --block=o0_gpu_control,o0_repeat_determinism
```

**Bundle identity + census.** `driver.build.verified: true` in **both** legs (renderer
`1789951042772+676469+a3e09c6a` GPU-OFF / `1789951140264+676469+a3e09c6a` GPU-ON, main
`…+2417736+a6d687bc`; served `676469+a3e09c6a` = on-disk). Census **226 documents / 6 102 nodes
/ 9 266 edges** — the pinned **size** reached, the counts **recorded provenance**, **not** the
first run's 10 170 / 18 758 (`L10`/RUL-5). Pane frames **2** in every run; `env.mode: lexical`;
`hook.stageRowsSource` = the real module on every row (no mirror).

**The honest FAIL — what is still open (spec-side disposition).**
1. **4 of 11 stages `unseparated` per row:** `snapshot.clone` (no main-side transport — `L3s`),
   `render.dom`, `render.ssr` (`L2s`, "no seam exists at all") and `post.style` (the derived
   residual). **RUL-1 closes ids 9/10 by instrumenting the two emits; RUL-3 records why
   `snapshot.clone` stays structural; `post.style` stays `derived` by construction.**
2. **`snapshot.pull`/`docheads.pull` measured `0.0-0.2 ms`** — the sync-call-only seam (`L5`);
   the real IPC + clone cost sat in the **112-126 ms** residual. **RUL-2** pins the awaited
   span.
3. **`driver.selfValidation.ok:false` (24 GPU-OFF / 12 GPU-ON errors)** for **structural-only**
   content. **RUL-4** reclassifies it: the report is schema-valid and must be
   `status:"OPEN-structural"` (`ok:true`, empty `errors[]`), not schema-rejected.
4. **`env.engine:"ready"` on a host with no engine** (`L1`) → **RUL-5** (`'absent'` + evidence).
5. **`(null%)` on the two zero-window ablation rows** (`L8`) → **RUL-5** (no percentage without
   a finite window).
6. **The GPU delta `−36 / −23 ms` contradicts the first run's `+2173 / +2419 ms`** (`L9`) →
   **RUL-5** (per-run/per-corpus only; no cross-run carry).
7. **The corpus is not byte-reproducible** (`L10`) → **RUL-5** (size = gate; bytes/counts =
   provenance).
8. **The inertness pair's long-task half is vacuous** (`nonVacuous:false`) → **RUL-6**
   (mutation-half proof, stated as such).

**What the second run PROVED (the gate items it closed).**
- **Item 8 — the window bound HOLDS on all six rows.** Largest overshoot:
  `armWindow.t0 − freezeWindow.t0` = **0.8 ms** (GPU-OFF folder row: arm
  `{t0 8582.6, t1 9651.8}` vs freeze `{t0 8581.8, t1 9651.5}`), far inside the recorded
  **40 ms** band; `deriveO0WindowBound(…).violated === false` for all six. No `1698.82%` string:
  the largest stage is `traversal.build` **694.5 ms of the 997 ms** GPU-OFF folder window
  (**69.66 %**) and **675.9 ms of the 961 ms** GPU-ON folder window (70.33 %); `reconcile.apply`
  is **2051.5 ms of the 2180 ms** GPU-OFF document window (**94.11 %**) and **2031.2 ms of the
  2157 ms** GPU-ON document window (94.17 %). The intermediate-run violation (`t1` 71.6 ms past
  `o:t1`) was a harness artifact of the disarm timestamp (`L6`) and is the fix's verification
  record. **This item is CLOSED and must not regress.**
- **Item 7's COUNT — the A-4 read count is REAL: 1 folder-row read vs 2 document-row reads**
  (both legs), from `hook.stageRecordDetail` (`L4`). **A-4's cheapest variant — "a doc-nav
  disclosure that performs no store read at all" — is REFUTED for both gestures** (the
  disclosure pulls 6 102 nodes / 9 266 edges across IPC; the document open does it twice).
  The **ms** of that read at the THIRD run IS the round trip (**85.9 / 179.2 ms**, §12.13), so
  item 7's ms half is **CLOSED** (the run-2 "not yet the round trip" reading is superseded).
- **Items 1/2/5/6** — bundle verified, both gestures hit-tested `path:'cdp'` (the hit probe
  resolved inside a real `#pane-doc-nav [data-folder-path]` row and a real
  `[data-document-id]` row), stage-id **SET equal (11
  ids)** with `ms` free, census 226 reached.
- **Item 3** — `driver.hookInertness` is **non-empty in BOTH legs** (`inert:true`,
  `Δmutations 0`, `setEqual:true`, `toleranceMs 40`) — **as a mutation-half proof** (§6
  S17(b)/RUL-6): each freeze performed the disclosure (37 mutations each) with the collapse
  state reset in-page (`document rows 20 → 0`) before BOTH freezes, while the long-task half
  compares 0 to 0 (`nonVacuous:false`, recorded and not hidden). The controlled-pair fix (`L7`)
  is what makes this pair meaningful at all.
- **The ablation** (`display:block` on the 12 698.7 px track): available + applied + reverted
  with the exact mutation recorded, and **Δ long-task total 0 ms / Δ mutations 0** — on this
  corpus the disclosure freeze never crosses the 50 ms threshold, so the ablation is **not shown
  to be load-bearing at this scale** (the honest form: "no measurable effect here", never "no
  effect"); the first run's `Δmutations −222` was the disclosure state change (`L7`), not the
  ablation.
- **The A/B split (the O-0 questions, answered):** separable JS path = **88.1 %** of the GPU-ON
  folder window (`traversal.build` 675.9 + `envelope.assemble` 0.3 + `shared.decorate` 10.0 +
  `reconcile.roots` 15.2 + `reconcile.apply` 145.4 = 846.8 ms of 961) and **94.6 %** of the
  GPU-ON document window (`reconcile.apply` 2031.2 + `traversal.build` 6.1 + `shared.decorate`
  0.3 + `reconcile.roots` 2.3 + `envelope.assemble` 0.3 = 2040.2 ms of 2157), residual
  **114.0 / 116.6 ms**. **The emit-vs-style/layout split is still not separable** (RUL-1 gives
  the emit half real seams; `post.style` stays derived), and the residual is **not** cleanly
  style/layout/paint because the RUL-2 round trip was inside it. **The derivation WALK is
  load-bearing for the disclosure (`traversal.build` ≈ 70 %) and NOT for the document open
  (`reconcile.apply` ≈ 94 %)** — the second run's per-corpus reading of trigger (c), still
  **CANDIDATE** until the RUL-2/RUL-1 fixes separate the round trip and the emits.
- **The `--gpu` leg ran `o0_gpu_control` + `o0_repeat_determinism`** (the first run's vacuous
  arm — finding 12 — is fixed), and the GPU-ON run's app-side flag is recorded
  (`app spawned by this driver (gpu on)`, no `--disable-gpu`) with the pairing
  `cross-artifact` (one artifact per leg, §3.5).
- **Trio at the run (§11.1 of the artifact, recorded not claimed):** `npm run build` clean
  (the exact bytes both legs verified), `npm run typecheck` clean (exit 0), `npm test` =
  **7 failed files / 207 passed (214)**, **22 failed tests / 4 819 passed / 58 skipped (4 899)**
  — the **non-O-0 toolchain regression** (`SUITE-RED-AFTER-VITEST5-ELECTRON44`), with O-0's own
  three suites green (**95** tests: driver-contract 23, report-contract 37, hook-contract 35).
  **No O-0 test failed.** RCA-12 reminder: a trio green is envelope-green, not app-green — and
  this artifact's numbers come from the **app**.

**The rulings this record forces (all now normative above):** **RUL-1** §2.2/§3.6b (the closed
ten-id seam set + the two render emits instrumented), **RUL-2** §3.6/§5 `P-HK-1`/§6 F19 (the
awaited span, one shape, settlement + error semantics), **RUL-3** §2.2/§3.6b/§7 `L3s`
(`snapshot.clone` = the main handler share; the out-of-host IPC clone is structurally
unmeasurable; the stage stays `structural:true` with that exact reason), **RUL-4**
§3.6b/§4.2/§4.3/§4.4/§6 (the structural-vs-pass contract, `status`, the reconciliation note,
and the `ok`/`pass` split), **RUL-5** §3.4/§4.3/§4.4/§6 (`L1`/`L8`/`L9`/`L10`/`L12`), **RUL-6**
§6 S17(b)/F21 (the mutation-half proof).

**O-0 IS DONE (DEC-1, 2026-09-20).** The artifact is committed, honest and **structurally
incomplete only in the ACCEPTED sense** (`snapshot.clone` structural + the therefore-derived
`post.style`); the cycle **spec (this pass) → red re-pins → implementation of RUL-1..RUL-6 →
the THIRD live run on the fixed bundle → doc-review (RCA-6)** is COMPLETE through the doc-review
(RCA-6, `archive/reviews/2026-09-20-unit-o-0-doc-review.md` — hyphens, the tree's convention).
The AMENDED §3.6b clause 7 **opens the O-5 delegation gate on the accepted `OPEN-structural`
form** (§11); the SUPERSEDED clause ("only a run at `status:"OK"` opens the gate") is recorded in
`docs/decisions.md` `O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`. **The THIRD run ran — §12.13
below is its record.**

### 12.13 THE THIRD LIVE RUN (2026-09-20, host clock; the JSON stamps UTC 2026-09-21) — the COMPLETED MEASUREMENT WITH ONE RECORDED STRUCTURAL GAP

**What ran.** The **third live run**, on the bundle carrying the RUL-1..RUL-6 fixes (the two
render-emit wraps, the awaited caller spans, the validator reclassification + `status`/note, the
`L1`/`L8` derivations, the mutation-half form). The artifact
`docs/specs/unit-o-0-per-stage-breakdown.md` **is this run's record** — its §1-§14 are the
verbatim evidence, **runs 1-2 are named SUPERSEDED inside it**, and the raw JSON of both legs is
embedded verbatim. This section is the spec's summary + disposition, in the shape of §12.12.

**Command shape (spawn mode, `:0` — the operator store was again absent, so §3.4's source 2 was
used and the pinned SIZE was reached; §1 of the artifact is the verbatim command set):**

```bash
npm run build     # dist/renderer/renderer.js 678270 B (662.4 kb); dist/main/main.cjs 2419392 B
                  # renderer sha256[:8] a25b03a9 / main 955790a9 — both legs verified against disk
node scripts/live-drive.mjs --display=:0 --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0c-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism
node scripts/live-drive.mjs --display=:0 --gpu --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0c-gpuon.json --block=o0_gpu_control,o0_repeat_determinism
npm test && npm run typecheck && npm run build   # the trio (recorded in §11.1 of the artifact)
```

**Bundle identity + census.** `driver.runMode:"spawn"` and `driver.build.verified:true` on
**both** legs (renderer `1789952537561+678270+a25b03a9` GPU-OFF / `1789952556962+678270+a25b03a9`
GPU-ON; main `…+2419392+955790a9`; served = on-disk). Census **226 documents / 6 102 nodes /
9 266 edges**, `corpus.gate:"documents"`, seed `o0-2026-09-17` — the pinned **size** reached, the
counts **recorded provenance** (RUL-5/L10). `env.mode: lexical`, `env.paneFrames: 2`,
`env.engine:"absent"` with the `fetch failed` evidence, `driver.engineError:null`,
`hook.stageRowsSource` = the real module on every row (no mirror), pairing `cross-artifact`.

**(1) THE VERDICT — `status:"OPEN-structural"` in BOTH legs, and NOT a FAIL.** Both legs carry
`pass:false`, `selfValidation.ok:true`, `errors:[]` (0), `gatingReasons:[]`,
`structuralErrors:0`, `structuralFacts:4` (GPU-OFF) / `2` (GPU-ON), `reconciliation.ok:false`
with the mandatory `reconciliation.note`, and the report-level `O-0 REPORT OPEN — …` verdict.
**No FAIL class fired** (`gatingReasons:[]`), and the status is not `"OK"` because the derived
residual is not computable. This is §6 S19 / RUL-4 clause 6 realised live — the run-2 `ok:false`
(24/12 validator errors for structural-only content) is gone. **The one structural id is
`snapshot.clone`**, with the RUL-3 reason verbatim in **both** places it is owed (the stage's
`structuralReason` and the run's forcing line): no main-side transport exists (the MAIN instance
IS armed via `ASTROGRAPHER_O0_MAIN_ARM=1` and wraps the `IPC_RAG_SNAPSHOT` handler, but
`driver.mainSeamArmed:false`, `mainTransport.channel:null` and no `instance:"main"` entry exists
in any `hook.stageRecords`) **AND** Electron's structured-clone serialization happens inside the
IPC internals AFTER the handler returns, outside every host-side wrap. `post.style` is `derived`
in every row/table/verdict (`source:"derived"`, `structural:false`, `structuralReason:null`,
`residual < 0` on every row) — **never quoted as a style cost**.

**(2) THE MEASUREMENT (GPU-OFF, folder-row / document-row, ms; §4.1-§4.2 of the artifact).**

| stage id | folder-row | document-row |
| --- | --- | --- |
| `snapshot.pull` (the AWAITED round trip — RUL-2) | **85.9** | **179.2** |
| `snapshot.clone` | `null (u, S)` | `null (u, S)` |
| `docheads.pull` | 1.9 | **5.8** |
| `traversal.build` | **684.2** | 14.7 |
| `envelope.assemble` | 0.3 | 0.5 |
| `shared.decorate` | 11.4 | **1.2** |
| `reconcile.roots` | 16.5 | **4** |
| `reconcile.apply` | 150.9 | **2085.1** |
| `render.dom` | 59.8 | 74.0 |
| `render.ssr` | 76.1 | **1742.5** |
| `post.style` | `null (u, derived)` | `null (u, derived)` |
| Σ named stages / long task / residual | 1087.5 / 990 / **−97.5** | 4107 / 2222 / **−1885** |

**What moved and why — the A-4 question is CLOSED at the caller level.** `snapshot.pull` reads
**85.9 ms (1 read)** for the disclosure and **179.2 ms (2 reads: 119.4 + 59.8)** for the document
open, i.e. the **run-2 112-126 ms residual COLLAPSED into the awaited round trip** — it was never
style/layout. **A-4 is answered: 1 whole-store `IPC_RAG_SNAPSHOT` read for a folder disclosure
vs 2 for the document open**, so "a doc-nav disclosure that performs no store read at all" is
**REFUTED** for both gestures and O-1's spec gains that as an explicit accept criterion (§10
item 5). The two render emits are measured (`source:"hook"`) instead of "no seam exists" (RUL-1),
and the unseparated set fell to **2 ids** — `snapshot.clone` (structural) plus the `derived`
`post.style`.

**(3) THE O-0 QUESTIONS (a)-(e), third-run reading.**
- **(a)** above: 1 read / 2 reads, 85.9 ms / 179.2 ms.
- **(b) The separable JS path DOMINATES: 87.25 %** of the folder window (`traversal.build` 684.2
  + `envelope.assemble` 0.3 + `shared.decorate` 11.4 + `reconcile.roots` 16.5 + `reconcile.apply`
  150.9 = 863.8 ms of 990) and **94.76 %** of the document window (`reconcile.apply` 2085.1 +
  `traversal.build` 14.7 + `shared.decorate` 1.2 + `reconcile.roots` 4 + `envelope.assemble`
  0.5 = 2090.4 ms of 2222 → **94.46 % on the GPU-ON window (2213 ms; the artifact's own
  §9.5 row)**. **The emits carry 13.73 % (folder) / 81.75 % (document)** — the
  emit-vs-style split is now PARTIALLY separable (RUL-1 delivered); the **`post.style` residual
  is NOT separable** (negative: **−97.5 / −1885 ms**, §12.13 `M1`), so no style/layout figure is
  offered and none may be quoted.
- **(c) The GPU delta is THIS run's only, and it is SIGNED AS THE ARTIFACT RECORDS IT:
  −42 ms folder / −9 ms document** — the document-row GPU difference is a **REDUCTION**
  (long task **2213 ms GPU-ON vs 2222 ms GPU-OFF**, i.e. `2213 − 2222 = −9`; artifact
  **§6.1**, the delta table's own **`-9 ms`** cell, restated at **§9.3** — the folder row's
  **`42 ms`** cell is the same table's other gesture) (identical mutation
  counts 37/11 758 in both legs; per-stage deltas all small) — **never carried across runs**
  (RUL-5/L9; the first/second runs' deltas are labelled provenance only). No GPU effect is
  claimed at this scale.
- **(d) The track ablation Δ is 0 ms long-task total, 0 mutations, +1.6 ms wall** — available,
  applied and reverted with the exact mutation recorded; **not shown to be load-bearing at this
  scale**, stated in the honest form (the ablation rows carry a zero-window long-task total, so
  their verdicts print no percentage at all — RUL-5/L8, `null %` retired).
- **(e) THE O-4 TRIGGER — the traversal WALK is load-bearing for the folder-row DISCLOSURE
  (69.11 % GPU-OFF / 69.34 % GPU-ON, the largest identified stage in both legs) and NOT for the
  document open** (`reconcile.apply` 2085.1 ms of 2222 = **93.84 %**; `render.ssr` 1742.5 ms is
  the second-largest id there, and `traversal.build` is only 14.7 ms). **Trigger (c) therefore
  stays CANDIDATE-FIRED for the disclosure only**, and it is read as a LOWER BOUND (the measured
  `hook` span), never as the whole freeze.

**(4) THE TWO VERDICTS THE PASS RECORDS — `M1`/`M2`/`M3` (measurement shape, not softened).**
- **`M1` — Σ named stages EXCEEDS the long-task window on the gesture rows** (folder 1 087.5 vs
  990 ms; document 4 107 vs 2 222 ms), which is why the residual is negative and `post.style` is
  unseparable. **Cause, from the per-record detail:** the DOCUMENT gesture records **TWO complete
  re-derive passes** in one armed window (`hook.records: 22` vs the folder row's 11) — a light
  pass (`render.dom` 26.8 / `render.ssr` 23.1 / a second `render.dom` 23.4 / `render.ssr` 23.0 /
  `snapshot.pull` 119.4 ms, …) followed by the HEAVY pass (`render.ssr` **1 696.2** +
  `reconcile.apply` **2 084.6** inside the 2 124 ms long task) — so the row's Σ double-counts one
  gesture. Recorded honestly: this is measurement shape, not an imputed number, and the
  reconciliation stays `openStructural` because of it.
- **`M2` — `hook.armCount`/`disarmCount` are SESSION-cumulative** (1/0, 2/1, 3/2, 4/3 across the
  GPU-OFF rows) because the recorder is a page-global singleton never reset between blocks.
  `armCount − disarmCount = 1` (armed) in every row and each row's `armWindow` IS per-row and
  in-band, so the window oracle is unaffected — recorded so the counts are never misread as a
  per-row count.
- **`M3` — the oracle sums the `duration`s of long tasks STARTING inside the window**
  (a `start`-filtered list), so work between/outside long tasks is not in the primary oracle.
  This is the §4.3 primary oracle as specified, and it is what makes `M1` possible.
- Filed as the OPEN row **`O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`** in `docs/defects.md` (with
  the disposition note saying why the tracker row exists in addition to this spec record).

**(5) THE L1b HARNESS FIX (required to reach the run above; recorded, not hidden).** The GPU-OFF
leg was first invoked against the same bundle and returned `status:"FAIL"` for exactly one
reason: `gnosis.status` resolved with the plain STRING `"fetch failed"` (the main-process
`EngineUnavailable` propagated as the tool's text), which the driver's `o0Census` `errorOf()`
object-only probe could not recognise, so the probe was misclassified as an UNSUPPORTED payload
and minted a forcing reason. §6 S4/S21/F22 pin the opposite: an engine ERROR payload is evidence
of **ABSENCE** ("engine-absence is NOT a forcing condition"; a run whose engine state cannot be
derived records `absent` **WITH the evidence string**). The one-line fix (`errorOf` also treats a
non-empty STRING as error evidence) was applied, the leg re-run, and **both legs above ran on the
identical build** (`renderer 678270+a25b03a9`). **No `src/**` or `tests/**` file was touched.**

**(6) THE TRIO (recorded, not claimed — RCA-12: a node-green is envelope-green, not app-green,
and every number above comes from the APP).** `npm run build` clean (the exact 678 270 B /
2 419 392 B bundles both legs verified). `npm run typecheck` clean (exit 0). **O-0 IS GREEN:
its own three suites 106/106** — `tests/unit-o-0-report-contract.test.ts` **44** +
`tests/unit-o-0-hook-contract.test.ts` **39** + `tests/unit-o-0-driver-contract.test.ts` **23**
(run 2 read 95: 23/37/35, so the RUL-1..RUL-6 re-pin landed +11 rows) — **all 8 register rows
held** (P-IM-1/2, P-SM-1/2 and P-TP-1/2 at 60 attempts each, P-TP-3 at 50, P-HK-1 at 40 plus the
settlement half = the 470 landed). **`npm test` = 25 failed / 4 820 pass / 58 skip (8 failed
files / 206 passed of 214)** where **all 25 failures are the pre-existing NON-O-0
toolchain-bump set** (`SUITE-RED-AFTER-VITEST5-ELECTRON44`; run 2 read **22**). **The drift 22 →
25 across runs is NON-O-0 and is reported as drift, not attributed to O-0 — no stable 22 is
claimed.** Per AGENTS.md item 4 (and the REGRESSION row), **no unit may be reported DONE on a
green-`npm test` claim while that regression stands**; O-0's own leg is green and its trio's
`npm test` leg was red for a NON-O-0 reason. **UPDATE 2026-09-21: the blocker was CLOSED 2026-09-21
(the migration + import-batch-persist units landed; final trio 217 files passed (217) /
4 905 passed / 58 skipped / 0 failed (4 963 total), exit 0; O-0 106/106; typecheck 0;
build 0). The 25 failed / 4 820 pass / 58 skip reading above is HISTORICAL.**

**FIXED 2026-09-21 — the post-derivation reason drop is closed; the artifact is the FOURTH
edition.** `O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` is **FIXED (2026-09-21)** (the recompute
shape + the `ok`-read-after-the-last-mint + the both-channel verdict clauses + the genuine
forcing note clause + the driver `report.driver.openStructural` ordering residual) and the
HARNESS CHANGED, so this record's artifact revision is invalidated as prior live provenance
(RCA-11): **`docs/specs/unit-o-0-per-stage-breakdown.md` is now the FOURTH edition and runs 1-3
are named SUPERSEDED inside it**; the fourth run's own record is **§12.14**. **The DEC-1
acceptance (§12.13 (8)) is re-affirmed UNCHANGED on the fourth edition** — same accepted
structural set (`snapshot.clone` + the therefore-derived `post.style`), same
`status:"OPEN-structural"` / `pass:false` form, same five gate conditions — and the report is
**not** relabeled `"OK"`. §12.13's numbers stay the THIRD run's record (labelled historical),
never the current reading.

**(7) THE TWO OPEN DEFECT ROWS THIS PASS FILES (both in `docs/defects.md`, both OPEN).**
1. **`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` (medium, HOST)** — `validateO0Report` computes
   `gating`/`derived`/`ok` from a `failReasons` snapshot taken **before** the post-derivation
   `err()`/push blocks (`src/shared/o0-report.ts` — the `gating` snapshot at `:1389`, inside
   `validateO0Report` at `:1162`, ahead of the post-derivation blocks; the anchors
   `:1389-1391` / `:1393-1463` / `:1464-1467` are the THIRD-RUN reading and drift with the
   file), and
   returns the stale `[...gating, ...family]` — so the **F18** forcing reason
   never reaches the returned `failReasons` (probe: a clean report + `status:"OPEN-structural"`
   returns `{ok:true, status:"OK", errors:[«status disagrees with the derived status»],
   failReasons:[]}`), and the same drop hits the `pass:true` + gating, **F20** and **F21**
   classes. Severity is **medium and stated honestly: the reason IS surfaced in `errors[]` today,
   so there is no silent pass.** Fix shape: recompute `ok`/`failReasons` AFTER those blocks —
   **then the TestWriter can move the F18 pins from the `errors[]` level to the `pass:false`
   level.**
2. **`O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` (low/medium, measurement shape)** — `M1`/`M2`/`M3`
   above, with the same content recorded here and in the row.

**(8) THE GATE — O-5 IS UNBLOCKED (user DEC-1, 2026-09-20).** Per the AMENDED **§3.6b RUL-4
clause 7**, the O-5 delegation gate opens at `status:"OK"` ⇔ `pass:true` **or** at an
`status:"OPEN-structural"` report whose only gap is the ACCEPTED structural set
(`snapshot.clone` + the therefore-derived `post.style`) provided `selfValidation.ok:true`,
`gatingReasons:[]`, the window-bound check passes on every row, and the structural reasons are
recorded verbatim (plus the mandatory `reconciliation.note`). **This run satisfies every one of
those conditions** (§12.13 (1), (2), (7)), so the third-run artifact is the ACCEPTED
ARCH-GNOSIS-OFFLOAD gate input and **O-5 may be delegated**. The SUPERSEDED clause ("only
`status:"OK"` opens the gate") and the acceptance itself are recorded in the decision row
**`O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`** (`docs/decisions.md`) — the spec's clause 7 is the
canonical home of the amended condition. The `snapshot.clone` seam keeps its recorded shape:
- **(a) ACCEPTED (DEC-1)** — the DERIVED residual is recorded **uncomputable**
  (`snapshot.clone` named as the unsealed stage) and O-5 is gated on the `OPEN-structural`
  artifact. The residual stays permanently non-attributable and the absence of the seam stays
  VISIBLE in every report (`status:"OPEN-structural"`, never quietly `"OK"`).
- **(b) NOT taken, and NOT owed** — BUILDING the main-side transport channel (a channel carrying
  the main recorder's records into the renderer/report — §3.6b RUL-3's "one change that would
  make it measured") remains a SEPARATE unit (an engine/host seam, its own red set per RCA-2,
  its own gate), never a patch inside O-0.
- Independent of (a)/(b): the **`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` fix is cheap**,
  remains OWED (the user accepted the structural gap, NOT this row), and does not require the
  seam decision — it is item (2) of the next queue in `docs/next-steps.md`.
  **RESOLVED 2026-09-21: the fix LANDED (the recompute shape + the F18 pins moved to the
  `pass:false` level + the driver ordering residual) and the FOURTH live run re-executed the
  harness on the fixed module — the accepted artifact is now the FOURTH edition and the
  acceptance above is re-affirmed UNCHANGED on it (`status:"OPEN-structural"`, `pass:false`,
  `selfValidation.ok:true`, `errors:[]`, `gatingReasons:[]`, the same accepted structural set).
  The defect row is FIXED (`docs/defects.md`); the unit record is §12.14 and
  `archive/reviews/2026-09-21-unit-o0-validator-reason-drop-doc-review.md`. The OWED work of
  this queue is now the M1-M3 measurement-shape unit (`O0-M1-M3-MEASUREMENT-SHAPE`).**

**O-0 is DONE — the artifact is ACCEPTED at `status:"OPEN-structural"` (a completed measurement
with one recorded structural gap; no further O-0 code owed).** The artifact is committed,
CURRENT for this measurement, honest and structurally incomplete by the accepted gap. **Caveat
(historical — superseded 2026-09-21): the repo-wide trio's `npm test` leg was RED from the
DEC-2 regression (`SUITE-RED-AFTER-VITEST5-ELECTRON44`) — the blocker was CLOSED 2026-09-21
(final 217 files passed (217) / 4 905 passed / 58 skipped / 0 failed (4 963 total), exit 0)** —
a NON-O-0 toolchain regression that was scheduled as its own
migration unit; O-0's own three suites read **106/106 at the third run — 114/114 at the fourth
(report 50 + hook 39 + driver 25), the CURRENT reading** (item 6 of §12.13; §12.14 (6)). The **doc-review
(RCA-6, record: `archive/reviews/2026-09-20-unit-o-0-doc-review.md`)** runs concurrently and must
re-pin this spec's driver line anchors and reconcile the census/test-count claims against the
build. **(The post-fix doc-review is
`archive/reviews/2026-09-21-unit-o0-validator-reason-drop-doc-review.md` — §12.14's record.)**

---

### 12.14 THE FOURTH LIVE RUN (2026-09-21) — the post-fix harness, the re-accepted FOURTH-edition artifact, and the defect proven load-bearing

**What ran.** The **fourth live run**, executed on the bundle carrying the
`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` fix (`src/shared/o0-report.ts` `validateO0Report`:
the post-derivation blocks ahead of the split, the split from the FINAL `failReasons`, `ok` read
after the last mint, the verdict-consistency clauses in BOTH channels, the note clause genuinely
forcing) plus the driver's `report.driver.openStructural` ordering residual
(`scripts/live-drive.mjs`: recomputed AFTER the self-validation `derived.gating.push`). **The
harness changed, so the accepted artifact was REGENERATED (RCA-11)**:
`docs/specs/unit-o-0-per-stage-breakdown.md` is now the **FOURTH edition**, whose §1-§13 are the
verbatim evidence, whose **STATUS banner names runs 1-3 SUPERSEDED**, and whose §12 embeds the
raw JSON of **both legs verbatim** (byte-exact round-trip verified; 89 211 B / 50 103 B). This
section is the spec's summary + disposition, in the shape of §12.13.

**Command shape (spawn mode, `:0` — the operator store was again absent, so §3.4's source 2 was
used and the pinned SIZE was reached; artifact §1 is the verbatim command set):**

```bash
npm run build     # dist/renderer/renderer.js 678270 B; dist/main/main.cjs 2419531 B
                  # renderer sha256[:8] a25b03a9 / main 04aceeff — both legs verified against disk
node scripts/live-drive.mjs --display=:0 --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0d-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism
node scripts/live-drive.mjs --display=:0 --gpu --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0d-gpuon.json --block=o0_gpu_control,o0_repeat_determinism
npm test && npm run typecheck && npm run build   # the trio (recorded in artifact §11.5)
```

**No harness fix was needed for this run.** The two harness changes under test were already in
place; **no `src/**` or `tests/**` file was touched by the live pass**, and both legs ran on the
identical `renderer 678270+a25b03a9` bundle.

**Environment + bundle identity.** `driver.runMode:"spawn"` and `driver.build.verified:true` on
**both** legs (renderer `1789969524598+678270+a25b03a9` GPU-OFF /
`1789969551283+678270+a25b03a9` GPU-ON; main `…+2419531+dd1d5d0e`; served = on-disk);
`driver.display:":0"`, `appFlag` = the driver-spawned `--no-gpu` leg vs the `gpu on` leg;
`env.mode:"lexical"`, `env.paneFrames:2`; `env.engine:"absent"` with the evidence `an error
payload from the status call (fetch failed)`, `driver.engineError:null` (the run-3 `L1b`
`errorOf` fix re-confirmed); pairing `cross-artifact`; `driver.mainSeamArmed:false` /
`mainSeamRecords:0` / `mainTransport.channel:null` on both legs; `hook.stageRowsSource` = the
real module on every row (no mirror); row window band `hook.toleranceMs:40` (distinct from
`tolerance.reconcileMs:50`, the residual band).

**Census (artifact §3).** `corpus.documents` **226 = the claimed 226 on BOTH legs**,
`corpus.gate:"documents"`, seed `o0-2026-09-17`; `corpus.nodes`/`edges` **6 102 / 9 266**
recorded provenance (RUL-5/L10, identical to runs 2-3); the host-side `find` re-verification
agrees (**226 `*.md` = docs 200 + archive 20 + notes 6, 1.8 M**), so all four runs are
same-corpus-shape at the pinned size. **No census-mismatch reason exists in either leg.**

**Per-stage table summary (artifact §4; ms, GPU-OFF folder-row / document-row).**
`snapshot.pull` **79.9 / 162.4** (the AWAITED round trip — RUL-2; per-read 79.9 and
118.3 + 44.1), `snapshot.clone` `null (u, S)` on every row, `docheads.pull` 2.1 / 4,
`traversal.build` **701.9 / 11.5**, `envelope.assemble` 0.4 / 0.5, `shared.decorate` 10.7 / 0.8,
`reconcile.roots` 17.4 / 3.1, `reconcile.apply` 150.1 / **2 030.4**, `render.dom` 58.4 / 73.2,
`render.ssr` 70.6 / **1 739.5**, `post.style` `null (u, derived)` on every row; Σ named /
long task / residual **1 091.5 / 1 007 / −84.5** (folder) and **4 025.4 / 2 162 / −1 863.4**
(document). GPU-ON: folder `traversal.build` 659.1 in a 954 ms window, document
`reconcile.apply` 2 050.2 in 2 177 ms, residual −87.3 / −1 860.4. **9 ids measured numerically,
1 structural, 1 derived — in every row of both legs**; `hook.pendingSpans:0`, `hook.dropped:0`,
`hook.refused:[]`, `quiesced:true` (`timedOut:false`) on every row.

**Controls (artifact §5-§6).** Both gestures resolved `path:"cdp"` / `realInput:true` in every
row (real hit-tested rows: a `#pane-doc-nav [data-folder-path]` row and a
`[data-document-id="archive/archive-001"]` row). **Hook inertness (RUL-6):** `inert:true` in
BOTH legs with `Δmutations 0` (37 vs 37), the long-task half VACUOUS (`nonVacuous:false`,
0-vs-0), `carriedBy:["mutations"]` and the pinned **MUTATION-HALF** sentence verbatim — the
**F21 clause therefore does not fire** (and its input, `driver.hookInertness[]`, is the array
that carries `nonVacuous`/`proofStatement`; see (8) below). `setEqual:true`, `ms` free under the
seed. **Track ablation (d):** 0 ms long-task total, Δmutations 0, ΔwallMs +1.9 ms — available,
applied and reverted, with the two zero-window rows printing the RUL-5/L8 no-percentage form.
**GPU control (c):** THIS run only — **−53 ms folder / +15 ms document** (mutation counts
identical, 37/37 and 11 758/11 758) — **no separable GPU effect**; the first/second/third runs'
deltas (+2173/+2419, −36/−23, +42/−9) appear only as labelled provenance with
`carriedFromAnotherRun:false`, so the **F20 clause does not fire**.

**The self-validation triple + the derived verdicts ((1), artifact §7.1-§7.3).** Both legs:
`driver.selfValidation.ok:true`, `errors:[]` (0), `status:"OPEN-structural"`, `attempts` 4 / 2
rows all `ok:true`, `structuralErrors:0` with `structuralFacts:4` / `2`, `moduleGating:[]`,
`gatingReasons:[]`, `reconciliation.ok:false` with the mandatory `reconciliation.note` present
verbatim, the derived `status:"OPEN-structural"` with `pass:false`, and the report-level
`O-0 REPORT OPEN — …` verdict emitted (17 GPU-OFF / 9 GPU-ON verdict strings). **The pure
module re-run over the embedded JSON** (`validateO0Report`, the module the driver executes):
`ok:true`, `status:"OPEN-structural"`, `errors:[]`, **`failReasons` 8 (GPU-OFF) / 4 (GPU-ON)** =
the structural family only (4 structural + 4 derived-residual / 2 + 2), `gating` 0; every row
`ok:true` with `errors:[]`. **The one structural id is `snapshot.clone`** (the RUL-3 reason
verbatim in both places it is owed), and `post.style` is `derived` in every row/table/verdict.

**Window bound ((9), artifact §9).** `deriveO0WindowBound(run)` re-run with **NO options** over
both embedded reports reading the row's recorded band (40 ms): **NO row violates the bound** —
`violated:false` on all six rows, largest arm-window overshoot of the freeze window **+1.0 ms**,
largest shortfall 0.0 ms, no pct > 100 and **no `null %` string anywhere** (the two zero-window
ablation rows print the RUL-5/L8 form). Run 3's 0.8 ms result **does not regress**.

**The O-0 questions ((2)-(3), artifact §8).**
- **(a) A-4 is answered at the caller level: 1 read (folder disclosure, 79.9 ms) vs 2 reads
  (document open, 162.4 ms)** — per-read 118.3 + 44.1 on the document row; `docheads.pull` 2.1 /
  4 (2 + 2). The cheapest variant ("a doc-nav disclosure performs no store read at all") stays
  **REFUTED for both gestures**, and the count is **1 / 2 in every one of the four runs' pinned
  legs** (a stable shape).
- **(b) The separable JS path DOMINATES: 87.44 %** of the folder window (880.5 ms of 1 007) and
  **94.65 %** of the document window (2 046.3 of 2 162); the render emits carry 12.81 % / 83.84 %.
  **The `post.style` residual is NOT separable** (negative on every row), so **no style/layout
  figure is offered and none may be quoted**.
- **(d)** above; **(c)** above; **(e) the walk is load-bearing for the DISCLOSURE ONLY**
  (`traversal.build` 69.70 % GPU-OFF / 69.09 % GPU-ON, the largest identified stage in both legs)
  and **NOT for the document open** (`reconcile.apply` 93.91 / 94.18 %), so trigger (c) stays
  **CANDIDATE-FIRED for the disclosure only**, read as a LOWER BOUND.

**(4) THE FIX, VALIDATED ON THE EXECUTED ARTIFACT (artifact §7.3 + §7.4 — the point of this
run).**
- **The check.** On BOTH embedded legs: **no post-derivation reason class is present ONLY in
  `errors[]`** — the F18 status-vs-derivation and `pass:true`/`status`-contradiction clauses 0/0,
  the missing-`reconciliation.note` clause 0/0 (the note IS present), F20
  `carriedFromAnotherRun:true` 0 entries, the corpus-gate provenance reason 0/0, the F21
  vacuous-half reason 0/0; `driver.failReasons` / `driver.openStructuralReasons` /
  `derived.gating` read 8 / 8 / 0 (GPU-OFF) and 4 / 4 / 0 (GPU-ON) — consistent.
- **The DIFFERENTIAL (pre-fix vs fixed, over the same perturbed fixtures; `git show
  HEAD:src/shared/o0-report.ts` vs the fixed module).** As-executed (unperturbed): **identical**
  (`ok:true | OPEN-structural | 0 | 8 | 0` in both modules) — **this run's legs mask nothing**.
  `status := "OK"` (F18): pre-fix `ok:true` with 1 error and the reason **dropped** from
  `failReasons` (8) → fixed `ok:false`, reason in BOTH (9). `pass := true` (F18, two clauses):
  pre-fix stranded → fixed `ok:false` with both returned (10), still outside `gating` (the
  self-referential rule). `gpuDeltas[0].carriedFromAnotherRun := true` (**F20**): pre-fix
  `ok:true`, status left `OPEN-structural` → fixed `ok:false`, **`FAIL`**, reason in
  `gating`/`failReasons` (10 / 1). `reconciliation.note := null` (**RUL-4 clause 5**): the same
  shape → fixed **`FAIL`** with the reason gating. `corpus.documents := 225` (F8): both FAIL; the
  fixed module adds the post-derivation corpus-gate clause to `failReasons` (10 vs 9).
  `hookInertness[0].proofStatement` mutated with `nonVacuous:false` (**F21**): pre-fix stranded →
  fixed **`FAIL`** with the reason in BOTH channels. **All five post-derivation classes were
  exercised.** The second `errors[]` line in the fixed column is the F18 status-vs-derivation
  clause itself (once a gating reason exists, the declared `"OPEN-structural"` no longer agrees
  with the derived `FAIL`) — recorded in BOTH channels; on the pre-fix module that same line was
  minted and dropped, which IS the defect (`ok:true` beside a non-empty `errors[]`).
- **Reading.** The fix is **real and load-bearing in the module** and **inert on this run's
  legs** — the required result: the legs were re-measured on the fixed harness and did **not**
  acquire a reason the pre-fix validator had merely parked in `errors[]`. **The defect's live
  exposure was LATENT** (run 3 masked nothing either); what the fix closes is the condition,
  proven by the differential.
- **The driver residual (artifact §7.5/§10.3).** `report.driver.openStructural` now reads the
  POST-push reason set; on both legs pre-push = post-push = `true`, consistent with
  `OPEN-structural` ⇔ `structuralReasons.length > 0 && gating.length === 0`. The ordering defect
  could only bite on a leg whose self-validation REJECTS a row, so this equality is the
  verification that the fix is latent here (§7 §3a finding 5: resolved as an invariant pin
  `D24`/`D25`, with the one residual fixed).

**(5) COMPARISON TO RUN 3 (artifact §10; numbers moved, SHAPES did not).** Folder window
990 → **1 007 ms** (GPU-OFF) / 1 032 → **954** (GPU-ON); document 2 222 → **2 162** / 2 213 →
**2 177**; `traversal.build` 684.2 → 701.9 and 715.6 → 659.1; `reconcile.apply` 2 085.1 → 2 030.4
and 2 075.6 → 2 050.2; A-4 totals 85.9 → **79.9 ms** (folder) / 179.2 → **162.4** (document).
**Stable shapes:** census 226 with the same 6 102 / 9 266 provenance, 9 measured ids, the same
2-id unseparated set, A-4 **1 / 2**, window bound pass on all six rows, `selfValidation.ok:true`
with `status:"OPEN-structural"`/`pass:false`, `env.engine:"absent"` + the same evidence, no
`null %`. **The GPU delta flipped sign again** (−53 / +15 vs run 3's +42 / −9) — a fourth witness
that there is **no separable GPU effect** at this scale, not a reversal. All absolute-ms movement
is single-session readings of the SAME corpus shape on a NEWLY BUILT bundle: **no cross-run
absolute comparison is a measurement** (RUL-5/L9/L10), and the app source is unchanged by this
pass.

**(6) THE TRIO + THE REGISTER (recorded, not claimed — RCA-12).** `npm test` = **217 files
passed (217) / 4 913 passed / 58 skipped / 0 failed (4 971 total), exit 0**; `npm run typecheck`
exit 0; `npm run build` exit 0 (the exact 678 270 B renderer / 2 419 531 B main bundles both legs
verified). **O-0's own three suites read 114/114 = report-contract 50 + hook-contract 39 +
driver-contract 25** (the pre-fix 106 = 44/39/23 is provenance), and all **8 register rows
`held`** (the 470-attempt budget). **Layer (RCA-12): the O-0 numbers above are APP-layer /
`assembled-renderer` evidence (real hit-tested CDP gestures against the executing `dist/`
bundle); the suite-green is HARNESS/STORE layer and is NEVER app-green.**

**(7) THE ARTIFACT IS THE FOURTH EDITION — runs 1-3 SUPERSEDED (RCA-11).** The harness changed
(`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` FIXED + the driver ordering residual), so the prior
live provenance is invalidated: the artifact's STATUS banner names **runs 1-3 SUPERSEDED**, its
§13 records the supersession and the byte-exact embedded JSON, and this spec's §12.13 record is
labelled historical. **What the fourth run changes about the ACCEPTANCE: nothing** — the accepted
structural set, the `OPEN-structural` form and the five amended gate conditions are unchanged;
**DEC-1 is re-affirmed, not re-ruled, and the report is NOT relabeled `"OK"`.**

**(8) OPEN / OWED AFTER THIS RUN (explicitly not closed).**
- **`O0-M1-M3-MEASUREMENT-SHAPE` remains OPEN and OWED as the NEXT unit** (artifact §11.4/§11.6):
  the fourth run **reproduces** `M1` (Σ 1 091.5 vs 1 007 ms folder / 4 025.4 vs 2 162 ms
  document; the document row's TWO re-derive passes in one armed window, `hook.records: 22` vs
  11), `M2` (`armCount`/`disarmCount` session-cumulative, `armCount − disarmCount = 1` per row,
  each `armWindow` in-band) and `M3` (the long-task total is a sum of `duration`s of long tasks
  STARTING inside the window) — it is a **fourth witness, not a fix**.
- **A consumer note on the F21 clause's input shape** (recorded, not softened): the clause reads
  `driver.hookInertness[]` — correct, that is where `nonVacuous` and `proofStatement` live — while
  the DERIVED `driver.hookInertnessProof[]` (the per-pair summary the report presents) emits
  `statement` and **no** `nonVacuous`. A consumer must not expect the clause's inputs there; a
  future pass wanting them in one place would emit `nonVacuous`/`proofStatement` aliases on the
  proofs array (or have the clause read both shapes) and pin it red-first.
- **The main-side `snapshot.clone` transport** remains a SEPARATE unit (DEC-1 clause 5, the
  accepted structural gap) — never a patch inside O-0.
- **No page-design artifact is owed:** this run changes no page design
  (`docs/skills/designing-pages.md` does not exist in this tree).

**THE FOURTH RUN ACCEPTED.** Both legs `status:"OPEN-structural"`, `pass:false`,
`selfValidation.ok:true`, `errors:[]`, `gatingReasons:[]`, `failReasons` = the structural family
only — **structurally capped, not a FAIL and not a DONE**, with **NO newly surfaced reason** and
the fix proven load-bearing by the differential while the unperturbed legs mask nothing. **The
O-5 delegation gate's amended conditions (DEC-1 clause 3) still hold on this edition**, so O-5
stays UNBLOCKED on the FOURTH-edition artifact; the queue's next unit is the M1-M3
measurement-shape unit. Unit record: this §12.14 + `docs/defects.md` (the row is **FIXED
(2026-09-21)**) + `archive/reviews/2026-09-21-unit-o0-validator-reason-drop-doc-review.md`.

---

### 12.15 THE FIFTH LIVE RUN (2026-09-21) — a FAIL, and THE ARTIFACT-STATUS CAUTION (the accepted evidence is still the FOURTH edition)

**What ran.** The **fifth live run**, on the bundle carrying the
`O0-M1-M3-MEASUREMENT-SHAPE` harness (the per-pass emission shape: `hook.passes[]` + the union
accounting, the per-row/session arm counters, the pinned long-task attribution record, the
retired summed residual and the retired bare counters). The harness changed, so the artifact
was REGENERATED (RCA-11): `docs/specs/unit-o-0-per-stage-breakdown.md` is now the **FIFTH
edition**, whose **STATUS banner names runs 1-4 SUPERSEDED** and whose §14 embeds the raw JSON
of **both legs verbatim** (byte-exact round-trip verified; renderer `678367+3e3f1b80` both
legs, main `2419628+e1e652667`, `driver.build.verified:true`). **This §12.15 is the spec's
summary + disposition, in the shape of §12.13/§12.14. The canonical, binding record (the
findings, the test reds, the rulings `RUL-11`..`RUL-14` and the amendments they force) is
`docs/specs/unit-o0-m1-m3-measurement-shape.md` §12.**

**The outcome — a FAIL, not the accepted form.** **BOTH legs: `status:"FAIL"`,
`pass:false`, `driver.selfValidation.ok:false`** (4 GPU-OFF / 2 GPU-ON errors),
**`gatingReasons` 9 / 5**, `driver.openStructural:false`, `structuralErrors` 0 with
`structuralFacts` 4 / 2. The forcing class is the new union-based row remainder
`unaccountedMs` = **156.8 / 56.8 / 40.7 / 41.9 ms** (GPU-OFF) and **110.9 / 60.9 ms**
(GPU-ON), which the partition oracle records as a row OUTCOME (`row.pass:false` + its reason)
and the driver propagates into the report's gating reasons — so 4/4 (and 2/2) rows are
`pass:false` and the report flips from `OPEN-structural` to `FAIL`. **Band caveat (verified
against the committed JSON):** each row's reasons print the **40 ms** `hook.toleranceMs` band
while the row RECORDS `reconciliation.toleranceMs` **50 ms** (`tolerance.reconcileMs`), so the
two ablation rows (40.7 / 41.9 ms) are over 40 but WITHIN 50 — the band's SCOPE is part of the
fix (RUL-11). The **structural facts are UNCHANGED**: `snapshot.clone` is the ONE
`structural:true` id with the RUL-3 reason verbatim, `post.style` stays
`derived`/`ms:null`/`unseparated`/`attributable:false` in every row, and **no report is
relabelled `"OK"`** (the DEC-1 visibility invariant holds).

**What the fifth run DID establish (positive — the M-closures).** The per-pass partition works
(folder = 2 passes; document = **3** passes `["pre-pass-render","re-derive","re-derive"]`), the
per-id aggregation identity holds on all six rows with **0 violations**, `unaccountedMs ≥ 0` on
**6/6 rows and 15/15 passes**, the retired residual is `null` everywhere (the naive form survives
only as `naiveSumResidualMs` + `notAResidual`), the retired bare `armCount`/`disarmCount` are
**absent** with every row at `rowArmCount 1`/`rowDisarmCount 1`, every row carries
`rule:"start-inside-inclusive"` with `includedMs === longTaskTotalMs`, the window bound is clean
(worst **+1.2 ms** against the 40 ms band; `outsideOffenders[]` empty), inertness is
`inert:true` in both legs, the GPU delta is **+39 / +119 ms** (no separable effect) and A-4
reads **1 / 2**. **Full detail: spec `unit-o0-m1-m3-measurement-shape.md` §12.3.**

**THE SIX OPEN FINDINGS (all UNPATCHED; owner = the NEXT CYCLE).** `F5-1` the band-exceeded
outcome gates the report to FAIL (`rowOutcomeReasons` → `row.pass:false` → report gating) —
the unit's exit condition, filed as its own defect row `O0-BAND-EXCEEDED-GATES-THE-REPORT`;
`F5-2` `passLongTaskDoubleCountMs` NEGATIVE (−53 / −95 / −63); `F5-3` `passOverlapSumMs`
NEGATIVE (−131.2 … −17.6) though described as a non-negative overlap measure; `F5-4` pass-0's
window collapses to `{0,0}` and its span (51.4 / 93.8 / 0.5 / 0.3 / 61.1 / 100.3 ms) is counted
by NO pass (a nesting crossing the pass boundary) — **the likely root cause of most of F5-1's
band breach**; `F5-5` `validateO0MeasurementShape` returns `ok:true` beside `F5-2`/`F5-3`/`F5-4`;
`F5-6` the top-level `reconciliation.note` is `null` in both legs. **Three TEST REDS remain as
the TestWriter's counterexamples (owner = the next cycle): `RULE-2`, `FIX-TP1`, `FIX-TP3`** —
two an ORACLE/Spec defect (the row remainder is computed from the RAW union while `accountedMs`
uses the CLIPPED union, so `unaccountedMs ≠ windowMs − accountedMs`, violating
`unit-o0-m1-m3-measurement-shape.md` §2.1) and one a SPEC CONFLICT (§3.4's cross-check vs
§2.3/FS5's alternatives disjunct).

**THE ARCHITECT'S BINDING RULINGS (recorded; canonical text in
`docs/specs/unit-o0-m1-m3-measurement-shape.md` §12.6).**
- **RUL-11 — `F5-4` first, then the band.** Fix the partition so pass-0's span IS accounted
  (or the pass boundary/nesting rule is corrected so no top-level span falls outside every
  pass) and fix `F5-2`/`F5-3`'s negative measures (both must be **non-negative MEASURES** with
  the pinned semantics). Only then is the band question adjudicated on a re-run: the union-based
  `unaccountedMs` is a **MEASUREMENT-QUALITY quantity** (unexplained time in the window), **not
  an imputation**; if it still exceeds the band after `F5-4`, the spec must **re-derive the band
  empirically for the NEW quantity**, or record the over-band case as a **reported quality
  finding + a row-level note rather than a report-level `FAIL` gate** — a legitimate measurement
  gap must not convert the DEC-1-accepted form into a FAIL. **The spec pins BOTH** (re-derive
  the band empirically AND make the over-band case a reported finding + row note, never a
  report-level gate), and makes the band's **SCOPE** explicit: the RETIRED summed residual has
  **no band**; `tolerance.reconcileMs` (**50 ms**) is the band for the **union remainder**
  `unaccountedMs`; `hook.toleranceMs` (**40 ms**) is the **WINDOW-BOUND** band (and the
  hook-inertness band).
- **RUL-12 — the validator must catch its own shape.** `validateO0MeasurementShape` must fail
  (or record a forcing reason) on `F5-2`/`F5-3`/`F5-4` (a negative double-count/overlap
  measure, an unaccounted top-level span, a collapsed pass-0 window) and the top-level
  `reconciliation.note` must be present (`F5-5`/`F5-6`) — RUL-4 clause 5's mandatory note is not
  satisfied by the row-level statements.
- **RUL-13 — the spec conflict.** Amend `unit-o0-m1-m3-measurement-shape.md` **§3.4** to the
  **OBSERVED-list** cross-check (`includedCount ≤ longTasks.length` AND
  `includedMs === longTaskTotalMs`) and SCOPE the **§2.3/FS5 alternatives disjunct** to rows
  whose observed list contains at least one EXCLUDED task (where the rule actually
  discriminates) — the two clauses as written are **mutually unsatisfiable on a discriminating
  list** (an excluded observation forces `longTasks.length > includedCount`, and whenever no task
  straddles the window `overlapAnyMs = intersectionMs = includedMs`, so the disjunct fires on
  every honest row).
- **RUL-14 — the artifact status (see the caution below).** The fifth edition **STANDS as the
  committed FAIL record**; the next cycle's fix + the **SIXTH** live run must reproduce the
  DEC-1-accepted form (`OPEN-structural`, `pass:false`, `selfValidation.ok:true`,
  `gatingReasons:[]`) — or, if the fix legitimately leaves a forcing reason, **DEC-1 must be
  re-adjudicated by the USER, never silently relabelled.**

> **THE ARTIFACT-STATUS CAUTION (record it explicitly): the ACCEPTED evidence under DEC-1 is the
> FOURTH edition of `docs/specs/unit-o-0-per-stage-breakdown.md` (the `status:"OPEN-structural"`,
> `pass:false`, `selfValidation.ok:true`, `gatingReasons:[]` reading recorded in §12.14). The
> FIFTH edition — the currently COMMITTED file — reports `status:"FAIL"`, `pass:false`,
> `selfValidation.ok:false` (4/2 errors), `gatingReasons` 9/5. THEREFORE THE ACCEPTED FORM IS
> NOT CURRENTLY REPRODUCED BY THE COMMITTED ARTIFACT.** The fourth edition's raw JSON is
> **recoverable from git history** (renderer `678270+a25b03a9`; its record is this spec's
> §12.14) and the **DEC-1 acceptance ruling is UNCHANGED** — DEC-1 still accepts the fourth
> edition's form, it is not relabelled, not re-ruled and not withdrawn, and the fifth edition
> does not silently inherit it (a provenance clause to exactly this effect is appended to the
> DEC-1 row in `docs/decisions.md`). **The fifth edition is a FAIL pending the fix + a SIXTH
> run.** The **O-5 delegation gate** stays UNBLOCKED **on the FOURTH-edition form** (DEC-1
> clause 3) and is **NOT** opened by the fifth edition (its `status:"FAIL"` never opens the gate
> — §3.6b RUL-4 clause 7).

**Open / owed after this run (explicitly not closed).**
- **`O0-M1-M3-MEASUREMENT-SHAPE` remains OPEN** with `F5-1`..`F5-6`, the three reds and the
  sixth-run acceptance path; **`O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` stays OPEN** (a fifth
  witness, not a fix) and the NEW row **`O0-BAND-EXCEEDED-GATES-THE-REPORT`** files `F5-1`.
- **No app behavior changed** and **no page-design artifact is owed** (`docs/skills/designing-pages.md`
  does not exist in this tree).
- **The main-side `snapshot.clone` transport** remains a SEPARATE unit (DEC-1 clause 5).
- **The F21 clause field-name coupling** noted in §12.14 (8) is unchanged and still inert on
  real artifacts (the fifth run carries the MUTATION-HALF sentence in both legs).

**Unit record:** this §12.15 + `docs/specs/unit-o0-m1-m3-measurement-shape.md` §12 (the full
record) + the artifact's §7.1/§8.1-§8.3/§13.1/§14 (FIFTH edition — **NOTE: those "§14.x"
embedded-JSON citations are the FIFTH edition's numbering; the SIXTH edition embeds both legs
in its **§12.1/§12.2** with the round-trip record in **§12.3**) + `docs/defects.md`
(`O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`, `O0-BAND-EXCEEDED-GATES-THE-REPORT`) +
`docs/decisions.md` (DEC-1 provenance) + `docs/next-steps.md` (the CURRENT WORK entry).
**SUPERSEDED by §12.16: the fix cycle repaired `F5-1`..`F5-6`, the three reds went green and
the SIXTH run reproduced the accepted form — the row and the gate defect are FIXED and the
artifact is the SIXTH edition.**

### 12.16 THE SIXTH LIVE RUN (2026-09-21) — the DEC-1-ACCEPTED FORM IS REPRODUCED; the artifact is the SIXTH edition; the DEC-1 caveat is RESOLVED

**What ran.** The **sixth live run**, on the `O0-M1-M3-MEASUREMENT-SHAPE` harness AFTER the
`F5-1`..`F5-6` fixes + the clipped-union remainder + the OBSERVED-list cross-check (the fixes
the fifth run's FAIL forced). The harness changed, so the artifact was REGENERATED (RCA-11):
`docs/specs/unit-o-0-per-stage-breakdown.md` is now the **SIXTH edition**, whose **STATUS
banner names runs 1-5 SUPERSEDED** and whose §12 embeds the raw JSON of **both legs verbatim**
(byte-exact round-trip verified: GPU-OFF 168 989 bytes embedded / 168 990 original, sha256
`f2506c239061db6b`; GPU-ON 96 098 / 96 099, sha256 `4307f840993c8e2e`; `JSON.parse` of each
extracted block deep-equals the original). Bundle identity: renderer
`1789972671852+678367+3e3f1b80` / `1789972750760+678367+3e3f1b80`, main
`1789972671735+2419628+1e652667` / `1789972750644+2419628+1e652667`,
`driver.build.verified:true` on BOTH legs (served = on-disk), `driver.runMode:"spawn"` on both
legs, DISPLAY `:0`, census **226 = 226** (6 102 nodes / 9 266 edges recorded as provenance),
`env.engine:"absent"` with the same recorded evidence. **The bundle is byte-identical to the
fifth run's — the harness is what changed**, which is the scope RCA-11's changed-harness
invalidation covers. **The canonical, binding record (the sixth-run tables, the closure
evidence, the vs-run-5 comparison and the carried items) is
`docs/specs/unit-o0-m1-m3-measurement-shape.md` §12.9/§12.10.**

**The outcome — the ACCEPTED FORM.** **BOTH legs: `status:"OPEN-structural"`, `pass:false`,
`driver.selfValidation.ok:true` with `errors:[]`, `gatingReasons:[]`** — the fifth run's
`FAIL` is GONE. `selfValidation.structuralErrors` 0 with `structuralFacts` **4 / 2**;
`driver.openStructural:true`; `reconciliation.ok:false` / `openStructural:true`;
`reconciliation.bandExceededGate:false`; `reconciliation.measurementShapeFailures:[]`;
`reconciliation.note` PRESENT (716 / 640 chars) **plus** the row-level restatement; all six
rows `pass:true` with an empty `failReasons[]` and `measurementShape.ok:true`. **The structural
facts are UNCHANGED from runs 1-5:** `snapshot.clone` is the ONE `structural:true` id with the
RUL-3 reason verbatim, `post.style` stays `derived`/`ms:null`/`unseparated`/`attributable:false`
in every row, and **no report is relabelled `"OK"`** (the DEC-1 visibility invariant holds) —
which is why `pass` is correctly `false` on an otherwise clean report.

**The `F5-1`..`F5-6` closures, live (the sixth run's evidence, not this spec's claim).**
`F5-1` the band-exceeded OUTCOME no longer gates: 4/6 rows record `bandExceeded:true` with a
`bandExceededNote` + a `row.notes[]` + an `outcomeReasons[]` entry, the two ablation rows
(43.1 / 41.4 ms) are INSIDE the recorded 50 ms union band and note-free, and **not one of them
enters `row.pass`, `row.failReasons`, `gatingReasons` or `status`**. `F5-2`
`passLongTaskDoubleCountMs` is a MEASURE reading **0 on all six rows** (the signed form is
`passTotalsMinusRowMs` −54 / −95 / 0 / 0 / −69 / −89 with `notADoubleCount`). `F5-3`
`passOverlapSumMs` is non-negative — **52.4 / 93.6 / 0.4 / 0.4 / 67.5 / 88.5** (the signed form
is `passRowUnaccountedDeltaMs` −77.8 / −15.4 / −27.5 / −26.5 / −89.7 / −11.5 with
`notAMeasure`). `F5-4` every top-level span is accounted by exactly ONE pass — the passes'
clipped top-level union **=== the row's declared `accountedMs` on 6/6** with a **worst
owner-coverage gap of 0.000 ms**, `Σ pass.records.count === hook.records` (11/11, 22/22,
11/11, 11/11, 11/11, 22/22), and pass 0's collapsed `{0,0}` window GONE (a real span:
52.4 / 93.6 / 0.4 / 0.4 / 67.5 / 88.5 ms). `F5-5` `validateO0MeasurementShape` returns
`ok:true` on 6/6 **with `FS11`/`FS12` LIVE** (its `FS12` clause recomputes the owner coverage
pass 0 now passes). `F5-6` the top-level `reconciliation.note` is present on every status.
**The `FIX-TP1` identity holds on 6/6 rows — `unaccountedMs + accountedMs === windowMs`:**
104.5 + 890.6 = 995.1; 59.9 + 2 271.1 = 2 331; 43.1 + 43.3 = 86.4; 41.4 + 40.6 = 82;
116.8 + 947.8 = 1 064.6; 62.7 + 2 275.5 = 2 338.2. **The three test reds are GREEN**
(`RULE-2`/`FIX-TP1`/`FIX-TP3`), the two M1-M3 files read **34/34**, and the O-0 suites read
**114/114 unmodified**.

**The trio + the register (the run's own reading).** `npm test` = **219 files passed (219) /
4 947 passed / 58 skipped / 0 failed (5 005 total), exit 0**; `npm run typecheck` 0;
`npm run build` 0. Register: the M1-M3 **6 rows all `held`** (360-attempt budget) plus the
pre-existing O-0 **8 rows `held`**.

**The identity, the band and the carried items — stated so nothing is over-read.**
The window bound is CLEAN (worst arm-window overshoot **+0.1 ms** against the recorded 40 ms
window-bound band, `outsideMs` 0, `outsideOffenders[]` empty). Inertness `inert:true` in BOTH
legs (Δmutations 0 = 37 vs 37, the MUTATION-HALF sentence verbatim, the long-task half VACUOUS
at 0-vs-0 with `nonVacuous:false`). GPU Δ **+59 / +13 ms** with identical mutation counts — **no
separable effect** (the fourth run's −53 / +15 reading stands as provenance only). **A-4 reads
1 / 2** (folder disclosure 76.6 / 90.3 ms; document open 173.9 / 165.3 ms). O-4 unchanged in
substance: `traversal.build` is **68.891 % / 69.231 %** of the folder window (the largest
identified stage) and `reconcile.apply` is **94.103 % / 94.337 %** of the document window.
**Carried (NOT defects of this run):** (1) the union remainder still exceeds the 50 ms band on
**4/6 rows** (104.5 / 59.9 / 116.8 / 62.7 ms) — a **reported quality finding + row note, never a
gate**, with **RUL-11's band RE-DERIVATION still owed as a spec item** (its home: the OWED list
in `docs/next-steps.md` NEXT QUEUE + `docs/defects.md`); (2) `snapshot.clone` stays structurally
unseparated (DEC-1; the transport is a separate PARKED unit); (3) the attribution rule's
DISCRIMINATION is not claimable from this corpus (`overlapAnyMs = intersectionMs = includedMs`
on all six rows, no observed task straddles either endpoint — the discrimination stays
`P-TP-3`'s generated-list job); (4) one geometry fact: on the document rows the passes' windows
do not tile the freeze window (GPU-OFF pass 1 ends 12067.3 / pass 2 opens 12072.1 = a **4.8 ms**
inter-pass gap; GPU-ON 12048.1 → 12048.6 = **0.5 ms**) — idle time inside the freeze window
that legitimately lands in `unaccountedMs` and is NOT tabulated by the artifact (a derived
reading from the embedded JSON, not a measured field; **the brief's "103.8 ms" could not be
reproduced at either leg**).

**THE DEC-1 CAVEAT IS RESOLVED (record it explicitly).** The **ACCEPTED evidence under DEC-1 is
now the SIXTH edition** (`status:"OPEN-structural"` / `pass:false` / `selfValidation.ok:true` /
`errors:[]` / `gatingReasons:[]`, window bound clean, structural reasons verbatim, the mandatory
top-level `reconciliation.note` PRESENT) — i.e. **the accepted form IS reproduced by the
committed artifact again.** The fifth edition's FAIL record is **not** deleted: it is preserved
**inside the artifact's own supersession record and its git history as history** (its row in
the §13 provenance table stays, marked SUPERSEDED), and no part of the fix hides or relabels it.
**DEC-1's CONTENT IS UNCHANGED** — the accepted structural set, the AMENDED gate clause, the
visibility invariant and the "no residual may be quoted as a style cost" rule are all
untouched; the decision row carries only the two **provenance** clauses (the fifth-run caution
and now its resolution) appended in `docs/decisions.md`. **The O-5 delegation gate is UNBLOCKED
on the SIXTH-edition form** (DEC-1 clause 3). The unit `O0-M1-M3-MEASUREMENT-SHAPE` is **DONE
(2026-09-21)** and the defect rows `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` and
`O0-BAND-EXCEEDED-GATES-THE-REPORT` are **FIXED (2026-09-21)**.

**Layer (RCA-12, mandatory).** **`assembled-renderer` MEASUREMENT:** every number above comes
from the executing `dist/` bundle driving real hit-tested CDP gestures against a real Electron
renderer, never from node and never from a module in isolation; the node-side re-derivations in
the artifact's §8/§9 are ORACLE re-runs over the embedded JSON, not app evidence. **A green here
is a measurement-shape green, never app-green**, and no part of this record may be read as a
claim about app behavior.

**Open / owed after this run (explicitly NOT closed).**
- **RUL-11's second half — the band for the NEW union-remainder quantity must be re-derived
  empirically before any band-driven gate is re-pinned** (the sixth run does NOT re-pin it; the
  over-band case is a reported finding). OWED as a spec item; home: `docs/next-steps.md` NEXT
  QUEUE (the OWED list) + `docs/defects.md` (`O0-BAND-EXCEEDED-GATES-THE-REPORT` FIXED, this
  being its remaining half).
- **The unit spec's §7 `§3a`/`§3b` structured adversarial pass — `RAN 2026-09-21` (SUPERSEDED
  as OWED, kept as the pre-pass state):** the RCA-3 pass over the three units landed in this goal
  found **4 MUST-FIX + 5 SHOULD** and **RE-OPENED the unit** — the record is
  `docs/specs/unit-o0-m1-m3-measurement-shape.md` **§13** (per-finding counterexamples +
  dispositions: the asserted-not-derived row verdict, the demoted aggregation identity = the `M1`
  symptom oracle, the trusted attribution fields, the text-probe live gate, and the SHOULDs incl.
  the mandatory-note dodge and the `hook.reconcileToleranceMs` band drift) with the re-opened
  statuses in `docs/defects.md` (the parent row `FIXED → OPEN` + 8 new rows) and the corrected
  **O-5** condition in `docs/next-steps.md` ("unblocked ONCE the shape-oracle MUST-FIX set
  lands"). The pre-pass record (this bullet as originally written) is
  `archive/reviews/2026-09-21-unit-o0-m1-m3-doc-review.md` §3.
- **The main-side `snapshot.clone` transport** remains a SEPARATE PARKED unit (DEC-1 clause 5;
  `docs/pending.md`).
- **No app behavior changed** and **no page-design artifact is owed**
  (`docs/skills/designing-pages.md` does not exist in this tree).
- **The F21 clause field-name coupling** noted in §12.14 (8) is unchanged and still inert on
  real artifacts (the sixth run carries the MUTATION-HALF sentence in both legs).

**Unit record:** this §12.16 + `docs/specs/unit-o0-m1-m3-measurement-shape.md` **§12.9/§12.10/
§12.11** (the full sixth-run record) + **§13** (the 2026-09-21 RCA-3 adversarial pass: 4 MUST-FIX +
5 SHOULD, the unit **RE-OPENED**, the live-evidence DOWNGRADE, the ordered next cycle) + the artifact (`docs/specs/unit-o-0-per-stage-breakdown.md`, SIXTH
edition: banner, §7.1, §8.1-§8.7, §9, §10, §11, §12.1/§12.2, §12.3, §13) + `docs/defects.md`
(both rows FIXED — **SUPERSEDED: the parent row `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` is OPEN
again since the RCA-3 pass, and the SEVENTH run FAILED — see §12.17**) + `docs/decisions.md` (DEC-1 provenance) + `docs/next-steps.md` (the DONE row
+ the renumbered queue) + `archive/reviews/2026-09-21-unit-o0-m1-m3-doc-review.md`.

### 12.17 THE SEVENTH LIVE RUN (2026-09-21) — a `FAIL` on `F7-1` (a harness ORDERING defect); the artifact is the SEVENTH edition; the accepted form is currently reproduced by the SIXTH edition ONLY

**What ran.** The **seventh live run**, on the `O0-M1-M3-MEASUREMENT-SHAPE` harness **AFTER the
RCA-3 ADVERSARIAL FIX SET** (spec `docs/specs/unit-o0-m1-m3-measurement-shape.md` §13.1 (1)-(3) +
§13.2 (5)(7)(8): the DERIVED row verdict, the FORCING per-id aggregation identity, the re-derived
attribution, the note clause gated on the DERIVED status, the recorded per-row band + the
re-labelled `tolerance.source`, the validator clauses and the removed `passIndex` imputation) — the
run the unit spec's §13.4 ordered cycle demanded. The harness + `src/shared/o0-report.ts` changed,
so the artifact was REGENERATED (RCA-11): `docs/specs/unit-o-0-per-stage-breakdown.md` is now the
**SEVENTH edition**, whose **STATUS banner names runs 1-6 SUPERSEDED** and whose §12 embeds the raw
JSON of **both legs verbatim** (byte-exact round-trip re-verified). Bundle identity: renderer
`1789974813483+678367+3e3f1b80` / `1789974856794+678367+3e3f1b80`; main
`1789974813369+2419628+1e652667` / `1789974856683+2419628+1e652667`; `driver.build.verified:true`
on BOTH legs, `driver.runMode:"spawn"` on both, `DISPLAY=:0`, census **226 = 226** (6 102 nodes /
9 266 edges), `env.engine:"absent"`. **The recorded identity hash CHANGED from the sixth run while
the byte COUNTS stayed `678367` / `2419628`** — the adversarial fixes landed in the **INLINED**
`src/shared/o0-report.ts` (plus the harness) and shifted the bundle's content without changing its
length: **this run measured DIFFERENT BYTES**, which is the scope RCA-11's invalidations cover.
**The canonical, binding record (the FAIL, `F7-1`, the positive row/pass-oracle closures, the two
strict-check OWED items, the live-pin edition item and the ordered next cycle) is
`docs/specs/unit-o0-m1-m3-measurement-shape.md` §14.**

**The outcome — the accepted form was NOT reached.** **BOTH legs: `status:"FAIL"`, `pass:false`,
`driver.selfValidation.ok:false` with `errors` 1 and `gatingReasons` 1** — **`OPEN-structural` was
NOT reached.** The ONE forcing reason, identical on both legs and verbatim: `report status is
"OPEN-structural" without a reconciliation.note naming the structural stages, the non-computable
residual and the no-imputation statement (§3.6b RUL-4 clause 5/§13.2 (5): the note clause is gated
on the DERIVED status, so it cannot be dodged by omitting status)`. **The structural facts are
UNCHANGED from runs 1-6** (`structuralErrors` 0, `structuralFacts` **4 / 2**, `snapshot.clone` the
one `structural:true` id with the RUL-3 reason verbatim, `post.style` `derived`/`ms:null`/
`unseparated`/`attributable:false`, no report relabelled `"OK"`).

**The class: `F7-1` — a NEW HARNESS ORDERING DEFECT, NOT a structural change and NOT a measurement
defect.** `o0BuildReport` calls `validateO0Report(report)` (`scripts/live-drive.mjs:~2087`, cited
by symbol) **BEFORE** it attaches `report.reconciliation.note` (`~:2177`); the note clause
(`src/shared/o0-report.ts:1482-1491`) is — correctly, per the `§13.2 (5)` anti-dodge fix — **gated
on the status the recorded reasons DERIVE**, which at that moment is already `OPEN-structural`, so
a note that does not exist yet is read as absent and the clause mints its own forcing reason, which
the driver then re-derives into `FAIL`. **The clause is correct; the driver's ORDER makes the
accepted form unsatisfiable by construction.** The fix is one-line-class (attach the reconciliation
block or a provisional note BEFORE validating, or validate after it is attached) — **defect row
`docs/defects.md` `O0-REPORT-VALIDATED-BEFORE-THE-NOTE-ATTACH` (high)**.

**What the seventh run PROVED (record as POSITIVE — this was the unit's purpose).** The **row- and
pass-level oracle is SOUND**: the artifact's §8 per-row oracle re-validation (executed over both
legs' embedded JSON, per row, with the PURE module) reads **6/6 rows of both legs**
`partitionO0RowPasses(row).row.pass ⇔ failReasons.length === 0` ✓, **every pass sub-row**
`pass ⇔ failReasons.length === 0` ✓, `validateO0MeasurementShape(row).ok:true` / `errors:[]` /
`legacyShape:false` ✓; the **per-id aggregation identity holds on all 9 finite ids** (e.g. the
folder row's `traversal.build` **618.3 = Σ passes 618.3**; the document row's `reconcile.apply`
**2146.5** and `render.ssr` **1801.9**); the **re-derived attribution equals the recorded one**
(`startBeforeOverlapMs` / `straddleEndMs` re-derived = recorded = **0** ⇒ the recorded values never
understate); the declared `unaccountedMs` **= window − accounted on 6/6** (108.8 / 59.7 / 38.0 /
39.6 ms GPU-OFF; 114.4 / 57.1 ms GPU-ON); and **the outcome channel is separate** (no outcome
reason in `failReasons`). Also clean on this emission: census **226/226**; `driver.build.verified:true`;
the window bound CLEAN (`outsideMs` **0 on 6/6**, window-bound band **40**); the per-row union band
`reconciliation.toleranceMs = 50` on all 6; `bandExceeded` **4/6** with **`bandExceededGate:false`**;
inertness **Δmutations 0** (the mutation-half carries the proof; the long-task half vacuous and
labelled); `tolerance.source` re-labelled to name the compile-time constant
`O0_RECONCILE_TOLERANCE_MS` + the owed empirical re-derivation (**no value drift**); **A-4 reads 1**
(93.3 ms) / **2** (175.7 ms); and the **O-4 discrimination** — the folder row is
`traversal.build`-bound (**66.41 %** GPU-OFF / **70.14 %** GPU-ON) while the document row is
`reconcile.apply`-bound (**94.39 %** / **94.03 %**). **The FAIL is report-level ONLY.**

**THE ARTIFACT STATUS (record it verbatim — the honest current state).** The **committed artifact
is the SEVENTH edition and it reports `FAIL` on both legs**; therefore **the DEC-1-accepted form is
currently reproduced by the SIXTH edition ONLY** (its raw JSON is recoverable from git history; its
record is §12.16 above, renderer `1789972671852+678367+3e3f1b80` / `1789972750760+678367+3e3f1b80`).
**DEC-1's acceptance ruling and content are UNCHANGED and not relabelled** — the seventh edition is
simply not the accepted evidence, and **its `status:"FAIL"` does NOT open the O-5 gate** (the gate
reads the artifact's accepted live form). This is the same *class* of caution as §12.15's
fifth-run caution, with a different cause: there, a legitimate measurement outcome was propagated
as a failure (`F5-1`); here, **a correct gate clause is unsatisfiable in the driver's call order**.

**Owed after this run (explicitly NOT closed).**
- **`F7-1` (unit spec §14.2) + two STRICT-CHECK items in `validateO0Report` (§14.4):** (a) the
  declared-vs-derived `unaccountedMs` clause (`src/shared/o0-report.ts:~3203-3215`) must be
  **STRICT/SYMMETRIC** (`!agrees(...)` within the 0.1 ms recorded granularity whenever
  `agrees(recon.windowMs, derivedRow.windowMs)`) instead of firing only on an understatement;
  (b) the `windowMs` clause (`~:3193-3198`) must be **STRICT** for a new-shape row whose records
  inhabit their window, instead of firing only when the declared window EXCEEDS the derived one.
- **A TEST item: the live-pin EDITION PROBE (`F7-3`).** `LIVE-1` matches `/SIXTH|sixth edition/i`
  and passes by PROSE against the seventh edition; it must be repointed to the current edition.
  **`LIVE-2` (the per-row parse+validate pin) is the oracle the §13.1 (4) remand demanded and it
  WORKS** — it is GREEN on all six rows of both legs and RED on the leg triple this edition did not
  reach; the suite reads **`1 failed | 219 passed` files / `1 failed | 4 965 passed | 58 skipped`**
  and the ONE failure is that correct red, not a fixture incoherence.
- **THE EIGHTH RUN IS OWED** once `F7-1` and the two strict checks land (the driver + `src/`
  change ⇒ the prior live provenance is invalidated, RCA-11), followed by the §7 `§3b` re-audit and
  the mandatory documentation review. **O-5 leads the queue only after this closes** —
  `docs/next-steps.md` CURRENT WORK states it, and the item stays gated meanwhile.
- **RUL-11's second half stays OWED as a spec item** (the band for the NEW union-remainder
  quantity re-derived empirically before any band-driven gate is re-pinned; §12.16's carried item
  stands, and the seventh run does not re-pin it).
- **The main-side `snapshot.clone` transport** remains a SEPARATE PARKED unit (DEC-1 clause 5;
  `docs/pending.md`). **No app behavior changed** and **no page-design artifact is owed**
  (`docs/skills/designing-pages.md` does not exist in this tree).

**What this does to the records above.** §12.16's DONE-state sentences (DEC-1 caveat resolved; "the
accepted form IS reproduced by the committed artifact again"; "the unit `O0-M1-M3-MEASUREMENT-SHAPE`
is DONE"; "both rows FIXED") are **HISTORY** — superseded as STATUS by the RCA-3 re-opening (§13 of
the unit spec) and then by this FAIL; **the sixth-run VALUES and the SIXTH edition's accepted form
stand unchanged**. §12.15's fifth-run caution is likewise history. **Read §12.17 + the unit spec §14
for the current state.**

**Layer (RCA-12, mandatory).** **`assembled-renderer` MEASUREMENT:** every number above comes from
the executing `dist/` bundle driving real hit-tested CDP gestures against a real Electron renderer;
the node-side re-derivations in the artifact's §8/§9 are ORACLE re-runs over the embedded JSON, not
app evidence. **A green here is a measurement-shape green, never app-green**, and no part of this
record may be read as a claim about app behavior.

**Unit record:** this §12.17 + `docs/specs/unit-o0-m1-m3-measurement-shape.md` **§14** (the
canonical seventh-run record: `F7-1`, the closures, the two strict checks, the edition probe, the
eighth-run requirement) + **§13** (the RCA-3 adversarial pass that re-opened the unit) + the
artifact (`docs/specs/unit-o-0-per-stage-breakdown.md`, **SEVENTH edition**: banner, §7-§11, §12.1/
§12.2, §13) + `docs/defects.md` (`O0-REPORT-VALIDATED-BEFORE-THE-NOTE-ATTACH` — **FIXED
2026-09-21** (the eighth run carried the repair, the ninth verifies it); the parent M1-M3 row
**FIXED (2026-09-21)**, the seventh-run note kept as history) + `docs/decisions.md` (DEC-1
provenance) +
`docs/next-steps.md` (the CURRENT WORK head + the ordered cycle). **SUPERSEDED AS STATUS by
§12.18 below** (the ninth run): this section's "the committed artifact is the SEVENTH edition and
it reports `FAIL`" and "the accepted form is reproduced by the SIXTH edition ONLY" readings are
history — the committed artifact is the **NINTH** edition and it reproduces the accepted form.

---

## 12.18 THE NINTH RUN (2026-09-21) — the DEC-1-ACCEPTED form on the §3b-RE-AUDITED oracle, the artifact is the NINTH edition, and DEC-1's accepted form IS reproduced by it

**Status of this section: CURRENT — the seventh-run caution/owed list above is HISTORY, resolved
by the eighth and ninth runs.** The canonical, binding record is
`docs/specs/unit-o0-m1-m3-measurement-shape.md` **§15** (the full ninth-run record: commands,
bundle + oracle identity, census, the per-stage/per-pass/reconciliation tables, the controls, the
two self-validation triples, the per-row re-validation incl. the four NEW §3b clauses, the window
bound, the O-0 numbers, the vs-run-8 table, the findings) with **§13.6** (the per-finding LANDED
table) and **§13.7** (the OWED list); the artifact is
`docs/specs/unit-o-0-per-stage-breakdown.md` in its **NINTH edition**; the review record is
`archive/reviews/2026-09-21-unit-o0-m1-m3-reaudit-doc-review.md`.

**The outcome — the accepted form WAS reached on both legs.** **BOTH legs: `status:"OPEN-structural"`,
`pass:false`, `driver.selfValidation.ok:true`, `driver.selfValidationOfEmitted.ok:true` (NEW — the
emitted object re-validated over a shallow copy after the finalize), `errors:[]`,
`gatingReasons:[]`** — i.e. exactly the DEC-1-accepted structural form, with `structuralFacts`
**4 / 2**, `snapshot.clone` the one `structural:true` id (the RUL-3 reason verbatim), `post.style`
`derived`/`ms:null`/`unseparated`/`attributable:false`, the mandatory top-level
`reconciliation.note` present in the OPEN-structural form (it names the structural stages, the
non-computable residual and the no-imputation statement), **no harness defect hit by this run**
(both legs completed on the FIRST attempt; the `F7-1` ordering defect stays CLOSED and the eighth
run's `F8-1` fix held), and **no report relabelled `"OK"`**.

**THE ARTIFACT IS THE NINTH EDITION — and it reproduces DEC-1's accepted form** (the sixth,
seventh and eighth editions' caveats are HISTORY): its banner reads "This is the **NINTH** live
run" and **runs 1-8 are SUPERSEDED** inside it; both legs' raw JSON are embedded **verbatim**
(byte-exact round-trip re-verified: GPU-OFF 164 414 bytes / `57a2ecfb508a4717`, GPU-ON 97 672 /
`2e0d839a4c1da603`); its §13.2 provenance table names every prior edition (first…eighth) with its
renderer identity and verdict, the FIFTH and SEVENTH marked **FAIL**, the eighth marked
"`OPEN-structural` … **oracle identity NOT recorded**", and the **ninth marked CURRENT**. **The
prior editions' raw JSON remain recoverable from git history** and the earlier cautions recorded
in §12.14/§12.15/§12.16/§12.17 stand as their history, never as the current state.

**THE ORACLE IDENTITY IS NOW RECORDED (the §3b re-audit's provenance gap — closed live).**
`driver.build.verified` is evidence about the MEASURED app, never about the code that minted the
verdicts (the driver imports `src/shared/o0-report.ts` **from source**), so the legs now carry
`driver.oracleIdentity`: `src/shared/o0-report.ts` `b89d6f19` (200 143 B) +
`scripts/live-drive.mjs` `194dfece` (395 314 B) = **`92a74b7d`, IDENTICAL on both legs**. **The
ninth edition therefore differs from the eighth in the ORACLE, not in the bundle bytes** (content
hash `3e3f1b80` / `1e652667`, UNCHANGED from runs 5-8 — only the `mtimeMs` prefix moves, because
each leg's spawn rebuilds `dist/`). This **CORRECTS §14.6's "different bytes" claim** (the unit
spec §13.7 (5) records the correction).

**THE §3b CLAUSES WERE EXERCISED LIVE FOR THE FIRST TIME (the closure evidence):** per-row
`row.pass ⇔ failReasons.length === 0` **both directions 6/6** (and on every pass sub-row);
`validateO0MeasurementShape.ok:true` / `errors:[]` / `legacyShape:false` **6/6** with
**`legacyShape` AGREEING across both surfaces 6/6**; the per-id aggregation identity on **all 9
finite ids**; declared ≡ derived (**0.1 ms**) for window/accounted/unaccounted; the row `stages[]`
closed-11 / finite / `ms:null ⇔ unseparated` checks **6/6**; **per-pass re-derivation drift 0 on
14/14 passes**; `records.indices` strictly increasing, disjoint, union `0..n-1` **6/6**; the
`null`-remainder-without-a-reason case absent; the `§14.4` (a)/(b) STRICT clauses live and SILENT;
the outcome channel SEPARATE (3 band-exceeded rows, `failReasons` empty 6/6,
`bandExceededGate:false`); the window bound CLEAN (`outsideMs` 0 on 6/6 against the **40 ms**
window-bound band, worst arm-window overshoot +0.1 ms); inertness **Δmutations 0** (the
mutation-half carries the proof, the long-task half VACUOUS and labelled).

**The O-0 numbers (unchanged in substance; the gate input):** the A-4 read count is **1** for the
folder-row disclosure (**85 ms** GPU-OFF / **88.9 ms** GPU-ON) and **2** for the document open
(**173.6 ms** / **175.3 ms**), cross-checked against each row's own `hook.stageRecordDetail` +
stage row (all six agree); the **O-4 discrimination holds** — the folder gesture is
`traversal.build`-bound (**67.36 % / 68.98 %** of its long-task window) while the document gesture
is `reconcile.apply`-bound (**94.38 % / 93.88 %**), i.e. two gestures with DIFFERENT dominant
stages — so **O-4 stays CONDITIONAL on the disclosure-only trigger**; the census is **226 = 226**
(6 102 nodes / 9 266 edges, provenance only).

**The counts and the register (the run pass's own reading, artifact §1):** `npx vitest run` =
**221 files passed (221) / 4 988 passed / 58 skipped / 0 failed, exit 0**; `npm run typecheck` 0;
`npm run build` 0. The **O-0 suites read 114/114 UNMODIFIED** (report-contract 50 +
hook-contract 39 + driver-contract 25) and the register lands **6 rows (360) + 4 EXTENDED rows
(32) = 392 ≤ 400**. **Two test-side repoints were applied in the same pass** (the `RA-2c`
fixture's duplicate id and the live-pin edition probe EIGHTH→NINTH — the FOURTH consecutive
regeneration owing that repoint; the general form is its fix) — recorded in the unit spec §15.11.

**Owed after this run (explicitly NOT closed; each with an owner — the canonical list is the unit
spec §13.7).** (1) the `F7-1`-class **note-branch vs final-status semantics** (SPEC+HOST); (2) the
**unarmed `0/0` baseline unreachable live** — `S3`/`P-SM-1` restated node-only or given readings
(TEST/SPEC); (3) **four missing named reds** (TEST); (4) the **edition-probe general form**
(TEST); (5) **RUL-11's empirical band re-derivation** for `unaccountedMs` (SPEC — the over-band
remainder stays a reported finding + row note, never a gate); (6) the **`hook.reconcileToleranceMs`
field-name residue** (HOST); (7) the Unit-1 `O0-CONFIG-CEILING-AND-IMPORTER-UNPINNED`
pin-coverage gap (TEST, tracked in `docs/defects.md`); and (8) the **main-side `snapshot.clone`
transport** as a SEPARATE PARKED unit (DEC-1 clause 5; `docs/pending.md`).

**THE O-5 GATE IS UNBLOCKED.** DEC-1's clause reads the artifact's accepted LIVE form; the ninth
edition carries it **and the oracle that certifies it is now named and was sound** (`92a74b7d`,
with the §3b clauses exercised live), so the reviewer's condition ("fix items 1-4 then re-run") is
satisfied and **O-5 leads the queue** (`docs/next-steps.md`; `docs/decisions.md` DEC-1's appended
provenance clause). **This SUPERSEDES the earlier gate wordings** — the RCA-3 correction
("unblocked once the shape-oracle MUST-FIX set lands"), the seventh-run correction ("gated on
`F7-1` + the two strict checks + the EIGHTH run") and the §12.16 sentence "the O-5 gate is
unblocked on the SIXTH-edition form" all described pre-ninth-run states. **DEC-1's content is
UNCHANGED and not relabelled.**

**Layer (RCA-12, mandatory).** **`assembled-renderer` MEASUREMENT:** every number above comes from
the executing `dist/` bundle driving real hit-tested CDP gestures against a real Electron
renderer, under a RECORDED oracle; the node-side re-derivations in the artifact's §8/§9 are ORACLE
re-runs over the embedded JSON, not app evidence. **A green here is a measurement-shape green,
never app-green**, and no part of this record may be read as a claim about app behavior.

**Unit record:** this §12.18 + `docs/specs/unit-o0-m1-m3-measurement-shape.md` **§15** (canonical)
+ **§13.6/§13.7** + the artifact (`docs/specs/unit-o-0-per-stage-breakdown.md`, **NINTH edition**:
banner, §1-§11, §12.1/§12.2, §12.3, §13) + `docs/defects.md` (the parent M1-M3 row FIXED with the
NINTH-run closure note; `O0-REPORT-VALIDATED-BEFORE-THE-NOTE-ATTACH` FIXED; the §13-findings rows
FIXED) + `docs/decisions.md` (DEC-1 provenance) + `docs/next-steps.md` (the DONE row + the queue
leading with O-5).

