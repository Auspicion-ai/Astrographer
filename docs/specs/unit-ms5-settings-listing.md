# Spec — Unit MS5: Read-only settings-pane store listing + the `RagQueryPayload.store` passthrough (`provident:rag-store-listing` IPC)

- **Status:** SPEC (the multi-store Phase-1 slice, Unit U-MS5 of 5 — the LAST
  unit in the execution order U-MS1 → U-MS2 → U-MS4 → U-MS3 → U-MS5). Gate
  reference: `docs/specs/multi-document-store-config-review.md` §2 (decisions
  D1–D12), §8 (binding amendments A1–A10), §4 (the zero-config byte-equality
  table — binding acceptance criteria per A4), §3 (the unit decomposition
  table, U-MS5 row). Proposal:
  `docs/feature-requests/multi-document-store-config.md` (USER-APPROVED
  2026-09-05).
- **Decision rows:** `docs/decisions.md` **UI-SELECTOR-DEFERRED** (line 112 —
  the decision this unit lands), plus the sibling multi-store rows it consumes:
  **MULTI-STORE-REGISTRY** (`:105`), **SINGLE-WRITER-STORE-PER-STORE** (`:106`),
  **ENGINE-PER-STORE** (`:107`), **STORE-QUALIFIED-BROADCAST** (`:108`),
  **STORE-ID-PREFIX** (`:109`), **IMPORT-ROOT-PER-STORE** (`:110`),
  **VECTOR-TOPOLOGY-PER-STORE** (`:111`); and the consumed standing rows
  **PANE-PROVIDENT-AUTHORING** (`:34`), **OPERATOR-ISOLATED-GRAPHSCOPE** (`:36`),
  **UI-MOUNT-OPERATOR** (`:50`), **MCP-UI-EQUIVALENCE** (`:43`),
  **IPC-SURFACE-NOT-GROUP-GATED** (`:45`), **EDIT-COMMIT-RETURN-ASYMMETRY**
  (`:46`, the sibling of this unit's new asymmetry row).
- **Scope:** the NEW read-only `provident:rag-store-listing` IPC channel
  (constant + payload types + shared handler + `ipcMain.handle` registration +
  preload bridge method) returning the store registry's presentation view; the
  `RagStoreListingPayload`/`RagStoreListingEntry`/`RagStoreLoadStatus` shared
  types; the settings-pane store-listing section (provident-authored, mounted in
  the ISOLATED operator scope); the host's `lastStoreListing` cache + boot
  fetch; the `RagQueryPayload.store?: string` optional field with the
  `handleRagQueryIpc` passthrough (MCP/UI mechanical symmetry) while the
  settings/search pane's own query path passes nothing (the display-only
  asymmetry row). Files: `src/shared/types.ts`, `src/main/mcp-server.ts`,
  `src/main/preload.ts`, `src/main/main.ts`,
  `src/renderer/sidebar-panes.ts` (+ the structural `SidebarBridge` sync in the
  same file). This unit does NOT change the selector semantics on MCP tools
  (U-MS2), the broadcast payloads (U-MS3), or the import minting (U-MS4).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/shared/types.ts`,
  `src/main/mcp-server.ts`, `src/main/preload.ts`, `src/main/main.ts`, and
  `src/renderer/sidebar-panes.ts` from §5.8/§5.9 into
  `tests/unit-ms5-settings-listing.test.ts` before any implementation.

---

## 1. What the proposal asks (the U-MS5 slice)

1. **A read-only store listing appended to the operator settings pane**
   (D9): per configured store — the store `name`, the `default` flag, the
   persistence file name, the corpus root, and the per-store
   loaded/corrupt status. Authored as provident-ssr data in the ISOLATED
   operator scope (PANE-PROVIDENT-AUTHORING + OPERATOR-ISOLATED-GRAPHSCOPE hold
   — a pane rendered outside the graph is a review finding).
2. **A NEW read-only IPC channel + preload bridge method** returning the
   registry's presentation view (the listing data). The channel is NOT
   group-gated (IPC-SURFACE-NOT-GROUP-GATED, `decisions.md:45`) and NEVER
   MCP-visible.
3. **NO active-store switcher** (out of scope — the renderer boots/edits ONE
   store, the default; "the UI's active store" is a declared non-concept).
4. **`RagQueryPayload` gains the SAME optional `store?: string`** the MCP
   `rag.query` tool gains (U-MS2), forwarded by `handleRagQueryIpc`
   (`mcp-server.ts:195-204`, wired `main.ts:316-318`), so the MCP and UI
   surfaces stay mechanically symmetric — while the settings pane's own query
   path passes nothing; a non-default store's search results are DISPLAY-ONLY
   (one documented asymmetry row, sibling of EDIT-COMMIT-RETURN-ASYMMETRY).
5. **NO store-census MCP tool** — the configured store names are never
   enumerable by an agent (B9; the census is the operator UI only). The new IPC
   channel is NOT a five-seam gate seam (§5.9 fail-state 9 pins this so a later
   agent does not "fix" the census gap with an MCP `rag.list_stores` tool).
6. **Zero-config byte-equality (A4):** with no registry file, the settings
   listing shows exactly ONE entry (`main`, default, the legacy
   `provident-rag.json`, status `loaded`) and the renderer's query path is
   unchanged (§5.7).

## 2. Feasibility verdict

**Feasible — grounded in the existing `rag-doc-heads` IPC pattern, the
operator settings pane, and the conditional-spread payload idiom. No engine
gap; no foundation work.**

- **The new channel mirrors the Unit V3 `rag-doc-heads` pattern end-to-end:**
  the constant + payload in `shared/types.ts` (`IPC_RAG_DOC_HEADS` =
  `'provident:rag-doc-heads'`, `types.ts:484-495` — the house naming
  convention `IPC_<NAME> = 'provident:<kebab-name>'`, cf. the channel block
  `types.ts:323-326`), the shared main-process handler exported from
  `mcp-server.ts` for direct unit testing (`handleRagDocHeadsIpc`,
  `mcp-server.ts:226-258`), the `ipcMain.handle` wiring in `main.ts`
  (`main.ts:333-335`), and the bridge method in the `rag` namespace
  (`preload.ts:77-80` declaration, `:249-254` implementation). U-MS5 clones
  this four-part pattern with a pure registry presentation view instead of a
  store derivation.
- **The presentation view inputs already exist by U-MS5's position in the
  order:** the registry's loaded form (U-MS1 — the implicit `main` entry
  synthesis, the derived `persistenceFile`s, the resolved `corpusRoot`s) and
  the per-store load states (U-MS2 — the D7 matrix). This unit only PROJECTS
  them into the payload shape; it loads nothing, validates nothing, and
  mutates nothing.
- **The settings pane section is an additive child of the existing
  provident-authored `settingsContent()`** (`sidebar-panes.ts:810-841`), which
  already renders in the isolated operator scope via `mountOperator()` →
  `buildOperatorEnvelope` → `createIsolatedScope()` (`sidebar-panes.ts:515-538`;
  `unit-h-sidebar-panes.md` §5.4 + `unit-k-sidebar-panes-host.md` §5.4). No new
  mount, no new scope, no handler def.
- **The `RagQueryPayload.store` passthrough is the conditional-spread idiom
  already pinned at `preload.ts:232`** (`...(topK !== undefined ? { topK } :
  {})`) — a third optional field extends it mechanically; omitting it keeps the
  payload byte-equal (A4).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `provident:rag-store-listing` channel + the shared handler + the wiring | Project-specific (a new read-only IPC channel, the V3 pattern) | Low cost; the operator gets the Phase-1 census the B9-blocked MCP census cannot provide. |
| The `RagStoreListingPayload`/`Entry`/`RagStoreLoadStatus` types | Project-specific (additive shared types) | Low cost; the status union is ONE shared declaration (the A3 collapse lesson) coordinated with U-MS2's D7 matrix. |
| The `bridge.rag.stores()` method + the `rag.query` third param | Project-specific, BUT the `query` signature lives in TWO structural declarations (`ProvidentBridge` `preload.ts:66` + `SidebarBridge` `sidebar-panes.ts:81`) | Low cost; the two declarations must move in the SAME unit (the RCA-6 drift class — pinned by test, §5.3). |
| The settings-pane listing section + the host `lastStoreListing` cache + the boot fetch | Project-specific (an additive render + one fetch) | Low cost; read-only, no handlers, no re-derive coupling (D8 boot-time-only registry). |
| The `RagQueryPayload.store?` passthrough | Project-specific (one field + one forward + one wiring arg) | Near-zero cost; keeps MCP/UI mechanically symmetric (MCP-UI-EQUIVALENCE) without any UI control. |
| The display-only asymmetry | Documentation (a decisions.md row) | Zero code cost; `submitQuery` is UNCHANGED. |
| The status-enum coordination with U-MS2 | Project-specific (a shared declaration in `shared/types.ts`) | Low cost; a divergent re-declaration is a review finding (the RCA-6 class). |

No engine gap. The unit is entirely host-side (`src/`), pure-module-testable at
every seam.

### 3a. Adversarial findings (registered — the U-MS5 adversarial pass + the Architect's ruled fix batch)

The RCA-3 read-only adversarial pass on the U-MS5 green returned 5 findings
(F-MS5-1..F-MS5-5). The Architect ruled: **FIXED-WITH-REGRESSION** for F-MS5-2
(the wiring guard + the R-series regression in
`tests/unit-ms5-settings-listing.test.ts`), **DOCUMENTED** (spec notes, no
code) for F-MS5-3/F-MS5-4 (§5.5 + the §5.5/§5.6 compromise note),
**PROCESS** for F-MS5-1 (the RCA-6 documentation-review gate lands before the
unit's DONE row — this registration is part of it), **RECORDED-NO-CHANGE** for
F-MS5-5 (verified clean).

Red-first record (RCA-1): the F-MS5-2 R-tests were written FIRST and run RED
against the PRE-FIX wiring — the unguarded `storeLoadStatus(entries.get(name)!)`
resolver threw the UNPINNED `TypeError: Cannot read properties of undefined
(reading 'missing')` where the guarded resolver throws the byte-pinned
`rag-store-listing: no directory entry for store "<name>"`. (main.ts is
RELEGATED — never node-importable — so the R-tests drive the pinned resolver
through the RESOLVER/HANDLER seam: a stub directory MISSING the store the
listing names, wired as `handleRagStoreListingIpc`'s `statusOf`.) After the
fix: `tests/unit-ms5-settings-listing.test.ts` is 41 pass / 3 skip (39/3 +
the 2 F-MS5-2 R-tests).

| id | sev | problem (one line) | concrete input | ruling + fix shape as ruled |
| --- | --- | --- | --- | --- |
| F-MS5-1 | PROCESS | §3a was still the RCA-3 pre-green placeholder after the adversarial pass had run; the RCA-6 documentation-review gate (spec/`*-greens.md`/test-count reconciliation vs the actual build) must land BEFORE the unit's DONE row. | the §3a placeholder vs the pass's 5 findings | **PROCESS** — this registration (the FULL record below) lands BEFORE the DONE row, together with the mandated RCA-6 doc-review pass (mirrors F-MS4-9). |
| F-MS5-2 | LOW | The wiring resolver at `main.ts` (the §5.4 pinned expression) did `storeLoadStatus(plan.directory.entries.get(name)!)` — a name with NO matching directory entry (unreachable today: the directory derives from the SAME boot registry as `listingEntries`, and a failed store construction aborts boot) would make `storeLoadStatus(undefined)` throw an UNPINNED `TypeError`. | a `listingEntries`-style name with NO matching directory entry (a stub directory missing that store) ⇒ `Cannot read properties of undefined (reading 'missing')` | **FIXED-WITH-REGRESSION** — a byte-pinned guard in the resolver: `const e = plan.directory.entries.get(name); if (!e) throw new Error('rag-store-listing: no directory entry for store "<name>"'); return storeLoadStatus(e)`. The handler PINS three throws (§5.2 behavior 3); this is the WIRING's defensive fourth (§5.2 note). Regressions: the F-MS5-2 R-tests (missing-entry byte-pinned throw + present-entry coexistence through the resolver/handler seam). |
| F-MS5-3 | LOW | The boot listing fetch is AWAITED INLINE (matching the pre-existing operator-settings fetch pattern) — a never-settling `stores()` delays boot by design; fail-state 5's non-abort covers REJECTION, not NON-RESOLUTION. | a `bridge.rag.stores()` that neither resolves nor rejects ⇒ boot awaits it indefinitely (by design) | **DOCUMENTED** (spec note, §5.5 — no code): the awaited-inline availability note; the deliberate divergence from the snapshot/docHeads/template abort discipline covers rejection only. |
| F-MS5-4 | MEDIUM | The operator-isolated + never-MCP-visible guarantees assume an UNCOMPROMISED renderer: `IPC_RAG_STORE_LISTING` + the forwarded `store` on `IPC_RAG_QUERY` are NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED), so a compromised trusted renderer could enumerate stores + read non-default content. | a compromised renderer invoking `IPC_RAG_STORE_LISTING` + a `store`-bearing `IPC_RAG_QUERY` ⇒ store enumeration + non-default reads | **DOCUMENTED** (spec note, §5.5/§5.6 — no code): the accepted model; NO agent escalation (the IPC is not agent-reachable — no MCP tool/group-gate row exposes it; B9/A9/BE-7 keep the census operator-UI-only). |
| F-MS5-5 | INFO | verified-clean probe register — the negative pins (§5.9 fail 8–9) held against the landed code: no listing-node handlers/switcher, no new handler-def (census 12), no MCP store census, no group-gate seam, the channel absent from `RpcMethod`/`TOOL_GROUPS`/`ALL_TOOLS`/`MUTATING_METHODS`. | the §5.9 fail 8–9 negative pins vs the landed module (already pinned GREEN-guard in the test file) | **RECORDED-NO-CHANGE** — transcribed verbatim; no code, no spec change (verified clean). |

### 3b. Proposal-review findings folded in

From `docs/specs/multi-document-store-config-review.md`:

- **D9 (`§2`) — the UI scope.** The listing is read-only, operator-isolated,
  fed by the new channel; NO switcher; `RagQueryPayload.store?` for mechanical
  symmetry. Pinned in §4 + §5.
- **A2 — the IPC/UI store matrix.** `rag-query` gains optional `store`;
  `rag-snapshot`/`rag-backlinks`/`rag-doc-heads`/`edit-commit`/`edit-batch`/
  `edit-rich-commit` stay default-store-bound (NOT touched by this unit); a
  non-default search result is display-only — one documented-asymmetry decision
  row (§5.6). Risk register R9 pins it.
- **A4 — the §4 byte-equality itemization is binding acceptance criteria**,
  explicitly enumerating the one intentional zero-config delta (broadcast/
  result `store:'main'` — U-MS3/U-MS2's rows, cited not restated). Pinned in
  §5.7.
- **A9 — no store-census tool; unknown-store errors echo only the caller's
  input.** This unit's negative pins (§5.9 fail-states 8–9) + the explicit
  NOT-a-five-seam-gate-seam statement. Risk register R8 (error echo) is U-MS2's
  row; R9 (the display-only pin) is this unit's.
- **D8 (`§2`) — registry mutation timing.** Boot-time-only registry ⇒ the
  listing is fetched at boot from the IN-MEMORY loaded form and never re-reads
  the file; a registry file changed while running is observed only after
  restart (§5.4 + §5.9 fail-state 10).

## 4. Design decisions pinned by this spec

- **UI-SELECTOR-DEFERRED (landed by this unit):** the Phase-1 UI surface is the
  read-only settings-pane store listing + the `RagQueryPayload.store?`
  passthrough; NO active-store switcher; NO store-census MCP tool. Every
  sub-decision below is a refinement of this row (`decisions.md:112`).
- **STORE-LISTING-IPC (new, lands with the unit):** a read-only
  renderer→main IPC channel `provident:rag-store-listing` returning the
  registry's presentation view. NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED);
  NEVER MCP-visible; NOT a five-seam gate seam (no `RpcMethod`, no
  `TOOL_GROUPS` row, no `ALL_TOOLS` row, no `MUTATING_METHODS` member, no
  renderer-switch method).
- **STORE-LISTING-PROVIDENT-AUTHORED (new):** the listing is authored as
  provident-ssr data inside `settingsContent()`'s `section` and mounts in the
  isolated operator scope (PANE-PROVIDENT-AUTHORING +
  OPERATOR-ISOLATED-GRAPHSCOPE). A listing rendered outside the provident graph
  or inside the app graph is a review finding.
- **STORE-LISTING-BOOT-CACHED (new):** the host fetches the listing ONCE at
  boot into `lastStoreListing` and re-renders it from the cache on every
  operator re-mount/re-derive; the channel handler reads the IN-MEMORY
  boot-loaded registry form, never the registry file (D8 — a mid-run registry
  edit is observed only after restart).
- **STORE-LISTING-STATUS-SHARED (new):** `RagStoreLoadStatus` is declared ONCE
  in `src/shared/types.ts`; its three members are exactly the D7 failed-store
  matrix (`loaded` / `failed-corrupt` / `failed-missing`) that U-MS2's per-store
  status derivation produces. One shared declaration, no structural copies (the
  A3 collapse lesson applied proactively).
- **RAG-QUERY-STORE-DISPLAY-ASYMMETRY (new decision row, lands in
  `docs/decisions.md` when the unit lands — sibling of
  EDIT-COMMIT-RETURN-ASYMMETRY `decisions.md:46`):** the MCP `rag.query` tool
  and the `rag-query` IPC are mechanically symmetric on the OPTIONAL `store`
  field (the same payload type, the same shared handler, the same resolver),
  while the renderer's OWN query path (`submitQuery`) NEVER passes a store; a
  non-default-store result is DISPLAY-ONLY in the search pane (no navigation
  path — §5.6). No UI control to produce one exists in Phase 1.
- **SINGLE-WRITER-STORE (consumed):** the listing channel READS the main-process
  registry/store state through main only; the renderer has no store access.

## 5. The exhaustive contract

### 5.1 The shared types (`src/shared/types.ts`)

**New section — the store-listing IPC (placed immediately after the Unit V3
doc-heads block, `types.ts:484-495`, as a sibling `// ---- U-MS5 ... ----`
section):**

```ts
// ---- U-MS5 store-listing IPC (docs/specs/unit-ms5-settings-listing.md §5.1) --

/** U-MS5 — a store's load status as presented in the settings-pane listing.
 *  The THREE members and their meanings are the D7 failed-store matrix
 *  (multi-document-store-config-review.md §2 D7): `loaded` (the store loaded
 *  normally); `failed-corrupt` (loads empty + corrupt flag — serves EMPTY, the
 *  per-store fail-disabled semantics); `failed-missing` (absent file = first-run
 *  empty store — NOT an error state). This shared declaration is the SINGLE
 *  source, coordinated with U-MS2's per-store status derivation
 *  (docs/specs/unit-ms2-store-wiring.md) — a divergent re-declaration is a
 *  review finding (the A3/RCA-6 drift class). */
export type RagStoreLoadStatus = 'loaded' | 'failed-corrupt' | 'failed-missing'

/** One entry of the registry's presentation view. `persistenceFile` is the
 *  persistence file NAME — the BASENAME of U-MS1's resolved absolute path,
 *  projected by the §5.4 wiring adapter (`basename(entry.persistenceFile)`,
 *  F7): the derived names are `provident-rag-<name>.json`, or the legacy
 *  `provident-rag.json` for the name `main` (U-MS1's derivation rules), and
 *  an explicitly configured absolute path contributes its basename (e.g.
 *  `<dir>/scratch.json` → `scratch.json`). `corpusRoot` is
 *  the CONFIGURED absolute corpus root, or `null` when the entry configures
 *  none (the importer's own `process.cwd()` resolution at import time is the
 *  importer's rule, NOT the listing's — the listing displays the config, and
 *  the pane renders null as `(project root)`). */
export interface RagStoreListingEntry {
  name: string
  default: boolean
  persistenceFile: string
  corpusRoot: string | null
  status: RagStoreLoadStatus
}

/** The `rag-store-listing` IPC result — the registry's presentation view (one
 *  entry per configured store, in the registry's own array order). */
export interface RagStoreListingPayload {
  stores: RagStoreListingEntry[]
}

/** The renderer→main `rag-store-listing` IPC (the operator settings pane's
 *  read-only store census). Manual-UI ONLY: the MCP tool handlers never route
 *  to this channel, so an agent cannot enumerate the configured store names
 *  (B9/A9). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED) and NOT a five-seam
 *  gate seam — no RpcMethod, no TOOL_GROUPS entry, no ALL_TOOLS row. */
export const IPC_RAG_STORE_LISTING = 'provident:rag-store-listing'
```

**The `RagQueryPayload` change — exact before/after (`types.ts:405-409`):**

Before:

```ts
export const IPC_RAG_QUERY = 'provident:rag-query'
export interface RagQueryPayload {
  query: string
  topK?: number
}
```

After:

```ts
export const IPC_RAG_QUERY = 'provident:rag-query'
export interface RagQueryPayload {
  query: string
  topK?: number
  /** U-MS5 — the optional store selector (MCP/UI mechanical symmetry,
   *  UI-SELECTOR-DEFERRED). Omitted ⇒ the default store (zero-config
   *  byte-equal). The settings/search pane's own query path NEVER passes it;
   *  a UI-passed non-default store's results are display-only
   *  (RAG-QUERY-STORE-DISPLAY-ASYMMETRY). */
  store?: string
}
```

`IPC_RAG_QUERY` itself is UNCHANGED (`'provident:rag-query'`). `RagQueryResult`
(`types.ts:460-467`) is NOT changed by this unit — the result-side additive
`store` field is U-MS2's row, PINNED in
`docs/specs/unit-ms2-store-wiring.md` §5.9 (the additive REQUIRED
`store: string` stamped at the ONE shared handler seam (`handleRagTool`) and
carried through both query surfaces; zero-config `'main'`, non-default ⇒ the
registry name — F3's ownership resolution; this unit's display-only asymmetry
consumes it). **F-MS2-4 erratum (2026-09-05):** the field lives on the
handler-RETURNED `RagQueryResult` ONLY — `RetrievalResult` gains NO field
(the engine is store-name-blind).

### 5.2 The shared main-process handler (`src/main/mcp-server.ts`)

A new exported pure handler, placed immediately after `handleRagDocHeadsIpc`
(`mcp-server.ts:226-258`) — the SAME home + the SAME doc-comment discipline
(the doc-heads precedent: a shared main-process IPC handler exported from
`mcp-server.ts` for direct unit testing even though the channel is not an MCP
surface):

```ts
/** U-MS5 §5.2 — the shared main-process handler for the read-only
 *  `rag-store-listing` IPC (the operator settings pane's store census). Returns
 *  the registry's presentation view: one `RagStoreListingEntry` per configured
 *  store (name, default flag, persistence file name, corpus root, per-store
 *  load status). PURE — performs NO I/O: `entries` is the boot-loaded registry's
 *  resolved per-store view passed through the §5.4 WIRING ADAPTER (U-MS1's
 *  loaded form with `persistenceFile` already basename-projected and
 *  `corpusRoot` already `?? null`-coerced — the handler itself is a verbatim
 *  projector of the ALREADY-projected input) and
 *  `statusOf` is the per-store status resolver (U-MS2's `storeLoadStatus`
 *  accessor over the boot store map). Exported
 *  for direct unit testing.
 *
 *  Behavior (pinned): null entries → throw
 *  `Error('rag-store-listing: no rag store registry configured')`; a
 *  non-function `statusOf` → throw `Error('rag-store-listing: statusOf resolver
 *  required')`; a malformed entry (null entry, or a non-string/empty `name`) is
 *  SKIPPED (never a crash, never a phantom entry); `default` coerces to
 *  `e.default === true`; a non-string `persistenceFile` coerces to `''`; a
 *  non-string/empty `corpusRoot` coerces to `null`; `status = statusOf(name)`
 *  and a resolver return outside the three-member union THROWS
 *  `Error('rag-store-listing: unknown store status "<v>" for store "<name>"')`
 *  (fail-loud — the host's fetch catch keeps the last-known listing). One
 *  output entry per valid input entry, in the INPUT array order — NO sort, NO
 *  dedupe (uniqueness + order are U-MS1's validated-registry contract; the
 *  handler is a verbatim projector). An empty array → `{ stores: [] }`. */
export function handleRagStoreListingIpc(
  entries:
    | ReadonlyArray<{
        name: string
        default: boolean
        persistenceFile: string
        corpusRoot: string | null
      }>
    | null,
  statusOf: (name: string) => RagStoreLoadStatus,
): RagStoreListingPayload
```

**The pinned body (the TestWriter derives every state from this + the doc
comment):**

```ts
export function handleRagStoreListingIpc(
  entries:
    | ReadonlyArray<{
        name: string
        default: boolean
        persistenceFile: string
        corpusRoot: string | null
      }>
    | null,
  statusOf: (name: string) => RagStoreLoadStatus,
): RagStoreListingPayload {
  if (!entries) throw new Error('rag-store-listing: no rag store registry configured')
  if (typeof statusOf !== 'function') throw new Error('rag-store-listing: statusOf resolver required')
  const VALID: ReadonlySet<string> = new Set(['loaded', 'failed-corrupt', 'failed-missing'])
  const stores: RagStoreListingEntry[] = []
  for (const e of entries) {
    // MED-1 discipline (the V3 adversarial lesson): a malformed entry is
    // SKIPPED — never a phantom `{ name: undefined }` entry, never a crash.
    if (e == null || typeof e.name !== 'string' || e.name === '') continue
    const status = statusOf(e.name)
    if (typeof status !== 'string' || !VALID.has(status)) {
      throw new Error(`rag-store-listing: unknown store status "${String(status)}" for store "${e.name}"`)
    }
    stores.push({
      name: e.name,
      default: e.default === true,
      persistenceFile: typeof e.persistenceFile === 'string' ? e.persistenceFile : '',
      corpusRoot: typeof e.corpusRoot === 'string' && e.corpusRoot !== '' ? e.corpusRoot : null,
      status,
    })
  }
  return { stores }
}
```

**Behavior (pinned):**

1. **Verbatim projection:** one output entry per valid input entry, in INPUT
   order. NO sort, NO dedupe — the registry's unique-name + exactly-one-default
   guarantees are U-MS1's validated-registry contract (MULTI-STORE-REGISTRY);
   the handler never re-validates them (a duplicate-name input renders both
   entries — that state is unreachable from a validated registry and is NOT
   defensively hidden).
2. **Purity:** the handler imports NO fs/store/registry module and performs NO
   I/O; two calls with the same inputs return deep-equal payloads. The D8 pin at
   the handler level: the wiring passes the IN-MEMORY boot-loaded form, so a
   registry file edited while running changes nothing until restart.
3. **Throw patterns (exactly three):** the null-entries error, the
   statusOf-resolver error, and the unknown-status error (§5.2's doc comment).
   No other throw path exists; a malformed ENTRY is never a throw (skip).
   **F-MS5-2 erratum (§3a):** the handler PINS these three throws; the WIRING
   (`main.ts` §5.4) adds a DEFENSIVE FOURTH — a byte-pinned `rag-store-listing:
   no directory entry for store "<name>"` guard in the per-name status resolver
   for the latent `!` deref (`entries.get(name)!`), so a name with no matching
   directory entry (unreachable today) throws a diagnosable Error, never an
   unpinned TypeError.
4. **Status supply:** every status comes from `statusOf(e.name)` — the handler
   never derives a status itself and never defaults one (an unknown status
   fails loud, it does not coerce to `'loaded'`).

### 5.3 The preload bridge (`src/main/preload.ts`)

**Import list (`preload.ts:7`):** add `IPC_RAG_STORE_LISTING` and
`type RagStoreListingPayload` to the existing `../shared/types.js` import
(alphabetical position: after `IPC_RAG_DOC_HEADS`, and after
`type RagDocHeadsPayload` respectively).

**The `ProvidentBridge.rag` namespace (`preload.ts:65-81`):** add ONE method
after `docHeads()` (`:80`) in the interface:

```ts
/** U-MS5 — the read-only settings-pane store listing. Returns the registry's
 *  presentation view (one entry per configured store: name, default flag,
 *  persistence file name, corpus root, per-store load status). Manual-UI only:
 *  never an MCP tool — an agent must not enumerate the configured store names
 *  (B9/A9). */
stores(): Promise<RagStoreListingPayload>
```

and the implementation after `docHeads()` (`preload.ts:252-254`):

```ts
/** U-MS5 — the read-only settings-pane store listing. Sends the
 *  `rag-store-listing` IPC to main, which projects the boot-loaded registry's
 *  presentation view (name, default flag, persistence file name, corpus root,
 *  per-store load status). */
stores(): Promise<RagStoreListingPayload> {
  return ipcRenderer.invoke(IPC_RAG_STORE_LISTING)
}
```

**The `rag.query` signature — exact before/after (`preload.ts:66` interface,
`preload.ts:231-234` implementation):**

Before:

```ts
query(query: string, topK?: number): Promise<RagQueryResult>
// ...
query(query: string, topK?: number): Promise<RagQueryResult> {
  const payload: RagQueryPayload = { query, ...(topK !== undefined ? { topK } : {}) }
  return ipcRenderer.invoke(IPC_RAG_QUERY, payload)
}
```

After:

```ts
query(query: string, topK?: number, store?: string): Promise<RagQueryResult>
// ...
query(query: string, topK?: number, store?: string): Promise<RagQueryResult> {
  const payload: RagQueryPayload = {
    query,
    ...(topK !== undefined ? { topK } : {}),
    ...(store !== undefined ? { store } : {}),
  }
  return ipcRenderer.invoke(IPC_RAG_QUERY, payload)
}
```

**Pinned:** `store` is included in the payload ONLY when the caller passes it —
a two-arg call builds `{ query }` / `{ query, topK }` with NO `store` key
(byte-equal, A4). The conditional-spread idiom is the `preload.ts:232`
precedent.

**The structural sync (pinned):** the host's structural
`SidebarBridge.rag` (`sidebar-panes.ts:80-88`) gains the SAME optional third
param on `query` (`sidebar-panes.ts:81`) AND the same `stores():
Promise<RagStoreListingPayload>` declaration — the canonical `ProvidentBridge`
and the structural mirror must change in the SAME unit or `tsc --noEmit`
fails (the renderer bundle cannot import `preload.ts`; the mirror is
hand-synced — the RCA-6 drift class, pinned by the typecheck leg of the trio).

### 5.4 The main-process wiring (`src/main/main.ts`)

**Imports (`main.ts:7-8`):** add `IPC_RAG_STORE_LISTING` to the
`../shared/types.js` import (after `IPC_RAG_DOC_HEADS`) and
`handleRagStoreListingIpc` to the `./mcp-server.js` import (after
`handleRagDocHeadsIpc`).

**Registration — placed immediately after the doc-heads handler
(`main.ts:333-335`), before the template block (`main.ts:337`):**

```ts
// U-MS5 — the read-only settings-pane store listing. Manual-UI ONLY: the MCP
// tool handlers never route to this channel, so an agent cannot enumerate the
// configured store names (B9/A9). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED,
// decisions.md:45) and NOT a five-seam gate seam — no RpcMethod, no TOOL_GROUPS
// row, no ALL_TOOLS row, no MUTATING_METHODS member, no renderer-switch method
// (the MCP tool census stays 12). The handler projects the BOOT-LOADED
// registry's presentation view; the registry file is NEVER re-read here (D8 —
// a mid-run registry edit is observed only after restart).
ipcMain.handle(IPC_RAG_STORE_LISTING, () => {
  return handleRagStoreListingIpc(
    /* listingEntries — the U-MS1 boot-loaded registry's resolved per-store
       view PROJECTED into the handler's input shape by the PINNED wiring
       local (the pinned expression, F7+F13):
       registry.stores.map((s) => ({
         name: s.name,
         default: s.default,
         persistenceFile: basename(s.persistenceFile),  // F7 — the FILE NAME (the basename of U-MS1's resolved absolute path; `basename` from node:path)
         corpusRoot: s.corpusRoot ?? null,              // F13 — U-MS1 OMITS the property when unconfigured (`corpusRoot?`); the handler's type requires `string | null`
       }))
       (the implicit zero-config form yields exactly the one `main` entry).
       The EXACT loaded form is pinned by docs/specs/unit-ms1-store-registry.md —
       this wiring consumes it read-only. The PINNED local is
       `const listingEntries = registry.stores.map((s) => ({ … }))` as written
       above (NOT a bare placeholder), and the pinned import additions to
       main.ts are: `basename` from `node:path` (F7), `storeLoadStatus` from
       `./rag-store-directory.js` (U-MS2's module, F6), and the
       `IPC_RAG_STORE_LISTING` / `handleRagStoreListingIpc` imports pinned in
       §5.4's Imports paragraph below (the constant itself declared in §5.1). */
    listingEntries,
    /* (name) => <status> — the U-MS2 per-store status resolver (loaded /
       failed-corrupt / failed-missing — the D7 matrix). The exact accessor is
       PINNED by docs/specs/unit-ms2-store-wiring.md §5.1: the exported PURE
       `storeLoadStatus(entry)` over the boot-captured missing flag + the
       store's own `status().corrupt` (rag-store.ts:1231-1243). The wiring
       closes over U-MS2's boot plan directory. **F-MS5-2 repoint (the
       landed form — the §3a F-MS5-2 guard REPLACES the latent `!` deref):**
       the PINNED argument expression (as landed) GUARDS the `entries.get(name)`
       result before dereferencing — a name with NO matching directory entry
       (unreachable today: the directory derives from the SAME boot registry as
       `listingEntries`, and a failed store construction aborts boot) throws a
       byte-pinned Error, NEVER an unpinned TypeError: */
    (name) => {
      const e = plan.directory.entries.get(name)
      if (!e) throw new Error(`rag-store-listing: no directory entry for store "${name}"`)
      return storeLoadStatus(e)
    },
  )
})
```

**Pinned wiring properties:**

- The registration happens inside `main()` like every other `ipcMain.handle`
  (the `IPC_RAG_DOC_HEADS` precedent at `main.ts:333-335`).
- `listingEntries` is the PINNED projection local — the U-MS1 boot-loaded
  registry's resolved per-store view PROJECTED by the adapter expression in
  the code block above (`basename` + the `?? null` coercion), NOT a raw
  capture of the boot form: the handler's input is the ALREADY-PROJECTED form
  per §5.2's doc comment. The U-MS2 wiring replaces the single
  `createJsonRagStore` at `main.ts:118-120` with the registry-driven store
  set, and the listing wiring closes over the SAME boot-loaded registry. The
  handler NEVER re-reads `provident-rag-stores.json` (D8).
- The channel is NOT gated, NOT announced to MCP, NOT added to
  `RpcMethod` (`types.ts:288-298` stays the rag/edit method census), NOT added
  to `security.ts`'s tool→group map (`security.ts:34-45` stays 12 entries), NOT
  added to `ALL_TOOLS` (`mcp-server.ts:1067-1078` stays 12 tool rows: 5 `rag` +
  7 `edit`).
- The Electron `ipcMain.handle` registration itself has no direct unit test
  (the established discipline — `main.ts` is covered by the build + the
  wiring-shape parity with the doc-heads registration); the TESTED seam is the
  exported `handleRagStoreListingIpc` (the `handleRagDocHeadsIpc` precedent,
  tested in `tests/unit-v3-doc-heads-docnav.test.ts:268-306`).

### 5.5 The settings-pane store-listing section (`src/renderer/sidebar-panes.ts`)

**The host cache (pinned):** `private lastStoreListing: RagStoreListingPayload |
null = null` — alongside `lastOperatorSettings`.

**The boot fetch (pinned):** in `boot()` immediately after the persisted
operator-settings fetch (`sidebar-panes.ts:625-631`), BEFORE the traversal
build + `mountOperator()` (`:646-648`) so the FIRST operator render includes
the listing:

```ts
// U-MS5 — the read-only store listing (the operator's Phase-1 census). A
// bridge error does NOT abort the boot (a display-only surface — the boot
// must not depend on it; keep null → the '(stores unavailable)' placeholder).
// Deliberately DIVERGES from the snapshot/docHeads/template abort discipline
// (sidebar-panes.ts:580-607) for exactly this reason.
try {
  this.lastStoreListing = await this.bridge.rag.stores()
} catch (e) {
  console.error('[sidebar-panes] store-listing fetch failed', e)
}
```

**F-MS5-3 availability note (§3a):** the boot listing fetch is AWAITED INLINE
above — the SAME shape as the pre-existing persisted operator-settings fetch
that precedes it — so a `stores()` that never settles delays boot by design.
Fail-state 5's non-abort discipline covers a REJECTED fetch only; it does NOT
cover NON-RESOLUTION (a never-settling promise holds the boot await). This is a
documented availability note, not a code change — the fetch's rejection
non-abort (the deliberate divergence from the snapshot/docHeads/template abort
discipline) is unchanged.

**F-MS5-4 compromise note (§3a):** the operator-isolated + never-MCP-visible
guarantees (§5.5's mount paragraph, §5.9 fail 9) assume an UNCOMPROMISED
renderer. `IPC_RAG_STORE_LISTING` and the forwarded `store` on `IPC_RAG_QUERY`
(§5.6) are NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED, `decisions.md:45`) —
the renderer is a trusted surface. A COMPROMISED trusted renderer could
therefore enumerate store names + read non-default content through these IPC
channels. This is the ACCEPTED model: these channels are NOT agent-reachable
(no MCP tool, no tool→group row, no `ALL_TOOLS`/`RpcMethod` member — B9/A9/
BE-7), so there is NO agent escalation; only an already-trusted renderer could
reach them. Documented here; no code change.

**No re-fetch (pinned):** `reDerive()` (`:664-772`) and `refresh()`
(`:544-568`) do NOT re-fetch the listing — the registry is boot-time-only
(D8); the operator pane re-renders the CACHED `lastStoreListing` on every
`mountOperator()`/`refresh()`. A red test pins the fetch count: after a
`rag-store-changed` → re-derive, the bridge's `stores()` call count is still 1.

**The pane node structure (pinned — appended as the LAST child of the existing
`settingsContent()` `section`, after the `operator-editing-mode-toggle` button,
`sidebar-panes.ts:830-838`):**

```ts
// U-MS5 — the read-only store listing (the operator's Phase-1 census).
// Provident-authored data (PANE-PROVIDENT-AUTHORING); NO handlers on any
// listing node (read-only; NO switcher — UI-SELECTOR-DEFERRED).
const listing = this.lastStoreListing
const storeRows: LegacyNodeData[] =
  listing == null
    ? [{ type: 'p', content: '(stores unavailable)' }]
    : listing.stores.length === 0
      ? [{ type: 'p', content: '(no stores)' }]
      : listing.stores.map((s) => ({
          type: 'div',
          props: {
            id: `operator-rag-store-${s.name}`,
            'data-store': s.name,
            'data-default': s.default ? 'true' : 'false',
            'data-status': s.status,
          },
          content: `${s.name} — default: ${s.default ? 'yes' : 'no'} — persistence: ${s.persistenceFile} — corpus: ${s.corpusRoot ?? '(project root)'} — status: ${s.status}`,
        }))
// ... appended into the section's children:
{
  type: 'div',
  props: { id: 'operator-rag-stores' },
  children: [{ type: 'h3', content: 'RAG stores' }, ...storeRows],
}
```

**Node contract (pinned):**

- The listing container is `type: 'div'`, `props: { id: 'operator-rag-stores' }`,
  first child `{ type: 'h3', content: 'RAG stores' }`, then one entry `div` per
  store (payload order), or the placeholder `p`.
- **Entry div:** `id: 'operator-rag-store-<name>'` (the `operator-*` id
  convention — `operator-enabled-panes`/`operator-default-document`/
  `operator-topk`/`operator-editing-mode`, `sidebar-panes.ts:818-833`);
  `data-store: <name>`; `data-default: 'true' | 'false'`;
  `data-status: <status>`; content EXACTLY
  `` `${name} — default: ${default ? 'yes' : 'no'} — persistence: ${persistenceFile} — corpus: ${corpusRoot ?? '(project root)'} — status: ${status}` ``
  (the ` — ` separator matches the search pane's result rows,
  `pane-graph.ts:263`).
- **NO listing node carries `handlers`** — read-only; NO switcher
  (UI-SELECTOR-DEFERRED). NO new `registerHandlerDef` (the handler-def census
  stays 12, `sidebar-panes.ts:423-451`).
- **The zero-config row (A4):** exactly ONE entry div —
  `{ id: 'operator-rag-store-main', 'data-store': 'main', 'data-default':
  'true', 'data-status': 'loaded' }`, content
  `main — default: yes — persistence: provident-rag.json — corpus: (project root) — status: loaded`.
  With the legacy store file ABSENT (the true first run) the SAME div renders
  with `'data-status': 'failed-missing'` and the content's status segment
  reading `status: failed-missing` (BE-1a — D7's first-run state, F6).

**The isolated-scope mount (pinned — unchanged mechanics, this unit rides
them):** the listing renders inside `settingsContent()`, which is the `settings`
pane's `render` (`sidebar-panes.ts:410-415`, `scope: 'operator'`), assembled by
`buildOperatorEnvelope(registry, ctx)` and mounted by `mountOperator()`
(`sidebar-panes.ts:515-538`) in a fresh `createIsolatedScope()` GraphScope →
own Supervisor + own DomAdapter → the `#operator-panes` mount (UI-MOUNT-OPERATOR,
`decisions.md:50`; the authoring contract `unit-h-sidebar-panes.md` §5.4 +
`unit-k-sidebar-panes-host.md` §5.4). The listing is therefore NEVER
MCP-visible: the app Runtime's `get_rendered_html`/`get_markdown`/
`list_targets`/`get_node_state`/`provident.dispatch` read only the app Runtime
graph, and an operator pane NEVER enters the app-graph envelope (the existing
negative, `tests/sidebar-panes.test.ts:730-743`). A listing rendered OUTSIDE
the provident graph, or inside the app graph, is a review finding.

### 5.6 The search-pane passthrough + the display-only asymmetry rule

**The passthrough pin (pinned):** `submitQuery` (`sidebar-panes.ts:1070-1083`)
is UNCHANGED by this unit — it calls
`this.bridge.rag.query(value, this.lastOperatorSettings?.topK ?? 5)` with
exactly TWO arguments and NEVER a store. The gate (`security?.enabled.includes('rag')`,
M13 fail-closed), the empty-query no-op, the F4 topK feed, and the F7
dirty-guard re-render are all unchanged.

**The mechanical symmetry (pinned):** the OPTIONAL `store` field exists on
`RagQueryPayload` and is forwarded by `handleRagQueryIpc`
(`mcp-server.ts:195-204`) — exact before/after:

Before:

```ts
export async function handleRagQueryIpc(
  engine: RetrievalEngine | null,
  store: RagStore | null,
  payload: { query?: unknown; topK?: unknown },
): Promise<unknown> {
  return handleRagTool(store, 'rag.query', {
    query: payload?.query,
    topK: payload?.topK,
  }, engine)
}
```

After:

```ts
export async function handleRagQueryIpc(
  engine: RetrievalEngine | null,
  store: RagStore | null,
  payload: { query?: unknown; topK?: unknown; store?: unknown },
  dir?: RagStoreDirectory | null,
): Promise<unknown> {
  return handleRagTool(store, 'rag.query', {
    query: payload?.query,
    topK: payload?.topK,
    store: payload?.store,
  }, engine, dir)
}
```

(The trailing `dir` param and its forward are U-MS2 §5.4's directory-injection
pin — F4: the resolver must behave IDENTICALLY on both surfaces, and without
the `dir` forward a non-empty forwarded `store` would fail M2 (`dir == null`
⇒ `unknown store`). THIS unit pins only the `store` FIELD forward; the `dir`
plumbing is U-MS2's, consumed here.)

and the wiring (`main.ts:316-318`) gains the same forward:

```ts
ipcMain.handle(IPC_RAG_QUERY, (_event, payload: RagQueryPayload) => {
  return handleRagQueryIpc(retrievalEngine, ragStore, { query: payload?.query, topK: payload?.topK, store: payload?.store }, plan.directory)
})
```

(After U-MS2 the engine/store arguments are the addressed-store resolution —
U-MS2's wiring, and the trailing `dir` argument is U-MS2 §5.4's directory
injection (F4); THIS unit pins only that the `store` FIELD is forwarded
verbatim — `store: payload?.store` — so an omitted-store payload produces tool
args whose `store` is `undefined` (U-MS2 §5.1 S1: explicit-`undefined` ≡
absent — wire-byte-equal, JSON drops the key; A4).) The MCP `rag.query` tool receives
`args.store` through the SAME `handleRagTool` switch — the two surfaces see the
identical args shape (MCP-UI-EQUIVALENCE `decisions.md:43`). `handleRagTool`'s
`store` RESOLUTION/validation is U-MS2's (resolved FIRST, D4; unknown store ⇒
fail-loud echoing only the caller's input, A9) — NOT this unit's. With U-MS2's
`dir` injected, an unknown FORWARDED store fails loud on the IPC path too —
`rag.query: unknown store '<name>'` (A9's fail-loud semantics on BOTH
surfaces, F4).

**The asymmetry rule (pinned — the new decision row
RAG-QUERY-STORE-DISPLAY-ASYMMETRY, sibling of EDIT-COMMIT-RETURN-ASYMMETRY
`decisions.md:46`):**

- The MCP `rag.query` tool and the `rag-query` IPC CAN address a non-default
  store (mechanically symmetric input surfaces). A non-default result carries
  `store: '<name>'` and `<name>:`-prefixed node ids (STORE-ID-PREFIX,
  `decisions.md:109`; U-MS2's result qualification — PINNED in
  `docs/specs/unit-ms2-store-wiring.md` §5.9, F3's ownership resolution).
- The renderer's OWN query path NEVER produces one (no switcher;
  `submitQuery` passes nothing).
- A non-default result, if ever rendered in the search pane, is **DISPLAY-ONLY**:
  the search pane's result rows carry NO handler (`searchContent`,
  `pane-graph.ts:255-266` — `li[data-node-id]` rows, no handlers), the
  crosslink/backlink pane reads the default store's enumeration, and the
  document traversal reads the default-store snapshot — a `<name>:`-prefixed id
  does not resolve in the default store's document view (the existing
  `node not found` fail-state per STORE-ID-PREFIX). NO navigation path from a
  non-default result exists in Phase 1.
- The search pane's RENDERING is unchanged by this unit (no `data-store`
  display added; `ranked[]` entries stay `{nodeId, score}` per D4). The
  result-side `store` field is U-MS2's
  additive row — pinned in `docs/specs/unit-ms2-store-wiring.md` §5.9 (F3; the
  F-MS2-4 erratum: on the handler-RETURNED `RagQueryResult` only —
  `RetrievalResult` gains NO field);
  this unit only consumes it display-only.

### 5.7 The zero-config byte-equality acceptance rows (A4 — binding)

With NO `provident-rag-stores.json` present (the U-MS1 implicit `main` entry
synthesized at boot, never written back — D3):

| # | Surface | Zero-config expectation | Evidence |
| --- | --- | --- | --- |
| BE-1 | The settings listing — with the legacy store file PRESENT | exactly ONE entry: `name: 'main'`, `default: true`, `persistenceFile: 'provident-rag.json'`, `corpusRoot: null` (rendered `(project root)`), `status: 'loaded'` | review §4 + D2/D3 |
| BE-1a | The settings listing — with the legacy store file ABSENT (the TRUE first run) | the SAME single entry except `status: 'failed-missing'` — D7: the absent file is the first-run empty store, NOT an error state and NOT `'loaded'`; the entry renders normally (same `persistenceFile` basename, `corpusRoot: null`, `default: true`) | D7; U-MS2 §5.1/§5.7's exported `storeLoadStatus` (F6) |
| BE-2 | The listing channel payload | exactly `{ stores: [the BE-1 entry] }` | D2/D3 |
| BE-3 | The renderer query payload | `bridge.rag.query(q, k)` sends `{ query: q, topK: k }` (or `{ query: q }` when topK is undefined) — NO `store` key | `preload.ts:231-234` |
| BE-4 | The shared query handler | `handleRagQueryIpc(engine, store, { query, topK })` forwards tool args whose `store` is `undefined` (§5.6's explicit-`undefined` ≡ absent — wire-byte-equal, A4; assert `args.store === undefined`, NOT key-absence) ⇒ default-store resolution (U-MS2) ⇒ identical result semantics | `mcp-server.ts:195-204`, `main.ts:316-318` |
| BE-5 | The settings pane | the pre-existing rows (`operator-enabled-panes`, `operator-default-document`, `operator-topk`, `operator-editing-mode` + the toggle) byte-unchanged; the listing section APPENDED below them | `sidebar-panes.ts:812-841` |
| BE-6 | Disk writes | the listing channel writes NOTHING — no registry file is created; the implicit entry stays synthesized, never written back | D2/D3 |
| BE-7 | Security posture | no new group, no new tool name, no `RpcMethod` change; the gate census stays 12 tools (5 `rag` + 7 `edit`) | `security.ts:3,34-45`; `mcp-server.ts:1067-1078` |
| BE-8 | Broadcast payloads | unchanged by THIS unit — the ONE intentional zero-config delta (`store: 'main'` on the broadcast/snapshot) is U-MS3's row, cited not restated | review §4; U-MS3 |

(The sibling byte-equality rows outside U-MS5's files — persistence file,
engine construction, vector cache, import root, id minting, result shapes — are
review §4's rows, owned by U-MS1/MS2/MS4/MS3 and cited, not restated.)

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **The shared handler — multi-store registry:** entries for ≥2 stores →
   `{ stores: [one `RagStoreListingEntry` per store] }` in INPUT order, each
   entry's `name`/`default`/`persistenceFile`/`corpusRoot` verbatim, `status`
   from `statusOf(name)`.
2. **The shared handler — zero-config implicit form:** the single `main` entry
   → the BE-1/BE-2 payload with a PRESENT legacy store file (BE-1a's
   `status: 'failed-missing'` for the ABSENT-file first run — the A4 pin + the
   D7 first-run state, F6).
3. **The shared handler — status plumbing:** a `statusOf` returning each of
   `'loaded'` / `'failed-corrupt'` / `'failed-missing'` per store → the payload
   entry's `status` equals it verbatim (the D7 matrix members pass through
   unchanged).
4. **The shared handler — corpusRoot forms:** an explicit absolute root → the
   string verbatim; `null`/`undefined`/`''` → `null` in the payload.
5. **The shared handler — empty array:** `[]` → `{ stores: [] }` (no throw).
6. **The shared handler — order preservation:** input order = output order; NO
   sort, NO dedupe (two entries with distinct names stay in input order even if
   "unsorted").
7. **The shared handler — purity:** two invocations with the same inputs →
   deep-equal payloads; the module performs no I/O.
8. **`bridge.rag.stores()`:** sends the `IPC_RAG_STORE_LISTING` IPC (no
   payload argument) and resolves the `RagStoreListingPayload` (the
   `docHeads()` mirror, `preload.ts:252-254`).
9. **The query passthrough WITH store:** `bridge.rag.query('q', 5,
   'research-2026-09')` → the `IPC_RAG_QUERY` payload
   `{ query: 'q', topK: 5, store: 'research-2026-09' }`.
10. **The query passthrough WITHOUT store:** `bridge.rag.query('q', 5)` →
    `{ query: 'q', topK: 5 }` (NO `store` key); `bridge.rag.query('q')` →
    `{ query: 'q' }`.
11. **`handleRagQueryIpc` symmetry WITH store:**
    `handleRagQueryIpc(engine, store, { query: 'q', topK: 5, store: 'X' })`
    forwards `store: 'X'` into the `rag.query` tool args (identical args shape
    to the MCP tool's `store: 'X'` call — U-MS2's resolver then
    resolves/fails identically on both surfaces).
12. **`handleRagQueryIpc` symmetry WITHOUT store:** the payload without
    `store` → tool args whose `store` is `undefined` — `store: payload?.store`
    (§5.6's explicit-`undefined` ≡ absent semantics; wire-byte-equal, A4;
    assert `args.store === undefined`, NOT key-absence; the U-MS2 resolver's
    omitted ⇒ default rule applies unchanged).
13. **The settings-pane render — populated listing:** a set
    `lastStoreListing` → the `operator-rag-stores` div is the LAST child of the
    settings `section`, with the `h3` + one entry div per store carrying the
    pinned `id`/`data-*` props + the pinned content format (§5.5).
14. **The boot fetch:** `boot()` sets `lastStoreListing` from the bridge before
    `mountOperator()`; the first operator render includes the listing.
15. **The re-render from cache:** a `rag-store-changed` → re-derive → the
    settings pane re-renders the CACHED listing; the bridge's `stores()` call
    count stays 1 (no re-fetch in `reDerive`/`refresh` — the D8 pin).
16. **The zero-config render:** the implicit-`main` payload → exactly one
    `operator-rag-store-main` div with the BE-1 content string.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`handleRagStoreListingIpc(null, statusOf)`** → throws
   `Error('rag-store-listing: no rag store registry configured')`.
2. **`handleRagStoreListingIpc(entries, undefined)`** → throws
   `Error('rag-store-listing: statusOf resolver required')`.
3. **A `statusOf` return outside the union** (e.g. `'ok'`, `42`, `undefined`)
   → throws `Error('rag-store-listing: unknown store status "<v>" for store
   "<name>"')` (fail-loud; never a silent coercion to a valid member).
4. **A malformed entry** (a `null` entry; a non-string or empty `name`) →
   SKIPPED: no throw, no phantom entry, no `operator-rag-store-undefined` id
   (the V3 MED-1 discipline).
5. **A boot bridge error on the listing fetch** → NOT an abort:
   `lastStoreListing` stays `null`, the error is logged, and the boot CONTINUES
   (the app graph boots normally; the placeholder renders). The deliberate
   divergence from the snapshot/docHeads/template abort discipline is pinned by
   this test.
6. **A `null` `lastStoreListing` at render** → the `(stores unavailable)` `p`
   (never a TypeError).
7. **An empty `stores: []` payload at render** → the `(no stores)` `p` (never a
   crash).
8. **Negative pin — NO switcher:** no listing node carries `handlers`; no new
   `registerHandlerDef` (the census stays 12, `sidebar-panes.ts:423-451`); no
   settings-pane control changes the active store; `submitQuery`'s
   `bridge.rag.query` call carries exactly two args (no store) — grep-level:
   no `store` argument is passed from any renderer call site.
9. **Negative pin — NO MCP-visible store enumeration (grep-level census of the
   MCP tool list):** `IPC_RAG_STORE_LISTING` is NOT a member of `RpcMethod`
   (`types.ts:260-308` — the union is unchanged), NOT a `security.ts`
   tool→group entry (`security.ts:34-45` — stays exactly the 12 rag/edit rows),
   NOT an `ALL_TOOLS` row (`mcp-server.ts:1067-1078` — stays exactly 12: 5
   `rag.*` + 7 `edit.*`), NOT in `MUTATING_METHODS`, NOT in the renderer's
   method switch. **THIS SPEC STATES EXPLICITLY: the `rag-store-listing`
   channel is NOT a five-seam gate seam, and adding an MCP `rag.list_stores`
   (or any store-enumerating tool) to "fix" the census gap is FORBIDDEN (B9;
   A9) — the census is the operator UI ONLY.** The listing nodes live ONLY in
   the operator isolated scope (never the app-graph envelope — the existing
   negative, `tests/sidebar-panes.test.ts:730-743`).
10. **A registry file edited while running** → the listing is UNCHANGED until
    restart (the wiring passes the boot-loaded form; the handler never re-reads
    the file — D8's UI-layer pin; node-testable: mutate the file between two
    handler invocations → identical payloads).

### 5.10 Census / numeric claims

- **New IPC channel:** 1 (`IPC_RAG_STORE_LISTING = 'provident:rag-store-listing'`,
  the `IPC_RAG_DOC_HEADS = 'provident:rag-doc-heads'` convention,
  `types.ts:490`).
- **New shared types:** 3 (`RagStoreLoadStatus`, `RagStoreListingEntry`,
  `RagStoreListingPayload`).
- **Changed shared type:** 1 (`RagQueryPayload` gains `store?: string` —
  additive/optional).
- **New bridge methods:** 1 (`bridge.rag.stores()`). **Bridge signature
  changes:** 1 (`rag.query` gains the optional third param — in BOTH
  `ProvidentBridge` (`preload.ts:66`) and the structural `SidebarBridge`
  (`sidebar-panes.ts:81`)).
- **New shared handlers:** 1 (`handleRagStoreListingIpc` in `mcp-server.ts`,
  mirroring `handleRagDocHeadsIpc`, `mcp-server.ts:239-258`).
- **Changed shared handlers:** 1 (`handleRagQueryIpc` forwards `store` —
  `mcp-server.ts:195-204`).
- **New main registrations:** 1 (`ipcMain.handle(IPC_RAG_STORE_LISTING, …)`,
  after `main.ts:333-335`).
- **Host cache:** 1 (`lastStoreListing`). **Boot fetch sites:** 1 (boot only —
  0 in `reDerive`/`refresh`).
- **Settings-pane nodes:** 1 container div (`operator-rag-stores`) + 1 `h3` +
  N entry divs (one per configured store) or 1 placeholder `p`.
- **New pane handler defs:** 0 (the `registerHandlerDef` census stays 12,
  `sidebar-panes.ts:423-451`). **New MCP tools:** 0 (the census stays 12).
- **New tests (est.):** 10–14 (`multi-document-store-config-review.md` §6) —
  **LANDED: 44 authored (41 pass / 3 skip)** in
  `tests/unit-ms5-settings-listing.test.ts` (the §5.8/§5.9 red set + the
  §5.3 structural-bridge typecheck leg + the F-MS5-2 R-tests + the negative
  GREEN-guards; the 3 sanctioned re-pins are the §5.3 bridge happy-path rows 8–10 —
  TestWriter fixture gaps).

### 5.11 Cross-references

- Gate: `docs/specs/multi-document-store-config-review.md` §2 (D2/D3 — the
  registry shape/derivation the listing displays; D7 — the failed-store matrix
  this unit's status enum mirrors; D8 — boot-time-only mutation; D9 — the UI
  scope; D10 — no-enumeration security posture), §4 (the byte-equality table),
  §3 (the unit table — U-MS5 row), §8 (A2/A4/A9).
- Sibling units (cite, do not restate internals): **U-MS1**
  `docs/specs/unit-ms1-store-registry.md` (the registry module + the loaded
  form this unit's IPC reads — the resolved per-store entries incl. the derived
  `persistenceFile`s and the legacy `provident-rag.json` for `main`);
  **U-MS2** `docs/specs/unit-ms2-store-wiring.md` (the per-store status
  derivation this unit's presentation view consumes — the D7
  loaded/failed-corrupt/failed-missing matrix via the exported
  `storeLoadStatus` accessor, §5.1/§5.7 there — the `store` resolution the
  forwarded query field feeds (§5.4's `dir` injection, F4), and the
  query-RESULT `store` field this unit's display-only asymmetry consumes
  (§5.9 there, F3)); **U-MS3**
  `docs/specs/unit-ms3-store-qualified-broadcast.md` (the broadcast/snapshot
  `store` qualification — untouched here); **U-MS4**
  `docs/specs/unit-ms4-id-prefixing.md` (the `<name>:` id namespace the
  display-only rule leans on — untouched here).
- Pane/host authoring: `docs/specs/unit-h-sidebar-panes.md` §5.4 (the
  operator-only settings pane + the isolated `GraphScope` — the authoring
  contract), `docs/specs/unit-k-sidebar-panes-host.md` §5.4 (`mountOperator`
  — the `#operator-panes` isolated mount + the M9 settings-pane render
  closure pattern this section extends).
- The new-channel exemplar: `docs/specs/unit-v3-doc-heads-docnav.md` §5.1
  (constant + handler + wiring + bridge, the four-part pattern cloned).
- Decisions: `docs/decisions.md` **UI-SELECTOR-DEFERRED** (`:112`, landed by
  this unit), the consumed multi-store rows (`:105-111`), and the standing rows
  **PANE-PROVIDENT-AUTHORING** (`:34`), **OPERATOR-ISOLATED-GRAPHSCOPE** (`:36`),
  **UI-MOUNT-OPERATOR** (`:50`), **MCP-UI-EQUIVALENCE** (`:43`),
  **IPC-SURFACE-NOT-GROUP-GATED** (`:45`), **EDIT-COMMIT-RETURN-ASYMMETRY**
  (`:46`). New rows pinned by this spec (added when the unit lands):
  **STORE-LISTING-IPC**, **STORE-LISTING-PROVIDENT-AUTHORED**,
  **STORE-LISTING-BOOT-CACHED**, **STORE-LISTING-STATUS-SHARED**,
  **RAG-QUERY-STORE-DISPLAY-ASYMMETRY**.
- Host patterns: `src/shared/types.ts` (the IPC constant + payload types +
  the `RagQueryPayload` field; the channel-name convention `:323-326` and the
  doc-heads block `:484-495`), `src/main/mcp-server.ts` (the shared handler
  `:226-258` pattern + the query forward `:195-204`), `src/main/preload.ts`
  (the bridge `:65-81`, `:230-254`), `src/main/main.ts` (the wiring
  `:316-318,333-335`), `src/renderer/sidebar-panes.ts` (the settings pane
  `:810-841`, the boot `:574-659`, the mount `:515-538`, `submitQuery`
  `:1070-1083`, the structural bridge `:66-101`), `src/renderer/pane-registry.ts`
  (the operator scope — `PaneScope` `:12`, `PaneDefinition` `:41-50`),
  `src/renderer/pane-graph.ts` (`searchContent` `:255-266`).

## 6. Test plan (the unit → file → test-file mapping)

**Source files touched by U-MS5:** `src/shared/types.ts`,
`src/main/mcp-server.ts`, `src/main/preload.ts`, `src/main/main.ts`,
`src/renderer/sidebar-panes.ts`.

**New test file (the supervisor-pinned name):**
`tests/unit-ms5-settings-listing.test.ts` — the red set is §5.8 (happy paths
1–16) + §5.9 (fail-states 1–10), written BEFORE implementation per RCA-1 and
reported as the failing set. Suggested describe blocks, mirroring the Unit V3
test layout (`tests/unit-v3-doc-heads-docnav.test.ts`):

- §5.1 the shared types + the constant (`IPC_RAG_STORE_LISTING ===
  'provident:rag-store-listing'`; the `RagQueryPayload.store?` additive field;
  the three-member status union).
- §5.2 the shared handler `handleRagStoreListingIpc` (happy 1–7, fails 1–4).
- §5.3 the bridge (`stores()` sends the channel — happy 8; the query
  passthrough with/without `store` — happy 9–10; the structural
  `SidebarBridge` sync is the typecheck leg).
- §5.4/§5.6 the query forward (`handleRagQueryIpc` with/without `store` —
  happy 11–12; the omitted-store byte-equality — BE-3/BE-4).
- §5.5 the settings pane (the render happy paths 13, 16; the cache re-render
  15; the fails 5–8).
- The negative pins (fails 8–9) incl. the grep-level MCP census (12 tools; no
  `rag.list_stores`; the constant absent from `RpcMethod`/`TOOL_GROUPS`/
  `MUTATING_METHODS`).

**Existing tests that must stay green** (the additive-field + additive-render
discipline):

- `tests/mcp-security-hardening.test.ts` — the §5.2 hardening invariants
  ((d) the shared-handler equivalence, (e) the renderer switch fails closed,
  (f) `MUTATING_METHODS` coverage — none may change); its
  `handleRagQueryIpc` rows (`:329,:694,:868`) must stay green with the
  additive optional field.
- `tests/retrieval-adversarial.test.ts` (`:179` — the IPC/MCP `rag.query`
  equivalence), `tests/retrieval.test.ts`, `tests/vector-boot.test.ts`
  (`:466,:698`), `tests/embeddings.test.ts` (`:734`) — the
  `handleRagQueryIpc` callers (additive-arg compatible).
- `tests/mcp-server-wiring.test.ts` — the IPC surface wiring.
- `tests/sidebar-panes.test.ts` — the pane content + the operator-isolated
  negatives (`:730-743` — the listing must never enter the app graph).
- `tests/sidebar-panes-host.test.ts` (the host boot/`mountOperator`),
  `tests/sidebar-panes-adversarial.test.ts`.
- `tests/operator-settings-editing-mode.test.ts` (the settings-pane rows incl.
  the editing-mode toggle — byte-green per BE-5),
  `tests/editing-mode-broadcast-host.test.ts`.
- `tests/unit-v3-doc-heads-docnav.test.ts` (+ `-adversarial`) — the doc-heads
  channel/bridge pattern this unit mirrors must stay untouched.
- `tests/rag-edit-gate.test.ts` — the five-seam gate (no new tool, no new
  method).
- Sibling green sets (prerequisites — U-MS5 runs LAST):
  `tests/unit-ms1-store-registry.test.ts`,
  `tests/unit-ms2-store-wiring.test.ts`,
  `tests/unit-ms4-id-prefixing.test.ts`,
  `tests/unit-ms3-store-qualified-broadcast.test.ts`.

**Process gates for this unit (RCA-1..6):** TestWriter red set run + reported →
Implementer green (least code) → the trio (`npm test` + `npm run typecheck` +
`npm run build`) → the mandatory adversarial pass (findings → §3a) → blind
greens from the docs only → the documentation-review pass
(`archive/reviews/<date>-unit-ms5-doc-review.md`) reconciling this spec, the
greens, the trackers, and `docs/decisions.md` (the five new rows of §5.11 +
RAG-QUERY-STORE-DISPLAY-ASYMMETRY) in the SAME pass. Baseline for the projection:
review §6 (U-MS5 ≈ 10–14 new tests; projected trio after U-MS5 ≈ 2260–2290
pass / 38 skip / ~112–114 files).