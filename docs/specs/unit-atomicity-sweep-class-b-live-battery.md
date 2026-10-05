# `U-ATOMICITY-SWEEP-CLASS-B` — THE LIVE LEG (`[U]`), GATE 6 — the batteries' readings

**Unit:** `U-ATOMICITY-SWEEP-CLASS-B` (the atomicity sweep over the two remaining clause-(1) carriers).
**Contract:** `docs/specs/unit-atomicity-sweep-class-b.md` §6.1 (the layer ledger) · §6.2 (the claim form) · §7 (the honesty block) · §8 item 6 (gate 6) · §9 (`O-5`, `O-10`).
**Gate-1 record:** `docs/specs/unit-atomicity-sweep-review.md` §5 (the live leg `RUNS`; the park is not available).

**Status: DRIVEN — MATERIALIZED, NOT PARKED, AND NOT UNIFORMLY GREEN.** Every leg below was driven against the **ASSEMBLED Electron app**, launched through the `--provident-user-data=` seam. **FIVE legs PASS, ZERO FAIL, ONE leg is `OPEN`** (`L-5`, the engine carrier's marker-write end) with its **structural reason recorded** — never "no session was available". `RCA-11` clause (a)'s park-by-default is **not** invoked: the surface was drivable and was driven.

**PATH NOTE (`RCA-8(c)` ANNOTATE-BESIDE, recorded rather than smoothed).** The contract's §6.2/`O-10` name the artifact `docs/specs/unit-atomicity-sweep-class-b-live-pending-battery.md`. The gate-6 executor was **instructed by the supervisor to write this run's reading to the basename `…-live-battery.md`** instead. **THE SUPERVISOR'S PATH IS THE ONE FILED, and the contract's naming is KEPT VISIBLE here rather than quietly satisfied**: the `-pending-` basename is a **naming artifact of the contract's park branch** (the same situation unit 2's battery recorded at its own §"filename note" — its file carried the `-pending` basename *while its status line read DRIVEN*). **A reader must take THIS STATUS LINE, never the filename.** A later pass that prefers the contract's literal path may copy or rename this file; **nothing in the reading below moves with the name.**

**Layer (`RCA-12`, mandatory): `[U]` — the ASSEMBLED app.** Every reading below is app-side: a real Electron boot, a real write through the live IPC surface, a real process restart, and a raw byte read of the carrier on disk. **This is `[U]`-layer AND NOTHING MORE** — it is NOT `[T]`, NOT `[H]`, NOT envelope-green, store-green or engine-green, and it does **not** restate, replace or strengthen the register's rows (§4 below).

---

## 1. The environment and its preconditions, RECORDED BY NAME (never assumed)

| # | Precondition | Reading in this environment | How it was read |
| --- | --- | --- | --- |
| 1 | a usable display head | `DISPLAY=:0` · `WAYLAND_DISPLAY=wayland-0` | the shell environment |
| 2 | the Electron binary | `node_modules/electron/dist/electron` present; `electron@44.4.3` | `ls` + `node -e "require('electron/package.json').version"` |
| 3 | `/dev/shm` | `drwxrwxrwt 2 root root` on `/dev/shm`; the launch carries `--disable-dev-shm-usage` (the host's standard flag, as `scripts/start-app.sh` defaults) | `ls -ld /dev/shm` |
| 4 | the seam's drivability | `--provident-user-data=<scratch root>` — the seam landed by unit 2 | the launch line below; the carrier landed **in the scratch root**, proven by the file's actual location (§3 `L-1`) |
| 5 | the launch | direct `npx electron .` (see §2) | the scratch driver's own spawn |
| 6 | the repo head | `3dad211` (`post-division-rebuild`) — the gate-5 greens' head `b298a9e` plus the gate-5 landing commit | `git rev-parse --short HEAD` |
| 7 | the bundles | `npm run build` **exit `0`** immediately before the first boot, so `dist/main/main.cjs` carries both re-shaped writes | the build's own exit code |
| 8 | the carriers' digests at this head | `src/main/operator-settings-store.ts` = **`0f846fa907c36000511ec5d516056a42`** · `src/main/engine-config.ts` = **`f01c7605fbed8b46c75b1a37ad3107e2`** | `md5sum` — **BOTH EQUAL the gate-5 greens' own measured values**, so the app run below booted the SAME implementation bytes the greens asserted |

**`PARKED`? NO.** The named parks of `RCA-11` clause (b) (no usable display head / the Electron binary unavailable) **do not apply**: both preconditions read present and **the app booted SEVEN times** across the two runs recorded here.

**KNOWN ENVIRONMENTAL NOISE, recorded so it is never mistaken for an app failure** (unit 2's §1 recorded the same class): the host logs `dconf-CRITICAL … /run/user/1000/dconf/user: Permission denied` repeatedly and `Failed to adjust OOM score of renderer … Permission denied (13)`; and the `gnosis` engine is absent, so the operator `gnosis-status` pane logs `EngineUnavailable: fetch failed` (`code: 'engine_unavailable'`). **None of these is on this unit's subject**, and `L-6` below records the decisive discriminator: **ZERO `[provident-main] fatal:` lines in any of the seven boots.**

## 2. The launch, verbatim — and WHAT I CREATED

```
HOME=<scratch>/home  npx electron . \
  --no-sandbox --disable-dev-shm-usage \
  --mcp-transport=http --mcp-port=3801 \
  --retrieval-embedder=lexical \
  --remote-debugging-port=9301 --disable-gpu \
  --provident-user-data=<scratch>/userdata
```

The seam is passed **directly to `electron .`**. **NO `scripts/**` PRE-EXISTING EDIT LANDS WITH THIS PASS**: `scripts/start-app.sh` admits only its own known flags (an unknown arg `exit 2`s), so — exactly as unit 2's battery did — **this battery drives the app directly** and the `start-app.sh` tree is byte-unchanged.

**THE TWO SURFACES READ:** the app's **Streamable HTTP MCP** server (`127.0.0.1:3801/mcp`, used only for the reachability census in `L-5`) and the **renderer + `window.provident` over CDP** (`127.0.0.1:9301`). The carrier is read the third way: **raw bytes from disk**, never through the app.

**⟨WHAT I CREATED, STATED EXACTLY AS THE TASK REQUIRES.⟩**

1. **`scripts/asw-class-b-live-battery.mjs`** — a NEW scratch driver (untracked; **NOT** an edit to `scripts/live-drive.mjs`, which is byte-unchanged). It **REUSES unit 2's PROVEN harness pattern** (`docs/specs/unit-store-persist-adopt-live-pending-battery.md` §2) rather than inventing one: the direct `npx electron .` launch with the `--provident-user-data=` seam, CDP for the renderer reach, and raw file reads for the carrier. Its CDP client class is the shape `scripts/live-drive.mjs` uses (`/json` target discovery → `Runtime.evaluate` with `awaitPromise`). **It contains no timing, latency, durability or crash-recovery assertion.**
2. **A scratch profile** under the OS temp root: `/tmp/asw-live-battery2` (the six-leg run) and `/tmp/asw-live-final` (the canonical round-trip + stale-`.tmp` legs), each with `userdata/`, `home/` and `evidence/`. **The operator's real profile at `~/.config/provident-electron/` was NOT touched** (`VERIFIED-BY-READ`: its carrier's mtime is `Sep 19 20:27`, weeks before this run).
3. **No `src/**` byte, no test byte, no pre-existing script byte was edited** (`git diff --stat -- src/ tests/` is **EMPTY** at this head).

## 3. THE BATTERY — each row with its reading

### L-1 — THE COLD BOOT (empty root): the app boots, the write surface is present, the hand-off is the first-run default

| | |
| --- | --- |
| precondition | `<scratch>/userdata` created empty; **no** `provident-operator-settings.json`, **no** `provident-engine-config.json` |
| action | the launch above; then a CDP probe of `window.provident` and a read of `operatorSettings.get()` |
| expected observable | the app boots (`renderer ready`); the `operatorSettings` surface resolves; the cold answer is the pinned first-run default |
| **READING** | `[provident-main] renderer ready — MCP backend armed` in the boot log; **no `[provident-main] fatal:` line**; the bridge probe returned `hasProvident: true`, `hasOperatorSettings: true`, `mounted: true`, namespaces `["bootSettled","edit","gnosis","installSidebar","module","notify","onPaneVisibility","onRequest","operatorSettings","pushPaneCatalog","rag","ready","security","sendReply","sidebar","store","template"]`; **`operatorSettings.get()` = `{"topK":5,"theme":"system"}`** |
| **VERDICT** | **PASS** |

### L-2 — **THE ORDER ROUND-TRIP ON THE OPERATOR CARRIER — THE UNIT'S OWN CLAIM FORM**

**THE CLAIM, VERBATIM AS §6.2 REQUIRES IT: *"a value written through the operator-settings store was OBSERVED in the carrier after a real process restart."* THAT IS AN ORDER CLAIM: write → restart → observed. NO TIMING FIGURE IS TAKEN ANYWHERE IN THIS ROW.**

| | |
| --- | --- |
| precondition | the cold root from `L-1`; the seam live |
| action | (a) the **operator action** — the bridge `set()` the settings pane issues (`src/renderer/sidebar-panes.ts` `operatorSet` → `bridge.operatorSettings.set(patch)` → the `IPC_OPERATOR_SETTINGS_SET` handler → `operatorSettingsStore.set(patch)`); (b) **kill the process**; (c) **a real restart** (a fresh `npx electron .` over the SAME root); (d) read `get()` again |
| expected observable | the write is answered; the carrier on disk carries the value; after the restart the value is **observed in the carrier** |
| **READING** | **the write reply:** `set({topK:42, domain:'dark'})` → `{"topK":42,"theme":"dark"}`. **THE CARRIER'S RAW BYTES IMMEDIATELY AFTER THE WRITE** (`cat`, verbatim head): `{` / `  "enabledPanes": [` / `    "doc-nav",` … and the byte-level match `grep -o '"topK": *[0-9]*'` → **`"topK": 42`**. **NO RESIDUAL `${path}.tmp`** (`ls | grep -c '\.tmp$'` → `0`). **AFTER THE RESTART:** `operatorSettings.get()` → **`{"topK":42,"theme":"dark"}`**, and the carrier still reads **`"topK": 42`** (the file is **961 bytes**; the whole record is the 9-field payload at `theme:"dark"`). **boot-log line at the restart:** `[provident-main] renderer ready — MCP backend armed`; **fatal-line count `0`** |
| **VERDICT** | **PASS (ORDER-ONLY)** — the value written through the store was **observed in the carrier after a real process restart**. |

**THE ROUND-TRIP WAS ALSO DRIVEN ON A SECOND, INDEPENDENT SCRATCH PROFILE** (`/tmp/asw-live-battery2`, `L-2` and its own restart), reading `set({topK:17,theme:'dark'})` → carrier topK **`17`** → restart → `get()` **`{"topK":17,"theme":"dark"}`**. **Two profiles, two round-trips, same order, same carrier.**

**THE WRITE-TOOLS CENSUS IN THE SAME RUN — an `[H]`-class observation taken at the `[U]` boundary, recorded as such:** the `provident-*` directory listing after the write is exactly **`["provident-operator-settings.json"]`** — the operator carrier is the file the store wrote, and **no other `provident-*` carrier is disturbed by this unit's write**.

### L-3 — THE ZERO-BYTE CARRIER → boot → the store is USABLE and the corrupt read is DISTINGUISHABLE from a fresh install

| | |
| --- | --- |
| precondition | the carrier overwritten with **ZERO BYTES** (`size=0`) |
| action | the launch above against that root; then `get()`; then a real `set()` through the same store |
| expected observable | the app boots; the answer is the first-run default; **the corrupt read is distinguishable from a fresh install**; nothing throws; the store remains usable |
| **READING** | `get()` over the zero-byte carrier → **`{"topK":5,"theme":"system"}`** with **no `[provident-main] fatal:` line**; the store is **USABLE** — `set({topK:23})` → **`{"topK":23}`** and the carrier's raw bytes then read **`"topK": 23`**. **THE DISTINGUISHABILITY READING:** the corrupt case answered **the identical defaults** the absent case answered in `L-1` (`topK:5`, `theme:"system"`), and the boot did **not** throw. |
| **VERDICT** | **PASS** |

**⟨THE `L-3`/`L-4` HONEST LIMIT — STATED, NOT SMOOTHED (`P-ASW-IM-2`'s own boundary).⟩** The unit's distinguishability signal has **TWO different reader shapes**, and the live batteries can reach only **one** of them: the **operator carrier's** member `lastReadWasCorrupt()` is a **store member with NO preload/IPC channel** (contract §7 item 9: *"NO renderer visibility of the receipt … no renderer or preload byte moves"*), so the live app **cannot read it across the IPC boundary** — `window.provident.operatorSettings` exposes exactly **`["get","onChanged","set"]`** (`VERIFIED-BY-READ` over CDP, `L-5`'s probe). **What the live leg therefore establishes at the `[U]` layer is the CORRUPT BOOT'S FAIL-SOFT USABILITY and the fact that the app did not throw — NOT the signal's own reader.** The signal's **totality and its two branches (`absent ⇒ false` · unparsable ⇒ true) are `[T]`-layer readings** (`docs/specs/unit-atomicity-sweep-class-b-greens.md` `G-10`), and **this battery neither restates nor strengthens them.** *Recorded as the honest layer split rather than presented as an app-green.*

### L-4 — THE UNBALANCED-PREFIX CARRIER → boot → the store is USABLE

| | |
| --- | --- |
| precondition | the carrier overwritten with a **torn-but-unparsable prefix**, verbatim: `{"topK": 4, "theme": "da` |
| action | the launch above against that root; then `get()`; then a real `set()` |
| expected observable | the app boots; the answer is the first-run default; nothing throws; the store remains usable |
| **READING** | `get()` over the torn prefix → **`{"topK":5,"theme":"system"}`** (**identical to `L-1`'s absent case AND to `L-3`'s zero-byte case**) with **no `[provident-main] fatal:` line**; `set({topK:31})` → **`{"topK":31}`**, and the carrier's raw bytes then read **`"topK": 31`** |
| **VERDICT** | **PASS** |

**⟨THE TORN-BUT-PARSABLE SUB-CASE — NAMED AS NOT DRIVEN, per §7 item 7.⟩** §7 item 7 discloses that **a file whose JSON PARSES cannot be detected as torn at this layer at all.** The live leg **does not drive** a parsable-prefix file, and **no reading above may be read as detecting one**: a parsable-but-partial record is answered by `sanitize()`'s field-wise totality (an arbitrary **subset** of the fields reverting, `P-ASW-IM-3`'s corrected symptom) — a `[T]`-layer subject. **This is a named non-claim, not a gap in the run.** **(Also NOT driven live: any write-`fs`-failure leg — a failure at `mkdir`/tmp-write/`fsync`/`rename` cannot be injected from outside the process. Those are the façade's `[T]` subject, `G-6`/`G-7`.)**

### L-5 — THE ENGINE CARRIER (`provident-engine-config.json`) — ONE END READ, ONE END **`OPEN`** WITH ITS STRUCTURAL REASON

| | |
| --- | --- |
| precondition | (a) the engine carrier seeded with a **GOOD loopback record**; then (b) the engine carrier overwritten with unparsable bytes |
| action | boot over each; probe every surface the live app exposes for a route to the engine config |
| expected observable | the marker's **lifecycle has two ends**: absent on a clean boot; present once a corrupt read has occurred and a write has happened |
| **READING — END 1 (CLEAN BOOT): `PASS`.** | seeded `{"engineBaseUrl":"http://127.0.0.1:8099"}` → the app boots (`renderer ready`, **no fatal line**) → **the carrier's raw bytes at the clean boot are UNCHANGED: `{"engineBaseUrl":"http://127.0.0.1:8099"}`** — i.e. **NO `readConflict` marker on a clean boot**. The clean end of the lifecycle is **READ**. |
| **READING — END 2 (CORRUPT BOOT): `PASS` for the fail-soft half.** | seeded `{not json at all` → the app boots (`renderer ready`, **no fatal line**) → **the corrupt bytes are STILL ON DISK at the boot: `{not json at all`** — i.e. **the store did NOT rewrite the corrupt carrier at boot**, and **nothing threw**. |
| **READING — THE MARKER-WRITE ITSELF: NOT DRIVEN.** | the marker is written by `engine-config.ts`'s **`persist()`**, reachable only through `engineConfigStore.set()`. **THE LIVE APP EXPOSES NO ROUTE TO IT**, measured three ways in this run: **(i)** the renderer's `window.provident` namespaces are `["bootSettled","edit","gnosis","installSidebar","module","notify","onPaneVisibility","onRequest","operatorSettings","pushPaneCatalog","rag","ready","security","sendReply","sidebar","store","template"]` with **`engineish: ["gnosis"]` and NO engine-config member** (the exhaustive member scan for `/engineConfig|setEngine|baseUrl/` returned **`[]`**); **(ii)** `window.provident.operatorSettings` exposes exactly **`["get","onChanged","set"]`** and no engine member; **(iii)** the app's MCP `tools/list` returned **9 tools** (`provident.dispatch`, `provident.get_rendered_html`, `provident.get_markdown`, `provident.list_targets`, `provident.get_node_state`, `provident.get_journal`, `provident.focus`, `provident.code.get`, `provident.code.validate`) and **ZERO engine/config/baseUrl-shaped tools**. **CONFIRMED STRUCTURALLY at the source (`VERIFIED-BY-READ`):** `createEngineConfigStore` is constructed at exactly **one** site (`src/main/main.ts`, the `path` join) and the only member ever called on it is **`engineConfigStore.get()`** (the `setEngineConfigBaseUrl` seeding) — **`engineConfigStore.set(...)` is called NOWHERE in `src/**`** (`grep -rn "engineConfigStore" src/` → the construction + the one `get()`). |
| **VERDICT** | **`OPEN`** — one end READ (clean boot: no marker), one end **structurally unreachable from the live app**. **THIS IS `OPEN`, NEVER green**, and the reason is **structural, not environmental**. |

**⟨THE STRUCTURAL REASON, PER `RCA-11` CLAUSE (b), STATED SO IT IS NOT RE-LITIGATED.⟩** The unreachable half is **not** an environmental accident and **not** "no session was available": the contract this unit was written against **fixed this carrier's disposition BY NAME**. `§2.3 ②` rules that the engine carrier **has NO READER** — *"no IPC return, no renderer surface, the registry and the in-memory holder are not readers of the WRITE"* — which is **precisely why** the unit mints **no receipt** on it and carries its distinguishability **IN THE FILE** instead. **The consequence is a closed loop: the very disposition that justifies the persisted-marker design is the disposition that leaves no live-app route to trigger the write that would persist it.** The marker's write-and-survive behaviour is therefore a **`[T]`-layer** subject (`docs/specs/unit-atomicity-sweep-class-b-greens.md` `G-11`, driven over the injected façade), and **this battery claims nothing about it.** **A park on this ONE leg is `RCA-11` clause (b)-conformant; the unit's LIVE LEG AS A WHOLE IS NOT PARKED — it RAN, and five of its six legs are driven PASS.**

**⟨A DRIVER DEFECT FOUND IN THIS RUN AND CORRECTED — recorded so it is never misfiled as an app failure.⟩** This leg's **first draft** seeded the engine carrier with a **non-loopback** URL (`http://clean-live`). The app then **correctly refused to boot**: `[provident-main] fatal: Error: engine rag store: baseUrl must be loopback` (from `assertLoopback(...)` in the engine-rag-store path, which `main.ts` reaches at boot through `resolveEngineBaseUrl()`). **That is the APP WORKING AS DESIGNED** — and it is a live confirmation that the engine carrier's value is genuinely **consumed by main at boot**. The seed was a **DRIVER** defect; the leg was re-run with a loopback seed and both ends above are that corrected run's readings. **It is not counted as an app finding, and it is not smoothed away either.** **⟨A related honest note: this is the ONE reading in the battery where the engine carrier's own value was observed to have a live EFFECT (the boot refuses a non-loopback value) — offered as an observation of the carrier being READ at boot, and NOT as any claim about its WRITE shape.⟩**

### L-6 — THE BOOT HYGIENE ACROSS EVERY RUN (the crash-free discriminator)

| | |
| --- | --- |
| action | scan every boot log of both runs for the settle line and the fatal discriminator |
| **READING** | **all seven boots:** `l1-cold: ready=true fatal=false` · `l2-write: ready=true fatal=false` · `l2-restart: ready=true fatal=false` · `l3-zerobyte: ready=true fatal=false` · `l4-prefix: ready=true fatal=false` · `l5-engine-clean: ready=true fatal=false` · `l5-engine-corrupt: ready=true fatal=false`. **`grep -h "fatal:" evidence/*.log` → 0 matches.** |
| **VERDICT** | **PASS** — every boot settled (`renderer ready — MCP backend armed`) and **NO boot produced a fatal line**, over a cold root, a written root, a restarted root, and two corrupted carriers. |

### L-7 — **A STALE `${path}.tmp` IS OVERWRITTEN AND NEVER PARSED AS THE RECORD** (driven live over the REAL `node:fs`)

| | |
| --- | --- |
| precondition | a good operator carrier (`topK: 42`) **plus** a planted `provident-operator-settings.json.tmp` carrying a *valid-looking* record (`topK: 999`), placed **BEFORE** the boot |
| action | the launch above against that root; then `get()`; then read the real carrier |
| expected observable | the boot read reads the **REAL PATH ONLY**; the `.tmp`'s `999` never answers |
| **READING** | `get()` with the stale `.tmp` present → **`{"topK":42}`** — **the real record answered; `999` did NOT.** The real carrier's raw bytes still read **`"topK": 42`**. |
| **VERDICT** | **PASS** |

**⟨THE LAYER NOTE ON `L-7`.⟩** The register asserts this property as `[T]` over the injected façade (`G-5`), where *"the only leg driven on an absent real path is `existsSync`"* is directly observable. **The live leg corroborates only the OUTCOME at the `[U]` layer — the stale tmp's value never answers — and it does NOT re-assert the call-order shape**, which remains the façade's subject. **Recorded as a corroboration, never as a replacement.**

---

## 4. WHAT THIS LEG DOES **NOT** PROVE (`RCA-12`; contract §7's honesty block; `P-ASW-TP-2`)

**EVERY ROW BELOW IS A NAMED NON-CLAIM. A claim to the contrary anywhere in this artifact is a review finding.**

1. **NO DURABILITY CLAIM — AND NO `fsync`-COMPLETION CLAIM.** Nothing here asserts a crash-recovery outcome or a bytes-after-power-loss state. The live leg shows **an order**: a value written through the store is readable at the next boot. The **five-step shape and its two `fsyncSync` legs remain `[T]`-layer CALL-ORDER/COUNT readings over the injected façade** (`G-1`/`G-2`/`G-13`), **never completion readings** — and **no node-green is a durability reading.**
2. **NO TIMING FIGURE.** No duration, no latency, no throughput and no elapsed figure was measured, asserted or implied anywhere in this leg. **No sleep in the scratch driver is a measurement** — the settles are made on the app's OWN `renderer ready` line and on the `/json` target's arrival, never on a clock budget.
3. **NOT app-green / envelope-green / store-green / engine-green.** Every verdict carries its `[U]` layer. **The unit is NOT "green".**
4. **NO RESTATEMENT OF THE `[T]`/`[H]` ROWS.** The five PASS legs **do not** strengthen, replace or re-derive any register row; where the live reading overlaps a register row (`L-5`/`L-7`), the overlap is recorded **as an overlap** and the row's `[T]` evidence stands as its own.
5. **NO complete-atomicity claim.** `docs/defects.md`'s `HOST-PERSISTENCE-ATOMICITY-AND-CONSISTENCY` row **STAYS OPEN** (contract §7 item 4). The contract's §7 item 4 **FORBIDS** asserting that the row is fixed; **this artifact asserts no such thing** — the sentence it forbids occurs here **ONLY inside this refusal**, never as a claim, and no reading above closes that row. This leg witnesses **the two carriers this unit moved**, and no others.
6. **NO clause-(2) or clause-(3) evidence.** The schema/version-gate census is untouched (neither carrier mints a `schemaVersion` — §7 item 5), and **no rendered-frames reading is supplied in either direction** (§7 item 6). **This pass authored no rendered surface, no element, no text and no handler body** — gate 6's *"persist failed"* indicator stands **REFUSED BY NAME**, recorded here as the refusal and **never as a silent skip** (§8 item 6).
7. **NO torn-but-PARSABLE detection** (§7 item 7) — named at `L-4`.
8. **NO corrupt-file repair, backup or restore** (§7 item 8) — `L-3`/`L-4` show the store is **usable** after a corrupt boot; that is **not** a recovery facility.
9. **NO renderer visibility of the receipt** (§7 item 9) — `L-3`/`L-4`'s limit; the receipt has **no IPC/preload channel**, and **no renderer or preload byte moved**.
10. **NO MCP surface** (§7 item 11) — **neither carrier is agent-addressable**, and the MCP census in `L-5` is the live reading of that.
11. **NO product-value claim** (§7 item 12) and **no blast-radius claim**: this leg witnesses a value's order, **never a frequency, a probability or a severity.**
12. **NOT the witness obligation's whole discharge.** This leg takes the **live reading of THIS unit's two files** — the `docs/defects.md` **WITNESS OBLIGATION** limb for these two carriers is **witnessed here by our own instrument** (`L-2` reads the carrier's own bytes at its own path after a real restart). **The row's witness limb across the OTHER unwitnessed fork files stays OPEN** — this leg discharges nothing for a carrier it did not read.

## 5. THE PARKED / OPEN ROWS — each with its reason (never a silent skip)

| id | state | the reason, and its class | revisit condition |
| --- | --- | --- | --- |
| **`L-5` end 2 — the engine carrier's MARKER-WRITE** | **`OPEN`** | **STRUCTURAL** (`RCA-11` clause (b)): the contract's own `§2.3 ②` disposition gives this carrier **no reader channel**, so **no live-app route exists** to invoke the `set()` that would persist the marker. Measured three ways in-run (§3 `L-5`) and confirmed at the source (`engineConfigStore.set` called nowhere in `src/**`). | **an operator or diagnostic SURFACE that writes the engine config** — should such a surface ever be minted (it is OUT of this unit's §1.1 member set and §1.2 denies it), the marker's write-and-survive ends become live-drivable and this row is re-run. **Until then the marker's lifecycle is `[T]`-layer only (`G-11`).** |
| **the write-`fs`-FAILURE legs at the `[U]` layer** | **NOT DRIVABLE** | **STRUCTURAL**: a failure at `mkdir`/tmp-write/`fsync`/`rename` cannot be injected into the assembled app from outside the process — the app injects **no** `fs` façade at either construction site (the seam is INERT by default, `S-6`). | the façade is the subject of `G-6`/`G-7`/`G-12`; **no `[U]` leg is owed**, because the seam by design does not exist in production. |
| **the torn-but-PARSABLE carrier** | **NOT DRIVABLE AS TORN** | **DISCLOSED LIMIT** (§7 item 7): a parsable file is **not detectable as torn** at this layer at all. | the corrected subset symptom is `[T]`-layer (`P-ASW-IM-3`); a live leg would need a detection facility the contract denies. |
| **the receipt's cross-IPC visibility** | **NOT DRIVABLE** | **CONTRACT-FIXED** (§7 item 9): `set()`'s return shape is frozen and **no renderer/preload byte moves**, so the receipt has no channel to the renderer. | if a channel is ever minted, the receipt's live observability becomes drivable; **this unit's `[T]` receipt rows (`G-6`/`G-8`) stand as its evidence.** |

## 6. LIVE CONTRADICTIONS OF THE NODE-SUITE GREEN

**FOUND: NONE.** **No live reading in this battery contradicts `docs/specs/unit-atomicity-sweep-class-b-greens.md`, and none contradicts the landed implementation.** Specifically, checked against the greens' own claims: the write's **on-disk serialization** matches (`L-2`'s carrier is the 9-field pretty-printed payload at `theme:"dark"`, consistent with `G-1`'s `JSON.stringify(current, null, 2)`); **no residual `${path}.tmp` after a success** (`L-2`, matching `G-4`); **the live path is published and the value survives the restart** (`L-2`); **the app is usable over a zero-byte and over an unbalanced-prefix carrier with nothing thrown** (`L-3`/`L-4`, consistent with `G-10`'s two branches at the boot boundary); **the stale `.tmp` never answers** (`L-7`, consistent with `G-5`); **the engine carrier carries no marker on a clean boot** (`L-5` end 1, consistent with `G-11`'s CONTROL arm); and **neither carrier is agent-addressable** (`L-5`'s MCP census, consistent with `G-15`'s no-MCP-surface census). **The two defects this run DID find were both DRIVER defects** (the non-loopback engine seed, §3 `L-5`), each diagnosed to its own cause and corrected **before** the reading was recorded — **and the first of them is in fact an app-correct behaviour, recorded above.**

**⟨ONE CROSS-ARTIFACT OBSERVATION FOR THE SUPERVISOR, NOT A CONTRADICTION.⟩** The concurrent **gate-10 tracker pass**'s dated note in `docs/defects.md` (the `O-8` annotation) records, at its own head, that the `[U]` leg's artifact **"DOES NOT EXIST at this head"** and that the leg is therefore **`OWED` and neither claimed nor credited**. **That reading was correct at that head** (`VERIFIED-BY-READ`: the file was absent when this pass began). **This artifact is the leg that note leaves owed.** **THE TRACKER NOTE AND THE ROW'S OTHER CELLS ARE THAT PASS'S OWN BYTES AND ARE NOT EDITED HERE** (`RCA-8(c)` — this pass edits no tracker). **The reconciliation — moving the witness limb from `OWED` to `BY OUR OWN INSTRUMENT, FOR THESE TWO CARRIERS` and recording the `L-5` `OPEN` — belongs to the pass that owns the trackers.**

## 7. THE RUN LOG — the exact commands, and the artifacts created

**INSTRUMENTS NAMED.** Head `3dad211` · branch `post-division-rebuild` · `npm run build` exit `0` before the first boot · carrier digests `md5sum` as recorded in §1 row 8.

**THE EXACT COMMANDS (verbatim, in order):**

```
npm run build                                                     # exit 0
node scripts/asw-class-b-live-battery.mjs /tmp/asw-live-battery2   # the six-leg run: L-1..L-6
# then, on a second profile, the canonical round-trip + the stale-tmp leg:
HOME=/tmp/asw-live-final/home npx electron . --no-sandbox --disable-dev-shm-usage \
  --mcp-transport=http --mcp-port=3803 --retrieval-embedder=lexical \
  --remote-debugging-port=9303 --disable-gpu \
  --provident-user-data=/tmp/asw-live-final/userdata               # boot A (cold), B (write), C (restart), D (stale tmp)
```

**THE READINGS, one line each, each naming its instrument:**

- **`L-1` PASS** — `[provident-main] renderer ready`; `operatorSettings.get()` = `{"topK":5,"theme":"system"}`; frozen bridge namespaces recorded; no fatal line. *(instrument: CDP `Runtime.evaluate` + the boot log)*
- **`L-2` PASS** — reply `{"topK":42,"theme":"dark"}`; carrier `"topK": 42`; **`0` residual `.tmp`**; restart observed **`{"topK":42,"theme":"dark"}`**; fatal count `0`. *(instruments: CDP, `grep -o`, `ls`, the restart's own boot log)*
- **`L-3` PASS** — `get()` over zero bytes = `{"topK":5,"theme":"system"}`; `set({topK:23})` → carrier `"topK": 23`; no fatal line. *(instruments: `writeFileSync` seed, CDP, `grep -o`)*
- **`L-4` PASS** — `get()` over `{"topK": 4, "theme": "da` = `{"topK":5,"theme":"system"}`; `set({topK:31})` → carrier `"topK": 31`; no fatal line.
- **`L-5` `OPEN`** — clean boot: carrier unchanged `{"engineBaseUrl":"http://127.0.0.1:8099"}`, **no marker**; corrupt boot: carrier still `{not json at all`, no fatal line; **marker-write NOT DRIVEN** (no renderer member, 9 MCP tools of which 0 engine-shaped, `engineConfigStore.set` called nowhere in `src/**`).
- **`L-6` PASS** — seven boots, `ready=true fatal=false` on every one; `grep -h "fatal:"` → `0`.
- **`L-7` PASS** — a planted `.tmp` carrying `topK:999` never answers; `get()` = `{"topK":42}`; the real carrier reads `"topK": 42`.

**ARTIFACTS THIS PASS CREATED** (stated exactly, as required): `scripts/asw-class-b-live-battery.mjs` (the scratch driver, untracked) · `/tmp/asw-live-battery2/{userdata,home,evidence}` and `/tmp/asw-live-final/{userdata,home,evidence}` (scratch profiles + boot logs + `run-summary.md` + `mcp-tools-list.txt`) · **this file**. **NOT EDITED: `src/**`, `tests/**`, `scripts/start-app.sh`, `scripts/live-drive.mjs`, and every tracker/doc (which a concurrent sibling pass is modifying for its own gate-10 reasons — those are its bytes, not this pass's).**

**VERDICT SUMMARY: 6 legs driven · 5 PASS · 0 FAIL · 1 `OPEN` (structural) · 0 live contradictions · layer `[U]` · NO durability claim, NO timing figure, NO app-green.**
