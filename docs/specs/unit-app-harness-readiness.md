# Unit `U-APP-HARNESS-READINESS` — the app-side halves the divergence leg's real-run gate needs: a LAUNCH-SCOPED, DEFAULT-PRESERVING ENABLEMENT ROUTE for tool groups, and an OBSERVABLE BOOT-INSTALL READINESS a client can poll with a bounded deterministic wait — the two halves of the `O-4` / `O-1` blockers, filed as ONE cycle, with the refused alternatives ruled out by name — Spec

**Status: SPEC — authored 2026-10-15. NO CODE LANDED, NO TEST LANDED, NOTHING RUN by this pass.** **No shell
was held by this pass**: `npm test`, `npm run typecheck`, `npm run build`, `npm run divergence`,
`npm run battery`, `npm run conformance`, `npm run drift` were **not run and are NOT reported here**; **no
Electron was booted** and no `scripts/live-drive.mjs` block was driven, so **no `sha256`, no line count and no
test tally of any file is produced by this filing** (the digest is **OWED** — §10 item 8). Reading, `glob` and
`grep` were used.

**Every claim about the app's or the harness's CURRENT behaviour below is one of: (a) a RECORDED READING of a
prior pass, quoted verbatim with its source and its measurer named; or (b) a VERIFIED-BY-READ statement about
the source text at this head — named as such, with its reader named (the SpecDoc). Nothing else is claimed.**

**Pass kind:** SPEC (the contract only). **Unit id:** `U-APP-HARNESS-READINESS` (minted by this filing; **no
other document owns the id**). **The id's own justification, in the program's own vocabulary:** the unit is the
**app-side counterpart** of the harness unit `U-DIVERGENCE-FIXTURE` — its **two halves are exactly the two
app-side capabilities that unit's `E-3` stop condition reserved to an architect escalation** (`E-3`: *"THE
STOP-CONDITION: if a green requires a `src/**` change, this unit stops"*, naming **"the `O-1` race, if it turns
out to need app-side sequencing of `ready()` behind the host boot"** as *"exactly this case"*), and the two
blockers the architect ordered closed on the app side (**`O-4`** tool-group enablement; **`O-1`** boot
sequencing).

**Program:** the post-division rebuild. **Authority for the ruling this filing records (not re-opens):** the
architect's order carried into this pass — *close both blockers on the APP side; **not** by a harness-side
write into the app's persisted security config, and **not** by a timing wait in the leg; the existing
`U-DIVERGENCE-FIXTURE` contract forbids both by clause (`C-1` item 4; `C-2` item 3) and its `E-3` names this
escalation.* **The tracked rows this unit's landing discharges are named in §9 `T-1`…`T-4`** (a supervisor
act; **this filing writes no tracker**).

**Layer (RCA-12, mandatory declaration, stated FIRST because it inverts the sibling's).** **The deliverable of
this unit is APP-SIDE SOURCE (`src/main/**`) — so its claims are about the MAIN PROCESS's launch, gate and MCP
surface, and they are `[T]`-layer node claims**, not live-app claims. **What it does NOT prove:** that any
**rendered / assembled** UI behaves (no `src/renderer/**` byte is touched, §2 `A-3`); that any **live** battery
row is green; that the divergence leg turns green (**the leg's own colour stays the sibling unit's class (b)
gate**, §6 `R-3`). **And what it DOES prove, stated without inflation:** that a launch can enable a group
**without a side-write into a profile**, that a **default launch is byte-for-byte today's behaviour**, and that
**an MCP client has a pollable, bounded, named-failure observable for "the app's initial graph install has
completed"** where today it has **none**.

| Deliverable | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| the enablement route (`--enable-tool-groups=` / env fallback; §2 `A-1`) | **MAIN-PROCESS / `[T]`** — the gate's effective set at launch | that a **human operator** finds it usable; that the Settings-pane path changed (it does not) |
| the readiness observable (`boot` member on `provident.list_targets`; §2 `B-1`) | **MAIN-PROCESS / `[T]`** — the renderer-reply + boot-signal state a client can poll | that the **renderer's graph** is correct; that a **pane/layout** installed; that the renderer needed any change (**it does not**, §2 `B-4`) |
| the leg's `R13 RESULT: <n> checks, 0 failures` after this unit's landing | **HARNESS / `[D]`** — the sibling's class (b) reading, quoted by the **landing pass**, never by this filing | **anything at the app layer**, and **never** "the app works" |
| `scripts/live-drive.mjs` remaining unaffected | **HARNESS / `[D]`** — the live battery's own readings | that the live battery is green; **it is not run here** |

**Citation discipline.** `path` + **symbol** / **row id** / **§section**; **no line number appears in this file
as an address** (`docs/specs/requirement-catalog.md` §3.4 rule 7). Where a quoted source carries its own line
numbers, they are quoted **as that source's own text**, never adopted as this file's address.

**Verification markers.** **VERIFIED-BY-READ** = read in this pass from this repo's tree, reader named (the
SpecDoc). **RECORDED READING** = a figure a **prior pass** measured, quoted as that pass's reading with its
measurer named; **it is not this pass's verification**. **UNVERIFIED** = named, not settled by this pass, **with
what would settle it**.

---

## 0. The state this unit exists to clear — and the rulings it records

### 0.1 The two blockers, quoted as the implementer's readings (NOT re-derived here)

**Both readings below are the implementer's, taken on the real-run `npm run divergence` gate of
`U-DIVERGENCE-FIXTURE`'s class (b). They are quoted; this pass ran nothing and re-derives nothing.**

| # | The blocker, as measured | The reading, verbatim where quoted | Measurer / source of the reading |
| --- | --- | --- | --- |
| **`O-4`** | **THE TOOL GROUP IS OFF, SO THE LOAD IS NOT REGISTERED.** `tools/list` on the booted app returns **9 tools with `provident.load` ABSENT** (`provident.list_targets` present); the leg's load step is refused with **`✗ electron connect/drive failed: the load step was REFUSED by the tool surface: MCP error -32602: Tool provident.load not found`**. The mechanism, read at source: `src/main/security.ts` → `defaultSecurityConfig()` = `{ token: null, enabled: ['read', 'dispatch'] }`; `src/main/security-store.ts` falls back to that default when the persisted config is absent, and the file it reads/writes lives in the app's **`userData`** (`--user-data-dir`), which a **fresh per-spawn scratch profile never has**; `src/main/mcp-server.ts` registers a group's tools **only when that group is enabled** (`registeredToolNames` / `allowedToolNames`). | **`9 tools`** and the refusal text **quoted**; **recorded reading.** | **The implementer's pass** (`npm run divergence` legs). This filing **re-read the three source files named** and **confirms every code claim in this cell by reading** (§0.2 `S-1`…`S-3`) — **the census count is the implementer's measurement and is not re-measured here.** |
| **`O-1`** | **THE BOOT IS FIRE-AND-FORGET AND REPLACES THE LOAD.** With the gate opened **experimentally** (by seeding the harness's own disposable profile — **a measurement only, NOT landed**), **`tools/list` read 15** and the load landed (`census.inTree 12`); the app's boot then landed **~250–540 ms after `connect`** (`boot → loadAppGraph → loadEnvelope`) and **replaced the demo graph**: **run A** drove on and diverged (**`data-node-id set` app 32 vs shim 12**, **`nodeId vocabulary`**, **`counter increment rendered in BOTH`**); **run B** died at the dispatch with **`unresolved target: {"kind":"cssId","cssId":"inc"}`** *immediately after the probe had read 12 in-tree demo nodes*. **Consequence, as the architect states it: an MCP client therefore has no way to know when the app's initial graph install has completed.** | **`tools/list 15`**, **`census.inTree 12`**, **`~250–540 ms`**, **`app 32 vs shim 12`**, and the two failure texts **quoted**; **recorded readings.** | **The implementer's pass** (the experimental profile-seeded run — **explicitly NOT a landed change**). **The `~250–540 ms` figure is an observation of that pass and is NEVER a constant this unit may pin, wait on, or cite as a delay budget** (§3 `F-6`). |

**⟨THE EXPERIMENTAL SEEDING IS REFUSED AS A ROUTE, NOT MERELY UNLANDED.⟩** The architect's order records it:
the route is **a harness-side write into the app's persisted security config**, which the sibling contract
forbids by clause (**`C-1` item 4** — the load step is *"not a spawn argument"*, i.e. the leg may not
parameterise the app's config; **`C-2` item 3** — *"the implementer … may NOT paper the hazard over with a
fixed sleep"*). **This filing's §2.2 `R-1`/`R-2` refuse it by name and record the security cost of the
alternative that WOULD work** — see `R-2` (the self-escalation tool).

### 0.2 The source facts this filing VERIFIED BY READING (reader: the SpecDoc)

| # | Reading | Where |
| --- | --- | --- |
| **`S-1`** | **The default gate is a two-group set, and it is what a fresh profile gets.** `defaultSecurityConfig()` returns `{ token: null, enabled: ['read', 'dispatch'] }`; `createSecurityStore` falls back to `{ token: null, enabled: ['read', 'dispatch'], maxJournalLength: undefined }` on a **missing** file, an **empty/unparseable** file, and (via `sanitize`) a persisted `enabled` that is not a string array — **never throwing**. | `src/main/security.ts` (`defaultSecurityConfig`) · `src/main/security-store.ts` (`createSecurityStore`, `sanitize`) |
| **`S-2`** | **The gate's persistence path is `userData`, and it is operator-owned.** `main.ts` builds the store at `join(app.getPath('userData'), 'provident-security.json')`, reads it once, and constructs `new SecurityGate({ token: persisted.token, enabled: persisted.enabled as ToolGroup[] })`; the **only** writer is the manual-UI IPC handler (`IPC_SECURITY_SET`), which calls `securityStore.set(patch)` and then re-gates the live server through `gatePatchFromStoreResult` + `mcp.applyGatePatch`. **The MCP tool surface has no route to that handler** — the file's own comment states it: *"This is manual-UI-ONLY — it is NOT reachable over an MCP tool (the MCP tool handlers never route to it), so an agent cannot grant itself capabilities."* | `src/main/main.ts` (`main`, `IPC_SECURITY_SET`) · `src/main/mcp-server.ts` (`applyGatePatch`) |
| **`S-3`** | **Registration — not merely invocation — is the gate.** `ProvidentMcpServer.ALL_TOOLS` is the static name list; `registeredToolNames(gate, allNames)` admits a name **only when `gate.toolAllowed(name)`**, with a **two-gate** (`module` **AND** `code`) for `module.install`/`module.update`; `allowedToolNames()` extends that with the router's dynamic `module:<name>.<tool>` tools; `createServer()` feeds `allowedToolNames()` into `registerTools(...)`, so **a disabled group's tool is not registered and is not listed**. **`TOOL_GROUPS` maps `'provident.load': 'graph'`** — hence `O-4`'s `Tool provident.load not found`. | `src/main/mcp-server.ts` (`ALL_TOOLS`, `registeredToolNames`, `allowedToolNames`, `createServer`, `registerTools`) · `src/main/security.ts` (`TOOL_GROUPS`, `toolAllowed`) |
| **`S-4`** | **The group vocabulary is exactly NINE names, in two places that must agree**: `security.ts` → `ToolGroup` = `'read' \| 'dispatch' \| 'graph' \| 'code' \| 'module' \| 'rag' \| 'edit' \| 'gnosis' \| 'gnosis-edit'`, pinned by `VALID_GROUPS` in the same file **and** by a second `VALID_GROUPS` in `src/main/security-store.ts` (whose own comment records the divergence hazard: omitting a group there *"would make the manual-UI settings pane the only path to enable groups silently DROP that group's toggle"*). **The existing tests read the same nine**: `tests/blind-unit-ud5-list-documents-tool-greens.test.ts` asserts `groups` has length **9**. | `src/main/security.ts` (`ToolGroup`, `VALID_GROUPS`, `isToolGroup`, `applyPatch`) · `src/main/security-store.ts` (`VALID_GROUPS`) · `tests/blind-unit-ud5-list-documents-tool-greens.test.ts` |
| **`S-5`** | **The boot is fire-and-forget in the RENDERER, and the MCP serve does not wait for it.** `src/renderer/renderer.ts`'s `main()` constructs the `Runtime` with a **placeholder** envelope, calls `runtime.bootstrap()`, then launches the host boot **fire-and-forget** (`void host.boot(runtime).then(() => bootTabs()).catch(…)`) and calls `bridge.ready()` **outside that chain**. `bridge.ready()` sends `IPC_READY` (`src/main/preload.ts`), whose main handler calls `backend.markReady()` and prints `[provident-main] renderer ready — MCP backend armed`. **`markReady()` is idempotent (`if (this.ready) return`), and the MCP stdio server starts AFTER the window load (`await mcp.start()` in `main.ts`)** — so a client can connect and be answered while the app's OWN graph install is still in flight. **This is the whole of `O-1`'s mechanism, read at source.** | `src/renderer/renderer.ts` (`main`, the `void host.boot(...)` line, `bridge.ready()`) · `src/main/preload.ts` (`ready`) · `src/main/main.ts` (`IPC_READY` handler, `mcp.start`) · `src/main/mcp-server.ts` (`RendererBackend.markReady`, `isReady`) |
| **`S-6`** | **The READ surface the harness already drives is `provident.list_targets`, and it is a thin, renderer-routed, synchronous read.** It is `read`-group (registered under today's default), its handler is `backend.invoke('listTargets', {})`, and the renderer's reply is `Runtime.listTargets()` → **`ListTargetsResult` = `{ nodes: NodeInfo[] }`** (the runtime returns **`{ nodes }` only** — the declared type carries no other member). **The tool is `provident.list_targets`; the resource mirror is `mcp://provident/targets` (same `read` group, same `method`)**. | `src/main/mcp-server.ts` (`registerTools` → the `provident.list_targets` block; `ALL_RESOURCES`; `ResourceDef`) · `src/renderer/renderer.ts` (`handleRequest` → `case 'listTargets'`) · `src/renderer/runtime.ts` (`listTargets`) · `src/shared/types.ts` (`ListTargetsResult`, `NodeInfo`) |
| **`S-7`** | **`provident.load` is a first-class tool of the app's own surface, `graph`-group, renderer-routed and mutating.** `ALL_TOOLS` carries `'provident.load'`; `TOOL_GROUPS` maps it to `graph`; the handler routes `dispatch(name)` ⇒ the renderer RPC method **`'load'`**; `MUTATING_METHODS` in the renderer contains `'load'` (so a successful load emits the `app-graph-changed` push **after** the reply); `Runtime.load`/`loadEnvelope` perform a **whole-graph replacement** (teardown first). **This is `U-DIVERGENCE-FIXTURE`'s `FINDING-1`/`FINDING-2`, cited as that unit's reads.** | `src/main/mcp-server.ts` (`ALL_TOOLS`, `registerTools`) · `src/main/security.ts` (`TOOL_GROUPS`) · `src/renderer/renderer.ts` (`MUTATING_METHODS`, `handleRequest`) · `docs/specs/unit-divergence-drive-fixture.md` (`FINDING-1`, `FINDING-2`) |
| **`S-8`** | **The divergence leg's spawn contract is PINNED at nine members per site, and the sibling's contract rows assert it.** `scripts/electron-divergence.mjs` composes `composeArgs(profileDir)` = **nine** members (`mainCjs` + seven base flags + one `--user-data-dir=` last) and **`siteArgs(args, profileDir, site)` THROWS** if a site's list is not deep-equal to the composed vector: *"both spawn sites must derive their arguments from ONE value (§3.1 item 4)"*. `tests/unit-divergence-spawn-contract.test.ts` pins the members (`CONTRACT_BASE`, `CONTRACT_PROFILE_MEMBER`, `contractViolations`); `tests/unit-divergence-fixture-contract.test.ts` re-asserts the **nine** at both sites in its `P-TP-2` body. **Consequence: the divergence leg cannot reach this unit's flag by adding a spawn ARGUMENT** — hence §2 `A-1`'s env fallback, and §9 `T-1`'s owed sibling annotation. | `scripts/electron-divergence.mjs` (`composeArgs`, `siteArgs`, the two spawn sites) · `tests/unit-divergence-spawn-contract.test.ts` · `tests/unit-divergence-fixture-contract.test.ts` |
| **`S-9`** | **The live driver drives under TODAY'S DEFAULT and cannot be affected by a default-preserving change.** `scripts/live-drive.mjs` spawns `scripts/start-app.sh` with `launchArgs` = `[--mode=…, --port=…, --cdp-port=…, (--no-gpu)]` only — **no security flag, and its `groups` default is a CDP `Accessibility`/DOM group set, not the MCP tool-group set** (`const groups = opt.groups ?? ['read','dispatch','rag','edit','module','code','graph','gnosis','gnosis-edit']` is passed to `cdp.enableGroups(...)`, **not** to the app's gate); its env is `HOME=<disposable>`, `DISPLAY`, `ASTROGRAPHER_O0_MAIN_ARM`. It confirms boot-and-connect with `provident.list_targets` before driving. **The env-fallback design (§2 `A-1` item 3) therefore sees no `PROVIDENT_ENABLE_TOOL_GROUPS` in a live battery and takes the default branch.** | `scripts/live-drive.mjs` (the spawn site, `launchArgs`, the env object, the `provident.list_targets` boot confirmation) · `scripts/start-app.sh` (the passthrough arg set) |
| **`S-10`** | **The app's own documents sanction ONLY the human/operator route today, and they say so.** `docs/specs/mcp-endpoint.md` §6.2: *"The manual-UI settings are how the HUMAN sets up the gate; the gate is OFF-by-default for anything a human hasn't explicitly enabled"*, and §6.2's `graph` row is **`OFF (manual)`**; §6.2's closing note: *"Enabling `graph`/`code` is an explicit human grant"*; §6.3: *"A token alone does NOT enable `code`/`graph` — those need the group grant"*. **A launch flag is a HUMAN, PRE-LAUNCH grant, so it is INSIDE this model — but the contract text names ONE route, so an amendment is OWED (§9 `T-2`).** | `docs/specs/mcp-endpoint.md` §6.2, §6.3 · §3's tool table (`provident.list_targets` → `{ nodes: [...] }`) is the **second** owed amendment (`T-2`) |
| **`S-11`** | **The existing security pins that constrain this change, and which must stay green UNEDITED.** `tests/security.test.ts` (*"defaultSecurityConfig — spec §3"*: `enabled` = `['read','dispatch']`, `token` null) · `tests/blind-security-gate.test.ts` (`defaultSecurityConfig()` deep-equals `{ token: null, enabled: ['read','dispatch'] }`; *"Gated registration — `allowedToolNames()` includes the read+dispatch 6 and excludes graph/code"*, naming **`provident.load`** among the excluded) · `tests/module-security-gate.test.ts` (*"`defaultSecurityConfig()` does NOT include module"*) · `tests/rag-edit-gate.test.ts` + `tests/mcp-security-hardening.test.ts` (*"`defaultSecurityConfig()` … only read/dispatch"*) · `tests/security-store.test.ts` (the store's fallback + persistence rows) · `tests/mcp-server-gate.test.ts` · `tests/blind-unit-ud5-list-documents-tool-greens.test.ts` (the nine group names). **All of these assert DEFAULT behaviour and the store's SHAPE** — a default-preserving, shape-preserving change keeps them green, and §1.5 `P-4` predicts exactly that. | the named test files (read this pass) |
| **`S-12`** | **The protected/frozen surface this unit must not touch, named by the repo's own authorities.** `G-9`-class frozen artefacts (`vitest.config.ts`, `vitest.conformance.config.ts`, `package.json`'s pinned script VALUES, the vendored `src/shared/**` divergent baselines, `src/main/markdown-import.ts`) · the `PROTECTED` test set (`unit-u2-rich-decompose`, `unit-s-paste-sanitization`, `template-adversarial`, `unit-live11-bridge-seams`, `unit-u5-rich-commit-ipc`, `unit-v5-bridge-capture`, `unit-wave-1-bridge-wiring`, `unit-import-batch-persist-contract`, `tests/fixtures/v5-bridge-capture-fixture.js`) · the two fence files (`tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`) · `../Provident-Electron/**` **in any direction** (`AGENTS.md` item 7; the program's `G-8`). **`tests/unit-v5-migration-contract.test.ts` remains the AUTHORITY for the pinned `package.json`/`vitest.config.ts` values**; a new file that re-asserts them is a **cross-check only**. | `docs/specs/unit-divergence-drive-fixture.md` §1.4/§1.5 (carried) · `tests/unit-v5-migration-contract.test.ts` §2c item 6 · `AGENTS.md` items 6/7 |

### 0.3 What the architect's ruling settles — and what this filing still owes

**RECORDED, NOT RE-OPENED:** *close both blockers on the APP side — not by a harness-side write into the app's
persisted security config, and not by a timing wait in the leg.* **Three consequences this filing carries
mechanically:**

1. **The enablement route must be a LAUNCH input** (a pre-launch, human/operator grant), **never a
   post-launch MCP-reachable grant** (§2.1 item 4).
2. **The readiness observable must be a STATE, not a delay**: pollable, bounded, with a **named failure** when
   it never arrives (§2.2 item 5), and **"no blind sleep anywhere"** — including **inside the app**.
3. **The harness still owes the USE of the observable.** The sibling unit's leg 1 must call the flag route,
   **wait (bounded) for the install**, then load, probe and drive. **That is the sibling's amendment, NOT this
   filing's** — §9 `T-1` carries the exact items, and §6 `R-3` states which unit's gate the colour belongs to.

---

## 1. Scope

### 1.1 What this unit IS (the deliverable, in one list)

1. **ONE launch-scoped enablement route for tool groups** — a **main-process CLI flag** honoured at boot, with
   **an env fallback required by the pinned spawn vector** (§2.1 `A-1`), whose **default is exactly today's
   `['read','dispatch']`**, whose effect is **ADDITIVE and LAUNCH-SCOPED**, and which **never writes the
   persisted config**.
2. **ONE observable boot-install readiness** — a `boot` member on the existing `read`-group tool
   `provident.list_targets` (and its resource mirror), **present only when the launch opted in** (§2.2 `B-1`),
   with a **defined transition set**, a **bounded wait protocol**, and a **named failure** when it never
   arrives or fails.
3. **The preservation clause** (§1.5 `P-1`…`P-6`): today's default, today's tool census, the fail-closed
   properties of the security model, and the leg's pinned spawn/config discipline.
4. **The register** (§4): six typed rows over the five real subjects named by the filing brief.
5. **The red-set plan** (§5) for a `src/**`-bearing unit, with the **source/no-boot class** and the
   **real-run class**, and a written statement of **which class is this unit's own gate**.
6. **The verification story** (§7): which leg covers which layer, the trio, and **the two end-to-end legs this
   unit exists to unblock** — `npm run divergence` (the sibling's class (b), which **becomes executable only
   once this unit lands**) and `scripts/live-drive.mjs` (**unaffected**).

### 1.2 ALLOWED surface (exact)

| Path | Change | Why this file, and why nothing else |
| --- | --- | --- |
| `src/main/security.ts` | **EDITED (additive)** — `enablementRequestFrom(argv, env)` + `parseToolGroupList(value)` + a `groupsFromRequest`-class effective-set resolver (pure; the implementer's least-code shape); **`defaultSecurityConfig()`'s body and `VALID_GROUPS` are unchanged** | the group vocabulary and the fail-closed patch semantics already live here; a parser beside them keeps ONE authority for "what is a group name" (`S-4`) and keeps `defaultSecurityConfig()` byte-identical (`P-1`) |
| `src/main/main.ts` | **EDITED** — read the launch request at boot, resolve the effective enabled set **before** the `SecurityGate`/MCP server are constructed, attach the readiness state to the renderer-reply bookkeeping, handle the new boot signal; **the refusal path is a named stderr line + `app.exit(2)`, before the window and before `mcp.start()`** | it already owns arg parsing (`transportFromArgs`, `portFromArgs`, `retrievalEmbedderFromArgs`), the security store, the gate construction and the `IPC_SECURITY_SET` re-gate (`S-2`) |
| `src/main/mcp-server.ts` | **EDITED (additive)** — `RendererBackend` gains the boot-install state + its transitions (a new method beside the idempotent `markReady()`); the `provident.list_targets` handler attaches the `boot` member; the handler **short-circuits the `pending` state without awaiting the renderer** (`B-5`) | the tool's handler, the backend and the readiness gate all live here; **no new tool, no new group, no new resource, no `ALL_TOOLS` member** (`P-2`) |
| `src/main/preload.ts` **and** `src/shared/types.ts` | **EDITED** — ONE new IPC channel constant (`IPC_BOOT_READY`-class) + ONE preload method that sends it (`S-5`: `preload.ts` already owns `IPC_READY`) | adding a signal needs a channel constant and a sender; **the renderer calls it through the existing `bridge` object, so no renderer edit is needed** (§2 `B-4`, §1.3) |
| `tests/unit-app-harness-readiness.test.ts` **+ `tests/unit-app-harness-readiness-register.test.ts`** | **NEW — the RED SET** (§5.2). Two files so the contract rows and the typed register stay separable; the implementer may merge them into one, and that is a **recorded** implementer choice, not a silent re-scope | the TestWriter's files; they must **not** `vi.mock('electron', …)` (the protected bridge-mock name-set) and must read **source text / exported pure functions / the `RendererBackend` surface with a fake window** — no Electron boot, no `src/renderer/**` import |
| `docs/specs/unit-app-harness-readiness.md` | **THIS FILE** | — |

**The ALLOWED set is closed.** Every other path is DENIED (§1.3), and **a unit that needs a byte of the denied
set is a NEW unit or a new architect ruling — never this one.**

### 1.3 DENIED surface (explicit, so the allow-list cannot be widened by implication)

**DENIED:**

- **`src/renderer/**` in ANY form** — **this unit's design requires NO renderer edit** (`B-4`: the boot signal is
  sent through the existing `bridge` object, and the boot chain's own `.then(...)` is where it belongs). **If an
  implementer finds the renderer must change, that is `E-2`** (an escalation, not a silent widen).
- **`scripts/**` in ANY form** — the divergence leg, `live-drive.mjs`, `start-app.sh`, `mcp-cli.mjs`,
  `foundation-drift.mjs`. **The leg's use of the flag and its bounded wait are the SIBLING unit's amendment**
  (§9 `T-1`), and a harness-side write into the app's persisted config is **refused** (§2.2 `R-1`).
- **`tests/**` other than the two new files**, and **never** a `PROTECTED` file, either fence file, or
  `tests/unit-v5-migration-contract.test.ts` (§0.2 `S-12`).
- **`vitest.config.ts` · `vitest.conformance.config.ts` · `package.json` (any key)** — the pinned values
  (`testTimeout: 15_000`; the `divergence` key's exact value `npm run build && node scripts/electron-divergence.mjs`;
  `test`/`test:watch` carrying **no** `--testTimeout`) are **read as constraints, never edited**.
- **`vendor/**` · the four divergent baseline files · `src/main/markdown-import.ts`** — `G-9`-frozen.
- **`src/main/security-store.ts`'s persisted FILE FORMAT and `userData` paths** — unchanged (`P-5`); the
  `provident-security.json` schema, its `sanitize` semantics and its write-through discipline stay exactly as
  they are.
- **`../Provident-Electron/**` — NEVER, in any direction** (`AGENTS.md` item 7; the program's `G-8`).
- **Every `docs/**` file except this spec and the tracker appends §9 names** — in particular **no amendment to
  `docs/specs/unit-divergence-drive-fixture.md`, `docs/specs/unit-divergence-harness-precondition.md` or
  `docs/specs/mcp-endpoint.md` by this filing** (the sibling amendment is another pass; §9 `T-1`/`T-2`).

### 1.4 What this unit is NOT

It is **not** a change to what the MCP surface offers by default (the census under default does not move — `P-2`)
· **not** a change to the security MODEL (`P-3`: fail-closed stays; `authorized`/`applyPatch` semantics and the
`module`/`code` two-gate are untouched) · **not** a new tool, a new resource or a new group · **not** an
app-boot change: the boot **stays** fire-and-forget and the app's own template **stays** (`S-5`; this unit adds
an **observation** of the boot, never a re-sequencing of the graph install) · **not** a harness fix (the leg's
colour is the sibling's gate) · **not** a live battery (nothing is driven) · **not** a tracker rewrite (the
supervisor owns rows outside §9) · **not** the carried baseline red `PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1`
(carried by the phase-1 entry conditions; untouched) · **not** the owed fixture single-source-of-truth work
(`docs/specs/unit-divergence-harness-precondition.md` §9.1 `T-4`; still owed, still not this unit's).

### 1.5 THE HONESTY BLOCK — the preservation clause, and what this pass could NOT verify

**`P-1`…`P-6` — THE PRESERVATION CLAUSE (what a normal launch must see, stated as testable properties).**

| # | The preserved property |
| --- | --- |
| **`P-1`** | **`defaultSecurityConfig()` is byte-identical in behaviour**: it returns a **fresh** `{ token: null, enabled: ['read', 'dispatch'] }`, reads **no** argv and **no** env, and **cannot be influenced** by the new route. |
| **`P-2`** | **The DEFAULT tool census does not move**: with no flag and no env var, `allowedToolNames()` and the registered set are **exactly today's** — `provident.load` and every other `graph`/`code`/`module`/`rag`/`edit`/`gnosis`/`gnosis-edit` tool stay **absent** (`S-11`'s pinned rows). **No new tool is added to `ALL_TOOLS`, and no group name is added to the vocabulary** (`S-4`). |
| **`P-3`** | **The security model's fail-closed properties are unchanged**: `applyPatch` still **rejects the whole patch** on a wrong-shaped token/groups/disable and **never throws**; `toolAllowed`/`moduleToolAllowed` still fail closed on a malformed `enabled`; `authorized` is untouched; the **`module`+`code` invocation two-gate** is untouched; and **no MCP-reachable route can enable a group** (that is `P-6`, asserted as `P-TP-2`). |
| **`P-4`** | **THE PINNED SECURITY TESTS STAY GREEN UNEDITED** (`S-11`): the default-config rows, the store's fallback/persistence rows, the gated-registration rows (including the one that names `provident.load` as **excluded** at default), and the nine-group-name row. **They are the constraint on the change, and they are never edited to accommodate it.** |
| **`P-5`** | **The persisted config is not written by this route**: a launch with the flag leaves `provident-security.json` **absent** where it was absent and **unchanged** where it existed; a later default launch therefore behaves exactly as today (the launch-scoped grant does not leak into the next boot). |
| **`P-6`** | **The default RESPONSE SHAPES do not move**: with no opt-in, the `provident.list_targets` reply carries **no `boot` member** and is `{ nodes: [...] }` exactly as its declared type and the endpoint contract say (`S-6`, `S-10`); `get_rendered_html`/`get_markdown`/`get_node_state`/`dispatch` replies are untouched. |

| # | Unverified item | What would settle it |
| --- | --- | --- |
| **`O-1`** | **Whether the divergence leg turns GREEN after this unit lands.** This filing designs the two capabilities and predicts **nothing** about the leg's colour: the probe's disposition, the `data-node-id` reading and the census parity are the sibling's class (b) rows (`docs/specs/unit-divergence-drive-fixture.md` §3.3 `B-1`…`B-5`). | `npm run divergence` after **both** units land — recorded verbatim with its `<n>` and exit code by the **landing** pass. |
| **`O-2`** | **The exact tool census under the flag** (the count the experiment read was **15**, on a *seeded-profile* boot — **not** on this route, and not on this unit's change set). | The landing pass's `tools/list` reading under `--enable-tool-groups=graph`. **A count is an OBSERVATION** (the sibling's own rule, `docs/specs/unit-divergence-harness-precondition.md` §1.4 `O-5`): it is recorded, **never pinned**. |
| **`O-3`** | **Whether the two spawn sites' env objects are contract-pinned** in the sibling's red set. **Read this pass: they are NOT** — `tests/unit-divergence-fixture-contract.test.ts` resolves the two sites' **argument** vectors and the leg's load/drive structure, and no assertion in it reads the spawn **env** object. **UNVERIFIED:** the sibling spec's §2.2 `C-2` prose does not enumerate env members as preserved, and its `§1.4` pin table does not mention env — so an env member is **additive to the landed contract**, **but the sibling's own `C-3`/`§3.2 R-8` preservation row group must be checked by that unit's pass** (§9 `T-1`). | The sibling unit's amendment pass: it must state (and, if needed, extend `R-8` for) the leg's env member, and it must re-run its red set. |
| **`O-4`** | **Whether `list_targets`' `boot` member should be `present-when-opted-in` (this filing's ruling) or unconditional.** The unconditional form would break `P-6`/`P-2`'s honest reading of "byte-for-byte today's behaviour" (a new member in a default tool's reply is observable to every default client). **This filing rules the GATED form and records the cost honestly:** the observable is **not** available to a default-launch client, and a future unit that wants readiness for the GUI/manual route owes its own ruling. | A reviewer's finding or an architect ruling; **not** a silent change of the ruling here. |
| **`O-5`** | **Whether a mid-run renderer reload occurs in any gate this unit's changes touch**, and what the leg should do then. **This filing rules the transitions (a reload resets `installed` to `false` and advances `epoch`) and the client protocol (a regression AFTER satisfaction is a NAMED FAILURE, §2.2 item 5).** Whether a real run ever hits it is **unmeasured**. | The sibling's class (b) run, plus the adversarial pass's reload probe (§5.4 `A-4`). |
| **`O-6`** | **Whether `SidebarPanes.boot` throws (vs fails soft and still installs a graph) when its store/template/doc-heads fetches fail.** **Read this pass: `renderer.ts` wraps the chain in `.catch(...)` and logs `[provident-renderer] tab boot failed`, but the `.then(() => bootTabs())` chain is the ONLY place the boot's completion is visible — so whether a REJECTED boot ever leaves a graph installed is NOT settled here.** | The `failed` transition's implementation + a unit row that drives the chain's rejection path (the register's `P-SM-1`, its `failed`-state arms), and the sibling's run on a host where a fetch fails. **The observable must be honest in EITHER case** (§3 `F-4`). |

---

### 1.6 SPLIT OR NOT — RULED EXPLICITLY: **ONE CYCLE, NOT TWO**

**THE RULING: the enablement route (`A-1`) and the boot-install observable (`B-1`) are ONE unit with ONE
register, ONE red set and ONE pair of live rows.** The alternative — two units with their own registers, red sets
and live rows — is **REFUSED** here, and the refusal is argued rather than asserted, because the program's
records (`RCA-2`/`RCA-5`) treat a multi-unit deliverable as a **hard gate** and an unjustified merge as a review
finding.

**Why they are one deliverable — the argument, in four steps:**

1. **NEITHER HALF IS USABLE ALONE — and the unusability is MEASURED, not argued.** `O-4` alone (the route,
   without the observable) leaves the leg exactly where `O-1` found it: the load lands and the app's boot
   **replaces** it 250–540 ms later, so the gate still reds — either loudly (run B's `unresolved target`) or
   **silently green against a different graph** (run A's `data-node-id set` divergence, which is worse). `O-1`
   alone (the observable, without the route) leaves the load **refused** — `Tool provident.load not found` — so
   the observable tells a client when a load it **cannot perform** was superseded. **A harness cannot use either
   alone; it must have both to perform its one job.**
2. **THEY SHARE ONE LAUNCH DECISION, ONE RESOLVED REQUEST AND ONE REPORTING SURFACE.** The observable's
   **presence is gated by exactly the same request the gate resolves** (§2.2 `B-1` item 3 item 2: *"the rule is
   enforced in MAIN, from the same resolved request the gate used"*). Split into two units, the second unit's
   central clause would be *"when the sibling's flag is present"* — a **cross-unit dependency with no
   enforcement surface**, i.e. exactly the shape that produced the `E-3` dead end this filing exists to close.
3. **THEY SHARE ONE FAILURE MODE AND ONE CLASS (b) READING.** Both are read off the **same launch** on the same
   real process (§5.3 `C-9`: one launch with the flag yields the census, the `boot` transition, and the refusal
   path). **Two units would require two launches of the same app to read two halves of one state** — and their
   red sets would overlap in their first row (both would assert a launch input that does not exist).
4. **THE PROGRAM'S OWN VOCABULARY ALREADY TREATS THEM AS ONE.** The sibling spec's `E-3` names **one**
   escalation — *"if a green requires a `src/**` change, this unit stops"* — and the architect's order names
   **two blockers** closed **on the app side**. **One escalation, one filing, two clauses.** **The unit's
   identity is the deliverable, not the file count.**

**What the ONE-cycle ruling does NOT license** (stated so it cannot be over-read):

- It does **not** merge this unit with the **sibling** (`U-DIVERGENCE-FIXTURE`): the sibling's amendment, its
  red set, its class (b) run and its DONE row stay **that unit's** (`§6.3 R-3`; `§9 T-1`). **`RCA-2` is
  satisfied by keeping the two UNITS separate, not by splitting the two halves of one unit's deliverable.**
- It does **not** allow the register to be thinned: **§4 registers BOTH halves' subjects** (the default census,
  the census under the flag, the malformed-value behaviour, the observable's transitions, the absent
  self-escalation route) in **one 6-row register**, with each row's terms printed.
- It does **not** allow the red set to be batched or self-verified: **the red set is RUN and REPORTED per unit**
  (`§5.2`; `RCA-1`), and the two files of §1.2 are that unit's red set, run before any implementation.
- **If a reviewer concludes the two halves must be two units**, the admissible disposition is **a re-mint by the
  architect (two unit ids, two registers, two class (b) runs, `A-1` sequenced first because `B-1`'s presence rule
  names its request)** — **never a silent split by an implementer**, which would leave `B-1` gated on a flag no
  unit owns.

---

## 2. The surface — signature by signature

### 2.1 `A-1` — THE ENABLEMENT ROUTE

#### `A-1` item 1 — THE RULED ROUTE (one route, two spellings)

**RULED: `--enable-tool-groups=<g1,g2,…>`, with `PROVIDENT_ENABLE_TOOL_GROUPS=<g1,g2,…>` as the ENV FALLBACK.
The argv form WINS when both are present** (the house's existing precedence in `transportFromArgs`,
`portFromArgs`, `retrievalEmbedderFromArgs`).

**Syntax, exactly:**

- **Flag name:** `--enable-tool-groups=`. The value is **`=`-joined to the name** (the house's own form for
  every existing member: `--mcp-transport=`, `--mcp-port=`, `--retrieval-embedder=`).
- **Separator:** a **single `,`** between group names. **Whitespace is NOT tolerated**: a token is accepted
  **only** if it equals a `ToolGroup` literal **exactly** (no trimming, no case folding) — see item 6.
- **Group names:** exactly the nine of `S-4`. **No aliases, no abbreviations, no case forms.**
- **Multiplicity:** repeated names are **deduplicated** (order-insensitive); the flag may appear **once** in
  argv (a second `--enable-tool-groups=` member is **malformed** — item 6).
- **Examples (both valid):** `--enable-tool-groups=graph` · `--enable-tool-groups=graph,rag,edit` ·
  `--enable-tool-groups=read,dispatch,graph` (the explicit restatement of the default plus `graph`, which is
  **equivalent** to `--enable-tool-groups=graph` — item 3's additivity makes the default restatement a no-op).

#### `A-1` item 2 — THE DEFAULT-PRESERVATION CLAUSE (the arithmetic, stated as a formula)

```
base           = defaultSecurityConfig().enabled                     // exactly ['read','dispatch']  (P-1)
persisted      = securityStore.get().enabled                         // userData file, or the same default
requested      = parseToolGroupList(flagValue ?? envValue)           // A launch-scoped grant
effective      = union(base, persisted, requested)                   // order-preserving, deduplicated
```

1. **NO FLAG, NO ENV ⇒ `effective === union(base, persisted)` — today's behaviour EXACTLY.** On a fresh
   scratch profile (the harness's case) `persisted === base`, so `effective === ['read','dispatch']`.
2. **THE ROUTE IS ADDITIVE — NEVER SUBTRACTIVE, NEVER REPLACING.** A flag naming `graph` **adds** `graph`; it
   **cannot** remove `read`/`dispatch`, and it **cannot** remove a group the persisted config enabled. **The
   consequence is the security property this filing wants:** the **worst** outcome of a flag is *"the operator
   asked for less than they got"* (a superset), **never** *"a group the default already granted went OFF"*, and
   **never** *"an unrequested group came ON"* — request-set semantics (`effective = requested`) are **REFUSED**
   (§2.2 `R-3`).
3. **The route never DISABLES.** A launch-scoped grant cannot express "everything off"; disabling stays the
   manual-UI route's job (`S-2`).
4. **The effective set is resolved ONCE, at boot, before the `SecurityGate` and the MCP server are
   constructed**, and is passed to `new SecurityGate({ token: persisted.token, enabled: effective })` — so the
   very first `createServer()` (and therefore the very first `tools/list`) already reflects it. **A
   post-hoc `applyGatePatch` is NOT the mechanism** (it would leave a boot window in which the load is still
   unregistered — the `O-4` symptom with a smaller window).
5. **THE TOKEN IS NOT TOUCHED.** The route grants groups only; it can neither set nor clear the token (`S-10`
   §6.3's *"a token alone does NOT enable `code`/`graph`"* has the converse here: **a group grant alone does not
   change auth** — a launch that enables `graph` over **HTTP** with a persisted token still requires the token,
   and over **stdio** the transport's spawn-local trust is unchanged).

#### `A-1` item 3 — THE TWO SPELLINGS, AND WHY THE ENV FALLBACK IS **REQUIRED**, NOT A CONVENIENCE

1. **The env form is required because the divergence leg's spawn vector is PINNED at nine members and its own
   composer THROWS on a tenth** (`S-8`: `composeArgs`/`siteArgs`), and because that vector is pinned by a
   **sibling unit's** red set that this unit may **not** edit (§1.3). **Therefore the route must be reachable
   through the spawn ENV, which the leg can set without touching its argument vector.**
2. **The env form is a WEAKER custody than argv, and the weakness is named rather than hidden**: an environment
   variable is **inherited by descendant processes**. **Read this pass, the residual risk is TINY and
   enumerated**: the only child-process spawn in `src/**` is `src/main/embeddings.ts`'s
   `execFileSync('curl', […], { stdio: 'ignore', timeout: 1500 })` — a **fixed** binary, a **fixed** argument
   vector, **no shell**, and **no env forwarding**; and there is **no MCP-reachable route that sets a process
   environment variable at all** (§2.1 item 4). **A future child-spawn that forwards env MUST re-examine this
   row** — that obligation is `F-7`.
3. **The env form introduces no boot-order ambiguity**: it is read at the same point as the flag (item 4), in the
   same `main()` prologue, before any gate exists. **An env var set in the operator's own shell therefore enables
   groups for THAT launch** — which is the intended operator semantics, and is exactly why `P-5` (no persistence)
   matters.
4. **Nothing ELSE changes about the launch.** The flag/env member is **not** consulted by the renderer, by the
   preload, or by any tool handler; it is a **process-input read once in `main()`**.

#### `A-1` item 4 — THE FOUR HARD CONSTRAINTS (each stated as a clause the implementation must satisfy)

1. **NO MCP-REACHABLE ENABLEMENT — EVER (the self-escalation hole).** **No tool, no resource, no notification
   and no tool ARGUMENT may enable a group, disable a group, or write the security config.** The only writers
   stay: the manual-UI IPC handler (`IPC_SECURITY_SET` — reachable **only** from the renderer's own preload
   bridge, never from a tool; `S-2`), and this unit's **process-input** read at boot. **This clause is asserted
   as `P-TP-2`, and it is the reason a "grant-me-the-group" tool is REFUSED BY NAME (§2.2 `R-2`).**
2. **THE DEFAULT MUST NOT MOVE.** `defaultSecurityConfig()` is unchanged and **does not read** the new inputs
   (`P-1`); `VALID_GROUPS` is unchanged (`S-4`); `effective === today` when the inputs are absent (item 2
   item 1).
3. **A NORMAL LAUNCH IS TODAY'S BEHAVIOUR, OBSERVABLY.** No flag ⇒ the same nine groups' vocabulary, the same
   `['read','dispatch']` default, the same registered tool set, the same `tools/list` member count, the same
   `provident.list_targets` reply shape (`{ nodes }`, no `boot`), the same persisted-file behaviour, the same
   re-gate behaviour. **Stated so it is not vacuous: "byte-for-byte" is asserted as the `P-1`/`P-2`/`P-6`
   properties, not as a diff of an artefact this pass cannot produce.**
4. **THE ROUTE IS NOT A CREDENTIAL AND CONFERS NO AUTHORITY BEYOND THE GROUPS.** It cannot create a group name,
   cannot widen `VALID_GROUPS`, cannot bypass `authorized`, and cannot alter the `module`+`code` two-gate.

#### `A-1` item 5 — THE SIGNATURES (pure, in `src/main/security.ts`)

```ts
/** The launch-scoped enablement request, parsed. TOTAL: never throws. */
export type EnablementRequest =
  | { ok: true; requested: ToolGroup[]; source: 'argv' | 'env' | 'none'; raw: string | null }
  | { ok: false; reason: string; raw: string; offender: string | null }

/** Parse ONE comma-separated value into the nine-name vocabulary.
 *  `null` ⇒ ok, empty request, source 'none'. A malformed value ⇒ ok:false (never a throw). */
export function parseToolGroupList(raw: string | null | undefined): EnablementRequest

/** Read the TWO launch inputs and apply the house precedence (argv WINS over env).
 *  Reads nothing else; writes nothing; never throws. */
export function enablementRequestFrom(
  argv: readonly string[],
  env: Record<string, string | undefined>,
): EnablementRequest

/** base ∪ persisted ∪ requested — order-preserving, deduplicated. PURE. */
export function effectiveEnabledGroups(
  base: readonly ToolGroup[],
  persisted: readonly string[],
  requested: readonly ToolGroup[],
): ToolGroup[]
```

**Return-shape rules (each is a test row in §4's `P-TP-1`):**

- `parseToolGroupList(null)` / `(undefined)` / `('')` ⇒ **`{ ok: true, requested: [], source: 'none', raw: null }`**. **THE EMPTY VALUE IS "NO REQUEST", NOT A REFUSAL** — an env var that an operator left **unset** and an operator who deliberately exported an **empty** string are indistinguishable at this layer, and refusing them would break `P-5`'s honest "unset means default" for a shell that exports empty. **An EMPTY FLAG (`--enable-tool-groups=`) is NOT the same case and IS a refusal** (item 6): the flag's presence is an explicit statement of intent, and an empty one is a shell-expansion accident.
- `source` is **`'argv'`** when the flag is present and well-formed, **`'env'`** when only the env var supplied a value, **`'none'`** when neither did. **A present-but-REFUSED argv value is `ok: false` and never falls through to env** (a typo must not be masked by another input).
- `effectiveEnabledGroups` **preserves `base`'s order first**, then adds `persisted`'s unseen names, then `requested`'s — so the effective set is **deterministic** and **testable by equality**, never by set-membership alone.

#### `A-1` item 6 — THE FAIL-CLOSED BEHAVIOURS (every malformed/unknown/missing case, ruled)

**RULING: A REFUSED LAUNCH IS A **NAMED REFUSAL**, AND THE PROCESS EXITS `2` BEFORE THE MCP SURFACE EXISTS.**
Not "ignore the bad name", not "boot with the default", not "boot partially".

| # | The launch input | What happens | The stderr line (exact shape) |
| --- | --- | --- | --- |
| **1** | **Unknown group name** — `--enable-tool-groups=graph,typo`, `PROVIDENT_ENABLE_TOOL_GROUPS=nope` | **REFUSED**; `app.exit(2)`; **no window, no MCP server, no `tools/list`** | `[provident-main] --enable-tool-groups REFUSED: 'typo' is not a tool group (read, dispatch, graph, code, module, rag, edit, gnosis, gnosis-edit); the launch is aborted before the MCP surface starts` |
| **2** | **Malformed value — empty flag** — `--enable-tool-groups=` | **REFUSED** (an explicitly empty value is an accident, not a default) | `[provident-main] --enable-tool-groups REFUSED: the value is EMPTY (a present flag with no value is a malformed request, not a default); the launch is aborted before the MCP surface starts` |
| **3** | **Malformed value — empty token inside a list** — `graph,,rag` · leading/trailing `,` | **REFUSED**, naming the empty token's position | `… REFUSED: the value 'graph,,rag' contains an EMPTY group name at position 2 …` |
| **4** | **Malformed value — whitespace** — `graph, rag` · ` graph` · `graph ` | **REFUSED** (no trimming; the offender is quoted with its whitespace visible) | `… REFUSED: the value 'graph, rag' contains ' rag', which is not a tool group …` |
| **5** | **Malformed value — non-string / non-`=` form** — `--enable-tool-groups` (no `=`), `--enable-tool-groups graph` | **REFUSED as a malformed FORM** (the house's flag convention is `=`-joined; a space-separated member cannot be distinguished from a positional argument) | `… REFUSED: the flag must be '--enable-tool-groups=<g1,g2,…>' (a space-separated or value-less form is not a member of this surface) …` |
| **6** | **The flag appears TWICE** in argv | **REFUSED** (ambiguous: which one wins is not a contract) | `… REFUSED: '--enable-tool-groups=' appears 2 times in argv; exactly one is required …` |
| **7** | **A group the BUILD does not have** — a name that is in no build's vocabulary (e.g. a group from a newer tree) | **THE SAME AS #1**: the vocabulary is the **build's own** nine (`S-4`), and a name outside it is an unknown name. **There is no "declared but unbuilt" state**: a group is a `ToolGroup` literal or it is unknown, so this case cannot be distinguished from a typo **by design** — and the refusal text lists the vocabulary the build DOES have so the omission is visible | as #1 |
| **8** | **Case variant** — `Graph` | **REFUSED** (no case folding; `Graph` ≠ `graph`) | `… REFUSED: 'Graph' is not a tool group (… lowercase names only) …` |
| **9** | **Duplicates** — `graph,graph` | **ACCEPTED**, deduplicated (idempotent, not an error) | (none — the normal boot line, below) |
| **10** | **The default restatement** — `read,dispatch` | **ACCEPTED**, a no-op (item 2 item 2's additivity) | (none) |
| **11** | **Both inputs well-formed** | **argv WINS**; the env value is **ignored entirely** (not merged) | (none) |
| **12** | **A well-formed request** | normal boot; ONE line naming the effective set (below) | `[provident-main] tool groups: base=[read, dispatch] persisted=[] requested=[graph] effective=[read, dispatch, graph] (source=argv)` |
| **13** | **No request** | normal boot, **no census line changes**, no new line beyond today's | `[… tool groups: base=[read, dispatch] persisted=[] requested=[] effective=[read, dispatch] (source=none)]` — **the line is emitted in BOTH cases so its presence is not itself a flag-detector**; it carries **no request semantics** and is a **log line only** (never a reply member) |

**The refusal's placement is part of the contract**: the check runs **after** the security store is read (so the
line can name `persisted`) and **before** `new SecurityGate(...)`, before `new BrowserWindow(...)`, and before
`mcp.start()`. **A refused launch therefore presents NO MCP surface, and a client's connect attempt fails at the
transport — which the divergence leg's existing fail-loud classifier already reports with the child's stderr
tail** (`classifyBootFailure`, `reportBootFailure`; `scripts/electron-divergence.mjs`), i.e. **the refusal is
readable by the instrument that needs it**, and the refusal text is in that tail.

### 2.2 `B-1` — THE READINESS OBSERVABLE

#### `B-1` item 1 — THE RULED OBSERVABLE

**RULED: A `boot` MEMBER ON THE EXISTING `read`-GROUP TOOL `provident.list_targets` (and on its resource
mirror `mcp://provident/targets`), PRESENT ONLY WHEN THE LAUNCH OPTED IN** (i.e. when the `A-1` route supplied
at least one group). **The member carries the app's INITIAL BOOT-INSTALL state, transitions through exactly
three observable statuses, and is pollable by any client that can call a default-group read tool.**

**Why this carrier, stated as the rejection of the alternatives:**

| Candidate | Ruled? | Why |
| --- | --- | --- |
| **a `boot` member on `provident.list_targets`** | **RULED** | (i) it is the **`read`-group tool the sibling's leg already drives for its own readiness probe** (`docs/specs/unit-divergence-drive-fixture.md` §2.2 `C-2` item 1 / §2.2 item 5; `S-6`), so the leg gains the wait **on the same call it already makes**, with **no new tool call of its own**; (ii) its handler is **thin and synchronous** (`backend.invoke('listTargets')` → `Runtime.listTargets()`), so the member adds **no round trip** beyond the one the client already pays; (iii) its reply's declared type (`ListTargetsResult = { nodes }`) and the runtime's return are **not moved** — the member is attached **in the MCP handler**, so the renderer, the battery host and every node-suite caller of `Runtime.listTargets()` see **exactly today's value**. |
| **a NEW read-group tool** (e.g. `provident.get_boot_state`) | **REFUSED** | a new registered tool **moves the default tool census** — the one number `O-4` is measured in (`9 tools`) and the number the harness reads from `tools/list`. **`P-2` forbids it**, and `docs/specs/mcp-endpoint.md` §3's tool table would need a new row for a surface whose only consumer is an instrument. |
| **a NEW resource** | **REFUSED** | same census problem on the **resource** list (`resources/list`), plus the app's own security reasoning for keeping status OUT of resources: `docs/specs/mcp-endpoint.md` §6.2's `gnosis` note rejects a resource for engine status with the explicit reason *"a resource would be gated on the default-ON `read` group, leaking engine status"*. |
| **gating `mcp.start()` (serve/accept) until the install completes** | **REFUSED — DEADLOCK** | **the hazard the brief names, and it is structural**: the client's ONLY way to observe readiness is to connect, and `mcp.start()` is what accepts it. Gating the accept until an install that **needs a renderer round trip that itself needs the MCP surface** creates a cycle: `RendererBackend.invoke` already throws `renderer not ready (timeout 30000ms)` when no renderer signal arrives (`S-5`), and a second, coarser gate on top of it would turn a **pollable state** into a **wait with no observable**. **Refused.** |
| **an MCP notification/event** | **REFUSED as the contract carrier** (not as a possible addition) | a notification is **not pollable**: a client that subscribes late misses it, and the sibling's leg would need a subscription lifecycle plus a loss-tolerant fallback — i.e. **a poll underneath a subscription**. **The contract is the STATE**; if a later unit wants to push transitions as `resources/updated` on `mcp://provident/targets` (which the app already emits for graph changes), that is **additive and owes its own ruling** — it must not be the thing the leg waits on. |
| **a blind sleep / a fixed delay in the app or the leg** | **REFUSED** | the architect's order and the sibling's `C-2` item 3: *"a timing guess in a leg whose whole value is determinism is a review finding"*. **The `~250–540 ms` figure of `O-1` is an observation, NEVER a budget** (`F-6`). |

#### `B-1` item 2 — THE EXACT SHAPE

```
provident.list_targets  →  {
  nodes: [ …unchanged… ],
  boot: {                      // present IFF the launch opted in (§B-1 item 3)
    installed: boolean,        // true once the app's initial graph install has completed
    status: 'pending' | 'installed' | 'failed',
    epoch: number,             // ≥ 1: how many times the renderer has signalled ready (a reload re-arms)
    generation: number,        // ≥ 0: how many successful installs in THIS epoch
    error: string | null       // the failure text when status === 'failed'; null otherwise
  }
}
```

**Member-by-member semantics (each is a test row in §4 `P-SM-1`/`P-SM-2`):**

1. **`installed`** — **`true` after the app's own initial graph install has completed** and stays true for the
   life of the renderer's epoch. **It means "the app finished installing its own boot graph", NOT "the app is
   functional", NOT "a client's load landed"** (the sibling's load is the client's own act and is **not** what
   this flag reports — see `F-5`).
2. **`status`** — the **three-state** projection. `'pending'` = signalled-ready-or-not, install not observed;
   `'installed'` = observed complete; `'failed'` = the boot chain **reported a failure** (its own catch path
   fired). **`status` is the single member a client branches on; `installed` is the convenience boolean that
   must ALWAYS agree with it** (`installed === (status === 'installed')` — asserted as a row, because two
   members that can disagree are a lie waiting to be read).
3. **`epoch`** — starts at **`1`** (the member is present from the moment the MCP surface answers, and a launch
   that has not yet received the renderer's first ready signal is **`pending` in epoch 1**). **Every subsequent
   renderer `IPC_READY` (a reload) increments it**, and an epoch change **RESETS `status` to `'pending'` and
   `generation` to `0`** — a reload destroys the graph, so a client must not read the pre-reload install as
   current.
4. **`generation`** — increments on each **successful install inside the current epoch** (the boot install is
   the first; a later `loadAppGraph` triggered by a store change or a refresh is another). **A client that
   wants "has the graph been (re)installed since I started watching" reads `generation`, not `epoch`.**
5. **`error`** — non-null **only** when `status === 'failed'`; it carries the boot chain's own failure text
   (the string `renderer.ts` logs after `[provident-renderer] tab boot failed`), **so a failing boot is NAMED,
   not merely "pending forever"** (`F-4`).

#### `B-1` item 3 — PRESENCE, AND THE DEFAULT'S SILENCE (`P-6`)

1. **The `boot` member is present IFF the launch opted into the `A-1` route** (a well-formed request, i.e.
   `source === 'argv'` or `'env'`). **No opt-in ⇒ the reply is `{ nodes: [...] }` EXACTLY**, member-for-member,
   with no `boot` key at all — **not `boot: null`, not `boot: { installed: true }`**.
2. **The rule is enforced in MAIN, from the same resolved request the gate used** — never by the renderer, never
   by a client-supplied argument, and **never by a new tool-group name** (there is no `instrumentation` group).
3. **Why gate it at all (the honest statement of `O-4`'s sibling cost):** an unconditional member would change
   the default reply every client sees, contradicting `P-6`'s and `P-2`'s plain reading of "a normal launch is
   byte-for-byte today's behaviour". **The cost of gating is that a DEFAULT-launch client has no readiness
   observable** — accepted here, with `O-4` recording it as the open question.
4. **The resource mirror carries the same member** (`mcp://provident/targets`'s contents, which the app serves
   from the same `listTargets` read): a client reading the resource sees `{ nodes, boot }` under the opt-in and
   `{ nodes }` otherwise. **`mcp://provident/app` and the other read tools are NOT touched.**

#### `B-1` item 4 — THE LAYER, AND WHY THE RENDERER IS NOT TOUCHED

1. **The signal's source already exists in the app.** The renderer's boot chain is
   `void host.boot(runtime).then(() => bootTabs()).catch(…)` (`S-5`). **The `.then(...)` boundary IS "the app's
   initial graph install has completed"** — it is the app's own definition of the event, and this unit does not
   re-define it.
2. **The renderer's only change would be a second call on the existing bridge object** — and **it is not needed
   for this unit's landing**, because the **preload** can send the signal **without a renderer edit** only if
   something calls it. **Therefore, stated plainly and without hedging: THE OBSERVABLE'S SOURCE OF TRUTH IS THE
   RENDERER'S BOOT CHAIN, AND REACHING IT REQUIRES ONE CALL SITE — `bridge.<newMethod>()` added to the end of
   that chain.** This filing **permits** exactly that one line in `src/renderer/renderer.ts` **and nothing else
   in `src/renderer/**`** as the **narrowest form of the change**, and **requires the implementer to state in
   the DONE row which form they took**:

   - **form (i) — RENDERER CALL SITE (the ruled form):** one added call in `renderer.ts`'s boot chain
     (`.then(() => { bootTabs(); bridge.<newMethod>() })`-class), plus the preload method and the channel
     constant. **This is `src/renderer/**` and is therefore an EXPLICIT widening of §1.2's allow-list — granted
     HERE, bounded to ONE call site, and reported as such** (`E-2`'s carve-out).
   - **form (ii) — NO RENDERER EDIT (an alternative the implementer may take if it is exact):** the boot
     completion is inferred in **main** from an observable the renderer already produces **without** a new call
     — e.g. the first `app-graph-changed`/`IPC_NOTIFY` push for the boot's own load, or the renderer's reply to a
     main-issued read. **Ruled ADMISSIBLE ONLY IF the inference is EXACT for the boot install** (a
     heuristically-inferred "probably installed" is **refused**: it is the same class of guess as a sleep).
     **The implementer must justify it in the DONE row and the register's `P-SM-2` must still hold.**
3. **What the layer declaration means for honesty:** `boot.installed` is a **MAIN-PROCESS claim about a signal the
   renderer sent**, not an app-rendering claim. **A green on it says "the app's boot chain reported completion";
   it says NOTHING about pixels, layout, panes, CSS or the store's contents** (`RCA-11`/`RCA-12`).
4. **No renderer graph, envelope, template or pane byte is touched by this unit in either form.**

#### `B-1` item 5 — THE WAIT PROTOCOL (bounded, deterministic, and it is the CLIENT's)

**This is the CONTRACT the sibling leg's amendment must implement; it is also the protocol any client uses.**

```
1. CALL     provident.list_targets  ({})                       // a default-group read tool (S-6)
2. READ     reply.boot
              absent      → STOP: the app was launched WITHOUT the opt-in. NAMED failure (§3 F-2). Do NOT sleep.
              status 'installed' → the wait is SATISFIED. Proceed to the load step.
              status 'failed'    → STOP: NAMED failure carrying reply.boot.error (§3 F-4).
              status 'pending'   → re-call, at a fixed interval, until the DEADLINE.
3. DEADLINE a bounded wall-clock budget, pinned by the CLIENT (the leg's own constant), NOT by this contract's
            number. If the deadline passes with status still 'pending' → STOP: NAMED failure (§3 F-3).
4. AFTER SATISFACTION, a client MUST NOT re-wait. If it observes a REGRESSION (status leaves 'installed',
   or epoch advances) after satisfaction, that is a NAMED failure — never a re-wait, never an infinite loop
   (§3 F-5 / O-5).
```

1. **Every branch terminates.** There is **no unbounded wait anywhere**, and **no branch retries an exhausted
   condition**.
2. **The interval and the deadline are the client's.** This filing **rules the shape of the wait, not its
   numbers**: the leg's constants are the sibling unit's to pin (`E-3` names the number as the sibling's). **The
   only number-like fact this filing carries is `O-1`'s `~250–540 ms` observation, which is explicitly NOT a
   budget** (`F-6`) — it justifies **no** interval and **no** timeout.
3. **Polling is safe while pending** because of `B-5`: the pending read **never awaits the renderer**, so the
   poll cannot block on the very install it is waiting for.
4. **The protocol is ONE call, repeated.** The sibling's leg already performs exactly this call as its readiness
   probe; the amendment changes **what it reads** and **when it reads it**, not which tool it drives
   (`docs/specs/unit-divergence-drive-fixture.md` §2.2 `C-2` item 1 remains satisfied).

#### `B-1` item 6 — `B-5`, THE NO-BLOCKING CLAUSE (why the poll is a poll)

**`B-5`. WHILE `status === 'pending'`, THE `provident.list_targets` HANDLER MUST ANSWER FROM MAIN STATE ALONE —
IT MUST NOT `await backend.invoke('listTargets')`.** The reply in that state is:

```
{ nodes: [], boot: { installed: false, status: 'pending', epoch, generation: 0, error: null } }
```

1. **Reason, stated as the hazard it removes:** `RendererBackend.invoke` awaits the renderer's ready promise with
   a **30 000 ms** timeout and then a per-request **60 000 ms** timeout (`S-5`). A poll that routed to the
   renderer before it signalled ready would therefore **block for tens of seconds per poll** — turning a bounded
   wait into an unbounded one, from the client's point of view. **The short-circuit makes the poll cheap and the
   bound real.**
2. **`nodes: []` in the pending state is HONEST, not a lie**: the renderer has not yet reported ready, so the
   app has **no installed graph** to address, and an empty target list is the truth. **It is never returned once
   `status` is `'installed'`** (`P-2`/`P-6`: a satisfied client reads the real list).
3. **The shortcut is reachable ONLY under the opt-in** (it is the same condition that makes the member present),
   so **no default-launch client can ever observe `nodes: []` from it**.
4. **After `'installed'`, the handler is exactly today's handler** — one `backend.invoke('listTargets', {})` —
   with the `boot` member attached to the reply.

### 2.3 `R-1`…`R-5` — THE REFUSED ALTERNATIVES (each by name, with its cost)

| # | The alternative | Ruling, and the reason |
| --- | --- | --- |
| **`R-1`** | **A HARNESS-SIDE WRITE into the app's persisted security config** (seeding `provident-security.json` inside the scratch profile before boot — the route `O-1`'s own experiment used). | **REFUSED.** It is forbidden by the sibling contract (**`C-1` item 4**: the load step is *"not a spawn argument"*; **`C-2` item 3**: no timing/side-channel fix) and by the architect's order. **Beyond the clause, why it is wrong on its merits:** it makes the instrument **write the app's operator-owned state** (a `userData` file whose only sanctioned writer is the manual-UI settings path, `S-2`), so the app's security posture becomes a **side effect of a test run**; and it would have to be **re-done per fresh scratch profile** (every spawn), i.e. **a per-spawn write outside any operator's view**. **Its one advantage — that it needs no app change — is exactly its defect: an app whose gate can only be opened by editing its files is an app whose grant route is undocumented.** |
| **`R-2`** | **AN MCP TOOL THAT GRANTS GROUPS** (any `provident.enable_group`-class member, or a `security.set`-class tool, or a tool argument that widens the gate). | **REFUSED BY NAME, ABSOLUTELY.** It would let **any connected client escalate its own privileges through the very surface the gate protects** — a **self-escalation hole**: the `read`+`dispatch` default exists precisely so an agent *"cannot add code or re-build the graph"* (`docs/specs/mcp-endpoint.md` §6.2), and `main.ts`'s own comment records the invariant (*"an agent cannot grant itself capabilities"*, `S-2`). **A tool that grants `graph`/`code` would also be a tool that grants `graph`/`code` TO AN UNTRUSTED LOOPBACK PEER** (`§6.1`'s threat model: *"the renderer's eval gate … is reachable by ANY peer on loopback"*). **The register asserts its ABSENCE as `P-TP-2`.** |
| **`R-3`** | **REQUEST-SET semantics** (`effective = requested`, i.e. the flag REPLACES the default). | **REFUSED.** Three costs: (i) `--enable-tool-groups=graph` would silently **turn `read`/`dispatch` OFF**, breaking every default-group consumer of that launch (the sibling's own leg drives read + dispatch tools — it would lose its probe); (ii) a typo'd or truncated value could **narrow** the surface in a way that looks like a security win but is a functional break; (iii) it makes the default a **thing you must restate**, so `P-1`'s "unchanged default" becomes conditional on every caller remembering it. **Additivity is the fail-safe direction** (`A-1` item 2 item 2). |
| **`R-4`** | **GATING `mcp.start()`/accept until the install completes.** | **REFUSED — DEADLOCK** (the full argument is `B-1` item 1's table row: the client observes readiness **through the connection the gate would withhold**, and `RendererBackend.invoke` already has a 30 s readiness timeout, so the result is a wait with **no observable at all**). **The rule this filing keeps instead: the transport must ALWAYS accept, and readiness is a STATE a client reads.** |
| **`R-5`** | **A BLIND SLEEP** in the leg, in the app, or anywhere (`await sleep(500)`, a retry-with-backoff that has no read, a `setTimeout` used as a "settle"). | **REFUSED.** The architect's order; the sibling's `C-2` item 3; and the observable now exists, so a sleep would be a **timing guess replacing a measurement**. **`F-6` states the follow-through: no number in this contract may be turned into a delay.** |

---

## 3. Mechanics and EVERY fail-state

### 3.0 The layer tag on each row

**`[T]`** = a main-process node-suite-assertable claim (the register's own layer). **`[D]`** = a harness-layer
claim. **`[live]`** = an assembled-app claim (NOT this unit's). **No row below claims `[live]`.**

### 3.1 The happy path, in exact order (a client's view of a well-formed opt-in launch)

1. The operator (or the harness) launches the app with `--enable-tool-groups=graph` **or**
   `PROVIDENT_ENABLE_TOOL_GROUPS=graph` in the spawn env. **`[T]`**
2. `main()` reads the request, logs the effective-set line, constructs the store, resolves
   `effective = union(['read','dispatch'], persisted, ['graph'])`, and constructs the gate with it. **`[T]`**
3. The MCP server registers the effective set's tools — **`provident.load` is among them** (`graph` is on) and
   the `read` tools are still there. **`[T]`**
4. A client connects; `tools/list` reports the effective set (the `O-4` census, **an observation**: §0.1 `O-2`).
   **`[T]`**
5. `provident.list_targets` answers with `boot.status = 'pending'` **immediately** (no renderer await, `B-5`).
   **`[T]`**
6. The renderer's boot chain completes → the boot signal → `status = 'installed'`, `installed: true`,
   `generation: 1`. **`[T]`** (the transition is main-side state; the *install itself* is the renderer's, and
   this unit asserts only the signal's effect)
7. The client's load (`provident.load` with the demo envelope) lands, **after** the install, and is **not
   replaced** (`F-5`). **`[T]`** for the ordering contract; **`[D]`** for the leg's observation of it.
8. The leg's readiness probe finds the demo ids and the leg drives. **`[D]`** (the sibling's class (b)).

### 3.2 Enumerated fail-states — ENABLEMENT (`F-1`…`F-9`) and READINESS (`F-2`-class, `F-3`…`F-5`)

| # | The state | The contract's answer | Layer |
| --- | --- | --- | --- |
| **`F-1`** | **A malformed / unknown / duplicate-flag / missing-`=` value** (`A-1` item 6 rows 1–8) | **REFUSED: ONE named stderr line + `app.exit(2)`, before the window and before `mcp.start()`.** The MCP surface never exists; a client's connect fails at the transport and the harness's existing `classifyBootFailure` tail carries the refusal text. **The process must NOT throw an unhandled rejection and must NOT exit `0`.** | `[T]` |
| **`F-2`** | **A client connects BEFORE the renderer's first ready signal, under the opt-in** | **`list_targets` answers `pending` with `nodes: []` and does NOT await the renderer** (`B-5`). No hang; the client's poll continues. **`get_rendered_html`/`dispatch`/`get_node_state` are NOT given this shortcut** — they keep today's behaviour (`invoke` waits up to `readyTimeoutMs`, then throws `renderer not ready (timeout 30000ms)`), **which is the pre-existing, documented fail-state and is PRESERVED** (`P-3`-class: this unit adds no new blocking behaviour to them). | `[T]` |
| **`F-3`** | **A client connects under the opt-in and `boot` is ABSENT** (impossible by construction — but a **legacy** app, a **different** build, or a **mis-set** env would present it) | The client's contract: **STOP with a NAMED failure** — *"the app did not opt in: `provident.list_targets` carries no `boot` member, so this app instance cannot report its boot-install state"*. **NEVER a sleep, NEVER a retry-forever.** On the harness side this is the exact class the sibling's `C-2` item 4 already demands (*"a refusal names itself"*). | `[T]`/`[D]` |
| **`F-4`** | **The boot chain FAILS** (`status === 'failed'`, `error` non-null) | The observable reports the failure **by name**, and the client **STOPS with that text**. **The app does not retry, does not hide the failure behind `pending`, and does not fall back to `installed`.** **Implementation requirement:** the boot chain's `.catch(...)` path (or its failure branch) must set `failed` — **a boot that fails and then leaves a graph installed must NOT report `installed`**, and a boot that fails with **no** graph installed **must report `failed`, not `pending` forever**. | `[T]` |
| **`F-5`** | **A boot install lands AFTER a client's load** (the `O-1` race, now observable) | **The observable is what makes this a DETECTABLE ordering, and the contract's demand is that the CLIENT not race it**: the leg's sequence becomes **connect → wait-for-`installed` → load → probe → drive** (the sibling's amendment, §9 `T-1`). **If a client loads BEFORE `installed` anyway, the app's behaviour is UNCHANGED from today** (`loadEnvelope` replaces the graph; `S-7`'s whole-graph replacement) — **this unit does NOT add a guard inside `Runtime.load`. A "refuse a load before boot" rule is REFUSED here: it would change the app's graph semantics for a harness's convenience, and it would break the app's own boot path, which loads over a booted graph (`S-7`).** | `[T]` |
| **`F-6`** | **A number is turned into a delay** (anyone reading `O-1`'s `~250–540 ms` as a budget, or `readyTimeoutMs`'s 30 000 as one) | **REFUSED BY CONTRACT.** This contract **pins no interval, no deadline and no delay**; it pins **the shape of the wait and its termination conditions** (`B-1` item 5). **The client's own constant is the client's, and the sibling unit's spec owns the leg's numbers.** | `[T]`/`[D]` |
| **`F-7`** | **The env fallback is inherited by a future child process** | **Disclosed, bounded, and owed review.** Today: the only `src/**` child spawn is a fixed `curl` with no env forwarding (`A-1` item 3 item 2). **A future child-spawn that forwards env MUST re-open this row** (the obligation is carried in §9 `T-4`). **The flag form carries no such exposure** (argv is not inherited by `execFile`'s fixed vector here), which is why argv is the PRIMARY spelling. | `[T]` |
| **`F-8`** | **A SECOND launch on the same profile** (two app processes sharing one `userData`) | **Outside this unit's contract, and unchanged:** the route is **launch-scoped per process**, and the divergence leg's isolation is the sibling's scratch-profile discipline (`--user-data-dir=<fresh mkdtemp>` per spawn, `S-8`). **A shared profile would race on `provident-security.json` exactly as it does today** (`security-store`'s write-through is not cross-process locked) — **this unit neither creates nor worsens that state, and it does NOT add a lock** (out of scope; a lock would be a `security-store` contract change). | `[T]` |
| **`F-9`** | **The flag is present but the LAUNCH is over HTTP with a token** | **The route grants groups only, and the gate's auth is unchanged** (`A-1` item 2 item 5): an HTTP client still needs the bearer token (`authorized`) and the group grant **and** — for module tools — the `module`+`code` two-gate. **A group grant is never a substitute for the token, and vice versa.** | `[T]` |

### 3.3 The numeric/census claims in this file, each with its source

1. **`9 tools` with `provident.load` absent** — the **implementer's** `tools/list` reading (`O-4`), **quoted,
   not re-measured**. **This file does NOT pin `9`**: `9` is the observation's own number.
2. **`tools/list 15` and `census.inTree 12`** on the **experimental seeded-profile** run (`O-1`) — **the
   implementer's** readings, quoted. **Neither is pinned here.**
3. **`~250–540 ms`** — the implementer's observation of the boot landing after `connect` (`O-1`), quoted **as an
   observation**, and **explicitly barred from use as a delay** (`F-6`).
4. **`app 32 vs shim 12`** (`data-node-id` set divergence, run A) and the run B error text — quoted readings.
5. **NINE tool groups** (`S-4`) — **read this pass** in `security.ts` and `security-store.ts`, and **pinned by
   the existing test row** `tests/blind-unit-ud5-list-documents-tool-greens.test.ts` (`groups` length 9).
6. **SIX read+dispatch tools at the default gate** — the **existing test's own words** (`tests/blind-security-gate.test.ts`: *"the read+dispatch 6"*), **read this pass**; the observed `9` is a different count (it includes the `code.get`/`code.validate` reads and the boot's own surface) and **this file does not reconcile the two** — **the reconciliation is the landing pass's `tools/list` reading** (`O-2`).
7. **NINE spawn-vector members, TWO spawn sites, `drive()`'s FOUR calls and EIGHT members** — the sibling unit's landed contract (`docs/specs/unit-divergence-drive-fixture.md` §10.3 items 4/5/6, read this pass), **quoted, not re-measured**.
8. **`readyTimeoutMs` 30 000 / `invokeTimeoutMs` 60 000** — **read this pass** in `src/main/mcp-server.ts` (`RendererBackend`'s constructor defaults). **Cited as the REASON for `B-5`'s short-circuit, never as a budget.**
9. **The register: `6` rows · `78` attempts total · largest row `24`** (§4.2; every term printed as the sum of its factors; `P-IM-1` `9` · `P-SM-1` `16` · `P-SM-2` `7` · `P-SM-3` `12` · `P-TP-1` `24` · `P-TP-2` `10`).
10. **NO test is retired, archived or re-pointed by this unit** — so the rebuild-archive policy's before→after count obligation is **not triggered**: the unit **edits four `src/main/**` files** (one of them additively), **possibly one line in `src/renderer/renderer.ts`** (`B-1` item 4 form (i)), and **adds two test files**. **The before/after reading is the new files' row counts and the pinned suite's unchanged tally**, stated in the DONE row (§8 `C-10`).

### 3.4 What the red set must NOT do

It must not **boot Electron** (a suite that spawns Electron turns every `npm test` into a host-capability
lottery) · must not **mock `'electron'`** (the protected bridge-mock name-set) · must not **import
`src/renderer/**`** (a renderer import in node drags the DOM surface in) · must not **run `npm run divergence`
from a unit row** (the leg's real run is the sibling's class (b), and a node row that spawns it would be a
hidden live gate inside the trio) · must not **read a `G-9`-frozen artefact as an oracle** (`vitest.config.ts`,
the vendored baselines, the bridge-capture fixture, the `package.json` pinned VALUES) · must not **assert a line
number** (a row pins a **property**) · must not **edit any existing test file**, and **never** a `PROTECTED`
file, a fence file, or the sibling units' red sets.

---

## 4. The typed Property register (code-bearing unit — no exemption is available)

### 4.1 Is this unit code-bearing? YES

**`AGENTS.md` item 11 makes the register a requirement for a code-bearing unit, and the zero-row exemption
covers only genuinely invariant-free / doc-only / config-only / non-JS units — NOT claimed here.** **The
register's subject is REAL and named by the filing brief:** *the default census under no flag · the census under
the flag · the fail-closed behaviour on a malformed value · the readiness observable's transitions · the absence
of a self-escalation route.*

**Execution discipline (the standing ruling's, unchanged):** deterministic — exhaustive/finite enumeration or a
**pinned-seed** generator; **caps: ≤ 100 attempts per row · ≤ 400 attempts total · stop-after-5**; each row
reports its **strategy id** and **`held`/`broken`**; the **adversarial pass audits it read-only**; the register
runs **offline, with no Electron and no `src/renderer/**` import**. **Pinned seed: `0x20261015`** (this filing's
date, in the house's hex form; the strategy ids are derived from it and from the row names, and are printed
below). **No new dependency** — plain deterministic vitest tables suffice.

**Only `P-IM-` / `P-SM-` / `P-TP-` rows appear. No `F-` row. No `§`-citation is a register row.** **Row ids are
namespaced to this unit's own files** and do **not** collide with the sibling units' registers
(`tests/unit-divergence-spawn-contract.test.ts`'s `P-IM-1..3`/`P-SM-1..3`/`P-TP-1..2`;
`tests/unit-divergence-fixture-contract.test.ts`'s `P-IM-1..3`/`P-SM-1..3`/`P-TP-1..2`) — **this unit's files are
separate files, and it edits NEITHER sibling**.

### 4.2 The register (`6` rows — every term printed as the sum of its factors)

| Row | Kind | The property | The terms of its attempt budget | Attempts |
| --- | --- | --- | --- | --- |
| **`P-IM-1`** | **INVARIANT** | **THE DEFAULT IS UNMOVED, AND THE REQUEST IS ADDITIVE.** With **no** flag and **no** env: `defaultSecurityConfig()` deep-equals `{ token: null, enabled: ['read','dispatch'] }`, reads no input, and returns a fresh object each call; `allowedToolNames()` under the default gate is **set-equal to the pre-change default set** and **excludes** `provident.load` and every other `graph`/`code`/`module`/`rag`/`edit`/`gnosis`/`gnosis-edit` tool; `effectiveEnabledGroups(base, persisted, requested)` returns `union` **in a deterministic order** for every draw, and `effective == base ∪ persisted` when `requested` is empty. | 2 inputs-absent arms (argv; env) + 2 default-surface arms (the default config's value; the default tool set's membership against a captured pre-change list) + 4 union draws (empty request; disjoint request; overlapping request; request re-naming `read`) + 1 freshness draw (two calls, independent objects) | **`2+2+4+1 = 9`** |
| **`P-SM-1`** | **STATE-MACHINE** | **THE READINESS OBSERVABLE'S TRANSITIONS ARE TOTAL AND CONSISTENT.** The four states `pending` → `installed` → `failed`, plus the reload re-arm (`epoch++`, `status` reset to `pending`, `generation` reset): every legal transition is reachable, every ILLEGAL one is not (`installed → pending` without an epoch advance is **not** produced by the state owner; `failed → installed` without a new epoch is **not** produced); `installed === (status === 'installed')` holds in **every** state; `error !== null` **iff** `status === 'failed'`; `generation` is `0` in `pending` and `≥ 1` in `installed`. | 4 states × 3 arms (the `installed`/`status` agreement; the `error` presence rule; the `generation` rule) + 2 legal-transition draws (boot completes; boot fails) + 2 negative draws (an illegal regression; a second install without an epoch change) | **`4*3+2+2 = 16`** |
| **`P-SM-2`** | **STATE-MACHINE** | **PRESENCE IS GATED BY THE OPT-IN, AND THE PENDING READ NEVER BLOCKS.** With the opt-in: the `boot` member is present in **every** state, and the `pending` read answers **synchronously from main state** with `nodes: []` **without awaiting the renderer** (asserted with a fake backend whose `invoke` is armed to reject or to hang — the row must still answer). Without the opt-in: the reply is **exactly `{ nodes: [...] }`** (a deep key-set check: no `boot` key at all). | 2 presence arms (opt-in; no opt-in) + 3 pending-read arms (`nodes: []`; the no-await property against a hanging `invoke`; the same property against a rejecting `invoke`) + 2 post-install arms (the real list is returned; the member is still present) | **`2+3+2 = 7`** |
| **`P-SM-3`** | **STATE-MACHINE** | **THE CLIENT'S WAIT PROTOCOL ALWAYS TERMINATES.** Enumerated over the `boot` member's states: **absent** ⇒ named stop; **`installed`** ⇒ satisfied; **`failed`** ⇒ named stop carrying `error`; **`pending`** until the deadline ⇒ named stop; **a regression after satisfaction** ⇒ named stop (never a re-wait). A simulated client with a **finite** deadline terminates on **every** state, and the row asserts it issued **no** unbounded loop (a call-count ceiling) and **no** sleep-equivalent (no timer-only branch). | 5 states/branches (absent · installed · failed · deadline · regression) × 2 arms (the named outcome text; termination) + 2 negative draws (a client that re-waits after satisfaction; a client that treats `absent` as `installed`) | **`5*2+2 = 12`** |
| **`P-TP-1`** | **TOTALITY** | **NO MALFORMED REQUEST CRASHES, AND EVERY REFUSAL IS NAMED.** Enumerated over `A-1` item 6's table: the empty flag, an empty list token, leading/trailing `,`, whitespace, no-`=`, a doubled flag, an unknown name, a case variant, `null`/`undefined`, and a non-string env value ⇒ **each returns `ok: false` with a non-empty `reason` and an `offender` where one exists; NONE throws**; and the accepted cases (duplicates; the default restatement; argv-over-env precedence) return `ok: true` with the deduplicated, ordered request. `effectiveEnabledGroups` is total over an empty/mixed `persisted` array. | 10 malformed shapes × 2 arms (no-throw; a non-empty named reason) + 3 accepted-shape draws (duplicates; the default restatement; argv precedence) + 1 totality draw (`effectiveEnabledGroups` over a mixed `persisted`) | **`10*2+3+1 = 24`** |
| **`P-TP-2`** | **TOTALITY** | **NO SELF-ESCALATION ROUTE EXISTS, AND NOTHING ELSE WIDENS.** Enumerated over the MCP surface: **no** tool name in `ALL_TOOLS`, **no** dynamic `module:<name>.<tool>` name, **no** resource URI, **no** tool ARGUMENT SCHEMA, and **no** notification/event enables or disables a group or writes the security config; `provident.list_targets`'s reply (and its resource contents) **cannot** carry a gate change; and the ONLY writers of the gate remain the manual-UI IPC handler and the launch-time resolution. The `boot` member is **not** a control surface: it is inert data whose only effect is what a client chooses to read. | 4 surfaces × 2 arms (no enable; no disable) + 2 draws (the `boot` member is inert; the manual-UI handler is the only live writer) | **`4*2+2 = 10`** |

**ARITHMETIC, printed with its terms:** `9 + 16 + 7 + 12 + 24 + 10 = 78` attempts total — **under the ≤ 400
cap**; **the largest single row is `P-TP-1` at 24**, **under the ≤ 100 cap**; **6 rows**, at the house cap of
≤ 8. **stop-after-5** on every row (`≤ 5` distinct counterexamples reported, then the row stops). **Seed
`0x20261015`; strategy ids:** `strat:app-harness-default-unmoved` · `strat:app-harness-boot-transitions` ·
`strat:app-harness-presence-and-pending` · `strat:app-harness-wait-protocol` ·
`strat:app-harness-request-totality` · `strat:app-harness-no-escalation`. **Every row reports `held`/`broken`;
the report prints each row's declared-vs-executed term.**

### 4.3 The register's own honesty limits

1. **No row asserts the leg's colour** — the divergence green is the sibling's class (b) (§6 `R-3`).
2. **No row asserts a rendered app** — no row imports `src/renderer/**` or boots Electron.
3. **`P-SM-2` requires a FAKE backend** (the `RendererBackend` seam's own shape): the row asserts the handler's
   behaviour **with a fake window/backend**, which is what the existing backend tests do — **it does not prove a
   real Electron's timing**; that is `O-1`/`O-5`'s own class.
4. **A row that cannot be executed at the filed shape is `BROKEN`, not silently re-scoped** — the landed reading
   is reported against the **declared** term (the house rule recorded by the sibling units' DONE rows).

---

## 5. The red-set plan (`RCA-1` — red FIRST, RUN, and REPORTED)

**The red set is authored by the TestWriter from §4 + §2, RUN, and its tally REPORTED before any
implementation** (`AGENTS.md` item 3; `RCA-1`). **Nothing in this section is a test this pass wrote, and nothing
here was run by this pass.**

### 5.1 The three classes, and which one is this unit's own gate

| # | Class | What it proves | What it CANNOT prove |
| --- | --- | --- | --- |
| **(a)** | **The no-boot source/unit class** — the majority of the red set: rows over the **pure functions** (`parseToolGroupList`, `enablementRequestFrom`, `effectiveEnabledGroups`), the **unchanged defaults** (`defaultSecurityConfig`, `VALID_GROUPS`, the default tool set), the **MCP handler's presence/pending behaviour with a fake backend**, and the **absence of a self-escalation surface** read from `ALL_TOOLS`/the resource definitions. **No Electron, no renderer import, no spawn.** | that the request parses totally and fails closed; that the default is unmoved; that the `boot` member is opt-in and its state machine is total; that the pending read does not block; that no route grants a group | that Electron **boots**; that the renderer's boot chain **signals**; that a real `tools/list` shows what the harness needs; that the leg is **green** |
| **(b)** | **The real-app class** — the rows that require a **real launch**: `npm run build` + the app booted with `--enable-tool-groups=graph` **and** with no flag, reading `tools/list`'s membership and the `boot` member's transition **on a live process**. **Runnable by hand or by a small script; NOT from a unit row** (§3.4). | that the route reaches a real gate; that the observable transitions on a real boot; the `tools/list` census readings (`O-2`) | that the app's UI works; that the leg is green |
| **(c)** | **The leg's own class** — `npm run divergence` reaching `R13 RESULT: <n> checks, 0 failures` with exit `0` | the sibling unit's whole claim (its `docs/specs/unit-divergence-drive-fixture.md` §3.3 `B-1`…`B-5`) | anything app-layer |

**`C-8`. THIS UNIT'S OWN GATE IS (b) — AND (c) IS A GATE IT UNBLOCKS, NOT ONE IT OWNS.**

1. **Class (a) makes the contract runnable before the change and regression-bearing after it; it is NOT the
   unit's gate** (`RCA-1`: a red set that never turns into a real reading is a self-verification).
2. **Class (b) is the unit's own gate:** the landing pass must run a real launch under **both** conditions and
   record **verbatim**: (i) `tools/list` membership with the flag (does `provident.load` appear? how many tools?
   — the `O-2` observation) and **without** it (the census and the absence of `provident.load`); (ii) the
   `boot` member's presence/transition (`pending` → `installed`) and its **ABSENCE** with no flag; (iii) the
   refusal path's stderr line for one malformed value, with the process's exit code.
3. **Class (c) is EXECUTABLE ONLY ONCE THIS UNIT LANDS — and it belongs to the sibling.** §6 `R-3` states this
   in full; the sibling's `E-3` is the escalation this unit answers.

### 5.2 The rows that FAIL AT THIS HEAD (class (a) — predicted by read, NOT run by this pass)

Each row is stated as the **property**, the **observation that must fail today**, and **why it fails**. Every
"fails today" claim is a **VERIFIED-BY-READ** of `S-1`…`S-11` — **this pass did not run the rows**, so the red
tally is **predicted by read, not measured**.

| # | Row | Why it FAILS at this head |
| --- | --- | --- |
| **`R-1`** | `parseToolGroupList` exists, is **pure**, and is **total** over the malformed shapes of `A-1` item 6. | **FAILS — the function does not exist** (`S-1`/`S-4`: `security.ts` exports `defaultSecurityConfig`, `applyPatch`, `toolAllowed`, `moduleToolAllowed`, `groupForTool`, `authorized`, `SecurityGate` — and **no launch-request parser**). |
| **`R-2`** | `enablementRequestFrom(argv, env)` exists and applies the house precedence (**argv wins; a present-but-malformed argv never falls through to env**). | **FAILS — the function does not exist.** |
| **`R-3`** | `effectiveEnabledGroups(base, persisted, requested)` exists, is **additive**, and is **deterministic in order**. | **FAILS — the function does not exist.** |
| **`R-4`** | **`main.ts` reads the request at boot and resolves the effective set BEFORE constructing the security gate**, and the gate is constructed from it (not from the persisted set alone). | **FAILS** — `S-2`/`S-3`: `main()` constructs `new SecurityGate({ token: persisted.token, enabled: persisted.enabled as ToolGroup[] })` with **no launch input consulted**. |
| **`R-5`** | **A refused launch exits `2` with a named stderr line, before the window and before `mcp.start()`.** | **FAILS — no refusal path exists** (the flag is unknown to the app today: `transportFromArgs`, `portFromArgs`, `retrievalEmbedderFromArgs` are the only arg readers, `S-2`). |
| **`R-6`** | **`defaultSecurityConfig()` is unchanged and reads no launch input** (a source+behaviour row: the body's returned object; no argv/env read in the function; two calls return independent objects). | **PASSES today and MUST keep passing** — `P-1`; the pin rows of `S-11`. *(This is the **preservation** row: it is the row that fails a change that moves the default.)* |
| **`R-7`** | **The default tool set is unmoved**: under the default gate, `allowedToolNames()` includes the read+dispatch set and **excludes** `provident.load`; **no new member is added to `ALL_TOOLS`** and **no new group name to the vocabulary**. | **PASSES today and MUST keep passing** — `P-2`/`S-11` (`tests/blind-security-gate.test.ts`'s *"the read+dispatch 6"* row already asserts the exclusion by name). |
| **`R-8`** | **A `boot` member exists on the `provident.list_targets` reply, with the exact shape and transition set of `B-1` item 2, present ONLY under the opt-in.** | **FAILS — the member does not exist** (`S-6`: the handler returns `text(await backend.invoke('listTargets', {}))`, and the runtime's value is `{ nodes }`). |
| **`R-9`** | **The pending read does not block**: with a fake backend whose `invoke` never settles, the handler still answers `pending` with `nodes: []`. | **FAILS — there is no short-circuit** (`S-6`/`S-5`: today's handler always awaits `backend.invoke`, whose readiness/per-request timeouts are **30 000 / 60 000 ms**). |
| **`R-10`** | **No self-escalation route**: no tool name, no resource, no argument schema and no notification enables/disables a group or writes the security config; the manual-UI IPC handler remains the only live writer. | **PASSES today and MUST keep passing** — `S-2` (main.ts's own comment: *"an agent cannot grant itself capabilities"*) and §2.2 `R-2`. *(This is the row that fails a future tool that grants groups.)* |
| **`R-11`** | **The pinned values are untouched**: `package.json`'s `divergence` reads **exactly** `npm run build && node scripts/electron-divergence.mjs`; `test`/`test:watch` carry **no** `--testTimeout`; `vitest.config.ts`'s `testTimeout` reads **exactly** `15_000`. | **PASSES today** — `S-12`; the protected file `tests/unit-v5-migration-contract.test.ts` §2c item 6 rows remain **the authority**, and a re-assertion here is **a cross-check only**. |

**⟨THE RED TALLY IS NOT PREDICTED HERE.⟩** Rows `R-1`…`R-5`, `R-8`, `R-9` are the **new-red** rows at this head;
`R-6`, `R-7`, `R-10`, `R-11` are **preservation/regression** rows that **pass today**. **The TestWriter reports
the executed tally and the red reasons** (`C-9`), and **the row count is the TestWriter's, not this filing's** —
this section fixes the **properties**, and a row that merges two properties into one row must say so.

### 5.3 Class (b) — the readings the real-launch rows must settle

**`C-9`.**

1. **B-1 — the default launch is unmoved, MEASURED.** With **no** flag and **no** env: `tools/list`'s membership
   and count (the `O-4` census — **does it read `9` with `provident.load` absent?**), and the
   `provident.list_targets` reply's **key set** (**must be `{ nodes }`, no `boot`**).
2. **B-2 — the opt-in launch reaches the gate.** With `--enable-tool-groups=graph`: `tools/list` includes
   **`provident.load`**, its count is **recorded verbatim** (never pinned, `O-2`), and the load step succeeds
   (the app answers, no `Tool provident.load not found`).
3. **B-3 — the observable transitions on a real boot.** The `boot` member reads `pending` at least once **before**
   the install and `installed` afterwards, with `epoch`/`generation`/`error` consistent (`P-SM-1`'s rules). **A
   reading where the first poll is ALREADY `installed`** is a legitimate reading and **must be recorded as such**
   — it does not falsify the observable (the app may install before the client's first call), and it is **exactly
   why a sleep is not needed**: the contract waits for the state, not for a duration.
4. **B-4 — the refusal is total and named.** One malformed launch (`--enable-tool-groups=nope`): the stderr line
   is **quoted verbatim**, the exit code is **`2`**, and **no MCP surface is reachable** (`tools/list` fails at
   the transport).
5. **B-5 — no live claim.** No battery is run or claimed; `scripts/live-drive.mjs` is **not** this unit's
   surface, and §7 `V-4` states what the unit does and does not assert about it.

### 5.4 The `§3a` SEED SET — adversarial probes, reserved in the house shape

**These are NOT tests this pass wrote.** They are **pre-registered falsification attempts** for the post-green
adversarial pass (`RCA-3`), each stated as a probe with its expected **honest** outcome. A probe that *passes*
against a claim here is a **finding**; the disposition column is filled by that pass.

| Probe id | The probe | The claim it tries to falsify | Disposition |
| --- | --- | --- | --- |
| **`A-1`** | Launch with the flag **and** a hostile env value (`PROVIDENT_ENABLE_TOOL_GROUPS=../../etc`, `graph;rm -rf /`, a 10 000-char value). | `P-TP-1` — every malformed value is a **named refusal or an accepted group list**, never a crash, a path, a shell interpolation, or a partially-applied gate. | **RESERVED** |
| **`A-2`** | Launch with `--enable-tool-groups=code` (an **eval-capable** group) and check what the token/persisted state does. | `A-1` item 2 item 5 / `F-9` — a group grant **never substitutes** for the token, and the route cannot set/clear the token. | **RESERVED** |
| **`A-3`** | Call every `read`/`dispatch` tool with every argument that could plausibly name a group (a `groups` argument, a `group` field, a `resource:`-shaped URI) and try to widen the gate. | `P-TP-2` — **no** tool argument, resource read or notification enables a group (the self-escalation hole stays closed). | **RESERVED** |
| **`A-4`** | Force a renderer reload mid-run (or a `did-finish-load` after the install) and read `boot` before/after. | `P-SM-1`'s reload re-arm + `F-5` — a regression is **observable** (`epoch` advances, `status` returns to `pending`) and a client that keeps waiting after satisfaction is the **bug**, not the contract. | **RESERVED** |
| **`A-5`** | Make the boot chain **reject** (a store/doc-heads fetch failure) and read `boot`. | `F-4` — the failure is **named** (`status: 'failed'`, `error` non-null), and `pending`-forever is not the outcome. | **RESERVED** |
| **`A-6`** | Poll `list_targets` in a tight loop from **two** simultaneous clients during the boot window. | `B-5` — the pending read is answered from main state, so N pollers cannot queue behind the renderer, and no poller can starve the install. | **RESERVED** |
| **`A-7`** | Start the app with the flag and **immediately** call `provident.load` (before `installed`). | `F-5` — the app's behaviour is **unchanged** (the boot replaces the load; the observable makes it detectable), and this unit has added **no** guard inside `Runtime.load`. **A silent "it works now" would be the finding.** | **RESERVED** |
| **`A-8`** | Launch with `--enable-tool-groups=read,dispatch,graph,code,module,rag,edit,gnosis,gnosis-edit` (all nine). | `A-1`/`P-2` — the route **cannot** widen the vocabulary (nine is the ceiling), cannot add a group, and its effect is exactly the union; the census then reflects **all** groups' tools and **still no new tool**. | **RESERVED** |
| **`A-9`** | Set the env var to a **well-formed** value **and** the flag to a **malformed** one. | `A-1` item 5's precedence item — **argv wins and a malformed argv REFUSES** (no silent fall-through to a valid env). | **RESERVED** |
| **`A-10`** | Run `scripts/live-drive.mjs`'s **spawn path** and diff what the app's gate sees. | `S-9`/§7 `V-4` — the live driver is **unaffected**: no flag, no env var, the default branch, the same census. | **RESERVED** |

### 5.5 The red-set readings the DONE row must carry (`RCA-1`'s record)

**`C-10`.** The DONE row states: **(i)** the **red tally** for class (a) as the TestWriter measured it —
`<rows> red / <rows> green out of <total>`, with the **red reasons** (the missing parser, the missing effective
set, the missing refusal, the missing member, the missing short-circuit) — **measured BEFORE the
implementation**; **(ii)** the **green tally** after the least-code implementation; **(iii)** the **class (b)**
readings **verbatim** (`C-9` B-1…B-4, including the `tools/list` counts and the refusal's exit code); **(iv)**
which `B-1` item 4 form was taken for the boot signal (**and, for form (ii), the exactness argument**); **(v)**
the **adversarial** disposition of §5.4 and the **item-10d documentation-review** record; **(vi)** **the layer on
every line** (`[T]` for every app-side claim; **no `[live]` claim**); **(vii)** the trio's readings (§7 `V-2`).
**An entry that claims green without a recorded red run is a review finding** (`RCA-1`).

---

## 6. The layer ledger, the interactions with the consumers, and the unblock story

### 6.1 The layer ledger

**`L-1`.** **Every app-side claim in this file is MAIN-PROCESS / `[T]`-layer.** The deliverable edits
`src/main/**` (+ the channel constant/preload + possibly ONE renderer call site, `B-1` item 4). **It renders
nothing, authors no envelope, and changes no graph.**

**`L-2`.** **What this unit does NOT prove even after a full green:** that the app's UI, panes, layout, CSS,
gestures or store round-trip behave (no rendered/assembled surface is asserted — `RCA-11`/`RCA-12`); that any
live battery row is green; that the app's boot graph is *correct* (only that its install **completed and was
reported**).

**`L-3`.** **What it DOES prove:** that a group can be enabled **at launch**, **without a profile side-write**,
**without moving the default**, and **without a client-escalation route**; and that an MCP client has a
**deterministic, bounded, named-failure observable** for the boot install where none existed.

**`L-4`.** **The divergence leg is still never app-green** — it remains a structural instrument in no trio,
collected by nothing. **A green on it after both units land states: the harness booted a real Electron,
confirmed the app's install, loaded the demo through the app's own route, and observed matching shim-stable
surfaces.**

### 6.2 The consumers, named

| Consumer | What this unit gives it | What it does NOT give it |
| --- | --- | --- |
| **`U-DIVERGENCE-FIXTURE`** (`docs/specs/unit-divergence-drive-fixture.md`) — its **leg 1** | the two capabilities it needs, exactly: **launch with the group enabled** (`A-1`'s env spelling, since its spawn vector is pinned, `S-8`) and **wait for the app's install to complete** (`B-1`'s observable via the tool it already calls) — after which its existing sequence (**load → probe → drive**) is executable | **its own amendment** (the env member, the bounded wait before `load`, the register/red-set updates) — §9 `T-1`; **and its colour** — its class (b) gate |
| **its `class (b)` gate** (`npm run divergence`) | **executability.** Before this unit: RED for `O-4` (the load is refused) and racing `O-1` (the boot replaces the load). After: the load is registrable and the ordering is observable | a green. **The run is the sibling's gate to run and report** (`R-3` below). |
| **`scripts/live-drive.mjs`** (the live driver) | **nothing — and that is the requirement.** It launches with **no flag and no env var** (`S-9`), so it takes the **default branch** (`P-1`/`P-2`/`P-6`): same gate, same tool census, same `list_targets` reply shape. **If any change here altered what it sees, this unit would be wrong** (§7 `V-4`) | any change to its scenarios, its ports, its seeding or its reports (it is DENIED surface). |
| **the program's mandatory pre-live leg (`A-7`)** | the path to green: `A-7` stays **RED until the divergence leg is green**, and the divergence leg is green only after **(this unit) + (the sibling's class (b))**. **This unit removes the app-side cause; it does not shorten the chain** | `A-7`'s own status. **A filing that claimed `A-7` green from this unit alone would be a review finding.** |
### 6.3 `R-3` — THE COLOUR'S OWNERSHIP (stated so no reader conflates the two units)

1. **This unit's DONE is an app-side source change + its readings.** Its own gate is class (b) of §5.1.
2. **The divergence leg's green is the SIBLING's class (b) gate**, and it **becomes executable only once this
   unit lands** — because before it, the leg's load step is refused (`O-4`) and its ordering is unobservable
   (`O-1`).
3. **Therefore the correct sequence is: (this unit lands) → (the sibling amends its leg + re-runs) → (its class
   (b) reading is recorded) → (`A-7`'s consumers may run their live gates).** **Any other ordering re-creates
   `O-4` or races `O-1`.**

---

## 7. Verification — which leg covers which layer, the trio, and the unblock story

**`V-1`.** **THE LAYER MAP (`RCA-12`), stated so no reader over-reads any green:**

| Claim | The instrument that covers it | The layer it is evidence for |
| --- | --- | --- |
| the request's totality, additivity, precedence, refusal | the new unit rows (class (a)) + the register (§4) | **MAIN-PROCESS `[T]`** |
| the default's unmoved shape (config, tool set, reply shape) | the new preservation rows + the **existing pinned security tests** (`S-11`, unedited) | **MAIN-PROCESS `[T]`** |
| the `boot` member's presence/transitions/no-blocking | the new state rows + the register's `P-SM-*` | **MAIN-PROCESS `[T]`** |
| the route and the observable on a **real process** | **class (b)** — a real `npm run build` + launch under both conditions | **MAIN-PROCESS `[T]` observed on a live process** — still **not** app-green |
| the leg boots, confirms the install, loads and drives | **`npm run divergence`** (the sibling's class (b)) | **HARNESS `[D]`**, a **precondition** for the live batteries |
| the live battery is unaffected | **`node scripts/live-drive.mjs`** (its own run) | **HARNESS `[D]`** — and **only** that |

**`V-2`.** **THE TRIO (`AGENTS.md` item 4) IS OWED AND REPORTED, because this unit touches `src/**`:**

```
npm test           # the two new files green; the existing security/MCP-gate/store suites green UNEDITED
npm run typecheck  # tsc --noEmit — exit 0
npm run build      # esbuild bundles (main cjs + preload cjs + renderer esm) — exit 0
```

**The carried baseline red `PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1` remains carried** and is **not** this unit's
to fix (`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1)); the DONE row states it as carried.

**`V-3`.** **THE TWO END-TO-END LEGS THIS UNIT EXISTS TO UNBLOCK.**

1. **`npm run divergence`** — the sibling unit's class (b), reaching **`R13 RESULT: <n> checks, 0 failures`**
   with exit `0`. **This filing states plainly: (i) that leg is RED today for `O-4`/`O-1`; (ii) its landing is
   what makes the leg's load step registrable and its ordering observable; (iii) the RUN and the reading belong
   to the sibling's landing pass**, recorded verbatim with its `<n>` and exit code. **`<n>` is an OBSERVATION,
   never a re-pin** (the sibling's `O-5`/`F-1a`: a new check is a pin drift, and this unit **adds no check to the
   leg**).
2. **`node scripts/live-drive.mjs`** — **UNCHANGED, and the claim is precise**: it drives under the default
   (`S-9`), so `P-1`/`P-2`/`P-6` make it see today's gate, today's census and today's reply shapes; its
   `boot`-less `list_targets` replies are the **default** branch. **The standing discipline applies to any run of
   it (`DECIDED: LIVE-GATE-RUN-DISCIPLINE`): isolated MCP + CDP ports, and boot-and-connect confirmed before
   driving — the recorded hazard being a concurrent sibling that holds CDP `:9222` and issues
   `pkill -f "electron \."`.** **This unit runs no live battery and claims no live row** (`C-9` B-5).

**`V-4`.** **`A-7`'s dependency chain, stated plainly:** `A-7` (the mandatory pre-live `npm run divergence` leg)
**stays RED until (this unit + the sibling's class (b)) are both landed**. **This unit removes the app-side
cause; it does not run the leg, and it retires no `A-7` obligation.**

**`V-5`.** **The DONE row's record shape** is §5.5 `C-10` plus `V-1`…`V-4`: the red tally **measured before the
implementation**, the green tally after it, the class (b) real-launch readings, the trio, the adversarial record,
the item-10d documentation review, and **the layer on every line**.

---

## 8. Decisions and defaults

**`D-1` — THE ENABLEMENT ROUTE IS RULED: `--enable-tool-groups=<g1,g2,…>`, with
`PROVIDENT_ENABLE_TOOL_GROUPS` as the ENV FALLBACK, argv winning, effective = `union(base, persisted,
requested)`, launch-scoped, never persisted, never subtractive** (§2.1). **Refused alternatives: `R-1` (the
profile side-write), `R-2` (an MCP group-granting tool — refused by name as a self-escalation hole), `R-3`
(request-set semantics), and any blind sleep (`R-5`).**

**`D-2` — THE REFUSAL POLICY IS RULED: a malformed, unknown, duplicated or empty-value request REFUSES THE
LAUNCH with ONE named stderr line and `app.exit(2)`, before the window and before `mcp.start()`** (§2.1 item 6).
**Silent tolerance is refused** — a silently-ignored group name would leave a harness waiting for a tool that
will never appear, which is `O-4` with a better-disguised symptom.

**`D-3` — THE READINESS OBSERVABLE IS RULED: the `boot` member on `provident.list_targets` (+ its resource
mirror), present IFF the launch opted in, with the exactly four-member state shape, the three-status projection,
the epoch/generation semantics, and the no-blocking pending reply** (§2.2 `B-1`). **Refused carriers: a new
tool, a new resource, gating the serve/accept (deadlock), and a notification as the contract carrier**
(`B-1` item 1's table).

**`D-4` — THE WAIT IS THE CLIENT'S, BOUNDED, AND NEVER A SLEEP** (§2.2 `B-1` item 5): the contract pins the
**protocol and its termination conditions**, the **client pins its own interval/deadline**, and **a regression
after satisfaction is a named failure, never a re-wait**.

**`D-5` — THE DEFAULT IS UNMOVED, AND THE PINNED TESTS STAY GREEN UNEDITED** (§1.5 `P-1`…`P-6`). **A change that
needs one of those tests edited is the wrong change.**

**`D-6` — THE HARNESS IS NOT TOUCHED BY THIS FILING** (`scripts/**` is DENIED surface): the leg's **use** of the
route and its **bounded wait** are the **sibling's amendment** (§9 `T-1`), and the **profile side-write stays
refused** (`R-1`).

**`D-7` — NO LIVE CLAIM.** The unit runs no battery and retires no `[T]`/live row; `scripts/live-drive.mjs` must
see no difference (§7 `V-3` item 2).

**`D-8` — NO NEW RUNTIME DEPENDENCY, NO NEW TOOL, NO NEW GROUP, NO NEW IPC METHOD BEYOND THE BOOT SIGNAL'S
ONE.** `ALL_TOOLS`, the nine-name group vocabulary, `ListTargetsResult`, `Runtime.listTargets()` and the
renderer's graph semantics are **unchanged**.

---

## 9. Owed items and escalations (each with an owner)

| # | Item | Owner | Why it is owed / escalated rather than decided here |
| --- | --- | --- | --- |
| **`T-1`** | **THE SIBLING AMENDMENT `U-DIVERGENCE-FIXTURE` NEEDS, itemized (NOT written by this pass).** Its leg 1 must: **(i)** launch with the group enabled — **via the env spelling**, because its spawn vector is pinned at nine members and `siteArgs` throws on a tenth (`S-8`), **and its own spec's `§1.4`/`§2.1 C-1` item 4 must be annotated to record the leg's env member** (its `R-8` preservation row group may need the corresponding extension — `O-3`); **(ii)** **wait (bounded, named-failure) for `boot.status === 'installed'` BEFORE its `load` step**, i.e. the sequence becomes **connect → wait → load → probe → drive** (its `C-1` item 3's *"after `connect`, BEFORE the first `drive` read"* is **refined, not contradicted**: the load now sits after the install, still before the first drive read); **(iii)** keep its readiness probe (`C-2`) exactly as it is — the `boot` member does **not** replace it: the probe reads **the load's own effect**, while `boot` reads **the app's install**; **(iv)** record the **two new readings** its class (b) run now produces (the install's observed status, the `tools/list` membership). | **THE SPEC-WRITER, on `docs/specs/unit-divergence-drive-fixture.md`** (a `§12`-class amendment, **another pass**) | This filing **may not edit that file** (§1.3), and it **does not amend it by implication**: it records the exact items and their owner. **A reader of the sibling spec must be able to see that its leg's two new steps are OWED here** — hence this row. |
| **`T-2`** | **THE `docs/specs/mcp-endpoint.md` AMENDMENTS (two), owed because this unit changes the contract text's subject.** **(i)** §6.2/§6.3: the manual-UI route is **no longer the only** setup path — a **launch-time, human/operator grant** now exists, with its syntax, its additivity, its refusal policy and its non-persistence; the sentence *"The manual-UI settings are how the HUMAN sets up the gate"* needs its scope widened to *"the HUMAN — in the Settings pane **or** at launch"*. **(ii)** §3's tool table: `provident.list_targets`'s row gains the **conditional `boot` member** with its presence rule (opt-in only) and its shape. | **THE SPEC-WRITER, on `docs/specs/mcp-endpoint.md`** | §0.2 `S-10`: the repo's own contract currently names ONE route and ONE reply shape, and this unit changes both **in a bounded, ruled way**. **Silence here would leave the app's primary contract contradicting the app** (`AGENTS.md` item 6's staleness rule). |
| **`T-3`** | **THE TRACKER ROWS: (i)** `docs/next-steps.md` — ONE anchored append for this filing (unit id, layer, the ruled route, the ruled observable, the register's arithmetic, the red-set shape and gate, the refusals by name, the owed items' owners); **(ii)** `docs/pending.md` — an anchored annotation on the divergence/mismatch row recording that **the app-side half now has a spec and an owner** (`U-APP-HARNESS-READINESS`) and that its revisit condition is the sibling's class (b) run; **(iii)** `docs/decisions.md` — a `DECIDED:` row for **the enablement route** and **the readiness observable** (the two rulings are decisions of record, and `D-1`/`D-3` are their text); **(iv)** `docs/defects.md` — the `O-4`/`O-1` halves get their own rows or an annotation on the existing `LIVE-DIVERGENCE-LEG-DRIVE-FIXTURE-MISMATCH` row, naming this unit as the app-side owner. **Anchored appends/annotations only — never a whole-file write** (`RCA-8(c)`); no existing row is rewritten. | **THE SUPERVISOR** (a tracker act, not a spec's) | Rows outside a spec's pen; this filing supplies the text. |
| **`T-4`** | **TWO STANDING OBLIGATIONS THIS UNIT CREATES:** **(i)** `F-7` — **a future `src/**` child-spawn that forwards env must re-open the env-fallback's custody question** (today the only spawn is a fixed `curl` with no env forwarding, `A-1` item 3 item 2); **(ii)** the **`G-9`-class pin check** — this unit edits `src/main/security.ts`/`main.ts`/`mcp-server.ts`/`preload.ts` (+ `src/shared/types.ts`), and the **landing pass must confirm none of them is in the repo's frozen set**, recording the reading either way. | **THE LANDING PASS** (this unit's) and **every later unit touching the same files** | Both are cheap to check and expensive to forget; neither is a design question. |
| **`E-1`** | **THE ONE OPEN ARCHITECT RULING THIS FILING LEAVES — `O-4`: WHETHER THE READINESS OBSERVABLE SHOULD BE PRESENT UNCONDITIONALLY (a default-launch client can then read it) RATHER THAN ONLY UNDER THE OPT-IN.** **The tension, stated plainly rather than decided silently: the GATED form is what makes `P-1`/`P-2`/`P-6`'s "a normal launch is byte-for-byte today's behaviour" literally true, and the COST is that the observable exists only for a launch that already opted into a group grant. The UNGATED form would give every client the observable and would change a default tool's reply for everyone.** **This filing RULES the gated form and records the alternative as this unit's single open ruling.** | **ARCHITECT** | It is a **contract-shape decision about the default surface** (what a default client sees), and it is **exactly the class the filing brief says to state rather than decide silently.** **The ruling needed is one line:** *is the default `list_targets` reply allowed to gain a member?* **If the answer is YES, the member becomes unconditional and `P-6` is amended by that ruling's owner; if NO, this filing's ruling stands as written.** |
| **`E-2`** | **THE RENDERER CALL SITE, STATED AS A WIDENING RATHER THAN A SILENT ASSUMPTION.** §2.2 `B-1` item 4 **grants** ONE call site in `src/renderer/renderer.ts` (form (i)) as the narrowest way to reach the boot chain's completion, and rules form (ii) admissible only if exact. **If an implementer finds that neither form is exact** — i.e. the only honest signal requires a broader renderer change — **the unit STOPS and escalates rather than widening `src/renderer/**`**. | **ARCHITECT** (if form (ii) cannot be made exact) | The renderer is `app`-layer surface; the whole unit is designed to avoid touching it, and a silent widen would be a review finding. |
| **`E-3`** | **THE LEG'S WAIT NUMBERS (interval, deadline) ARE THE SIBLING'S TO PIN, NOT THIS FILING'S.** This filing pins the **protocol** and forbids the number-as-delay (`F-6`); the sibling's spec owns the constants and must state them. | **THE SPEC-WRITER, on `docs/specs/unit-divergence-drive-fixture.md`** (with `T-1`) | A contract that pins another unit's constants invents a cross-unit dependency that has no enforcement surface. |
| **`E-4`** | **THE FIXTURE SINGLE-SOURCE-OF-TRUTH WORK REMAINS OWED AND IS NOT TOUCHED HERE** (`docs/specs/unit-divergence-harness-precondition.md` §9.1 `T-4`; the sibling carries it as its `E-2`). | **THE ARCHITECT (mint the unit) → then that unit's own cycle** | It is a **different deliverable** (a harness fixture/derivation change) from an app-side launch/observability change. |
| **`E-5`** | **ANY FOUNDATION-SIDE FINDING.** **Read this pass: NONE is discovered** — the foundation's precedent rows cited by the sibling (`DECIDED: THE DIVERGENCE HARNESS IS A TESTING TOOL AND IS IN THE UPDATE SCOPE`; its scratch-store practice around `provident.load` living in the `graph` group) are **consistent** with this unit's design, and **nothing in that tree needs a patch or a handoff for this unit**. | **Nobody** (recorded so a reader does not look for a handoff row that does not exist) | `AGENTS.md` item 7 makes a foundation finding a handoff: **the honest reading is "no row owed", and an empty search is a finding too.** |

---

## 10. The report the landing pass must make (the appends this filing owes)

**`C-11`.** The landing pass (implementer + TestWriter + adversarial + doc review) reports, **on every line
stating its layer**: **(1)** the red set's measured tally and reasons **before** the implementation, and the green
tally after it; **(2)** the class (b) real-launch readings (`C-9` B-1…B-4) **verbatim**, including the two
`tools/list` counts and the refusal's exit code; **(3)** the register's declared-vs-executed table, with
`held`/`broken` per row and the counterexamples (≤ 5 per row); **(4)** the trio's readings; **(5)** the
adversarial pass's disposition of §5.4's probes; **(6)** the item-10d documentation review (reconciling this
spec's names/shapes/counts against the landed code — `RCA-6`), recorded in
`archive/reviews/<date>-app-harness-readiness-doc-review.md`; **(7)** the `T-3` tracker rows; **(8)** **the two
`T-2` amendments' disposition** (owed: whether the sibling's pass wrote them); **(9)** `E-1`'s open ruling's
disposition (answered, or still open with the reading attached); **(10)** **the OWED `sha256` and line count of
this spec file** — **this pass held no shell and produces neither.**

**`C-12`.** **`docs/next-steps.md`'s DONE row must carry the two readings an app-side unit can be tempted to
overstate:** *"the leg is green"* **is NOT this unit's claim** (§6.3 `R-3`), and *"the app works"* is **never** a
claim of this unit (`L-2`).

---

## 11. Cross-references, and the census/numeric claims this file makes

### 11.1 The documents this unit serves and takes from

| Document | What this unit takes from it |
| --- | --- |
| `docs/specs/unit-divergence-drive-fixture.md` (the sibling) | **the two blockers' readings and their measurement context** (`§0.1 M-1`…`M-7`); **`§2.1 C-1` item 4** and **`§2.2 C-2` item 3** (the clauses that forbid the side-write and the sleep, and that make this filing the escalation); **`§8 E-3`** (the stop-condition this unit answers — *"the `O-1` race, if it turns out to need app-side sequencing of `ready()` behind the host boot, is exactly this case"*); **`§1.4 O-4`** (the group-state question); **`§3.3 B-1`…`B-5` and `C-8`** (the sibling's own gate, which this unit makes executable); **`§1.5`** (its denied surface, which the sibling amendment must honour) |
| `docs/specs/unit-divergence-harness-precondition.md` | **`§1.4 O-5`** (the count-is-an-observation rule, carried); **`§3.1 C-1`** and its nine-member spawn vector (the reason the env spelling is required, `S-8`); **`§9.1 T-4`** (the still-owed fixture single-source-of-truth class, `E-4`) |
| `docs/specs/mcp-endpoint.md` | **§3's tool table** (the reply shapes this unit's `boot` member attaches to — and the row `T-2` owes an amendment); **§6.1–§6.3** (the threat model, the group table, the *"explicit human grant"* principle, and the *"a token alone does NOT enable `code`/`graph`"* rule this unit's route must respect) |
| `docs/specs/post-division-rebuild-proposal.md` | **`§4.7 A-7` + `§7.5`**: `npm run divergence` is the **mandatory pre-live leg**, and `W6b`'s live pass must report `PRECONDITION-FAILED` with the reading attached until it is green (`RCA-11`) |
| `docs/decisions.md` | `DECIDED: LIVE-GATE-RUN-DISCIPLINE` (ACTIVE — isolated ports, boot-and-connect confirmed, the standing `pkill`/`:9222` hazard) · `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` (ACTIVE — the carried baseline red) |
| `docs/specs/rca-live-bugs-green-pipeline.md` (`RCA-11`/`RCA-12`) | the layer discipline, the parked-by-default prohibition, and the *"a node-green is envelope-green, not app-green"* rule this file obeys |
| `AGENTS.md` | items **3** (red first), **4** (the trio), **6** (the archival/active-tracker loop), **7** (the foundation non-modification rule + the defect catalogue), **10** (blind-greens + the item-10d doc review), **11** (the typed register and its caps) |
| `../Provident-Electron/**` | **cited only through the sibling's own reads** (its scratch security store, its `provident.load`-in-`graph`-group practice, its fixture rule) — **read-never-patched** (`AGENTS.md` item 7; the program's `G-8`) |

### 11.2 The source surfaces this filing READ (each read stated as such; reader: the SpecDoc)

`src/main/security.ts` · `src/main/security-store.ts` · `src/main/main.ts` · `src/main/mcp-server.ts` ·
`src/main/preload.ts` · `src/main/standalone.ts` · `src/main/battery-host.ts` · `src/main/embeddings.ts` ·
`src/renderer/renderer.ts` · `src/renderer/runtime.ts` · `src/shared/types.ts` ·
`scripts/electron-divergence.mjs` · `scripts/live-drive.mjs` · `scripts/start-app.sh` ·
`tests/blind-security-gate.test.ts` · `tests/security.test.ts` · `tests/module-security-gate.test.ts` ·
`tests/security-store.test.ts` · `tests/unit-divergence-spawn-contract.test.ts` ·
`tests/unit-divergence-fixture-contract.test.ts` · `tests/blind-unit-ud5-list-documents-tool-greens.test.ts` ·
`tests/unit-v5-migration-contract.test.ts` · `docs/specs/unit-divergence-drive-fixture.md` ·
`docs/specs/mcp-endpoint.md` · `docs/specs/post-division-rebuild-proposal.md` · `docs/decisions.md` ·
`docs/pending.md` · `docs/defects.md` · `docs/next-steps.md` · `AGENTS.md`.

### 11.3 Section-number and id discipline

**Every citation above is `path` + symbol / row id / `§section` — no line number is used as an address.** **The
section numbers used here are this file's own (`§0`…`§11`)**, with one deliberate exception stated so it is not
read as a collision: **`§3a`** appears only inside the phrase *"the `§3a` SEED SET"* (§5.4), which is the
**house's name for that reserved table** (the same name the sibling units' specs use), not a section of this
file. **Cross-cited sections of other documents are named with their own numbers as their passes wrote them and
are not renumbered here.** **The unit id `U-APP-HARNESS-READINESS` is minted by this filing; no other document
owns it.** **The sibling's id `U-DIVERGENCE-FIXTURE` is its own** (`docs/specs/unit-divergence-harness-precondition.md`
§9.1 `T-4` minted the class, `docs/specs/unit-divergence-drive-fixture.md` adopted it) and is cited, never
re-minted.
