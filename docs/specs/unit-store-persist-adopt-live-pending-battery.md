# `U-STORE-PERSIST-ADOPT` (core) — THE LIVE LEG (`C-8`, §8) — the boot round-trip battery

**Unit:** `U-STORE-PERSIST-ADOPT` (core; unit 2 of the store-adoption program, F2).
**Contract:** `docs/specs/unit-store-persist-adopt.md` §8 (`C-8`), §2.9 (the `--provident-user-data=` seam), §2.3 (the boot order), §2.7 (the carrier + the read-back recovery).
**Status:** **DRIVEN — MATERIALIZED, NOT PARKED.** `RCA-11` clause (a) forbids a UI-overhaul / drivable surface from parking on "no live session"; the assembly here **was** drivable in this environment, so the battery ran and its readings are recorded below.

**⟨THE FILENAME NOTE (`2026-10-05`, gate-7 proofreader, `RCA-8(c)` ANNOTATE-BESIDE, per the gate-5 greens' note: the basename `-live-pending-battery` reads as a park claim while this document's status is DRIVEN).⟩** **THE BASENAME IS CONTRACT-MANDATED, NOT A PARK CLAIM:** `docs/specs/unit-store-persist-adopt.md` §1.1 **member 9** names this exact path (`docs/specs/unit-store-persist-adopt-live-pending-battery.md`) as the live leg's landing site, and §8's park rule that name was minted under is CONDITIONAL — *"if the leg cannot run … it ships as `<this path>`, marked OPEN/live-pending — NEVER green/DONE"*. The leg DID run, so the file carries the same contract-mandated path with its status line reading **DRIVEN**. **The `-pending` basename is therefore a naming artifact of the contract's park branch, never a statement that this leg is parked** — a reader must take the status line (and §1's `PARKED? NO.` row), never the filename. **The path is NOT renamed here: member 9's citation is contract, and `RCA-8(c)` forbids rewriting an as-filed clause.**

**Layer (`RCA-12`, mandatory): `[U]` — the ASSEMBLED Electron app.** This is the ONE leg of the unit that is app-side. It is **not** a `[T]`/`[H]` reading, and the node trio nowhere implies it.

---

## 1. The environment and its preconditions, RECORDED BY NAME (never assumed)

| # | Precondition | Reading in this environment | How it was read |
| --- | --- | --- | --- |
| 1 | a usable display head | `DISPLAY=:0` · `WAYLAND_DISPLAY=wayland-0` | the shell environment, `env` |
| 2 | the Electron binary | `node_modules/electron/dist/electron` present; `electron@44.4.3` | `ls` + `require('electron/package.json').version` |
| 3 | `/dev/shm` | `drwxrwxrwt 2 root root` on `/dev/shm`; the launch therefore carries `--disable-dev-shm-usage` (the host's standard flag, also what `scripts/start-app.sh` defaults to) | `ls -ld /dev/shm` |
| 4 | the seam's drivability | `--provident-user-data=<controlled root>` — **this unit's own landing** (§2.9) | the launch line below |
| 5 | the launch | direct `npx electron .` (see §2) | the driver's own spawn |

**`PARKED`? NO.** The named parks of `RCA-11` clause (b) (no usable display head / the Electron binary unavailable) **do not apply**: both preconditions read present and the app booted three times.

**KNOWN ENVIRONMENTAL NOISE, recorded so it is never mistaken for an app failure:** the host logs `dconf-CRITICAL … /run/user/1000/dconf/user: Permission denied` and `Failed to adjust OOM score of renderer … Permission denied`; and the `gnosis` engine is absent, so the operator `gnosis-status` pane logs `EngineUnavailable: fetch failed` (`code: 'engine_unavailable'`). **None of these is on this unit's subject** — the boot settles (`[provident-main] renderer ready — MCP backend armed`) and no `[provident-main] fatal:` line appears in any of the three runs.

## 2. The launch, verbatim

```
HOME=<scratch>/home  npx electron . \
  --no-sandbox --disable-dev-shm-usage --mcp-transport=http --mcp-port=3799 \
  --retrieval-embedder=lexical --remote-debugging-port=9299 --disable-gpu \
  --provident-user-data=<scratch>/userdata
```

The seam is passed **directly to `electron .`**. **NO `scripts/**` EDIT LANDS WITH THIS UNIT**: `scripts/start-app.sh` admits only its own known flags (an unknown arg `exit 2`s), so the battery drives the app directly and the `scripts/**` tree is byte-unchanged (§1.2 item 9: "a `scripts/**` edit beyond what §8's live leg strictly needs" — none was needed).

The two surfaces the battery reads: the app's **Streamable HTTP MCP** server (`127.0.0.1:3799/mcp`) and the **renderer DOM + `window.provident`** over **CDP** (`127.0.0.1:9299`).

## 3. THE BATTERY — each row with its reading

### L-1 — THE COLD BOOT (empty root): the app boots, the `Y-1` answer is cold, NOTHING throws

| | |
| --- | --- |
| precondition | `<scratch>/userdata` created empty; **no** `provident-settings.json` |
| action | the launch above; then the renderer's `window.provident.store.get()` over CDP |
| expected observable | the app boots (`renderer ready`); the hand-off answers the registered defaults = the EMPTY record; no `fatal` line |
| **READING** | `[provident-main] renderer ready — MCP backend armed` in the boot log; `store.get()` answers `{ "handoff": [] }`; no `[provident-main] fatal:` line |
| **VERDICT** | **PASS** |

### L-2 — THE PERSISTED RE-BOOT: run 1 commits, run 2's hand-off answers the record

| | |
| --- | --- |
| precondition | run 1 boots against the empty controlled root (L-1); **run 2 boots against the SAME root** |
| action | run 1: `put({name:'file.settings.liveProbe', value: JSON.stringify({'file.settings.liveProbe':'L2-PERSISTED'})})` over CDP; run 2: the hand-off read again |
| expected observable | run 1 answers `{status:'committed'}`; the carrier on disk is the projected record with `schemaVersion: 1`; run 2's hand-off answers that record |
| **READING** | run 1 receipt `{ "status": "committed" }` · the carrier at `<scratch>/userdata/provident-settings.json` reads `{ "file.settings.liveProbe": "L2-PERSISTED", "schemaVersion": 1 }` · **no residual `.tmp`** · run 2's `store.get()` answers `{ handoff: [ { "name": "file.settings.liveProbe", "value": "L2-PERSISTED" } ] }` |
| **VERDICT** | **PASS** — the round trip crosses a REAL app restart, and the carrier is `provident-settings.json`, not the RAG-store family. |

**THE RECEIPT CLASSES DRIVEN IN THE SAME RUN — the `Y-2` contract at the assembled boundary:**

| driven payload | reading | rule |
| --- | --- | --- |
| `JSON.stringify({'mem.illegal': 1})` (a FOREIGN key, no `file.` prefix) | `{ "status": "refused", "reason": "malformed-payload" }` | §2.4's projection: `mem.*`/`temp.*`/`secure.*` never land in the file |
| `{ raw: true }` (NOT the stable-JSON translation — not a JSON string) | `{ "status": "refused", "reason": "malformed-payload" }` | §2.4 (1): the payload must be the JSON string |
| `JSON.stringify({'file.settings.liveProbe':'L2-PERSISTED'})` | `{ "status": "committed" }` | §2.4's committed class |

**Both refusals carry the CHANNEL's own closed token `malformed-payload`** — never a borrowed store token, never a throw, never a third status (§2.4 / §2.7 item 7; `K-1`; `F-10`). The `store` sub-namespace read over CDP is exactly `{get, put, onFileChanged}` (all three `typeof 'function'`), matching §2.5 verbatim.

### L-3 — THE BOOT-ORDER ROW: an ORDER reading from the stamps, NEVER a timing figure

| | |
| --- | --- |
| precondition | the app booted; the `--provident-user-data=` seam is live |
| action | a CDP read of the boot's own effects after the boot settled |
| expected observable | the hand-off was ANSWERED before the first envelope pair; the app graph is mounted |
| **READING** | the renderer reads `mounted: true` (`#app` present) · `landing: true` (`#stage-landing`) · `frames: 2` (`.pane-frame`) · `zones: 9` (`[data-zone]`) · `storeResolved: true` — i.e. the `store.get` surface resolved and the first envelope FOLLOWED it |
| **VERDICT** | **PASS (ORDER-ONLY)** |

**THE NO-TIMING CLAUSE (`F-13`), RESTATED.** **No duration, no timestamp and no elapsed figure was measured, asserted, printed or implied anywhere in this leg.** The declared ORDER evidence for this unit remains `P-SPA-H-2`'s node-side sequence recorder (`[H]` ORDER-ONLY, red-by-shim until a real main-process leg exists — the supervisor's `A-TW-1` ④); this live row is an **assembly-level corroboration of the order**, never a timing claim.

### L-4 — THE CORRUPT-CARRIER BOOT: the registered defaults, never a throw

| | |
| --- | --- |
| precondition | the controlled root's carrier overwritten with unparsable bytes: `{ this is NOT json` |
| action | the launch above against that root, then the hand-off read |
| expected observable | the app boots; the hand-off answers the registered defaults (`[]`); no `fatal` line |
| **READING** | `[provident-main] renderer ready — MCP backend armed`; **no `[provident-main] fatal:` line**; `store.get()` answers `{ handoff: [] }` |
| **VERDICT** | **PASS** — §2.7 item 2's read-back recovery, at the assembled boundary |

## 4. WHAT THIS LEG DOES **NOT** PROVE (`RCA-12`; §6's honesty block)

- **NO DURABILITY CLAIM.** The live leg shows a committed write is readable at the next boot; it **does not** prove a crash-safety or power-loss outcome, and **no `fsync` leg is verified here or anywhere**. The atomic five-step shape remains SHAPE-asserted over the injected fs façade (`P-SPA-IM-2`), and **no node-green is a durability reading** (`C-6`; `F-12`).
- It is not `[T]`/`[H]` evidence: it does not restate, replace or strengthen the register's rows.
- It proves **nothing** about the store module's own behavior beyond the crossing's wire (the store's register is the store's).
- It proves **nothing** about any other carrier (the module store, the operator-settings file, the RAG stores, the engine config, the vector cache) — every one of those is a named successor's or an existing owner's (§2.8 classes B/C).
- **NO MCP SURFACE.** Every read here went over CDP or the existing HTTP MCP transport; **no MCP tool, group, resource or `RpcMethod` was added** for the store (`§1.2` item 4).

## 5. The seam's honest divergence record (`§2.9`, owed)

**The fork had NEITHER the `--provident-user-data=` seam NOR `scripts/electron-ui.mjs` at this unit's pre-edit head** (`VERIFIED-BY-READ`). **This unit ADDS the seam** — it is this unit's OWN landing, not an inherited one, and **no foundation figure is adopted for it**. The seam is a test-drivability affordance, never an operator surface: its domain is a non-empty absolute path, and an empty or relative value is IGNORED with a logged warning, never a throw and never a partial application.
