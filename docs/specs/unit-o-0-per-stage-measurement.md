# Unit O-0 — Per-stage freeze measurement (PRECONDITION ARTIFACT) — Spec

**Status:** **OPEN — the live battery RAN and FAILED; this is the SPEC RE-DERIVATION the
next red→green cycle and the live re-run must follow (2026-09-17).** The spec LANDED and the
harness LANDED (the 5 `o0_*` blocks + the §3.6 hook + the pure report module; red→green + trio
history in §11). The committed artifact **now exists** —
`docs/specs/unit-o-0-per-stage-breakdown.md`, written by the live pass — and it is
**SUPERSEDED-PENDING-FIX**: 6 of the 11 stages came back `unseparated` (stages 1-3
structurally, §12 H2), one measured stage exceeded its own freeze window (§12 H3), and the
adversarial pass found 4 MUST-FIX host defects (§7). **The unit is NOT DONE.** The remaining
cycle: **spec → red re-pins → host fixes → live re-run on the fixed bundle → doc-review.**
The full record is **§12**; the re-derived measurement rules are §2.2 (the stage set and its
seams), §3.4 (the corpus pin), §3.6b (the seam re-derivation), §4.3/§4.4 (finiteness,
window-bound, the structural marker), §5 (`P-TP-3`), §6 (S14-S17 / F13-F17) and §7 (the
adversarial record).

**Re-scoped per `docs/specs/gnosis-offload-review.md` §7 A-1 (`:400-402`):** O-0 is a
**PRECONDITION ARTIFACT, not a unit.** It is a **harness deliverable with a contract
on the REPORT SHAPE**, never on app behavior (`gnosis-offload-review.md:101-110`).
There is no red set to run and no user-visible end state to pin — the gate's
requirement is that the report be **falsifiable and non-imputable**.

**Layer (RCA-12, mandatory declaration — `gnosis-offload-review.md:90`, checklist
item 3 `:309`):** **`assembled-renderer`** — by construction. O-0 measures the
**executing `dist/` bundle driving a real CDP gesture against a real Electron
renderer** (`scripts/live-drive.mjs`'s `CDP` class, `live-drive.mjs:63-124`). This is
precisely the layer the node suite cannot see (`docs/specs/rca-live-bugs-green-pipeline.md`
§5 CA-2 `:126`, RCA-12 `AGENTS.md` item 12). An envelope-green or a node-green is
**not** O-0 evidence.

**Delivered by:** new `scripts/live-drive.mjs` blocks (§3) **plus a COMMITTED
artifact** (§4) — both now LANDED (§11) — **plus the measurement-only hook of §3.6,
which is IMPLEMENTED** (`src/shared/o0-hook.ts`, NEW; the five wrap-only call sites;
the guarded `window.__o0recorder` handle). **No `src/` behavior change:** the hook is
falsifiable and is inert when unarmed (no control-flow change, no reordering, no added
work — §3.6, §5 P-HK-1). **The re-derivation of §3.6b ADDS three caller-level/main-side
seams** (the H2 fix) — same discipline, still measurement-only, still inert when unarmed.

**Dependency (hard):** **no other unit — O-5, O-9(+O-3), O-10, O-1, O-2, O-4 — may be
delegated before this artifact exists** (`gnosis-offload-review.md:70-71` "a hard
precondition, not a unit"; `:365-366` "No unit lands before O-0's artifact and O-5's
budget row exist"; proposal §3.2 `:172-175`). The landing order is
**O-0 → O-5 → O-9(+O-3) → O-10 → O-1 → O-2** (`gnosis-offload-review.md:363`), each a
single-diff revert.

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
| Real doc-nav **document-row** click (open a document) | page unresponsive **~1 011 ms**; `PerformanceObserver` long tasks `[439, 439]` | `docs/defects.md:22`; proposal `:22`; `docs/next-steps.md:30` |
| Real doc-nav **folder-row** click (pure disclosure) | **505 ms** long task, **39** DOM mutations, to reveal two rows | `docs/defects.md:22`; proposal `:23`; `docs/defects.md:48` (the generalized `PANE-SLOT-INSTABILITY-ON-DISCLOSURE` row) |
| Pane collapse / zone minimize (a class flip) | **2 556** DOM mutations, long tasks `[465, 52]`, gesture 2.5–2.9 s; `Profiler` self-time `translateNodeData` **13 ms**, `renderTree` **8 ms**, `enumPathWalks` **8 ms** | `docs/defects.md:36` (`PANE-TOGGLE-FULL-REASSEMBLY`, which records "`Profiler` self-time shows the JS is small (`translateNodeData` 13ms, `renderTree` 8ms, `enumPathWalks` 8ms)"); `docs/next-steps.md:24` (≈29 ms of ≈517 ms) |
| **Idle** window-resize round-trip (the control) | **6 ms** | `docs/defects.md:22`; proposal `:25` |
| The stage grid track | `#wiki-root` computed `grid-template-rows: 0px 12698.7px 0px`, `grid-template-columns: 220px 1583.91px 0px` | `docs/defects.md:23`; proposal `:50` (`A14`) |
| Every live run so far used `--no-gpu` | the GPU leg is **unmeasured** (listed as explicitly open in `A14`) | proposal `:49-53`; `scripts/live-drive.mjs:2676` (the hard-coded `--no-gpu`) |

**The honest position this spec encodes:** the dominant cost is asserted to be DOM
style/layout/paint (`docs/defects.md:36`, `:46`) — but the per-pass split has **never
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
class of observation the motivating evidence used (`docs/defects.md:22`, `:36`), so
the O-0 numbers are comparable to it.

Alongside it, every block records:
- the **DOM mutation count** in the window (`MutationObserver` on `document.body`
  with `childList`+`subtree`+`attributes`+`characterData` — the `:36` method), and
- the **wall time** from the gesture dispatch to the first responsive
  `requestAnimationFrame` probe.

### 2.2 The stage set (CLOSED — 11 ids)

The stage ids are **closed** and are the report's stable join key. Every stage id is
present in **every** freeze row; a stage that cannot be separated is emitted with
`unseparated: true` and `ms: null` — **never imputed, never omitted** (§5, F4).

| # | Stage id | What it is | Boundary / evidence source | Layer of the work |
| --- | --- | --- | --- | --- |
| 1 | `snapshot.pull` | the whole-store `IPC_RAG_SNAPSHOT` pull — the SHELL'S OWN CALL SITE → IPC → main handler (`listNodes()`/`listEdges()`) + structured clone → renderer promise resolution (the whole ROUND TRIP, **end-to-end at the caller**) | `snapshot.roundtrip` — the `record()` wrap of the `await this.bridge.rag.snapshot()` call site in `src/renderer/sidebar-panes.ts` (declaration symbol `loadEnvelopeCore`; today at `:2003`, with the second pre-existing call site at `:1883`); main handler `IPC_RAG_SNAPSHOT` in `src/main/main.ts` (`:751` today); payload shape `src/shared/types.ts:481-502` | **renderer caller + IPC + main** |
| 2 | `snapshot.clone` | the **structured-clone / serialization cost (plus the store read) on the MAIN side alone** — isolated from the renderer's round trip and from the IPC queue | `snapshot.clone` — the `record()` wrap *inside* the `IPC_RAG_SNAPSHOT` handler (`src/main/main.ts:751-755`), armed by the MAIN-side recorder instance (§3.6); **stays `unseparated` if that instance cannot be armed** | main + IPC |
| 3 | `docheads.pull` | the doc-heads payload fetch that rides the same path and aborts the re-derive on failure — the same CALLER-level round trip | `docheads.roundtrip` — the `record()` wrap of the `await this.bridge.rag.docHeads()` call site in `src/renderer/sidebar-panes.ts` (inside `:2003-2009`'s re-derive body; today at `:2013`, with the second pre-existing call site at `:1894`); `IPC_RAG_DOC_HEADS` `src/main/main.ts:627`; payload `RagDocHeadsPayload` `src/shared/types.ts:612-627` | **renderer caller + IPC + main** |
| 4 | `traversal.build` | `buildTraversal` — the derivation walk | `src/main/traversal.ts:326` (`export function buildTraversal(input: TraversalInput): TraversalResult`; the §3.6 wrap at `:331`) | renderer (in-process) |
| 5 | `envelope.assemble` | `assembleAppGraphEnvelope` — the pane-inclusive assembly | `src/renderer/pane-graph.ts:330` (`AppGraphAssemblyInput → AppGraphAssemblyResult`; the §3.6 wrap at `:335`) | renderer |
| 6 | `shared.decorate` | the C20 cross-document-shared pass | `src/renderer/sidebar-panes.ts:1493` (`private decorateShared(envelope)`; called at `:1520`, `:1576`, `:1655`, `:2499`; the §3.6 wrap at `:1499`) | renderer |
| 7 | `reconcile.roots` | `reconcileDocumentRoots` — the sole classifier | `src/renderer/content-reconcile.ts:422` (`NRootReconcileInput → NRootReconcileResult`; the §3.6 wrap at `:427`) | renderer |
| 8 | `reconcile.apply` | `Runtime.applyContentReconcile` — destroy/attach/replace of the classified roots | `src/renderer/runtime.ts:491` (`ApplyReconcileInput → ApplyReconcileReport`; the §3.6 wrap at `:497`) | renderer |
| 9 | `render.dom` | `render()` — the DOM emit (`compilePath` + `renderProducingProcess` on the `DomAdapter`) | `src/renderer/runtime.ts:253-298` (the emit at `:290`) | **assembled-renderer** |
| 10 | `render.ssr` | the SSR mirror emit (`SSRFragmentAdapter`, `renderProducingProcess` second pass) | `src/renderer/runtime.ts:143` + `:295`; `ssrHtml()` at `:1421` | renderer |
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
(13 + 8 + 8 ms — `docs/defects.md:36`) already exist and are **smaller than the
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
   `v3_docnav` block probes at `live-drive.mjs:1056-1058`). **Row selection is pinned:**
   the block enumerates every `[data-folder-path]` row, picks the one with the largest
   child-row count (ties broken by lexicographic `data-folder-path` ascending — the
   `o0-2026-09-17` seed), and **records the chosen path** in the row
   (`target` + a `folderPath` field). A first-match pick would under-measure the
   operator corpus and make the artifact irreproducible, so the choice is pinned.
   The stage-1 evidence for this gesture is the **A-4 discriminator**: the report must
   state, per freeze, the **`snapshot.pull` count and ms for the folder gesture**
   (`0` / `null`, or a non-zero read). **Today's code always reads**
   (`sidebar-panes.ts:1995` is on the unconditional path); a report whose folder row
   shows a store read is the recorded proof of the A-4 finding, not a block failure.
2. **Document row** — a real doc-nav document row that focuses that document (the
   `U-1` / `uf_panes_12` gesture class, `live-drive.mjs:484`).

Both gestures must be **hit-tested** (`path === 'cdp'`); a `native-fallback`,
`missing`, `zero-box` or `off-viewport` path forces `pass:false` (§5 P-TP-2, §6 F7).

### 2.4 Controls and ablation (mandatory)

- **GPU-on vs GPU-off.** Every O-0 run records the **GPU flag actually used** and the
  report must carry **both legs** for at least the two gesture blocks. Today the
  driver **hard-codes `--no-gpu`** in its launch args (`live-drive.mjs:2676`), so the
  GPU-on leg is **not reproducible with the current driver**: the implementer adds a
  `--gpu` flag that makes the launch args conditional (`--no-gpu` unless `--gpu` is
  passed; default unchanged = safe). The flag name, default and effect are pinned
  here so the artifact is reproducible.
- **The 12 698.7 px track ablation.** The stage track is `grid-template-rows: 0px
  12698.7px 0px` (`docs/defects.md:23`); the ablation sets the stage's grid cell to a
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

Every O-0 block returns **`diagResult(detail, extra)`** (`live-drive.mjs:398-412`) —
the driver's declared **non-row** shape for "measurement without a row verdict" —
with `extra` carrying the O-0 report fragment:

- `row: null`, `dclass: null`, `realInput: false`, `proxyPASS: false`, `pass: false`,
  `diagnostic: true` (from `diagResult`), and
- `extra.o0 = <the freeze row(s) of §4.3>`.

Three consequences, all deliberate:
1. **An O-0 block can never be promoted to a §5.U matrix verdict.** `MATRIX_ROWS` is
   the capped 8-row U-1..U-8 table (`live-drive.mjs:483-492`) and `reconcileMatrixRows`
   (`:510-545`) treats a reported `U-<n>` row as a matrix row — O-0 reports **no matrix
   row and no extended row** (`ROW_EXTENDED`, `:552-567`), so §5.U's cap of 8
   (`docs/specs/user-flow-audit.md:32`, `:94-103`) is untouched.
2. **`proxyPASS` stays `false`** because O-0's verdict is not a proxy for a
   user-visible end state — it is a measurement whose honesty rule is
   `unseparated:true` (§5). It therefore cannot manufacture a `proxyPASS` finding.
3. **A block that crashes is a loud FAIL**, not a silent skip: the driver's block loop
   prints `FAIL` and increments `fail` on a throw (`live-drive.mjs:2707-2715`) and sets
   a non-zero exit code (`:2746`).

### 3.3 Args and CLI (pinned)

Existing flags honored unchanged: `--mode=` / `--port=` / `--cdp-port=` / `--home=` /
`--seed=` / `--groups=` / `--block=` / `--display=` / `--no-seed` / `--keep-home` /
`--connect` (`live-drive.mjs:2643-2659`). New for O-0 (both minimal, both default-safe):

| Flag | Default | Effect |
| --- | --- | --- |
| `--gpu` | off | launch args carry `--no-gpu` **unless** `--gpu` is passed (`live-drive.mjs:2676` becomes conditional). Default behavior is unchanged. **In `--connect` mode the driver does not spawn** (`live-drive.mjs:2673-2674`), so the GPU-on leg is produced by running the operator's app **without** `--no-gpu` and attaching with `--connect`; the artifact records the app-side flag per leg. |
| `--o0-corpus=<n>` | none | the operator corpus census the artifact is claimed at; the block compares it against `rag.list_documents` and the snapshot census and forces `pass:false` on mismatch (§6 F8). |
| `--o0-out=<path>` | none | **REQUIRED for an O-0 artifact run.** Writes the emitted report JSON to `<path>` (the driver today only prints; the artifact needs a file). A run without `--o0-out` produces console output only and **cannot** produce the committed artifact — recorded as a fail-state in the artifact's own provenance (`artifactPath: null`). |

`--display` propagates through the spawn env (`live-drive.mjs:2679`,
`DISPLAY: ':' + (opt.display ?? '1')`); the repo's env note requires a delegated
live-runner to propagate the display (`docs/next-steps.md:67`).

### 3.4 Corpus (operator size; the determinism seed)

- **Size (THE PIN):** the **operator corpus — 226 documents** (`docs/defects.md:22`,
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
env note, `docs/next-steps.md:67`; the spawn sets it at `live-drive.mjs:2679`). A
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
side effect) + **five wrap-only call sites** + the guarded `window.__o0recorder` arm
target. The three binding constraints are unchanged:
(a) it is inert when unarmed and changes no control flow;
(b) it may only record `performance.mark`/`performance.measure` around the existing
call sites **without reordering, adding or removing work**;
(c) an armed hook that changes timing **is itself a falsifiable row** — now its own
register row **§5 P-HK-1** (split out of P-TP-1's "the hook is inert" clause) — and a
hook-induced change to the mutation count or the long-task total forces `pass:false`.

**The recorder (exact landed semantics).** `createO0HookRecorder({ stages?, perf? })`
(`src/shared/o0-hook.ts:136-211`) returns
`{ isArmed(), arm(stages?), disarm(), record<T>(stage, fn), records(), state(), reset() }`,
with:

- `O0_HOOK_STAGES` = the **five** render-path stages 4-8 in §2.2 order (`:27-33`);
  `O0_HOOK_MARK_PREFIX = 'o0:'` (`:36`); `O0_HOOK_STAGE_NOT_ALLOWED` (`:39`);
  `O0_HOOK_RECORD_INVALID` (`:42`); **`O0_HOOK_LONGTASK_TOLERANCE_MS = 40`** (`:45`) —
  the §3.6(c) band. It is **distinct** from `tolerance.reconcileMs`, the driver's
  residual band (`O0_RECONCILE_TOLERANCE_MS`, 50 ms).
- **Unarmed `record()` is `return fn()`** (`:178-182`): no mark, no measure, no
  record, no throw, no control-flow change.
- **Armed**, it brackets the EXISTING call: `mark('o0:<stage>:start')` → the call →
  `mark('o0:<stage>:end')` + `measure('o0:<stage>', start, end)`, committing the span
  (`ms`, rounded to µs-precision) on completion (`:183-193`). A **throw propagates
  untouched and commits nothing** — the hook never swallows or rewraps.
- An **off-set** stage (armed, but not in the armed set) is a pass-through counted in
  `state().dropped` (`:179-181`) — dropped, never measured.
- `arm()` on an already-armed recorder returns `false` and **never clears** the
  measurement window; `disarm()` on an unarmed recorder returns `false` — **double-arm
  / double-disarm are idempotent** and never double-count (`:157-172`).
- A stage id outside stages 4-8 **throws** `O0_HOOK_STAGE_NOT_ALLOWED` at construction
  AND at arm time (`:117-128`) — a mis-pinned stage is a loud config error, never a
  silently inert recorder.
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

**The five sealed call sites (file:line).** Each wraps the EXISTING body verbatim in
`getO0HookRecorder().record('<stage>', …)`; the body is moved unchanged and no work is
reordered, added or removed:

| Stage | Declaration | The `record()` wrap |
| --- | --- | --- |
| `traversal.build` | `src/main/traversal.ts:326` | `:331` |
| `envelope.assemble` | `src/renderer/pane-graph.ts:330` | `:335` |
| `shared.decorate` | `src/renderer/sidebar-panes.ts:1493` | `:1499` — its **4** call sites stay 4 (`:1520`, `:1576`, `:1655`, `:2499`); each call site is one recorded span, summed by the aggregation |
| `reconcile.roots` | `src/renderer/content-reconcile.ts:422` | `:427` |
| `reconcile.apply` | `src/renderer/runtime.ts:491` | `:497` — the `result/next` guard stays inside the recorded span |

**The arm target and `refused[]` (corrected contract — §3a finding 5 / §6 F15).** The renderer
publishes a **hardened projection** of the app-wide recorder as the guarded
**`window.__o0recorder`** (`src/renderer/runtime.ts`, published today at `:76`). The published
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
| `snapshot.roundtrip` → **`snapshot.pull`** | the RENDERER app-wide recorder (`getO0HookRecorder()`) | the `await this.bridge.rag.snapshot()` call in `src/renderer/sidebar-panes.ts`'s re-derive body (symbol `loadEnvelopeCore`; `:2003` today, second pre-existing site `:1883`) | the whole ROUND TRIP at the CALLER: call → IPC → main handler → store read → structured clone → promise resolution. **This is the A-4 discriminator's ms.** | `'hook'` | `'mark'` |
| `snapshot.clone` → **`snapshot.clone`** | the **MAIN-side** recorder instance (refinement) | the body of the `IPC_RAG_SNAPSHOT` handler in `src/main/main.ts` (`:751` today; `listNodes()`/`listEdges()` + the reply payload) | the MAIN-side share alone: store read + serialization into the IPC reply | `'hook'` | `'mark'` |
| `docheads.roundtrip` → **`docheads.pull`** | the RENDERER app-wide recorder | the `await this.bridge.rag.docHeads()` call in the same re-derive body (`:2013` today, second site `:1894`) | the same CALLER-level round trip on the doc-heads payload | `'hook'` | `'mark'` |

**The A-4 discriminator is answered at the CALLER level.** The report's read count/ms is the
count/ms of the shell's **own** `snapshot.roundtrip` records inside the freeze window — an
end-to-end observation that does not depend on any main-side seam. The main/renderer split
(`snapshot.clone`) is an **optional refinement**: it separates the round trip's *inside* (the
main handler) from its *outside* (IPC + queue + the renderer's await), and a run without it
still answers A-4 with a real number (and additionally reports `snapshot.clone` as
structurally unseparated, §6 S14).

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
given (§3.6's landed module, `src/shared/o0-hook.ts:231-273`); for the merged 11-row freeze
table it is called with the full `O0_STAGE_IDS` list, exactly as `tests/unit-o-0-hook-contract.test.ts`
H9's explicit-id-list row pins. The recorded `hook.stageRecords[]` must carry, per record, the
instance it came from (`'renderer' | 'main'`), so a reader can attribute every number.

**The recorder's permitted stage set widens BY CONSTRUCTION, and the render-path set does not.**
Two distinct constants, both recorded in the artifact:
- `O0_HOOK_SEAM_STAGES` = the stage ids a recorder instance may be **configured** for:
  `snapshot.pull`, `snapshot.clone`, `docheads.pull` **plus** the five render-path ids
  (§2.2 ids 4-8). The construction/arm-time guard
  (`O0_HOOK_STAGE_NOT_ALLOWED`) accepts exactly this set.
- `O0_RENDER_HOOK_STAGES` = the FIVE **render-path** stages ids 4-8 — unchanged, and still the
  only stages a page-side `arm()` may request (§3.6's boundary: a page script may arm the
  render path, never widen its own seam set; that is the §6 F15 hardening's runtime meaning).

This is the **only** permitted change to §3.6's landed module: an ADDITIVE wider configuration
constant plus the render-path subset; no new wrapper shape, no new emission, no new work.

**If a sub-split stays impossible, say so — the exact `unseparated` reporting rule.** When the
main-side instance is not armed (`--connect`, a refused arm, or a bundle without the main seam),
`snapshot.clone` is emitted `{ "ms": null, "unseparated": true, "source": "mark" }` with
`structural: true` and `structuralReason` naming the missing seam (§6 S14/S15). When the caller-level
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
`o0StagesFromHookRecords`, `scripts/live-drive.mjs:661-678`) when that import is unavailable.
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
`{ ok, attempts, runIds, errors }`). Today `o0DeriveReportPass` (`scripts/live-drive.mjs:1155`)
re-implements a SUBSET of the row rules inline (its `o0RowPass`, `:693-716`) and never calls the
module: the two can — and on this unit did — disagree about which rows are acceptable, which is
the exact class of defect the mirror deletion above removes. A self-validation failure is a
report-level forcing reason (§6 F17); the report is still WRITTEN (the numbers stay
inspectable), with `pass:false`.

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
  "verdicts": [ "<derived verdict string> per §4.4" ],
  "pass": true|false
}
```

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
  "hook": { "armWindow": { "t0": <n>, "t1": <n>, "ms": <n> }, "armCount": 1, "disarmCount": 1,
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
  exactly as `rowResult` derives it (`live-drive.mjs:429-432`).
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
    `longTaskTotalMs + tolerance` (the recorded hook band, 40 ms — §3.6) forces `pass:false`
    with a reason naming **both** numbers
    (`stage <id> ms <ms> exceeds the freeze it belongs to (<longTaskTotalMs> ms + <tol> ms
    tolerance) — a stage cannot be larger than the window it is measured in`).
  - **The derived percentage verdict is REFUSED on that branch** (there is no legitimate
    `1698.82%`): the harness emits the explicit **window-bound-violated** verdict instead
    (§4.4, §6 F13a) and never a percentage computed from a violated window.
- **Structural marker (§6 S14).** A stage that cannot be separated **by construction** — no
  seam exists in the executing bundle — carries `structural: true` plus a
  `structuralReason` naming the missing seam, **distinct** from a stage that is merely
  **unmeasured** in this run (a seam exists but was not armed). The distinction is
  contractual: it is what makes a report's `pass:false` reason precise and keeps the A-4 gap
  **visible** instead of laundered into a generic `unseparated`.
- **A `pass:false` row carrying a genuine `failReasons` line is SCHEMA-VALID.** It is a
  **legitimate FAILING MEASUREMENT**, not a schema error: `validateO0Run` returns `ok:true`
  for it, and the row-level `pass:false` propagates to the report through
  `o0DeriveReportPass`, which pushes every row's reasons into `driver.failReasons` (the
  architect's ruling **R-1**, recorded in §7 row 1 and §3b). The real defect class is the **opposite** shape — a `pass:false` row with an EMPTY
  `failReasons` — which is already caught (`src/shared/o0-report.ts`'s `pass !== true &&
  recorded.length === 0` branch). `failReasons` is **non-empty whenever `pass:false`**; a
  `pass:false` row with no reason is itself a schema error.

### 4.4 The DERIVED verdict (never hard-coded)

At least one verdict string is emitted per gesture, computed by the harness from the
row — the formula is pinned, the number is not:

> `stage <id> is <ms> ms of the <longTaskTotalMs> ms long task (<pct>%) on <gesture> — <stage-id> is the largest identified stage`

and the discriminating verdict required by A-4:

> `the <gesture> performed <n> whole-store IPC_RAG_SNAPSHOT read(s) totalling <ms> ms (census <documents> docs / <nodes> nodes / <edges> edges)`

**Two further pinned verdict forms (added by H2/H3):**

> `stage <id> is <ms> ms, which EXCEEDS the freeze window it belongs to (<longTaskTotalMs> ms + <tol> ms tolerance) — WINDOW-BOUND VIOLATED: no percentage verdict is emitted for this row`

— emitted **instead of** the percentage form whenever §4.3's window-bound rule fires (the
`1698.82%` line the live run printed is exactly the string this verdict replaces, §12 H3); and

> `the <gesture>'s whole-store IPC_RAG_SNAPSHOT read count is UNMEASURED (snapshot.pull unseparated — <reason>)`

— emitted **instead of** the A-4 `performed <n> read(s)` form whenever `snapshot.pull` is
`unseparated`, so a **"not measured" 0 is never emitted as a measured zero** (§3.6b, §12 H2).

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
| `P-HK-1` | TP | **The §3.6(c) hook is INERT under arm.** An ARMED recorder's `Δmutations` must be **0** and `\|ΔlongTaskTotalMs\|` must be **within the RECORDED tolerance** (the landed band is 40 ms — `src/shared/o0-hook.ts:45`); an **off-set** stage (armed, but outside the armed set) is **dropped, not measured** (`fn` runs exactly once, no mark/measure/record, counted in `state().dropped`); and a permitted stage with **no records** is `ms:null` + `unseparated:true` — **never a silent measured value** (the imputation ban). | `strat:o0-hook-inert` — generated `(unarmed, armed, tolerance)` triples: `tol ∈ {0,10,40,120}` ms, `Δmutations ∈ [-3,3]`, `ΔlongTaskTotalMs ∈ [-40,40]` in 10 ms steps, over counters `mutations 0..200` / `longTaskTotalMs 100..2000`; the off-set-stage and zero-record halves ride the same file's H3/FS3 + H9/FS4 rows | `inert === (Δmutations === 0 ∧ \|ΔlongTaskTotalMs\| ≤ tol)`; the signed deltas are returned verbatim; a non-inert pair carries ≥1 `failReasons` line **naming** `mutations` (when `Δmutations ≠ 0`) or `longTaskTotalMs` (otherwise); an inert pair carries **none**; an off-set stage yields no record and stays `unseparated`; a zero-record stage yields `ms:null` + `unseparated:true` | transform (pure) + the LIVE armed-vs-unarmed pair (§3.6, `o0_repeat_determinism`) |
| `P-TP-3` | TP | **WINDOW-BOUNDEDNESS — no measured stage may exceed the freeze it belongs to, and no percentage may be derived from a violated window (H3).** For every row: (a) each **separated** stage satisfies `ms ≤ longTaskTotalMs + hookToleranceMs` (the recorded band, 40 ms); (b) the row's `hook.armWindow` (or the recorded actual hook window) **equals** the freeze window within that tolerance — an arming interval that starts before `o0:t0` or ends after `o0:t1` is a violation, never a silent widening; (c) a percentage verdict is emitted **iff** no violation holds — on a violation the harness emits the WINDOW-BOUND VIOLATED verdict instead, so the derived `pct` is never `> 100` and never negative. | `strat:o0-window-bound` — generated rows from a skeleton of 11 stages: `stage ms ∈ {0, tol, tol+0.1, total, total+1, total×20}`, `longTaskTotalMs ∈ {0, 10, 110, 2283}`, tolerance `∈ {0, 40}`, plus an `armWindow` starting 5/50/250 ms **before** `t0` and a pair with the window equal to the freeze | the oracle returns `violated:true` **iff** some separated stage `ms > total + tol` **or** the arm window starts before `t0` / ends after `t1` beyond tolerance; then `pass === false` **and** ≥1 `failReasons` line carrying **both** the stage `ms` and the `total + tol` bound; and the verdict string for that row matches the WINDOW-BOUND VIOLATED form and contains **no** `%`; an in-bound row emits the percentage form with `0 ≤ pct ≤ 100` | transform (pure) + the LIVE freeze window (§3.5's `o0:t0`/`o0:t1` marks) |

**Register count: 8 rows** (P-IM-1, P-IM-2, P-SM-1, P-SM-2, P-TP-1, P-TP-2, P-HK-1,
P-TP-3) — **exactly AT the ≤8 cap**, with the budget restated as ≤100 attempts/row and
`60×6 + 40 + 50 = 470` landed (≤800 at the ceiling).

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
| **S9** | **Off-set stage** (the recorder is ARMED, but for a stage outside the armed set) | `fn` runs exactly **once**, **no** mark/measure/record is emitted, the pass-through is counted in `state().dropped`, and nothing throws (`src/shared/o0-hook.ts:178-182`) — the stage is **dropped, not measured**, and its row stays `unseparated` |
| **S10** | **Double arm / double disarm** | **idempotent**: a redundant `arm()` returns `false` and does **not** clear the measurement window, reset `dropped`, or advance `armCount`; a `disarm()` on an unarmed recorder returns `false` and does not advance `disarmCount` (`src/shared/o0-hook.ts:157-172`). A recorder still armed from a previous freeze is disarmed before the next arm, so a freeze never inherits another window's records (the driver's `state.renderer` half) |
| **S11** | **Which aggregation produced the stage rows** (`hook.stageRowsSource`) — **now a closed field** | recorded on every freeze row, with **exactly ONE legal value**: `'src/shared/o0-hook.ts:stagesFromO0HookRecords'` (the real module, dynamically imported type-stripped). The former second value (`'driver-mirror:o0StagesFromHookRecords'`, the in-driver mirror) is **DELETED** (§3.6b finding 11 / F16), so a row carrying it — or any other value — is `pass:false`. There is no drift to audit because there is no second implementation (§3.6, §6 F16) |
| **S12** | **`longtask` unsupported in the executing renderer** | `hook.longtaskUnsupported` carries the recorded error string (else `null`) and `longTasks`/`longTaskTotalMs` are `[]`/`0`. **A recorded audit input, not a forcing condition today**: a zero long-task total is a *legal* measurement, and only the recorded field distinguishes it from a genuinely tiny freeze — the adversarial pass must confirm it is never relied on as a silent zero |
| **S13** | **A control leg emitted by the PAIRED invocation (cross-artifact pairing)** | the §3.5 command pair writes one artifact per leg, so a leg whose counterpart is not in this invocation declares `pairedWithStatus: 'cross-artifact'` (the driver's `o0ControlRows`, surfaced as `driver.crossArtifactControlPairs`); the counterpart is then verified only in the merged report and this is a **note**, not a forcing reason. A comparison row with **no** control row at all still forces `pass:false` (F9) |
| **S14** | **A stage is STRUCTURALLY unmeasurable** (no seam exists in the executing bundle — the H2 class) | the stage is emitted `{ ms: null, unseparated: true, source: 'mark', structural: true, structuralReason: '<the missing seam>' }`, and the run's `unseparatedStages` distinguishes it from a merely-unmeasured stage. The report's `pass:false` reason names it as **structural** (`stage <id> is structurally unseparated — <reason>`), so a reader can tell "there is no seam" from "the seam was not armed". **This is the marker that keeps the A-4 gap visible rather than laundered** (§3.6b, §12 H2). When BOTH recorder instances record the same stage id in one freeze window, the row is `pass:false` with `stage <id> recorded by two instances (renderer, main) in one freeze window` |
| **S15** | **The main-side refinement is absent** (`--connect`, a refused main-side arm, or a bundle without the main seam) | `snapshot.clone` is `ms:null` + `unseparated:true` + `structural:true` while `snapshot.pull` (the caller-level round trip) is still **measured** — the A-4 discriminator is answered and the inside/outside split is simply not offered. Recorded per leg: `driver.mainSeamArmed: true|false`. A report that claims the split without the seam is `pass:false` (§6 F14) |
| **S16** | **The window bound is VIOLATED** (a stage larger than its freeze — the H3 class) | the offending stage is `pass:false` with a reason naming **both** its `ms` and `longTaskTotalMs + tolerance`; the row's verdict is the explicit WINDOW-BOUND VIOLATED string, **never** a percentage; `hook.armWindow` reveals the wider interval. A row may be otherwise perfectly formed and still be this state — that is exactly why it needs a state of its own (§4.3, §5 P-TP-3, §12 H3) |
| **S17** | **Inertness is measured but VACUOUS** (the repeat block was not in `--block`, so no armed/unarmed pair exists) | a report whose runs **armed** the hook but carries **no** inertness comparison is `pass:false` with `no hook inertness comparison was recorded although <n> run(s) armed the hook — an unverified arm is not an inert arm (§3.6(c)/§6 F17)`. `driver.hookInertness: []` is only legal when **no** run armed the hook (§3a finding 13) |

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
| **F17** | **The driver's self-validation failed, or the inertness comparison is vacuous** | (a) the driver runs `validateO0Run` over every emitted row and `validateO0Reports` over its own report **before** writing it and APPENDS their `failReasons` to `driver.failReasons`: a validator rejection that the driver's inline rules missed is `pass:false` with `driver self-validation rejected <n> row(s): <the validator's reason(s)> (§3.6b)`; (b) a report whose runs **armed** the hook but carries **no** inertness comparison (`driver.hookInertness: []`) is `pass:false` with `no hook inertness comparison was recorded although <n> run(s) armed the hook — an unverified arm is not an inert arm`. An empty `hookInertness` is legal **only** when no run armed the hook (§6 S17) |

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

**§3b (re-audit after the fixes):** `PENDING — owed before O-0 is reported done.` §3b must
confirm, at minimum: (i) the four MUST-FIX fixes are in the tree with their rows GREEN and a
fresh trio; (ii) `R1` is **gone** (withdrawn) and no surviving row asserts it; (iii) the
mirror deletion (finding 11 / F16) landed with a loud-abort test; (iv) the driver's
self-validation (finding 12 / F17) runs the pure module over its own report; (v) the H3
window-bound row (`P-TP-3`) is green and the armed window is recorded per freeze.

| # | Sev | Class | Site (verified against the tree) | Finding | Disposition |
| --- | --- | --- | --- | --- | --- |
| 1 | **REJECTED** | `verdict-contested` | `tests/unit-o0-report-contract.test.ts` row `R1` (`:610-625`), against `src/shared/o0-report.ts` `validateO0Run`'s fail-loud branch (`:265-276`) | The claim: `validateO0Run` accepting a `pass:false` row that carries a genuine `failReasons` line is a defect. | **REJECTED BY COUNTER-EVIDENCE (R-1).** A `pass:false` row carrying real reasons **is a legitimate FAILING MEASUREMENT** — the row's own verdict is what the row reports, and the report-level verdict is what aggregates it (`o0DeriveReportPass` pushes every row's reasons into `driver.failReasons`). Requiring `ok:false` here would make every honest failing row a *schema* error and destroy the distinction between "the measurement failed" and "the report is malformed". The existing row **`F5`** (`tests/unit-o-0-report-contract.test.ts:585-598`, asserting `r.ok === true` for a `pass:false` row with an ablation-unavailable reason) states the correct contract and **STANDS**. The adversarial `R1` has been **WITHDRAWN** (the TestWriter is removing it) and **must not be re-pinned**. **The real defect class is the opposite shape** — a `pass:false` row with an EMPTY `failReasons` — which the landed branch already catches; §4.3 now records that inversion explicitly so the class cannot be re-invented. |
| 2 | **MUST-FIX** | `schema` | `src/shared/o0-report.ts` `reconcileO0PostStyle`'s return (`:389-405`), vs the driver twin `o0ApplyPostStyle` (`scripts/live-drive.mjs:870-899`); row `R3` (`:651-675`) | `postStyle` could be emitted as `{ ms: null, unseparated: false }` (when the residual is `null` from a non-finite total), and the module and the driver **twin disagree on the negative/over-tolerance branch**: the module leaves `post.style` out of `unseparatedStages` and reports it separated, while the twin pushes it into `unseparatedStages`. | **FIX (contract §4.3/§6 F13):** `postStyle.ms === null` **⇒** `postStyle.unseparated === true` (one branch, never two); a **negative or over-tolerance** residual is `ok:false` with a reason **naming the residual**; the module and the driver twin must agree on that branch (the twin's `post.style` insertion is the pinned shape). |
| 3 | **MUST-FIX** | `under-strong` | `src/shared/o0-report.ts` `compareO0StageIdSets` (`:285-297`, the de-dupe at `:290`) and `unseparatedStageIds`'s `String(s.id)` (`:121-125`); row `R4` (`:677-706`) | The SET comparator de-dupes both sides, so a run carrying a **duplicated** stage id compares `equal:true` — the determinism oracle (P-SM-2) cannot see a set violation. `String(s.id)` leaks the literal **`'undefined'`** into `unseparatedStages` and into the derived verdict's "largest identified stage". | **FIX (contract §5 P-IM-2/§6 F13):** `compareO0StageIdSets` returns `equal:false` when any id **repeats** in either run (a SET comparison that cannot see a duplicate is under-strong); `unseparatedStageIds` (and every derived verdict) **skips non-string/`undefined` ids**, so no `'undefined'` phantom ever reaches a verdict. |
| 4 | **MUST-FIX** | `unauthorized-access` | `src/renderer/runtime.ts` `:75-77` (the module-scope publish); row `B9` (`tests/unit-o-0-hook-contract.test.ts:808-852`) | The page global published the **FULL** recorder — `arm`/`disarm`/`record`/`reset` — at **module scope**, so any page script could commit a measurement (`record`) or wipe one (`reset`), and merely importing the renderer published the handle. | **FIX (contract §3.6/§6 F15):** the published value exposes **only `{arm, disarm, isArmed, records, state}`** (no `record`, no `reset`) and is installed **on first arm, from inside a function**. §3.6b pins the runtime meaning: a page-side `arm()` may request the render-path subset only. |
| 5 | **MUST-FIX** | `schema` | `scripts/live-drive.mjs` `o0DeriveReportPass` (`:1155-1200`) — it never imports/calls the pure validator; `o0RowPass` (`:693-716`) re-implements a subset inline; the ordering at `:966-967` | The driver never runs the **pure validator over its own report**: its inline rules can (and on this unit did) accept rows the pinned module would reject, and `o0ApplyPostStyle` runs **after** the reasons are computed, so a reconciliation-forced reason can be computed too late to be part of `failReasons`. | **FIX (contract §3.6b/§6 F17):** `o0BuildReport` must run `validateO0Run` per row and `validateO0Reports` per report **before writing**, through the **same guarded twin-import** (no mirror), and **append** their `failReasons` to `driver.failReasons`; `driver.selfValidation` records `{ok, attempts, runIds, errors}`. |
| 6 | **SHOULD** | `under-strong` | row `R2` (`:627-649`) | A `stages[]` entry the row cannot use is reported through a **coerced stage id** (`'undefined'`) rather than its `stages[<i>]` **INDEX**, so the §4.4 falsifiability counterexample ("delete one `stages[]` entry") is not constructible from the reason. | **FIX (contract §4.3/§6 F13):** name the offending entry by index. |
| 7 | **SHOULD** | `under-strong` | `tests/unit-o0-report-contract.test.ts` `P-IM-1` row's generator (`:720-802`) | The row text pins "every stage ms **and every counter**" but every draw perturbed only a stage value — a counter defect (`longTaskTotalMs`/`mutations`/`wallMs`) could not be exercised. | **FIX (TEST remand → now LANDED as modes 1-9).** Generator modes added; the `longTaskTotalMs === null` mode is additionally constrained by R-2 (§4.3: the primary oracle is required, so `null` is `ok:false`, not a legal unmeasured form). |
| 8 | **SHOULD** | `under-strong` | `P-IM-2` row's generator (`:803-852`) | No draw had `missing` and `extra` **both** non-empty, and no reversed-order legal row existed — the totality oracle was never exercised against a duplicate **plus** a removal. | **FIX (TEST remand → LANDED as modes 14/15).** |
| 9 | **SHOULD** | `under-strong` | `P-SM-1` row's generator (`:853-903`) | Only ONE field of a COMPLETE triplet was perturbed, so a **partial** object (a field missing on both sides) compared `equal` and validated `ok:true`. | **FIX (TEST remand → LANDED as modes 1-5).** |
| 10 | **SHOULD** | `under-strong` | `P-SM-2` / `P-TP-1` row generators (`:904-968`, `:969-1067`) | The determinism generator never drew a duplicate id, an unknown extra id, or an all-zero row (finding 9); the reconcile generator never drew the band edge, a zero/non-numeric tolerance, a **separated stage carrying `ms:null`** (silently summed as 0), or the `Σ > total` all-separated case (finding 10). | **FIX (TEST remand → LANDED as modes 3-5 and 5-10).** The `Σ > total` case is the one that exposed MUST-FIX finding 2's twin disagreement. |
| 11 | **MUST-FIX** | `under-strong` | `scripts/live-drive.mjs` `o0StagesFromHookRecords` mirror (`:661-678`) + the guarded import (`:649-656`); §3.6's "mirror-fallback drift risk" paragraph | Two implementations of ONE contract: the in-driver mirror can diverge from `src/shared/o0-hook.ts` whenever the dynamic import is unavailable — and the divergence would move **every** stage row and the `post.style` residual on exactly those runs. The recorded `stageRowsSource` made divergence *visible*, never impossible. | **FIX (contract §3.6b/§6 F16): the MIRROR IS DELETED (option (b)), not audited (option (a)).** The driver imports the `.ts` twin the same way it imports `src/shared/o0-report.ts`; an unavailable import is a **loud abort** (`[live-drive] ERROR:` + exit 2, no artifact), never a fallback. Rationale recorded in §3.6b: this artifact is a *contract* artifact — a report from an unverifiable second implementation is worth less than no report, and an abort is unambiguous. Option (a) ("run both and fail on disagreement") was rejected because it keeps the second implementation alive and adds a third comparison surface. |
| 12 | **MUST-FIX** | `verdict-contested` | `scripts/live-drive.mjs` `o0DeriveReportPass` (`:1192-1198`) + `o0Acc.hookPairs` | **Inertness is VACUOUS when the repeat block is not in `--block`**: the GPU-on leg ran `--block=o0_gpu_control` alone, so `driver.hookInertness` was `[]` while **both** runs were armed — the artifact then reports "the hook is inert" nowhere, and its `pass:false` reasons do not mention the unverified arm. | **FIX (contract §6 S17/F17):** a report whose runs **armed** the hook but carries **no** inertness comparison is `pass:false`; an empty `hookInertness` is legal **only** when no run armed the hook. §11's gate item 3 is restated accordingly. |
| 13 | **TEST REMAND** | `schema` | `tests/unit-o-0-driver-contract.test.ts` (18 rows, `D1..D18`) | The driver-contract file pins the driver's **source text** but has no row for the four new contracts above (self-validation, non-vacuous inertness, mirror deletion/abort, the window-bound rule, the two-instance seam union). | **REMAND:** the TestWriter adds the rows for §3.6b/§4.3/§6 S14-S17 **before** the Implementer touches the driver (RCA-1: red first). The driver's own emitted report is validated by the pure module (§3.6b), which is the non-vacuous half. |

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
| **Hook-permitted** stages | **5 render-path ids** (`O0_RENDER_HOOK_STAGES`, ids 4-8 — §3.6) **of 8 configurable seam ids** (`O0_HOOK_SEAM_STAGES` = the caller-level 1-3 + the render-path 4-8 — §3.6b) |
| New `live-drive.mjs` **blocks** | **5** (`o0_folder_row`, `o0_document_row`, `o0_gpu_control`, `o0_track_ablation`, `o0_repeat_determinism` — §3.1) |
| **Property-register rows** | **8** (§5 — `P-HK-1` added with the §3.6 hook; `P-TP-3` added by the H3 re-derivation) — **AT the cap**, budget `60×6 + 40 + 50 = 470` (≤100/row) |
| New PURE source modules | **2** (`src/shared/o0-report.ts`, `src/shared/o0-hook.ts`) — §4/§3.6 |
| Instrumented (`record()`-wrapped) call sites | **5 render-path** (§3.6) — the `shared.decorate` body keeps its **4** call sites — **+ 3 caller-level/main-side seams** (`snapshot.pull`, `snapshot.clone`, `docheads.pull` — §3.6b) = **8**, i.e. 5 sites inside the body + 3 new wraps |
| New test files / tests | **3** files, **79** rows in the tree at this read: `tests/unit-o-0-report-contract.test.ts` **30** (26 at the reported trio + 4 §3a rows `R1`..`R4`); `tests/unit-o-0-driver-contract.test.ts` **18**; `tests/unit-o-0-hook-contract.test.ts` **31** (the reported 30 + the §3a row `B9` — the spec's earlier "30" was stale). **Counts move; re-read before quoting.** |
| `runs[]` rows in a full 4-block artifact | **6** (2 gesture freezes + 2 GPU-control freezes + 2 ablation freezes; the determinism block re-reports an existing run rather than adding a row) |
| `controls[]` rows in a full artifact | **4** (`gpu-on`, `gpu-off`, `track-ablation-on`, `track-ablation-off`) |
| New driver flags | **3** pinned (`--gpu`, `--o0-corpus=`, `--o0-out=`) (§3.3) **+ 2 landed by the live pass** (`--corpus-root=<dir>`, `--strict-seed`, both default-safe — §3.4/§12 H7) = **5** |
| New committed artifact files | **1** (`docs/specs/unit-o-0-per-stage-breakdown.md`) (§4.1) — **WRITTEN by the live pass (2026-09-17) and SUPERSEDED-PENDING-FIX** (§12: the unit is OPEN, a re-run on the fixed bundle is mandatory) |
| New `$`-row in `MATRIX_ROWS` / `ROW_EXTENDED` | **0** (O-0 claims no §5.U row and no extended row — §3.2) |
| Operator corpus census | **226 documents** pinned (`docs/defects.md:22`); **observed 226 / 10 170 nodes / 18 758 edges** (§12 §3) — seed **`o0-2026-09-17`** (§3.4) |
| Trio | **NOT GREEN — measured at the live-battery read:** the harness trio's last recorded green is **214 files passed, 4 820 pass / 0 fail / 58 skipped (4 878)** (typecheck **0**, build clean, renderer ≈ **659.9 kb**), but the §3a set has since landed **RED**: **5** rows currently fail (**`R1`–`R4`** + **`B9`**) and **4** further red re-pins are owed for the new contracts (§3.6b/§4.3/§6 S14-S17) → the cycle's working figure is **9 failing by design** (§11) |
| `src/` **behavior** change | **0** at the reported trio — the §3.6 hook is inert when unarmed (`P-HK-1`); the contact is 2 new pure modules + 5 wrap-only call sites + 1 guarded `window.__o0recorder` handle. **The next cycle's fixes DO touch `src/`** (3 module fixes + the handle hardening + the seam wraps + the main-side recorder), still measurement-only and still inert-when-unarmed |

### 8.2 Cross-references

- **`docs/specs/unit-o-0-per-stage-breakdown.md`** — the live artifact (written 2026-09-17).
  Read it **with §12 below**, which is its record: the artifact is
  **SUPERSEDED-PENDING-FIX** and the unit remains **OPEN** (§12's status block is
  normative for the artifact's staleness).
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
- `docs/defects.md` — `HEAVY-OPS-FREEZE-THE-PAGE` `:22`, `CANVAS-DIMENSIONS-JS-DRIVEN`
  `:23`, `PANE-TOGGLE-FULL-REASSEMBLY` `:36`, `PANE-SLOT-INSTABILITY-ON-DISCLOSURE`
  `:48` (the four rows whose numbers O-0 either reproduces or corrects).
- `docs/live-testing.md` — the launcher/bundle gotcha `:119-124` (the ENV NOTE the
  bundle identity field enforces).
- Build: `scripts/live-drive.mjs` (`CDP` `:63-124`, `ufHitProbe` `:169-172`,
  `ufRealClick` `:180-206`, `diagResult` `:398-412`, `rowResult` `:429-468`,
  `MATRIX_ROWS` `:483-492`, `reconcileMatrixRows` `:510-545`, `ROW_EXTENDED` `:552-567`,
  `seedCorpus` `:129-137`, the CLI parse `:2643-2659`, the spawn `:2676-2683`, the block
  loop `:2705-2716`); `src/renderer/sidebar-panes.ts:1492`, `:1995`, `:2003-2009`;
  `src/main/main.ts:751-755`; `src/shared/types.ts:481-502`; `src/main/traversal.ts:325`;
  `src/renderer/pane-graph.ts:329`; `src/renderer/content-reconcile.ts:421`;
  `src/renderer/runtime.ts:143`, `:253-298`, `:480`; `src/main/preload.ts:578-642`
  (there is no `Runtime` handle on `window` — §3.6).
  **CITATION-STALENESS NOTE (owed re-pin).** Those `live-drive.mjs` anchors were written
  BEFORE the O-0 section landed; the O-0 harness inserts ~850 lines ahead of
  `MATRIX_ROWS`, so every driver anchor from `ufHitProbe` onward is stale by a growing
  offset (the file moved 3 764 → 3 770 → 3 789 lines DURING this doc pass), and the
  `src/` anchors for stages 1/3, 9 and 10 drifted with the §3.6 imports. The anchors this
  spec's OWN new text depends on are cited **by symbol name** (§3.6/§6) for exactly that
  reason. **The post-freeze doc-review pass must re-pin every driver line number in one
  sweep** — it is explicitly NOT claimed accurate here. The O-0 additions to locate the
  same way: `O0_STAGE_IDS`/`O0_BLOCK_NAMES`/`O0_SEED`/`O0_OPERATOR_DOCUMENTS`,
  `O0_HOOK_SEAMS` + `O0_HOOK_SOURCE` + `O0_BRIDGE_STAGES` + `O0_HOOK_STAGE_ROWS_SOURCE`,
  the `o0_*` blocks, `o0DeriveReportPass`, `o0BuildReport`/`o0WriteReport`, and the
  `main()` O-0 arm/emit path.
- Build (the §3.6 hook): `src/shared/o0-report.ts` (the pure report schema +
  reconciliation helpers), `src/shared/o0-hook.ts` (the pure recorder + the inertness
  oracle), the five wraps (`src/main/traversal.ts:326`+`:331`,
  `src/renderer/pane-graph.ts:330`+`:335`, `src/renderer/sidebar-panes.ts:1493`+`:1499`,
  `src/renderer/content-reconcile.ts:422`+`:427`,
  `src/renderer/runtime.ts:491`+`:497`), and the `window.__o0recorder` handle
  (`src/renderer/runtime.ts:76`).

---

## 9. The decision-row ruling (zero-row rationale)

**RULING: O-0 owes NO new row in `docs/decisions.md`, and this pass adds none.** The
only edit made to that file is a **citation re-pin, not a decision**: the five
shell-keeps-the-render-path function lines in the existing ACTIVE
`ASTROGRAPHER-SCOPE-REALIGNMENT` row (`docs/decisions.md:235`) had drifted by the §3.6
import/wrap (e.g. `src/main/traversal.ts:325 → :326`, `src/renderer/runtime.ts:480 →
:491`), so the row now names the declaration AND its instrumented wrap line.

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

---

## 10. The downstream contract (exactly what O-0's artifact feeds)

1. **The parked engine track's trigger (c).** `O-0 shows the derivation WALK ITSELF
   (not compile/emit/layout) exceeds the budget` is trigger **(c)** of the three
   external triggers that would schedule O-6/O-7/O-8
   (`gnosis-offload-proposal.md:162-166`; `docs/pending.md:134-139`). O-0's
   `traversal.build` stage measured against the long-task total is the **only** input
   that can fire it — so the engine track's re-opening is **gated on this artifact**,
   and nothing else may claim trigger (c). **Status at the first run: trigger (c) is
   CANDIDATE-FIRED for the folder-row disclosure** (`traversal.build` 1766.5 ms = 77.4% of
   the 2283 ms GPU-ON window) and **not** for the document open (1.3%) — §12.7(e). It is
   recorded as a **candidate** because the first run's stage spans were not window-bounded
   (H3): the re-run under §5 P-TP-3 is what makes the figure final, and **no unit may treat
   (c) as fired before it**.
2. **The parked track's trigger (b) threshold.** `the operator corpus exceeds the local
   store's measured ceiling — the node-count threshold is pinned by O-0`
   (`gnosis-offload-review.md:445`; `docs/pending.md:135-136`). The artifact's
   `corpus.nodes` census at operator size is the input to that pin.
3. **O-5's budget number — which may NOT be pinned before O-0.** O-5's whole red set is
   the harness's own node contract, and its **threshold comes from this artifact**
   (`gnosis-offload-review.md:308`, `:112-120`; `docs/decisions.md:24` "pinned after
   O-0"). A TestWriter that invents a threshold is the anti-pattern the review named.
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
   shrinks accordingly. **Status at the first run: the read count is NOT YET OBSERVED**
   (`snapshot.pull` was structurally unseparated — §12 H2), so this item stays **OPEN** and
   the O-1 amendment must wait for the re-run's caller-level measurement (§3.6b). A
   *"not measured"* `0` is explicitly **not** the "already true" finding this clause needs.
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
  (`docs/specs/unit-o-0-per-stage-breakdown.md`, **WRITTEN 2026-09-17 — SUPERSEDED-PENDING-FIX**,
  §12) + the §3.6 hook (**IMPLEMENTED**, inert when unarmed — no behavior change).
- **The CURRENT state (read this first): the unit is OPEN, not DONE.** The live battery
  **RAN and FAILED** (§12), the adversarial pass **found 4 MUST-FIX host defects** (§7), and
  the trio is **red by design at 9 failing** (5 rows already in the tree — `R1`–`R4` + `B9` —
  plus 4 red re-pins owed for the new contracts of §3.6b/§4.3/§6 S14-S17). The remaining
  cycle, in order: **spec (this pass) → red re-pins (TestWriter, incl. the `R1` withdrawal
  per R-1) → host fixes (Implementer) → live re-run (the two §3.5 commands on the fixed
  bundle) → doc-review (RCA-6)**. Nothing in this bullet is a park; the park rule (RCA-11 /
  `AGENTS.md` item 11) is unchanged and no O-0 surface is structurally non-exercisable
  except `post.style`'s residual (which is by construction a derived number, §2.2 id 11).
- **The blind-greens artifact for O-0 is the §6.1 coverage report — NOT a greens doc.**
  Per `gnosis-offload-review.md:88` ("For O-0/O-5 the blind-greens artifact is the
  *coverage report* (`user-flow-audit.md` §6.1), not a greens doc") and §2.1(a)
  `:107-110` (the driver's `MATRIX_ROWS` reconciliation is the precedent for the
  mechanism). A `unit-o-0-*-greens.md` authored for O-0 would be a review finding.
- **A merely-parked O-0 battery is not a pass** (RCA-11,
  `docs/specs/rca-live-bugs-green-pipeline.md:121-132`; `AGENTS.md` item 11), and a
  `-live-pending-battery.md` for O-0 is a review finding. **The live battery RAN on
  2026-09-17 and returned `pass:false` on both legs** (§12): the harness is green-by-shape,
  the ARTIFACT EXISTS, and the unit is **NOT DONE** — the run's numbers are
  superseded-pending-fix because 6 of the 11 stages were `unseparated`. The live run
  (`scripts/live-drive.mjs`, §3.5's two commands, on a usable display, against the operator
  app + its 226-doc persisted store **or** a seeded corpus of the pinned size, §3.4) must
  prove, from the emitted report:
  1. `driver.build.verified === true` — the SERVED `dist/renderer/renderer.js` matches
     the on-disk file (byte length + hash) and `dist/main/main.cjs` is recorded;
  2. both gestures hit-tested: `path === 'cdp'` (hence `realInput:true`) on a real
     folder-row click AND a real document-row click;
  3. **hook inertness**: an ARMED run's `Δmutations === 0` and
     `|ΔlongTaskTotalMs| ≤ 40 ms` vs the unarmed baseline (`o0_repeat_determinism` →
     `driver.hookInertness[].inert === true`, §5 P-HK-1/§3.6(c)); **and the comparison must
     EXIST** — a report whose runs armed the hook but carries an empty
     `driver.hookInertness` is `pass:false` (§6 S17/F17: an unverified arm is not an inert
     arm). The 2026-09-17 GPU-on leg violated exactly this (it ran `--block=o0_gpu_control`
     alone, §12 finding 12);
  4. **non-null stage rows for the five hook stages 4-8** — i.e. the artifact actually
     discriminates the render-path stages (`hook.rendererArmed:true`, `hook.refused`
     empty, and `stages[i].ms !== null` for `traversal.build`/`envelope.assemble`/
     `shared.decorate`/`reconcile.roots`/`reconcile.apply`); if the app's bundle does
     not expose `window.__o0recorder` they stay `unseparated` and the artifact must say
     so (§6 S8), not report a number;
  5. **stage-id-set determinism** across the repeat runs (`o0_repeat_determinism` →
     `setEqual:true`; the `ms` values stay FREE under the seed, §5 P-SM-2);
  6. the census gate at operator size (`corpus.documents === 226`, or the
     `--o0-corpus=<n>` value) with `driver.build.verified:true` — otherwise the run is
     a documented fail-state (§6 F2/F8), never a provisional pass;
  7. **a non-null `snapshot.pull` for BOTH gestures** — the CALLER-level seam of §3.6b
     (`hook.stageRowsSource` = the real module, no mirror; the row's `hook.stageRecords[]`
     attributes each record to its instance) — so the A-4 discriminator is a **measured**
     number and not a "not measured" 0; and every stage that remains `unseparated` carries
     `structural:true` + `structuralReason` (§6 S14/S15) rather than a bare `unseparated`;
     and
  8. **the window bound holds** — no stage `ms` exceeds `longTaskTotalMs + 40 ms`, and no
     row's verdict contains a percentage above 100 or a negative residual (§5 P-TP-3,
     §6 F13a). The 2026-09-17 run violated this on `traversal.build` (1868.7 ms inside a
     110 ms window, printed as `1698.82%`, §12 H3).
  Only then may `docs/specs/unit-o-0-per-stage-breakdown.md` be committed and the
  delegation gate for O-5 open (see the last bullet).
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
  The measurement itself has no red set and this spec does not claim one (§5; RCA-1 does
  not apply to a measurement — `gnosis-offload-review.md:84`).
- **The trio (run by the Implementer after the green — `AGENTS.md` item 4):**
  **`npm test` = 214 files passed, 4 820 pass / 0 fail / 58 skipped (4 878)**;
  **`npm run typecheck` = 0**; **`npm run build` = clean** — renderer ≈ **659.9 kb**,
  `__o0recorder` present **once** in `dist/renderer/renderer.js` and **absent** from
  `dist/main/main.cjs` (the handle is renderer-only — §3.6). **A schema-green/node-green
  is ENVELOPE-green, NOT app-green (RCA-12): the trio proves the harness's contract, not
  one measured number.**
- **Post-trio drift observed DURING the doc pass, now RESOLVED INTO THE RECORD.** While this
  spec was being reconciled against the build, the tree moved under it: (a) the driver grew
  **3 764 → 3 789 → 3 849 lines** (the `--display` colon normalization of §6 F12 plus the
  O-0 arm/emit lines and the live pass's own H4/H5/H6 fixes) — which is why §8.2 declares the
  driver's line anchors owed a post-freeze re-pin; and (b) `tests/unit-o-0-report-contract.test.ts`
  gained an ADDITIVE **§3a adversarial-regression set `R1`..`R4`** (30 rows total) while
  `tests/unit-o-0-hook-contract.test.ts` gained **`B9`** (31 total). **R1 is WITHDRAWN (R-1,
  §7 row 1) and `R2`/`R3`/`R4`/`B9` stand RED**, against the module/handle as they are today
  (`src/shared/o0-report.ts` `:285-297`, `:389-405`, `:121-125`; `src/renderer/runtime.ts:75-77`).
  The previous edition's "`R1`..`R4` are a NEW RED set" framing is superseded by §7's table
  (which records each finding's disposition) and by §12 (the live-run record).
- **The red set is the property/pure-module red set** (§5), run and reported BEFORE
  the validator/harness implementation — that is O-0's TDD surface
  (`gnosis-offload-review.md:117-120` names exactly this precedent for O-5;
  O-0's is the report schema + reconciliation).
- **The adversarial pass (RCA-3) is RECORDED** — §7's table holds 13 findings (1 rejected,
  4 MUST-FIX, 5 SHOULD, 3 TEST remands) with sites verified against the tree. **The doc-review
  (RCA-6) is OWED** and must run after the re-run, reconciling this spec's census claims, the
  stage ids, the block names, the driver's line anchors and the artifact's actual numbers
  against the build.
- **Doc-review record path convention:** `archive/reviews/<date>-unit-o-0-doc-review.md`
  (the AGENTS.md item 10d / RCA-6 convention). Run after the FIXED live re-run, reconciling
  this spec's census claims, the stage ids, the block names, the driver's line anchors and
  the artifact's actual numbers against the build.
- **Evidence for the gate:** (a) this spec file; (b) the harness blocks in
  `scripts/live-drive.mjs`; (c) the committed artifact with the run command + the
  bundle identity; (d) the trio output; (e) the doc-review record. **An O-0 accepted
  without (c) does not open the delegation gate for any unit** (§Status).

---

## 12. THE LIVE-RUN RECORD (first run, 2026-09-17) — artifact status

**STATUS (normative): the artifact `docs/specs/unit-o-0-per-stage-breakdown.md` is
SUPERSEDED-PENDING-FIX. The unit O-0 is OPEN, not DONE. A re-run on the fixed bundle is
MANDATORY before the delegation gate for O-5 may open.** The artifact below is the
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
reconciliation succeeds, which no run could satisfy).

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
  (505 ms / two 439 ms tasks — `docs/defects.md:22`), while the **identical gesture** under
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

**`docs/decisions.md` and `docs/pending.md` are deliberately NOT edited by this pass.** The
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
