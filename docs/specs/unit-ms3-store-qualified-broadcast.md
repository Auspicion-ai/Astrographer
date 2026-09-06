# Spec — Unit MS3: Store-Qualified Broadcast + Snapshot Store Field + the Host Re-Derive Guard

- **Status:** SPEC (the multi-store Phase-1 slice, Unit U-MS3 of 5). Gate reference:
  `docs/specs/multi-document-store-config-review.md` §2 **D5** (the store-qualified
  broadcast + snapshot `store` + the host foreign-store drop), §3 (the unit
  decomposition table — U-MS3 row), §4 (the zero-config byte-equality table —
  binding acceptance criteria), §5 (risks R2/R5), §8 (**A3** — the REQUIRED
  `store` field + the three-declaration collapse + the host-side drop;
  **A4** — the byte-equality itemization as binding acceptance criteria).
  Proposal: `docs/feature-requests/multi-document-store-config.md`
  (multi-store Phase-1 slice, USER-APPROVED 2026-09-05; execution order
  U-MS1 → U-MS2 → U-MS4 → **U-MS3** → U-MS5). Decision rows:
  `docs/decisions.md` **STORE-QUALIFIED-BROADCAST** (landed 2026-09-05 — the row
  this unit implements), consuming **MULTI-STORE-REGISTRY**,
  **SINGLE-WRITER-STORE-PER-STORE**, **ENGINE-PER-STORE**, **UI-SELECTOR-DEFERRED**,
  **RAG-AUTHORITATIVE**, **MCP-UI-EQUIVALENCE**, **IPC-SURFACE-NOT-GROUP-GATED**.
  Sibling units (cite, do not restate): U-MS1 =
  `docs/specs/unit-ms1-store-registry.md`; U-MS2 =
  `docs/specs/unit-ms2-store-wiring.md` (the per-store engine map + the
  addressed-store resolution this unit builds on); U-MS4 =
  `docs/specs/unit-ms4-id-prefixing.md`; U-MS5 =
  `docs/specs/unit-ms5-settings-listing.md`.
- **Scope:** the `RagStoreChangedPayload` gains a REQUIRED `store: string`
  (`src/shared/types.ts` — the collapsed shared declaration; the three structural
  copies at `src/main/preload.ts:22-26`, `src/main/mcp-server.ts:349-353`,
  `src/renderer/sidebar-panes.ts:57-61` are DELETED, each importer compiles
  against the ONE shared declaration); all FOUR emission sites qualify the field
  (`src/main/main.ts:249,286,308` — the UI commit/batch/rich paths — +
  `src/main/mcp-server.ts:1134` — the MCP edit path, qualified at the seven
  payload-construction points inside `handleEditTool`); the `rag-snapshot` IPC's
  `RagSnapshotPayload` gains `store: string` (`src/shared/types.ts:416-435` +
  the handler `src/main/main.ts:377-380`); the renderer host
  (`src/renderer/sidebar-panes.ts`) captures its boot store from the snapshot
  into a NEW `lastStore` field and the re-derive guard DROPS foreign-store
  broadcasts BEFORE the re-derive trigger (closes the critique's B5). This unit
  does NOT change the `store` selector semantics (U-MS2), the import minting
  (U-MS4), the settings listing or `RagQueryPayload.store`
  (`src/shared/types.ts:406-409` — U-MS5), the
  reconcile routing (U-MS2), or the page design (no pane/visual change —
  `docs/skills/designing-pages.md` is untouched).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/shared/types.ts`,
  `src/main/preload.ts`, `src/main/mcp-server.ts`, `src/main/main.ts`,
  `src/main/edit-ops.ts` (type-only), and `src/renderer/sidebar-panes.ts` from
  §5.7/§5.8 before any implementation, into
  `tests/unit-ms3-store-qualified-broadcast.test.ts` (§6). Execution-order
  dependency: U-MS3 runs AFTER U-MS2 — the addressed-store resolution, the
  per-store engine map, the default-store-bound IPC matrix (A2), and main's
  exposure of the resolved default store's name are U-MS2 deliverables this
  unit consumes; the red set is written against the post-U-MS2 wiring shape.

---

## 1. What the unit asks

The multi-store slice creates N independent RAG corpora. Without this unit,
every one of them broadcasts the SAME unqualified `rag-store-changed` payload,
and the renderer — which boots and edits exactly ONE store (the default,
UI-SELECTOR-DEFERRED) — re-derives its unchanged default graph on EVERY store's
ingest (critique blocker **B5**: the foreign-store ingest triggers a re-derive
storm). This unit:

1. **Qualifies the broadcast.** `RagStoreChangedPayload` gains a REQUIRED
   `store: string` — the registry-resolved name of the store the mutation
   landed on. All FOUR emission sites pass the addressed store's name:
   `main.ts:249,286,308` (the UI commit/batch/rich paths — always the default
   store) + `mcp-server.ts:1134` (the MCP edit path — the shared handlers
   receive the addressed store's name).
2. **Collapses the three structural payload declarations to ONE** shared
   declaration in `src/shared/types.ts`, imported by all three current
   declarers (amendment A3's resolution — the review §5 R5 drift guard).
3. **Qualifies the snapshot.** The `rag-snapshot` IPC returns the snapshot's
   store (`RagSnapshotPayload.store`) so the renderer host knows WHICH store it
   is rendering without any second channel.
4. **Captures the boot store + drops foreign-store broadcasts host-side.** The
   renderer host records its boot store from the snapshot into `lastStore` and
   its re-derive guard drops any broadcast whose `store` does not match — a
   foreign-store ingest must NOT trigger a re-derive of the unchanged default
   graph (closes B5). The renderer's change is minimal (today it ignores the
   payload entirely, `sidebar-panes.ts:776-778` — `onRagStoreChanged(_payload)`),
   but the exact delta is pinned below (§5.4).
5. **Keeps zero-config byte-equal EXCEPT the one intentional delta** (A4): with
   no registry file, every observable surface is byte-equal to today except
   that broadcast payloads + the snapshot payload carry `store: 'main'`.

## 2. Feasibility verdict

**Feasible — a purely additive payload field + a two-line renderer guard, on
already-landed machinery.** No engine/foundation gap; entirely host-side
(`src/`).

- **The payload type has exactly three structural copies and one doc-comment
  site** (`shared/types.ts:359-363` documents the payload but does not declare
  it): `src/main/preload.ts:22-26`, `src/main/mcp-server.ts:349-353`,
  `src/renderer/sidebar-panes.ts:57-61`. The renderer bundle CAN import from
  `../shared/types.js` — it already imports `RagSnapshotPayload` and 7 other
  types from there (8 types TOTAL in the import block, `sidebar-panes.ts:40-48`) — and `preload.ts:7` and
  `mcp-server.ts:23` already import from `../shared/types.js`. The stated
  reason the renderer copy exists ("the canonical type lives in
  `src/main/preload.ts`, which the renderer bundle cannot import",
  `sidebar-panes.ts:54-56`) does not apply to a `shared/types.ts` home. The
  collapse is mechanical; the compat re-export pattern already exists
  (`preload.ts:19` — `export type { EditCommitResult }`).
- **The four emission sites are all literal broadcast calls** with the payload
  constructed at the call (main.ts:249, 286, 308) or, for the MCP path, inside
  `handleEditTool`'s seven construction points
  (`mcp-server.ts:383,395,402,410,418,433,446`) forwarded verbatim at :1134.
  Each site is in reach of a store name: main's UI handlers are
  default-store-bound (A2) and U-MS2 exposes the resolved default store's name
  in main's scope; the MCP wiring (post-U-MS2) resolves the addressed store
  before calling `handleEditTool`.
- **The two broadcast-derivation helpers are store-agnostic**
  (`deriveBatchBroadcast` `edit-ops.ts:534-538`, `deriveRichCommitBroadcast`
  `edit-ops.ts:649-652`) — they derive `{kind, nodeIds, edgeIds}` only; with a
  REQUIRED `store` on the shared type their return type narrows to
  `Omit<RagStoreChangedPayload, 'store'>` (a TYPE-ONLY edit-ops.ts touch; the
  emission sites stamp `store`). The helpers' existing deep-equal tests stay
  green untouched.
- **The host capture + guard are two seams on the Unit K host:** the boot
  commits `lastSnapshot` at `sidebar-panes.ts:588` (before the subscription at
  :650), the re-derive commits `lastSnapshot`+`lastDocHeads` together at
  :692-693 (the Unit V3 LOW-5 discipline — extendable to three-way), and the
  re-derive entry is the SINGLE subscription `onRagStoreChanged`
  (`sidebar-panes.ts:776-778`, Unit K §5.2 — "the SOLE subscription"). The
  guard is a prefix check before `editController.requestRebuild()`.
- **The renderer ignores the payload today** (`sidebar-panes.ts:776-778`), so
  no renderer logic depends on the payload shape — the change is additive and
  minimal (D5's "low-risk" verdict, review §9 spot-check "renderer payload
  handling is qualifier-safe").

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The REQUIRED `store` field + the collapsed shared declaration | Project-specific (the IPC payload surface, `src/shared/types.ts`) | Low cost; kills the R5 three-copy drift class permanently instead of pinning it by sync test. |
| The MCP path's qualification WITHOUT a new parameter (F1) | Project-specific (the U-MS2-resolved name is already in scope post-U-MS2) | Zero signature cost; the seven construction points stamp the in-scope resolver result (`ref?.name ?? ''`) — the SAME value U-MS2's 2-arg `(payload, storeName)` callback widening delivers to the wired call sites. NO 6th argument anywhere. |
| The `Omit<…,'store'>` return type on the two derivation helpers (edit-ops.ts, TYPE-ONLY) | Project-specific | Zero behavior cost; the helpers stay store-agnostic; the emission sites (which know the store) stamp. |
| The snapshot `store` field (`main.ts:377-380` + `shared/types.ts:416-435`) | Project-specific | Low cost; the renderer learns its store from the data it already fetches — no second channel. |
| The host `lastStore` capture + the foreign-store drop guard | Project-specific (`sidebar-panes.ts`) | Low cost; closes B5's re-derive storm while keeping the payload store-qualified for Phase 2's multi-store rendering (D5). |
| The existing-test fixture updates (a REQUIRED field ripples) | Project-specific (mechanical) | The honest cost of a REQUIRED field: the ~41 `handleEditTool` call sites in 6 test files keep their post-U-MS2 arity (the existing 4-param call sites + U-MS2's optional 5th `dir` where the wired tests pass it — NO 6th arg anywhere; the qualification rides the payload literals INSIDE the handler, so the call sites' argument lists are UNCHANGED) and only their captured-payload deep-equal assertions gain `store: <resolved name>`; ~11 test files' snapshot fixtures gain `store: 'main'`; 3 direct host-payload injections gain `store: 'main'`. Enumerated in §6. |

No engine gap. Nothing is handed off to `docs/defects.md`/`docs/HANDOFF.md` by
this unit.

### 3a. Adversarial findings (placeholder — RCA-3)

**This section is intentionally EMPTY until the unit's green.** Per RCA-3, the
mandatory post-green read-only adversarial pass (edge cases / unauthorized
access / malformed inputs) registers its findings here, and each host finding
is fixed + regression-tested before the unit is reported done. The
contract-pinned edge cases the pass must NOT regress (pre-pinned here so the
pass starts from them):

- A broadcast payload whose `store` is missing/`undefined`/non-string must be
  DROPPED by the host guard (fail-closed — never a re-derive, never a throw).
- `lastStore === null` (no successful snapshot yet) must DROP, never re-derive.
- A dropped broadcast must not touch the edit controller's coalescing state
  (`reDeriveInFlight`/`reDeriveQueued`).
- The preload bridge stays a TRANSPARENT pipe (no filtering — the drop is the
  renderer host's decision).
- The exactly-once/zero broadcast-count invariants per path (§5.6) are
  unchanged by the field.
- A `store` argument on an MCP tool cannot influence anything except the
  payload's `store` value (the selector semantics are U-MS2's; the adversarial
  probe re-checks it here — R7's "the `store` arg cannot influence any path").

### 3b. Proposal-review findings (the gate amendments this unit folds in)

The four-agent gate (`docs/specs/multi-document-store-config-review.md`)
returned PROCEED-WITH-AMENDMENTS; the items this unit folds in:

- **D5 / A3 (binding):** `RagStoreChangedPayload.store` is REQUIRED; all four
  emission sites qualify it in the same unit; the three structural payload
  declarations collapse to ONE shared declaration or are pinned in sync by
  test — **this spec pins the COLLAPSE** (§5.1); the foreign-store drop happens
  host-side. Pinned in §5.1–§5.4.
- **A4 (binding):** the review §4 byte-equality itemization is carried as
  binding acceptance criteria with the ONE intentional zero-config delta
  (broadcast/snapshot `store: 'main'`) explicitly enumerated. Pinned in §5.5.
- **B5 (the critique blocker this unit closes):** the unqualified
  `rag-store-changed` broadcast ⇒ a foreign-store ingest triggers a re-derive
  storm of the unchanged default graph. Closed by the host-side drop (§5.4),
  NOT by suppressing the broadcast (main still emits exactly once for every
  store — the payload is the Phase-2 multi-store rendering seam).
- **R2/R5 (the review's risk register):** R2 (zero-config regression) is
  pinned by the §5.5 acceptance rows; R5 (qualifier drift across the three
  copies) is pinned by the §5.1 collapse.

## 4. Design decisions pinned by this spec

- **STORE-QUALIFIED-BROADCAST (landed, this unit implements it):**
  `RagStoreChangedPayload` gains a REQUIRED `store: string`; all four emission
  sites qualify it; `rag-snapshot` gains `store`; the host drops foreign-store
  broadcasts before the re-derive trigger. Sub-pins this spec makes:
  - **QUALIFIED-VALUE = the registry store NAME.** The payload's `store` is the
    name under which the addressed store is registered — for the three UI
    paths (default-store-bound per A2) and for an MCP edit with the `store`
    selector omitted, the DEFAULT store's name; for a non-default addressed
    store, that store's name. In the zero-config implicit registry
    (MULTI-STORE-REGISTRY) that name is `'main'` — the pinned byte-equality
    delta. The value is NEVER the persistence file path, the corpus root, or
    any other identifier.
  - **SHARED-DECLARATION-COLLAPSE (A3's resolution, option 1 chosen):** ONE
    shared declaration in `src/shared/types.ts`; the three structural copies
    are DELETED; `preload.ts` and `mcp-server.ts` keep compat re-exports so
    the existing test importers compile unchanged. The alternative (a
    type-level sync test over three copies) is REJECTED: it detects drift
    instead of removing it, and every future payload field would re-pay the
    three-copy cost.
  - **HOST-BOOT-STORE-CAPTURE:** the renderer host records its boot store into
    a NEW `lastStore: string | null` field captured from the snapshot payload
    at BOTH snapshot-commit points (boot + re-derive), committed together with
    `lastSnapshot`/`lastDocHeads` (the LOW-5 discipline extended three-way).
  - **FOREIGN-STORE-DROP:** the guard lives in the renderer host's
    `onRagStoreChanged` — the SOLE `rag-store-changed` subscription (Unit K
    §5.2) — and drops any payload whose `store` is not exactly the captured
    store BEFORE `editController.requestRebuild()`. Main does NOT filter: a
    foreign-store edit still broadcasts EXACTLY ONCE (the payload is
    store-qualified for Phase 2; the drop is a renderer-side re-derive
    decision only).
  - **R3 ORDERING RULE (U-MS3-local label; NOT the review §5 R3 prefix-hole
    row, which is U-MS4's A1):** the boot-store capture MUST precede the
    renderer subscription, and an uncaptured store (`lastStore === null`)
    fails CLOSED (drop). The full race-window enumeration is §5.4.
- **Consumed, unchanged:** MULTI-STORE-REGISTRY (the name source + the
  implicit `'main'` entry); SINGLE-WRITER-STORE-PER-STORE + ENGINE-PER-STORE
  (the reconcile routing stays the addressed store's engine — U-MS2's wiring;
  this unit changes NO reconcile call); UI-SELECTOR-DEFERRED (the renderer
  boots/edits ONE store — the guard is that concept's Phase-1 enforcement);
  RAG-AUTHORITATIVE (the re-derive remains the renderer's response to a store
  change — for the store it renders); MCP-UI-EQUIVALENCE (both paths broadcast
  the same qualified payload shape); IPC-SURFACE-NOT-GROUP-GATED (no new
  channel, no gate seam, no RpcMethod change — this unit adds NO tool, NO
  group, NO five-seam edit).

## 5. The exhaustive contract

### 5.1 The collapsed declaration + the REQUIRED `store` field (`src/shared/types.ts`)

**BEFORE — three identical structural declarations (the drift class):**

```ts
// src/main/preload.ts:22-26 (copy 1; the bridge surface + impl use it at :59, :218-219)
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

// src/main/mcp-server.ts:349-353 (copy 2; handleEditTool's callback uses it at :369)
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

// src/renderer/sidebar-panes.ts:57-61 (copy 3; SidebarBridge:71 + onRagStoreChanged:776 use it)
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}
```

(`src/shared/types.ts:359-363` carries only the doc comment + the
`IPC_RAG_STORE_CHANGED` constant — no type. `src/main/edit-ops.ts:11` imports
the type FROM `./preload.js` for its two helpers :538/:652;
`src/main/main.ts:15` imports it from `./preload.js` but never uses it — a
latent unused import this unit repoints + gives a real use.)

**AFTER — ONE shared declaration (pinned, in `src/shared/types.ts`, directly
below the `IPC_RAG_STORE_CHANGED` constant at :363):**

```ts
// src/shared/types.ts — the ONE canonical declaration (Unit MS3 §5.1; the
// three structural copies in preload.ts/mcp-server.ts/sidebar-panes.ts are
// DELETED — A3's collapse resolution).
/** The main→renderer `rag-store-changed` event payload (the re-traversal
 *  trigger, Unit D §5.1.9). Broadcast after ANY successful RAG-store mutation
 *  via an MCP `edit.*` tool OR a UI commit-on-blur/batch/rich commit.
 *  Unit MS3 — `store` is REQUIRED: the registry-resolved name of the store the
 *  mutation landed on (the default store's name for the UI paths + an omitted
 *  `store` selector; the addressed store's name otherwise). The renderer host
 *  DROPS payloads whose `store` is not the store it renders (the B5 guard). */
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
  /** REQUIRED (A3) — the registry name of the store the mutation landed on. */
  store: string
}
```

**The fate of each of the THREE structural copies (each importer compiles
against the shared type — enumerated per copy):**

1. **`src/main/preload.ts:22-26` — DELETED.** The file imports
   `type RagStoreChangedPayload` from `../shared/types.js` (extend the import
   list at :7) and keeps a compat RE-EXPORT for its existing test importers
   (`tests/unit-v3-doc-heads-docnav.test.ts:44`,
   `tests/sidebar-panes-host.test.ts:48` import from
   `'../src/main/preload.js'`):
   ```ts
   export type { RagStoreChangedPayload }
   ```
   (mirrors the existing `export type { EditCommitResult }` at `preload.ts:19`).
   The bridge surface (:59) + the bridge implementation (:218-219) then use the
   shared type — no shape change to the bridge method
   (`onRagStoreChanged(handler: (payload: RagStoreChangedPayload) => void):
   () => void`). The bridge stays a TRANSPARENT pipe: the listener at :219
   forwards the payload verbatim; NO filtering happens in preload (the drop is
   the renderer host's decision — pinned).
2. **`src/main/mcp-server.ts:349-353` — DELETED.** The file imports
   `type RagStoreChangedPayload` from `../shared/types.js` (extend the import
   at :23) and keeps a compat RE-EXPORT for its existing test importer
   (`tests/edit-adversarial.test.ts:30` imports
   `{ handleEditTool, type RagStoreChangedPayload }` from
   `'../src/main/mcp-server.js'`):
   ```ts
   export type { RagStoreChangedPayload }
   ```
   `handleEditTool`'s callback parameter (:369) uses the shared type.
3. **`src/renderer/sidebar-panes.ts:57-61` (incl. the :54-56 comment) —
   DELETED, no re-export.** Nothing imports it from `sidebar-panes.js`. The
   file adds `RagStoreChangedPayload` to its existing
   `from '../shared/types.js'` type-import block (:40-48); the
   `SidebarBridge.edit.onRagStoreChanged` signature (:71) and the
   `onRagStoreChanged` method (:776) use the shared type structurally.

**Sync mechanism (pinned):** the collapse IS the mechanism — after this unit
there is exactly ONE declaration; a forgotten `store` at any construction
point is a TYPECHECK failure (strict mode, `tsconfig.json:7`), and the two
compat re-exports keep the three test-file importers compiling UNCHANGED. The
type-level sync-test alternative is rejected (§4).

**`main.ts:15` (pinned):** the unused `import type { RagStoreChangedPayload }
from './preload.js'` is repointed to `'../shared/types.js'` and gains a real
use — the three UI emission-site payload literals are TYPED
`RagStoreChangedPayload` (§5.3), so an omitted `store` is a compile error (the
R5 drift guard made structural).

### 5.2 The `RagSnapshotPayload.store` field (`src/shared/types.ts:416-435` + `src/main/main.ts:377-380`)

**BEFORE** (`shared/types.ts:417-435`): `{ nodes: Array<{…}>, edges: Array<{…}> }`.
**AFTER** (pinned):

```ts
export interface RagSnapshotPayload {
  /** Unit MS3 — REQUIRED: the registry-resolved name of the store this
   *  snapshot was taken from. The `rag-snapshot` IPC stays DEFAULT-STORE-BOUND
   *  (A2) — this names the default store ('main' zero-config). The renderer
   *  host captures its boot store from this field (§5.4). */
  store: string
  nodes: Array<{ /* …unchanged fields, types.ts:418-433… */ }>
  edges: Array<{ /* …unchanged fields, types.ts:434… */ }>
}
```

- `store` is REQUIRED (same discipline as the broadcast field: one producer,
  always known — an optional field would invite the null-capture ambiguity the
  R3 rule exists to prevent).
- **The handler (`main.ts:377-380`), before → after:**

```ts
// BEFORE
ipcMain.handle(IPC_RAG_SNAPSHOT, () => ({
  nodes: ragStore.listNodes(),
  edges: ragStore.listEdges(),
}))
// AFTER (U-MS3; post-U-MS2 `ragStore` is the DEFAULT store, A2)
ipcMain.handle(IPC_RAG_SNAPSHOT, () => ({
  nodes: ragStore.listNodes(),
  edges: ragStore.listEdges(),
  store: plan.defaultName,
}))
```

  `plan.defaultName` is the registry-resolved default store's NAME that U-MS2
  pins into main's scope — U-MS2 §5.1's `RagStoreBootPlan.defaultName` (the
  boot-plan field; U-MS2 §5.4 step 4 constructs `plan` in main and pins the
  main-scope locals `defaultStore`/`defaultEngine` — the default ENTRY's
  store/engine objects; there is NO `defaultStoreName` local in U-MS2's
  pinned wiring, so the payload reads `plan.defaultName`). U-MS2 consumes
  U-MS1's registry; in the zero-config implicit registry the value is
  `'main'`. The `nodes`/`edges` values are UNCHANGED (byte-equal). There is no
  other producer of `RagSnapshotPayload` — the single handler is the single
  source.

### 5.3 The four emission sites (exact before/after call shapes)

The `store` value at every site is the registry-resolved NAME of the store the
mutation landed on (§4 QUALIFIED-VALUE). Zero-config, every site emits
`'main'`. Every site's broadcast COUNT, channel, kind, nodeIds, and edgeIds
logic is UNCHANGED — the field is additive.

**Site 1 — the UI commit path (`src/main/main.ts:246-249`, inside
`ipcMain.handle(IPC_EDIT_COMMIT, …)`, broadcast only on `result.ok`):**

```ts
// BEFORE (main.ts:246-249)
void retrievalEngine.onStoreChanged('content', [payload.nodeId], []).catch((e) => { … })
backend.broadcast(IPC_RAG_STORE_CHANGED, { kind: 'content', nodeIds: [payload.nodeId], edgeIds: [] })
// AFTER
void retrievalEngine.onStoreChanged('content', [payload.nodeId], []).catch((e) => { … })
const changedPayload: RagStoreChangedPayload = { kind: 'content', nodeIds: [payload.nodeId], edgeIds: [], store: plan.defaultName }
backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
```
Zero-config broadcast: `{ kind: 'content', nodeIds: [<nodeId>], edgeIds: [], store: 'main' }`.

**Site 2 — the UI batch path (`src/main/main.ts:282-286`, inside
`ipcMain.handle(IPC_EDIT_BATCH, …)`, broadcast only on `result.ok`; the
`deriveBatchBroadcast` destructure at :282 is unchanged):**

```ts
// BEFORE (main.ts:282-286)
const { kind, nodeIds, edgeIds } = deriveBatchBroadcast(payload.ops, result.results, preBatchNodes)
void retrievalEngine.onStoreChanged(kind, nodeIds, edgeIds).catch((e) => { … })
backend.broadcast(IPC_RAG_STORE_CHANGED, { kind, nodeIds, edgeIds })
// AFTER
const { kind, nodeIds, edgeIds } = deriveBatchBroadcast(payload.ops, result.results, preBatchNodes)
void retrievalEngine.onStoreChanged(kind, nodeIds, edgeIds).catch((e) => { … })
const changedPayload: RagStoreChangedPayload = { kind, nodeIds, edgeIds, store: plan.defaultName }
backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
```

**Site 3 — the UI rich-commit path (`src/main/main.ts:306-309`,
`handleRichCommitIpc`'s injected broadcast boundary; the `reconcile` boundary
at :307 is UNCHANGED — this unit touches NO reconcile call):**

```ts
// BEFORE (main.ts:306-309)
return handleRichCommitIpc(ragStore, payload, {
  reconcile: (kind, nodeIds, edgeIds) => retrievalEngine.onStoreChanged(kind, nodeIds, edgeIds),
  broadcast: (kind, nodeIds, edgeIds) => backend.broadcast(IPC_RAG_STORE_CHANGED, { kind, nodeIds, edgeIds }),
})
// AFTER
return handleRichCommitIpc(ragStore, payload, {
  reconcile: (kind, nodeIds, edgeIds) => retrievalEngine.onStoreChanged(kind, nodeIds, edgeIds),
  broadcast: (kind, nodeIds, edgeIds) => {
    const changedPayload: RagStoreChangedPayload = { kind, nodeIds, edgeIds, store: plan.defaultName }
    backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
  },
})
```
(The `handleRichCommitIpc` body + `deriveRichCommitBroadcast` are UNCHANGED in
behavior — the deps boundary receives `(kind, nodeIds, edgeIds)` exactly as
today, `edit-ops.ts:689-747`; the qualification happens at the injection site.)

**Site 4 — the MCP edit path (`src/main/mcp-server.ts:1120-1136`; the
qualification lands inside `handleEditTool`'s SEVEN payload-construction
points — `mcp-server.ts:383, 395, 402, 410, 418, 433, 446` — one per
`edit.*` tool, mutually exclusive per call):**

```ts
// handleEditTool signature — BEFORE (mcp-server.ts:365-370)
export async function handleEditTool(
  store: RagStore | null,
  name: string,
  args: Record<string, unknown>,
  onStoreChanged?: (payload: RagStoreChangedPayload) => void,
): Promise<unknown>
// AFTER — NO new parameter (F1: this unit adds NONE; U-MS2 §5.3's post-U-MS2
// signature is FINAL — the callback is widened to (payload, storeName) and
// the 5th slot is U-MS2's `dir`):
export async function handleEditTool(
  store: RagStore | null,
  name: string,
  args: Record<string, unknown>,
  onStoreChanged?: (payload: RagStoreChangedPayload, storeName: string) => void,
  dir?: RagStoreDirectory | null,
): Promise<unknown>
```

```ts
// Example construction point — BEFORE (mcp-server.ts:383, edit.set_content)
if (result.ok) onStoreChanged?.({ kind: 'content', nodeIds: [nodeId], edgeIds: [] })
// AFTER — ALL SEVEN points gain `store: <resolved name>` (F1: the resolved
// name is ALREADY in scope — U-MS2's resolver result `ref?.name ?? ''`, the
// SAME value the widened callback receives as its second arg; NO 6th argument
// anywhere)
if (result.ok) onStoreChanged?.({ kind: 'content', nodeIds: [nodeId], edgeIds: [], store: ref?.name ?? '' })
```

The seven points and their post-U-MS3 payloads (kind/nodeIds/edgeIds logic
unchanged from the current literals at the cited lines; `store` = the in-scope
resolved name `ref?.name ?? ''` — an omitted `args.store` ⇒ the DEFAULT
store's name (S1), an addressed name ⇒ that name (S2), `''` only on the legacy
directory-less sentinel (S3 — U-MS2 §5.3 step 5's pinned legacy fallback,
reachable only in direct test calls; the wired server always injects `dir`)):

| Tool | Line | After (payload shape) |
| --- | --- | --- |
| `edit.set_content` | :383 | `{ kind: 'content', nodeIds: [nodeId], edgeIds: [], store: ref?.name ?? '' }` |
| `edit.create_node` | :395 | `{ kind: 'structural', nodeIds: [result.node.id], edgeIds: [], store: ref?.name ?? '' }` |
| `edit.delete_node` | :402 | `{ kind: 'structural', nodeIds: [nodeId], edgeIds: [], store: ref?.name ?? '' }` |
| `edit.split_node` | :410 | `{ kind: 'structural', nodeIds: [n0.id, n1.id], edgeIds: [edge.id], store: ref?.name ?? '' }` |
| `edit.merge_node` | :418 | `{ kind: 'structural', nodeIds: [sourceId, targetId], edgeIds: [], store: ref?.name ?? '' }` |
| `edit.set_edge` | :433 | `{ kind: 'structural', nodeIds: [source, target], edgeIds: [edge.id], store: ref?.name ?? '' }` |
| `edit.import_markdown` | :446 | `{ kind: 'structural', nodeIds: result.documentIds, edgeIds: [], store: ref?.name ?? '' }` |

**The wiring + broadcast (`mcp-server.ts:1124-1135`):** the `onStoreChanged`
callback body is otherwise unchanged — the engine reconcile at :1131 is
U-MS2's addressed-engine routing (NOT this unit's), and the broadcast at :1134
forwards the payload VERBATIM (pinned: the callback MUST NOT add/overwrite
`store` — the payload arrives already qualified). Post-U-MS2/MS3 the call is:

```ts
const result = await handleEditTool(addressedStore, name, args, (payload, storeName) => {
  void addressedEngine?.onStoreChanged(payload.kind, payload.nodeIds, payload.edgeIds)?.catch((e) => { … })  // U-MS2's routing, unchanged here
  backend.broadcast?.(IPC_RAG_STORE_CHANGED, payload)   // :1134 — the qualified payload forwarded as-is
}, ragStores)   // U-MS2 §5.3's 5th `dir` argument — the ONLY 5th arg; NO 6th argument exists (F1)
```

**The two derivation helpers (edit-ops.ts — TYPE-ONLY, zero behavior change):**

- `deriveBatchBroadcast(ops, results, preBatchNodes)` (`edit-ops.ts:534-538`):
  return type `RagStoreChangedPayload` → `Omit<RagStoreChangedPayload,
  'store'>`. The returned object stays `{ kind, nodeIds, edgeIds }` — the
  helper is store-agnostic; the emission site stamps. Its existing deep-equal
  tests (`tests/unit-p-ipc-edit-batch.test.ts:396-480`, incl. the §3a F1 set)
  stay green UNTOUCHED.
- `deriveRichCommitBroadcast(before, after)` (`edit-ops.ts:649-652`): return
  type `RagStoreChangedPayload | null` → `Omit<RagStoreChangedPayload,
  'store'> | null`. Existing tests
  (`tests/unit-u5-set-rich-text.test.ts:316-351`) stay green UNTOUCHED.
- `edit-ops.ts:11` — the import repoints from `'./preload.js'` to
  `'../shared/types.js'`.
- **Scope-discipline note:** `edit-ops.ts` is not in the review §3 U-MS3 file
  cluster; this touch is FORCED by the REQUIRED field (the helpers' return
  annotations must compile) and is type-only — zero behavior change, zero test
  churn. A deviation from the review's file cluster is recorded HERE so the
  doc review does not flag it as drift.

**Inter-spec dependency (pinned, F1):** U-MS2 owns the addressed-store resolution
at the tool wiring (resolved FIRST, before arg validation — the review §5 R1)
and the exposure of the resolved default store's name in main's scope
(`plan.defaultName` — U-MS2 §5.1/§5.4; the pinned main-scope locals are
`defaultStore`/`defaultEngine`). U-MS3 adds NO parameter: the `store` the MCP
emission sites stamp is U-MS2's RESOLVER RESULT (`ref?.name ?? ''`), computed
inside `handleEditTool` at the resolution step U-MS2 §5.3 pins (step 2) — the
same value U-MS2's 2-arg `onStoreChanged(payload, storeName)` widening
delivers to the wired call sites. If U-MS2's landed wiring carries the
resolved name in a different local shape, the implementer reconciles the
plumbing in the U-MS2 → U-MS3 order while keeping THIS spec's payload
contract byte-exact; the red tests pin the emitted payloads, not the local's
name.

### 5.3a The main.ts-side state expression map (F9 — node-tested vs typecheck-level vs RELEGATED)

The main.ts-side red states (broadcast sites 1–3 + the snapshot `store`
field) live in inline `ipcMain.handle` bodies, which tests NEVER import
(`main.ts` is never imported by this repo's tests). Per state, the pinned
expression is exactly one of the three classes below — the TestWriter derives
each state's test from THIS map:

- **NODE-TESTED (direct exported seams — no new seam needed):** the seven
  `handleEditTool` payload-construction points (site 4) via direct handler
  calls (§5.7 happy 5-6, 11-12), and the renderer
  host capture/guard via `sidebar-panes.ts` (§5.7 happy 8-10; §5.8 fails 2-5)
  — the host module IS imported by tests. The §5.6 MCP-path count invariants
  ride the same handleEditTool calls (node-tested).
- **TYPECHECK-LEVEL (pinned red = the `npm run typecheck` leg failing):**
  the declaration collapse (§5.7 happy 1; §5.8 fail 7) and any construction
  point omitting/mistyping `store` (§5.8 fail 1's type half) — the REQUIRED
  `store` on the shared declaration plus the TYPED literals (§5.1's
  `main.ts:15` pin: the three UI emission-site payload literals are declared
  `RagStoreChangedPayload`) make an omitted `store` a compile error (TS2741).
  The red is asserted by the typecheck leg, which runs in the trio after
  every unit (AGENTS.md item 4).
- **RELEGATED — not node-testable without a new seam (pinned honestly):**
  sites 1–3 (the UI commit/batch/rich broadcast literals — §5.7 happy 2-4)
  and the snapshot handler's `store: plan.defaultName` (§5.7 happy 7; §5.5
  row 4's binding test), plus the UI-path count invariants of §5.6 that ride
  the same inline bodies. The qualification is a ONE-TOKEN stamp on literals
  whose kind/nodeIds/edgeIds logic is already derived by the store-agnostic
  helpers (`deriveBatchBroadcast`/`deriveRichCommitBroadcast`); the bodies
  are inline `ipcMain.handle` closures. An extraction seam (the
  `handleRichCommitIpc`/`buildRagStoreDirectory` precedent) was CONSIDERED
  for these and REJECTED as not worth the surface: a `qualify(payload, name)`
  helper would have exactly one caller (main.ts) and the helpers must stay
  store-agnostic by pin (§5.3). The pinned relegation expression is ALL THREE
  of: (i) the typecheck guard above (the typed literals make a missing stamp
  a compile error — the stamp cannot silently go missing); (ii) code-review
  verification of the three literals + the snapshot handler against §5.3's
  and §5.2's pinned AFTER shapes; (iii) the unit's LIVE-PENDING battery —
  AUTHORED LATER by this unit's live-scenario gate (gate 6) at
  `docs/specs/unit-ms3-store-qualified-broadcast-live-pending-battery.md` IF
  the required MCP/UI tools are still pending at that point (the
  `unit-v1-store-adjacency-live-pending-battery.md` pattern; the file does
  NOT exist at spec time) — pinning the
  live-host observation: a UI commit on the running app broadcasts
  `{ …, store: 'main' }` and the `rag-snapshot` reply carries
  `store: 'main'`.

### 5.4 The renderer host: boot-store capture + the foreign-store drop + the R3 ordering (`src/renderer/sidebar-panes.ts`)

**The host change is EXACTLY four deltas — pinned:**

1. **The import + copy deletion** (§5.1 copy 3).
2. **The `lastStore` field** — pinned shape (a dedicated field, NOT a read of
   `lastSnapshot.store` at guard time):

```ts
// src/renderer/sidebar-panes.ts — beside lastSnapshot (:297)
/** Unit MS3 — the host's boot store (the store this host renders + edits).
 *  Captured from the `rag-snapshot` payload's REQUIRED `store` field at BOTH
 *  snapshot-commit points (boot + re-derive), committed TOGETHER with
 *  lastSnapshot/lastDocHeads (the LOW-5 discipline, three-way). Null until the
 *  first successful snapshot commit. Read by the foreign-store drop guard. */
private lastStore: string | null = null
```

   Rationale for a dedicated field over `lastSnapshot?.store`: the guard must
   stay decidable if a later refactor replaces/clears `lastSnapshot` (it is a
   Unit V3-era cache, not the guard's input); and the null-state is explicit
   (`lastSnapshot` already being null would silently conflate "no snapshot"
   with "no capture").
3. **The capture at BOTH commit points:**

```ts
// boot (sidebar-panes.ts:588) — committed WITH lastSnapshot, BEFORE the
// subscription at :650 (the R3 ordering, rule 1)
this.lastSnapshot = snapshot
this.lastStore = snapshot.store

// reDerive (sidebar-panes.ts:688-693) — committed TOGETHER with
// lastSnapshot + lastDocHeads, only after BOTH fetches succeed (the LOW-5
// all-or-nothing commit extended three-way)
this.lastSnapshot = snapshot
this.lastDocHeads = docHeads.documents
this.lastStore = snapshot.store
```

   `snapshot.store` is REQUIRED (§5.2), so the capture cannot be
   undefined-typed at the commit point. The re-derive re-captures because the
   re-derive snapshot is the same default-store-bound snapshot (A2) — in
   Phase 1 the captured value never changes (no store switcher,
   UI-SELECTOR-DEFERRED); re-capturing keeps `lastStore` consistent with
   `lastSnapshot` by construction. The capture points are EXACTLY these two —
   `refresh()` (which never fetches a snapshot, :560-567) captures nothing.

4. **The foreign-store drop guard — the ONLY change to `onRagStoreChanged`
   (:776-778); the parameter is no longer ignored:**

```ts
// BEFORE (sidebar-panes.ts:774-778)
/** The rag-store-changed handler: routes through the edit controller's
 *  dirty-edit guard (requestRebuild). */
onRagStoreChanged(_payload: RagStoreChangedPayload): void {
  this.editController.requestRebuild()
}

// AFTER — the SOLE subscription's handler (Unit K §5.2); the guard runs
// BEFORE the re-derive trigger (the B5 foreign-store drop, host-side per A3)
onRagStoreChanged(payload: RagStoreChangedPayload): void {
  // B5 — the foreign-store drop: a broadcast for a store this host is NOT
  // rendering must NOT re-derive the unchanged default graph. Fail-closed:
  // an uncaptured store (null) or a payload whose store is missing/non-string
  // (!== the captured name) is DROPPED, never re-derived.
  if (this.lastStore === null || payload.store !== this.lastStore) return
  this.editController.requestRebuild()
}
```

   The comparison is EXACT string equality with the captured name. A payload
   with `store: undefined`/`null`/a non-string (a malformed or legacy
   broadcast) fails `!==` and is DROPPED (fail-closed — an adversarial pin,
   §3a). A dropped broadcast returns BEFORE `requestRebuild()`, so it never
   touches the dirty-edit guard or the re-derive coalescing state
   (`reDeriveInFlight`/`reDeriveQueued`, :665-669/:765-771 — untouched by a
   drop). NO second subscription is added and none exists (Unit K §5.2: the
   SOLE subscription; grep-verified: `sidebar-panes.ts:650` is the only
   renderer subscription).

**The R3 ordering enumeration (the race window + its guard):**

The wired boot/re-derive timeline (line anchors = current `sidebar-panes.ts`):

| # | Step | Anchor |
| --- | --- | --- |
| T0 | main boots; the registry resolves the stores; `rag-snapshot` is default-store-bound (A2) | U-MS2 |
| T1 | renderer `boot()` fetches the snapshot (await) | :583 |
| T2 | **CAPTURE**: `lastSnapshot = snapshot` AND `lastStore = snapshot.store` | :588 (pinned commit point) |
| T3 | doc-heads → template → security → settings fetches | :593-628 |
| T4 | traversal → loadAppGraph → mountOperator | :642-648 |
| T5 | **SUBSCRIBE**: `bridge.edit.onRagStoreChanged((p) => this.onRagStoreChanged(p))` | :650 |
| T6 | steady state: every broadcast hits the guard | :776 |

**R3 rule 1 — capture-before-subscribe (pinned boot-ordering invariant):**
`lastStore` is committed at T2, which precedes the subscription at T5 — in the
wired path the guard NEVER evaluates with an uncaptured store. A test may pin
the ordering by asserting the bridge call order (`snapshot` fetched before
`edit.onRagStoreChanged` subscribed) — the same ordering Unit K §5.1 already
fixes; this unit pins that the capture rides the T2 commit point, NOT a later
or lazy point.

**R3 rule 2 — fail-closed on an uncaptured store (pinned):** if the ordering
were ever violated (or a test invokes `onRagStoreChanged` directly before any
boot), `lastStore === null` ⇒ DROP (no re-derive). Rationale: without a
captured boot store the host cannot decide; dropping is B5-safe (a spurious
re-derive of an unbooted/uncaptured host is worse than a missed one — the
first successful snapshot commit re-syncs the host anyway). The opposite
naive rule ("rebuild when `lastStore` is null") is REJECTED — it would
re-derive on foreign-store broadcasts, i.e. B5 alive.

**The race windows (enumerated for the TestWriter):**

- **W1 `[T1, T5)` — pre-subscription:** a broadcast emitted in this window is
  not delivered (the host is not subscribed). A foreign-store ingest in W1
  must not re-derive later — nothing was queued in W1 (the coalescing state
  only changes inside `requestRebuild`, which only the subscribed handler
  calls). Pinned: correct by construction; a test may assert that a
  broadcast delivered before the subscription registers produces no rebuild.
- **W2 — post-subscription steady state:** the guard decides. A
  `store: <default>` payload ⇒ `requestRebuild()` (today's behavior, byte
  -equal); a foreign-store payload ⇒ dropped (no rebuild).
- **W3 — during an in-flight `reDerive()`:** a foreign-store broadcast is
  DROPPED — it must NOT set `reDeriveQueued` (the in-flight default-store
  re-derive completes; no queued foreign re-derive fires afterward). A
  default-store broadcast in W3 queues as today (:665-668).
- **W4 — during the boot fetches `T2→T5` (between capture and subscribe):**
  same as W1 (unsubscribed). The hazard this window exposes — a foreign-store
  broadcast arriving between a SUBSCRIPTION and a LATE capture would observe
  `lastStore === null` — is closed by rule 1 (the capture is pinned to T2) AND
  rule 2 (the null case drops regardless).

**What does NOT change in the renderer:** the re-derive body (snapshot →
doc-heads → template/security/settings → traversal → assemble → load), the
`onTemplateChanged`/`onOperatorSettingsChanged` handlers, the coalescing, the
dirty-edit guard, the pane rendering, and the fact that the host renders
exactly ONE store (UI-SELECTOR-DEFERRED — Phase-2 multi-store rendering is a
`docs/pending.md` row, not an implicit promise).

### 5.5 The zero-config byte-equality acceptance rows (A4 — binding)

With **no** `provident-rag-stores.json` present (the implicit `'main'`
registry), every row below is byte-equal to today EXCEPT the ONE intentional
delta, which is enumerated so "byte-equal" is honest:

| # | Surface | Today | Zero-config after U-MS3 | Binding test |
| --- | --- | --- | --- | --- |
| 1 | Broadcast payload fields | `{ kind, nodeIds, edgeIds }` | same kind/nodeIds/edgeIds VALUES per path + **`store: 'main'`** — THE ONE intentional delta | §5.7 happy 2-5 |
| 2 | Broadcast channel | `'provident:rag-store-changed'` (`shared/types.ts:363`) | unchanged | §5.7 happy 2 |
| 3 | Broadcast counts | exactly-once/zero per path (§5.6) | unchanged | §5.7 happy 2-5 |
| 4 | Snapshot payload | `{ nodes, edges }` | same nodes/edges VALUES + **`store: 'main'`** (part of the same delta) | §5.7 happy 7 |
| 5 | Renderer re-derive behavior | every broadcast → `requestRebuild()` | byte-equal — every broadcast is `'main'` === `lastStore` `'main'`, so the guard passes exactly as today; the drop is UNREACHABLE zero-config | §5.7 happy 8-10 |
| 6 | MCP edit tool results / `EditCommitResult` / `BatchResult` / `RichCommitResult` | current shapes | unchanged (the broadcast payload is not a tool/IPC result). The query-RESULT `store` field is NOT this unit's — it is U-MS2's additive row (F3, pinned in `docs/specs/unit-ms2-store-wiring.md` §5.9; **F-MS2-4 erratum, 2026-09-05:** the field lives on the handler-RETURNED `RagQueryResult` ONLY — `RetrievalResult` gains NO field, the engine is store-name-blind); edit RESULTS are unchanged here, query RESULTS are U-MS2's | existing suites (§6) + U-MS2 §5.9 |
| 7 | IPC/tool/gate surface | no new channel, no new tool name, no RpcMethod, no group change | unchanged — this unit adds NO five-seam edit | `tests/mcp-security-hardening.test.ts` |
| 8 | Preload bridge surface | `commit/batch/commitRich/onRagStoreChanged` (+ rag/template/operatorSettings) | unchanged method set; only the payload TYPE'S declaration home changes | `tests/unit-u5-rich-commit-ipc.test.ts:219-222` |

Zero-config red matrix (R2): at least one test per row must assert the
byte-equality claim; row 1/4's `store: 'main'` presence is asserted EXPLICITLY
as the intentional deviation.

### 5.6 The broadcast-count invariants that MUST stay green

The Unit P A4 invariant (a successful edit broadcasts EXACTLY ONCE) extends
verbatim to the qualified payload — the field is ADDITIVE, never a second
broadcast:

- **UI commit** (`main.ts:237-251`): `result.ok` ⇒ EXACTLY 1 qualified
  broadcast; a failed/malformed commit ⇒ 0.
- **UI batch** (`main.ts:261-289`): a successful batch ⇒ EXACTLY 1 (Unit P
  §5.4 A4 — not per-op); a failed/malformed batch ⇒ 0.
- **UI rich commit** (`main.ts:298-310` + `edit-ops.ts:715-747`): a REAL
  change ⇒ EXACTLY 1; a no-op / failed / malformed commit ⇒ 0 (the U5
  idempotence — unchanged).
- **MCP `edit.*`** (`mcp-server.ts:1120-1136`): a successful tool call ⇒
  EXACTLY 1 qualified payload (the seven construction points are mutually
  exclusive — one per tool); a failed mutation ⇒ 0 (the H5 fail-state,
  `tests/edit-adversarial.test.ts:486-496`).
- **A foreign-store MCP edit broadcasts EXACTLY ONCE** — main does NOT
  suppress or filter foreign-store broadcasts (the drop is renderer-side; the
  payload is the Phase-2 seam). Pinned: the drop must never be implemented as
  a main-side filter.
- **The reconcile count is unchanged per path** (1 reconcile per successful
  broadcast on the UI paths + the MCP path) — this unit touches NO reconcile
  call.
- **A dropped broadcast changes NO counters**: no rebuild, no
  `reDeriveQueued`, no reconcile, no snapshot fetch.

### 5.7 Happy-path states (TestWriter red set — valid paths)

1. **The collapse:** `RagStoreChangedPayload` with REQUIRED `store` is
   declared in `src/shared/types.ts`; the three structural copies are gone;
   `preload.ts` + `mcp-server.ts` re-export it; `edit-ops.ts` + `main.ts` +
   `sidebar-panes.ts` import it from `../shared/types.js` (typecheck-level
   red).
2. **Site 1 zero-config:** a UI edit-commit `ok` ⇒ EXACTLY 1 broadcast
   `{ kind: 'content', nodeIds: [<nodeId>], edgeIds: [], store: 'main' }` on
   `IPC_RAG_STORE_CHANGED`.
3. **Site 2 zero-config:** a successful batch ⇒ EXACTLY 1 broadcast with the
   `deriveBatchBroadcast`-derived kind/nodeIds/edgeIds + `store: 'main'` (a
   content-only batch stays `'content'`; a create stays `'structural'` — the
   derived values unchanged, only the field added).
4. **Site 3 zero-config:** a REAL rich commit ⇒ EXACTLY 1 broadcast with the
   `deriveRichCommitBroadcast`-derived kind + `store: 'main'`; a no-op commit
   ⇒ 0 broadcasts (unchanged).
5. **Site 4 default:** `handleEditTool(store, 'edit.set_content', args, cb,
   dir)` where `dir` is a one-entry directory stub
   (`{ entries: new Map([['main', entry]]), defaultName: 'main' }` — U-MS2's
   `RagStoreDirectory` shape; NO 6th argument) ⇒ the captured payload
   deep-equals
   `{ kind: 'content', nodeIds: ['n1'], edgeIds: [], store: 'main' }` AND the
   widened callback's second arg is `'main'`; the
   same assertion shape for the other six construction points (at minimum:
   `split_node` structural + edgeIds, `set_edge` edgeIds, `create_node`
   structural, `delete_node`, `merge_node`, `import_markdown`
   `nodeIds: documentIds`).
6. **Site 4 non-default:** `handleEditTool(store2, 'edit.set_content', { …args,
   store: 'research-2026-09' }, cb, dir2)` where `dir2`'s entries include
   `'research-2026-09'` ⇒ the payload's `store` is
   `'research-2026-09'` — a non-default store's edit carries THAT store's
   name (all seven construction points; at minimum `set_content` +
   `create_node`).
7. **The snapshot:** the `rag-snapshot` handler returns
   `{ nodes, edges, store: 'main' }` zero-config; `nodes`/`edges` are
   byte-equal to today's values; `store` names the snapshotted (default)
   store.
8. **The boot capture:** after `boot()` with a snapshot whose `store` is
   `'main'`, `lastStore === 'main'` (observable via the guard's behavior:
   a `'main'` broadcast rebuilds) — and the capture precedes the subscription
   (the bridge call order: `rag.snapshot` resolved before
   `edit.onRagStoreChanged` is called).
9. **The re-derive capture:** after a default-store re-derive,
   `lastStore` is re-captured from the new snapshot and committed together
   with `lastSnapshot`/`lastDocHeads` (an aborted doc-heads fetch leaves all
   three stale — the LOW-5 three-way extension).
10. **The guard pass:** a post-boot broadcast with
    `store: 'main'` ⇒ `requestRebuild()` fires exactly as today (1 queued
    rebuild).
11. **The guard drop:** a post-boot broadcast with
    `store: 'research-2026-09'` ⇒ NO `requestRebuild` (0 rebuilds; the graph,
    the coalescing state, and the caches untouched).
12. **The MCP foreign-store end-to-end (handler-level):** a
    `handleEditTool(store2, 'edit.set_content', { …args, store:
    'research-2026-09' }, cb, dir2)` success yields EXACTLY 1
    broadcast with `store: 'research-2026-09'`, AND a host booted on
    `'main'` drops it (0 rebuilds) — the B5 closure demonstrated end-to-end.

### 5.8 Fail-states (TestWriter red set — documented fail-states)

1. **A construction point omitting `store`** ⇒ a TYPECHECK failure (the
   REQUIRED field on the collapsed declaration) — the red is the type-level
   assertion that every emission site's literal carries `store`.
2. **A malformed broadcast payload** (`store` missing/`undefined`/`null`/
   non-string) delivered to a booted host ⇒ DROPPED (no `requestRebuild`, no
   throw) — fail-closed.
3. **`lastStore === null`** (no successful snapshot commit; reachable in tests
   by invoking `onRagStoreChanged` before/without `boot`) ⇒ DROPPED (R3 rule
   2), regardless of the payload's store value.
4. **A foreign-store broadcast during an in-flight re-derive** (W3) ⇒ no
   `reDeriveQueued` is set; the in-flight re-derive completes; no queued
   foreign re-derive fires afterward.
5. **A foreign-store broadcast arriving pre-subscription** (W1) ⇒ not
   delivered; no rebuild (pinned by the bridge call-order assertion — happy
   8).
6. **A failed mutation** on any path ⇒ 0 broadcasts (unchanged; the store
   field is irrelevant to the count — the existing H5/no-broadcast tests stay
   green).
7. **The three structural copies are gone** ⇒ a type-level red: the shared
   declaration compiles for all three importers; the local declarations no
   longer exist (asserted via the re-export surface + the absence of the
   local `interface RagStoreChangedPayload` declarations).

### 5.9 Census / numeric claims

- **Payload declarations:** 3 → **1** shared (`src/shared/types.ts`) + **2**
  compat re-exports (`preload.ts`, `mcp-server.ts`); `sidebar-panes.ts` keeps
  none.
- **Emission sites:** **4** (each gains the field; zero-config value `'main'`).
- **`handleEditTool` payload-construction points qualified:** **7**
  (`mcp-server.ts:383,395,402,410,418,433,446`) via the in-scope U-MS2-resolved
  name (`ref?.name ?? ''`) — NO new parameter, NO 6th argument (F1); the 5th
  slot remains U-MS2's `dir`.
- **`RagSnapshotPayload` field added:** **1** (`store: string`, REQUIRED);
  producer sites: **1** (`main.ts:377-380`).
- **Host fields added:** **1** (`lastStore: string | null`).
- **Host capture points:** **2** (boot :588, reDerive :692-693 — the
  LOW-5 three-way commit).
- **Guard:** **1** (the `onRagStoreChanged` prefix check); subscriptions: **1**
  (unchanged — Unit K's SOLE subscription).
- **Derivation-helper return types narrowed:** **2** (`deriveBatchBroadcast`,
  `deriveRichCommitBroadcast` → `Omit<RagStoreChangedPayload, 'store'>`);
  behavior changes: **0**.
- **Broadcast counts:** UNCHANGED on every path (§5.6) — the exactly-once /
  zero invariants hold with the field present.
- **New IPC channels / tools / groups / RpcMethod members / gate seams:**
  **0** — this unit adds none.
- **Source files touched:** **6** — `src/shared/types.ts`,
  `src/main/preload.ts`, `src/main/mcp-server.ts`, `src/main/main.ts`,
  `src/main/edit-ops.ts` (type-only), `src/renderer/sidebar-panes.ts`.
- **New tests (est. per the review §6):** **14–18**, in ONE new test file.
- **Renderer behavior change:** exactly the guard (§5.4 item 4) + the capture
  (item 3) + the import (item 1) — the renderer still renders ONE store
  (UI-SELECTOR-DEFERRED holds).

### 5.10 Cross-references

- **Gate:** `docs/specs/multi-document-store-config-review.md` §2 D5, §3
  (the U-MS3 row), §4 (the byte-equality table — rows "Broadcast payloads" +
  "Tool results"), §5 R2/R5, §8 A3/A4, §9 (the "renderer payload handling is
  qualifier-safe" spot-check).
- **Decisions:** `docs/decisions.md` **STORE-QUALIFIED-BROADCAST** (landed
  2026-09-05 — the row this unit implements), consuming **MULTI-STORE-REGISTRY**
  (the implicit `'main'` entry = the zero-config store name),
  **SINGLE-WRITER-STORE-PER-STORE**, **ENGINE-PER-STORE** (the addressed-store
  reconcile routing — U-MS2's, unchanged here), **UI-SELECTOR-DEFERRED**,
  **RAG-AUTHORITATIVE**, **MCP-UI-EQUIVALENCE**, **IPC-SURFACE-NOT-GROUP-GATED**,
  **EDIT-COMMIT-RETURN-ASYMMETRY** (unchanged), **UI-MOUNT-RE-DERIVE** (the
  guard rides the SOLE subscription's handler).
- **Sibling units:** U-MS1 (`docs/specs/unit-ms1-store-registry.md` — the
  registry + the name semantics); U-MS2
  (`docs/specs/unit-ms2-store-wiring.md` — the addressed-store resolution, the
  engine map, `plan.defaultName` (+ the pinned `defaultStore`/`defaultEngine`
  locals), the A2 default-store-bound IPC matrix this unit consumes); U-MS4 (`docs/specs/unit-ms4-id-prefixing.md` — NOT changed
  here); U-MS5 (`docs/specs/unit-ms5-settings-listing.md` — the settings
  listing + `RagQueryPayload.store` — NOT changed here).
- **Unit D:** `docs/specs/unit-d-editing.md` §5.1.9 (the
  `rag-store-changed` re-traversal trigger this unit qualifies).
- **Unit P:** `docs/specs/unit-p-ipc-edit-batch.md` §5.4 (the broadcast rules
  + the `deriveBatchBroadcast` helper) + §3a A4 (the exactly-once invariant
  this unit's §5.6 extends) + §5.8 (the census — unchanged counts).
- **Unit U5:** `docs/specs/unit-u5-set-rich-text.md` §1.3/§2.1 (the
  `handleRichCommitIpc` boundary this unit's site 3 qualifies; the no-op ⇒ 0
  broadcasts idempotence preserved).
- **Unit K:** `docs/specs/unit-k-sidebar-panes-host.md` §5.1 (the boot
  sequence — T1-T5), §5.2 (the SOLE subscription + the dirty-edit guard).
- **Unit V3:** `docs/specs/unit-v3-doc-heads-docnav.md` §5.4 (the
  `lastDocHeads` capture + the LOW-5 commit-together discipline this unit
  extends three-way).
- **Phase 2 seam:** `docs/pending.md` (the multi-store rendering + per-store
  embedder rows — the store-qualified payload is their seam; the foreign-store
  broadcast is emitted, not suppressed).

## 6. The unit → file → test-file mapping

| Unit seam | File | Test home |
| --- | --- | --- |
| The shared declaration + REQUIRED `store` | `src/shared/types.ts` (new interface; the snapshot `store` field) | `tests/unit-ms3-store-qualified-broadcast.test.ts` (NEW — the §5.7/§5.8 red set, est. 14–18) |
| Copy 1 → shared + re-export; transparent bridge | `src/main/preload.ts` | same |
| Copy 2 → shared + re-export; `handleEditTool` (NO new param — F1) + the 7 construction points; site 4 | `src/main/mcp-server.ts` | same (+ the existing H5 suite updated, below) |
| Sites 1-3 + the snapshot handler `store` | `src/main/main.ts` | RELEGATED per §5.3a — the typecheck-level red (the trio's typecheck leg) + code-review + the live-pending battery authored at the live-scenario gate (gate 6, §5.3a item iii — NOT an existing file at spec time); NOT the node test file |
| The helpers' `Omit` return types (TYPE-ONLY) | `src/main/edit-ops.ts` | existing suites (stay green) |
| `lastStore` capture + the foreign-store drop + R3 | `src/renderer/sidebar-panes.ts` | same (+ the existing host suites updated, below) |

**Existing broadcast/IPC tests that MUST stay green** (their meaning — counts,
kinds, channels, idempotence — is unchanged; they are the regression floor):

- `tests/unit-p-ipc-edit-batch.test.ts` — the `deriveBatchBroadcast` set
  incl. §3a F1 (:396-480): green UNTOUCHED (the helper stays store-agnostic).
- `tests/unit-u5-set-rich-text.test.ts` — the `deriveRichCommitBroadcast`
  set (:316-351, :642-676): green UNTOUCHED.
- `tests/integration-adversarial.test.ts` — the broadcast-channel Finding-1
  set (:102-163): green UNTOUCHED (channel + count only).
- `tests/unit-u5-rich-commit-ipc.test.ts` — the bridge-surface census
  (:186-222): green UNTOUCHED (4 edit methods — no new bridge method).
- `tests/sidebar-panes-host.test.ts` — the subscription assertion (:567) +
  the method census (:326): green after the fixture updates below.

**Existing tests UPDATED by this unit (mechanical, in the same red→green
pass; a REQUIRED field ripples):**

- **`handleEditTool` call sites — NO new argument (post-U-MS2 arity stands:**
  the existing 4-param call sites + U-MS2's optional 5th `dir` where the
  wired tests pass it; NO 6th arg anywhere, F1)** — **41 call sites in 6
  test files** (grep-verified; 14+18+1+3+2+3 = 41): `tests/edit-adversarial.test.ts` (14 —
  incl. the H5 deep-equal at :464, whose captured payload additionally gains
  `store: <resolved name>` — `''` on that file's legacy directory-less 4-arg
  calls per §5.3's S3 note, `'main'`/the addressed name where a directory is
  passed),
  `tests/mcp-security-hardening.test.ts` (18), `tests/rag-edit-gate.test.ts`
  (1), `tests/integration-adversarial.test.ts` (3),
  `tests/crosslink-backlink.test.ts` (2),
  `tests/crosslink-backlink-adversarial.test.ts` (3). The call sites'
  argument lists are UNCHANGED — only the captured-payload assertions gain
  the `store` field.
- **`RagSnapshotPayload` fixtures gain `store: 'main'`** — the fixture
  builders/empty snapshots in: `tests/sidebar-panes-host.test.ts`,
  `tests/unit-v3-doc-heads-docnav.test.ts`,
  `tests/unit-v3-doc-heads-docnav-adversarial.test.ts`,
  `tests/blind-unit-v3-doc-heads-docnav-greens.test.ts`,
  `tests/contenteditable-editor-host.test.ts`,
  `tests/editing-mode-broadcast-host.test.ts`,
  `tests/unit-l-textarea-editing-ui.test.ts`, `tests/rich-splice.test.ts`,
  `tests/sidebar-panes.test.ts`, `tests/sidebar-panes-adversarial.test.ts`,
  `tests/template.test.ts`.
- **The 3 direct host-payload injections gain `store: 'main'`** (otherwise the
  new guard would drop them):
  `tests/contenteditable-editor-host.test.ts:568, :835, :1046`.

**The trio** (test + typecheck + build) runs after the unit per AGENTS.md
item 4; the projected trio delta per the review §6 is ≈ +14–18 pass.