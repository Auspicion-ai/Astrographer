# Unit O-0 — Per-stage freeze breakdown (THE PRECONDITION ARTIFACT)

> **STATUS BANNER — read before quoting any number below.** This is the **THIRD (and
> closing) live run** on the **RUL-1..RUL-6 bundle** (spec §2.2/§3.6b/§4.2-§4.4/§5
> `P-HK-1`/`P-TP-3`/§6 S14-S21 / F13-F22). **Run date: 2026-09-20 (host clock, local
> `America/Chicago`; the report's own `date`/`tolerance.source` fields read `2026-09-21`
> because the driver stamps UTC).** Supersedes the **second run** (this file's previous
> revision; its numbers stand in `docs/specs/unit-o-0-per-stage-measurement.md` §12.12)
> and the **first run** (§12, `2026-09-17`).
>
> **BOTH LEGS: `status: "OPEN-structural"`, `pass: false`, `driver.selfValidation.ok: true`,
> `errors: []`, `gatingReasons: []`.** This is a **COMPLETED MEASUREMENT WITH RECORDED
> STRUCTURAL GAPS** (§3.6b RUL-4) — **not a FAIL and not a DONE**: the one stage that
> cannot be separated by construction is `snapshot.clone` (no main-side transport AND
> the Electron IPC structured clone is outside every host-side wrap — RUL-3), which
> keeps the DERIVED `post.style` residual uncomputable. **Every one of the other ten ids
> is measured (`source: "hook"`), including `render.dom`/`render.ssr` (RUL-1).**
> **No number below was imputed and no failure was softened.**
>
> **What this run closed:** the ten-id seam set is live (RUL-1: ids 9/10 now measured,
> real spans, `source: "hook"`); the caller-level `snapshot.pull`/`docheads.pull` spans
> cover the AWAITED round trip (RUL-2 — 83.6-85.9 ms folder / 172.2-179.2 ms document,
> vs run 2's 0.0-0.2 ms); the engine state is `"absent"` **derived from the observed
> error payload** (RUL-5/L1 — run 2 claimed `"ready"`); no `null%` string exists in
> either leg (RUL-5/L8); the GPU delta is reported for THIS run only (RUL-5/L9); the
> inertness pair carries the pinned MUTATION-HALF sentence (RUL-6).

**Contract:** `docs/specs/unit-o-0-per-stage-measurement.md`. **Unit:** O-0.
**Layer (RCA-12):** `assembled-renderer` — every number below comes from the **executing
`dist/` bundle driving real hit-tested CDP gestures against a real Electron renderer**,
never from node and never from a module in isolation.

**Provenance / supersession (one paragraph).** This revision records the **third live run**;
the **first run** (`2026-09-17`, renderer `1789680723588+675765+10d4bd9b`) and the **second
run** (`2026-09-20`, renderer `1789951042772+676469+a3e09c6a`, recorded for the duration in
this file and now in spec §12.12) are **SUPERSEDED**: run 1 reported stages 1-3 `unseparated`
with `traversal.build` 1868.7 ms inside a 110 ms window and the `1698.82 %` verdict; run 2
reported `snapshot.pull` 0.0-0.2 ms (the sync-call-only seam), ids 9/10 "no seam exists at
all", `env.engine: "ready"` on an engine-absent host, `(null %)` on the zero-window rows and
`driver.selfValidation.ok: false` (24/12 schema errors for structural-only content). **None of
those shapes appears in this run**: each is named with its ruling in §10/§11 and its run-2
value beside the run-3 value. Their measurements remain honest records of the bundles they
ran on; they are not reproducible here and must not be quoted as current.

---

## 1. Run commands (verbatim, as executed)

Working dir `/media/ryanr/Shared Files/Projects/Astrographer`; `DISPLAY=:0` (`--display=:0`,
propagated into the spawn env). **No app was running before either leg** (`pgrep -af
"electron|gnosis-server"` → none besides the probe; MCP `:3787` / CDP `:9222` free), so both
legs used the driver's **spawn** path (`driver.runMode: "spawn"`), never `--connect`:
`--connect` cannot arm the main-side recorder (§3.6b/S15), and the operator store is absent.
The driver sets `ASTROGRAPHER_O0_MAIN_ARM=1` for the spawned main process (the main-side
`snapshot.clone` wrap IS armed; no channel carries its records out — finding **L3s**, §12.1).

```bash
# 0) rebuild the EXECUTING bundle FIRST (docs/live-testing.md:119-124)
npm run build     # dist/renderer/renderer.js 678270 B (662.4 kb), dist/main/main.cjs 2419392 B
                  # renderer sha256[:8] a25b03a9 (md5 3b78e2cc…) / main 955790a9 (md5 60fcd0a5…)

# 0b) the pinned 226-document corpus (source 2 of §3.4 — the operator store is gone with
#     /tmp; the SIZE is the pin, the SOURCE is a recorded variable). The tree from the
#     second run is still present and was re-verified, NOT regenerated, this pass:
#       find /tmp/o0-corpus-226 -name "*.md" | wc -l   →  226
#       du -sh /tmp/o0-corpus-226                      →  1.8M
#       docs/ 200 + archive/ 20 + notes/ 6 = 226 *.md, seed o0-2026-09-17
#     (Generator, unchanged: fs.rmSync the tree; per dir in [docs 200, archive 20, notes 6]
#      write "# <dir> document <i:03>" + 12 "## Section p" blocks of 6 repeated sentences.)

# 1) GPU-OFF leg (the sanctioned launch path: --no-gpu is passed when --gpu is absent)
node scripts/live-drive.mjs --display=:0 --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0c-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism

# 2) GPU-ON leg (app (re)spawned WITHOUT --no-gpu; --gpu records the leg identity)
node scripts/live-drive.mjs --display=:0 --gpu --seed=/tmp/o0-corpus-226 \
  --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 \
  --o0-out=/tmp/o0c-gpuon.json --block=o0_gpu_control,o0_repeat_determinism

# 3) the trio (recorded in §11.1)
npm test && npm run typecheck && npm run build
```

**A minimal harness fix was required and is recorded here (§11 L1b).** The GPU-OFF leg was
first run against the same bundle and returned `status: "FAIL"` for exactly one reason:
`gnosis.status` resolved with the plain string `"fetch failed"` (the main-process
`EngineUnavailable` propagated as the tool's text), which `o0Census`'s `errorOf()` — an
object-only probe — could not recognise, so the probe was misclassified as an UNSUPPORTED
payload and minted a forcing reason. §6 S4/S21/F22 pin the opposite: an engine ERROR payload
is evidence of ABSENCE ("engine-absence is NOT a forcing condition"; "a run whose engine state
cannot be derived at all records `absent` WITH the evidence string"). The one-line fix
(`errorOf` also treats a non-empty STRING as error evidence) was applied, the leg re-run, and
both legs below ran on the identical build (`renderer 678270+a25b03a9`). No `src/**` or
`tests/**` file was touched.

---

## 2. Environment + build identity

| item | GPU-OFF leg | GPU-ON leg |
| --- | --- | --- |
| artifact | `/tmp/o0c-gpuoff.json` | `/tmp/o0c-gpuon.json` |
| `driver.runMode` | `spawn` | `spawn` |
| app-side GPU flag (`driver.appFlag`) | `app spawned by this driver (--no-gpu)` | `app spawned by this driver (gpu on)` |
| `driver.gpuFlag` / `env.gpu` | `false` / `false` | `true` / `true` |
| `driver.build.verified` | **`true`** | **`true`** |
| renderer identity (mtime+len+hash) | `1789952537561+678270+a25b03a9` | `1789952556962+678270+a25b03a9` |
| main identity | `1789952537438+2419392+955790a9` | `1789952556843+2419392+955790a9` |
| served vs on-disk | `678270+a25b03a9` = disk `678270+a25b03a9` | `678270+a25b03a9` = disk `678270+a25b03a9` |
| `driver.display` | `:0` | `:0` |
| `env.mode` | `lexical` | `lexical` |
| `env.paneFrames` | 2 | 2 |
| `env.engine` (RUL-5/L1) | `absent` — evidence `an error payload from the status call (fetch failed)` | `absent` — same evidence |
| blocks | `o0_folder_row, o0_document_row, o0_track_ablation, o0_repeat_determinism` | `o0_gpu_control, o0_repeat_determinism` |
| pairing | `cross-artifact` (`gpu-off`) | `cross-artifact` (`gpu-on`) |

**Engine-absent fact (recorded, non-gating).** No `gnosis-server` process exists on this host:
`gnosis.status` raised `EngineUnavailable: fetch failed` in the main process (the app log line
`Error occurred in handler for 'provident:gnosis:status': EngineUnavailable: fetch failed`). The
report records `env.engine: "absent"` with `driver.engineEvidence.positiveSignal: false` and
`error: "fetch failed"`; `driver.engineError` is `null` (the state IS derivable — as ABSENT).
**No O-0 stage depends on the engine** (§6 S4): the local store path is the measured path.

---

## 3. Census reached vs the pinned 226 (§3.4)

| field | GPU-OFF | GPU-ON | pin |
| --- | --- | --- | --- |
| `corpus.source` | `--o0-corpus` | `--o0-corpus` | recorded variable |
| `corpus.documents` | **226** | **226** | **226 (THE GATE)** |
| `corpus.nodes` | 6102 | 6102 | provenance only (RUL-5/L10) |
| `corpus.edges` | 9266 | 9266 | provenance only |
| `corpus.seed` | `o0-2026-09-17` | `o0-2026-09-17` | recorded constant |
| `--o0-corpus` claim | 226 | 226 | matches observation |

The pinned **size** (226 documents) is reached in both legs (`corpus.gate: "documents"`; no census
mismatch reason exists in either leg). `nodes`/`edges` (**6 102 / 9 266**) are **recorded provenance**
about THIS corpus, not a pin: the first run read 10 170 / 18 758 at the same size from a different
generator, and no byte-reproducibility is claimed anywhere (RUL-5/L10).

---

## 4. Per-stage table (ms; `(u)` = `unseparated:true` + `ms:null`; `(u, S)` = `structural:true`; `(u, derived)` = the id-11 residual)

### 4.1 GPU-OFF leg — `/tmp/o0c-gpuoff.json`

| run | gesture | snapshot.pull | snapshot.clone | docheads.pull | traversal.build | envelope.assemble | shared.decorate | reconcile.roots | reconcile.apply | render.dom | render.ssr | post.style | Σ sep ms | long task | residual |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `o0-folder-row-gpuoff-r1` | folder-row | 85.9 | null (u, S) | 1.9 | 684.2 | 0.3 | 13.1 | 15.3 | 150.9 | 59.8 | 76.1 | null (u, derived) | 1087.5 | 990 | -97.5 |
| `o0-document-row-gpuoff-r1` | document-row | 179.2 | null (u, S) | 5.8 | 14.7 | 0.5 | 1.2 | 4 | 2085.1 | 74 | 1742.5 | null (u, derived) | 4107 | 2222 | -1885 |
| `o0-fold-ablation-off` | folder-row | 27.8 | null (u, S) | 2 | 5.4 | 0.3 | 2.9 | 0.1 | 1.5 | 0.8 | 0.4 | null (u, derived) | 41.2 | 0 | -41.2 |
| `o0-fold-ablation-on` | folder-row | 29 | null (u, S) | 2 | 5.3 | 0.2 | 0.3 | 0.1 | 4.6 | 0.7 | 0.6 | null (u, derived) | 42.8 | 0 | -42.8 |

### 4.2 GPU-ON leg — `/tmp/o0c-gpuon.json`

| run | gesture | snapshot.pull | snapshot.clone | docheads.pull | traversal.build | envelope.assemble | shared.decorate | reconcile.roots | reconcile.apply | render.dom | render.ssr | post.style | Σ sep ms | long task | residual |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `o0-folder-row-gpuon-r1` | folder-row | 83.6 | null (u, S) | 2.1 | 715.6 | 0.3 | 11 | 16.4 | 159.5 | 65.1 | 72.9 | null (u, derived) | 1126.5 | 1032 | -94.5 |
| `o0-document-row-gpuon-r1` | document-row | 172.2 | null (u, S) | 4.1 | 10.9 | 0.6 | 0.6 | 2.7 | 2075.6 | 76.1 | 1784.3 | null (u, derived) | 4127.1 | 2213 | -1914.1 |

**`source` per id (both legs, every row):** `snapshot.pull`, `docheads.pull`, `traversal.build`,
`envelope.assemble`, `shared.decorate`, `reconcile.roots`, `reconcile.apply`, `render.dom`,
`render.ssr` = **`hook`** (a recorder produced the span); `snapshot.clone` = `hook` with
`unseparated:true` + `structural:true` + the RUL-3 reason (§4.3); `post.style` = **`derived`** with
`unseparated:true`, `structural:false`, `structuralReason:null` (RUL-5/L12 — it is `derived` in
every row, table and verdict; `null %` never appears).

**The ONE structural id, with its recorded reason (verbatim, per row).**

> `no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured`

---

## 5. Long tasks, mutations, quiesce, inertness

### 5.1 Per-row observables

| run | `path` | `realInput` | long tasks (start/duration) | `longTaskTotalMs` | `mutations` | `wallMs` | quiesced |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `o0-folder-row-gpuoff-r1` | `cdp` | true | 8554.800000011921/62 + 8648.600000023842/928 | 990 | 37 | 1061.1 | true (4 frames, timedOut false) |
| `o0-document-row-gpuoff-r1` | `cdp` | true | 9868.300000011921/98 + 9996.200000017881/2124 | 2222 | 11758 | 2352.6 | true (11 frames, timedOut false) |
| `o0-fold-ablation-off` | `cdp` | true | (none) | 0 | 37 | 80.7 | true (7 frames, timedOut false) |
| `o0-fold-ablation-on` | `cdp` | true | (none) | 0 | 37 | 82.3 | true (4 frames, timedOut false) |
| `o0-folder-row-gpuon-r1` | `cdp` | true | 8698.59999999404/63 + 8790.699999988079/969 | 1032 | 37 | 1095.4 | true (4 frames, timedOut false) |
| `o0-document-row-gpuon-r1` | `cdp` | true | 10044.5/105 + 10179.399999976158/2108 | 2213 | 11758 | 2322.8 | true (10 frames, timedOut false) |

Both gestures resolved `path: "cdp"` with `realInput: true` in every row of both legs (the hit
probe resolved inside a real `#pane-doc-nav [data-folder-path]` row and a real `[data-document-id]`
row), so §5 `P-TP-2` holds: no row is a native fallback.

### 5.2 Hook inertness (armed vs unarmed, §3.6(c) / §6 S17(b) / RUL-6)

| leg | `inert` | Δmutations | ΔlongTaskTotalMs | band | carried by | vacuous half | nonVacuous |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | true | 0 (37 vs 37) | 0 ms | 40 ms | `mutations` | `longTaskTotalMs (the unarmed baseline measured a 0 ms window — ΔlongTaskTotalMs=0 is 0-vs-0)` | false |
| GPU-ON | true | 0 (37 vs 37) | 0 ms | 40 ms | `mutations` | `longTaskTotalMs (the unarmed baseline measured a 0 ms window — ΔlongTaskTotalMs=0 is 0-vs-0)` | false |

**The pinned MUTATION-HALF sentence (RUL-6), verbatim from the GPU-OFF leg (identical in the
GPU-ON leg):**

> `the hook inertness pair is a MUTATION-HALF proof: Δmutations 0 === 0 with 37 mutation(s) observed in each freeze; the long-task half is VACUOUS (both freezes totalled 0 ms — a 0-vs-0 comparison, nonVacuous:false), so no numeric long-task proof is claimed`

Both freezes performed the disclosure (`controlledPair: true`: the collapse state was reset
in-page `document rows 20 → 0` before BOTH freezes), so the only variable between them is whether
the §3.6 hook was armed. `setEqual: true` (the stage-id SET is equal; `ms` is free under
`o0-2026-09-17`, §5 `P-SM-2`). **No numeric long-task proof is claimed** — the long-task half is
0-vs-0 (`nonVacuous: false`), recorded and not hidden.

---

## 6. Controls

### 6.1 GPU control (THIS run, THIS corpus — RUL-5/L9)

| gesture | GPU-OFF `longTaskTotalMs` | GPU-ON `longTaskTotalMs` | Δ (ON − OFF) | Δ `wallMs` | Δ `mutations` |
| --- | --- | --- | --- | --- | --- |
| folder-row | 990 | 1032 | **42 ms** | 34.3 ms | 0 |
| document-row | 2222 | 2213 | **-9 ms** | -29.8 ms | 0 |

Per-stage Δ (ON − OFF), for the four largest ids: `traversal.build` 31.4 ms (folder) / -3.8 ms (document); `reconcile.apply` 8.6 / -9.5; `render.ssr` -3.2 / 41.8; `render.dom` 5.3 / 2.1.

**The GPU flag produced no separable delta in THIS run** (42 ms / 9 ms against ~1000/2200 ms windows and identical mutation counts). This is the run's own reading; the first run's `+2173 / +2419 ms` and the second run's `−36 / −23 ms` are cited in §10 as **labelled provenance of two other sessions/corpora** and are never carried into any verdict (RUL-5/L9/§6 S20).

### 6.2 Track ablation (`display:block` on the `#wiki-root` stage grid cell)

| run | `trackAblation.applied` | `trackAblation.mutation` | `longTaskTotalMs` | `mutations` | `wallMs` |
| --- | --- | --- | --- | --- | --- |
| `o0-fold-ablation-off` | false | `null` | 0 | 37 | 80.7 |
| `o0-fold-ablation-on` | **true** | `#zone:main (the stage grid cell of #wiki-root): display:block (removes the #wiki-root grid-track sizing from the measurement path)` | 0 | 37 | 82.3 |

**Δ (ablation ON − OFF): Δlong-task total `0 ms`, Δmutations `0`, ΔwallMs `1.6 ms`.**
The ablation was available, applied and reverted with the exact mutation recorded. **On this
corpus the disclosure freeze never crosses the 50 ms long-task threshold** (both rows total
**0 ms**), so the ablation is **not shown to be load-bearing at this scale** — stated in the
honest form ("no measurable effect here"), never as "no effect". The ablation rows themselves
carry a **zero-window** long-task total, so their verdicts print **no percentage at all**
(RUL-5/L8 — `null %` is retired).

---

## 7. Derived verdict strings (verbatim from the emitted reports)

### GPU-OFF

> stage traversal.build is 684.2 ms of the 990 ms long task (69.11%) on folder-row — traversal.build is the largest identified stage
> the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 85.9 ms (census 226 docs / 6102 nodes / 9266 edges)
> run o0-folder-row-gpuoff-r1: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)
> run o0-folder-row-gpuoff-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])
> stage reconcile.apply is 2085.1 ms of the 2222 ms long task (93.84%) on document-row — reconcile.apply is the largest identified stage
> the document-row performed 2 whole-store IPC_RAG_SNAPSHOT read(s) totalling 179.2 ms (census 226 docs / 6102 nodes / 9266 edges)
> run o0-document-row-gpuoff-r1: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)
> run o0-document-row-gpuoff-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])
> stage snapshot.pull is 27.8 ms of the 0 ms long task on folder-row — snapshot.pull is the largest identified stage; no percentage is computed: the long-task window is zero (0 ms), so this row has no finite window to divide by
> the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 27.8 ms (census 226 docs / 6102 nodes / 9266 edges)
> run o0-fold-ablation-off: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)
> run o0-fold-ablation-off: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])
> stage snapshot.pull is 29 ms of the 0 ms long task on folder-row — snapshot.pull is the largest identified stage; no percentage is computed: the long-task window is zero (0 ms), so this row has no finite window to divide by
> the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 29 ms (census 226 docs / 6102 nodes / 9266 edges)
> run o0-fold-ablation-on: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)
> run o0-fold-ablation-on: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])
> O-0 REPORT OPEN — 4 stage(s) structurally unseparated (o0-folder-row-gpuoff-r1:snapshot.clone, o0-document-row-gpuoff-r1:snapshot.clone, o0-fold-ablation-off:snapshot.clone, o0-fold-ablation-on:snapshot.clone): run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4) — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed

### GPU-ON

> stage traversal.build is 715.6 ms of the 1032 ms long task (69.34%) on folder-row — traversal.build is the largest identified stage
> the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 83.6 ms (census 226 docs / 6102 nodes / 9266 edges)
> run o0-folder-row-gpuon-r1: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)
> run o0-folder-row-gpuon-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])
> stage reconcile.apply is 2075.6 ms of the 2213 ms long task (93.79%) on document-row — reconcile.apply is the largest identified stage
> the document-row performed 2 whole-store IPC_RAG_SNAPSHOT read(s) totalling 172.2 ms (census 226 docs / 6102 nodes / 9266 edges)
> run o0-document-row-gpuon-r1: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)
> run o0-document-row-gpuon-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])
> O-0 REPORT OPEN — 2 stage(s) structurally unseparated (o0-folder-row-gpuon-r1:snapshot.clone, o0-document-row-gpuon-r1:snapshot.clone): run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4) — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed

---

## 8. `driver.selfValidation` (RUL-4) and the DERIVED status

| field | GPU-OFF | GPU-ON |
| --- | --- | --- |
| `selfValidation.ok` | **true** | **true** |
| `selfValidation.errors` | `[]` (0) | `[]` (0) |
| `selfValidation.status` | **`OPEN-structural`** | **`OPEN-structural`** |
| `selfValidation.attempts` / `runIds` | 4 rows, each `ok:true` | 2 rows, each `ok:true` |
| `selfValidation.structuralErrors` / `structuralFacts` | 0 / 4 (structural facts are recorded, never errors) | 0 / 2 |
| `gatingReasons` | `[]` | `[]` |
| `reconciliation.ok` | false | false |
| **`status` (DERIVED)** | **`OPEN-structural`** | **`OPEN-structural`** |
| **`pass`** | **`false`** | **`false`** |
| `validateO0Report(...)` (the pure module, re-run against the embedded JSON) | `ok: true, status `OPEN-structural`, errors `[]` | `ok: true, status `OPEN-structural`, errors `[]` |

**`status: "OPEN-structural"` ⇔ `pass:false` whose every forcing reason is in the structural
family** (§4.2/RUL-4). Both legs are exactly that: the forcing reasons are the per-row
unseparated-id reconciliations and the one `structural:true` id; **there is no forcing reason
outside the structural family** (`gatingReasons: []` in both legs), so neither leg is `"FAIL"`,
and neither is `"OK"` (the residual is not computable), so neither is DONE-able.

**The mandatory `reconciliation.note` (GPU-OFF, verbatim):**

> `structurally unseparated stage(s) o0-folder-row-gpuoff-r1:snapshot.clone, o0-document-row-gpuoff-r1:snapshot.clone, o0-fold-ablation-off:snapshot.clone, o0-fold-ablation-on:snapshot.clone have no seam in the executing bundle (run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)), so the long-task residual is NOT computable and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)`

**The mandatory `reconciliation.note` (GPU-ON, verbatim):**

> `structurally unseparated stage(s) o0-folder-row-gpuon-r1:snapshot.clone, o0-document-row-gpuon-r1:snapshot.clone have no seam in the executing bundle (run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)), so the long-task residual is NOT computable and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)`

---

## 9. The O-0 questions, answered with the numbers

### 9.1 (a) The A-4 read counts + the RUL-2 round-trip ms

| leg | gesture | read count | per-read ms (`snapshot.pull` records) | total `snapshot.pull` ms | `docheads.pull` ms |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | folder-row | **1** | `85.9` | **85.9** | 1.9 (1.9) |
| GPU-OFF | document-row | **2** | `119.4` + `59.8` | **179.2** | 5.8 (3.7 + 2.1) |
| GPU-ON | folder-row | **1** | `83.6` | **83.6** | 2.1 (2.1) |
| GPU-ON | document-row | **2** | `128.6` + `43.6` | **172.2** | 4.1 (2 + 2.1) |

**A-4 is answered at the caller level and the residual SHRANK.** Run 2 measured
`snapshot.pull` **0.0-0.2 ms** because `await` sat OUTSIDE `record()` (`L5`); after RUL-2 the
caller-level span covers the awaited round trip (call → IPC → main handler + structured clone →
promise settlement) and reads **83.6-88.2 ms for the folder gesture (1 read)** and
**172.2-194.7 ms for the document gesture (2 reads)** — i.e. the ~112-126 ms run-2 residual was
not style/layout: it was this round trip, now named. The read COUNT is unchanged and still
refutes A-4's cheapest variant ("a doc-nav disclosure that performs no store read at all"):
**the disclosure performs 1 whole-store read (6 102 nodes / 9 266 edges across IPC); the
document open performs it twice.**

### 9.2 (b) Separable stage shares (both gestures)

| leg/run | window `longTaskTotalMs` | Σ named stages | JS path (`traversal.build`+`envelope.assemble`+`shared.decorate`+`reconcile.roots`+`reconcile.apply`) | render emits (`render.dom`+`render.ssr`) | DERIVED `post.style` residual |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF folder-row | 990 | 1087.5 | 863.8 ms (87.25 %) | 135.9 ms (13.73 %) | **not separable** (computed residual would be -97.5 ms < 0) |
| GPU-ON folder-row | 1032 | 1126.5 | 902.8 ms (87.48 %) | 138 ms (13.37 %) | **not separable** (-94.5 ms) |
| GPU-OFF document-row | 2222 | 4107 | 2105.5 ms (94.76 %) | 1816.5 ms (81.75 %) | **not separable** (-1885 ms) |
| GPU-ON document-row | 2213 | 4127.1 | 2090.4 ms (94.46 %) | 1860.4 ms (84.07 %) | **not separable** (-1914.1 ms) |

**The emit-vs-style/layout split is now PARTIALLY separable (RUL-1 delivered).** The two render
emits have real seams and carry 13.73 % of the folder window and 81.75 % of
the document window; `render.ssr` is the second-largest identified stage on the document gesture
(1742.5 ms vs `reconcile.apply` 2085.1 ms).
`post.style` remains **`derived` and NOT separable in this run**: the residual
(`longTaskTotalMs − Σ named stages`) is NEGATIVE on every row because the per-stage sums cover
**more work than the long-task window contains**, so no bounded residual exists to label as
style/layout/paint. **`post.style` is never a measurement here and must not be quoted as a
style cost** (§4.3/§6 S14/RUL-5-L12).

### 9.3 (c)/(d) GPU delta and track-ablation delta

See §6.1/§6.2: GPU Δ (ON − OFF) **42 ms** folder / **-9 ms** document (no separable effect; mutation counts identical: 37 vs 37 and 11 758 vs 11 758);
track ablation Δ (ON − OFF) **0 ms long-task total, Δmutations 0, ΔwallMs 1.6 ms** (not shown to be load-bearing at this scale).

### 9.4 (e) Is the derivation WALK load-bearing? (the O-4 trigger)

**For the disclosure gesture: YES — `traversal.build` alone is 684.2 ms of the 990 ms window (69.11 %, GPU-OFF) and 715.6 ms of 1032 (69.34 %, GPU-ON) — the largest identified stage of that gesture.**

**For the document gesture: NO — the load sits in `reconcile.apply` (2085.1 ms of 2222 = 93.84 %, GPU-OFF; 2075.6 of 2213 = 93.79 %, GPU-ON) and, secondarily, in the SSR mirror emit (`render.ssr` 1742.5 / 1784.3 ms); `traversal.build` is only 14.7 / 10.9 ms there.**

So the walk is load-bearing **per gesture, not per app**: the folder disclosure walks the shared
graph (the O-4 trigger's target); the document open is dominated by the reconcile apply + SSR
emit of the document body. **What remains structural:** `snapshot.clone` (the main-side handler
share AND the out-of-host IPC clone) is unmeasured, so the round trip's inside/outside split is
not offered, and because it is unmeasured the DERIVED `post.style` residual is uncomputable on
every row — the residual absorbs the un-instrumented work and is therefore not attributable to
style or layout. The trigger reads the walk's share as a LOWER BOUND (the measured `hook` span),
never as the whole freeze.

### 9.5 The two-re-derive finding on the document gesture (recorded, not softened)

`o0-document-row` records **two complete re-derive passes** inside its arm window
(`2` `snapshot.pull` records, two sets of `docheads.pull`/`traversal.build`/`shared.decorate`/
`envelope.assemble`/`reconcile.roots`/`render.dom`/`render.ssr`/`reconcile.apply`), and the
heaviest of them (`render.ssr` 1742.5 ms summed, `reconcile.apply` 2085.1 ms) sits INSIDE the 2 124 ms long task. That is why Σ > window on this
row (run 2 could not see it: ids 9/10 had no seam, so run 2's document-row Σ stayed *below* its
window). **Consequence recorded honestly: the window-bound oracle still holds per STAGE
(§9-no-violation in §9.6), but the row's Σ is not a partition of its window** — the residual is
negative and `post.style` cannot be separated. This is a harness/measurement-shape fact, not an
imputed number, and it is the reason the reconciliation stays `openStructural`.

---

## 10. Window-bound check (§4.3 / §5 `P-TP-3` / §6 F13a)

`deriveO0WindowBound(run)` was re-run against both embedded reports with **NO options**, so it
reads the row-recorded band `hook.toleranceMs` (§3.2.1) — the same band the verdict and the
validator use (`src/shared/o0-report.ts`, `O0_WINDOW_TOLERANCE_MS = 40`).

| run | recorded band | arm window | freeze window | arm−freeze t0 / t1 (ms) | `violated` | largest-stage verdict `%` |
| --- | --- | --- | --- | --- | --- | --- |
| `o0-folder-row-gpuoff-r1` | 40 ms | `{t0 8549.600000023842, t1 9610.200000017881} (ms 1060.6)` | `{t0 8548.90000000596, t1 9610} (ms 1061.1)` | 0.7 / 0.2 | **false** | traversal.build — 69.11 % |
| `o0-document-row-gpuoff-r1` | 40 ms | `{t0 9864.700000017881, t1 12217} (ms 2352.3)` | `{t0 9864.300000011921, t1 12216.90000000596} (ms 2352.6)` | 0.4 / 0.1 | **false** | reconcile.apply — 93.84 % |
| `o0-fold-ablation-off` | 40 ms | `{t0 12623, t1 12703.200000017881} (ms 80.2)` | `{t0 12622.40000000596, t1 12703.100000023842} (ms 80.7)` | 0.6 / 0.1 | **false** | snapshot.pull — no percentage (zero window) |
| `o0-fold-ablation-on` | 40 ms | `{t0 13107.40000000596, t1 13189.40000000596} (ms 82)` | `{t0 13107, t1 13189.300000011921} (ms 82.3)` | 0.4 / 0.1 | **false** | snapshot.pull — no percentage (zero window) |
| `o0-folder-row-gpuon-r1` | 40 ms | `{t0 8693.09999999404, t1 9787.899999976158} (ms 1094.8)` | `{t0 8692.299999982119, t1 9787.699999988079} (ms 1095.4)` | 0.8 / 0.2 | **false** | traversal.build — 69.34 % |
| `o0-document-row-gpuon-r1` | 40 ms | `{t0 10042, t1 12364.399999976158} (ms 2322.4)` | `{t0 10041.5, t1 12364.299999982119} (ms 2322.8)` | 0.5 / 0.1 | **false** | reconcile.apply — 93.79 % |

**Result: NO row violates the window bound.** The largest arm-window overshoot of the freeze
window is **0.8 ms** and the largest shortfall **0.6 ms** (band 40 ms) — the arming interval
equals the freeze window within ~1 ms on all six rows, and every separated stage satisfies
`ms ≤ longTaskTotalMs + tol` (the largest single stage is `reconcile.apply` at 2 085.1 ms of a
2 222 ms window = 93.84 % ≤ 100 %). **No percentage is emitted on a violated row** (none is
violated) and no verdict string in either leg contains `null %` — the two zero-window ablation
rows print the RUL-5/L8 form ("no percentage is computed: the long-task window is zero")
instead. Run 2's window-bound result (`violated: false` on all six rows, 0.8 ms worst
overshoot) therefore **does not regress** — the spec's §12.12 "What the second run PROVED"
item records it as CLOSED (and must not regress).

---

## 11. Comparison to runs 1-2

1. **The round trip is now named (the biggest movement).** `snapshot.pull` 0.0-0.2 ms (run 2,
   sync-only seam) → 85.9/83.6 ms folder and 179.2/172.2 ms document (run 3, awaited span); run 2's 112-126 ms residual was this cost, and the residual collapsed accordingly (RUL-2).
2. **The two render emits are measured instead of "no seam exists".** `render.dom`
   `null`/structural → 59.8-74 ms; `render.ssr` `null`/structural → 76.1-1742.5 ms, `source: "hook"` on every row (RUL-1). The unseparated set fell from **4 ids** (run 2) to **2** — `snapshot.clone` (structural, RUL-3) plus the `derived` `post.style`.
3. **The report status is derived honestly instead of schema-rejected.** Run 2:
   `selfValidation.ok:false`, 24 (GPU-OFF) / 12 (GPU-ON) errors for structural-only content,
   `status` absent, `env.engine:"ready"` on an engine-absent host, `(null %)` on the two
   zero-window rows. Run 3: **`ok:true`, `errors: []`, `status:"OPEN-structural"` both legs,
   `env.engine:"absent"` with the `fetch failed` evidence, zero `null %` strings** (RUL-4/RUL-5).
4. **The absolute numbers moved because the harness changed, not because the app did.** Run 1's
   `traversal.build` 1868.7 ms in a 110 ms window and run 2's `traversal.build` 694.5 ms /
   `reconcile.apply` 2051.5 ms are the same gestures on the same 226-document size with
   different instrumentation and different corpora bytes; **none of the three runs is
   cross-comparable** (RUL-5/L9/L10) — the only cross-run facts this artifact asserts are
   shapes (which ids are measured), the read COUNT (1 vs 2, all three runs) and the window-bound
   result.

---

## 12. Findings

### 12.1 Structural (recorded, non-gating — the reason the status is `OPEN-structural`)

| # | item | state | evidence |
| --- | --- | --- | --- |
| **L3s** | `snapshot.clone` — no main-side transport AND the IPC structured clone is outside every host-side wrap | **STRUCTURAL, by construction** (RUL-3) | the main instance IS armed (`ASTROGRAPHER_O0_MAIN_ARM=1`) and wraps the `IPC_RAG_SNAPSHOT` handler, but `driver.mainSeamArmed: false`, `driver.mainTransport.channel: null`, `mainRecordsTransport: "none — …"` and no `instance:"main"` entry exists in any `hook.stageRecords`; the row carries the two-part reason verbatim (§4.3) |
| **L12s** | `post.style` — the residual is a DERIVED remainder | **`derived` in every row/table/verdict** (RUL-5/L12) | `stages[post.style] = {ms:null, unseparated:true, source:"derived", structural:false, structuralReason:null}` and `reconciliation.openStructural: true` with `residual < 0` on every row |

### 12.2 Harness (fixed in this pass, recorded)

| # | item | outcome |
| --- | --- | --- |
| **L1b** | `env.engine` probe: a tool-level error surfaced as a plain STRING ("fetch failed") was misclassified as an UNSUPPORTED payload, minting a forcing reason and pushing an otherwise OPEN-structural report to `status:"FAIL"` | **FIXED** in `scripts/live-drive.mjs` (`o0Census`'s `errorOf` also treats a non-empty string as error evidence). Spec basis: §6 S4 ("engine-absence is NOT a forcing condition") + S21/F22 ("a run whose engine state cannot be derived at all records `absent` **with the evidence string**"). Both legs now record `engine:"absent"`, `driver.engineError: null`, `gatingReasons: []`. The first GPU-OFF invocation's FAIL is **superseded** by the identical re-run, not hidden |

### 12.3 Measurement-shape (recorded, not softened)

| # | item | evidence |
| --- | --- | --- |
| **M1** | **Σ named stages EXCEEDS the long-task window on the gesture rows** (folder 1 087.5 vs 990 ms; document 4 107 vs 2 222 ms), so the DERIVED residual is negative and `post.style` cannot be separated | `reconciliation.sumMs`/`residual` per row (§4.1); the per-record detail shows the document gesture's **two** re-derive passes (§9.5) and the folder gesture's pre-long-task round trip. Per-stage window bounds still hold; **no value was imputed** |
| **M2** | `hook.armCount`/`disarmCount` are **session-cumulative** (1/0, 2/1, 3/2, 4/3 across the GPU-OFF rows) because the recorder is a page-global singleton that is never reset between blocks | `hook.armCount - hook.disarmCount` = 1 (armed) in every row; each row's `armWindow` IS per-row and in-band, so the window-bound oracle is unaffected — recorded so the counts are not misread as a per-row count |
| **M3** | The long-task total is a **sum of `duration`s** of long tasks starting inside the freeze window (a `start`-filtered list), so work between/outside long tasks is not in the primary oracle | `longTasks[]` + the per-row `longTaskTotalMs` (§5.1); this is the §4.3 primary oracle as specified, and it is why M1 is possible |

### 12.4 What did NOT regress (run-2 closures that hold here)

Window bound on all six rows (§10); bundle verified in both legs (§2); both gestures `path:"cdp"`/
`realInput:true` (§5.1); stage-id **SET equal (11 ids)** with `ms` free (`hookInertness.setEqual:true`,
§5.2); census 226 reached (no mismatch reason); `driver.hookInertness` non-empty in BOTH legs with
the controlled pair; the GPU-ON leg ran **`o0_repeat_determinism`** as well as `o0_gpu_control`, so
the inertness comparison exists in both legs and the GPU pairing is non-vacuous.

### 12.5 The trio (recorded, not claimed)

`npm run build` clean (the exact 678 270 B / 2 419 392 B bundles both legs verified).
`npm run typecheck` clean (exit 0). `npm test` = **8 failed files / 206 passed (214)**,
**25 failed tests / 4 820 passed / 58 skipped (4 903)**. Split as required: **O-0 is GREEN** —
`tests/unit-o-0-driver-contract.test.ts` 23 + `tests/unit-o-0-report-contract.test.ts` **44** +
`tests/unit-o-0-hook-contract.test.ts` **39** = **106 passed / 106** (run 2 recorded 95: 23/37/35,
so the RUL-1..RUL-6 re-pin landed +11 rows and no O-0 row fails). The remaining failures are the
**pre-existing non-O-0 toolchain-bump set** (`SUITE-RED-AFTER-VITEST5-ELECTRON44`, wave-1 bridge
wiring and siblings); this pass observed **25** against run 2's **22** — the drift is in that
non-O-0 set and is reported, not attributed to O-0. **RCA-12 reminder: a trio green is
envelope-green, not app-green — and every number in this artifact comes from the APP.**

---

## 13. Raw emitted JSON (both legs, verbatim)

### 13.1 GPU-OFF leg — `/tmp/o0c-gpuoff.json`

```json
{
  "artifact": "o-0-per-stage-breakdown",
  "spec": "docs/specs/unit-o-0-per-stage-measurement.md",
  "unit": "O-0",
  "date": "2026-09-21",
  "layer": "assembled-renderer (RCA-12)",
  "commands": [
    "node scripts/live-drive.mjs --display=:0 --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --o0-out=/tmp/o0c-gpuoff.json --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism"
  ],
  "pinnedCommands": [
    "npm run build",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --display=:0 --o0-out=<path> --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --gpu --display=:0 --o0-out=<path> --block=o0_gpu_control"
  ],
  "driver": {
    "build": {
      "renderer": "1789952537561+678270+a25b03a9",
      "main": "1789952537438+2419392+955790a9",
      "served": "678270+a25b03a9",
      "servedUrl": "file:///media/ryanr/Shared%20Files/Projects/Astrographer/dist/renderer/renderer.js",
      "disk": {
        "rendererBytes": 678270,
        "rendererHash": "a25b03a9"
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
      "--o0-out=/tmp/o0c-gpuoff.json",
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
    "gpuDeltas": [
      {
        "gesture": "folder-row+document-row",
        "delta": "+2173 / +2419",
        "provenanceRun": "the 2026-09-17 first run (226 docs / 10 170 nodes / 18 758 edges)",
        "carriedFromAnotherRun": false,
        "contradictedBy": "the 2026-09-21 second run measured −36 / −23 ms on an identical mutation count (both legs)",
        "label": "PROVENANCE ONLY — the first run's GPU delta is contradicted by a later run and is NOT a finding any unit may rest on (§2.4/RUL-5-L9/S20); the node/edge counts belong to that run's corpus, never to a threshold"
      }
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
        "inert": true,
        "controlledPair": true,
        "stateReset": {
          "baseline": {
            "collapsed": true,
            "detail": "document rows 20 → 0 (toggle-to-collapsed)"
          },
          "armed": {
            "collapsed": true,
            "detail": "document rows 20 → 0 (toggle-to-collapsed)"
          }
        },
        "mutations": {
          "unarmed": 37,
          "armed": 37
        },
        "longTaskTotalMs": {
          "unarmed": 0,
          "armed": 0
        },
        "nonVacuousHalves": {
          "mutations": true,
          "longTaskTotalMs": false
        },
        "carriedBy": [
          "mutations"
        ],
        "vacuousHalves": [
          "longTaskTotalMs (the unarmed baseline measured a 0 ms window — ΔlongTaskTotalMs=0 is 0-vs-0)"
        ],
        "nonVacuous": false,
        "mutationHalfProof": true,
        "proofStatement": "the hook inertness pair is a MUTATION-HALF proof: Δmutations 0 === 0 with 37 mutation(s) observed in each freeze; the long-task half is VACUOUS (both freezes totalled 0 ms — a 0-vs-0 comparison, nonVacuous:false), so no numeric long-task proof is claimed"
      }
    ],
    "hookInertnessProof": [
      {
        "pair": "o0-repeat-a-unarmed / o0-repeat-b-armed",
        "carriedBy": [
          "mutations"
        ],
        "vacuousHalves": [
          "longTaskTotalMs (the unarmed baseline measured a 0 ms window — ΔlongTaskTotalMs=0 is 0-vs-0)"
        ],
        "nonVacuousHalves": {
          "mutations": true,
          "longTaskTotalMs": false
        },
        "statement": "the hook inertness pair is a MUTATION-HALF proof: Δmutations 0 === 0 with 37 mutation(s) observed in each freeze; the long-task half is VACUOUS (both freezes totalled 0 ms — a 0-vs-0 comparison, nonVacuous:false), so no numeric long-task proof is claimed"
      }
    ],
    "mainSeamArmed": false,
    "mainSeamRecords": 0,
    "mainTransport": {
      "channel": null,
      "note": "RUL-3 — the MAIN instance IS armed in spawn mode (ASTROGRAPHER_O0_MAIN_ARM=1) and its handler wrap records `snapshot.clone`, but no channel carries those records into the renderer/report, and Electron's structured clone of the handler return value runs inside the IPC internals after the handler returns (outside every host-side wrap): the stage is structurally unseparated with this exact reason, never an imputed number"
    },
    "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
    "engineEvidence": {
      "probe": "gnosis.status (MCP) → the engine HealthReport",
      "calledAt": "2026-09-21",
      "resolved": true,
      "error": "fetch failed",
      "healthState": null,
      "keys": null,
      "derived": "absent",
      "positiveSignal": false,
      "rule": "ready IFF the call resolved with a HealthReport whose state ∈ {Ready, Starting, Degraded} (a POSITIVE engine signal); absent otherwise — \"the MCP call resolved\" is NOT evidence (§4.3/S21/RUL-5)",
      "contradiction": null,
      "observed": "an error payload from the status call (fetch failed)"
    },
    "engineError": null,
    "display": ":0",
    "failReasons": [
      "run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-folder-row-gpuoff-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-document-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-document-row-gpuoff-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-fold-ablation-off: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-fold-ablation-off: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-fold-ablation-on: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-fold-ablation-on: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
    ],
    "gatingReasons": [],
    "openStructuralReasons": [
      "run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-folder-row-gpuoff-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-document-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-document-row-gpuoff-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-fold-ablation-off: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-fold-ablation-off: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-fold-ablation-on: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-fold-ablation-on: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
    ],
    "notes": [
      "run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-folder-row-gpuoff-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-document-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-document-row-gpuoff-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-fold-ablation-off: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-fold-ablation-off: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-fold-ablation-on: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-fold-ablation-on: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "o0_folder_row: unseparated stages [snapshot.clone, post.style] — emitted ms:null + unseparated (never imputed, §6 F4)",
      "o0_document_row: unseparated stages [snapshot.clone, post.style]"
    ],
    "structuralStages": [
      "o0-folder-row-gpuoff-r1:snapshot.clone",
      "o0-document-row-gpuoff-r1:snapshot.clone",
      "o0-fold-ablation-off:snapshot.clone",
      "o0-fold-ablation-on:snapshot.clone"
    ],
    "openStructural": true,
    "selfValidation": {
      "ok": true,
      "attempts": 4,
      "runIds": [
        "o0-folder-row-gpuoff-r1",
        "o0-document-row-gpuoff-r1",
        "o0-fold-ablation-off",
        "o0-fold-ablation-on"
      ],
      "errors": [],
      "status": "OPEN-structural",
      "structuralErrors": 0,
      "structuralFacts": 4,
      "moduleGating": [],
      "rowResults": [
        {
          "id": "o0-folder-row-gpuoff-r1",
          "ok": true,
          "errors": []
        },
        {
          "id": "o0-document-row-gpuoff-r1",
          "ok": true,
          "errors": []
        },
        {
          "id": "o0-fold-ablation-off",
          "ok": true,
          "errors": []
        },
        {
          "id": "o0-fold-ablation-on",
          "ok": true,
          "errors": []
        }
      ],
      "gatingReasons": [],
      "note": "RUL-4/F17c — the structural family is recorded, never counted as a self-validation ERROR: a structurally-open report is ok:true/empty errors with status \"OPEN-structural\""
    },
    "status": "OPEN-structural",
    "pass": false,
    "statusStatement": "OPEN-structural — 8 structurally-unmeasurable stage(s) (no seam in the executing bundle) and 4 DERIVED-residual record(s): the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed (§3.6b RUL-4, §6 S14/S19)",
    "structuralReasons": [
      "run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-folder-row-gpuoff-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-document-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-document-row-gpuoff-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-fold-ablation-off: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-fold-ablation-off: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-fold-ablation-on: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-fold-ablation-on: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "runs[0]: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14: NO seam exists in the executing bundle, distinct from a seam that merely was not armed)",
      "runs[1]: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14: NO seam exists in the executing bundle, distinct from a seam that merely was not armed)",
      "runs[2]: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14: NO seam exists in the executing bundle, distinct from a seam that merely was not armed)",
      "runs[3]: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14: NO seam exists in the executing bundle, distinct from a seam that merely was not armed)",
      "runs[0]: stage post.style is unseparated as the DERIVED residual (§2.2 id 11: post.style is COMPUTED from longTaskTotalMs − Σ(named stages), never a timed probe) — it cannot be separated while any stage above is unseparated (recorded, non-gating — §5 P-TP-1/RUL-4)",
      "runs[1]: stage post.style is unseparated as the DERIVED residual (§2.2 id 11: post.style is COMPUTED from longTaskTotalMs − Σ(named stages), never a timed probe) — it cannot be separated while any stage above is unseparated (recorded, non-gating — §5 P-TP-1/RUL-4)",
      "runs[2]: stage post.style is unseparated as the DERIVED residual (§2.2 id 11: post.style is COMPUTED from longTaskTotalMs − Σ(named stages), never a timed probe) — it cannot be separated while any stage above is unseparated (recorded, non-gating — §5 P-TP-1/RUL-4)",
      "runs[3]: stage post.style is unseparated as the DERIVED residual (§2.2 id 11: post.style is COMPUTED from longTaskTotalMs − Σ(named stages), never a timed probe) — it cannot be separated while any stage above is unseparated (recorded, non-gating — §5 P-TP-1/RUL-4)",
      "run o0-folder-row-gpuoff-r1: post.style residual null ms (Σ named stages 1087.4999999999998 of 990 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)",
      "run o0-document-row-gpuoff-r1: post.style residual null ms (Σ named stages 4107 of 2222 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)",
      "run o0-fold-ablation-off: post.style residual null ms (Σ named stages 41.199999999999996 of 0 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)",
      "run o0-fold-ablation-on: post.style residual null ms (Σ named stages 42.800000000000004 of 0 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)"
    ]
  },
  "tolerance": {
    "reconcileMs": 50,
    "source": "measured 2026-09-21"
  },
  "corpus": {
    "source": "--o0-corpus",
    "claimedDocuments": 226,
    "documents": 226,
    "nodes": 6102,
    "edges": 9266,
    "seed": "o0-2026-09-17",
    "gate": "documents",
    "provenanceOnly": [
      "nodes",
      "edges",
      "bytes"
    ],
    "note": "the corpus SIZE is the GATE (documents === the claimed census, §3.4/§6 F8) and it is the ONLY pin; nodes/edges/bytes are RECORDED PROVENANCE about the corpus source actually used, NOT a pin and NOT a cross-run comparable claim — a same-size corpus with different bytes yields different absolute ms values (the two runs so far read 10 170/18 758 and 6 102/9 266 nodes/edges at 226 documents, both legal), so (a) no byte-reproducibility may be claimed, (b) no cross-run absolute ms comparison is a measurement, and (c) the node-ceiling input for the parked trigger (b) must be read from THIS run's corpus row with the byte-size gap named (§3.4/§4.3/RUL-5/L10, §10 item 2)"
  },
  "env": {
    "mode": "lexical",
    "gpu": false,
    "engine": "absent",
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
      "hit": "preempt-node-node-85762",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": 85.9,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "hook",
          "structural": true,
          "structuralReason": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured"
        },
        {
          "id": "docheads.pull",
          "ms": 1.9,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 684.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "envelope.assemble",
          "ms": 0.3,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "shared.decorate",
          "ms": 13.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 15.3,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 150.9,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 59.8,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 76.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived",
          "structural": false,
          "structuralReason": null
        }
      ],
      "longTasks": [
        {
          "start": 8554.800000011921,
          "duration": 62
        },
        {
          "start": 8648.600000023842,
          "duration": 928
        }
      ],
      "longTaskTotalMs": 990,
      "mutations": 37,
      "wallMs": 1061.1,
      "t0": 8548.90000000596,
      "t1": 9610,
      "quiesce": {
        "frames": 4,
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
        "renderer": "1789952537561+678270+a25b03a9",
        "main": "1789952537438+2419392+955790a9",
        "served": "678270+a25b03a9"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 8549.600000023842,
          "t1": 9610.200000017881,
          "ms": 1060.6
        },
        "freezeWindow": {
          "t0": 8548.90000000596,
          "t1": 9610
        },
        "toleranceMs": 40,
        "armCount": 1,
        "disarmCount": 0,
        "stageRecords": [
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer"
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer"
          },
          {
            "stage": "traversal.build",
            "instance": "renderer"
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer"
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer"
          }
        ],
        "stageRecordDetail": [
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 31.4
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 28.5
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 85.9
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 1.9
          },
          {
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 684.2
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 13.1
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 15.3
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 28.4
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 47.6
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 150.9
          }
        ],
        "mainSeamArmed": false,
        "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
        "mainRecordsTransport": "none — the main process records the handler span but no channel carries it into the renderer/report (§3.6b/S15/RUL-3)",
        "rendererArmed": true,
        "refused": [],
        "records": 11,
        "pendingSpans": 0,
        "dropped": 0,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile",
          "render.dom": "Runtime.render (the DomAdapter renderProducingProcess pass)",
          "render.ssr": "Runtime.render (the SSR mirror renderProducingProcess pass)"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-85762"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "reconciliation": {
        "ok": false,
        "residual": -97.5,
        "sumMs": 1087.5,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)"
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false,
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "residual": -97.5,
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
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
      "target": "#pane-doc-nav [data-document-id=\"archive/archive-001\"]",
      "folderPath": null,
      "documentId": "archive/archive-001",
      "path": "cdp",
      "realInput": true,
      "hit": "preempt-node-node-168080",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": 179.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "hook",
          "structural": true,
          "structuralReason": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured"
        },
        {
          "id": "docheads.pull",
          "ms": 5.8,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 14.7,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "envelope.assemble",
          "ms": 0.5,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "shared.decorate",
          "ms": 1.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 2085.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 74,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 1742.5,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived",
          "structural": false,
          "structuralReason": null
        }
      ],
      "longTasks": [
        {
          "start": 9868.300000011921,
          "duration": 98
        },
        {
          "start": 9996.200000017881,
          "duration": 2124
        }
      ],
      "longTaskTotalMs": 2222,
      "mutations": 11758,
      "wallMs": 2352.6,
      "t0": 9864.300000011921,
      "t1": 12216.90000000596,
      "quiesce": {
        "frames": 11,
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
        "renderer": "1789952537561+678270+a25b03a9",
        "main": "1789952537438+2419392+955790a9",
        "served": "678270+a25b03a9"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 9864.700000017881,
          "t1": 12217,
          "ms": 2352.3
        },
        "freezeWindow": {
          "t0": 9864.300000011921,
          "t1": 12216.90000000596
        },
        "toleranceMs": 40,
        "armCount": 2,
        "disarmCount": 1,
        "stageRecords": [
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer"
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer"
          },
          {
            "stage": "traversal.build",
            "instance": "renderer"
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer"
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer"
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer"
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer"
          },
          {
            "stage": "traversal.build",
            "instance": "renderer"
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer"
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer"
          }
        ],
        "stageRecordDetail": [
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 26.8
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 23.1
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 23.4
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 23
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 119.4
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 3.7
          },
          {
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 8.9
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.8
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.2
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 3.9
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 23.6
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 1696.2
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 2084.6
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 59.8
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.1
          },
          {
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5.8
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.4
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 0.1
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.2
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.2
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 0.5
          }
        ],
        "mainSeamArmed": false,
        "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
        "mainRecordsTransport": "none — the main process records the handler span but no channel carries it into the renderer/report (§3.6b/S15/RUL-3)",
        "rendererArmed": true,
        "refused": [],
        "records": 22,
        "pendingSpans": 0,
        "dropped": 0,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile",
          "render.dom": "Runtime.render (the DomAdapter renderProducingProcess pass)",
          "render.ssr": "Runtime.render (the SSR mirror renderProducingProcess pass)"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-168080"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "reconciliation": {
        "ok": false,
        "residual": -1885,
        "sumMs": 4107,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)"
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false,
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "residual": -1885,
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true
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
      "hit": "preempt-node-node-181091",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": 27.8,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "hook",
          "structural": true,
          "structuralReason": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured"
        },
        {
          "id": "docheads.pull",
          "ms": 2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 5.4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "envelope.assemble",
          "ms": 0.3,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "shared.decorate",
          "ms": 2.9,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 0.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 1.5,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 0.8,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 0.4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived",
          "structural": false,
          "structuralReason": null
        }
      ],
      "longTasks": [],
      "longTaskTotalMs": 0,
      "mutations": 37,
      "wallMs": 80.7,
      "t0": 12622.40000000596,
      "t1": 12703.100000023842,
      "quiesce": {
        "frames": 7,
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
        "renderer": "1789952537561+678270+a25b03a9",
        "main": "1789952537438+2419392+955790a9",
        "served": "678270+a25b03a9"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 12623,
          "t1": 12703.200000017881,
          "ms": 80.2
        },
        "freezeWindow": {
          "t0": 12622.40000000596,
          "t1": 12703.100000023842
        },
        "toleranceMs": 40,
        "armCount": 3,
        "disarmCount": 2,
        "stageRecords": [
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer"
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer"
          },
          {
            "stage": "traversal.build",
            "instance": "renderer"
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer"
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer"
          }
        ],
        "stageRecordDetail": [
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 27.8
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2
          },
          {
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5.4
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 2.9
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 0.1
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.5
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.4
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 1.5
          }
        ],
        "mainSeamArmed": false,
        "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
        "mainRecordsTransport": "none — the main process records the handler span but no channel carries it into the renderer/report (§3.6b/S15/RUL-3)",
        "rendererArmed": true,
        "refused": [],
        "records": 11,
        "pendingSpans": 0,
        "dropped": 0,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile",
          "render.dom": "Runtime.render (the DomAdapter renderProducingProcess pass)",
          "render.ssr": "Runtime.render (the SSR mirror renderProducingProcess pass)"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-181091"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "reconciliation": {
        "ok": false,
        "residual": -41.2,
        "sumMs": 41.2,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)"
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false,
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "residual": -41.2,
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
      "trackAblationEvidence": {
        "available": true,
        "selector": "#zone:main",
        "elId": "zone:main",
        "computed": "block",
        "rootDisplay": "grid",
        "previous": "",
        "detail": "the stage cell is a grid item of #wiki-root",
        "mutation": null,
        "disclosureReset": {
          "collapsed": true,
          "detail": "document rows 20 → 0 (toggle-to-collapsed)"
        }
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
      "hit": "preempt-node-node-181943",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": 29,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "hook",
          "structural": true,
          "structuralReason": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured"
        },
        {
          "id": "docheads.pull",
          "ms": 2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 5.3,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "envelope.assemble",
          "ms": 0.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "shared.decorate",
          "ms": 0.3,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 0.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 4.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 0.7,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 0.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived",
          "structural": false,
          "structuralReason": null
        }
      ],
      "longTasks": [],
      "longTaskTotalMs": 0,
      "mutations": 37,
      "wallMs": 82.3,
      "t0": 13107,
      "t1": 13189.300000011921,
      "quiesce": {
        "frames": 4,
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
        "renderer": "1789952537561+678270+a25b03a9",
        "main": "1789952537438+2419392+955790a9",
        "served": "678270+a25b03a9"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 13107.40000000596,
          "t1": 13189.40000000596,
          "ms": 82
        },
        "freezeWindow": {
          "t0": 13107,
          "t1": 13189.300000011921
        },
        "toleranceMs": 40,
        "armCount": 4,
        "disarmCount": 3,
        "stageRecords": [
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer"
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer"
          },
          {
            "stage": "traversal.build",
            "instance": "renderer"
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer"
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer"
          }
        ],
        "stageRecordDetail": [
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.1
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 29
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2
          },
          {
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5.3
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.2
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 0.1
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.4
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.5
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 4.6
          }
        ],
        "mainSeamArmed": false,
        "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
        "mainRecordsTransport": "none — the main process records the handler span but no channel carries it into the renderer/report (§3.6b/S15/RUL-3)",
        "rendererArmed": true,
        "refused": [],
        "records": 11,
        "pendingSpans": 0,
        "dropped": 0,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile",
          "render.dom": "Runtime.render (the DomAdapter renderProducingProcess pass)",
          "render.ssr": "Runtime.render (the SSR mirror renderProducingProcess pass)"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-181943"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "reconciliation": {
        "ok": false,
        "residual": -42.8,
        "sumMs": 42.8,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)"
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false,
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "residual": -42.8,
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
      "trackAblationEvidence": {
        "available": true,
        "selector": "#zone:main",
        "elId": "zone:main",
        "computed": "block",
        "rootDisplay": "grid",
        "previous": "",
        "detail": "the stage cell is a grid item of #wiki-root",
        "mutation": "#zone:main (the stage grid cell of #wiki-root): display:block (removes the #wiki-root grid-track sizing from the measurement path)",
        "reverted": true,
        "disclosureReset": {
          "collapsed": true,
          "detail": "document rows 20 → 0 (toggle-to-collapsed)"
        }
      },
      "trackAblationDelta": {
        "longTaskTotalMs": 0,
        "mutations": 0,
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
    "stage traversal.build is 684.2 ms of the 990 ms long task (69.11%) on folder-row — traversal.build is the largest identified stage",
    "the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 85.9 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-folder-row-gpuoff-r1: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-folder-row-gpuoff-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "stage reconcile.apply is 2085.1 ms of the 2222 ms long task (93.84%) on document-row — reconcile.apply is the largest identified stage",
    "the document-row performed 2 whole-store IPC_RAG_SNAPSHOT read(s) totalling 179.2 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-document-row-gpuoff-r1: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-document-row-gpuoff-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "stage snapshot.pull is 27.8 ms of the 0 ms long task on folder-row — snapshot.pull is the largest identified stage; no percentage is computed: the long-task window is zero (0 ms), so this row has no finite window to divide by",
    "the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 27.8 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-fold-ablation-off: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-fold-ablation-off: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "stage snapshot.pull is 29 ms of the 0 ms long task on folder-row — snapshot.pull is the largest identified stage; no percentage is computed: the long-task window is zero (0 ms), so this row has no finite window to divide by",
    "the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 29 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-fold-ablation-on: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-fold-ablation-on: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "O-0 REPORT OPEN — 4 stage(s) structurally unseparated (o0-folder-row-gpuoff-r1:snapshot.clone, o0-document-row-gpuoff-r1:snapshot.clone, o0-fold-ablation-off:snapshot.clone, o0-fold-ablation-on:snapshot.clone): run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4) — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed"
  ],
  "reconciliation": {
    "ok": false,
    "note": "structurally unseparated stage(s) o0-folder-row-gpuoff-r1:snapshot.clone, o0-document-row-gpuoff-r1:snapshot.clone, o0-fold-ablation-off:snapshot.clone, o0-fold-ablation-on:snapshot.clone have no seam in the executing bundle (run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)), so the long-task residual is NOT computable and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)",
    "structuralStages": [
      "o0-folder-row-gpuoff-r1:snapshot.clone",
      "o0-document-row-gpuoff-r1:snapshot.clone",
      "o0-fold-ablation-off:snapshot.clone",
      "o0-fold-ablation-on:snapshot.clone"
    ]
  },
  "pass": false,
  "status": "OPEN-structural",
  "artifactPath": "/tmp/o0c-gpuoff.json"
}
```

### 13.2 GPU-ON leg — `/tmp/o0c-gpuon.json`

```json
{
  "artifact": "o-0-per-stage-breakdown",
  "spec": "docs/specs/unit-o-0-per-stage-measurement.md",
  "unit": "O-0",
  "date": "2026-09-21",
  "layer": "assembled-renderer (RCA-12)",
  "commands": [
    "node scripts/live-drive.mjs --display=:0 --gpu --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --o0-out=/tmp/o0c-gpuon.json --block=o0_gpu_control,o0_repeat_determinism"
  ],
  "pinnedCommands": [
    "npm run build",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --display=:0 --o0-out=<path> --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --gpu --display=:0 --o0-out=<path> --block=o0_gpu_control"
  ],
  "driver": {
    "build": {
      "renderer": "1789952556962+678270+a25b03a9",
      "main": "1789952556843+2419392+955790a9",
      "served": "678270+a25b03a9",
      "servedUrl": "file:///media/ryanr/Shared%20Files/Projects/Astrographer/dist/renderer/renderer.js",
      "disk": {
        "rendererBytes": 678270,
        "rendererHash": "a25b03a9"
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
      "--o0-out=/tmp/o0c-gpuon.json",
      "--block=o0_gpu_control,o0_repeat_determinism"
    ],
    "runMode": "spawn",
    "leg": "gpu-on",
    "blocks": [
      "o0_gpu_control",
      "o0_repeat_determinism"
    ],
    "appFlag": "app spawned by this driver (gpu on)",
    "artifactDoc": "docs/specs/unit-o-0-per-stage-breakdown.md",
    "crossArtifactControlPairs": [
      "gpu-on"
    ],
    "gpuDeltas": [
      {
        "gesture": "folder-row+document-row",
        "delta": "+2173 / +2419",
        "provenanceRun": "the 2026-09-17 first run (226 docs / 10 170 nodes / 18 758 edges)",
        "carriedFromAnotherRun": false,
        "contradictedBy": "the 2026-09-21 second run measured −36 / −23 ms on an identical mutation count (both legs)",
        "label": "PROVENANCE ONLY — the first run's GPU delta is contradicted by a later run and is NOT a finding any unit may rest on (§2.4/RUL-5-L9/S20); the node/edge counts belong to that run's corpus, never to a threshold"
      }
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
        "inert": true,
        "controlledPair": true,
        "stateReset": {
          "baseline": {
            "collapsed": true,
            "detail": "document rows 20 → 0 (toggle-to-collapsed)"
          },
          "armed": {
            "collapsed": true,
            "detail": "document rows 20 → 0 (toggle-to-collapsed)"
          }
        },
        "mutations": {
          "unarmed": 37,
          "armed": 37
        },
        "longTaskTotalMs": {
          "unarmed": 0,
          "armed": 0
        },
        "nonVacuousHalves": {
          "mutations": true,
          "longTaskTotalMs": false
        },
        "carriedBy": [
          "mutations"
        ],
        "vacuousHalves": [
          "longTaskTotalMs (the unarmed baseline measured a 0 ms window — ΔlongTaskTotalMs=0 is 0-vs-0)"
        ],
        "nonVacuous": false,
        "mutationHalfProof": true,
        "proofStatement": "the hook inertness pair is a MUTATION-HALF proof: Δmutations 0 === 0 with 37 mutation(s) observed in each freeze; the long-task half is VACUOUS (both freezes totalled 0 ms — a 0-vs-0 comparison, nonVacuous:false), so no numeric long-task proof is claimed"
      }
    ],
    "hookInertnessProof": [
      {
        "pair": "o0-repeat-a-unarmed / o0-repeat-b-armed",
        "carriedBy": [
          "mutations"
        ],
        "vacuousHalves": [
          "longTaskTotalMs (the unarmed baseline measured a 0 ms window — ΔlongTaskTotalMs=0 is 0-vs-0)"
        ],
        "nonVacuousHalves": {
          "mutations": true,
          "longTaskTotalMs": false
        },
        "statement": "the hook inertness pair is a MUTATION-HALF proof: Δmutations 0 === 0 with 37 mutation(s) observed in each freeze; the long-task half is VACUOUS (both freezes totalled 0 ms — a 0-vs-0 comparison, nonVacuous:false), so no numeric long-task proof is claimed"
      }
    ],
    "mainSeamArmed": false,
    "mainSeamRecords": 0,
    "mainTransport": {
      "channel": null,
      "note": "RUL-3 — the MAIN instance IS armed in spawn mode (ASTROGRAPHER_O0_MAIN_ARM=1) and its handler wrap records `snapshot.clone`, but no channel carries those records into the renderer/report, and Electron's structured clone of the handler return value runs inside the IPC internals after the handler returns (outside every host-side wrap): the stage is structurally unseparated with this exact reason, never an imputed number"
    },
    "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
    "engineEvidence": {
      "probe": "gnosis.status (MCP) → the engine HealthReport",
      "calledAt": "2026-09-21",
      "resolved": true,
      "error": "fetch failed",
      "healthState": null,
      "keys": null,
      "derived": "absent",
      "positiveSignal": false,
      "rule": "ready IFF the call resolved with a HealthReport whose state ∈ {Ready, Starting, Degraded} (a POSITIVE engine signal); absent otherwise — \"the MCP call resolved\" is NOT evidence (§4.3/S21/RUL-5)",
      "contradiction": null,
      "observed": "an error payload from the status call (fetch failed)"
    },
    "engineError": null,
    "display": ":0",
    "failReasons": [
      "run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-folder-row-gpuon-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-document-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-document-row-gpuon-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
    ],
    "gatingReasons": [],
    "openStructuralReasons": [
      "run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-folder-row-gpuon-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-document-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-document-row-gpuon-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
    ],
    "notes": [
      "run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-folder-row-gpuon-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-document-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-document-row-gpuon-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "o0_gpu_control: the gpu-on leg is paired CROSS-ARTIFACT with gpu-off (o0-folder-row-gpuoff-r1, o0-document-row-gpuoff-r1) — the §3.5 command pair emits one artifact per leg; only the merged artifact verifies the pairing."
    ],
    "structuralStages": [
      "o0-folder-row-gpuon-r1:snapshot.clone",
      "o0-document-row-gpuon-r1:snapshot.clone"
    ],
    "openStructural": true,
    "selfValidation": {
      "ok": true,
      "attempts": 2,
      "runIds": [
        "o0-folder-row-gpuon-r1",
        "o0-document-row-gpuon-r1"
      ],
      "errors": [],
      "status": "OPEN-structural",
      "structuralErrors": 0,
      "structuralFacts": 2,
      "moduleGating": [],
      "rowResults": [
        {
          "id": "o0-folder-row-gpuon-r1",
          "ok": true,
          "errors": []
        },
        {
          "id": "o0-document-row-gpuon-r1",
          "ok": true,
          "errors": []
        }
      ],
      "gatingReasons": [],
      "note": "RUL-4/F17c — the structural family is recorded, never counted as a self-validation ERROR: a structurally-open report is ok:true/empty errors with status \"OPEN-structural\""
    },
    "status": "OPEN-structural",
    "pass": false,
    "statusStatement": "OPEN-structural — 4 structurally-unmeasurable stage(s) (no seam in the executing bundle) and 2 DERIVED-residual record(s): the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed (§3.6b RUL-4, §6 S14/S19)",
    "structuralReasons": [
      "run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-folder-row-gpuon-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "run o0-document-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)",
      "run o0-document-row-gpuon-r1: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)",
      "runs[0]: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14: NO seam exists in the executing bundle, distinct from a seam that merely was not armed)",
      "runs[1]: stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14: NO seam exists in the executing bundle, distinct from a seam that merely was not armed)",
      "runs[0]: stage post.style is unseparated as the DERIVED residual (§2.2 id 11: post.style is COMPUTED from longTaskTotalMs − Σ(named stages), never a timed probe) — it cannot be separated while any stage above is unseparated (recorded, non-gating — §5 P-TP-1/RUL-4)",
      "runs[1]: stage post.style is unseparated as the DERIVED residual (§2.2 id 11: post.style is COMPUTED from longTaskTotalMs − Σ(named stages), never a timed probe) — it cannot be separated while any stage above is unseparated (recorded, non-gating — §5 P-TP-1/RUL-4)",
      "run o0-folder-row-gpuon-r1: post.style residual null ms (Σ named stages 1126.5 of 1032 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)",
      "run o0-document-row-gpuon-r1: post.style residual null ms (Σ named stages 4127.099999999999 of 2213 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)"
    ]
  },
  "tolerance": {
    "reconcileMs": 50,
    "source": "measured 2026-09-21"
  },
  "corpus": {
    "source": "--o0-corpus",
    "claimedDocuments": 226,
    "documents": 226,
    "nodes": 6102,
    "edges": 9266,
    "seed": "o0-2026-09-17",
    "gate": "documents",
    "provenanceOnly": [
      "nodes",
      "edges",
      "bytes"
    ],
    "note": "the corpus SIZE is the GATE (documents === the claimed census, §3.4/§6 F8) and it is the ONLY pin; nodes/edges/bytes are RECORDED PROVENANCE about the corpus source actually used, NOT a pin and NOT a cross-run comparable claim — a same-size corpus with different bytes yields different absolute ms values (the two runs so far read 10 170/18 758 and 6 102/9 266 nodes/edges at 226 documents, both legal), so (a) no byte-reproducibility may be claimed, (b) no cross-run absolute ms comparison is a measurement, and (c) the node-ceiling input for the parked trigger (b) must be read from THIS run's corpus row with the byte-size gap named (§3.4/§4.3/RUL-5/L10, §10 item 2)"
  },
  "env": {
    "mode": "lexical",
    "gpu": true,
    "engine": "absent",
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
      "hit": "preempt-node-node-85762",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": 83.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "hook",
          "structural": true,
          "structuralReason": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured"
        },
        {
          "id": "docheads.pull",
          "ms": 2.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 715.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "envelope.assemble",
          "ms": 0.3,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "shared.decorate",
          "ms": 11,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 16.4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 159.5,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 65.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 72.9,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived",
          "structural": false,
          "structuralReason": null
        }
      ],
      "longTasks": [
        {
          "start": 8698.59999999404,
          "duration": 63
        },
        {
          "start": 8790.699999988079,
          "duration": 969
        }
      ],
      "longTaskTotalMs": 1032,
      "mutations": 37,
      "wallMs": 1095.4,
      "t0": 8692.299999982119,
      "t1": 9787.699999988079,
      "quiesce": {
        "frames": 4,
        "quiesced": true,
        "timedOut": false,
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
        "renderer": "1789952556962+678270+a25b03a9",
        "main": "1789952556843+2419392+955790a9",
        "served": "678270+a25b03a9"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 8693.09999999404,
          "t1": 9787.899999976158,
          "ms": 1094.8
        },
        "freezeWindow": {
          "t0": 8692.299999982119,
          "t1": 9787.699999988079
        },
        "toleranceMs": 40,
        "armCount": 1,
        "disarmCount": 0,
        "stageRecords": [
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer"
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer"
          },
          {
            "stage": "traversal.build",
            "instance": "renderer"
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer"
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer"
          }
        ],
        "stageRecordDetail": [
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 35.8
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 25.9
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 83.6
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.1
          },
          {
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 715.6
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 11
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 16.4
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 29.3
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 47
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 159.5
          }
        ],
        "mainSeamArmed": false,
        "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
        "mainRecordsTransport": "none — the main process records the handler span but no channel carries it into the renderer/report (§3.6b/S15/RUL-3)",
        "rendererArmed": true,
        "refused": [],
        "records": 11,
        "pendingSpans": 0,
        "dropped": 0,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile",
          "render.dom": "Runtime.render (the DomAdapter renderProducingProcess pass)",
          "render.ssr": "Runtime.render (the SSR mirror renderProducingProcess pass)"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-85762"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "reconciliation": {
        "ok": false,
        "residual": -94.5,
        "sumMs": 1126.5,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)"
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false,
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "residual": -94.5,
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true
    },
    {
      "id": "o0-document-row-gpuon-r1",
      "block": "o0_gpu_control",
      "gesture": "document-row",
      "target": "#pane-doc-nav [data-document-id=\"archive/archive-001\"]",
      "folderPath": null,
      "documentId": "archive/archive-001",
      "path": "cdp",
      "realInput": true,
      "hit": "preempt-node-node-168080",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": 172.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "snapshot.clone",
          "ms": null,
          "unseparated": true,
          "source": "hook",
          "structural": true,
          "structuralReason": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured"
        },
        {
          "id": "docheads.pull",
          "ms": 4.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 10.9,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "envelope.assemble",
          "ms": 0.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "shared.decorate",
          "ms": 0.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 2.7,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 2075.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 76.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 1784.3,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "post.style",
          "ms": null,
          "unseparated": true,
          "source": "derived",
          "structural": false,
          "structuralReason": null
        }
      ],
      "longTasks": [
        {
          "start": 10044.5,
          "duration": 105
        },
        {
          "start": 10179.399999976158,
          "duration": 2108
        }
      ],
      "longTaskTotalMs": 2213,
      "mutations": 11758,
      "wallMs": 2322.8,
      "t0": 10041.5,
      "t1": 12364.299999982119,
      "quiesce": {
        "frames": 10,
        "quiesced": true,
        "timedOut": false,
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
        "renderer": "1789952556962+678270+a25b03a9",
        "main": "1789952556843+2419392+955790a9",
        "served": "678270+a25b03a9"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 10042,
          "t1": 12364.399999976158,
          "ms": 2322.4
        },
        "freezeWindow": {
          "t0": 10041.5,
          "t1": 12364.299999982119
        },
        "toleranceMs": 40,
        "armCount": 2,
        "disarmCount": 1,
        "stageRecords": [
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer"
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer"
          },
          {
            "stage": "traversal.build",
            "instance": "renderer"
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer"
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer"
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer"
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer"
          },
          {
            "stage": "traversal.build",
            "instance": "renderer"
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer"
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer"
          },
          {
            "stage": "render.dom",
            "instance": "renderer"
          },
          {
            "stage": "render.ssr",
            "instance": "renderer"
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer"
          }
        ],
        "stageRecordDetail": [
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 28
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 26.3
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 25.4
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 24.2
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 128.6
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2
          },
          {
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5.4
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 2.5
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 22.5
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 1733.7
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 2075.2
          },
          {
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 43.6
          },
          {
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.1
          },
          {
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5.5
          },
          {
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.3
          },
          {
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 0.2
          },
          {
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.2
          },
          {
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.1
          },
          {
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 0.4
          }
        ],
        "mainSeamArmed": false,
        "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
        "mainRecordsTransport": "none — the main process records the handler span but no channel carries it into the renderer/report (§3.6b/S15/RUL-3)",
        "rendererArmed": true,
        "refused": [],
        "records": 22,
        "pendingSpans": 0,
        "dropped": 0,
        "seamMap": {
          "traversal.build": "buildTraversal",
          "envelope.assemble": "assembleAppGraphEnvelope",
          "shared.decorate": "decorateShared",
          "reconcile.roots": "reconcileDocumentRoots",
          "reconcile.apply": "Runtime.applyContentReconcile",
          "render.dom": "Runtime.render (the DomAdapter renderProducingProcess pass)",
          "render.ssr": "Runtime.render (the SSR mirror renderProducingProcess pass)"
        },
        "rendererHandle": "window.__o0recorder",
        "stageRowsSource": "src/shared/o0-hook.ts:stagesFromO0HookRecords",
        "unarmedBaseline": false,
        "longtaskUnsupported": null
      },
      "dispatch": {
        "hitAtDispatch": "preempt-node-node-168080"
      },
      "seed": "o0-2026-09-17",
      "corpusSource": "--o0-corpus",
      "pass": true,
      "failReasons": [],
      "reconciliation": {
        "ok": false,
        "residual": -1914.1,
        "sumMs": 4127.1,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)"
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "source": "derived",
        "timed": false,
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "residual": -1914.1,
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true
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
    "stage traversal.build is 715.6 ms of the 1032 ms long task (69.34%) on folder-row — traversal.build is the largest identified stage",
    "the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 83.6 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-folder-row-gpuon-r1: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-folder-row-gpuon-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "stage reconcile.apply is 2075.6 ms of the 2213 ms long task (93.79%) on document-row — reconcile.apply is the largest identified stage",
    "the document-row performed 2 whole-store IPC_RAG_SNAPSHOT read(s) totalling 172.2 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-document-row-gpuon-r1: reconciliation OPEN-structural — unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-document-row-gpuon-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "O-0 REPORT OPEN — 2 stage(s) structurally unseparated (o0-folder-row-gpuon-r1:snapshot.clone, o0-document-row-gpuon-r1:snapshot.clone): run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4) — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed"
  ],
  "reconciliation": {
    "ok": false,
    "note": "structurally unseparated stage(s) o0-folder-row-gpuon-r1:snapshot.clone, o0-document-row-gpuon-r1:snapshot.clone have no seam in the executing bundle (run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)), so the long-task residual is NOT computable and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)",
    "structuralStages": [
      "o0-folder-row-gpuon-r1:snapshot.clone",
      "o0-document-row-gpuon-r1:snapshot.clone"
    ]
  },
  "pass": false,
  "status": "OPEN-structural",
  "artifactPath": "/tmp/o0c-gpuon.json"
}
```

---

## 14. Provenance

Run 3 of unit O-0, 2026-09-20 (host clock; the report's UTC stamp reads 2026-09-21).
Executed by the **Live-scenario runner** against the **assembled app** (spawn mode,
`DISPLAY=:0`), never against node modules. Commands: §1. Raw JSON: §13 (both legs, verbatim,
unmodified). Oracle re-runs recorded in §8/§10 were executed against the embedded JSON with the
pure module `src/shared/o0-report.ts` (`deriveO0WindowBound`, `deriveO0StageVerdict`,
`validateO0Run`, `validateO0Report`) — the module that both the driver and the tests use.
Supersedes: run 1 (`docs/specs/unit-o-0-per-stage-measurement.md` §12, 2026-09-17) and run 2
(the previous revision of THIS file, now §12.12 of the spec, 2026-09-20). **The unit remains
OPEN: `status:"OPEN-structural"` is a completed measurement with recorded structural gaps, not a
DONE. Only a run at `status:"OK"` (every stage measured or `derived`) opens the O-5 delegation
gate (§11).**
