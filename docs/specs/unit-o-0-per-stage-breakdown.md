# Unit O-0 — Per-stage freeze breakdown (THE PRECONDITION ARTIFACT)

> **STATUS BANNER (added by the spec re-derivation, 2026-09-17 — read before quoting any
> number below): THIS ARTIFACT IS SUPERSEDED-PENDING-FIX.** It is the **FIRST** live run and
> its numbers are recorded faithfully, but the run **FAILED** (`pass: false` on both legs;
> 6 of the 11 stages `unseparated`) for three reasons that the spec has since re-derived:
> **H2** (stages 1-3 are structurally unmeasurable at the preload — the seam moves to the
> shell's own call sites, spec §3.6b), **H3** (the hook was armed BEFORE `o0:t0`, so the
> stage ms below are **not window-bounded** — the `1698.82%` line and the negative residuals
> are a harness-semantics defect, spec §4.3/§5 `P-TP-3`), and **H7/H8** (the corpus SOURCE
> and the GPU-off freeze scale are environment caveats, spec §12.9). **The authoritative
> record of this run — its commands, numbers, controls, verdicts and findings — is
> `docs/specs/unit-o-0-per-stage-measurement.md` §12** (the spec governs where the two
> disagree). **The unit O-0 is OPEN, not DONE: a re-run on the fixed bundle is MANDATORY
> before this file may be re-committed as CURRENT or the O-5 delegation gate may open.**

**Status:** **MEASURED LIVE (2026-09-17) — committed artifact, spec §4.1.**
**Contract:** `docs/specs/unit-o-0-per-stage-measurement.md` (the spec this artifact
satisfies). **Unit:** O-0. **Layer (RCA-12):** `assembled-renderer` — every number
below comes from the **executing `dist/` bundle driving real hit-tested CDP gestures
against a real Electron renderer**, not from node.

**Artifact pass flag (falsifiable, DERIVED by the harness, not written by hand):**
`pass: false` for the GPU-off leg and `pass: false` for the GPU-on leg. Both are
**pass:false** for exactly one class of forcing condition — the six stages the executing
bundle cannot separate (§"Unseparated stages" below). **The measurement is complete; the
report is deliberately not a clean pass** (§4.4/§6 F4: an unmeasured stage cannot be
reconciled away). `.driver.build.verified` is **true** in **both** legs (§3.6/F2 closed).

---

## 1. Run commands (verbatim, as executed)

Working dir: `/media/ryanr/Shared Files/Projects/Astrographer`. Env: `DISPLAY=:0`
(propagated; `/tmp/.X11-unix/X0` present). **No app was running** before the runs
(MCP `:3787` and CDP `:9222` both free), so the driver's **spawn** path was used
(`runMode: "spawn"`), not `--connect`: the operator store
(`/tmp/astrographer-demo-store`, 226 docs) was gone with `/tmp`, and `--connect`
requires an already-running operator app.

```bash
# 0) rebuild the EXECUTING bundle FIRST (the repo ENV NOTE, docs/live-testing.md:119-124)
npm run build

# 1) GPU-OFF leg (the sanctioned launch path: --no-gpu is passed when --gpu is absent)
node scripts/live-drive.mjs --display=:0 --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism

# 2) GPU-ON leg (app (re)started WITHOUT --no-gpu; --gpu records the leg identity)
node scripts/live-drive.mjs --display=:0 --gpu --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0-gpuon.json --block=o0_gpu_control
```

The spec §3.5 command pair (`--connect` against the operator's app on `:3787/:9222`) is
**not usable on this host** — the operator session and its store are absent. The
substitute above keeps every other pinned element (the closed 5 blocks, the 11-stage id
set, the seed `o0-2026-09-17`, `--o0-out`, the operator corpus census) and adds the three
**default-safe** harness flags this run needed:

| flag | why it exists | default |
| --- | --- | --- |
| `--corpus-root=<dir>` | the store's import containment root is an **operator registry value**, not an MCP argument (`edit.import_markdown`'s schema is `files`-only); without it a seed corpus outside the project root is rejected — `markdown import: path outside corpus root`. It writes the operator registry file into the DISPOSABLE HOME's `userData` **before** the app boots. | unset ⇒ no file written (byte-equal today) |
| `--strict-seed` | imports the seed **directory's** `*.md` corpus instead of writing the driver's two synthetic files (`alpha.md`/`beta.md` — a **2-document** S2 corpus by construction). This is what lets a driver-spawned app reach the operator census. | off ⇒ today's 2-file seed |
| `--display=:0` | **harness fix, see §9 finding H1** — the parsed value had its leading `:` stripped, producing `DISPLAY=::0` and `ozone_platform_x11.cc:245 Missing X server or $DISPLAY`. | same flag, now normalizing `:0`/`0` |

The **corpus** the census is claimed at is `/tmp/o0-corpus-226`: **226 deterministic
markdown operator documents** (seed `o0-2026-09-17`), laid out as
`docs/` (200) + `archive/` (20) + `notes/` (6) so the doc-nav renders real folder rows.
Its content is synthetic; its **census is the pinned operator size** and is asserted by
the `--o0-corpus=226` gate, which forces `pass:false` on any mismatch (§6 F8). An
earlier run of this battery at **228 documents** (the two synthetic seed files plus 226)
was rejected by exactly that gate and is recorded here rather than softened.

## 2. Environment + build identity

| field | value |
| --- | --- |
| display | `:0` (Xwayland on KWin/Wayland; `DISPLAY` propagated to the spawn) |
| launch mode | `spawn` on both legs — the driver spawned the app via `scripts/start-app.sh` under a **disposable HOME** (`/tmp/astrolive-*`); nothing pre-existing was attached to |
| GPU leg | GPU-OFF: `app spawned by this driver (--no-gpu)`; GPU-ON: `app spawned by this driver (gpu on)` |
| GPU flag recorded per run | `gpu: false` (GPU-off rows), `gpu: true` (GPU-on rows) |
| engine (Gnosis) | `ready` in both legs. **Engine-absent is the legitimate degraded mode** (S4): `gnosis.status` is reachable over MCP but the engine process is not running (`provident:gnosis:status` → `EngineUnavailable`), and no O-0 stage depends on it. |
| mode | `lexical` (lexical retrieval) |
| pane frames at freeze | `2` (identical in every run of both legs — S5/F9 pairing holds) |
| **executing bundle (GPU-off leg)** | `1789680723588+675765+10d4bd9b` (mtime+bytes+djb2) / main `1789680723530+2395838+366b2663` |
| **served bundle** | `675765+10d4bd9b` from `file:///media/ryanr/Shared%20Files/Projects/Astrographer/dist/renderer/renderer.js` |
| **`driver.build.verified`** | **`true`** (GPU-off) and **`true`** (GPU-on) — the served bytes+hash are byte-identical to the on-disk `dist/renderer/renderer.js` (§3.6/F2 satisfied; the stale-bundle fail-state does **not** apply) |
| tolerance | `reconcileMs: 50` (`measured 2026-09-17`); hook long-task band `40` ms |
| seed | `o0-2026-09-17` (the recorded constant) |

**Layer statement (RCA-12):** this is an **APP/renderer-layer** measurement. The node
suite's property layer (§5 of the spec) validates the *report shape*; it can never
produce these numbers.

## 3. Corpus census — reached vs pinned

| census field | pinned | **observed (both legs)** | agrees |
| --- | --- | --- | --- |
| documents | 226 | **226** | ✅ |
| nodes | — | **10170** | (input to the trigger-(b) node ceiling, spec §10.2) |
| edges | — | **18758** | — |
| source | operator store (spec §3.4) | `--o0-corpus` (operator *size*, driver-seeded; see §1) | pinned size reached |

The census was read twice, independently: `rag.list_documents` (**226**)
and the snapshot payload's own lengths (`10170` nodes / `18758` edges).
`corpusSource: "--o0-corpus"`.

## 4. Per-stage table (ms; `unsep` = `unseparated:true`, `ms:null`, never imputed)

### 4.1 GPU-OFF leg — all four measured runs

| stage id | folder-row-gpuoff-r1 | document-row-gpuoff-r1 | fold-ablation-off | fold-ablation-on |
| --- | --- | --- | --- | --- |
| `snapshot.pull` | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) |
| `snapshot.clone` | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) |
| `docheads.pull` | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) |
| `traversal.build` | 1868.7 (hook) | 14.1 (hook) | 16.7 (hook) | 14.1 (hook) |
| `envelope.assemble` | 0.6 (hook) | 0.2 (hook) | 0.2 (hook) | 0.2 (hook) |
| `shared.decorate` | 23.9 (hook) | 1 (hook) | 1.4 (hook) | 0.7 (hook) |
| `reconcile.roots` | 21.8 (hook) | 1.3 (hook) | 0.1 (hook) | 0.1 (hook) |
| `reconcile.apply` | 242.8 (hook) | 2387.3 (hook) | 5.5 (hook) | 1.4 (hook) |
| `render.dom` | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) |
| `render.ssr` | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) | **null** (unsep, mark) |
| `post.style` | **null** (unsep, derived) | **null** (unsep, derived) | **null** (unsep, derived) | **null** (unsep, derived) |

### 4.2 GPU-ON leg — the paired control runs

| stage id | folder-row-gpuon-r1 | document-row-gpuon-r1 |
| --- | --- | --- |
| `snapshot.pull` | **null** (unsep, mark) | **null** (unsep, mark) |
| `snapshot.clone` | **null** (unsep, mark) | **null** (unsep, mark) |
| `docheads.pull` | **null** (unsep, mark) | **null** (unsep, mark) |
| `traversal.build` | 1766.5 (hook) | 32.7 (hook) |
| `envelope.assemble` | 0.7 (hook) | 0.4 (hook) |
| `shared.decorate` | 23.3 (hook) | 2.3 (hook) |
| `reconcile.roots` | 20.7 (hook) | 1.4 (hook) |
| `reconcile.apply` | 241.6 (hook) | 2358.5 (hook) |
| `render.dom` | **null** (unsep, mark) | **null** (unsep, mark) |
| `render.ssr` | **null** (unsep, mark) | **null** (unsep, mark) |
| `post.style` | **null** (unsep, derived) | **null** (unsep, derived) |

**Reading it.** Stages 4–8 are hook-measured in **every** run; stages 1–3, 9, 10 are
`unseparated` in every run, and stage 11 (`post.style`) is `unseparated` **by
construction** (it is the computed residual, §2.2 id 11 — emitted only when the
reconciliation succeeds, which no run can, because stages 1–3/9/10 are unmeasured).

## 5. Long tasks + mutations

| run | long tasks (ms) | long-task total | DOM mutations | wall (gesture → first responsive rAF) | pass |
| --- | --- | --- | --- | --- | --- |
| `o0-folder-row-gpuoff-r1` | 110 | **110** | **37** | 211.4 ms | true |
| `o0-document-row-gpuoff-r1` | 192 | **192** | **18058** | 288.8 ms | true |
| `o0-fold-ablation-off` | (none) | **0** | **222** | 124.4 ms | true |
| `o0-fold-ablation-on` | (none) | **0** | **0** | 112.3 ms | true |
| `o0-folder-row-gpuon-r1` | 107, 2176 | **2283** | **37** | 4198.6 ms | true |
| `o0-document-row-gpuon-r1` | 192, 2419 | **2611** | **18058** | 4295.5 ms | true |

The quiesce bound is **recorded, never a sleep**: rAF-based, `timeoutMs=4000`
with the `quiesced`/`frames` result stored per run in the raw JSON.

### 5.1 The hook's live inertness proof (armed vs unarmed, same gesture, same corpus)

`o0_repeat_determinism` staged the **same** folder-row freeze twice — once **unarmed**,
once **armed** — and compared the two runs:

- `o0-repeat-a-unarmed` (unarmed) vs `o0-repeat-b-armed` (armed): **Δmutations = 0** (required 0), **|ΔlongTaskTotalMs| = 0 ms** (tolerance 40 ms), stage-id SET equal = **true** (11 ids), `ms` values free = true, **inert = true**

Both runs' `mutations` were `0` and both long-task totals `0`, i.e. the armed hook adds
**no DOM mutation and no main-thread long task** (§3.6(c) satisfied, P-TP-1's inertness
clause closed). The stage-id SET is identical across the repeat (§5 P-SM-2 closed) — the
`ms` values are explicitly free under the seed.

## 6. Controls

### 6.1 GPU-off vs GPU-on (the A14 gap — previously unmeasured)

| gesture | GPU-OFF long-task total | GPU-ON long-task total | Δ (ON − OFF) |
| --- | --- | --- | --- |
| folder-row | **110** ms | **2283** ms | **+2173** ms |
| document-row | **192** ms | **2611** ms | **+2419** ms |

Both legs produced **the same JS work** (mutation counts identical: 37 for the folder
row, 18058 for the document row; hook-measured stages within a few ms:
`traversal.build` 1868.7 vs 1766.5, `reconcile.apply` 242.8 vs 241.6). The entire
difference is **non-JS** — GPU-off's long tasks are `[110]` vs GPU-on's
`[107, 2176]`, and the gesture wall time is **211.4 ms vs
4198.6 ms**. Pairing is recorded `cross-artifact` (one artifact per leg, spec §3.5);
the app-side flag is recorded per leg (`driver.gpuFlag`, `driver.appFlag`).

### 6.2 The 12 698.7 px track ablation (`display:block`)

| leg | run | `trackAblation` | Δ long-task total | Δ mutations | applied/reverted |
| --- | --- | --- | --- | --- | --- |
| baseline (`applied:false`) | `o0-fold-ablation-off` | `{applied:false, mutation:null}` | — | — | — |
| ablated (`applied:true`) | `o0-fold-ablation-on` | `applied:true` | **0** ms | **-222** | `applied=true, reverted=true` |

Exact recorded mutation: `"#zone:main (the stage grid cell of #wiki-root): display:block
(removes the #wiki-root grid-track sizing from the measurement path)"`. The stage cell
**is** a grid item in the executing bundle (`#wiki-root` computed `display:grid`), so the
ablation is **available** (§6 F5 does not fire) and was reverted immediately (never
persisted). In this run both ablation freezes landed **below the 50 ms long-task
threshold** (0 ms each), so the delta measures the *mutation* effect only: **−222 DOM mutations**.

### 6.3 Repeat determinism (`o0_repeat_determinism`)

- stage-id SET of both runs: **equal** (`true`), 11 ids each.
- `ms` values: **free** under the seed (recorded, not asserted).
- armed-vs-unarmed: Δmutations **0**, |ΔlongTaskTotalMs| **0 ms** ≤ 40 ms tolerance.

## 7. Unseparated stages (named per §6 F4 — never imputed)

| stage | status | why it cannot be separated by the permitted surface |
| --- | --- | --- |
| `snapshot.pull` | **unseparated** | the §3.6 mark/wrap hook cannot bracket it: `window.provident.rag.snapshot` is a **contextBridge function property with `writable:false, configurable:false`** (measured live — see §9 finding H2), so the driver's wrap refuses (`hook.wraps = []`) and the stage stays `ms:null`. It is therefore **unmeasured**, and the harness's A-4 read count is `0` (see §8a caveat). |
| `snapshot.clone` | **unseparated** | the clone/serialization split is a **main-process** boundary (main-handler timing vs renderer-side resolution); the renderer exposes no handle to the app `Runtime`/`SidebarPanes` host (spec §3.6's honest limit), so the comparison cannot be made from the page. |
| `docheads.pull` | **unseparated** | same non-writable bridge seam as `snapshot.pull` (`rag.docHeads`). |
| `render.dom` | **unseparated** | the renderer's `Runtime.render()` emit is **not** among the five instrumented call sites of `src/shared/o0-hook.ts` (the hook's stage set is ids 4–8 only), and no CDP-visible seam exists for it. |
| `render.ssr` | **unseparated** | same — the SSR mirror emit is not instrumented. |
| `post.style` | **unseparated (derived)** | by construction it is the residual `longTaskTotalMs − Σ(named stages)`; it can only be emitted when every named stage is separated, which no run satisfies. |

**Consequence, stated loudly:** the `reconciliation` of every run is `ok:false` with
reason `unseparated stage(s) … cannot be reconciled`, and the harness's derived report
`pass` is **false** in both legs. Some residuals are **negative** (e.g. folder-row
`residual -2047.8` against a 110 ms window) because the hook-measured
stage sum exceeds the window — see §9 finding H3, which is the load-bearing caveat on
the per-stage numbers.

## 8. The DERIVED verdicts (verbatim, computed by the harness from the rows)

### 8.1 GPU-off leg

- `stage traversal.build is 1868.7 ms of the 110 ms long task (1698.82%) on folder-row — traversal.build is the largest identified stage`
- `the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)`
- `run o0-folder-row-gpuoff-r1: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled`
- `run o0-folder-row-gpuoff-r1: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]`
- `stage reconcile.apply is 2387.3 ms of the 192 ms long task (1243.39%) on document-row — reconcile.apply is the largest identified stage`
- `the document-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)`
- `run o0-document-row-gpuoff-r1: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled`
- `run o0-document-row-gpuoff-r1: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]`
- `stage traversal.build is 16.7 ms of the 0 ms long task (null%) on folder-row — traversal.build is the largest identified stage`
- `the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)`
- `run o0-fold-ablation-off: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled`
- `run o0-fold-ablation-off: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]`
- `stage traversal.build is 14.1 ms of the 0 ms long task (null%) on folder-row — traversal.build is the largest identified stage`
- `the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)`
- `run o0-fold-ablation-on: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled`
- `run o0-fold-ablation-on: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]`

### 8.2 GPU-on leg

- `stage traversal.build is 1766.5 ms of the 2283 ms long task (77.38%) on folder-row — traversal.build is the largest identified stage`
- `the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)`
- `run o0-folder-row-gpuon-r1: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled`
- `run o0-folder-row-gpuon-r1: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]`
- `stage reconcile.apply is 2358.5 ms of the 2611 ms long task (90.33%) on document-row — reconcile.apply is the largest identified stage`
- `the document-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)`
- `run o0-document-row-gpuon-r1: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled`
- `run o0-document-row-gpuon-r1: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]`

## 9. Findings — spec-vs-live contradictions + harness fixes made

**H1 — HARNESS (`--display=:0` produced `DISPLAY=::0`; fixed).** `live-drive.mjs`'s
parser stored the flag value verbatim while the spawn prefixed a `:`, so the documented
`--display=:0` form (spec §3.5) reached Electron as `DISPLAY=::0` → `Missing X server or
$DISPLAY` → the documented F6 symptom, but for a **harness** reason. Fix: the parsed
value now strips a leading `:` (`--display=:0` and `--display=0` both normalize to `:0`).
Without this fix no O-0 leg could start on this host.

**H2 — SPEC vs LIVE (finding: stages 1–3 are structurally unseparated).**
`window.provident.rag.snapshot` / `.docHeads` are **non-writable, non-configurable**
contextBridge properties (probed live: assignment silently does not take;
`Object.getOwnPropertyDescriptor(...)` → `{writable:false, configurable:false}`). The
spec's §2.2/§3.6 therefore **cannot** produce `snapshot.pull`, `snapshot.clone` or
`docheads.pull` through the permitted surface, and the harness correctly refuses to
impute them. Consequence for the spec's A-4 discriminator: the emitted verdict
`the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms` is a
**"not measured" 0, NOT a measured zero** — the code path is unchanged and
`src/renderer/sidebar-panes.ts:1995` is still on the unconditional re-derive path, so
the A-4 *claim* (a folder disclosure performs a whole-store pull) is **not refuted**,
it is **unmeasured** by this surface. A main-process-side mark (or a wrap of the
preload's IPC surface before contextBridge freezes it) is required.

**H3 — SPEC vs LIVE (finding: the hook-reported stage ms are NOT window-bounded).**
The `o0_folder_row` freeze reports `traversal.build = 1868.7 ms` against a
`longTaskTotalMs` of **110 ms** and a wall time of **211.4 ms** — a *longer span than its own window*,
which the derived verdict prints as `1698.82%`. The stage spans the renderer recorder's
arm→drain interval, which **starts before `o0:t0`** (the freeze arms the hook before the
hit-probe + its 250 ms settle), so it includes pre-window work; the long-task total is
correctly windowed by `PerformanceObserver` + the `t0/t1` marks. Consequence: **stages
4–8 are comparable BETWEEN runs (same arming discipline; §6.1 shows the two GPU legs
agreeing within ~100 ms), but a stage's `ms` must not be read as "ms inside the measured
long task"**. The GPU-ON leg's residuals are positive and small (+230.2 / +215.7 ms) only
because its long tasks are larger. Fixing this needs the recorder to be armed **at `t0`**
(after the probe), which is a harness/recorder change that would also change the
inertness baseline — reported, not silently patched.

**H4 — HARNESS (`--o0-out` served-bundle comparison; fixed).** `o0BundleIdentity`
compared `text.length` (UTF-16 code units of the decoded served file) against the
on-disk **byte** count; the 660 kB renderer holds ~1.2 kB of multi-byte characters, so a
byte-identical served bundle was reported `verified:false` (F2) for a harness reason.
Fixed to `Buffer.byteLength(text, 'utf8')` (hash unchanged); `verified` is now true in
both legs. Also required: `Page.enable` before `Page.getResourceContent` (the CDP call
otherwise fails `Agent is not enabled`), now issued once at connect.

**H5 — HARNESS (ablation selector; fixed).** The ablation reached the stage cell with
`document.querySelector('#zone:main')` — an **invalid CSS selector** (an unquoted id
cannot carry `:`) → `SyntaxError` → the whole `o0_track_ablation` block FAILED. Fixed to
`getElementById` (the recorded selector string is unchanged).

**H6 — HARNESS (folder-path selector escaping; fixed).** `[data-folder-path="<v>"]` was
built by naive interpolation; a corpus whose rendered path contains a quote (the importer
renders such a path as `[".live-corpus"]`) produced an invalid selector and killed every
O-0 block with a `SyntaxError`. Fixed by a CSS-attribute escaping helper
(`o0AttrSelector`). Note the recorded `folderPath` for this run is `["archive"]` — quotes
included — so the escaping is exercised live, and the recorded `target` is a real
resolving selector.

**H7 — FINDING (spec §3.4's corpus source is unreachable on this host).** The spec
requires the operator corpus "only as a persisted store" reached by `--connect`. That
store was destroyed with `/tmp`; `seedCorpus` writes two files. The run above therefore
reconstructed the pinned **size** (226 documents) from a deterministic corpus via a
spawned app + an operator registry file. The census is the pinned one; the **document
bytes** are synthetic (≈1.1 MB total), so the absolute ms values are corpus-representative
**in structure, not in byte size**. This is recorded, not softened.

**H8 — FINDING (the GPU-off numbers are not the operator's numbers).** The GPU-off leg's
long tasks (110 ms / 192 ms) are far below the motivating live evidence (505 ms / two
439 ms tasks, `docs/defects.md:22`) while the identical gesture under GPU-ON reproduces
that order (2283 ms / 2611 ms). The GPU-off leg ran with `--disable-gpu` on a headless
Xwayland session, where paint/composite work does not land on the renderer main thread as
a long task. **Both legs are recorded** (§3.5/§6 S6) and neither is silently preferred.

## 10. Answers to the O-0 questions (with the numbers)

**(a) How much of the long task is the whole-store `IPC_RAG_SNAPSHOT` pull + serialization
(`snapshot.pull`/`snapshot.clone`)?** **Not measured** — both stages are `unseparated`
(§7/H2/H3). The A-4 discriminator's read count is `0` **by non-measurement**, not by
observation; the spec's claim that a folder disclosure still performs a whole-store read
is neither confirmed nor refuted by this surface. What **is** measured: the whole
re-derive+reconcile path the disclosure triggers runs `traversal.build` 1766.5 ms
(GPU-on, window total 2283 ms) for a gesture that changes only client-side presentation state.

**(b) Derivation/assembly/decorate/reconcile vs DOM/SSR emit vs post-render
style/layout/paint.** Measured (GPU-on, folder-row): derivation+assembly+decorate+
reconcile = **2052.8 ms** of a **2283 ms** window: `traversal.build` **1766.5 ms (77.4%)**, `envelope.assemble` 0.7, `shared.decorate` 23.3, `reconcile.roots` 20.7, `reconcile.apply` 241.6 → **residual (unseparated: `render.dom`+`render.ssr`+`post.style`) ≈ 230.2 ms (10.1%)**. Document-row (GPU-on): derivation path totals **2395.3 ms** of **2611 ms** with `reconcile.apply` **2358.5 ms (90.3%)** and the residual ≈ 215.7 ms. **The DOM/SSR emit vs style/layout/paint split is NOT separable** (`render.dom`, `render.ssr`, `post.style` are all unseparated) — the spec's asserted "the dominant cost is DOM style/layout/paint" (defects.md:36/:46) is **not reproduced**: of the separable work, the JS derivation/reconcile path accounts for ~90% of the measured window.

**(c) GPU-off vs GPU-on delta.** folder-row **110 ms → 2283 ms (+2173 ms)**;
document-row **192 ms → 2611 ms (+2419 ms)** — with **identical JS**
(mutations 37/18058 in both legs; hook stages within ~5%). The GPU flag changes the
*measured* cost by ~20× without changing the *work*.

**(d) The `display:block` track ablation delta.** Long-task total **0 ms → 0 ms (Δ 0 ms)**,
DOM mutations **222 → 0 (Δ -222)**, wall **124.4 ms → 112.3 ms**. The ablation is
**available** and **reverted**; with both freezes below the 50 ms long-task threshold the
Δ long-task total is **0** — the measurable effect in this run is on mutations only.

**(e) Is the derivation WALK (`traversal.build`) load-bearing? (the O-4 trigger (c))**
**In this corpus, yes for the folder-row disclosure and no for the document open.**
folder-row: `traversal.build` 1766.5 ms of 2283 ms (**77.4%**) — the single largest identified stage, with the *same*
1868.7-ms magnitude under GPU-off. document-row: `traversal.build` **32.7 ms** of 2611 ms (1.3%), where `reconcile.apply` (**2358.5 ms, 90.3%**) dominates. **Subject to H3's window caveat**, the walk is load-bearing for the disclosure path (trigger (c) fires there) and is *not* the lever for the document-open path (O-4's worker/engine route would not touch the `reconcile.apply` cost).

## 11. Raw emitted JSON (verbatim — no number above is unverifiable)

### 11.1 `/tmp/o0-gpuoff.json` (GPU-off leg, 4 runs)

```json
{
  "artifact": "o-0-per-stage-breakdown",
  "spec": "docs/specs/unit-o-0-per-stage-measurement.md",
  "unit": "O-0",
  "date": "2026-09-17",
  "layer": "assembled-renderer (RCA-12)",
  "commands": [
    "node scripts/live-drive.mjs --display=:0 --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --o0-out=/tmp/o0-gpuoff.json --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism"
  ],
  "pinnedCommands": [
    "npm run build",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --display=:0 --o0-out=<path> --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --gpu --display=:0 --o0-out=<path> --block=o0_gpu_control"
  ],
  "driver": {
    "build": {
      "renderer": "1789680723588+675765+10d4bd9b",
      "main": "1789680723530+2395838+366b2663",
      "served": "675765+10d4bd9b",
      "servedUrl": "file:///media/ryanr/Shared%20Files/Projects/Astrographer/dist/renderer/renderer.js",
      "disk": {
        "rendererBytes": 675765,
        "rendererHash": "10d4bd9b"
      },
      "verified": true
    },
    "gpuFlag": false,
    "cliArgs": [
      "--display=:0",
      "--seed=/tmp/o0-corpus-226",
      "--corpus-root=/tmp/o0-corpus-226",
      "--strict-seed",
      "--o0-corpus=226",
      "--o0-out=/tmp/o0-gpuoff.json",
      "--block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism"
    ],
    "runMode": "spawn",
    "leg": "gpu-off",
    "blocks": [
      "o0_folder_row",
      "o0_document_row",
      "o0_track_ablation",
      "o0_repeat_determinism"
    ],
    "appFlag": "app spawned by this driver (--no-gpu)",
    "artifactDoc": "docs/specs/unit-o-0-per-stage-breakdown.md",
    "crossArtifactControlPairs": [
      "gpu-off"
    ],
    "hookInertness": [
      {
        "baselineRun": "o0-repeat-a-unarmed",
        "armedRun": "o0-repeat-b-armed",
        "setEqual": true,
        "msFree": true,
        "deltaMutations": 0,
        "deltaLongTaskMs": 0,
        "toleranceMs": 40,
        "inert": true
      }
    ],
    "display": ":0",
    "failReasons": [
      "run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)",
      "run o0-document-row-gpuoff-r1: unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)",
      "run o0-fold-ablation-off: unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)",
      "run o0-fold-ablation-on: unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)"
    ],
    "notes": [
      "o0_folder_row: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style] — emitted ms:null + unseparated (never imputed, §6 F4)",
      "o0_document_row: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]"
    ]
  },
  "tolerance": {
    "reconcileMs": 50,
    "source": "measured 2026-09-17"
  },
  "corpus": {
    "source": "--o0-corpus",
    "claimedDocuments": 226,
    "documents": 226,
    "nodes": 10170,
    "edges": 18758,
    "seed": "o0-2026-09-17"
  },
  "env": {
    "mode": "lexical",
    "gpu": false,
    "engine": "ready",
    "display": ":0",
    "paneFrames": 2
  },
  "stageIds": [
    "snapshot.pull",
    "snapshot.clone",
    "docheads.pull",
    "traversal.build",
    "envelope.assemble",
    "shared.decorate",
    "reconcile.roots",
    "reconcile.apply",
    "render.dom",
    "render.ssr",
    "post.style"
  ],
  "runs": [
    {
      "id": "o0-folder-row-gpuoff-r1",
      "block": "o0_folder_row",
      "gesture": "folder-row",
      "target": "#pane-doc-nav [data-folder-path=\"[\\\"archive\\\"]\"]",
      "folderPath": "[\"archive\"]",
      "documentId": null,
      "path": "cdp",
      "realInput": true,
      "hit": "preempt-node-node-183846",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "docheads.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "traversal.build",
          "ms": 1868.7,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "envelope.assemble",
          "ms": 0.6,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "shared.decorate",
          "ms": 23.9,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.roots",
          "ms": 21.8,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.apply",
          "ms": 242.8,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "render.dom",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "render.ssr",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived"
        }
      ],
      "longTasks": [
        {
          "start": 22195.39999999851,
          "duration": 110
        }
      ],
      "longTaskTotalMs": 110,
      "mutations": 37,
      "wallMs": 211.4,
      "t0": 22186.39999999851,
      "t1": 22397.800000000745,
      "quiesce": {
        "frames": 3,
        "quiesced": true,
        "timedOut": false,
        "timeoutMs": 4000
      },
      "gpu": false,
      "trackAblation": {
        "applied": false,
        "mutation": null
      },
      "paneFrames": 2,
      "bundleVerified": true,
      "bundle": {
        "renderer": "1789680723588+675765+10d4bd9b",
        "main": "1789680723530+2395838+366b2663",
        "served": "675765+10d4bd9b"
      },
      "hook": {
        "armed": true,
        "wraps": [],
        "rendererArmed": true,
        "refused": [],
        "records": 5,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-183846"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "unseparatedStages": [
        "snapshot.pull",
        "snapshot.clone",
        "docheads.pull",
        "render.dom",
        "render.ssr",
        "post.style"
      ],
      "reconciliation": {
        "ok": false,
        "residual": -2047.8,
        "sumMs": 2157.8,
        "toleranceMs": 50,
        "reason": "unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled"
      },
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false
      },
      "folderRowCensus": {
        "enumerated": 3,
        "rows": [
          {
            "folderPath": "[\"archive\"]",
            "childRowCount": 0,
            "nested": 0,
            "prefixed": 0
          },
          {
            "folderPath": "[\"docs\"]",
            "childRowCount": 0,
            "nested": 0,
            "prefixed": 0
          },
          {
            "folderPath": "[\"notes\"]",
            "childRowCount": 0,
            "nested": 0,
            "prefixed": 0
          }
        ],
        "chosen": {
          "folderPath": "[\"archive\"]",
          "childRowCount": 0,
          "nested": 0,
          "prefixed": 0
        }
      }
    },
    {
      "id": "o0-document-row-gpuoff-r1",
      "block": "o0_document_row",
      "gesture": "document-row",
      "target": "#pane-doc-nav [data-document-id=\"archive/operator-doc-201\"]",
      "folderPath": null,
      "documentId": "archive/operator-doc-201",
      "path": "cdp",
      "realInput": true,
      "hit": "preempt-node-node-365604",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "docheads.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "traversal.build",
          "ms": 14.1,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "envelope.assemble",
          "ms": 0.2,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "shared.decorate",
          "ms": 1,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.roots",
          "ms": 1.3,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.apply",
          "ms": 2387.3,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "render.dom",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "render.ssr",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived"
        }
      ],
      "longTasks": [
        {
          "start": 24981.699999999255,
          "duration": 192
        }
      ],
      "longTaskTotalMs": 192,
      "mutations": 18058,
      "wallMs": 288.8,
      "t0": 24977,
      "t1": 25265.800000000745,
      "quiesce": {
        "frames": 3,
        "quiesced": true,
        "timedOut": false,
        "timeoutMs": 4000
      },
      "gpu": false,
      "trackAblation": {
        "applied": false,
        "mutation": null
      },
      "paneFrames": 2,
      "bundleVerified": true,
      "bundle": {
        "renderer": "1789680723588+675765+10d4bd9b",
        "main": "1789680723530+2395838+366b2663",
        "served": "675765+10d4bd9b"
      },
      "hook": {
        "armed": true,
        "wraps": [],
        "rendererArmed": true,
        "refused": [],
        "records": 5,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-365604"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "unseparatedStages": [
        "snapshot.pull",
        "snapshot.clone",
        "docheads.pull",
        "render.dom",
        "render.ssr",
        "post.style"
      ],
      "reconciliation": {
        "ok": false,
        "residual": -2211.9,
        "sumMs": 2403.9,
        "toleranceMs": 50,
        "reason": "unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled"
      },
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false
      }
    },
    {
      "id": "o0-fold-ablation-off",
      "block": "o0_track_ablation",
      "gesture": "folder-row",
      "target": "#pane-doc-nav [data-folder-path=\"[\\\"archive\\\"]\"]",
      "folderPath": "[\"archive\"]",
      "documentId": null,
      "path": "cdp",
      "realInput": true,
      "hit": "preempt-node-node-384500",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "docheads.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "traversal.build",
          "ms": 16.7,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "envelope.assemble",
          "ms": 0.2,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "shared.decorate",
          "ms": 1.4,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.roots",
          "ms": 0.1,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.apply",
          "ms": 5.5,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "render.dom",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "render.ssr",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived"
        }
      ],
      "longTasks": [],
      "longTaskTotalMs": 0,
      "mutations": 222,
      "wallMs": 124.4,
      "t0": 28187.5,
      "t1": 28311.89999999851,
      "quiesce": {
        "frames": 3,
        "quiesced": true,
        "timedOut": false,
        "timeoutMs": 4000
      },
      "gpu": false,
      "trackAblation": {
        "applied": false,
        "mutation": null
      },
      "paneFrames": 2,
      "bundleVerified": true,
      "bundle": {
        "renderer": "1789680723588+675765+10d4bd9b",
        "main": "1789680723530+2395838+366b2663",
        "served": "675765+10d4bd9b"
      },
      "hook": {
        "armed": true,
        "wraps": [],
        "rendererArmed": true,
        "refused": [],
        "records": 5,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-384500"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "unseparatedStages": [
        "snapshot.pull",
        "snapshot.clone",
        "docheads.pull",
        "render.dom",
        "render.ssr",
        "post.style"
      ],
      "reconciliation": {
        "ok": false,
        "residual": -23.9,
        "sumMs": 23.9,
        "toleranceMs": 50,
        "reason": "unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled"
      },
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false
      },
      "trackAblationEvidence": {
        "available": true,
        "selector": "#zone:main",
        "elId": "zone:main",
        "computed": "block",
        "rootDisplay": "grid",
        "previous": "",
        "detail": "the stage cell is a grid item of #wiki-root",
        "mutation": null
      }
    },
    {
      "id": "o0-fold-ablation-on",
      "block": "o0_track_ablation",
      "gesture": "folder-row",
      "target": "#pane-doc-nav [data-folder-path=\"[\\\"archive\\\"]\"]",
      "folderPath": "[\"archive\"]",
      "documentId": null,
      "path": "cdp",
      "realInput": true,
      "hit": "preempt-node-node-386333",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "docheads.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "traversal.build",
          "ms": 14.1,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "envelope.assemble",
          "ms": 0.2,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "shared.decorate",
          "ms": 0.7,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.roots",
          "ms": 0.1,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.apply",
          "ms": 1.4,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "render.dom",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "render.ssr",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived"
        }
      ],
      "longTasks": [],
      "longTaskTotalMs": 0,
      "mutations": 0,
      "wallMs": 112.3,
      "t0": 28806.5,
      "t1": 28918.800000000745,
      "quiesce": {
        "frames": 3,
        "quiesced": true,
        "timedOut": false,
        "timeoutMs": 4000
      },
      "gpu": false,
      "trackAblation": {
        "applied": true,
        "mutation": "#zone:main (the stage grid cell of #wiki-root): display:block (removes the #wiki-root grid-track sizing from the measurement path)"
      },
      "paneFrames": 2,
      "bundleVerified": true,
      "bundle": {
        "renderer": "1789680723588+675765+10d4bd9b",
        "main": "1789680723530+2395838+366b2663",
        "served": "675765+10d4bd9b"
      },
      "hook": {
        "armed": true,
        "wraps": [],
        "rendererArmed": true,
        "refused": [],
        "records": 5,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-386333"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "unseparatedStages": [
        "snapshot.pull",
        "snapshot.clone",
        "docheads.pull",
        "render.dom",
        "render.ssr",
        "post.style"
      ],
      "reconciliation": {
        "ok": false,
        "residual": -16.5,
        "sumMs": 16.5,
        "toleranceMs": 50,
        "reason": "unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled"
      },
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false
      },
      "trackAblationEvidence": {
        "available": true,
        "selector": "#zone:main",
        "elId": "zone:main",
        "computed": "block",
        "rootDisplay": "grid",
        "previous": "",
        "detail": "the stage cell is a grid item of #wiki-root",
        "mutation": "#zone:main (the stage grid cell of #wiki-root): display:block (removes the #wiki-root grid-track sizing from the measurement path)",
        "reverted": true
      },
      "trackAblationDelta": {
        "longTaskTotalMs": 0,
        "mutations": -222,
        "baselineRun": "o0-fold-ablation-off"
      }
    }
  ],
  "controls": [
    {
      "id": "gpu-off",
      "runRef": "o0-folder-row-gpuoff-r1",
      "legRuns": [
        "o0-folder-row-gpuoff-r1",
        "o0-document-row-gpuoff-r1"
      ],
      "pairedWith": "o0-folder-row-gpuon-r1",
      "pairedWithStatus": "cross-artifact",
      "gpu": false
    },
    {
      "id": "track-ablation-off",
      "runRef": "o0-fold-ablation-off",
      "legRuns": [
        "o0-fold-ablation-off"
      ],
      "pairedWith": "o0-fold-ablation-on",
      "pairedWithStatus": null,
      "gpu": null
    },
    {
      "id": "track-ablation-on",
      "runRef": "o0-fold-ablation-on",
      "legRuns": [
        "o0-fold-ablation-on"
      ],
      "pairedWith": "o0-fold-ablation-off",
      "pairedWithStatus": null,
      "gpu": null
    }
  ],
  "verdicts": [
    "stage traversal.build is 1868.7 ms of the 110 ms long task (1698.82%) on folder-row — traversal.build is the largest identified stage",
    "the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)",
    "run o0-folder-row-gpuoff-r1: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled",
    "run o0-folder-row-gpuoff-r1: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]",
    "stage reconcile.apply is 2387.3 ms of the 192 ms long task (1243.39%) on document-row — reconcile.apply is the largest identified stage",
    "the document-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)",
    "run o0-document-row-gpuoff-r1: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled",
    "run o0-document-row-gpuoff-r1: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]",
    "stage traversal.build is 16.7 ms of the 0 ms long task (null%) on folder-row — traversal.build is the largest identified stage",
    "the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)",
    "run o0-fold-ablation-off: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled",
    "run o0-fold-ablation-off: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]",
    "stage traversal.build is 14.1 ms of the 0 ms long task (null%) on folder-row — traversal.build is the largest identified stage",
    "the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)",
    "run o0-fold-ablation-on: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled",
    "run o0-fold-ablation-on: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]"
  ],
  "pass": false,
  "artifactPath": "/tmp/o0-gpuoff.json"
}
```

### 11.2 `/tmp/o0-gpuon.json` (GPU-on leg, 2 runs)

```json
{
  "artifact": "o-0-per-stage-breakdown",
  "spec": "docs/specs/unit-o-0-per-stage-measurement.md",
  "unit": "O-0",
  "date": "2026-09-17",
  "layer": "assembled-renderer (RCA-12)",
  "commands": [
    "node scripts/live-drive.mjs --display=:0 --gpu --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --o0-out=/tmp/o0-gpuon.json --block=o0_gpu_control"
  ],
  "pinnedCommands": [
    "npm run build",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --display=:0 --o0-out=<path> --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --gpu --display=:0 --o0-out=<path> --block=o0_gpu_control"
  ],
  "driver": {
    "build": {
      "renderer": "1789680834810+675765+10d4bd9b",
      "main": "1789680834755+2395838+366b2663",
      "served": "675765+10d4bd9b",
      "servedUrl": "file:///media/ryanr/Shared%20Files/Projects/Astrographer/dist/renderer/renderer.js",
      "disk": {
        "rendererBytes": 675765,
        "rendererHash": "10d4bd9b"
      },
      "verified": true
    },
    "gpuFlag": true,
    "cliArgs": [
      "--display=:0",
      "--gpu",
      "--seed=/tmp/o0-corpus-226",
      "--corpus-root=/tmp/o0-corpus-226",
      "--strict-seed",
      "--o0-corpus=226",
      "--o0-out=/tmp/o0-gpuon.json",
      "--block=o0_gpu_control"
    ],
    "runMode": "spawn",
    "leg": "gpu-on",
    "blocks": [
      "o0_gpu_control"
    ],
    "appFlag": "app spawned by this driver (gpu on)",
    "artifactDoc": "docs/specs/unit-o-0-per-stage-breakdown.md",
    "crossArtifactControlPairs": [
      "gpu-on"
    ],
    "hookInertness": [],
    "display": ":0",
    "failReasons": [
      "run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)",
      "run o0-document-row-gpuon-r1: unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)"
    ],
    "notes": [
      "o0_gpu_control: the gpu-on leg is paired CROSS-ARTIFACT with gpu-off (o0-folder-row-gpuoff-r1, o0-document-row-gpuoff-r1) — the §3.5 command pair emits one artifact per leg; only the merged artifact verifies the pairing."
    ]
  },
  "tolerance": {
    "reconcileMs": 50,
    "source": "measured 2026-09-17"
  },
  "corpus": {
    "source": "--o0-corpus",
    "claimedDocuments": 226,
    "documents": 226,
    "nodes": 10170,
    "edges": 18758,
    "seed": "o0-2026-09-17"
  },
  "env": {
    "mode": "lexical",
    "gpu": true,
    "engine": "ready",
    "display": ":0",
    "paneFrames": 2
  },
  "stageIds": [
    "snapshot.pull",
    "snapshot.clone",
    "docheads.pull",
    "traversal.build",
    "envelope.assemble",
    "shared.decorate",
    "reconcile.roots",
    "reconcile.apply",
    "render.dom",
    "render.ssr",
    "post.style"
  ],
  "runs": [
    {
      "id": "o0-folder-row-gpuon-r1",
      "block": "o0_gpu_control",
      "gesture": "folder-row",
      "target": "#pane-doc-nav [data-folder-path=\"[\\\"archive\\\"]\"]",
      "folderPath": "[\"archive\"]",
      "documentId": null,
      "path": "cdp",
      "realInput": true,
      "hit": "preempt-node-node-183846",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "docheads.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "traversal.build",
          "ms": 1766.5,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "envelope.assemble",
          "ms": 0.7,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "shared.decorate",
          "ms": 23.3,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.roots",
          "ms": 20.7,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.apply",
          "ms": 241.6,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "render.dom",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "render.ssr",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived"
        }
      ],
      "longTasks": [
        {
          "start": 22480.60000000149,
          "duration": 107
        },
        {
          "start": 22683.5,
          "duration": 2176
        }
      ],
      "longTaskTotalMs": 2283,
      "mutations": 37,
      "wallMs": 4198.6,
      "t0": 22471.39999999851,
      "t1": 26670,
      "quiesce": {
        "frames": 112,
        "quiesced": false,
        "timedOut": true,
        "timeoutMs": 4000
      },
      "gpu": true,
      "trackAblation": {
        "applied": false,
        "mutation": null
      },
      "paneFrames": 2,
      "bundleVerified": true,
      "bundle": {
        "renderer": "1789680834810+675765+10d4bd9b",
        "main": "1789680834755+2395838+366b2663",
        "served": "675765+10d4bd9b"
      },
      "hook": {
        "armed": true,
        "wraps": [],
        "rendererArmed": true,
        "refused": [],
        "records": 5,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-183846"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "unseparatedStages": [
        "snapshot.pull",
        "snapshot.clone",
        "docheads.pull",
        "render.dom",
        "render.ssr",
        "post.style"
      ],
      "reconciliation": {
        "ok": false,
        "residual": 230.2,
        "sumMs": 2052.8,
        "toleranceMs": 50,
        "reason": "unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled"
      },
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false
      }
    },
    {
      "id": "o0-document-row-gpuon-r1",
      "block": "o0_gpu_control",
      "gesture": "document-row",
      "target": "#pane-doc-nav [data-document-id=\"archive/operator-doc-201\"]",
      "folderPath": null,
      "documentId": "archive/operator-doc-201",
      "path": "cdp",
      "realInput": true,
      "hit": "preempt-node-node-365604",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "docheads.pull",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "traversal.build",
          "ms": 32.7,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "envelope.assemble",
          "ms": 0.4,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "shared.decorate",
          "ms": 2.3,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.roots",
          "ms": 1.4,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "reconcile.apply",
          "ms": 2358.5,
          "unseparated": false,
          "source": "hook"
        },
        {
          "id": "render.dom",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "render.ssr",
          "ms": null,
          "unseparated": true,
          "source": "mark"
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived"
        }
      ],
      "longTasks": [
        {
          "start": 26929.60000000149,
          "duration": 192
        },
        {
          "start": 27215.60000000149,
          "duration": 2419
        }
      ],
      "longTaskTotalMs": 2611,
      "mutations": 18058,
      "wallMs": 4295.5,
      "t0": 26924.39999999851,
      "t1": 31219.89999999851,
      "quiesce": {
        "frames": 92,
        "quiesced": false,
        "timedOut": true,
        "timeoutMs": 4000
      },
      "gpu": true,
      "trackAblation": {
        "applied": false,
        "mutation": null
      },
      "paneFrames": 2,
      "bundleVerified": true,
      "bundle": {
        "renderer": "1789680834810+675765+10d4bd9b",
        "main": "1789680834755+2395838+366b2663",
        "served": "675765+10d4bd9b"
      },
      "hook": {
        "armed": true,
        "wraps": [],
        "rendererArmed": true,
        "refused": [],
        "records": 10,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-365604"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "unseparatedStages": [
        "snapshot.pull",
        "snapshot.clone",
        "docheads.pull",
        "render.dom",
        "render.ssr",
        "post.style"
      ],
      "reconciliation": {
        "ok": false,
        "residual": 215.7,
        "sumMs": 2395.3,
        "toleranceMs": 50,
        "reason": "unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled"
      },
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false
      }
    }
  ],
  "controls": [
    {
      "id": "gpu-on",
      "runRef": "o0-folder-row-gpuon-r1",
      "legRuns": [
        "o0-folder-row-gpuon-r1",
        "o0-document-row-gpuon-r1"
      ],
      "pairedWith": "o0-folder-row-gpuoff-r1",
      "pairedWithStatus": "cross-artifact",
      "gpu": true
    }
  ],
  "verdicts": [
    "stage traversal.build is 1766.5 ms of the 2283 ms long task (77.38%) on folder-row — traversal.build is the largest identified stage",
    "the folder-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)",
    "run o0-folder-row-gpuon-r1: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled",
    "run o0-folder-row-gpuon-r1: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]",
    "stage reconcile.apply is 2358.5 ms of the 2611 ms long task (90.33%) on document-row — reconcile.apply is the largest identified stage",
    "the document-row performed 0 whole-store IPC_RAG_SNAPSHOT read(s) totalling 0 ms (census 226 docs / 10170 nodes / 18758 edges)",
    "run o0-document-row-gpuon-r1: reconciliation FAILED — unseparated stage(s) snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style cannot be reconciled",
    "run o0-document-row-gpuon-r1: unseparated stages [snapshot.pull, snapshot.clone, docheads.pull, render.dom, render.ssr, post.style]"
  ],
  "pass": false,
  "artifactPath": "/tmp/o0-gpuon.json"
}
```

## 12. The trio (owed because harness code changed in this pass)

| leg | result |
| --- | --- |
| `npm test` | **FAIL — 2 failed files / 10 failed tests, 4815 passed, 58 skipped (4883)** |
| `npm run typecheck` | **PASS** (`tsc --noEmit`, exit 0) |
| `npm run build` | **PASS** (all four bundles + `renderer.js` 659.9 kB) |

**The 10 failures are ALL source-side, in `src/shared/o0-report.ts` / `src/shared/o0-hook.ts`
— a REPORTED FINDING, not a fix** (this pass made no `src/` change; the failing tests
import the pure modules directly and never touch `scripts/live-drive.mjs`):

| test | failure (verbatim) |
| --- | --- |
| `unit-o-0-report-contract` R1 | a `pass:false` row with a non-empty `failReasons` validated **`ok:true`** — `validateO0Run:269` only fires on an EMPTY `failReasons`, so the row-level `pass` does not propagate |
| `unit-o-0-report-contract` R2 | a `stages[]` whose length ≠ `stageCount` must name the offending **INDEX** (`stages[11]`); it names the id `undefined` instead |
| `unit-o-0-report-contract` R3 | `postStyle.ms === null ⇒ postStyle.unseparated === true` / Σ(named) > total with all stages separated ⇒ `ok:false` — not enforced |
| `unit-o-0-report-contract` R4 | a duplicated id in either run must make the set comparison false — not enforced |
| `unit-o-0-report-contract` P-IM-1 / P-SM-1 / P-SM-2 / P-TP-1 | 4 of the 6 §5 property-register rows fail on their generated counterexamples |
| `unit-o-0-hook-contract` P-HK-1 | the inertness oracle over generated run pairs |
| `unit-o-0-hook-contract` B9 | the §3a finding-5 source contract on `window.__o0recorder` (a HARDENED projection installed from inside a function, never at module scope) |

**Layer note (RCA-12):** these are **envelope/pure-layer** failures in the very module
whose job is to make this artifact's report shape falsifiable. They do **not** invalidate
the live numbers above (the numbers come from the executing bundle, and §12's checks were
performed by hand against §11), but **the O-0 unit is not trio-green** and the pure
validator it ships is **not** currently enforcing R1–R4/P-TP-1. Reported as a finding for
the supervisor; no `src/` or `tests/` file was edited in this pass.

## 13. Provenance / reproducibility checklist (spec §4.4)

1. **Named observable fields** — every claim above names the field it came from in §11.
2. **Falsifiable predicates** — `stageCount === 11`, `path === 'cdp'`, `corpus.documents === 226`,
   `driver.build.verified === true`, `unseparated ⇒ ms === null`.
3. **Forcing consequences** — the harness derived `pass:false` (not a warning) and named
   every reason; deleting one `stages[]` entry raises §6 F1, perturbing the census raises F8.
4. **Counterexamples from the artifact alone** — e.g. take §11.1's `corpus.documents` 226 → 227 and
   `driver.failReasons` must gain the F8 line; take `runs[0].path` `cdp` → `missing` and the
   derived verdict must name the fallback (as the earlier failed run of this battery did).
