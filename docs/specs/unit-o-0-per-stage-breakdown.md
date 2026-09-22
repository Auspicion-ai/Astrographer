# Unit O-0 — Per-stage freeze breakdown (THE PRECONDITION ARTIFACT)

> **STATUS BANNER — read before quoting any number below.** This is the **NINTH live
> run** of unit O-0, regenerated on the **`O0-M1-M3-MEASUREMENT-SHAPE` harness AFTER the §3b
> RE-AUDIT FIX SET** (the row-`stages[]` clause, the per-pass RE-DERIVATION against
> `partitionO0RowPasses(row).passes[i]`, the row-level `null`-remainder reason requirement, the
> `sessionCountsAt` reason moved into the forcing channel, the one-reading `legacyShape`, plus the
> driver's oracle-identity provenance and the post-finalize re-validation of the EMITTED object)
> — **runs 1-8 are SUPERSEDED by this revision** (unit spec §13/§14; run 1-3's raw records survive
> in `docs/specs/unit-o-0-per-stage-measurement.md` §12/§12.12, run 4's in that file's §12.14, and
> runs 5-8 (FIFTH FAIL, SIXTH, SEVENTH FAIL, EIGHTH) in this file's git history).
> **Run date: 2026-09-21** (host clock, local `America/Chicago`; the report's own `date` field
> reads `2026-09-21`). **RCA-11: a changed harness invalidates the prior live provenance** — this
> revision supersedes the eighth edition's provenance AND its verdict.
>
> ## BOTH LEGS: `status: "OPEN-structural"`, `pass: false`, `driver.selfValidation.ok: true` —
> ## **THE DEC-1-ACCEPTED FORM WAS REPRODUCED ON THE RE-AUDITED HARNESS.**
>
> | leg | `status` | `pass` | `selfValidation.ok` | `selfValidationOfEmitted.ok` | `errors` | `gatingReasons` |
> | --- | --- | --- | --- | --- | --- | --- |
> | GPU-OFF | **`OPEN-structural`** | **`false`** | **`true`** | **`true`** | **`[]` (0)** | **`[]` (0)** |
> | GPU-ON | **`OPEN-structural`** | **`false`** | **`true`** | **`true`** | **`[]` (0)** | **`[]` (0)** |
>
> **`pass:false` is the measurement's verdict, not a failure reason**: the `snapshot.clone`
> structural gap (§11.4/L3s) is a recorded structural FACT and is not gating — there is **no forcing
> reason on either leg** and `errors[]`/`gatingReasons[]` are empty. **Class: DEC-1's accepted form.**
> The §3b re-audit changed the HARNESS, the driver and the source-imported ORACLE itself; the
> emitted legs are therefore a REGENERATION (RCA-11), and the per-row re-validation now covers the
> NEW clauses — the row `stages[]` closed-set clause, the per-pass RE-DERIVATION, the
> `records.indices` totality clause and the row-level `null`-remainder reason requirement (§8.4).
>
> **The oracle the verdicts came from is now RECORDED, not implied** (§2.3): `driver.oracleIdentity`
> pins `src/shared/o0-report.ts` (`b89d6f19`) + `scripts/live-drive.mjs` (`194dfece`) = `92a74b7d`,
> because the driver imports the oracle from SOURCE and `driver.build.verified` is evidence about the
> EXECUTING BUNDLE only. **The ninth edition is a DIFFERENT-ORACLE run on the SAME bundle bytes.**

---
## 1. Run commands (verbatim, as executed)

Working dir `/media/ryanr/Shared Files/Projects/Astrographer`; `DISPLAY=:0` (`--display=:0`, propagated into the spawn env).
**No app was running before either leg** (`pgrep -af "electron|live-drive"` → none; MCP
`:3787` / CDP `:9222` free), so both legs used the driver's **spawn** path
(`driver.runMode: "spawn"`), never `--connect`. The driver sets
`ASTROGRAPHER_O0_MAIN_ARM=1` for the spawned main process (the main-side `snapshot.clone`
wrap IS armed; no channel carries its records out — finding **L3s**, §11.4).

```bash
# 0) rebuild the EXECUTING bundle FIRST (docs/live-testing.md:119-124)
npm run build     # dist/renderer/renderer.js 678367 B, dist/main/main.cjs 2419628 B
                  # djb2 3e3f1b80 (renderer) / 1e652667 (main) under the DRIVER's own o0Hash
                  # (scripts/live-drive.mjs:721 — djb2 as XOR, h*33^c; a shift-add variant computes
                  # DIFFERENT digits for the SAME bytes, which is why the identity below is the
                  # driver's own). The content hash is the SAME as runs 5/6/7/8; NOTE: each leg's
                  # spawn path (scripts/start-app.sh:116) rebuilds dist/ itself, so the recorded
                  # mtime prefix differs per leg while the CONTENT hash does not.
                  # sha256 dist/renderer/renderer.js = b1ed97f89a0a078c… (a different instrument)

# 1) GPU-OFF leg (the sanctioned launch path: --no-gpu is passed when --gpu is absent)
DISPLAY=:0 ASTROGRAPHER_O0_MAIN_ARM=1 node scripts/live-drive.mjs \
  --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed \
  --o0-corpus=226 --display=:0 --o0-out=/tmp/o0i-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism

# 2) GPU-ON leg (app (re)spawned WITHOUT --no-gpu; --gpu records the leg identity)
DISPLAY=:0 ASTROGRAPHER_O0_MAIN_ARM=1 node scripts/live-drive.mjs \
  --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed \
  --o0-corpus=226 --display=:0 --gpu --o0-out=/tmp/o0i-gpuon.json \
  --block=o0_gpu_control,o0_repeat_determinism
```

**The driver's own recorded `commands[]` strings for these two legs:**

```json
{
  "gpu-off": ["node scripts/live-drive.mjs --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --display=:0 --o0-out=/tmp/o0i-gpuoff.json --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism"],
  "gpu-on": ["node scripts/live-drive.mjs --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --display=:0 --gpu --o0-out=/tmp/o0i-gpuon.json --block=o0_gpu_control,o0_repeat_determinism"]
}
```

**No `scripts/**`, `src/**` or `tests/**` edit was made by this pass.** The §3b re-audit fix set
(the row-`stages[]` clause, the per-pass re-derivation, the `null`-remainder reason requirement and
the `sessionCountsAt` forcing-channel fix in `src/shared/o0-report.ts`; the oracle-identity
provenance and the emitted-object re-validation in `scripts/live-drive.mjs`) was **already landed**
when this run started and is exercised live below (§7.5/§8.4). The harness therefore differs from
the eighth edition's in the ORACLE, not in anything this pass wrote:

```text
oracleIdentity: src/shared/o0-report.ts bytes=200143 djb2=b89d6f19
                scripts/live-drive.mjs bytes=395314 djb2=194dfece
                composite 92a74b7d (IDENTICAL on both legs)
executing bundle: renderer 678367+3e3f1b80 / main 2419628+1e652667 (content hash UNCHANGED from runs 5-8)
```

**The trio (this pass):**

```text
npx vitest run      # the FULL suite (BEFORE this regeneration): Test Files 221 passed (221) /
                    #   Tests 4988 passed | 58 skipped (5046) — matches the supervisor's 221/4 988/58/0
npx vitest run tests/unit-o0-m1-m3-driver-contract.test.ts
                    #   BEFORE this regeneration: 14 passed (14) — the EDITION PROBE is still
                    #   EXPECTED_EDITION = 'EIGHTH', so against THIS (NINTH) edition LIVE-1 goes RED
                    #   (the owed TEST repoint, §11.3) while LIVE-2's per-row walk stays GREEN
npm run typecheck   # tsc --noEmit -p tsconfig.json — 0 errors
npm run build       # dist/renderer/renderer.js 678367 B djb2 3e3f1b80 / dist/main/main.cjs 2419628 B djb2 1e652667
```

---
## 2. Environment + build identity

| field | GPU-OFF | GPU-ON |
| --- | --- | --- |
| `driver.runMode` | `spawn` | `spawn` |
| `driver.gpuFlag` | `false` | `true` |
| `driver.blocks` | `o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism` | `o0_gpu_control,o0_repeat_determinism` |
| `driver.build.renderer` | `1789977178309+678367+3e3f1b80` | `1789977207408+678367+3e3f1b80` |
| `driver.build.main` | `1789977178193+2419628+1e652667` | `1789977207293+2419628+1e652667` |
| `driver.build.served` | `678367+3e3f1b80` | `678367+3e3f1b80` |
| **`driver.build.verified`** | **true** | **true** |
| `env` | `{"mode":"lexical","gpu":false,"engine":"absent","display":":0","paneFrames":2}` | `{"mode":"lexical","gpu":true,"engine":"absent","display":":0","paneFrames":2}` |
| `driver.display` | `:0` | `:0` |
| `date` | `2026-09-21` | `2026-09-21` |
| `layer` | `assembled-renderer (RCA-12)` | `assembled-renderer (RCA-12)` |
| `artifactPath` | `/tmp/o0i-gpuoff.json` | `/tmp/o0i-gpuon.json` |

**`driver.build.verified:true` on BOTH legs** — the served renderer's bytes+hash equal the
on-disk bundle, so the numbers are accepted (§3.6/F2). `env.engine:"absent"` records the
non-gating engine state (§6 S4); `env.mode:"lexical"`, `env.paneFrames:2`. The mtime
prefix of the identity is per-leg because `scripts/start-app.sh:115-116` rebuilds `dist/`
in the same spawn the driver launches; the **content hash is identical to runs 5-8**.

### 2.3 The ORACLE IDENTITY (new in this edition — §3b re-audit provenance)

`driver.build.verified` compares the SERVED renderer against the ON-DISK bundle: it is
evidence about the **MEASURED app**, never about the code that minted the verdicts. The
driver imports `src/shared/o0-report.ts` **from source** (`o0Twins.report`) and its row
verdicts come from THAT text plus its own row assembly, so the run now RECORDS the oracle:

```json
{
  "gpu-off": {
    "source": "source-import",
    "report": {
      "path": "src/shared/o0-report.ts",
      "bytes": 200143,
      "hash": "b89d6f19",
      "short": "b89d6f19"
    },
    "driver": {
      "path": "scripts/live-drive.mjs",
      "bytes": 395314,
      "hash": "194dfece",
      "short": "194dfece"
    },
    "hash": "92a74b7d",
    "short": "92a74b7d",
    "note": "the per-row verdicts are produced by the SOURCE-IMPORTED oracle (src/shared/o0-report.ts) + this driver’s row assembly — `driver.build.verified` is evidence about the EXECUTING BUNDLE only, never about the code that minted the verdicts (§3b re-audit, oracle provenance)"
  },
  "gpu-on": {
    "source": "source-import",
    "report": {
      "path": "src/shared/o0-report.ts",
      "bytes": 200143,
      "hash": "b89d6f19",
      "short": "b89d6f19"
    },
    "driver": {
      "path": "scripts/live-drive.mjs",
      "bytes": 395314,
      "hash": "194dfece",
      "short": "194dfece"
    },
    "hash": "92a74b7d",
    "short": "92a74b7d",
    "note": "the per-row verdicts are produced by the SOURCE-IMPORTED oracle (src/shared/o0-report.ts) + this driver’s row assembly — `driver.build.verified` is evidence about the EXECUTING BUNDLE only, never about the code that minted the verdicts (§3b re-audit, oracle provenance)"
  }
}
```

**Recomputed independently in this pass from the files themselves** (the driver's own `o0Hash`, §1):

| file | bytes | djb2 (driver's `o0Hash`) | sha256[:16] | recorded in the leg |
| --- | --- | --- | --- | --- |
| `src/shared/o0-report.ts` | 200143 | **`b89d6f19`** | `bc2ec2879a401b50` | agree |
| `scripts/live-drive.mjs` | 395314 | **`194dfece`** | `770572d351cad0e3` | agree |
| composite | — | **`92a74b7d`** | — | agree on both legs |

**Both legs record the IDENTICAL oracle identity** (`92a74b7d`), so the two legs' verdicts are
attributable to one oracle edition; and the executing bundle's content hash (`3e3f1b80`) is
unchanged from runs 5-8 — **the ninth edition differs from the eighth in the ORACLE and the
HARNESS, not in the bundle bytes.** A re-run under an edited oracle is now visibly distinct.

---
## 3. Census

| field | GPU-OFF | GPU-ON |
| --- | --- | --- |
| `corpus.source` | `"--o0-corpus"` | `"--o0-corpus"` |
| `corpus.claimedDocuments` | `226` | `226` |
| `corpus.documents` | `226` | `226` |
| `corpus.nodes` | `6102` | `6102` |
| `corpus.edges` | `9266` | `9266` |
| `corpus.seed` | `o0-2026-09-17` | `o0-2026-09-17` |
| `corpus.gate` | `"documents"` | `"documents"` |

**The gate holds on both legs: `documents === claimedDocuments === 226`** (§3.4/§6 F8);
`nodes`/`edges` are recorded PROVENANCE about the corpus source actually used, never a pin
and never a cross-run comparable (RUL-5). Both legs read `6102` nodes / `9266` edges —
identical to runs 6/7/8. The pinned 226-file corpus was **re-verified, not regenerated**:
`find /tmp/o0-corpus-226 -name "*.md" | wc -l` → **226** (docs 200 + archive 20 + notes 6).

---
## 4. Per-stage table (the 11-id closed set) + the per-pass/reconciliation tables

### 4.1 GPU-OFF per-stage ms (row-declared, `hook` source)

| stage id | o0-folder-row-gpuoff-r1 | o0-document-row-gpuoff-r1 | o0-fold-ablation-off | o0-fold-ablation-on |
| --- | --- | --- | --- | --- |
| `snapshot.pull` | 85 | 173.6 | 28.1 | 27.5 |
| `snapshot.clone` | `unseparated` | `unseparated` | `unseparated` | `unseparated` |
| `docheads.pull` | 3.1 | 4.4 | 1.9 | 2.4 |
| `traversal.build` | 633.2 | 5.6 | 5.3 | 5.4 |
| `envelope.assemble` | 0.4 | 0.2 | 0.2 | 0.2 |
| `shared.decorate` | 10.1 | 0.4 | 4.3 | 0.5 |
| `reconcile.roots` | 14.8 | 2.4 | 0.1 | 0.2 |
| `reconcile.apply` | 153 | 2163.2 | 1.7 | 4.1 |
| `render.dom` | 59 | 72.2 | 0.6 | 0.8 |
| `render.ssr` | 72.4 | 1787.1 | 0.8 | 0.8 |
| `post.style` | `unseparated` | `unseparated` | `unseparated` | `unseparated` |

### 4.2 GPU-ON per-stage ms

| stage id | o0-folder-row-gpuon-r1 | o0-document-row-gpuon-r1 |
| --- | --- | --- |
| `snapshot.pull` | 88.9 | 175.3 |
| `snapshot.clone` | `unseparated` | `unseparated` |
| `docheads.pull` | 2.2 | 5 |
| `traversal.build` | 662.9 | 11.1 |
| `envelope.assemble` | 0.3 | 0.7 |
| `shared.decorate` | 10.4 | 0.6 |
| `reconcile.roots` | 15.5 | 2.7 |
| `reconcile.apply` | 146.2 | 2078.6 |
| `render.dom` | 61.9 | 69.8 |
| `render.ssr` | 75.9 | 1744.6 |
| `post.style` | `unseparated` | `unseparated` |

**The 11-id closed set is emitted on every row** (`stageCount: 11`, §8.1) with
`snapshot.clone` and `post.style` recorded `unseparated` — the structural pair, never a
number and never a zero (RUL-3/§6 S14).

### 4.3 The per-pass + reconciliation table (both legs, every row)

| leg | row | passes (`kind span/accounted/unaccounted`) | window | accounted | **unaccounted** | band | `bandExceeded` | `sumMs` | `naiveSumResidualMs` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | 0:pre-pass-render 61.7/61.6/0.1; 1:re-derive 925.1/899.6/25.5 | 1011.4 | 899.6 | **111.8** | 50 | **true** | 1031 | -91 |
| GPU-OFF | `o0-document-row-gpuoff-r1` | 0:pre-pass-render 94.3/93/1.3; 1:re-derive 2310.4/2289.4/21; 2:re-derive 60.4/60.4/0 | 2385.9 | 2349.8 | **36.1** | 50 | **false** | 4209.1 | -1917.1 |
| GPU-OFF | `o0-fold-ablation-off` | 0:pre-pass-render 0.3/0.3/0; 1:re-derive 56/41.6/14.4 | 77.2 | 41.6 | **35.6** | 50 | **false** | 43 | -43 |
| GPU-OFF | `o0-fold-ablation-on` | 0:pre-pass-render 0.4/0.4/0; 1:re-derive 57.6/40.3/17.3 | 81.6 | 40.3 | **41.3** | 50 | **false** | 41.9 | -41.9 |
| GPU-ON | `o0-folder-row-gpuon-r1` | 0:pre-pass-render 66.1/66.1/0; 1:re-derive 951.9/926.4/25.5 | 1027.8 | 926.4 | **101.4** | 50 | **true** | 1064.2 | -103.2 |
| GPU-ON | `o0-document-row-gpuon-r1` | 0:pre-pass-render 98.1/96.9/1.2; 1:re-derive 2233.9/2210.4/23.5; 2:re-derive 84.8/63.6/21.2 | 2337.5 | 2274 | **63.5** | 50 | **true** | 4088.4 | -1874.4 |

**Declared vs DERIVED (the §14.4 (a)/(b) strict clauses, still live):** every row's
declared `windowMs`/`accountedMs`/`unaccountedMs` equals the PURE oracle's re-derivation
within the recorded **0.1 ms** granularity — see §8.2 for the per-row table. The declared
triple is internally coherent (`unaccountedMs === windowMs − accountedMs`) on **6/6** rows.

### 4.4 A-4 read counts + ms (the whole-store `IPC_RAG_SNAPSHOT` reads)

The A-4 read count is the number of the shell's OWN caller-level `snapshot.pull` records
in the freeze window (`hook.stageRecordDetail`), not the stage-row cardinality (finding L4).
Taken from each row's driver verdict string and CROSS-CHECKED against that row's own
`hook.stageRecordDetail` entries whose `stage === "snapshot.pull"` (the caller-level round
trips) + its `snapshot.pull` stage row (the summed ms):

| leg | row | gesture | read count + ms | (cross-check: `stageRecordDetail` / stage row) |
| --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | folder-row | **1** read(s), **85 ms** | `stageRecordDetail` snapshot.pull records 1, row stage `snapshot.pull` 85 ms — **agree** |
| GPU-OFF | `o0-document-row-gpuoff-r1` | document-row | **2** read(s), **173.6 ms** | `stageRecordDetail` snapshot.pull records 2, row stage `snapshot.pull` 173.6 ms — **agree** |
| GPU-OFF | `o0-fold-ablation-off` | folder-row | **1** read(s), **28.1 ms** | `stageRecordDetail` snapshot.pull records 1, row stage `snapshot.pull` 28.1 ms — **agree** |
| GPU-OFF | `o0-fold-ablation-on` | folder-row | **1** read(s), **27.5 ms** | `stageRecordDetail` snapshot.pull records 1, row stage `snapshot.pull` 27.5 ms — **agree** |
| GPU-ON | `o0-folder-row-gpuon-r1` | folder-row | **1** read(s), **88.9 ms** | `stageRecordDetail` snapshot.pull records 1, row stage `snapshot.pull` 88.9 ms — **agree** |
| GPU-ON | `o0-document-row-gpuon-r1` | document-row | **2** read(s), **175.3 ms** | `stageRecordDetail` snapshot.pull records 2, row stage `snapshot.pull` 175.3 ms — **agree** |

**A-4 answer:** the folder-row performed **1** whole-store read
(**85 ms** GPU-OFF /
**88.9 ms** GPU-ON); the document-row **2** reads
(**173.6 ms** /
**175.3 ms**); the two ablation rows **1** read each
(**28.1 ms** / **27.5 ms** GPU-OFF).
**The read count DISCRIMINATES the two gestures** — the document row performs a
second whole-store read in its re-derive pass — which is exactly the L4 distinction the
stage-row cardinality alone could not make. **Unchanged from run 8** in kind; the ms differ
by single-session drift (RUL-5/L9).

---
## 5. Long tasks, the attribution record and the mutations

| leg | row | longTasks | `longTaskTotalMs` | mutations | wallMs | recorded incl (n/ms) | re-derived incl (n/ms) | recorded before/straddle | re-derived before/straddle | understates |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | 2 | 940 | 37 | 1011.4 | 2 / 940 | 2 / 940 | 0 / 0 | 0 / 0 | **false** |
| GPU-OFF | `o0-document-row-gpuoff-r1` | 2 | 2292 | 11758 | 2385.9 | 2 / 2292 | 2 / 2292 | 0 / 0 | 0 / 0 | **false** |
| GPU-OFF | `o0-fold-ablation-off` | 0 | 0 | 37 | 77.2 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | **false** |
| GPU-OFF | `o0-fold-ablation-on` | 0 | 0 | 37 | 81.6 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | **false** |
| GPU-ON | `o0-folder-row-gpuon-r1` | 2 | 961 | 37 | 1027.8 | 2 / 961 | 2 / 961 | 0 / 0 | 0 / 0 | **false** |
| GPU-ON | `o0-document-row-gpuon-r1` | 2 | 2214 | 11758 | 2337.5 | 2 / 2214 | 2 / 2214 | 0 / 0 | 0 / 0 | **false** |

**The §13.1 (3) attribution contract is re-derived, not trusted:** re-deriving
`includedCount`/`includedMs`/`startBeforeOverlapMs`/`straddleEndMs` from each row's own
`longTasks[]` list with the PURE `deriveO0LongTaskAttribution` reproduces the recorded
values on **6/6 rows** (the re-derivation never exceeds the record), so the record does not
understate the excluded overlap. The pinned rule is `start-inside-inclusive`
(`hook.longTaskAttribution.rule`), `ambiguous:false` on all six rows
(`startBeforeOverlapMs = straddleEndMs = 0` — no observed task straddles either endpoint,
so the rule's DISCRIMINATION stays unexercised on this corpus: §12.11 (3)/P-TP-3, honesty
bound recorded, not claimed).

---
## 6. Controls + ablation

### 6.1 GPU controls (verbatim, GPU-OFF leg)

```json
[
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
]
```

The GPU-ON leg records the mirror control (`{"id":"gpu-on","runRef":"o0-folder-row-gpuon-r1",
"legRuns":["o0-folder-row-gpuon-r1","o0-document-row-gpuon-r1"],
"pairedWith":"o0-folder-row-gpuoff-r1","pairedWithStatus":"cross-artifact","gpu":true}`) —
the pairing the §3.5 command pair prescribes (one artifact per leg, verified merged here).
**Every control's `legRuns[]` resolves to a `pass:true` row inside its own report**
(3/3 GPU-OFF, 1/1 GPU-ON) — the pairing is not vacuous.

### 6.2 The track-ablation control (GPU-OFF leg)

| row | trackAblation | longTaskTotalMs | wallMs | mutations |
| --- | --- | --- | --- | --- |
| `o0-folder-row-gpuoff-r1` | `{"applied":false,"mutation":null}` | 940 | 1011.4 | 37 |
| `o0-document-row-gpuoff-r1` | `{"applied":false,"mutation":null}` | 2292 | 2385.9 | 11758 |
| `o0-fold-ablation-off` | `{"applied":false,"mutation":null}` | 0 | 77.2 | 37 |
| `o0-fold-ablation-on` | `{"applied":true,"mutation":"#zone:main (the stage grid cell of #wiki-root): display:block (removes the #wiki-root grid-track sizing from the measurement path)"}` | 0 | 81.6 | 37 |

The ablation pair is matched (on/off on the SAME target with the same mutation count) and
the paired control rows are present, so the control pairing is not vacuous (§6 F5/F9).

### 6.3 The hook inertness comparison (§6 S17/RUL-6)

```json
[
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
]
```

**§6.3 inertness Δs:** Δmutations **0** (37 vs 37) — the
non-vacuous MUTATION-HALF proof; ΔlongTaskTotalMs **0** (0 vs 0) —
recorded as a **VACUOUS** half (`nonVacuous:false`) and therefore reported as
`mutationHalfProof:true` with the MUTATION-HALF statement, never as an unqualified
long-task-bounded inertness claim. `setEqual:true`, `msFree:true`, `inert:true`,
`controlledPair:true`. The GPU-ON leg records the identical pair
(Δmutations 0, `mutationHalfProof:true`). **Unchanged from run 8.**

---
## 7. Self-validation + the derived verdicts + the note's form

| leg | `selfValidation.ok` | `status` | `errors` | `gatingReasons` | `structuralFacts` | `structuralErrors` | `attempts` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | **true** | **`OPEN-structural`** | **0** (`[]`) | **0** (`[]`) | 4 | 0 | 4 |
| GPU-ON | **true** | **`OPEN-structural`** | **0** (`[]`) | **0** (`[]`) | 2 | 0 | 2 |

**The per-row results are ALL ok** (`o0-folder-row-gpuoff-r1:true`, `o0-document-row-gpuoff-r1:true`, `o0-fold-ablation-off:true`, `o0-fold-ablation-on:true` /
`o0-folder-row-gpuon-r1:true`, `o0-document-row-gpuon-r1:true`) —
no row is impugned and **no forcing reason exists on either leg**.

| leg | `failReasons` | `gatingReasons` | `openStructural` | `status` | `pass` |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | 8 (structural family only) | **0** | **true** | **`OPEN-structural`** | **false** |
| GPU-ON | 4 (structural family only) | **0** | **true** | **`OPEN-structural`** | **false** |

**Report-level `reconciliation` block (the §13.2 (7) surface):**

| leg | `ok` | `bandExceededGate` | `measurementShapeFailures` | `structuralStages` | `bandExceededNotes` |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | false | **false** | `[]` | 4 | 1 |
| GPU-ON | false | **false** | `[]` | 2 | 2 |

**The band is an OUTCOME, not a failure (F5-1 upheld):** 3 of the 6 rows record `bandExceeded:true` with a row-level
note (1 of 4 GPU-OFF, 2 of 2 GPU-ON; the 3 remaining rows are INSIDE the 50 ms band) and NOT ONE of them enters `row.pass`, `row.failReasons` or
the report's `gating` — `bandExceededGate:false` on both legs, and every band row carries
its reason in the SEPARATE `outcomeReasons[]` channel (§8.4).

**The derived verdicts (verbatim, the last line of each leg):**

- **GPU-OFF:** `O-0 REPORT OPEN — 4 stage(s) structurally unseparated (o0-folder-row-gpuoff-r1:snapshot.clone, o0-document-row-gpuoff-r1:snapshot.clone, o0-fold-ablation-off:snapshot.clone, o0-fold-ablation-on:snapshot.clone): run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4) — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed`
- **GPU-ON:** `O-0 REPORT OPEN — 2 stage(s) structurally unseparated (o0-folder-row-gpuon-r1:snapshot.clone, o0-document-row-gpuon-r1:snapshot.clone): run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4) — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed`

**`driver.statusStatement` (verbatim):**

- **GPU-OFF:** `OPEN-structural — 8 structurally-unmeasurable stage(s) (no seam in the executing bundle) and 4 DERIVED-residual record(s): the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed (§3.6b RUL-4, §6 S14/S19)`
- **GPU-ON:** `OPEN-structural — 4 structurally-unmeasurable stage(s) (no seam in the executing bundle) and 2 DERIVED-residual record(s): the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed (§3.6b RUL-4, §6 S14/S19)`

### 7.4 The NOTE'S FORM (the F7-1 clause's own requirement — still satisfied)

The `F7-1` defect was that the mandatory note was absent AT VALIDATION TIME; the fix is
order, never content. The note present on **both** legs is the **OPEN-structural form**
— it names **the structural stages**, **the non-computable residual** and
**the no-imputation statement**, and it is **NOT** the FAIL form (it quotes no rejection):

- **GPU-OFF** (`reconciliation.note`, verbatim):

  > structurally unseparated stage(s) o0-folder-row-gpuoff-r1:snapshot.clone, o0-document-row-gpuoff-r1:snapshot.clone, o0-fold-ablation-off:snapshot.clone, o0-fold-ablation-on:snapshot.clone have no seam in the executing bundle (run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)), so the long-task residual is NOT computable and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)
- **GPU-ON** (`reconciliation.note`, verbatim):

  > structurally unseparated stage(s) o0-folder-row-gpuon-r1:snapshot.clone, o0-document-row-gpuon-r1:snapshot.clone have no seam in the executing bundle (run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)), so the long-task residual is NOT computable and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)

| leg | names the structural stages | names the non-computable residual | no-imputation statement | quotes a rejection (FAIL form) |
| --- | --- | --- | --- | --- |
| GPU-OFF | **true** | **true** | **true** | **false** |
| GPU-ON | **true** | **true** | **true** | **false** |

**`reconciliation.ok`** reads `false` on both legs — DERIVED from the final status
(`ok ⇔ status === "OK"`).

### 7.5 The EMITTED-OBJECT re-validation (`driver.selfValidationOfEmitted` — new in this edition)

The driver's SINGLE `validateO0Report` call reads the report as it stands mid-assembly
(the §3b re-audit order finding: `status`/`pass`/`verdicts`/`reconciliation.ok` are written
AFTER it). The emitted object is now re-validated over a **shallow copy** and the result is
recorded — an error the finalize introduced would appear here rather than pass silently:

```json
{
  "gpu-off": {
    "ok": true,
    "errors": [],
    "gating": [],
    "status": "OPEN-structural",
    "verdicts": 17,
    "note": "the FINAL report object (status/pass/verdicts/reconciliation.ok all attached) re-validated over a SHALLOW COPY — the §3b re-audit order finding: the driver’s single self-validation call could not see the fields it writes LAST"
  },
  "gpu-on": {
    "ok": true,
    "errors": [],
    "gating": [],
    "status": "OPEN-structural",
    "verdicts": 9,
    "note": "the FINAL report object (status/pass/verdicts/reconciliation.ok all attached) re-validated over a SHALLOW COPY — the §3b re-audit order finding: the driver’s single self-validation call could not see the fields it writes LAST"
  }
}
```

| leg | `selfValidationOfEmitted.ok` | `errors` | `gating` | `status` | `verdicts` |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | **true** | `[]` | `[]` | `OPEN-structural` | 17 |
| GPU-ON | **true** | `[]` | `[]` | `OPEN-structural` | 9 |

**The re-validation of the EMITTED object is GREEN on both legs** — the finalize introduces
no error and the emitted `verdicts[]` is non-empty (`17` GPU-OFF / `9` GPU-ON) with the
§4.4 verdict pair in its last slot. This pass ALSO re-ran the report-level validator
independently over both emitted objects (and over their shallow copies):

```text
GPU-OFF: validateO0Report(emitted) → ok=true status=OPEN-structural errors=[] gating=[] structural=4 derivedResidual=4
GPU-OFF: validateO0Report({...emitted}) → ok=true errors=[]
GPU-ON:  validateO0Report(emitted) → ok=true status=OPEN-structural errors=[] gating=[] structural=2 derivedResidual=2
GPU-ON:  validateO0Report({...emitted}) → ok=true errors=[]
```

---
## 8. The per-row oracle re-validation (THE POINT OF THE NINTH RUN)

Executed in this pass over the embedded JSON, per row, both legs, with the PURE module
(`partitionO0RowPasses` + `validateO0MeasurementShape`) — the same call the suite's
`LIVE-2` makes — **plus the four NEW clauses the §3b re-audit landed** (§8.4).

| leg | row | `row.pass` | `failReasons` | `pass ⇔ len===0` | `partition.row.pass` | `partition.row.failReasons` | pass sub-rows (`i:pass/failReasons`) | `validateO0MeasurementShape.ok` | `errors` | `legacyShape` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | **true** | 0 | **true** | **true** | 0 | 0:true/0 1:true/0 | **true** | `[]` | false |
| GPU-OFF | `o0-document-row-gpuoff-r1` | **true** | 0 | **true** | **true** | 0 | 0:true/0 1:true/0 2:true/0 | **true** | `[]` | false |
| GPU-OFF | `o0-fold-ablation-off` | **true** | 0 | **true** | **true** | 0 | 0:true/0 1:true/0 | **true** | `[]` | false |
| GPU-OFF | `o0-fold-ablation-on` | **true** | 0 | **true** | **true** | 0 | 0:true/0 1:true/0 | **true** | `[]` | false |
| GPU-ON | `o0-folder-row-gpuon-r1` | **true** | 0 | **true** | **true** | 0 | 0:true/0 1:true/0 | **true** | `[]` | false |
| GPU-ON | `o0-document-row-gpuon-r1` | **true** | 0 | **true** | **true** | 0 | 0:true/0 1:true/0 2:true/0 | **true** | `[]` | false |

**Result: 6 of 6 rows `pass:true` ⇔ `failReasons.length === 0`** (both directions of the pair
hold on the row AND on every pass sub-row), `validateO0MeasurementShape.ok:true` with
`errors:[]` and `legacyShape:false` on every row — **and the two surfaces' `legacyShape`
reading AGREES on every row** (§8.4 (e)).

### 8.1 The per-id aggregation identity (the `M1` oracle)

| leg | row | identity | `sumMs` | window | `naiveSumResidualMs` |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | **HOLDS on all 9 finite ids** | 1031 | 1011.4 | -91 |
| GPU-OFF | `o0-document-row-gpuoff-r1` | **HOLDS on all 9 finite ids** | 4209.1 | 2385.9 | -1917.1 |
| GPU-OFF | `o0-fold-ablation-off` | **HOLDS on all 9 finite ids** | 43 | 77.2 | -43 |
| GPU-OFF | `o0-fold-ablation-on` | **HOLDS on all 9 finite ids** | 41.9 | 81.6 | -41.9 |
| GPU-ON | `o0-folder-row-gpuon-r1` | **HOLDS on all 9 finite ids** | 1064.2 | 1027.8 | -103.2 |
| GPU-ON | `o0-document-row-gpuon-r1` | **HOLDS on all 9 finite ids** | 4088.4 | 2337.5 | -1874.4 |

**The identity `row.stages[id].ms === Σ pass.stages[id].ms` is FORCING and HOLDS on all 9
finite ids of all six rows** (the validator recomputed it: `errors:[]` on 6/6) — the recorded
per-stage sums are still tied to the record list, which is the `M1` symptom class this oracle
exists to close.

### 8.2 The declared-vs-derived accounting (the §14.4 (a)/(b) STRICT clauses)

| leg | row | declared window / derived | declared accounted / derived | declared unaccounted / derived | agrees (0.1 ms) |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | 1011.4 / 1011.4 | 899.6 / 899.6 | **111.8 / 111.8** | window **true**, accounted **true**, unaccounted **true** |
| GPU-OFF | `o0-document-row-gpuoff-r1` | 2385.9 / 2385.9 | 2349.8 / 2349.8 | **36.1 / 36.1** | window **true**, accounted **true**, unaccounted **true** |
| GPU-OFF | `o0-fold-ablation-off` | 77.2 / 77.2 | 41.6 / 41.6 | **35.6 / 35.6** | window **true**, accounted **true**, unaccounted **true** |
| GPU-OFF | `o0-fold-ablation-on` | 81.6 / 81.6 | 40.3 / 40.3 | **41.3 / 41.3** | window **true**, accounted **true**, unaccounted **true** |
| GPU-ON | `o0-folder-row-gpuon-r1` | 1027.8 / 1027.8 | 926.4 / 926.4 | **101.4 / 101.4** | window **true**, accounted **true**, unaccounted **true** |
| GPU-ON | `o0-document-row-gpuon-r1` | 2337.5 / 2337.5 | 2274 / 2274 | **63.5 / 63.5** | window **true**, accounted **true**, unaccounted **true** |

Both STRICT clauses were live and SILENT on this emission: no declared remainder
**overstates** the derived one and no declared window is **narrower** than the derived one —
**because the declared values equal the derived values on all six rows**. Their red behavior
is pinned by the module's own tests; this run records that neither fires on a coherent report
(a firing clause here would be a new forcing reason and the leg would read FAIL).

### 8.3 The re-derived attribution + the outcome channel

| leg | row | recorded incl count | re-derived incl count | recorded incl ms | re-derived incl ms | recorded before+straddle | re-derived before+straddle | `outcomeReasons` n |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | 2 | 2 | 940 | 940 | 0 + 0 | 0 + 0 | 1 |
| GPU-OFF | `o0-document-row-gpuoff-r1` | 2 | 2 | 2292 | 2292 | 0 + 0 | 0 + 0 | 0 |
| GPU-OFF | `o0-fold-ablation-off` | 0 | 0 | 0 | 0 | 0 + 0 | 0 + 0 | 0 |
| GPU-OFF | `o0-fold-ablation-on` | 0 | 0 | 0 | 0 | 0 + 0 | 0 + 0 | 0 |
| GPU-ON | `o0-folder-row-gpuon-r1` | 2 | 2 | 961 | 961 | 0 + 0 | 0 + 0 | 1 |
| GPU-ON | `o0-document-row-gpuon-r1` | 2 | 2 | 2214 | 2214 | 0 + 0 | 0 + 0 | 1 |

**The outcome channel is SEPARATE (§13.2 (7)(c) upheld live):** the
3 band-exceeded rows carry non-empty `row.reconciliation.outcomeReasons[]` while their
`partition.failReasons` stays empty — **no outcome reason enters `partition.failReasons`**,
so the `F5-1` gate the sixth run removed is not re-introduced a level down.

### 8.4 THE FOUR NEW CLAUSES (§3b re-audit) — every row, both legs

| leg | row | (a) row `stages[]` closed-11 / finite-or-null / `ms:null ⇔ unseparated` / negative | (b) per-pass RE-DERIVATION drift | (c) `records.indices` increasing / disjoint / union = `0..n-1` | (d) `null`-remainder reason required |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | closed **true**, finite-or-null **true**, null⇔unsep **true**, negative **0** | **0** of 2 pass(es) | increasing **true**, disjoint **true**, union 0..10 **true** (0,1,2,3,4,5,6,7,8,9,10) | unaccountedMs **111.8** (non-null ⇒ number-or-reason satisfied; null-without-reason **false**) |
| GPU-OFF | `o0-document-row-gpuoff-r1` | closed **true**, finite-or-null **true**, null⇔unsep **true**, negative **0** | **0** of 3 pass(es) | increasing **true**, disjoint **true**, union 0..14 **true** (0,1,2,3,4,5,6,7,8,9,10,11,12,13,14) | unaccountedMs **36.1** (non-null ⇒ number-or-reason satisfied; null-without-reason **false**) |
| GPU-OFF | `o0-fold-ablation-off` | closed **true**, finite-or-null **true**, null⇔unsep **true**, negative **0** | **0** of 2 pass(es) | increasing **true**, disjoint **true**, union 0..10 **true** (0,1,2,3,4,5,6,7,8,9,10) | unaccountedMs **35.6** (non-null ⇒ number-or-reason satisfied; null-without-reason **false**) |
| GPU-OFF | `o0-fold-ablation-on` | closed **true**, finite-or-null **true**, null⇔unsep **true**, negative **0** | **0** of 2 pass(es) | increasing **true**, disjoint **true**, union 0..10 **true** (0,1,2,3,4,5,6,7,8,9,10) | unaccountedMs **41.3** (non-null ⇒ number-or-reason satisfied; null-without-reason **false**) |
| GPU-ON | `o0-folder-row-gpuon-r1` | closed **true**, finite-or-null **true**, null⇔unsep **true**, negative **0** | **0** of 2 pass(es) | increasing **true**, disjoint **true**, union 0..10 **true** (0,1,2,3,4,5,6,7,8,9,10) | unaccountedMs **101.4** (non-null ⇒ number-or-reason satisfied; null-without-reason **false**) |
| GPU-ON | `o0-document-row-gpuon-r1` | closed **true**, finite-or-null **true**, null⇔unsep **true**, negative **0** | **0** of 3 pass(es) | increasing **true**, disjoint **true**, union 0..21 **true** (0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21) | unaccountedMs **63.5** (non-null ⇒ number-or-reason satisfied; null-without-reason **false**) |

**(a) The row `stages[]` clause.** Every row carries the closed §2.2 **11-id set, each id
exactly once, FINITE-or-null**, and the emitted `ms:null ⇔ unseparated:true` equivalence holds
on every stage of every row (the structural pair `snapshot.clone` / `post.style` is the only
null pair, and it is `unseparated:true`); **no negative measure** exists on any row. The
validator's own `errors:[]` on 6/6 (§8) is the same clause read from inside the module.

**(b) The per-pass RE-DERIVATION.** For each pass of each row the pass layer was re-derived
with `partitionO0RowPasses(row)` and compared **field by field** — `window.t0/t1/ms`,
`sumOfSpansMs`, `accountedMs`, `overlapMs`, `unaccountedMs` and `records.indices` — against
the DECLARED sub-row. **Drift count 0 on every pass of all six rows** (14 passes total: 2+3+2+2
GPU-OFF, 2+3 GPU-ON), so no pass publishes an internally coherent arithmetic of its own: the
declared layer IS the records' arithmetic. The emitted `unaccountedMs` values are all finite
numbers, and their sum-per-pass matches the derived per-pass remainder within the 0.1 ms
granularity: e.g. GPU-OFF folder-row pass 1 `25.5` declared = `25.5` derived; the document-row's
three passes `1.3 / 21 / 0` declared = derived.

**(c) `records.indices` totality.** The union over the passes is **exactly `0..n-1`**, DISJOINT
across passes and strictly increasing WITHIN each pass, and it equals the row's
`hook.stageRecordDetail` cardinality on every row (11 / 15 / 11 / 11 GPU-OFF, 11 / 22 GPU-ON).
The old COUNT-only check would accept `[2,2]` (a duplicate) and `[2,99]` (one dropped, one
foreign); this clause does not — the declared runs carry no duplicate and no gap.

**(d) The row-level `null`-remainder reason.** No row of either leg publishes a `null`
`reconciliation.unaccountedMs`, so the reason requirement is **satisfied by the number form**
on 6/6 (`null`-without-reason **false** everywhere); the clause's red behavior is pinned by the
module tests. The row-level `unaccountedReason` field is `null` on rows whose remainder IS a
number — the module requires the reason **only** on the `null` form (§2.1(iii)/S12).

**(e) `legacyShape` AGREEMENT (the one-reading-per-row-class clause).** The two surfaces agree
on every row: `validateO0MeasurementShape(row).legacyShape === partitionO0RowPasses(row).legacyShape
=== false` on 6/6 — a NEW-shape row is refused by neither surface, and neither reports it as
legacy. A row class misread by one surface would be a live contradiction; none exists here.

---
## 9. The window-bound check + the O-0 numbers

| leg | row | window | `outsideMs` | bound (`windowBoundToleranceMs`) | largest stage | share |
| --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | 1011.4 | **0** | clean (40) | `traversal.build` | 67.36 % (633.2 of 940 ms) |
| GPU-OFF | `o0-document-row-gpuoff-r1` | 2385.9 | **0** | clean (40) | `reconcile.apply` | 94.38 % (2163.2 of 2292 ms) |
| GPU-OFF | `o0-fold-ablation-off` | 77.2 | **0** | clean (40) | `snapshot.pull` | n/a (0 ms long-task window: `snapshot.pull` 28.1 ms)  |
| GPU-OFF | `o0-fold-ablation-on` | 81.6 | **0** | clean (40) | `snapshot.pull` | n/a (0 ms long-task window: `snapshot.pull` 27.5 ms)  |
| GPU-ON | `o0-folder-row-gpuon-r1` | 1027.8 | **0** | clean (40) | `traversal.build` | 68.98 % (662.9 of 961 ms) |
| GPU-ON | `o0-document-row-gpuon-r1` | 2337.5 | **0** | clean (40) | `reconcile.apply` | 93.88 % (2078.6 of 2214 ms) |

Every largest-stage cell above is computed from **that row's own** finite stage rows and the
driver's own verdict string for the same stage+value is the cross-check (the two ablation rows
share the folder-row GESTURE, so a gesture-keyed lookup would mislabel them):

- `o0-folder-row-gpuoff-r1`: `stage traversal.build is 633.2 ms of the 940 ms long task (67.36%) on folder-row — traversal.build is the largest identified stage` — computed 67.36 % vs the driver's 67.36 % (agree within 0.02 pp)
- `o0-document-row-gpuoff-r1`: `stage reconcile.apply is 2163.2 ms of the 2292 ms long task (94.38%) on document-row — reconcile.apply is the largest identified stage` — computed 94.38 % vs the driver's 94.38 % (agree within 0.02 pp)
- `o0-fold-ablation-off`: no percentage is computable (a 0 ms long-task window); the driver's own text for this row is `stage snapshot.pull is 28.1 ms of the 0 ms long task on folder-row — snapshot.pull is the largest identified stage; no percentage is computed: the long-task window is zero (0 ms), so this row has no finite window to divide by`
- `o0-fold-ablation-on`: no percentage is computable (a 0 ms long-task window); the driver's own text for this row is `stage snapshot.pull is 27.5 ms of the 0 ms long task on folder-row — snapshot.pull is the largest identified stage; no percentage is computed: the long-task window is zero (0 ms), so this row has no finite window to divide by`
- `o0-folder-row-gpuon-r1`: `stage traversal.build is 662.9 ms of the 961 ms long task (68.98%) on folder-row — traversal.build is the largest identified stage` — computed 68.98 % vs the driver's 68.98 % (agree within 0.02 pp)
- `o0-document-row-gpuon-r1`: `stage reconcile.apply is 2078.6 ms of the 2214 ms long task (93.88%) on document-row — reconcile.apply is the largest identified stage` — computed 93.88 % vs the driver's 93.88 % (agree within 0.02 pp)

**Window bound: CLEAN** — `outsideMs:0` on all six rows (`windowBoundToleranceMs:40`), no
top-level span escapes the freeze window. **The separable shares:**
`traversal.build` is **633.2 ms** of the folder-row (67.36 % of its 940 ms long task, GPU-OFF) /
**662.9 ms** of the GPU-ON folder-row (68.98 % of its 961 ms);
`reconcile.apply` is **94.38 %** of the document-row's 2292 ms (GPU-OFF) /
**93.88 %** of the GPU-ON document-row's 2214 ms.

**The O-4 trigger answer:** the largest identified stage on the folder gesture remains
`traversal.build` (a traversal-bound cost) while the document gesture is
`reconcile.apply`-bound — **the two gestures have DIFFERENT dominant stages**, which is
the discrimination O-4 needs. The two ablation rows are `snapshot.pull`-largest on a 0 ms
long-task window (no percentage is computable — the driver states that instead of dividing).

---
## 10. vs run 8 (the drift table)

| dimension | run 8 (EIGHTH) | **run 9 (this, NINTH)** | drift |
| --- | --- | --- | --- |
| renderer identity | `1789975949705+678367+3e3f1b80` / `1789975967064+678367+3e3f1b80` | `1789977178309+678367+3e3f1b80` / `1789977207408+678367+3e3f1b80` | **CONTENT HASH UNCHANGED** (only the mtime prefix moves — each leg's spawn rebuilds `dist/`) |
| main identity | `1789975949595+2419628+1e652667` / `1789975966952+2419628+1e652667` | `1789977178193+2419628+1e652667` / `1789977207293+2419628+1e652667` | content hash unchanged |
| **ORACLE identity** | **NOT RECORDED** (the field did not exist) | **`src/shared/o0-report.ts` `b89d6f19` + `scripts/live-drive.mjs` `194dfece` = `92a74b7d`** | **NEW — the ninth edition differs from the eighth in the ORACLE, which the eighth could not name** |
| census | 226 / 6102 / 9266 | 226 / 6102 / 9266 | none |
| corpus seed | `o0-2026-09-17` | `o0-2026-09-17` | none |
| GPU-OFF verdict | `OPEN-structural` / `ok:true` | **`OPEN-structural` / `ok:true`** | reproduced on the re-audited harness |
| GPU-ON verdict | `OPEN-structural` / `ok:true` | **`OPEN-structural` / `ok:true`** | reproduced |
| `errors` / `gatingReasons` | 0 / 0 | **0 / 0** | no forcing reason |
| `selfValidationOfEmitted` | NOT RECORDED | **`ok:true` / `errors:[]` on both legs** | **NEW** — the emitted object re-validated |
| remainders (folder/document/abl-off/abl-on, GPU-OFF) | 111.4 / 33.6 / 38.6 / 40.4 | **111.8 / 36.1 / 35.6 / 41.3** | single-session drift (RUL-5/L9) |
| remainders (folder/document, GPU-ON) | 103.3 / 33.9 | **101.4 / 63.5** | single-session drift |
| band-exceeded rows (GPU-OFF / GPU-ON) | 1 of 4 / 1 of 2 | **1 of 4 / 2 of 2** | an OUTCOME change, not a gate change |
| largest-stage shares (folder / document, GPU-OFF) | 69.86 % / 94.08 % | **67.36 % / 94.38 %** | value drift only; the O-4 discrimination is unchanged |
| A-4 reads (folder / document, GPU-OFF) | 1 (70.2 ms) / 2 (167.7 ms) | **1 (85 ms) / 2 (173.6 ms)** | the L4 discrimination is unchanged |
| `tolerance.source` | the compile-time constant + the owed re-derivation | same | unchanged (the §13.2 (7) fix holds) |
| `windowMs` declared vs derived | equal within 0.1 ms on 6/6 | **equal within 0.1 ms on 6/6** | the §14.4 (a)/(b) STRICT clauses stay live and SILENT |
| NEW §3b clauses (§8.4) | n/a | **row `stages[]` clean, per-pass drift 0/14, indices totality 6/6, `null`-reason satisfied 6/6, `legacyShape` agreement 6/6** | **the re-audit clauses are exercised live for the first time** |

**What actually moved between run 8 and this run:** the ORACLE (`src/shared/o0-report.ts`) and
the HARNESS (the driver's identity/emitted-object work) — i.e. the §3b re-audit fix set — and
with it the record that makes the change attributable. **What did NOT move: the executing
bundle's content hash (`3e3f1b80` / `1e652667`) and the DEC-1-accepted live form.**

---
## 11. Findings (this pass)

### 11.1 No harness defect was hit by this run (record the negative)

Both legs ran to completion on the FIRST attempt: the GPU-OFF leg emitted 4 blocks / 0 FAIL /
0 PARKED and the GPU-ON leg 2 blocks / 0 FAIL / 0 PARKED, each writing its `--o0-out` file.
**No `scripts/**` edit was needed** (the eighth run's `F8-1` fix held), and **no `src/**` or
`tests/**` edit was made**: the §3b fix set was already landed and this pass is a REGENERATION,
not a repair. The `F7-1` order defect stays CLOSED (the note is attached before the single
`validateO0Report` call; §7.4) and the `F8-1` split-derivation defect stays CLOSED.

### 11.2 The ORACLE-IDENTITY provenance is now recorded (the §3b gap closed live)

The eighth edition could state only that the driver "imports `src/shared/o0-report.ts` from
source"; the legs now carry `driver.oracleIdentity` (§2.3), independently recomputed here from
the files themselves. **This is the provenance that makes the ninth edition's verdict pair
attributable**, and it separates the two bundles of identical size (678367 B / 2419628 B) that
every edition since the fifth has emitted: the ORACLE hash, not the bundle hash, is what moved.

### 11.3 `F9-1` — the live-pin EDITION PROBE still names the EIGHTH edition (TEST, OWED — the `F7-3`/`F8-3` class, recurring)

- **The tree says:** `tests/unit-o0-m1-m3-driver-contract.test.ts:313-314` reads
  `const EXPECTED_EDITION = 'EIGHTH'` / `const EXPECTED_ORDINAL = 8`; `ORDINAL_BY_WORD` already
  maps `NINTH: 9` (line 316), so the probe is READY for a `NINTH` banner — it simply is not
  pointed at it.
- **Measured, this pass:** against the pre-regeneration (EIGHTH) artifact the file reads
  **14 passed (14)** — the probe is green because the committed artifact WAS the eighth edition.
  Against **this** (NINTH) edition the same probe is RED by construction:
  `the banner states 'This is the NINTH live run' — the committed artifact must be the EIGHTH edition`,
  with a second violation `the banner's superseded set ends at run 8 — the EIGHTH edition must name runs 1-7 SUPERSEDED`.
  The banner's own form (`This is the NINTH live run` + `runs 1-8 are SUPERSEDED`) is the shape
  the §14.5-preferred GENERAL rule accepts; a literal repoint to `NINTH` / `9` makes it green.
- **Owner:** the NEXT CYCLE (TEST) — `EXPECTED_EDITION = 'NINTH'` + `EXPECTED_ORDINAL = 9`, or the
  general form (read the edition from the banner's own claim and compare it with the edition the
  file's other pins assert). **This pass is forbidden from editing `tests/**`**, so the red is
  reported, never silenced. **This is the FOURTH consecutive regeneration that owes this repoint**
  — the general form is now the cheaper fix.
- **Class:** TEST-side provenance pin staleness. **Not** a measurement finding: `LIVE-2`'s per-row
  walk is green on every row of both legs (§8).

### 11.4 `L3s` (carried, unchanged) — `snapshot.clone` structurally unseparated

The main-side `snapshot.clone` gap is **UNCHANGED and non-gating** (DEC-1's accepted set):
`driver.mainSeamArmed:false` on both legs, `hook.stageRecords` carries no `instance:"main"`
entry, and the transport stays a SEPARATE PARKED unit (`docs/pending.md`).
**It is what keeps `pass:false` on an otherwise clean report** — and it is **not** a forcing
reason: `errors[]` and `gatingReasons[]` are empty on both legs.

---
## 12. The raw legs (verbatim, byte-exact round-trip verified)

### 12.1 GPU-OFF leg — `/tmp/o0i-gpuoff.json`

```json round-trip=gpu-off
{
  "artifact": "o-0-per-stage-breakdown",
  "spec": "docs/specs/unit-o-0-per-stage-measurement.md",
  "unit": "O-0",
  "date": "2026-09-21",
  "layer": "assembled-renderer (RCA-12)",
  "commands": [
    "node scripts/live-drive.mjs --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --display=:0 --o0-out=/tmp/o0i-gpuoff.json --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism"
  ],
  "pinnedCommands": [
    "npm run build",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --display=:0 --o0-out=<path> --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --gpu --display=:0 --o0-out=<path> --block=o0_gpu_control"
  ],
  "driver": {
    "build": {
      "renderer": "1789977178309+678367+3e3f1b80",
      "main": "1789977178193+2419628+1e652667",
      "served": "678367+3e3f1b80",
      "servedUrl": "file:///media/ryanr/Shared%20Files/Projects/Astrographer/dist/renderer/renderer.js",
      "disk": {
        "rendererBytes": 678367,
        "rendererHash": "3e3f1b80"
      },
      "verified": true
    },
    "oracleIdentity": {
      "source": "source-import",
      "report": {
        "path": "src/shared/o0-report.ts",
        "bytes": 200143,
        "hash": "b89d6f19",
        "short": "b89d6f19"
      },
      "driver": {
        "path": "scripts/live-drive.mjs",
        "bytes": 395314,
        "hash": "194dfece",
        "short": "194dfece"
      },
      "hash": "92a74b7d",
      "short": "92a74b7d",
      "note": "the per-row verdicts are produced by the SOURCE-IMPORTED oracle (src/shared/o0-report.ts) + this driver’s row assembly — `driver.build.verified` is evidence about the EXECUTING BUNDLE only, never about the code that minted the verdicts (§3b re-audit, oracle provenance)"
    },
    "gpuFlag": false,
    "cliArgs": [
      "--seed=/tmp/o0-corpus-226",
      "--corpus-root=/tmp/o0-corpus-226",
      "--strict-seed",
      "--o0-corpus=226",
      "--display=:0",
      "--o0-out=/tmp/o0i-gpuoff.json",
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
    "openStructural": true,
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
      "run o0-folder-row-gpuoff-r1: post.style residual null ms (Σ named stages 1031 of 940 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)",
      "run o0-document-row-gpuoff-r1: post.style residual null ms (Σ named stages 4209.099999999999 of 2292 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)",
      "run o0-fold-ablation-off: post.style residual null ms (Σ named stages 43 of 0 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)",
      "run o0-fold-ablation-on: post.style residual null ms (Σ named stages 41.9 of 0 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)"
    ],
    "selfValidationOfEmitted": {
      "ok": true,
      "errors": [],
      "gating": [],
      "status": "OPEN-structural",
      "verdicts": 17,
      "note": "the FINAL report object (status/pass/verdicts/reconciliation.ok all attached) re-validated over a SHALLOW COPY — the §3b re-audit order finding: the driver’s single self-validation call could not see the fields it writes LAST"
    }
  },
  "tolerance": {
    "reconcileMs": 50,
    "source": "the compile-time constant O0_RECONCILE_TOLERANCE_MS (50 ms) — the ONE band the oracle reads from each row's recorded reconciliation.toleranceMs and the report declares here; its empirical re-derivation by the long-task/union data is OWED (§13.2 (7)/§13.4)"
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
          "ms": 85,
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
          "ms": 3.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 633.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "envelope.assemble",
          "ms": 0.4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "shared.decorate",
          "ms": 10.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 14.8,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 153,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 59,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 72.4,
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
          "start": 8524.59999999404,
          "duration": 64
        },
        {
          "start": 8618.199999988079,
          "duration": 876
        }
      ],
      "longTaskTotalMs": 940,
      "mutations": 37,
      "wallMs": 1011.4,
      "t0": 8517.09999999404,
      "t1": 9528.5,
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
        "renderer": "1789977178309+678367+3e3f1b80",
        "main": "1789977178193+2419628+1e652667",
        "served": "678367+3e3f1b80"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 8518,
          "t1": 9528.699999988079,
          "ms": 1010.7
        },
        "freezeWindow": {
          "t0": 8517.09999999404,
          "t1": 9528.5
        },
        "toleranceMs": 40,
        "rowArmCount": 1,
        "rowDisarmCount": 1,
        "sessionArmCount": 1,
        "sessionDisarmCount": 1,
        "sessionCountsAt": {
          "pre": {
            "arm": 0,
            "disarm": 0,
            "at": 8518
          },
          "post": {
            "arm": 1,
            "disarm": 1,
            "at": 9528.699999988079
          }
        },
        "longTaskAttribution": {
          "ok": true,
          "errors": [],
          "failReasons": [],
          "rule": "start-inside-inclusive",
          "window": {
            "t0": 8517.09999999404,
            "t1": 9528.5
          },
          "includedCount": 2,
          "includedMs": 940,
          "startBefore": [],
          "straddlesEnd": [],
          "startBeforeOverlapMs": 0,
          "straddleEndMs": 0,
          "startAfterCount": 0,
          "startAfterMs": 0,
          "overlapAnyMs": 940,
          "intersectionMs": 940,
          "ambiguous": false,
          "ambiguityReason": null
        },
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "opener": null,
            "window": {
              "t0": 8526.800000011921,
              "t1": 8588.5,
              "ms": 61.7
            },
            "records": {
              "indices": [
                0,
                1
              ],
              "count": 2,
              "nestedCount": 0
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": null,
                "unseparated": true,
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
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 33,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 28.6,
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
            "topLevelSpans": [
              {
                "index": 0,
                "stage": "render.dom",
                "startMs": 8526.800000011921,
                "endMs": 8559.800000011921
              },
              {
                "index": 1,
                "stage": "render.ssr",
                "startMs": 8559.90000000596,
                "endMs": 8588.5
              }
            ],
            "sumOfSpansMs": 61.6,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 61.6,
            "unaccountedMs": 0.1,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          },
          {
            "index": 1,
            "kind": "re-derive",
            "opener": {
              "stage": "snapshot.pull",
              "recordIndex": 2
            },
            "window": {
              "t0": 8524.800000011921,
              "t1": 9449.90000000596,
              "ms": 925.1
            },
            "records": {
              "indices": [
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
              ],
              "count": 9,
              "nestedCount": 2
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": 85,
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
                "ms": 3.1,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": 633.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": 0.4,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": 10.1,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": 14.8,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": 153,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 26,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 43.8,
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
            "topLevelSpans": [
              {
                "index": 2,
                "stage": "snapshot.pull",
                "startMs": 8524.800000011921,
                "endMs": 8609.800000011921
              },
              {
                "index": 3,
                "stage": "docheads.pull",
                "startMs": 8609.800000011921,
                "endMs": 8612.90000000596
              },
              {
                "index": 4,
                "stage": "traversal.build",
                "startMs": 8633.40000000596,
                "endMs": 9266.59999999404
              },
              {
                "index": 5,
                "stage": "shared.decorate",
                "startMs": 9267.300000011921,
                "endMs": 9277.40000000596
              },
              {
                "index": 6,
                "stage": "envelope.assemble",
                "startMs": 9277.40000000596,
                "endMs": 9277.800000011921
              },
              {
                "index": 7,
                "stage": "reconcile.roots",
                "startMs": 9282,
                "endMs": 9296.800000011921
              },
              {
                "index": 10,
                "stage": "reconcile.apply",
                "startMs": 9296.90000000596,
                "endMs": 9449.90000000596
              }
            ],
            "sumOfSpansMs": 899.6,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 899.6,
            "unaccountedMs": 25.5,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 876,
            "pass": true,
            "failReasons": []
          }
        ],
        "passCount": 2,
        "passKindSequence": [
          "pre-pass-render",
          "re-derive"
        ],
        "passOverlaps": [
          {
            "a": 0,
            "b": 1,
            "overlapMs": 61.7
          }
        ],
        "passLongTaskDoubleCountMs": 0,
        "nestingAmbiguities": [],
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
            "index": 0,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 33,
            "startMs": 8526.800000011921,
            "endMs": 8559.800000011921,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 1,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 28.6,
            "startMs": 8559.90000000596,
            "endMs": 8588.5,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 2,
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 85,
            "startMs": 8524.800000011921,
            "endMs": 8609.800000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:snapshot.pull:start",
            "endMark": "o0:snapshot.pull:end",
            "error": null
          },
          {
            "index": 3,
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 3.1,
            "startMs": 8609.800000011921,
            "endMs": 8612.90000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:docheads.pull:start",
            "endMark": "o0:docheads.pull:end",
            "error": null
          },
          {
            "index": 4,
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 633.2,
            "startMs": 8633.40000000596,
            "endMs": 9266.59999999404,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:traversal.build:start",
            "endMark": "o0:traversal.build:end",
            "error": null
          },
          {
            "index": 5,
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 10.1,
            "startMs": 9267.300000011921,
            "endMs": 9277.40000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:shared.decorate:start",
            "endMark": "o0:shared.decorate:end",
            "error": null
          },
          {
            "index": 6,
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.4,
            "startMs": 9277.40000000596,
            "endMs": 9277.800000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:envelope.assemble:start",
            "endMark": "o0:envelope.assemble:end",
            "error": null
          },
          {
            "index": 7,
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 14.8,
            "startMs": 9282,
            "endMs": 9296.800000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.roots:start",
            "endMark": "o0:reconcile.roots:end",
            "error": null
          },
          {
            "index": 8,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 26,
            "startMs": 9380.09999999404,
            "endMs": 9406.09999999404,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 9,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 43.8,
            "startMs": 9406.09999999404,
            "endMs": 9449.90000000596,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 10,
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 153,
            "startMs": 9296.90000000596,
            "endMs": 9449.90000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.apply:start",
            "endMark": "o0:reconcile.apply:end",
            "error": null
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
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "windowMs": 1011.4,
        "accountedMs": 899.6,
        "unaccountedMs": 111.8,
        "unaccountedReason": null,
        "unaccountedSource": "derived",
        "unaccountedAttributable": false,
        "overlapMs": 0,
        "outsideMs": 0,
        "passOverlapSumMs": 61.7,
        "bandExceeded": true,
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "spanMs": 61.7,
            "accountedMs": 61.6,
            "unaccountedMs": 0.1,
            "longTaskTotalMs": 0
          },
          {
            "index": 1,
            "kind": "re-derive",
            "spanMs": 925.1,
            "accountedMs": 899.6,
            "unaccountedMs": 25.5,
            "longTaskTotalMs": 876
          }
        ],
        "naiveSumResidualMs": -91,
        "naiveSumResidualNote": "notAResidual",
        "sumMs": 1031,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
        "windowBoundToleranceMs": 40,
        "passTotalsMinusRowMs": -64,
        "passTotalsMinusRowNote": "notADoubleCount",
        "passRowUnaccountedDeltaMs": -86.2,
        "passRowUnaccountedDeltaNote": "notAMeasure",
        "bandExceededNote": "run o0-folder-row-gpuoff-r1: the row remainder 111.8 ms of the 1011.4 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)",
        "note": "run o0-folder-row-gpuoff-r1: the row remainder 111.8 ms of the 1011.4 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4); the DERIVED remainder is an accounting quantity, attributable:false, and is never a stage cost (§3.6b RUL-4 clause 5)",
        "outcomeReasons": [
          "run o0-folder-row-gpuoff-r1: the row remainder 111.8 ms of the 1011.4 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)"
        ]
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "timed": false,
        "source": "derived",
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "attributable": false,
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "unseparated": true
      },
      "notes": [
        "run o0-folder-row-gpuoff-r1: the row remainder 111.8 ms of the 1011.4 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)"
      ],
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
      "measurementShape": {
        "ok": true,
        "errors": [],
        "notes": [],
        "legacyShape": false,
        "legacyShapeReason": null,
        "failReasons": []
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
          "ms": 173.6,
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
          "ms": 4.4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 5.6,
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
          "ms": 0.4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 2.4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 2163.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 72.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 1787.1,
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
          "start": 9789.199999988079,
          "duration": 95
        },
        {
          "start": 9911.59999999404,
          "duration": 2197
        }
      ],
      "longTaskTotalMs": 2292,
      "mutations": 11758,
      "wallMs": 2385.9,
      "t0": 9786.199999988079,
      "t1": 12172.09999999404,
      "quiesce": {
        "frames": 5,
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
        "renderer": "1789977178309+678367+3e3f1b80",
        "main": "1789977178193+2419628+1e652667",
        "served": "678367+3e3f1b80"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 9786.59999999404,
          "t1": 12172.09999999404,
          "ms": 2385.5
        },
        "freezeWindow": {
          "t0": 9786.199999988079,
          "t1": 12172.09999999404
        },
        "toleranceMs": 40,
        "rowArmCount": 1,
        "rowDisarmCount": 1,
        "sessionArmCount": 2,
        "sessionDisarmCount": 2,
        "sessionCountsAt": {
          "pre": {
            "arm": 1,
            "disarm": 1,
            "at": 9786.59999999404
          },
          "post": {
            "arm": 2,
            "disarm": 2,
            "at": 12172.09999999404
          }
        },
        "longTaskAttribution": {
          "ok": true,
          "errors": [],
          "failReasons": [],
          "rule": "start-inside-inclusive",
          "window": {
            "t0": 9786.199999988079,
            "t1": 12172.09999999404
          },
          "includedCount": 2,
          "includedMs": 2292,
          "startBefore": [],
          "straddlesEnd": [],
          "startBeforeOverlapMs": 0,
          "straddleEndMs": 0,
          "startAfterCount": 0,
          "startAfterMs": 0,
          "overlapAnyMs": 2292,
          "intersectionMs": 2292,
          "ambiguous": false,
          "ambiguityReason": null
        },
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "opener": null,
            "window": {
              "t0": 9790.59999999404,
              "t1": 9884.90000000596,
              "ms": 94.3
            },
            "records": {
              "indices": [
                0,
                1,
                2,
                3
              ],
              "count": 4,
              "nestedCount": 0
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": null,
                "unseparated": true,
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
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 47.9,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 45.1,
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
            "topLevelSpans": [
              {
                "index": 0,
                "stage": "render.dom",
                "startMs": 9790.59999999404,
                "endMs": 9815.59999999404
              },
              {
                "index": 1,
                "stage": "render.ssr",
                "startMs": 9815.59999999404,
                "endMs": 9838.5
              },
              {
                "index": 2,
                "stage": "render.dom",
                "startMs": 9839.800000011921,
                "endMs": 9862.699999988079
              },
              {
                "index": 3,
                "stage": "render.ssr",
                "startMs": 9862.699999988079,
                "endMs": 9884.90000000596
              }
            ],
            "sumOfSpansMs": 93,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 93,
            "unaccountedMs": 1.3,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          },
          {
            "index": 1,
            "kind": "re-derive",
            "opener": {
              "stage": "snapshot.pull",
              "recordIndex": 4
            },
            "window": {
              "t0": 9789.300000011921,
              "t1": 12099.699999988079,
              "ms": 2310.4
            },
            "records": {
              "indices": [
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "count": 9,
              "nestedCount": 2
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": 115.4,
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
                "ms": 2.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": 5.6,
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
                "ms": 0.4,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": 2.4,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": 2163.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 24.3,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 1742,
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
            "topLevelSpans": [
              {
                "index": 4,
                "stage": "snapshot.pull",
                "startMs": 9789.300000011921,
                "endMs": 9904.699999988079
              },
              {
                "index": 5,
                "stage": "docheads.pull",
                "startMs": 9904.699999988079,
                "endMs": 9906.90000000596
              },
              {
                "index": 6,
                "stage": "traversal.build",
                "startMs": 9927.800000011921,
                "endMs": 9933.40000000596
              },
              {
                "index": 7,
                "stage": "shared.decorate",
                "startMs": 9933.40000000596,
                "endMs": 9933.800000011921
              },
              {
                "index": 8,
                "stage": "envelope.assemble",
                "startMs": 9933.800000011921,
                "endMs": 9934
              },
              {
                "index": 9,
                "stage": "reconcile.roots",
                "startMs": 9934.09999999404,
                "endMs": 9936.5
              },
              {
                "index": 12,
                "stage": "reconcile.apply",
                "startMs": 9936.5,
                "endMs": 12099.699999988079
              }
            ],
            "sumOfSpansMs": 2289.4,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 2289.4,
            "unaccountedMs": 21,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 2197,
            "pass": true,
            "failReasons": []
          },
          {
            "index": 2,
            "kind": "re-derive",
            "opener": {
              "stage": "snapshot.pull",
              "recordIndex": 13
            },
            "window": {
              "t0": 12104.40000000596,
              "t1": 12164.800000011921,
              "ms": 60.4
            },
            "records": {
              "indices": [
                13,
                14
              ],
              "count": 2,
              "nestedCount": 0
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": 58.2,
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
                "ms": 2.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": null,
                "unseparated": true,
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
            "topLevelSpans": [
              {
                "index": 13,
                "stage": "snapshot.pull",
                "startMs": 12104.40000000596,
                "endMs": 12162.59999999404
              },
              {
                "index": 14,
                "stage": "docheads.pull",
                "startMs": 12162.59999999404,
                "endMs": 12164.800000011921
              }
            ],
            "sumOfSpansMs": 60.4,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 60.4,
            "unaccountedMs": 0,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          }
        ],
        "passCount": 3,
        "passKindSequence": [
          "pre-pass-render",
          "re-derive",
          "re-derive"
        ],
        "passOverlaps": [
          {
            "a": 0,
            "b": 1,
            "overlapMs": 94.3
          }
        ],
        "passLongTaskDoubleCountMs": 0,
        "nestingAmbiguities": [],
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
          }
        ],
        "stageRecordDetail": [
          {
            "index": 0,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 25,
            "startMs": 9790.59999999404,
            "endMs": 9815.59999999404,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 1,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 22.9,
            "startMs": 9815.59999999404,
            "endMs": 9838.5,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 2,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 22.9,
            "startMs": 9839.800000011921,
            "endMs": 9862.699999988079,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 3,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 22.2,
            "startMs": 9862.699999988079,
            "endMs": 9884.90000000596,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 4,
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 115.4,
            "startMs": 9789.300000011921,
            "endMs": 9904.699999988079,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:snapshot.pull:start",
            "endMark": "o0:snapshot.pull:end",
            "error": null
          },
          {
            "index": 5,
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.2,
            "startMs": 9904.699999988079,
            "endMs": 9906.90000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:docheads.pull:start",
            "endMark": "o0:docheads.pull:end",
            "error": null
          },
          {
            "index": 6,
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5.6,
            "startMs": 9927.800000011921,
            "endMs": 9933.40000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:traversal.build:start",
            "endMark": "o0:traversal.build:end",
            "error": null
          },
          {
            "index": 7,
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.4,
            "startMs": 9933.40000000596,
            "endMs": 9933.800000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:shared.decorate:start",
            "endMark": "o0:shared.decorate:end",
            "error": null
          },
          {
            "index": 8,
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 9933.800000011921,
            "endMs": 9934,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:envelope.assemble:start",
            "endMark": "o0:envelope.assemble:end",
            "error": null
          },
          {
            "index": 9,
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 2.4,
            "startMs": 9934.09999999404,
            "endMs": 9936.5,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.roots:start",
            "endMark": "o0:reconcile.roots:end",
            "error": null
          },
          {
            "index": 10,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 24.3,
            "startMs": 10333.40000000596,
            "endMs": 10357.699999988079,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 11,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 1742,
            "startMs": 10357.699999988079,
            "endMs": 12099.699999988079,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 12,
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 2163.2,
            "startMs": 9936.5,
            "endMs": 12099.699999988079,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.apply:start",
            "endMark": "o0:reconcile.apply:end",
            "error": null
          },
          {
            "index": 13,
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 58.2,
            "startMs": 12104.40000000596,
            "endMs": 12162.59999999404,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:snapshot.pull:start",
            "endMark": "o0:snapshot.pull:end",
            "error": null
          },
          {
            "index": 14,
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.2,
            "startMs": 12162.59999999404,
            "endMs": 12164.800000011921,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:docheads.pull:start",
            "endMark": "o0:docheads.pull:end",
            "error": null
          }
        ],
        "mainSeamArmed": false,
        "mainSeamNote": "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured",
        "mainRecordsTransport": "none — the main process records the handler span but no channel carries it into the renderer/report (§3.6b/S15/RUL-3)",
        "rendererArmed": true,
        "refused": [],
        "records": 15,
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
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "windowMs": 2385.9,
        "accountedMs": 2349.8,
        "unaccountedMs": 36.1,
        "unaccountedReason": null,
        "unaccountedSource": "derived",
        "unaccountedAttributable": false,
        "overlapMs": 0,
        "outsideMs": 0,
        "passOverlapSumMs": 94.3,
        "bandExceeded": false,
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "spanMs": 94.3,
            "accountedMs": 93,
            "unaccountedMs": 1.3,
            "longTaskTotalMs": 0
          },
          {
            "index": 1,
            "kind": "re-derive",
            "spanMs": 2310.4,
            "accountedMs": 2289.4,
            "unaccountedMs": 21,
            "longTaskTotalMs": 2197
          },
          {
            "index": 2,
            "kind": "re-derive",
            "spanMs": 60.4,
            "accountedMs": 60.4,
            "unaccountedMs": 0,
            "longTaskTotalMs": 0
          }
        ],
        "naiveSumResidualMs": -1917.1,
        "naiveSumResidualNote": "notAResidual",
        "sumMs": 4209.1,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
        "windowBoundToleranceMs": 40,
        "passTotalsMinusRowMs": -95,
        "passTotalsMinusRowNote": "notADoubleCount",
        "passRowUnaccountedDeltaMs": -13.8,
        "passRowUnaccountedDeltaNote": "notAMeasure",
        "bandExceededNote": null,
        "note": "the DERIVED remainder is an accounting quantity (unaccountedSource 'derived', attributable:false) and is never a stage cost; no value was imputed (§3.6b RUL-4 clause 5)",
        "outcomeReasons": []
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "timed": false,
        "source": "derived",
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "attributable": false,
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
      "measurementShape": {
        "ok": true,
        "errors": [],
        "notes": [],
        "legacyShape": false,
        "legacyShapeReason": null,
        "failReasons": []
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
      "hit": "preempt-node-node-181091",
      "stageCount": 11,
      "stages": [
        {
          "id": "snapshot.pull",
          "ms": 28.1,
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
          "ms": 4.3,
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
          "ms": 1.7,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 0.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 0.8,
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
      "wallMs": 77.2,
      "t0": 12605.300000011921,
      "t1": 12682.5,
      "quiesce": {
        "frames": 8,
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
        "renderer": "1789977178309+678367+3e3f1b80",
        "main": "1789977178193+2419628+1e652667",
        "served": "678367+3e3f1b80"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 12605.800000011921,
          "t1": 12682.59999999404,
          "ms": 76.8
        },
        "freezeWindow": {
          "t0": 12605.300000011921,
          "t1": 12682.5
        },
        "toleranceMs": 40,
        "rowArmCount": 1,
        "rowDisarmCount": 1,
        "sessionArmCount": 3,
        "sessionDisarmCount": 3,
        "sessionCountsAt": {
          "pre": {
            "arm": 2,
            "disarm": 2,
            "at": 12605.800000011921
          },
          "post": {
            "arm": 3,
            "disarm": 3,
            "at": 12682.59999999404
          }
        },
        "longTaskAttribution": {
          "ok": true,
          "errors": [],
          "failReasons": [],
          "rule": "start-inside-inclusive",
          "window": {
            "t0": 12605.300000011921,
            "t1": 12682.5
          },
          "includedCount": 0,
          "includedMs": 0,
          "startBefore": [],
          "straddlesEnd": [],
          "startBeforeOverlapMs": 0,
          "straddleEndMs": 0,
          "startAfterCount": 0,
          "startAfterMs": 0,
          "overlapAnyMs": 0,
          "intersectionMs": 0,
          "ambiguous": false,
          "ambiguityReason": null
        },
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "opener": null,
            "window": {
              "t0": 12606.90000000596,
              "t1": 12607.199999988079,
              "ms": 0.3
            },
            "records": {
              "indices": [
                0,
                1
              ],
              "count": 2,
              "nestedCount": 0
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": null,
                "unseparated": true,
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
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 0.1,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 0.2,
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
            "topLevelSpans": [
              {
                "index": 0,
                "stage": "render.dom",
                "startMs": 12606.90000000596,
                "endMs": 12607
              },
              {
                "index": 1,
                "stage": "render.ssr",
                "startMs": 12607,
                "endMs": 12607.199999988079
              }
            ],
            "sumOfSpansMs": 0.3,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 0.3,
            "unaccountedMs": 0,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          },
          {
            "index": 1,
            "kind": "re-derive",
            "opener": {
              "stage": "snapshot.pull",
              "recordIndex": 2
            },
            "window": {
              "t0": 12606.699999988079,
              "t1": 12662.699999988079,
              "ms": 56
            },
            "records": {
              "indices": [
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
              ],
              "count": 9,
              "nestedCount": 2
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": 28.1,
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
                "ms": 4.3,
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
                "ms": 1.7,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 0.5,
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
            "topLevelSpans": [
              {
                "index": 2,
                "stage": "snapshot.pull",
                "startMs": 12606.699999988079,
                "endMs": 12634.800000011921
              },
              {
                "index": 3,
                "stage": "docheads.pull",
                "startMs": 12634.800000011921,
                "endMs": 12636.699999988079
              },
              {
                "index": 4,
                "stage": "traversal.build",
                "startMs": 12651,
                "endMs": 12656.300000011921
              },
              {
                "index": 5,
                "stage": "shared.decorate",
                "startMs": 12656.300000011921,
                "endMs": 12660.59999999404
              },
              {
                "index": 6,
                "stage": "envelope.assemble",
                "startMs": 12660.59999999404,
                "endMs": 12660.800000011921
              },
              {
                "index": 7,
                "stage": "reconcile.roots",
                "startMs": 12660.90000000596,
                "endMs": 12661
              },
              {
                "index": 10,
                "stage": "reconcile.apply",
                "startMs": 12661,
                "endMs": 12662.699999988079
              }
            ],
            "sumOfSpansMs": 41.6,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 41.6,
            "unaccountedMs": 14.4,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          }
        ],
        "passCount": 2,
        "passKindSequence": [
          "pre-pass-render",
          "re-derive"
        ],
        "passOverlaps": [
          {
            "a": 0,
            "b": 1,
            "overlapMs": 0.3
          }
        ],
        "passLongTaskDoubleCountMs": 0,
        "nestingAmbiguities": [],
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
            "index": 0,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.1,
            "startMs": 12606.90000000596,
            "endMs": 12607,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 1,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 12607,
            "endMs": 12607.199999988079,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 2,
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 28.1,
            "startMs": 12606.699999988079,
            "endMs": 12634.800000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:snapshot.pull:start",
            "endMark": "o0:snapshot.pull:end",
            "error": null
          },
          {
            "index": 3,
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 1.9,
            "startMs": 12634.800000011921,
            "endMs": 12636.699999988079,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:docheads.pull:start",
            "endMark": "o0:docheads.pull:end",
            "error": null
          },
          {
            "index": 4,
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5.3,
            "startMs": 12651,
            "endMs": 12656.300000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:traversal.build:start",
            "endMark": "o0:traversal.build:end",
            "error": null
          },
          {
            "index": 5,
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 4.3,
            "startMs": 12656.300000011921,
            "endMs": 12660.59999999404,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:shared.decorate:start",
            "endMark": "o0:shared.decorate:end",
            "error": null
          },
          {
            "index": 6,
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 12660.59999999404,
            "endMs": 12660.800000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:envelope.assemble:start",
            "endMark": "o0:envelope.assemble:end",
            "error": null
          },
          {
            "index": 7,
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 0.1,
            "startMs": 12660.90000000596,
            "endMs": 12661,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.roots:start",
            "endMark": "o0:reconcile.roots:end",
            "error": null
          },
          {
            "index": 8,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.5,
            "startMs": 12661.59999999404,
            "endMs": 12662.09999999404,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 9,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.6,
            "startMs": 12662.09999999404,
            "endMs": 12662.699999988079,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 10,
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 1.7,
            "startMs": 12661,
            "endMs": 12662.699999988079,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.apply:start",
            "endMark": "o0:reconcile.apply:end",
            "error": null
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
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "windowMs": 77.2,
        "accountedMs": 41.6,
        "unaccountedMs": 35.6,
        "unaccountedReason": null,
        "unaccountedSource": "derived",
        "unaccountedAttributable": false,
        "overlapMs": 0,
        "outsideMs": 0,
        "passOverlapSumMs": 0.3,
        "bandExceeded": false,
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "spanMs": 0.3,
            "accountedMs": 0.3,
            "unaccountedMs": 0,
            "longTaskTotalMs": 0
          },
          {
            "index": 1,
            "kind": "re-derive",
            "spanMs": 56,
            "accountedMs": 41.6,
            "unaccountedMs": 14.4,
            "longTaskTotalMs": 0
          }
        ],
        "naiveSumResidualMs": -43,
        "naiveSumResidualNote": "notAResidual",
        "sumMs": 43,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
        "windowBoundToleranceMs": 40,
        "passTotalsMinusRowMs": 0,
        "passTotalsMinusRowNote": "notADoubleCount",
        "passRowUnaccountedDeltaMs": -21.2,
        "passRowUnaccountedDeltaNote": "notAMeasure",
        "bandExceededNote": null,
        "note": "the DERIVED remainder is an accounting quantity (unaccountedSource 'derived', attributable:false) and is never a stage cost; no value was imputed (§3.6b RUL-4 clause 5)",
        "outcomeReasons": []
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "timed": false,
        "source": "derived",
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "attributable": false,
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
      "measurementShape": {
        "ok": true,
        "errors": [],
        "notes": [],
        "legacyShape": false,
        "legacyShapeReason": null,
        "failReasons": []
      },
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
          "ms": 27.5,
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
          "ms": 2.4,
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
          "ms": 0.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "shared.decorate",
          "ms": 0.5,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 0.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 4.1,
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
          "ms": 0.8,
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
      "wallMs": 81.6,
      "t0": 13087,
      "t1": 13168.59999999404,
      "quiesce": {
        "frames": 7,
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
        "renderer": "1789977178309+678367+3e3f1b80",
        "main": "1789977178193+2419628+1e652667",
        "served": "678367+3e3f1b80"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 13087.40000000596,
          "t1": 13168.699999988079,
          "ms": 81.3
        },
        "freezeWindow": {
          "t0": 13087,
          "t1": 13168.59999999404
        },
        "toleranceMs": 40,
        "rowArmCount": 1,
        "rowDisarmCount": 1,
        "sessionArmCount": 4,
        "sessionDisarmCount": 4,
        "sessionCountsAt": {
          "pre": {
            "arm": 3,
            "disarm": 3,
            "at": 13087.40000000596
          },
          "post": {
            "arm": 4,
            "disarm": 4,
            "at": 13168.699999988079
          }
        },
        "longTaskAttribution": {
          "ok": true,
          "errors": [],
          "failReasons": [],
          "rule": "start-inside-inclusive",
          "window": {
            "t0": 13087,
            "t1": 13168.59999999404
          },
          "includedCount": 0,
          "includedMs": 0,
          "startBefore": [],
          "straddlesEnd": [],
          "startBeforeOverlapMs": 0,
          "straddleEndMs": 0,
          "startAfterCount": 0,
          "startAfterMs": 0,
          "overlapAnyMs": 0,
          "intersectionMs": 0,
          "ambiguous": false,
          "ambiguityReason": null
        },
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "opener": null,
            "window": {
              "t0": 13088.40000000596,
              "t1": 13088.800000011921,
              "ms": 0.4
            },
            "records": {
              "indices": [
                0,
                1
              ],
              "count": 2,
              "nestedCount": 0
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": null,
                "unseparated": true,
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
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 0.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 0.2,
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
            "topLevelSpans": [
              {
                "index": 0,
                "stage": "render.dom",
                "startMs": 13088.40000000596,
                "endMs": 13088.59999999404
              },
              {
                "index": 1,
                "stage": "render.ssr",
                "startMs": 13088.59999999404,
                "endMs": 13088.800000011921
              }
            ],
            "sumOfSpansMs": 0.4,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 0.4,
            "unaccountedMs": 0,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          },
          {
            "index": 1,
            "kind": "re-derive",
            "opener": {
              "stage": "snapshot.pull",
              "recordIndex": 2
            },
            "window": {
              "t0": 13088.300000011921,
              "t1": 13145.90000000596,
              "ms": 57.6
            },
            "records": {
              "indices": [
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
              ],
              "count": 9,
              "nestedCount": 2
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": 27.5,
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
                "ms": 2.4,
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
                "ms": 0.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": 0.5,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": 0.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": 4.1,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 0.6,
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
            "topLevelSpans": [
              {
                "index": 2,
                "stage": "snapshot.pull",
                "startMs": 13088.300000011921,
                "endMs": 13115.800000011921
              },
              {
                "index": 3,
                "stage": "docheads.pull",
                "startMs": 13115.800000011921,
                "endMs": 13118.199999988079
              },
              {
                "index": 4,
                "stage": "traversal.build",
                "startMs": 13135.5,
                "endMs": 13140.90000000596
              },
              {
                "index": 5,
                "stage": "shared.decorate",
                "startMs": 13140.90000000596,
                "endMs": 13141.40000000596
              },
              {
                "index": 6,
                "stage": "envelope.assemble",
                "startMs": 13141.40000000596,
                "endMs": 13141.59999999404
              },
              {
                "index": 7,
                "stage": "reconcile.roots",
                "startMs": 13141.59999999404,
                "endMs": 13141.800000011921
              },
              {
                "index": 10,
                "stage": "reconcile.apply",
                "startMs": 13141.800000011921,
                "endMs": 13145.90000000596
              }
            ],
            "sumOfSpansMs": 40.3,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 40.3,
            "unaccountedMs": 17.3,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          }
        ],
        "passCount": 2,
        "passKindSequence": [
          "pre-pass-render",
          "re-derive"
        ],
        "passOverlaps": [
          {
            "a": 0,
            "b": 1,
            "overlapMs": 0.4
          }
        ],
        "passLongTaskDoubleCountMs": 0,
        "nestingAmbiguities": [],
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
            "index": 0,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 13088.40000000596,
            "endMs": 13088.59999999404,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 1,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 13088.59999999404,
            "endMs": 13088.800000011921,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 2,
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 27.5,
            "startMs": 13088.300000011921,
            "endMs": 13115.800000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:snapshot.pull:start",
            "endMark": "o0:snapshot.pull:end",
            "error": null
          },
          {
            "index": 3,
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.4,
            "startMs": 13115.800000011921,
            "endMs": 13118.199999988079,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:docheads.pull:start",
            "endMark": "o0:docheads.pull:end",
            "error": null
          },
          {
            "index": 4,
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5.4,
            "startMs": 13135.5,
            "endMs": 13140.90000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:traversal.build:start",
            "endMark": "o0:traversal.build:end",
            "error": null
          },
          {
            "index": 5,
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.5,
            "startMs": 13140.90000000596,
            "endMs": 13141.40000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:shared.decorate:start",
            "endMark": "o0:shared.decorate:end",
            "error": null
          },
          {
            "index": 6,
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 13141.40000000596,
            "endMs": 13141.59999999404,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:envelope.assemble:start",
            "endMark": "o0:envelope.assemble:end",
            "error": null
          },
          {
            "index": 7,
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 13141.59999999404,
            "endMs": 13141.800000011921,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.roots:start",
            "endMark": "o0:reconcile.roots:end",
            "error": null
          },
          {
            "index": 8,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.6,
            "startMs": 13144.59999999404,
            "endMs": 13145.199999988079,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 9,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.6,
            "startMs": 13145.199999988079,
            "endMs": 13145.800000011921,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 10,
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 4.1,
            "startMs": 13141.800000011921,
            "endMs": 13145.90000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.apply:start",
            "endMark": "o0:reconcile.apply:end",
            "error": null
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
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "windowMs": 81.6,
        "accountedMs": 40.3,
        "unaccountedMs": 41.3,
        "unaccountedReason": null,
        "unaccountedSource": "derived",
        "unaccountedAttributable": false,
        "overlapMs": 0,
        "outsideMs": 0,
        "passOverlapSumMs": 0.4,
        "bandExceeded": false,
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "spanMs": 0.4,
            "accountedMs": 0.4,
            "unaccountedMs": 0,
            "longTaskTotalMs": 0
          },
          {
            "index": 1,
            "kind": "re-derive",
            "spanMs": 57.6,
            "accountedMs": 40.3,
            "unaccountedMs": 17.3,
            "longTaskTotalMs": 0
          }
        ],
        "naiveSumResidualMs": -41.9,
        "naiveSumResidualNote": "notAResidual",
        "sumMs": 41.9,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
        "windowBoundToleranceMs": 40,
        "passTotalsMinusRowMs": 0,
        "passTotalsMinusRowNote": "notADoubleCount",
        "passRowUnaccountedDeltaMs": -24,
        "passRowUnaccountedDeltaNote": "notAMeasure",
        "bandExceededNote": null,
        "note": "the DERIVED remainder is an accounting quantity (unaccountedSource 'derived', attributable:false) and is never a stage cost; no value was imputed (§3.6b RUL-4 clause 5)",
        "outcomeReasons": []
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "timed": false,
        "source": "derived",
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "attributable": false,
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "unseparated": true
      },
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
      "measurementShape": {
        "ok": true,
        "errors": [],
        "notes": [],
        "legacyShape": false,
        "legacyShapeReason": null,
        "failReasons": []
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
    "stage traversal.build is 633.2 ms of the 940 ms long task (67.36%) on folder-row — traversal.build is the largest identified stage",
    "the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 85 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-folder-row-gpuoff-r1: reconciliation OPEN-structural — unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-folder-row-gpuoff-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "stage reconcile.apply is 2163.2 ms of the 2292 ms long task (94.38%) on document-row — reconcile.apply is the largest identified stage",
    "the document-row performed 2 whole-store IPC_RAG_SNAPSHOT read(s) totalling 173.6 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-document-row-gpuoff-r1: reconciliation OPEN-structural — unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-document-row-gpuoff-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "stage snapshot.pull is 28.1 ms of the 0 ms long task on folder-row — snapshot.pull is the largest identified stage; no percentage is computed: the long-task window is zero (0 ms), so this row has no finite window to divide by",
    "the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 28.1 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-fold-ablation-off: reconciliation OPEN-structural — unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-fold-ablation-off: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "stage snapshot.pull is 27.5 ms of the 0 ms long task on folder-row — snapshot.pull is the largest identified stage; no percentage is computed: the long-task window is zero (0 ms), so this row has no finite window to divide by",
    "the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 27.5 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-fold-ablation-on: reconciliation OPEN-structural — unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-fold-ablation-on: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "O-0 REPORT OPEN — 4 stage(s) structurally unseparated (o0-folder-row-gpuoff-r1:snapshot.clone, o0-document-row-gpuoff-r1:snapshot.clone, o0-fold-ablation-off:snapshot.clone, o0-fold-ablation-on:snapshot.clone): run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4) — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed"
  ],
  "reconciliation": {
    "ok": false,
    "note": "structurally unseparated stage(s) o0-folder-row-gpuoff-r1:snapshot.clone, o0-document-row-gpuoff-r1:snapshot.clone, o0-fold-ablation-off:snapshot.clone, o0-fold-ablation-on:snapshot.clone have no seam in the executing bundle (run o0-folder-row-gpuoff-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)), so the long-task residual is NOT computable and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)",
    "bandExceededNotes": [
      "o0-folder-row-gpuoff-r1: run o0-folder-row-gpuoff-r1: the row remainder 111.8 ms of the 1011.4 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)"
    ],
    "bandExceededGate": false,
    "measurementShapeFailures": [],
    "structuralStages": [
      "o0-folder-row-gpuoff-r1:snapshot.clone",
      "o0-document-row-gpuoff-r1:snapshot.clone",
      "o0-fold-ablation-off:snapshot.clone",
      "o0-fold-ablation-on:snapshot.clone"
    ]
  },
  "pass": false,
  "status": "OPEN-structural",
  "artifactPath": "/tmp/o0i-gpuoff.json"
}
```

### 12.2 GPU-ON leg — `/tmp/o0i-gpuon.json`

```json round-trip=gpu-on
{
  "artifact": "o-0-per-stage-breakdown",
  "spec": "docs/specs/unit-o-0-per-stage-measurement.md",
  "unit": "O-0",
  "date": "2026-09-21",
  "layer": "assembled-renderer (RCA-12)",
  "commands": [
    "node scripts/live-drive.mjs --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --display=:0 --gpu --o0-out=/tmp/o0i-gpuon.json --block=o0_gpu_control,o0_repeat_determinism"
  ],
  "pinnedCommands": [
    "npm run build",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --display=:0 --o0-out=<path> --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --gpu --display=:0 --o0-out=<path> --block=o0_gpu_control"
  ],
  "driver": {
    "build": {
      "renderer": "1789977207408+678367+3e3f1b80",
      "main": "1789977207293+2419628+1e652667",
      "served": "678367+3e3f1b80",
      "servedUrl": "file:///media/ryanr/Shared%20Files/Projects/Astrographer/dist/renderer/renderer.js",
      "disk": {
        "rendererBytes": 678367,
        "rendererHash": "3e3f1b80"
      },
      "verified": true
    },
    "oracleIdentity": {
      "source": "source-import",
      "report": {
        "path": "src/shared/o0-report.ts",
        "bytes": 200143,
        "hash": "b89d6f19",
        "short": "b89d6f19"
      },
      "driver": {
        "path": "scripts/live-drive.mjs",
        "bytes": 395314,
        "hash": "194dfece",
        "short": "194dfece"
      },
      "hash": "92a74b7d",
      "short": "92a74b7d",
      "note": "the per-row verdicts are produced by the SOURCE-IMPORTED oracle (src/shared/o0-report.ts) + this driver’s row assembly — `driver.build.verified` is evidence about the EXECUTING BUNDLE only, never about the code that minted the verdicts (§3b re-audit, oracle provenance)"
    },
    "gpuFlag": true,
    "cliArgs": [
      "--seed=/tmp/o0-corpus-226",
      "--corpus-root=/tmp/o0-corpus-226",
      "--strict-seed",
      "--o0-corpus=226",
      "--display=:0",
      "--gpu",
      "--o0-out=/tmp/o0i-gpuon.json",
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
    "openStructural": true,
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
      "run o0-folder-row-gpuon-r1: post.style residual null ms (Σ named stages 1064.1999999999998 of 961 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)",
      "run o0-document-row-gpuon-r1: post.style residual null ms (Σ named stages 4088.4 of 2214 ms; reconciliation FAILED) — unseparated: [snapshot.clone, post.style] — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)"
    ],
    "selfValidationOfEmitted": {
      "ok": true,
      "errors": [],
      "gating": [],
      "status": "OPEN-structural",
      "verdicts": 9,
      "note": "the FINAL report object (status/pass/verdicts/reconciliation.ok all attached) re-validated over a SHALLOW COPY — the §3b re-audit order finding: the driver’s single self-validation call could not see the fields it writes LAST"
    }
  },
  "tolerance": {
    "reconcileMs": 50,
    "source": "the compile-time constant O0_RECONCILE_TOLERANCE_MS (50 ms) — the ONE band the oracle reads from each row's recorded reconciliation.toleranceMs and the report declares here; its empirical re-derivation by the long-task/union data is OWED (§13.2 (7)/§13.4)"
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
          "ms": 88.9,
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
          "ms": 2.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 662.9,
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
          "ms": 10.4,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.roots",
          "ms": 15.5,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "reconcile.apply",
          "ms": 146.2,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 61.9,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 75.9,
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
          "start": 8469,
          "duration": 68
        },
        {
          "start": 8566.5,
          "duration": 893
        }
      ],
      "longTaskTotalMs": 961,
      "mutations": 37,
      "wallMs": 1027.8,
      "t0": 8463,
      "t1": 9490.800000011921,
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
        "renderer": "1789977207408+678367+3e3f1b80",
        "main": "1789977207293+2419628+1e652667",
        "served": "678367+3e3f1b80"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 8463.800000011921,
          "t1": 9491,
          "ms": 1027.2
        },
        "freezeWindow": {
          "t0": 8463,
          "t1": 9490.800000011921
        },
        "toleranceMs": 40,
        "rowArmCount": 1,
        "rowDisarmCount": 1,
        "sessionArmCount": 1,
        "sessionDisarmCount": 1,
        "sessionCountsAt": {
          "pre": {
            "arm": 0,
            "disarm": 0,
            "at": 8463.800000011921
          },
          "post": {
            "arm": 1,
            "disarm": 1,
            "at": 9491
          }
        },
        "longTaskAttribution": {
          "ok": true,
          "errors": [],
          "failReasons": [],
          "rule": "start-inside-inclusive",
          "window": {
            "t0": 8463,
            "t1": 9490.800000011921
          },
          "includedCount": 2,
          "includedMs": 961,
          "startBefore": [],
          "straddlesEnd": [],
          "startBeforeOverlapMs": 0,
          "straddleEndMs": 0,
          "startAfterCount": 0,
          "startAfterMs": 0,
          "overlapAnyMs": 961,
          "intersectionMs": 961,
          "ambiguous": false,
          "ambiguityReason": null
        },
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "opener": null,
            "window": {
              "t0": 8471.200000017881,
              "t1": 8537.300000011921,
              "ms": 66.1
            },
            "records": {
              "indices": [
                0,
                1
              ],
              "count": 2,
              "nestedCount": 0
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": null,
                "unseparated": true,
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
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 36.1,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 30,
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
            "topLevelSpans": [
              {
                "index": 0,
                "stage": "render.dom",
                "startMs": 8471.200000017881,
                "endMs": 8507.300000011921
              },
              {
                "index": 1,
                "stage": "render.ssr",
                "startMs": 8507.300000011921,
                "endMs": 8537.300000011921
              }
            ],
            "sumOfSpansMs": 66.1,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 66.1,
            "unaccountedMs": 0,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          },
          {
            "index": 1,
            "kind": "re-derive",
            "opener": {
              "stage": "snapshot.pull",
              "recordIndex": 2
            },
            "window": {
              "t0": 8469.300000011921,
              "t1": 9421.200000017881,
              "ms": 951.9
            },
            "records": {
              "indices": [
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
              ],
              "count": 9,
              "nestedCount": 2
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": 88.9,
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
                "ms": 2.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": 662.9,
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
                "ms": 10.4,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": 15.5,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": 146.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 25.8,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 45.9,
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
            "topLevelSpans": [
              {
                "index": 2,
                "stage": "snapshot.pull",
                "startMs": 8469.300000011921,
                "endMs": 8558.200000017881
              },
              {
                "index": 3,
                "stage": "docheads.pull",
                "startMs": 8558.200000017881,
                "endMs": 8560.40000000596
              },
              {
                "index": 4,
                "stage": "traversal.build",
                "startMs": 8580.600000023842,
                "endMs": 9243.5
              },
              {
                "index": 5,
                "stage": "shared.decorate",
                "startMs": 9244.200000017881,
                "endMs": 9254.600000023842
              },
              {
                "index": 6,
                "stage": "envelope.assemble",
                "startMs": 9254.700000017881,
                "endMs": 9255
              },
              {
                "index": 7,
                "stage": "reconcile.roots",
                "startMs": 9259.40000000596,
                "endMs": 9274.90000000596
              },
              {
                "index": 10,
                "stage": "reconcile.apply",
                "startMs": 9275,
                "endMs": 9421.200000017881
              }
            ],
            "sumOfSpansMs": 926.4,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 926.4,
            "unaccountedMs": 25.5,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 893,
            "pass": true,
            "failReasons": []
          }
        ],
        "passCount": 2,
        "passKindSequence": [
          "pre-pass-render",
          "re-derive"
        ],
        "passOverlaps": [
          {
            "a": 0,
            "b": 1,
            "overlapMs": 66.1
          }
        ],
        "passLongTaskDoubleCountMs": 0,
        "nestingAmbiguities": [],
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
            "index": 0,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 36.1,
            "startMs": 8471.200000017881,
            "endMs": 8507.300000011921,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 1,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 30,
            "startMs": 8507.300000011921,
            "endMs": 8537.300000011921,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 2,
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 88.9,
            "startMs": 8469.300000011921,
            "endMs": 8558.200000017881,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:snapshot.pull:start",
            "endMark": "o0:snapshot.pull:end",
            "error": null
          },
          {
            "index": 3,
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.2,
            "startMs": 8558.200000017881,
            "endMs": 8560.40000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:docheads.pull:start",
            "endMark": "o0:docheads.pull:end",
            "error": null
          },
          {
            "index": 4,
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 662.9,
            "startMs": 8580.600000023842,
            "endMs": 9243.5,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:traversal.build:start",
            "endMark": "o0:traversal.build:end",
            "error": null
          },
          {
            "index": 5,
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 10.4,
            "startMs": 9244.200000017881,
            "endMs": 9254.600000023842,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:shared.decorate:start",
            "endMark": "o0:shared.decorate:end",
            "error": null
          },
          {
            "index": 6,
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.3,
            "startMs": 9254.700000017881,
            "endMs": 9255,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:envelope.assemble:start",
            "endMark": "o0:envelope.assemble:end",
            "error": null
          },
          {
            "index": 7,
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 15.5,
            "startMs": 9259.40000000596,
            "endMs": 9274.90000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.roots:start",
            "endMark": "o0:reconcile.roots:end",
            "error": null
          },
          {
            "index": 8,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 25.8,
            "startMs": 9349.5,
            "endMs": 9375.300000011921,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 9,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 45.9,
            "startMs": 9375.300000011921,
            "endMs": 9421.200000017881,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 10,
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 146.2,
            "startMs": 9275,
            "endMs": 9421.200000017881,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.apply:start",
            "endMark": "o0:reconcile.apply:end",
            "error": null
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
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "windowMs": 1027.8,
        "accountedMs": 926.4,
        "unaccountedMs": 101.4,
        "unaccountedReason": null,
        "unaccountedSource": "derived",
        "unaccountedAttributable": false,
        "overlapMs": 0,
        "outsideMs": 0,
        "passOverlapSumMs": 66.1,
        "bandExceeded": true,
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "spanMs": 66.1,
            "accountedMs": 66.1,
            "unaccountedMs": 0,
            "longTaskTotalMs": 0
          },
          {
            "index": 1,
            "kind": "re-derive",
            "spanMs": 951.9,
            "accountedMs": 926.4,
            "unaccountedMs": 25.5,
            "longTaskTotalMs": 893
          }
        ],
        "naiveSumResidualMs": -103.2,
        "naiveSumResidualNote": "notAResidual",
        "sumMs": 1064.2,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
        "windowBoundToleranceMs": 40,
        "passTotalsMinusRowMs": -68,
        "passTotalsMinusRowNote": "notADoubleCount",
        "passRowUnaccountedDeltaMs": -75.9,
        "passRowUnaccountedDeltaNote": "notAMeasure",
        "bandExceededNote": "run o0-folder-row-gpuon-r1: the row remainder 101.4 ms of the 1027.8 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)",
        "note": "run o0-folder-row-gpuon-r1: the row remainder 101.4 ms of the 1027.8 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4); the DERIVED remainder is an accounting quantity, attributable:false, and is never a stage cost (§3.6b RUL-4 clause 5)",
        "outcomeReasons": [
          "run o0-folder-row-gpuon-r1: the row remainder 101.4 ms of the 1027.8 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)"
        ]
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "timed": false,
        "source": "derived",
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "attributable": false,
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "unseparated": true
      },
      "notes": [
        "run o0-folder-row-gpuon-r1: the row remainder 101.4 ms of the 1027.8 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)"
      ],
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
      "measurementShape": {
        "ok": true,
        "errors": [],
        "notes": [],
        "legacyShape": false,
        "legacyShapeReason": null,
        "failReasons": []
      }
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
          "ms": 175.3,
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
          "ms": 5,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "traversal.build",
          "ms": 11.1,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "envelope.assemble",
          "ms": 0.7,
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
          "ms": 2078.6,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.dom",
          "ms": 69.8,
          "unseparated": false,
          "source": "hook",
          "structural": false,
          "structuralReason": null
        },
        {
          "id": "render.ssr",
          "ms": 1744.6,
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
          "start": 9751.200000017881,
          "duration": 99
        },
        {
          "start": 9879.300000011921,
          "duration": 2115
        }
      ],
      "longTaskTotalMs": 2214,
      "mutations": 11758,
      "wallMs": 2337.5,
      "t0": 9748.200000017881,
      "t1": 12085.700000017881,
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
        "renderer": "1789977207408+678367+3e3f1b80",
        "main": "1789977207293+2419628+1e652667",
        "served": "678367+3e3f1b80"
      },
      "hook": {
        "armed": true,
        "armWindow": {
          "t0": 9748.700000017881,
          "t1": 12085.800000011921,
          "ms": 2337.1
        },
        "freezeWindow": {
          "t0": 9748.200000017881,
          "t1": 12085.700000017881
        },
        "toleranceMs": 40,
        "rowArmCount": 1,
        "rowDisarmCount": 1,
        "sessionArmCount": 2,
        "sessionDisarmCount": 2,
        "sessionCountsAt": {
          "pre": {
            "arm": 1,
            "disarm": 1,
            "at": 9748.700000017881
          },
          "post": {
            "arm": 2,
            "disarm": 2,
            "at": 12085.800000011921
          }
        },
        "longTaskAttribution": {
          "ok": true,
          "errors": [],
          "failReasons": [],
          "rule": "start-inside-inclusive",
          "window": {
            "t0": 9748.200000017881,
            "t1": 12085.700000017881
          },
          "includedCount": 2,
          "includedMs": 2214,
          "startBefore": [],
          "straddlesEnd": [],
          "startBeforeOverlapMs": 0,
          "straddleEndMs": 0,
          "startAfterCount": 0,
          "startAfterMs": 0,
          "overlapAnyMs": 2214,
          "intersectionMs": 2214,
          "ambiguous": false,
          "ambiguityReason": null
        },
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "opener": null,
            "window": {
              "t0": 9752.5,
              "t1": 9850.600000023842,
              "ms": 98.1
            },
            "records": {
              "indices": [
                0,
                1,
                2,
                3
              ],
              "count": 4,
              "nestedCount": 0
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": null,
                "unseparated": true,
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
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "shared.decorate",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": null,
                "unseparated": true,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 47.9,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 49,
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
            "topLevelSpans": [
              {
                "index": 0,
                "stage": "render.dom",
                "startMs": 9752.5,
                "endMs": 9777.90000000596
              },
              {
                "index": 1,
                "stage": "render.ssr",
                "startMs": 9777.90000000596,
                "endMs": 9801.40000000596
              },
              {
                "index": 2,
                "stage": "render.dom",
                "startMs": 9802.600000023842,
                "endMs": 9825.100000023842
              },
              {
                "index": 3,
                "stage": "render.ssr",
                "startMs": 9825.100000023842,
                "endMs": 9850.600000023842
              }
            ],
            "sumOfSpansMs": 96.9,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 96.9,
            "unaccountedMs": 1.2,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          },
          {
            "index": 1,
            "kind": "re-derive",
            "opener": {
              "stage": "snapshot.pull",
              "recordIndex": 4
            },
            "window": {
              "t0": 9751.300000011921,
              "t1": 11985.200000017881,
              "ms": 2233.9
            },
            "records": {
              "indices": [
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "count": 9,
              "nestedCount": 2
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": 121.7,
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
                "ms": 2.4,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": 5,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "envelope.assemble",
                "ms": 0.4,
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
                "ms": 2.5,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": 2078.1,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 21.7,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 1695.4,
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
            "topLevelSpans": [
              {
                "index": 4,
                "stage": "snapshot.pull",
                "startMs": 9751.300000011921,
                "endMs": 9873
              },
              {
                "index": 5,
                "stage": "docheads.pull",
                "startMs": 9873,
                "endMs": 9875.40000000596
              },
              {
                "index": 6,
                "stage": "traversal.build",
                "startMs": 9898.700000017881,
                "endMs": 9903.700000017881
              },
              {
                "index": 7,
                "stage": "shared.decorate",
                "startMs": 9903.800000011921,
                "endMs": 9904.100000023842
              },
              {
                "index": 8,
                "stage": "envelope.assemble",
                "startMs": 9904.100000023842,
                "endMs": 9904.5
              },
              {
                "index": 9,
                "stage": "reconcile.roots",
                "startMs": 9904.600000023842,
                "endMs": 9907.100000023842
              },
              {
                "index": 12,
                "stage": "reconcile.apply",
                "startMs": 9907.100000023842,
                "endMs": 11985.200000017881
              }
            ],
            "sumOfSpansMs": 2210.4,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 2210.4,
            "unaccountedMs": 23.5,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 2115,
            "pass": true,
            "failReasons": []
          },
          {
            "index": 2,
            "kind": "re-derive",
            "opener": {
              "stage": "snapshot.pull",
              "recordIndex": 13
            },
            "window": {
              "t0": 11990,
              "t1": 12074.800000011921,
              "ms": 84.8
            },
            "records": {
              "indices": [
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21
              ],
              "count": 9,
              "nestedCount": 2
            },
            "stageCount": 11,
            "stages": [
              {
                "id": "snapshot.pull",
                "ms": 53.6,
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
                "ms": 2.6,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "traversal.build",
                "ms": 6.1,
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
                "ms": 0.3,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.roots",
                "ms": 0.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "reconcile.apply",
                "ms": 0.5,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.dom",
                "ms": 0.2,
                "unseparated": false,
                "source": "hook",
                "structural": false,
                "structuralReason": null
              },
              {
                "id": "render.ssr",
                "ms": 0.2,
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
            "topLevelSpans": [
              {
                "index": 13,
                "stage": "snapshot.pull",
                "startMs": 11990,
                "endMs": 12043.600000023842
              },
              {
                "index": 14,
                "stage": "docheads.pull",
                "startMs": 12043.600000023842,
                "endMs": 12046.200000017881
              },
              {
                "index": 15,
                "stage": "traversal.build",
                "startMs": 12067.40000000596,
                "endMs": 12073.5
              },
              {
                "index": 16,
                "stage": "shared.decorate",
                "startMs": 12073.5,
                "endMs": 12073.800000011921
              },
              {
                "index": 17,
                "stage": "envelope.assemble",
                "startMs": 12073.800000011921,
                "endMs": 12074.100000023842
              },
              {
                "index": 18,
                "stage": "reconcile.roots",
                "startMs": 12074.100000023842,
                "endMs": 12074.300000011921
              },
              {
                "index": 21,
                "stage": "reconcile.apply",
                "startMs": 12074.300000011921,
                "endMs": 12074.800000011921
              }
            ],
            "sumOfSpansMs": 63.6,
            "sumOfSpansNotAccounted": true,
            "accountedMs": 63.6,
            "unaccountedMs": 21.2,
            "overlapMs": 0,
            "outsideMs": 0,
            "longTaskTotalMs": 0,
            "pass": true,
            "failReasons": []
          }
        ],
        "passCount": 3,
        "passKindSequence": [
          "pre-pass-render",
          "re-derive",
          "re-derive"
        ],
        "passOverlaps": [
          {
            "a": 0,
            "b": 1,
            "overlapMs": 98.1
          }
        ],
        "passLongTaskDoubleCountMs": 0,
        "nestingAmbiguities": [],
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
            "index": 0,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 25.4,
            "startMs": 9752.5,
            "endMs": 9777.90000000596,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 1,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 23.5,
            "startMs": 9777.90000000596,
            "endMs": 9801.40000000596,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 2,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 22.5,
            "startMs": 9802.600000023842,
            "endMs": 9825.100000023842,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 3,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 25.5,
            "startMs": 9825.100000023842,
            "endMs": 9850.600000023842,
            "depth": 1,
            "passIndex": 0,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 4,
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 121.7,
            "startMs": 9751.300000011921,
            "endMs": 9873,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:snapshot.pull:start",
            "endMark": "o0:snapshot.pull:end",
            "error": null
          },
          {
            "index": 5,
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.4,
            "startMs": 9873,
            "endMs": 9875.40000000596,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:docheads.pull:start",
            "endMark": "o0:docheads.pull:end",
            "error": null
          },
          {
            "index": 6,
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 5,
            "startMs": 9898.700000017881,
            "endMs": 9903.700000017881,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:traversal.build:start",
            "endMark": "o0:traversal.build:end",
            "error": null
          },
          {
            "index": 7,
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.3,
            "startMs": 9903.800000011921,
            "endMs": 9904.100000023842,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:shared.decorate:start",
            "endMark": "o0:shared.decorate:end",
            "error": null
          },
          {
            "index": 8,
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.4,
            "startMs": 9904.100000023842,
            "endMs": 9904.5,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:envelope.assemble:start",
            "endMark": "o0:envelope.assemble:end",
            "error": null
          },
          {
            "index": 9,
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 2.5,
            "startMs": 9904.600000023842,
            "endMs": 9907.100000023842,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.roots:start",
            "endMark": "o0:reconcile.roots:end",
            "error": null
          },
          {
            "index": 10,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 21.7,
            "startMs": 10268.100000023842,
            "endMs": 10289.800000011921,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 11,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 1695.4,
            "startMs": 10289.800000011921,
            "endMs": 11985.200000017881,
            "depth": 1,
            "passIndex": 1,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 12,
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 2078.1,
            "startMs": 9907.100000023842,
            "endMs": 11985.200000017881,
            "depth": 0,
            "passIndex": 1,
            "startMark": "o0:reconcile.apply:start",
            "endMark": "o0:reconcile.apply:end",
            "error": null
          },
          {
            "index": 13,
            "stage": "snapshot.pull",
            "instance": "renderer",
            "ms": 53.6,
            "startMs": 11990,
            "endMs": 12043.600000023842,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:snapshot.pull:start",
            "endMark": "o0:snapshot.pull:end",
            "error": null
          },
          {
            "index": 14,
            "stage": "docheads.pull",
            "instance": "renderer",
            "ms": 2.6,
            "startMs": 12043.600000023842,
            "endMs": 12046.200000017881,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:docheads.pull:start",
            "endMark": "o0:docheads.pull:end",
            "error": null
          },
          {
            "index": 15,
            "stage": "traversal.build",
            "instance": "renderer",
            "ms": 6.1,
            "startMs": 12067.40000000596,
            "endMs": 12073.5,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:traversal.build:start",
            "endMark": "o0:traversal.build:end",
            "error": null
          },
          {
            "index": 16,
            "stage": "shared.decorate",
            "instance": "renderer",
            "ms": 0.3,
            "startMs": 12073.5,
            "endMs": 12073.800000011921,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:shared.decorate:start",
            "endMark": "o0:shared.decorate:end",
            "error": null
          },
          {
            "index": 17,
            "stage": "envelope.assemble",
            "instance": "renderer",
            "ms": 0.3,
            "startMs": 12073.800000011921,
            "endMs": 12074.100000023842,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:envelope.assemble:start",
            "endMark": "o0:envelope.assemble:end",
            "error": null
          },
          {
            "index": 18,
            "stage": "reconcile.roots",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 12074.100000023842,
            "endMs": 12074.300000011921,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:reconcile.roots:start",
            "endMark": "o0:reconcile.roots:end",
            "error": null
          },
          {
            "index": 19,
            "stage": "render.dom",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 12074.40000000596,
            "endMs": 12074.600000023842,
            "depth": 1,
            "passIndex": 2,
            "startMark": "o0:render.dom:start",
            "endMark": "o0:render.dom:end",
            "error": null
          },
          {
            "index": 20,
            "stage": "render.ssr",
            "instance": "renderer",
            "ms": 0.2,
            "startMs": 12074.600000023842,
            "endMs": 12074.800000011921,
            "depth": 1,
            "passIndex": 2,
            "startMark": "o0:render.ssr:start",
            "endMark": "o0:render.ssr:end",
            "error": null
          },
          {
            "index": 21,
            "stage": "reconcile.apply",
            "instance": "renderer",
            "ms": 0.5,
            "startMs": 12074.300000011921,
            "endMs": 12074.800000011921,
            "depth": 0,
            "passIndex": 2,
            "startMark": "o0:reconcile.apply:start",
            "endMark": "o0:reconcile.apply:end",
            "error": null
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
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "windowMs": 2337.5,
        "accountedMs": 2274,
        "unaccountedMs": 63.5,
        "unaccountedReason": null,
        "unaccountedSource": "derived",
        "unaccountedAttributable": false,
        "overlapMs": 0,
        "outsideMs": 0,
        "passOverlapSumMs": 98.1,
        "bandExceeded": true,
        "passes": [
          {
            "index": 0,
            "kind": "pre-pass-render",
            "spanMs": 98.1,
            "accountedMs": 96.9,
            "unaccountedMs": 1.2,
            "longTaskTotalMs": 0
          },
          {
            "index": 1,
            "kind": "re-derive",
            "spanMs": 2233.9,
            "accountedMs": 2210.4,
            "unaccountedMs": 23.5,
            "longTaskTotalMs": 2115
          },
          {
            "index": 2,
            "kind": "re-derive",
            "spanMs": 84.8,
            "accountedMs": 63.6,
            "unaccountedMs": 21.2,
            "longTaskTotalMs": 0
          }
        ],
        "naiveSumResidualMs": -1874.4,
        "naiveSumResidualNote": "notAResidual",
        "sumMs": 4088.4,
        "toleranceMs": 50,
        "structuralStages": [
          "snapshot.clone"
        ],
        "openStructural": true,
        "reason": "unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
        "windowBoundToleranceMs": 40,
        "passTotalsMinusRowMs": -99,
        "passTotalsMinusRowNote": "notADoubleCount",
        "passRowUnaccountedDeltaMs": -17.6,
        "passRowUnaccountedDeltaNote": "notAMeasure",
        "bandExceededNote": "run o0-document-row-gpuon-r1: the row remainder 63.5 ms of the 2337.5 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)",
        "note": "run o0-document-row-gpuon-r1: the row remainder 63.5 ms of the 2337.5 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4); the DERIVED remainder is an accounting quantity, attributable:false, and is never a stage cost (§3.6b RUL-4 clause 5)",
        "outcomeReasons": [
          "run o0-document-row-gpuon-r1: the row remainder 63.5 ms of the 2337.5 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)"
        ]
      },
      "unseparatedStages": [
        "snapshot.clone",
        "post.style"
      ],
      "postStyle": {
        "ms": null,
        "timed": false,
        "source": "derived",
        "derived": true,
        "derivedNote": "post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)",
        "attributable": false,
        "residual": null,
        "retired": true,
        "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)",
        "unseparated": true
      },
      "notes": [
        "run o0-document-row-gpuon-r1: the row remainder 63.5 ms of the 2337.5 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)"
      ],
      "structuralReasons": [
        "stage snapshot.clone is structurally unseparated — no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured (§6 S14)"
      ],
      "structuralStages": [
        "snapshot.clone"
      ],
      "openStructural": true,
      "measurementShape": {
        "ok": true,
        "errors": [],
        "notes": [],
        "legacyShape": false,
        "legacyShapeReason": null,
        "failReasons": []
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
    "stage traversal.build is 662.9 ms of the 961 ms long task (68.98%) on folder-row — traversal.build is the largest identified stage",
    "the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read(s) totalling 88.9 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-folder-row-gpuon-r1: reconciliation OPEN-structural — unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-folder-row-gpuon-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "stage reconcile.apply is 2078.6 ms of the 2214 ms long task (93.88%) on document-row — reconcile.apply is the largest identified stage",
    "the document-row performed 2 whole-store IPC_RAG_SNAPSHOT read(s) totalling 175.3 ms (census 226 docs / 6102 nodes / 9266 edges)",
    "run o0-document-row-gpuon-r1: reconciliation OPEN-structural — unaccounted remainder: unseparated stage(s) snapshot.clone, post.style cannot be reconciled — STRUCTURAL (no seam in the executing bundle): [snapshot.clone]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)",
    "run o0-document-row-gpuon-r1: unseparated stages [snapshot.clone, post.style] (STRUCTURAL — no seam in the executing bundle: [snapshot.clone])",
    "O-0 REPORT OPEN — 2 stage(s) structurally unseparated (o0-folder-row-gpuon-r1:snapshot.clone, o0-document-row-gpuon-r1:snapshot.clone): run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4) — the report is SCHEMA-VALID and its residual cannot be computed; no value was imputed"
  ],
  "reconciliation": {
    "ok": false,
    "note": "structurally unseparated stage(s) o0-folder-row-gpuon-r1:snapshot.clone, o0-document-row-gpuon-r1:snapshot.clone have no seam in the executing bundle (run o0-folder-row-gpuon-r1: unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)), so the long-task residual is NOT computable and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)",
    "bandExceededNotes": [
      "o0-folder-row-gpuon-r1: run o0-folder-row-gpuon-r1: the row remainder 101.4 ms of the 1027.8 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)",
      "o0-document-row-gpuon-r1: run o0-document-row-gpuon-r1: the row remainder 63.5 ms of the 2337.5 ms measured window EXCEEDS the recorded 50 ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and attributable:false, never a stage cost (§2.1(iii)/§4.4)"
    ],
    "bandExceededGate": false,
    "measurementShapeFailures": [],
    "structuralStages": [
      "o0-folder-row-gpuon-r1:snapshot.clone",
      "o0-document-row-gpuon-r1:snapshot.clone"
    ]
  },
  "pass": false,
  "status": "OPEN-structural",
  "artifactPath": "/tmp/o0i-gpuon.json"
}
```

---
## 13. Provenance, the byte-exact round-trip and the per-row band

### 13.1 The driver's own recorded CLI invocation (both legs)

```json
{
  "gpu-off": ["--seed=/tmp/o0-corpus-226","--corpus-root=/tmp/o0-corpus-226","--strict-seed","--o0-corpus=226","--display=:0","--o0-out=/tmp/o0i-gpuoff.json","--block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism"],
  "gpu-on": ["--seed=/tmp/o0-corpus-226","--corpus-root=/tmp/o0-corpus-226","--strict-seed","--o0-corpus=226","--display=:0","--gpu","--o0-out=/tmp/o0i-gpuon.json","--block=o0_gpu_control,o0_repeat_determinism"]
}
```

### 13.2 The supersession table

| edition | date | renderer identity | verdict | status of this file |
| --- | --- | --- | --- | --- |
| first | 2026-09-17 | `1789680723588+675765+10d4bd9b` | stages 1-3 unseparated; `1698.82 %` window violation | SUPERSEDED |
| second | 2026-09-20 | `1789951042772+676469+a3e09c6a` | `selfValidation.ok:false` (24/12 schema errors) | SUPERSEDED |
| third | 2026-09-20/21 | `1789952537561+678270+a25b03a9` | pre-fix validator dropped post-derivation reasons | SUPERSEDED |
| fourth | 2026-09-21 | `1789969524598+678270+a25b03a9` | `OPEN-structural` / `ok:true` on the PRE-shape harness | SUPERSEDED |
| fifth | 2026-09-21 | `1789971492799+678367+3e3f1b80` | **`FAIL` / `ok:false`** (F5-1..F5-6) | SUPERSEDED |
| sixth | 2026-09-21 | `1789972671852+678367+3e3f1b80` / `1789972750760+678367+3e3f1b80` | `OPEN-structural` / `pass:false` / `ok:true` on the PRE-adversarial-fix harness | SUPERSEDED |
| seventh | 2026-09-21 | `1789974813483+678367+3e3f1b80` / `1789974856794+678367+3e3f1b80` | **`FAIL` / `pass:false` / `ok:false`** — the note clause unsatisfiable in the driver's order (`F7-1`) | SUPERSEDED |
| eighth | 2026-09-21 | `1789975949705+678367+3e3f1b80` / `1789975967064+678367+3e3f1b80` | `OPEN-structural` / `pass:false` / `ok:true` after the `F8-1` harness fix — **oracle identity NOT recorded** | SUPERSEDED |
| **ninth (this)** | **2026-09-21** | **`1789977178309+678367+3e3f1b80` / `1789977207408+678367+3e3f1b80`** | **`OPEN-structural` / `pass:false` / `ok:true` on 6/6 clean rows — the DEC-1-accepted form on the §3b-RE-AUDITED oracle (`92a74b7d`), with the new clauses exercised** | **CURRENT** |

### 13.3 The byte-exact round-trip verification (RUL-9)

Both fenced blocks in §12 are the legs' `--o0-out` files **byte-for-byte as written by the
driver**: the generator READS each file and embeds its content **unchanged** between the
fences (it never re-serializes the parsed object), then re-extracts both blocks and takes a
`sha256` + a byte comparison against the original. **Recorded result (measured by the
generator in this run):**

```text
GPU-OFF:  164414 bytes embedded / 164415 bytes original - the trailing newline is outside the fence; sha256[:16] of the embedded block 57a2ecfb508a4717; sha256[:16] of the original file 28a9538831557efd
GPU-OFF  byte comparison of the extracted block against its original (minus the trailing newline): true; JSON.parse of the extracted block deep-equals the original object: true
GPU-ON:  97672 bytes embedded / 97673 bytes original - the trailing newline is outside the fence; sha256[:16] of the embedded block 2e0d839a4c1da603; sha256[:16] of the original file 4449029705c88bfc
GPU-ON  byte comparison of the extracted block against its original (minus the trailing newline): true; JSON.parse of the extracted block deep-equals the original object: true
```
