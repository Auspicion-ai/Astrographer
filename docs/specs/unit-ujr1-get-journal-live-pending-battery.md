# Unit U-JR1 — Read-Only MCP Tool `provident.get_journal`: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent).
- **Date:** 2026-09-12.
- **Source contract:** `docs/specs/unit-ujr1-get-journal.md` (DRAFT 2026-09-12,
  re-reconciled engine-faithful reading; §2.1/§2.2/§2.3, §3.1–§3.7, §4 F1–F6,
  §5.7 property register P-IM-1/2/3, P-SM-1, P-TP-1, §5.8 census).
- **Greens battery (blind-test, docs-only, already run against the LIVE MODULE):**
  `docs/specs/unit-ujr1-get-journal-greens.md` — **22 scenarios PASS, 0 FAIL** (11
  §3 states + 6 §4 fail-states + 5 §5.7 register invariants; recorded in the run
  file `tests/blind-unit-ujr1-get-journal-greens.test.ts`, **24 vitest `it` blocks,
  Duration 473ms**). Source under test (module seam): `src/renderer/runtime.js`
  (`Runtime.prototype.journalEntries` → `this.supervisor.journalEntries(opts)` over
  a real `Supervisor`, provident-ssr@0.5.0), `src/renderer/renderer.ts`
  (`case 'journalEntries'` RPC routing + `MUTATING_METHODS` negative),
  `src/main/security.js` (`groupForTool`/`TOOL_GROUPS`/`SecurityGate`),
  `src/main/mcp-server.ts` (`ProvidentMcpServer.ALL_TOOLS` + group-gated
  registration + the SDK tool's `backend.invoke('journalEntries', args)`),
  `src/shared/types.ts` (`RpcMethod` gains `'journalEntries'`).
- **Status:** **PARKED — NOT run against the live application.** Pattern
  precedent: `docs/specs/unit-a2-document-crud-wiring-live-pending-battery.md` /
  `docs/specs/unit-gn-mcp-ui-wiring-live-pending-battery.md` (the same
  surface-absence park shape). This battery is the handoff for a LATER iteration
  of the live-scenario runner, to be executed once the **Astrographer
  Provident-Electron app is running** exposing `provident.get_journal` over the
  MCP surface. **NOTE (2026-09-13):** the gate-6 HOST fix now lets the headless
  battery host serve `journalEntries` too (§0.2 FIXED + regression-tested), so
  the battery-host live surface is ready; the **real-app** live scenarios still
  require a running app session.

> **PARKED IS NOT A FAILURE.** The module seam is green (22/22 against the live
> modules); the park is a **live-surface absence**, not a regression.

---

## 0. LIVE-SURFACE ASSESSMENT (verified live 2026-09-12)

Probed before parking — this is the current, documented state of the live
surface:

### 0.1 The real Electron app is NOT running (primary surface absent)

- `ps aux | grep -i electron|node|astrographer|provident|battery-host` → **no
  Astrographer/Provident-Electron app process** (the only Electron process is an
  unrelated Discord crashpad handler).
- `curl -s http://127.0.0.1:3787/mcp` → **`000`/connection refused** (no
  Streamable-HTTP MCP listener; the default HTTP MCP port per `scripts/start-app.sh`).
- `ss -ltnp` → no listener on 3787 (the MCP port); only unrelated ports
  (3080, 35433).
- `DISPLAY=:0`, `WAYLAND_DISPLAY=wayland-0` are set (a GUI session exists), but
  no app window/process is up.

**Conclusion (2026-09-13):** the **real-app** live surface required to exercise
`provident.get_journal` on a running app instance (with the `read` group
default-ON) is **not available** this pass — the ONLY remaining park driver
(the battery-host `journalEntries` gap in §0.2 is now **FIXED**).

### 0.2 The battery host — `RuntimeBackend` did NOT route `journalEntries` (gate-6 HOST finding) — **FIXED + regression-tested (2026-09-13)**

> **UPDATE (2026-09-13):** the gate-6 HOST fix has LANDED. `src/main/battery-host.ts`
> `RuntimeBackend.invoke` now has `case 'journalEntries': return
> this.runtime.journalEntries(p)` (lines 67–68); the class is exported
> (`export class RuntimeBackend`) and the MCP server auto-start is guarded
> main-only (`isBatteryHostMain()`). The HOST-BATTERY regression
> (`tests/unit-ujr1-get-journal.test.ts`) drives a real `RuntimeBackend` and
> asserts the tool resolves to a real `JournalView`. **The battery host is no
> longer a `unknown method: journalEntries` surface** — it can serve the tool.
> The park below is now the REAL-APP live-surface absence only (see §1).

**Original finding (2026-09-12, historical — FIXED):**

- `node dist/main/battery-host.mjs` (with the MCP SDK client,
  `--target battery`) **connected and `tools/list` registered BOTH
  `provident.get_journal` AND `provident.dispatch`**.
- **Calling `provident.get_journal {}` on the battery host returned the string
  `"unknown method: journalEntries"`** — the tool was **advertised but NOT
  callable** on the battery host.
- **Root cause (host-side, `src/main/battery-host.ts`, `RuntimeBackend.invoke`):
  the switch had NO `case 'journalEntries'`** — it listed `dispatch`, `renderedHtml`,
  `markdown`, `listTargets`, `nodeState`, `load`, `op`, `export`, `validate`,
  `teardown`, `journal`, `code.*`, but **journalEntries fell through to the
  `default: throw new Error('unknown method: …')`**. The battery-host backend was
  never extended for the U-JR1 seam.
- **Contrast — the real-app routing path existed:** `src/renderer/renderer.ts`
  has `case 'journalEntries': value = runtime.journalEntries(req.payload)`, and
  `src/main/mcp-server.ts:2224-2238` registers the tool with
  `const value = await backend.invoke('journalEntries', args)`; the renderer RPC
  route is the real-app path. The `unknown method` failure was **specific to the
  headless battery host**, whose `RuntimeBackend` bypasses the renderer RPC seam
  and forwards straight to the Runtime — and so was missing the new method.
- **Resolution:** the supervisor approved the HOST fix (the battery host IS an
  in-scope live surface), so `battery-host.ts` gained the `journalEntries` case;
  see the UPDATE above. The park is now a **real-app surface absence only**.

---

## 1. Why this battery is parked

The U-JR1 unit's live scenarios require the **Astrographer Provident-Electron app
to be running** so `provident.get_journal` can be exercised over the live MCP
surface (`provident.get_journal` and `provident.dispatch` for the applied-edit
setup, then `provident.get_journal`) and the returned `JournalView` verified
against the greens. The tool is an **MCP-tool seam over the Electron runtime**;
the unit's own scope (§2.2) is to wire host seams, and the spec's contract is
proved by the module greens. The park is a **real-app surface-absence park**,
verified live (§0.1): no app session. **The battery-host `journalEntries` gap is
CLOSED (2026-09-13)** — §0.2's finding is FIXED + regression-tested, so the
headless battery now serves the tool; the remaining park is the absence of the
**running Astrographer Electron app** (the primary §0.1 surface).

---

## 2. The live surfaces that WILL exercise the U-JR1 behavior (after the revisit condition)

| Live surface | U-JR1 behavior it exposes | How to drive it live |
| --- | --- | --- |
| A running Astrographer Provident-Electron app (MCP server on `127.0.0.1:3787`, `read` group default-ON) | `provident.get_journal` returning the engine's `JournalView`: empty shape; after an applied `provident.dispatch` the default window shows `[{index:0,…}]`; `afterIndex`/`limit` clamp behavior; the group gate (read disabled → tool absent/refused) | `tools/call` on `provident.get_journal` (and `provident.dispatch`) through the running app's MCP transport — e.g. `node scripts/mcp-cli.mjs --target http --port 3787 <cmd>` or a StreamableHTTP MCP client at `http://127.0.0.1:3787/mcp` |
| The headless battery host — `RuntimeBackend` NOW routes `journalEntries` (§0.2 FIXED 2026-09-13) | The same `JournalView` surface over the headless stdio host | `node dist/main/battery-host.mjs` (+ MCP SDK stdio client); `tools/call` / `listTools` |

**Prerequisites for the later run (MANDATORY):**

1. **The app must be running.** Launch via `bash scripts/start-app.sh`
   (default MCP HTTP port `127.0.0.1:3787`; `--no-sandbox` and
   `--disable-dev-shm-usage` are the defaults on this host because the SUID
   chrome-sandbox helper is misconfigured and `/dev/shm` is not writable —
   see the `scripts/start-app.sh` header). Alternatively a plain
   `npm run build && electron . --mcp-transport=http`.
2. The **`read` group must be default-ON** (`groupForTool('provident.get_journal')
   === 'read'`; `defaultSecurityConfig().enabled` includes `'read'`). No manual
   security un-locking needed — `read` is default-enabled.
3. **The MCP surface must be reachable:** `curl -s http://127.0.0.1:3787/mcp`
   must not be `000`, and `tools/list` must include `provident.get_journal`.
   (The battery host already routes `journalEntries` — §0.2 finding FIXED
   2026-09-13 — so a `node dist/main/battery-host.mjs` target is usable as-is.)

**The check that ends the park:**

- The **real-app** live scenarios end the park when the Astrographer app is
  running AND `curl -s http://127.0.0.1:3787/mcp` responds AND `tools/list`
  returns `provident.get_journal` AND a `provident.get_journal {}` call returns
  a real `JournalView`. (Re-run the §3 probes against the app, §2 table row 1.)
- **Battery-host surface (now ready, §0.2 FIXED):** `node dist/main/battery-host.mjs`
  `tools/list` returns `provident.get_journal` AND `provident.get_journal {}`
  returns a real `JournalView` — so the headless-host scenarios in §2 row 2 can
  run now without a fix. The real-app scenarios remain PARKED until a running
  app session.

---

## 3. The concrete live probes to run once the app is up

The "expected" column re-expresses the greens/spec expectation as a live
observable. **A live result that CONTRADICTS the greens or the spec is a FINDING
(a regression or a doc/spec drift) — never a pass.**

> **MCP drive commands.** The exact drive path is the MCP `tools/call` /
> `listTools` surface through the running app (or a correct battery host).
> Example using `scripts/mcp-cli.mjs` once a `journalEntries` command exists (it
> does NOT today — the CLI enumerates its own fixed command set and has no
> `get_journal`; use a raw StreamableHTTP/stdio MCP `tools/call`), or any MCP
> client:
> - `listTools` → assert `provident.get_journal` present (default `read` group).
> - `provident.get_journal {}` → the empty shape (S1/F1/F4).
> - `provident.dispatch {…}` (a synthetic event that applies a `state-slice` on a
>   target node) then `provident.get_journal {}` → after-edit default window (S2
>   / F4).
> - `provident.get_journal {afterIndex, limit}` with the §3.3/§3.4 probes →
>   clamp/head-trim (S3a/S3b/S4a/S4b/PB2).
> - Re-invoke `provident.get_journal` repeatedly → identical (S6a/PB1/PB3).
> - Group gate: with `read` disabled → the tool is absent from `listTools` /
>   refused (S7a/S7b).

### 3.0 P0 — the live endpoint must be reachable (proves the surface is live)

| Step | Expected |
| --- | --- |
| `curl -s http://127.0.0.1:3787/mcp` (StreamableHTTP) | Not `000`; responds (a POST/initialize handshake, not a connection failure). If refused/`000`, the app is not live ⇒ re-park. |
| `tools/list` via an MCP client | Includes `provident.get_journal` (and `provident.dispatch`). |

### 3.1 Class L1 — §3 valid-path states (greens S1–S7)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **S1** / F1 | `provident.get_journal {}` on a fresh (no-dispatch) session | `entries: []`, `undoDepth 0`, `redoDepth 0`, `basePresent false`, `undoBaseBoundary false`, `fromIndex 0`, `totalEntries 0`, `truncated false`; both top-kind keys + `maxJournalLength` omitted; never throws. |
| **S2** / F4 | One applied `provident.dispatch` (a `state-slice` on a counter node), then `provident.get_journal {}` | `undoDepth 1`, `undoTopKind 'state-slice'`, `redoTopKind` omitted; default window shows the applied row `entries:[{index:0,kind,status}]`, `fromIndex 0`, `truncated false`; `afterIndex:0` also shows it. |
| **S3a** | 5 seeded edits; `provident.get_journal {afterIndex:2, limit:2}`, `{afterIndex:100}`, `{afterIndex:-5}` | `afterIndex 2 → fromIndex 2`, indices `[2,3]`, length 2, `totalEntries 5`; `afterIndex 100 → fromIndex 5` (clamped), `entries: []`; `afterIndex -5 → fromIndex 0`. |
| **S3b** / F2 | 5 edits; `{afterIndex:0, limit:0}`, `{afterIndex:0, limit:999999}` | `limit 0 → entries.length ≤ 1` (clamped to 1); `limit 999999 → entries.length === totalEntries (5)`, never > 1000. |
| **S4a** | 501 edits (default `limit:500`); `provident.get_journal {}` | `totalEntries 501`, `entries.length 500`, `totalEntries > entries.length`, `fromIndex > 0`, `truncated true`. |
| **S4b** / PB2 | 5 edits; `{limit:3}` (the canonical counterexample) | `fromIndex 2`, indices `[2,3,4]`, `totalEntries 5`, `truncated true`. |
| **S5** / F3 | A `maxJournalLength:3` Runtime; 40 seeded edits; `provident.get_journal {}` | `basePresent true`; a `base` entry visible (`{index:0,kind:'base',status:'base'}`); at the floor `undoDepth 0`, `undoBaseBoundary true`. |
| **S6a** / PB1 / PB3 | 3 edits; `provident.get_journal` before/after 5 further calls | `undoDepth`/`redoDepth`/`basePresent` and the `entries` snapshot IDENTICAL (no drain/mutation). |
| **S6b** | A `journalEntries` RPC through the renderer route→reply→notify seam | `dispatch` emits ZERO `app-graph-changed`; `journalEntries` routes to `runtime.journalEntries`, replies ok, emits ZERO `app-graph-changed`, returns the real engine rows. |
| **S7a** | Default gate: `groupForTool('provident.get_journal')`, `defaultSecurityConfig().enabled`, `toolAllowed(['read','dispatch'])` | `groupForTool 'read'`; `read`/`dispatch` default-enabled; the tool allowed; `tools/list` includes it. |
| **S7b** | `SecurityGate().apply({disable:['read']})`; `ProvidentMcpServer` under that gate | `toolAllowed('provident.get_journal') === false`; `allowedToolNames()` does NOT include it when `read` off, DOES when on. |

### 3.2 Class L2 — §4 fail-states (greens F1–F6)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **F1** | `provident.get_journal {}` on a fresh + a post-`load`-empty Runtime | the §3.1 empty shape both times; never throws. |
| **F2** | `provident.get_journal` with `{afterIndex:-5,limit:-3}`, `{afterIndex:100000,limit:999999}`, `{afterIndex:0,limit:0}`, `{limit:'big'}`, `{afterIndex:1.5,limit:2}`, `{}` on a 5-edit journal | NONE throws; `afterIndex` clamped `[0,total]` (neg→0, over→total); `limit` clamped `[1,1000]`; journal NOT drained (`undoDepth` unchanged). |
| **F3** | the S5 condensed Runtime; `provident.get_journal {}` | `basePresent true` + a `{kind:'base'}` entry visible; consumer distinguishes via `kind`/`basePresent`. |
| **F4** | after an applied `state-slice`, `provident.get_journal` synchronously | returns a plain (non-thenable) `JournalView` immediately, not a Promise; reflects the applied op (`undoDepth 1`, `entries[0]` the applied row); no flush/interleave. |
| **F5** | `JSON.stringify(provident.get_journal)` then `JSON.parse`; inspect every `entries` row's key set | round-trips losslessly; every row carries EXACTLY `{index,kind,status}` (no extra keys); serialized JSON contains no `snapshot`/`dirtied`/`node`/`nodeId`/`id`/`op` payload keys. |
| **F6** | `provident.get_journal {afterIndex:0,limit:3,foo:'bar',bogus:123,token:'x',tls:{},extra:[1,2]}` vs `{afterIndex:0,limit:3}` on a 4-edit journal | identical window (`entries`/`fromIndex`/`totalEntries`); never throws. |

### 3.3 Class L3 — §5.7 property-register invariants (greens PB1–PB5)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **PB1** (P-IM-1) | 3 edits; two immediate `provident.get_journal` calls | two deep-equal `JournalView`s (equal `entries`,`fromIndex`,`totalEntries`,`truncated`,`undoDepth`,`redoDepth`,`basePresent`,`undoBaseBoundary` + identical key-set presence). |
| **PB2** (P-IM-2) | 5 edits; `limit ∉ {1,3,6,500,1000}` with no `afterIndex`; and `afterIndex ∉ {0,2,5,100,-1}` | `fromIndex === max(0,min(total,cursorIndex+50)−limit)` (no-`afterIndex`); `fromIndex ∉ 0 ⟺ min(total,cursor+50) > limit`; with `afterIndex`, `fromIndex === clamp(afterIndex,0,total)`; `entries.length ≤ limit` always; the 5/`limit:3` counterexample (`fromIndex 2`,`truncated true`); empty journal → `entries:[]`. |
| **PB3** (P-IM-3) | 3 edits; 10 `provident.get_journal` calls; state captured before/after; live `MUTATING_METHODS` literal checked | post-call state identical; `'journalEntries'` NOT in `MUTATING_METHODS` (with the S6b notify probe: a `journalEntries` RPC emits zero `app-graph-changed`). |
| **PB4** (P-SM-1) | empty; 1 edit; `journal('undo')`; `journal('redo')`; condensed-base Runtime | `undoTopKind` present ⟺ `undoDepth > 0`; `redoTopKind` present ⟺ `redoDepth > 0`; `basePresent` ⟺ a `base`-kind entry in the window; `undoBaseBoundary true` only at the floor. |
| **PB5** (P-TP-1) | `groupForTool`; `ALL_TOOLS`; the LIVE renderer/mcp-server/shared-types source | `groupForTool 'read'`; `ALL_TOOLS` includes `provident.get_journal` (census 59); renderer `case` routes → `runtime.journalEntries` and ∉ `MUTATING_METHODS`; SDK handler invokes `backend.invoke('journalEntries', args)`; `RpcMethod` includes `'journalEntries'`; registers under the default read group. |

---

## 4. Parked-scenario census

- **Total greens scenario rows:** 22 (11 §3 states + 6 §4 fail-states + 5 §5.7
  register — all PASS at the module level, `docs/specs/unit-ujr1-get-journal-greens.md`).
- **Parked for the later live run (require the running app's MCP surface):**
  **S1, S2, S3a, S3b, S4a, S4b, S5, S6a, S6b, S7a, S7b** (11), **F1–F6** (6),
  **PB1–PB5** (5) = **22 scenario ids.**
- **Run live this iteration: 0** (the real app is not running).
- **Not a failure:** the module is green (22/22); the park is a **real-app
  live-surface absence** (no app session) — the §0.2 battery-host `journalEntries`
  routing gap is **FIXED + regression-tested (2026-09-13)** — NOT a module
  regression.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** the **Astrographer
   Provident-Electron app is running** (`bash scripts/start-app.sh`; MCP HTTP on
   `127.0.0.1:3787`) exposing `provident.get_journal` over the MCP surface with
   the default `read` group. The live check that ends the park:
   `curl -s http://127.0.0.1:3787/mcp` is not `000` AND `tools/list` includes
   `provident.get_journal` AND a `provident.get_journal {}` call returns a real
   `JournalView`. (The battery host already routes `journalEntries` — §0.2
   FIXED — so the headless-host probes can run without a fix.)
2. **P0 first:** re-run the §3.0 reachability probe. If refused/`000` (app not
   up) → re-park.
3. **§0.2 battery-host finding — CLOSED (2026-09-13):** the gate-6 HOST fix
   granted `case 'journalEntries': return this.runtime.journalEntries(p)` to
   `RuntimeBackend.invoke` (`src/main/battery-host.ts`, lines 67–68), exported
   `RuntimeBackend`, and guarded the server auto-start main-only. The HOST-BATTERY
   regression test drives a real `RuntimeBackend`. The battery host now serves the
   tool — no escalation needed. The remaining park is the **real-app** live
   surface (a running app session).
4. **Launch path:** `bash scripts/start-app.sh` (defaults already fit this host:
   `--no-sandbox`, `--disable-dev-shm-usage`, MCP port 3787). Or
   `npm run build && electron . --mcp-transport=http`. The `read` group is
   default-ON (no manual unlock).
5. **MCP drive:** use the running app's Streamable-HTTP MCP at
   `http://127.0.0.1:3787/mcp` (`tools/call`/`listTools`), or any MCP client.
   `scripts/mcp-cli.mjs` does NOT have a `get_journal` command today — drive via
   a raw MCP `tools/call` (see §3 header for the exact sequences). `provident.dispatch`
   (with a valid target/event/args) sets up the applied edit for S2/F4; confirm the
   `dispatch` positive control (one `app-graph-changed`) vs the `journalEntries`
   zero-emit for S6b.
6. **A live result that CONTRADICTS the greens or the spec is a FINDING** (a real
   regression or a doc/spec drift) — never a pass. Report it to the supervisor,
   giving the observed `JournalView`/error against the expected shape.
7. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec section numbers and the live tool list — new tools may
   have landed). The §0.2 finding is **FIXED (2026-09-13)** — its status stays
   CLOSED; see the trackers (`docs/next-steps.md`, `docs/pending.md`,
   `docs/defects.md`).

## STATUS 2026-09-15 — CLOSED (PASS, live)
Un-parked and run against the running app (lexical, seeded alpha+beta). Command:
`node scripts/live-drive.mjs --mode=lexical --display=0 --block=ujr1_journal,v1_adjacency,v2_scoped,v3_docnav,x_flat,ms_store,shell_wiring,shell7,shell_integration,import1`
`provident.get_journal {}` → a real `JournalView`: `entries:[{index,kind:"destroy",status:"applied"} x15], fromIndex:0, totalEntries:15, truncated:false, undoDepth:15, redoDepth:0, basePresent:false, undoTopKind:\"destroy\""` — never throws. The tool is registered and live (default `read` group). PASS.
