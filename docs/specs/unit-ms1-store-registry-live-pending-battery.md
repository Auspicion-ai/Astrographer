# Unit MS1 — The Multi-Store RAG Registry: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-05.**
- **Source contract:** `docs/specs/unit-ms1-store-registry.md` §1–§6 (the boot
  split §5.3.3/§5.4, the byte-pinned census F1–F13 + G-load/G-dir + LOG-1,
  §5.5 H1–H14, §5.6 FS1–FS32, §5.7 B1–B5, §5.8 the census). **Census note
  (updated 2026-09-05 by the U-MS2 doc review):** the module's fail-loud
  census is now F1–F14 — F14 (the registry-file self-collision, the U-MS2
  adversarial batch F-MS2-1) was added to U-MS1's module WITHOUT renumbering
  F1–F13; the F14 live observable is the boot abort in §3.5-class fixtures
  (see the U-MS2 battery's Class B2).
- **Greens battery (blind-test, already run against the live MODULE):**
  `docs/specs/unit-ms1-store-registry-greens.md` — 35 scenarios,
  35 PASS / 0 FAIL after the F-BLIND-MS1-1 reconciliation (2026-09-05: the
  module's BigInt render IS the pinned `String(<value>)` fallback —
  ECMAScript `String(1n)` === `'1'`; the greens expectation `(got 1n)` was
  the drift; see §5 note 4).
- **Status:** **PARKED — NOT run against the live application.** U-MS1 is a PURE
  boot-time module with NO MCP tool, NO IPC channel, and NO renderer surface
  (spec §5.8 pins "no new MCP tool, no new IPC channel"); its consumption
  arrives with U-MS2 (`docs/specs/unit-ms2-store-wiring.md` — the registry
  loads in `main()`, replacing the single `createJsonRagStore` at
  `main.ts:118-120`). This battery is the handoff for a LATER iteration of the
  live-scenario runner, to be executed once U-MS2's wiring lands. Pattern
  precedent: `docs/specs/unit-v1-store-adjacency-live-pending-battery.md`.

---

## 1. Why this battery is parked (the live-surface assessment)

**IMPORTANT DIFFERENCE FROM THE V1 BATTERY: the app IS running this time.**
The Astrographer Electron app is up (process tree `npm exec electron . --no-sandbox`,
pid 295555) and its MCP HTTP server IS reachable on 127.0.0.1:3787
(`provident-electron` v0.1.0; streamable-HTTP at `/mcp`; `initialize` +
`tools/list` both succeeded this run). The park is therefore NOT an
app-down park — it is a **surface-absence park**, verified live:

- **MCP tools (live `tools/list`, 39 tools):** `code.template.*` (6),
  `edit.*` (7), `module.*` (3), `provident.*` (15), `rag.*` (5: `rag.query`,
  `rag.get_document`, `rag.list_nodes`, `rag.get_edges`, `rag.backlinks`).
  **No registry tool, no store-census tool** (A9 pins "no store-census MCP
  tool" for U-MS2 — correct today), and **no `rag.*`/`edit.*` tool schema
  carries a `store` property** (verified by parsing every `inputSchema` in the
  live `tools/list` response — the `store` selector is U-MS2's, not landed).
  Nothing in the live MCP surface can read, list, or even name a store.
- **Wiring (`src/main/main.ts`):** the boot sequence still constructs ONE RAG
  store directly — `createJsonRagStore({ path: join(app.getPath('userData'),
  'provident-rag.json') })` at `main.ts:118-120` — the exact legacy path the
  implicit entry must reproduce. A repo-wide grep for
  `rag-store-registry|loadRagStoreRegistry|provident-rag-stores` matches ONLY
  `src/main/rag-store-registry.ts` itself: **the module is never imported or
  called anywhere in `src/`**. U-MS2 (the registry→directory wiring in
  `main()`) has NOT landed.
- **Consequence:** the module is boot-time dead code in the running build. The
  three load outcomes (absent / corrupt / invalid) are UNREACHABLE at boot, and
  the module exposes nothing else. A negative control follows from this: even
  if a corrupt `provident-rag-stores.json` existed in the real userData
  (`/home/ryanr/.config/provident-electron/` — which has no such file today),
  the running app would ignore it entirely: no LOG-1, no abort, boot proceeds
  on the legacy store.
- **IPC / preload / renderer:** no channel, bridge method, or pane references
  the registry (the same repo-wide grep covers `src/`; `RagStoreListingPayload`
  is U-MS5's future type and does not exist in `src/shared/types.ts`).
- **Boot logs:** the fail-soft LOG-1 line and the fail-loud abort message are
  observables of the BOOT PROCESS (stdout/stderr + exit behavior), not of any
  MCP/UI endpoint. The currently running instance was launched elsewhere; its
  boot output is not capturable from this session, and relaunching the app to
  capture it is out of scope for this run (do-not-start constraint).

**Conclusion:** none of the 35 greens scenarios is live-observable this
iteration — not because the app is down, but because the module has ZERO live
surface until U-MS2 wires it into `main()`. Per the live-runner contract these
scenarios are **parked** (not failures) and recorded here for a later
iteration.

---

## 2. The live surfaces that WILL exercise the registry behavior (U-MS2, and U-MS5 secondarily)

Once U-MS2 lands (`src/main/main.ts`: the registry loads ONCE at boot from
`join(app.getPath('userData'), 'provident-rag-stores.json')`; N stores replace
the single construction at `main.ts:118-120`; the invalid-registry fail-loud
abort wired BEFORE the window; the optional `store` argument on ALL 12 MCP
tools), the following live surfaces become the registry's observability:

| Live surface | Unit | Registry behavior it exposes | How to drive it live |
| --- | --- | --- | --- |
| The boot process' stdout/stderr + exit behavior | U-MS2 | ALL THREE load outcomes: the absent-file silence, the corrupt-file LOG-1 line, the invalid-registry byte-pinned abort (F1–F13 as written; the census is now F1–F14 post-F-MS2-1 — see the source-contract census note above) | Launch the app with captured output (e.g. `npm start > boot.log 2>&1` from an isolated userData — see §5 prereq) and read the log / the exit. |
| The userData directory itself | U-MS2 (wiring) | The no-write-back pin (B2/B5): the registry file is never created/modified; derived store files (`provident-rag-<name>.json`, legacy `provident-rag.json` for name `main`) appear only on first WRITE of a store | Snapshot the dir + file bytes before/after boot; `Buffer.equals` / listing diff. |
| The `store` selector on the 12 MCP tools | U-MS2 (A9/B9) | `defaultStoreName` (an omitted `store` hits the default store); the resolved registry's store set is exercised per call; unknown store ⇒ fail-loud echoing ONLY the caller's input | Call `rag.query { … }` (omitted `store`) and `rag.query { …, store: '<name>' }`; compare results across stores. |
| The per-store persistence files | U-MS2 (wiring) | The derived-path rules + the name-`main` carve-out (H3/H5 — D3 data preservation) | After boot with a multi-store registry, inspect which `provident-*.json` files the stores open (first write); `main` must use the legacy `provident-rag.json`, NOT `provident-rag-main.json`. |
| The settings pane store listing | U-MS5 (`RagStoreListingPayload`) | The resolved registry as an operator-visible listing (names, default flag) | Read the rendered settings pane via `provident.get_rendered_html` / `provident.get_markdown`. |

**Prerequisite for the later run:** an ISOLATED test userData dir — on Linux
`app.getPath('appData')` follows `$XDG_CONFIG_HOME`/`$HOME`, so
`HOME=$(mktemp -d) npm start > boot.log 2>&1` boots against a scratch
`$HOME/.config/provident-electron/` without touching the real userData (the
real dir must never be modified by a battery). Do NOT plant files in
`/home/ryanr/.config/provident-electron/`. The MCP server must be reachable
after a successful boot (127.0.0.1:3787) for the selector-based probes.

---

## 3. The concrete live probes to run once U-MS2 lands

Each probe maps the parked greens scenarios (or scenario classes) to the live
observable. The "expected" column re-expresses the greens/spec expectation as
a live observable. A live result that CONTRADICTS the greens or the spec is a
finding (a regression or a doc/spec drift) — never a pass.

### P0 — the negative control (proves the park; runnable today, NOT runnable here)

| Step | Expected |
| --- | --- |
| With the CURRENT build (pre-U-MS2), place a corrupt `provident-rag-stores.json` (`{not json`) in the test userData and boot. | The file is INERT: no `[rag-store-registry]` log line, no abort, boot proceeds on the legacy `provident-rag.json` — the module is dead code. (Recorded here so a later iteration does not mistake the silence for a pass of the fail-soft path; the fail-soft path is only real once P2 fires.) |

### 3.1 Class L1 — the boot-time load outcomes (greens S01–S11, S14, S32, S35)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| S01 (H1, B1–B3) — absent registry | Boot with NO `provident-rag-stores.json` in the test userData; capture boot.log; call a `rag.*` tool (omitted `store`). | Boot SUCCEEDS; ZERO `[rag-store-registry]` lines in boot.log; the app serves the legacy `provident-rag.json` (zero-config byte-equality B1); no `provident-rag-stores.json` is created (B2). |
| S02/S03/S04/S05 (FS1–FS4, FS32) — the corrupt/unreadable family | Boot with, one at a time: a byte-garbage file (`{not json`), an EMPTY file, a DIRECTORY at the registry path, a permission-denied file (chmod 000), and a FIFO at the path (`mkfifo`, no writer). | Each boots SUCCESSFULLY (fail-soft); boot.log contains EXACTLY ONE `[rag-store-registry] registry file unreadable (<path>); falling back to the implicit main store` line with THAT path interpolated; the app runs the implicit main store (legacy path byte-equal). The FIFO sub-case proves the F-MS1-5 isFile probe: boot must NOT hang. |
| S32 (FS31) — the BOM strip | Boot with: BOM + a VALID registry; BOM + byte garbage; a second leading BOM; BOM + an invalid (`version: 2`) registry. | (a) normal boot, ZERO log; (b)+(c) fail-soft boot + LOG-1; (d) the fail-LOUD F2 abort (below). |
| S06–S09, S14 — the valid file-derived registries | Boot with one explicit store; with the D3 first-registry-write pair (`main` + `research-2026-09`); with 5 stores; with explicit `persistenceFile`/`corpusRoot`. | Boot succeeds; derived files used per the rules (`main` ⇒ legacy `provident-rag.json`, others ⇒ `provident-rag-<name>.json` — observable on first write); explicit paths/corpusRoot honored verbatim; the default store serves omitted-`store` tool calls (U-MS2 selector). |
| S35 (B5) — no-write-back with a PRESENT file | Snapshot the registry file bytes + dir listing before/after a valid boot AND a corrupt boot. | Byte-identical in both; no temp file, no extra file. |

### 3.2 Class L2 — the fail-LOUD invalid-registry aborts (greens S15–S30)

Every byte-pinned F-message is live-observable as a boot abort: the process
exits before the window opens (the `main.ts:156-158` vector-config precedent),
the message appears on boot stderr, and the MCP port 3787 never listens.

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| S15–S24 (FS5–FS19 → F1–F12) | Author each invalid registry in the test userData (top-level non-object; version missing/`2`/`"1"`/`true`; `stores` non-array; entry non-object; `name` missing/`''`/non-string; charset violations `Main`/`a.b`/`a:b`/`-a`/65-char; `default` non-boolean; `persistenceFile`/`corpusRoot` relative/`''`/NUL-byte; `embedder` present; duplicate names; `stores: []`; zero defaults; two defaults) and boot each. | Boot ABORTS before the window with the EXACT byte-pinned message from spec §5.4 (F1–F12) on stderr; no window; MCP port not listening. |
| S25–S27 (FS20–FS24 → F13) | Author the collision registries (explicit-vs-explicit; derived-vs-explicit in both orders; resolve-normalized; the `main` legacy-path collision). | Boot ABORTS with `rag-store-registry: persistence file collision: <resolvedPath> (stores '<earlier>', '<current>')` — the earlier store's name first. |
| S28 (F-MS1-2) | On this Linux host only the LEXICAL half is live-observable (case-differing paths do NOT abort). The darwin/win32 casefold half is a platform-stub behavior — NOT live-exercisable on this host. | linux: boot succeeds with `F.json`/`f.json` as distinct stores. |
| S29/S30 (FS25–FS28) | Author the precedence registries (name-before-embedder; Pass-A-before-B; B-before-C; C-before-D). | The FIRST failing pass's message aborts boot, byte-pinned (A→B→C→D order observable in which message appears). |

### 3.3 Permanently NOT live-exercisable (greens S12, S13, S28-darwin, S31, S33, S34)

These stay module-internal forever — no live surface will ever reach them;
they are covered by the module-level greens (already PASS) and are NOT
re-attempted live:

- **S12/S13** — pure-equivalence + statelessness (the loader adds only
  `path`/`implicit`/`corrupt`; no memoization): internal to the module call.
- **S28 (darwin half)** — the casefolded collision key under a
  `process.platform` stub: not exercisable on this Linux host.
- **S31 (G-load/G-dir)** — caller-error guards: the U-MS2 wiring always passes
  a valid absolute path + a non-empty registryDir; unreachable live.
- **S33** — the frozen/tamper-proof export: a module-consumer property.
- **S34** — `jsonOf` totality/BigInt rendering: a BigInt cannot appear in a
  `JSON.parse`-ed registry file (out-of-JSON-contract input class — the
  F-MS1-10 precondition).

(S19's 198-char render cap IS live-observable in the F6 abort message for an
oversized name — it belongs to class L2, not here.)

---

## 4. Parked-scenario census

- **Total greens scenarios:** 35 (`docs/specs/unit-ms1-store-registry-greens.md`).
- **Parked for the later live run (live-observable once U-MS2 lands):**
  S01–S11, S14–S30 (S28 by its LIVE linux half — §3.2), S32, S35 (+ S19's
  cap, within S19's abort message) = **30 scenario ids** across classes
  L1/L2.
- **Parked as NOT live-exercisable (internal/module-consumer properties, never
  reachable live):** S12, S13, S31, S33, S34 = **5 scenario ids**, plus the
  S28 darwin half (the split id's other half — §3.3).
- **Total parked:** 35 of 35 scenario ids (S28 counted once — its two halves
  land in the two classes). **Run live this iteration:** 0.
  (Census corrected 2026-09-05 by the doc review: the enumerated list counted
  29 ids against a stated 28, S28's live linux half was omitted from the
  live class, and "34 of 35" double-discounted the split id — the three rows
  are now internally consistent: 30 + 5 = 35, none run live.)
- **Not a failure:** U-MS1 is a PURE boot-time module whose consumption is
  U-MS2's wiring; the park is structural (spec §5.8: "no new MCP tool, no new
  IPC channel" — pinned BY the unit itself), not a regression.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** execute this battery when
   U-MS2's wiring lands — i.e. when `src/main/main.ts` calls
   `loadRagStoreRegistry({ path: join(app.getPath('userData'),
   'provident-rag-stores.json') })` at boot and the module is referenced
   outside itself (grep `loadRagStoreRegistry` across `src/` returns more than
   `src/main/rag-store-registry.ts`). U-MS5's settings listing (when it lands)
   adds the listing-based observability for the valid-registry scenarios.
2. **Prerequisites:** an isolated test userData (`HOME=$(mktemp -d) npm start
   > boot.log 2>&1`); NEVER the real `/home/ryanr/.config/provident-electron/`.
   For the post-boot probes the MCP server must be reachable on
   127.0.0.1:3787.
3. **A live result that CONTRADICTS the greens or spec §5.4/§5.6/§5.7 is a
   finding** (a real regression or a doc/spec drift) — never a pass. Report it
   to the supervisor.
4. **Carried context (RESOLVED 2026-09-05):** the greens' single FAIL
   (F-BLIND-MS1-1) was RECONCILED by the proofreader/doc-review pass — the
   module's BigInt render `(got 1)` IS the pinned `String(<value>)` fallback
   (ECMAScript `String(1n)` === `'1'`; the `n` exists only in BigInt literal
   source syntax), so the expectation `(got 1n)` was the drift, not the
   module; spec §5.4 carries the clarifying sentence and landed tests 54–55
   pin the rendering. NOT live-observable and NOT part of this battery; NO
   module change (the final greens tally is 35 PASS / 0 FAIL).
5. **Doc-staleness:** before running, reconcile this battery against the
   actual repo/build state — U-MS2's spec may renumber sections, the boot log
   line wording is byte-pinned in spec §5.4 (re-read it), and the tracker
   `docs/next-steps.md` multi-store block (last seen stating "U-MS1's
   TestWriter red is being delegated now" while U-MS1's implementation +
   greens already exist) needs its staleness pass before U-MS2 starts.
   [2026-09-05 U-MS1 doc review: that staleness pass has run — the CURRENT
   WORK block now records the post-cycle state (U-MS1 cycle COMPLETE through
   the doc review; the supervisor lands the DONE row; U-MS2's TestWriter red
   is next) and the trio baseline is 2239 pass / 38 skip (108 files).]
6. **P0 first:** re-confirm the dead-code state is gone (P0's inertness must
   FAIL after U-MS2 — the corrupt file must now produce LOG-1). If P0 still
   shows inertness, the wiring has not landed and the battery re-parks.