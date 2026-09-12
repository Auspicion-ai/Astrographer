# Spec — Unit U-D7: The Tag Write Op `edit.set_doc_meta`

- **Status:** SPEC (the tag-mutation write op of the document directory/category
  slice — the SEVENTH and FINAL unit of the ratified U-D1…U-D7 decomposition;
  execution order U-D1 → U-D2 → U-D3 → U-D4 → U-D5 ∥ U-D6 → **U-D7**). Gate
  references: `docs/decisions.md` row **DOC-DIRECTORY-CATEGORY-GATE**
  (PROCEED-WITH-AMENDMENTS, RATIFIED 2026-09-11),
  `docs/specs/document-directory-category-review.md` §3 **M9** (write-op design)
  + **M11** (write validation/authorization) + §4 **Q5**/**Q8** + the **U-D7**
  row in §5, and the GATED parent `docs/specs/document-directory-category.md`
  §3.5 (the write surface). Sibling/precedent specs:
  `docs/specs/unit-o-edit-ops.md` (the edit-ops layer + the discrimated-result
  discipline + the edit-op census), `docs/specs/unit-ud1-document-metadata-fields.md`
  (the LANDED `RagNode.documentPath?`/`tags?` + the store's normalization/
  validation), `docs/specs/unit-ud2-journal-invertibility.md` (the LANDED
  structural `node-update` journaling a `tags` delta rides),
  `docs/specs/unit-j-mcp-security-hardening.md` (the seam invariants +
  `MUTATING_METHODS` negative contract), `docs/specs/unit-ud5-list-documents-tool.md`
  (the sibling main-handled `edit`-style seam wiring + the spec FORMAT),
  `docs/specs/unit-ms2-store-wiring.md` (the `store` argument + resolution),
  and `docs/specs/unit-m-children-field.md` (the spec FORMAT).
- **Scope:** exactly ONE new first-class edit op + the ACTUAL per-landing seam
  set for a main-handled `edit` tool:
  1. `src/main/edit-ops.ts` — the NEW `SetDocMetaResult` type + the NEW
     `setDocMeta` op (alongside `setProps`/`setSubtree`/`setType`). It updates a
     **document root's `tags` ONLY** via ONE atomic `putNode`; it does NOT set
     `documentPath` (import-minted, immutable in v1 — M9/Q8).
  2. `src/main/security.ts` — `TOOL_GROUPS` gains `'edit.set_doc_meta': 'edit'`
     (an EXISTING group; the `ToolGroup` union `:3` and `VALID_GROUPS` `:191`
     are **UNCHANGED**).
  3. `src/main/mcp-server.ts` — `ALL_TOOLS` gains `'edit.set_doc_meta'`; the SDK
     registration array (`const graph`) gains the zod row; `handleEditTool` gains
     a `case 'edit.set_doc_meta'` that calls `setDocMeta(ctx, …)` and emits the
     per-store `rag-store-changed` broadcast on success.
  4. `src/shared/types.ts` — the `RpcMethod` union gains
     `| 'edit.set_doc_meta'` (after `| 'edit.set_edge'`).
  **NOT** touched: `MUTATING_METHODS` (renderer), the renderer switch, any IPC
  channel, any preload bridge method, any persisted format, the `BatchOp`
  union, `src/main/rag-store.ts`, the importer, or the traversal.
- **DELIBERATE EXCLUSIONS (the ratified decomposition splits these out — this
  unit implements NONE of them):**
  - **ui-overhaul G2 — the doc-nav tree UI.** The provident-authored tree, the
    folder/leaf rendering, and any tags editor UI are G2 (ratified 2026-09-11).
    U-D7 ships the op only; there is **no UI counterpart in this slice**.
  - **Path rename.** `documentPath` is immutable in v1 (Q8); a rename is a later
    unit (`docs/pending.md`). U-D7 exposes no path parameter/field.
  - **Any Gnosis mapping.** A Gnosis wiki is a flat single-parent bucket with a
    single-string tag filter (Q6, local-only v1). The op is **`edit`-group only**;
    `gnosis-edit` is deferred with Q6 and is NOT touched.
  - **No `BatchOp` extension.** The op is a first-class single op **outside** the
    closed `BatchOp` union (`BATCH-ATOMICITY-API`, `decisions.md`); it is NOT
    applied through `applyBatch` and adds no union member.
  - **No store/model/hash/journal change.** `RagNode`, `nodeSource`, the
    `validateNodeShape` normalization, and the U-D2 journal classification are
    LANDED and are consumed, not re-implemented.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, validation/authorization rule, byte-pinned message, happy-path state,
  and fail-state below is derivable from this spec ALONE. The TestWriter writes
  the red set for `src/main/edit-ops.ts` (the op + the result type + the cap
  constants), `src/main/security.ts` (`TOOL_GROUPS`), `src/main/mcp-server.ts`
  (`ALL_TOOLS`, the zod row, the `handleEditTool` case), and
  `src/shared/types.ts` (`RpcMethod`) from §5.6/§5.7 BEFORE any implementation,
  into `tests/unit-ud7-set-doc-meta-op.test.ts`. The op is testable WITHOUT
  Electron via a direct `setDocMeta({ store }, …)` call and via
  `handleEditTool(store, 'edit.set_doc_meta', args, onChanged)` (the house
  `tests/rag-edit-gate.test.ts` seam); the zod schema is testable via the
  in-memory SDK harness pattern.

---

## 1. What the unit asks

The document directory/category slice's store model (U-D1), journal inversion
(U-D2), import/id scheme (U-D3), listing (U-D4), and query filters (U-D6) are
landed. The LAST piece is the **write** surface for cross-cutting categories:
an agent must be able to SET a document's `tags`. `setProps` cannot do it (it
merges `node.props` only — M9), so U-D7 lands a first-class op:

1. **A NEW edit op `setDocMeta`** (in `src/main/edit-ops.ts`) that updates a
   **document root's `tags` ONLY**, via ONE atomic `putNode`. It does NOT set
   `documentPath` (path is import-minted and immutable in v1 — M9/Q8).
2. **Exposed as the MCP tool `edit.set_doc_meta`** in the existing `edit`
   ToolGroup (mutating, default-off), registered through the ACTUAL main-handled
   seam set: `security.ts` `TOOL_GROUPS`, `mcp-server.ts` `ALL_TOOLS` + zod +
   `handleEditTool`, and `types.ts` `RpcMethod`. The renderer seam
   (`MUTATING_METHODS`, the renderer switch) is **NOT touched** — see §5.3.
3. **Input `{ nodeId: string, tags: string[] }`** plus the SAME optional
   `store?: string` every landed `edit.*` tool carries (verified: yes — the
   `edit.set_content`/… zod schemas all carry `store: z.string().optional()` and
   the handler resolves it through `resolveStoreArg`). **Output** is a
   discriminated `SetDocMetaResult` (`{ ok: true, node }` / `{ ok: false, error }`),
   mirroring the existing `edit.set_*` result shape. The op NEVER throws for a
   domain failure.
4. **Validation + authorization (M11):** `tags` must be an array of
   non-empty-after-trim strings; the count and per-tag length are capped;
   control characters are rejected; `documentPath` is REJECTED (the op has no
   such field). The target `nodeId` MUST be a current document ROOT (a
   `doc-head` target) — a non-root target is a domain failure. `documentPath`
   stays server-minted.
5. **The edit-op census advances by one** (the verified current count is **10**,
   not 9 — see the §5.8 RCA-10 note).
6. **Group `edit` only** (default-off). `gnosis-edit` is deferred with Q6 and is
   NOT touched.
7. **MCP-only in this slice:** there is no UI/IPC counterpart for a tags write
   yet, and none is added in v1 (§5.5).

## 2. Feasibility verdict

**Feasible — a small, purely additive wiring of a first-class op onto the
already-landed edit-ops layer and five-seam gate.** No engine/foundation gap;
entirely host-side (`src/`).

- **The write path is landed.** `putNode` (Unit A §5.4) is the single atomic
  write path; every existing op reads the node, computes the new node, and
  writes via ONE `putNode` (§5.1).
- **The metadata normalization is landed (U-D1).** The store's
  `normalizeTags` (`rag-store.ts:414-416`) applies trim / case-sensitive /
  first-occurrence dedupe / `[]`→omitted. The op passes the array through and
  does NOT duplicate the rule (§5.2).
- **The journal inversion is landed (U-D2).** `putNodeSync` (`rag-store.ts:1050-1051`)
  classifies a `tags` delta as a structural `node-update` (full
  `toPublicNode` snapshot), so `undo()`/`redo()` restore/re-apply `tags`. U-D7
  inherits this; it defines no journal logic (§5.5).
- **The seam is landed and precedented.** The `edit` group exists in both
  `security.ts` unions; `handleEditTool` routes every `edit.*` name to the ops
  and emits the per-store broadcast; `resolveStoreArg` gives the `store`
  argument the M1/M2/S1/S2/S3 behavior. U-D7 adds one row per seam and reuses
  the resolution/broadcast pattern (§5.3/§5.4).
- **The root predicate is landed.** A document root is the TARGET of a
  `doc-head` edge (U-D3/`markdown-parse.ts:602`; U-D4 M7). `RagStore.edgesTo`
  is on the interface (`rag-store.ts:280`), so the op can test it read-only
  (§5.2).
- **RCA-10 check — ONE conflict, RESOLVED.** The delegated brief estimated the
  current edit-op census at 9 (→10). The ACTUAL landed count is **10**:
  Unit U5's `setRichText` is the 10th edit op
  (`docs/specs/unit-u5-set-rich-text.md` §3: "Edit-op census 9 → 10: `setRichText`
  is the 10th edit op"), and `src/main/edit-ops.ts` exports ten ops
  (`setContent`, `createNode`, `deleteNode`, `splitNode`, `mergeNode`, `setEdge`,
  `setProps`, `setSubtree`, `setType`, `setRichText`). U-D7 is therefore the
  **11th** op: **10 → 11**. The brief's "9" is stale (pre-U5). Every other pin
  is verified against the code with NO conflict — see the §5.8 RCA-10 note and
  the §5.3 seam verification.

No `provident-ssr` engine seam is involved, so no `docs/defects.md` /
`docs/HANDOFF.md` item is expected from this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `setDocMeta` op | Project-specific (the edit-ops layer) | Low cost; the ONLY path that can write top-level `tags` (`setProps` merges `node.props` only). |
| The MCP tool `edit.set_doc_meta` + the `edit` group row | Project-specific (the MCP tool surface + the five-seam gate) | Low cost; makes the tag write agent-reachable, default-off. |
| The root-target predicate (a `doc-head` TARGET) | Project-specific (reuses the landed `doc-head` edge direction) | Low cost; keeps `tags` on document roots and `documentPath` server-minted. |
| The `tags` validation + caps + control-char guard | Project-specific (M11 write validation) | Low cost; a bounded, deterministic input surface (bad input is a domain result, never a throw). |
| The `store` arg + resolution | Project-specific (reuses U-MS2) | Zero new logic; the `edit.*` handler already resolves it first. |
| The census +1 | Project-specific (the edit-op count) | Low cost; the document-directory write surface is complete. |

No engine gap. ui-overhaul G2 (the doc-nav tree UI), the path rename, and the
Gnosis mapping are LATER slices — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — **to be run after the unit lands**. The
known edge cases this unit's contract already pins (so the adversarial pass
must NOT regress them); the pass results are recorded at the end of this
section:

- **A1 — root-only.** A `doc-head` edge's SOURCE (a head section) is NOT a
  root; a non-root target returns
  `{ ok: false, error: 'edit.set_doc_meta: target is not a document root' }`.
  The adversarial pass must confirm a section node, a hand-created `div`, and a
  `doc-end`/`next-section` participant are ALL rejected, and that the store is
  unchanged.
- **A2 — path immutability (M9/Q8).** No input path can change a root's
  `documentPath` (the zod schema has no `documentPath`/`path` field; the op
  params carry only `nodeId`/`tags`; the `{ ...node }` spread PRESERVES the
  existing path). The adversarial pass must confirm a raw
  `{ nodeId, tags, documentPath: ['x'] }` call leaves `documentPath` unchanged,
  and that the op never writes the field.
- **A3 — malformed `tags` is a domain result, never a throw.** A non-array, a
  non-string member, a whitespace-only member, a count over the cap, a per-tag
  length over the cap, or a control character returns the matching
  `{ ok: false, error }` and leaves the store unchanged. The adversarial pass
  must confirm NO input makes the op (or the handler) throw a store error or
  pollute.
- **A4 — caps are inclusive at the boundary.** Exactly 64 tags is accepted;
  65 is rejected. A tag of exactly 128 chars is accepted; 129 is rejected.
  (Unit: 128 chars = JS `.length`, i.e. UTF-16 code units.)
- **A5 — `[]` clears tags via the store's normalization.** `tags: []` → the
  stored node has `tags: undefined` (U-D1) and the write is journaled per U-D2
  (a metadata delta). A `[' b ', 'a', 'b', 'A']` input stores `['b','a','A']`
  (trim + first-occurrence dedupe + case-sensitive). The adversarial pass must
  confirm the op does NOT pre-normalize (the store's rule is authoritative) and
  does NOT drift.
- **A6 — journal invertibility is inherited (U-D2).** A tags change lands a
  `structural` `node-update` entry; `undo()` restores the prior tags and
  `redo()` re-applies. A fresh boot after undo/redo has ZERO quarantines (the
  restore re-hashes). The adversarial pass must confirm U-D7 adds NO journal
  code.
- **A7 — group gating.** With `edit` disabled, `toolAllowed('edit.set_doc_meta',
  ['read','dispatch']) === false` and the tool is not registered; with `edit`
  enabled it is. `gnosis-edit` is NOT consulted. Editing is never a `code`-group
  op.
- **A8 — the store argument.** An unknown `store` throws
  `` edit.set_doc_meta: unknown store '<raw>' `` BEFORE the op runs; a
  non-string/empty `store` throws
  `edit.set_doc_meta: store must be a non-empty string`; an omitted `store`
  resolves to the default entry. The message echoes only the caller's input.
- **A9 — the op is a single atomic write, outside `BatchOp`.** A successful op
  lands exactly ONE journal entry and exactly ONE persist; a failed op lands
  ZERO and leaves the store unchanged. `BatchOp` is UNCHANGED. The adversarial
  pass must confirm `applyBatch` does not accept `setDocMeta`.
- **A10 — always-write (no no-op guard).** A tags write with semantically
  unchanged tags still calls `putNode` and journals (the store's U-D2 no-op case
  takes the `content` branch). U-D7 pins this deliberately — it does NOT
  duplicate the store's normalization to synthesize a no-op guard.
- **A11 — the `nodeKind` default through the write (U-D2 A11 inheritance).**
  `getNode` returns `nodeKind ?? 'content'`; `{ ...node, tags }` therefore
  materializes an explicit `'content'` on a root stored with `nodeKind:
  undefined`. It is public-API-unobservable and self-consistent (the hash is
  recomputed). The adversarial pass must confirm no quarantine and must NOT
  "fix" it here.
- **A12 — the per-store broadcast.** A successful op emits exactly ONE
  `{ kind: 'structural', nodeIds: [nodeId], edgeIds: [], store: <resolved name> }`
  broadcast; a failed op emits ZERO. The retrieval reconcile is
  fire-and-forget and non-fatal.

Any host finding is fixed here + regression-tested; any `provident-ssr` package
finding → `docs/defects.md`/`docs/HANDOFF.md` (none expected).

**Adversarial pass (RCA-3, 2026-09-11, post-green): A1–A12 all confirmed; no
in-scope HOST defect and no `provident-ssr` package finding.** F1 (SPEC-DOC,
LOW) — the §5.8/§6 `ALL_TOOLS` ripple listed THREE pins; the actual set is FOUR
(add `tests/unit-h2-runtime-controller.test.ts:1384`), corrected in the same
pass. F2 (SPEC-NOTE, INFO) — for a semantically-unchanged tags write the U-D2
journal entry is `content` while the U-D7 broadcast is `structural`; both are
pinned deliberately and the divergence is harmless (no tag delta exists to
lose; the structural broadcast is a conservative re-traversal) — see A10/§5.5.
No host code change was warranted.

### 3b. Proposal-review findings

The proposal-review gate returned **PROCEED-WITH-AMENDMENTS** for the document
directory/category proposal (`docs/decisions.md` row
**DOC-DIRECTORY-CATEGORY-GATE**, 2026-09-11;
`docs/specs/document-directory-category-review.md`). The amendments THIS unit
pins (each cross-referenced to the section that resolves it):

- **M9 — write op design** (§1/§5.1/§5.5): `edit.set_doc_meta(tags)` as a
  first-class single op **outside** the closed `BatchOp` union
  (`BATCH-ATOMICITY-API`), journaled per M2. `setProps` cannot write top-level
  `tags` (it merges `node.props` only). Path is read-only in v1; group-gated
  under `edit` (`gnosis-edit` deferred with Q6).
- **M11 — write validation/authorization** (§5.2): reject control characters;
  cap the tag count/length; require the target id to be a current document root
  (a `doc-head` target); keep `documentPath` server-minted.
- **Q5 — first-class `edit.set_doc_meta`** outside the closed `BatchOp` union
  (§5.5).
- **Q8 — path immutable v1**, enforced at the op boundary (§5.2/§5.7).
- **U-D7 row (§5)** (§5.3/§5.8): `edit-ops.ts` (+`handleEditTool`);
  `security.ts`; `mcp-server.ts` `ALL_TOOLS`+zod; `types.ts` `RpcMethod`;
  per-store broadcast. Primary fail-state coverage: path write rejected
  (immutable); invalid tags; non-root target; unauthorized group; missing node;
  caps.
- **DOC-DIRECTORY-CATEGORY-GATE / RAG-EDIT-MCP-GROUPS (consumed):** the `edit`
  group is mutating + default-off through the five-seam gate; editing is never a
  `code`-group op.

## 4. Design decisions pinned by this spec

- **DOC-DIRECTORY-CATEGORY-GATE (consumed, M9/M11 + the U-D7 row):** a
  first-class `edit.set_doc_meta` in the `edit` group writes a document root's
  `tags` only; path immutable; root-only; caps + control-char rejection.
- **BATCH-ATOMICITY-API (consumed):** the op is a single atomic `putNode` and
  does NOT extend the closed `BatchOp` union.
- **RAG-EDIT-MCP-GROUPS (consumed):** the `edit` group is mutating +
  default-off through the ACTUAL seam set for a main-handled tool; editing is
  never a `code`-group op.
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** there is no UI tags-write
  counterpart in this slice; the op is MCP-only in v1 (§5.5). The binding
  remains satisfied vacuously and forward-looking: any future UI/IPC tags path
  MUST route through the SAME `setDocMeta` op (the Unit O pattern).
- **IPC-SURFACE-NOT-GROUP-GATED (consumed, `decisions.md`):** U-D7 adds NO IPC
  channel; the `edit` group gates the MCP agent path only.
- **SINGLE-WRITER-STORE (consumed):** the tags write routes through the
  single-writer `putNode` queue; U-D7 adds no new write method.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the source of truth; the
  op writes the root record and the renderer re-derives.
- **U-D1 metadata model (consumed):** `tags` is trimmed / case-sensitive /
  first-occurrence-deduped / `[]`→omitted by the store; `documentPath` is
  non-empty segments; both are hash-covered (11-field `nodeSource`).
- **U-D2 journal classification (consumed):** a `tags` delta takes the
  structural `node-update` branch (full `toPublicNode` snapshot); undo/redo
  restores/re-applies it and re-hashes. U-D7 inherits this; it re-implements
  nothing.

## 5. The exhaustive contract

### 5.1 The op + the result type + the signature

`src/main/edit-ops.ts` gains ONE result type and ONE op, alongside the existing
`setProps`/`setSubtree`/`setType` (Unit O).

**The new result type (pinned):**

```ts
// src/main/edit-ops.ts — the NEW result type (JSON-serializable; the MCP tool
// returns it). Mirrors the existing Set*Result discriminated shape.
export type SetDocMetaResult = { ok: true; node: RagNode } | { ok: false; error: string }
```

**The new op (pinned):**

```ts
/** Unit U-D7 (docs/specs/unit-ud7-set-doc-meta-op.md §5.1) — set a DOCUMENT
 *  ROOT's `tags` ONLY. `documentPath` is import-minted and IMMUTABLE in v1
 *  (M9/Q8): the op has no such parameter and the `{ ...node }` spread
 *  PRESERVES the existing path. The node's `tags` are passed through to the
 *  store's `putNode`, which applies the U-D1 normalization (trim, case-
 *  sensitive, first-occurrence dedupe, `[]`→omitted) — the op does NOT
 *  re-implement it. A STRUCTURAL op: `putNodeSync` classifies a `tags` delta as
 *  a `node-update` entry (U-D2), so the write is journal-invertible. The op is
 *  a single atomic `putNode` (NOT a `BatchOp`). NEVER throws for a domain
 *  failure. */
export async function setDocMeta(
  ctx: EditOpContext,
  params: { nodeId: string; tags: string[] },
): Promise<SetDocMetaResult> {
  // 1. tags shape + member type.
  if (!Array.isArray(params.tags)) {
    return { ok: false, error: 'edit.set_doc_meta: tags must be a string array' }
  }
  for (const t of params.tags) {
    if (typeof t !== 'string') {
      return { ok: false, error: 'edit.set_doc_meta: tags must be a string array' }
    }
  }
  // 2. count cap (M11).
  if (params.tags.length > MAX_DOC_TAGS) {
    return { ok: false, error: `edit.set_doc_meta: too many tags (max ${MAX_DOC_TAGS})` }
  }
  // 3. per-tag length cap (M11).
  for (const t of params.tags) {
    if (t.length > MAX_DOC_TAG_LENGTH) {
      return { ok: false, error: `edit.set_doc_meta: tag too long (max ${MAX_DOC_TAG_LENGTH})` }
    }
  }
  // 4. control characters (M11).
  for (const t of params.tags) {
    if (hasControlChar(t)) {
      return { ok: false, error: 'edit.set_doc_meta: tags must not contain control characters' }
    }
  }
  // 5. non-empty-after-trim (M11; the store's own rule, surfaced as a result).
  for (const t of params.tags) {
    if (t.trim() === '') {
      return { ok: false, error: 'edit.set_doc_meta: tags must be non-empty strings' }
    }
  }
  // 6. existence.
  const node = ctx.store.getNode(params.nodeId)
  if (!node) {
    return { ok: false, error: 'edit.set_doc_meta: node not found' }
  }
  // 7. the target MUST be a current document ROOT — the TARGET of a `doc-head`
  //    edge (U-D3 markdown-parse.ts:602; U-D4 M7). A section / hand-created
  //    node is a domain failure.
  const isRoot = ctx.store.edgesTo(params.nodeId).some((e) => e.kind === 'doc-head')
  if (!isRoot) {
    return { ok: false, error: 'edit.set_doc_meta: target is not a document root' }
  }
  // 8. the single atomic write. `tags` is passed RAW; the store normalizes
  //    (U-D1). `documentPath` is preserved by the spread — never set here.
  const updated = await ctx.store.putNode({ ...node, tags: params.tags })
  return { ok: true, node: updated }
}
```

**The new module constants + helper (pinned):**

```ts
// src/main/edit-ops.ts — the U-D7 caps + the control-char guard (M11).
const MAX_DOC_TAGS = 64
const MAX_DOC_TAG_LENGTH = 128
/** C0 controls + DEL: \u0000-\u001F and \u007F. */
function hasControlChar(s: string): boolean {
  return /[\u0000-\u001F\u007F]/.test(s)
}
```

**API rules (pinned):**

- **ASYNC**, returns `Promise<SetDocMetaResult>`.
- **NEVER throws for a domain failure.** Every domain failure above returns
  `{ ok: false, error }`. The ONLY throw path is a store-level failure the op
  does not catch (a malformed record reaching `putNode`) — the same discipline
  as the existing ops (Unit D/O).
- **Returns the updated node** on success: `{ ok: true, node: <updated node> }`
  (the store's normalized record: trimmed/deduped tags and `[]`→omitted).
- **Single atomic edit:** ONE `putNode` through the single-writer queue; no
  partial mutation is ever observable.
- **Operates on the `RagStore` INTERFACE** (`EditOpContext.store`), never the
  concrete JSON store — SOURCE-SWITCHABLE.
- **No `documentPath`/`path` parameter.** The op reads only `nodeId`/`tags`.

### 5.2 Validation + authorization (M11) + path immutability (Q8)

**Validation order (pinned — deterministic; the FIRST failing rule wins):**

| # | Rule | Fail message (byte-pinned) |
| --- | --- | --- |
| 1 | `tags` is an array | `edit.set_doc_meta: tags must be a string array` |
| 2 | every member is a `string` | `edit.set_doc_meta: tags must be a string array` |
| 3 | `tags.length <= 64` | `edit.set_doc_meta: too many tags (max 64)` |
| 4 | every `tag.length <= 128` | `edit.set_doc_meta: tag too long (max 128)` |
| 5 | no member contains `[\u0000-\u001F\u007F]` | `edit.set_doc_meta: tags must not contain control characters` |
| 6 | every `tag.trim() !== ''` | `edit.set_doc_meta: tags must be non-empty strings` |
| 7 | the target node exists | `edit.set_doc_meta: node not found` |
| 8 | the target is a `doc-head` TARGET | `edit.set_doc_meta: target is not a document root` |

**The tool-level nodeId guard (pinned):** `handleEditTool` throws
`Error('edit.set_doc_meta: nodeId required')` when `args.nodeId` is not a
non-empty string — BEFORE the op runs, mirroring `edit.set_content`'s
`nodeId required` guard. (This is a caller-shape error, not a domain failure;
the op's own domain failures all return results.)

**Normalization is the store's (pinned):** the op passes `params.tags` RAW
(`{ ...node, tags: params.tags }`). The store's `normalizeTags`
(`rag-store.ts:414-416`) trims each tag, dedupes on the trimmed value with
first-occurrence order, preserves case-sensitivity, and maps `[]`→`undefined`.
The op does NOT trim/dedupe/normalize; it does NOT add a no-op guard (a
semantically-unchanged write still calls `putNode`; the store's U-D2 no-op case
takes the `content` branch — §5.5).

**Path immutability (Q8, pinned):** the op has no path parameter; the
`{ ...node }` spread carries the existing `documentPath` into `putNode`, which
re-normalizes it (U-D1) and re-stores it UNCHANGED. There is therefore NO code
path by which `edit.set_doc_meta` writes `documentPath`. A caller-supplied
`documentPath` key on a raw handler call is ignored (the handler reads only
`nodeId`/`tags`), and the zod schema omits the field, so the SDK strips it.

**Authorization (pinned):**

- **Group gate:** the tool is registered/callable ONLY when the `edit` group is
  enabled (`edit` is default-off — §5.3). `gnosis-edit` is NOT consulted.
- **Store gate:** the `store` argument is resolved by the EXISTING
  `resolveStoreArg` seam before the op runs (§5.4) — an unknown/malformed store
  fails loud.
- **Node gate:** root-only (row 8 above). No credential/authority surface is
  added (tags are document metadata, not secrets — parent spec §3.6).

**Caps rationale (pinned):** `MAX_DOC_TAGS = 64` and `MAX_DOC_TAG_LENGTH = 128`
are THIS unit's M11 decision — the review/parent spec require a cap but pin no
number. They are module constants in `src/main/edit-ops.ts` (not exported) and
are enforced by BEHAVIOR (the boundary states in §5.6/§5.7).

### 5.3 The seam set (the ACTUAL per-landing set — M15)

A main-handled `edit.*` tool touches **four** source sites. The renderer seam
(`MUTATING_METHODS`, the renderer switch) and `MUTATING_METHODS` are
**UNCHANGED** — verified against the code:

- **Seam 1 — `src/main/security.ts` `TOOL_GROUPS` (add one row).** After
  `'edit.import_markdown': 'edit',` (`:53`), before the Unit I `code.template.*`
  block:
  ```ts
  // U-D7 (docs/specs/unit-ud7-set-doc-meta-op.md §5.3) — the mutating tag-write
  // op (document-root `tags` only; path immutable). `edit` group, default-off.
  'edit.set_doc_meta': 'edit',
  ```
  The `ToolGroup` union (`:3`) and `VALID_GROUPS` (`:191`) are **UNCHANGED**
  (`edit` already exists). `defaultSecurityConfig()` (`:136-138`) is UNCHANGED.
- **Seam 2 — `src/main/mcp-server.ts` `ALL_TOOLS` (add one row).** After
  `'edit.import_markdown',` (`:1773`; the U-D7 row is `:1775`):
  ```ts
  // U-D7 §5.3 — the mutating tag-write tool (document-root tags only).
  'edit.set_doc_meta',
  ```
- **Seam 3 — `src/main/mcp-server.ts` the SDK `graph` zod row (add one row).**
  After the `edit.import_markdown` row (`:2208`), before the Unit I
  `code.template.*` comment (`:2210`; the U-D7 zod row is `:2209`):
  ```ts
  { name: 'edit.set_doc_meta', description: 'Set a document root\'s tags (a document-metadata write → journaled as a structural node-update, re-traversal). Only tags are mutable; documentPath is immutable in v1. The target must be a document root (a doc-head target). Requires edit group.', inputSchema: { nodeId: z.string(), tags: z.array(z.string()), store: z.string().optional() } },
  ```
  The schema is **lax** (the house pattern): `tags: z.array(z.string())`
  enforces array-of-strings at the transport; the deeper rules (trim, caps,
  control chars) are enforced by the op. There is **NO `documentPath`/`path`
  field**.
- **Seam 4 — `src/shared/types.ts` `RpcMethod` (add one member).** After
  `| 'edit.set_edge'` (`:299`):
  ```ts
  | 'edit.set_doc_meta'
  ```

**The renderer seam is NOT touched (pinned, RCA-10 verification):**

- `MUTATING_METHODS` (`src/renderer/renderer.ts:18`) is
  `{ 'dispatch', 'load', 'op', 'teardown', 'code.load', 'code.loadBatch',
  'journal' }` — the methods that mutate the RENDERER app graph. `edit.*` tools
  are MAIN-handled and never reach the renderer; `edit.set_doc_meta` is NOT a
  member. (`Unit J` §5.2 invariant (f): the negative contract.)
- The renderer switch (`handleRequest`, `:20-81`) has NO `edit.*` case; an
  `edit.set_doc_meta` method that somehow reached it would hit `default:` and
  throw `unknown method: edit.set_doc_meta` (fail-closed).
- No IPC channel and no preload bridge method is added.
- `src/main/edit-ops.ts` is the op's home (the fifth primary site) — its
  `RAG_NODE_TYPES`/`RAG_EDGE_KINDS`/`RAG_NODE_CHILD_TYPES`/`DANGEROUS_KEYS`
  sets and the `EditOpContext` are UNCHANGED; only the new type/op/constants/
  helper are added.

### 5.4 The `handleEditTool` case + the broadcast

`handleEditTool`'s existing prologue is UNCHANGED: the null-store guard
(`:1331`), the `resolveStoreArg` call (`:1334`), the addressed-entry/target
selection (`:1337-1338`), and the `emit` closure (`:1343-1345`). The new case
runs AFTER all of that, so:

1. **Null store** → `` throw new Error('edit.set_doc_meta: no rag store
   configured') `` (the `${name}` guard at `:1331`).
2. **`store` resolution FIRST** (`:1334`) — M1 (non-empty string) then M2
   (membership) for a present `store`; S1 (default entry) for an omitted
   `store`; S3 (legacy sentinel → `target = store`) for the directory-less path.
   Messages: `edit.set_doc_meta: store must be a non-empty string` /
   `` edit.set_doc_meta: unknown store '<raw>' ``.
3. **`target` = the addressed store** (`entry ? entry.store : store`).

**The case (pinned):**

```ts
// src/main/mcp-server.ts — inside handleEditTool's switch, after the
// `edit.import_markdown` case and before `default:` (:1441).
    case 'edit.set_doc_meta': {
      const nodeId = typeof args.nodeId === 'string' ? args.nodeId : ''
      if (nodeId === '') throw new Error('edit.set_doc_meta: nodeId required')
      // Finding-5 discipline — pass the RAW tags through (no coercion). A
      // non-array reaches the op, which returns its documented
      // `'edit.set_doc_meta: tags must be a string array'` fail-state.
      const tags = args.tags
      const result = await setDocMeta(ctx, { nodeId, tags: tags as string[] })
      if (result.ok) emit({ kind: 'structural', nodeIds: [nodeId], edgeIds: [], store: storeName })
      return result
    }
```

**The broadcast (pinned):** a successful op emits EXACTLY ONE
`{ kind: 'structural', nodeIds: [nodeId], edgeIds: [], store: storeName }`
through the shared `emit` (U-MS3 store-qualification). `structural` mirrors the
store's U-D2 `node-update` classification (the metadata delta is structural).
A failed op emits NOTHING. The registration loop's reconcile
(`mcp-server.ts:2293-2307`) is UNCHANGED and receives the payload.

**MCP/UI equivalence (pinned):** the MCP tool and any future UI/IPC tags path
are the SAME op. In v1 there is no UI counterpart (§5.5); the tool is the only
`setDocMeta` caller.

### 5.5 MCP-only in this slice + journaling inheritance + atomicity

**MCP-only (pinned):** the review Q5/U-D7 row calls it an MCP write op and M9
says "group-gated under `edit`". There is **no** tags-write UI in the renderer
(the settings/doc-nav panes do not author tags) and no existing IPC edit-path
counterpart pattern for a per-op tags write (the landed IPC surfaces are
`IPC_EDIT_COMMIT` for `set_content`, `IPC_EDIT_BATCH` for batches,
`IPC_EDIT_RICH_COMMIT` for the rich write-back). Therefore `edit.set_doc_meta`
is **MCP-only in this slice**. This is consistent with
`IPC-SURFACE-NOT-GROUP-GATED` (the group gates the MCP agent path only) and with
the Unit O pattern (the rich-text ops are op-level; their MCP wiring was
forward-looking). If a UI tags path is later added, it MUST route through the
SAME `setDocMeta` op (MCP-UI-EQUIVALENCE, forward-looking) — a later unit.

**Journaling inheritance — U-D2 (pinned, NOT re-implemented):** the op's ONE
`putNode({ ...node, tags })` changes only `tags`. `putNodeSync`'s
classification (`rag-store.ts:1050-1051`) computes
`tagsChanged = !sameStringArray(existing.tags, rec.tags)` and takes the
**structural `node-update`** branch, whose `before`/`after` are full
`toPublicNode` snapshots carrying the normalized tags. `undo()`/`redo()` route
through `setNodeFields`, which normalizes + re-hashes — so the restore never
quarantines. **U-D7 adds ZERO journal code.** (If the tags are semantically
unchanged, U-D2's no-op case takes the `content` branch — §5.7 A10.) The
`content` journal branch and the always-`structural` broadcast can diverge for a
semantically-unchanged tags write; this is deliberate and harmless — the
content-branch snapshot omits `documentPath`/`tags` (U-D2 M2), but with no tag
delta there is nothing to invert, and the structural broadcast is a conservative
re-traversal. No no-op guard is synthesized (A10).

**Atomicity + `BatchOp` exclusion (pinned):** the op is a single atomic
`putNode` (one write, one journal entry, one persist) — NOT a `BatchOp` and NOT
applied through `applyBatch`. The closed `BatchOp` union
(`rag-store.ts:184-197`) is UNCHANGED; `applyBatch` continues to reject any
non-union op. A failed op leaves the store unchanged and the journal
unpolluted.

**Explicit U-D7 boundary (pinned):** NO new `RagNode` field; NO `nodeSource`
change; NO `validateNodeShape`/`normalizeTags` change; NO journal
entry/classification change; NO `BatchOp` member; NO import/id-scheme change;
NO listing/tree change; NO query-filter change; NO IPC/bridge; NO
`MUTATING_METHODS`/renderer change; NO Gnosis mapping; NO UI.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Op signature + result type:** `setDocMeta` is exported, async, takes
   `(ctx, { nodeId, tags })`, returns `Promise<SetDocMetaResult>`; the result is
   `{ ok: true, node }` / `{ ok: false, error }`.
2. **Seam completeness:** `groupForTool('edit.set_doc_meta') === 'edit'`;
   `ProvidentMcpServer.ALL_TOOLS` includes `'edit.set_doc_meta'`; the SDK
   `graph` carries the row with `inputSchema: { nodeId: z.string(), tags:
   z.array(z.string()), store: z.string().optional() }` and NO path field; the
   `RpcMethod` union accepts `'edit.set_doc_meta'` (type-level).
3. **Default-off:** `defaultSecurityConfig().enabled` is `['read','dispatch']`;
   `toolAllowed('edit.set_doc_meta', ['read','dispatch']) === false`.
4. **Enabled:** with `edit` in the enabled set,
   `toolAllowed('edit.set_doc_meta', ['edit']) === true`; `gnosis-edit` alone is
   NOT sufficient.
5. **Tags write happy:** a document root (the target of a `doc-head` edge) →
   `setDocMeta({ store }, { nodeId: rootId, tags: ['x','y'] })` →
   `{ ok: true, node }`; `getNode(rootId)!.tags === ['x','y']`; a `structural`
   `node-update` journal entry is recorded (U-D2); the MCP path emits ONE
   `{ kind: 'structural', nodeIds: [rootId], edgeIds: [], store }` broadcast.
6. **Normalization is the store's:** `tags: [' b ', 'a', 'b', 'A']` →
   `getNode(rootId)!.tags === ['b','a','A']` (trimmed, first-occurrence deduped,
   case-sensitive). The op does NOT pre-normalize.
7. **`[]` clears tags:** `tags: []` → `getNode(rootId)!.tags === undefined`
   (U-D1 `[]`→omitted); the write still occurs (one journal entry).
8. **Path preserved (documentPath unchanged):** a root with
   `documentPath: ['a','b']` → `setDocMeta(..., { tags: ['x'] })` →
   `getNode(rootId)!.documentPath === ['a','b']` (UNCHANGED).
9. **Existence + root gates pass in order:** a valid root target writes; the
   returned node reflects the normalized tags.
10. **Boundary caps accepted:** exactly 64 tags → ok; a tag of exactly 128
    chars → ok.
11. **Atomicity:** after a successful op, `getNode` reflects the full change;
    the journal has ONE new entry; `undoDepth()` increases by exactly 1; a
    failed op leaves both unchanged.
12. **Journal invertibility (inherited):** `setDocMeta` with new tags → `undo()`
    restores the prior tags; `redo()` re-applies. A fresh boot after undo (and
    after redo) has the root in `status().loadedNodes`, NOT in
    `status().quarantined`.
13. **Store-qualified broadcast + resolution:** `{ store: '<other>' }` routes
    the write to the addressed store and stamps `store: '<other>'` on the
    broadcast; `{ store: 'main' }` (the default name) deep-equals the
    omitted-store write.
14. **MCP/UI equivalence (structural, forward-looking):** the MCP
    `edit.set_doc_meta` and a direct `setDocMeta({ store }, …)` call with the
    same params produce the same store state + the same re-traversal.
15. **`BatchOp` is unchanged:** the union still has its existing members and
    `applyBatch` does not accept a `setDocMeta` op.

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`tags` is a non-array** (object, string, number, `null`, `undefined`) →
   `{ ok: false, error: 'edit.set_doc_meta: tags must be a string array' }`;
   store unchanged.
2. **a `tags` member is a non-string** → same message; store unchanged.
3. **count over the cap** (65 tags) →
   `{ ok: false, error: 'edit.set_doc_meta: too many tags (max 64)' }`; store
   unchanged.
4. **per-tag length over the cap** (129 chars) →
   `{ ok: false, error: 'edit.set_doc_meta: tag too long (max 128)' }`; store
   unchanged.
5. **a control character** (`'\u0000'`, `'\n'`, `'\t'`, `'\u007F'`) →
   `{ ok: false, error: 'edit.set_doc_meta: tags must not contain control
   characters' }`; store unchanged.
6. **an empty or whitespace-only member** (`''`, `'   '`) →
   `{ ok: false, error: 'edit.set_doc_meta: tags must be non-empty strings' }`;
   store unchanged.
7. **missing node** → `{ ok: false, error: 'edit.set_doc_meta: node not found' }`;
   store unchanged.
8. **non-root target** (a section node / a hand-created node / a `doc-end`
   source) →
   `{ ok: false, error: 'edit.set_doc_meta: target is not a document root' }`;
   store unchanged.
9. **path-write attempt — no path is writable (M9/Q8):** a raw
   `{ nodeId, tags, documentPath: ['x'] }` handler call returns the normal tags
   result; the root's `documentPath` is UNCHANGED (the field is ignored); the
   zod schema strips it at the SDK boundary. No error is raised (immutability is
   a guarantee, not a domain failure).
10. **unknown store (M2):** `{ store: 'nope' }` throws exactly
    `` edit.set_doc_meta: unknown store 'nope' `` — BEFORE the op runs; the
    message echoes only the caller's input (capped at 200 chars).
11. **malformed `store` (M1):** a non-string/empty `store` throws exactly
    `edit.set_doc_meta: store must be a non-empty string`; no write.
12. **missing/empty `nodeId`:** `handleEditTool` throws exactly
    `edit.set_doc_meta: nodeId required` (the tool-level guard); the op is not
    called.
13. **group off / unauthorized:** with `edit` disabled the tool is not
    registered and `toolAllowed('edit.set_doc_meta', ['read','dispatch']) ===
    false`; an `edit.set_doc_meta` that reached the renderer switch would throw
    `unknown method: edit.set_doc_meta` (fail-closed). Editing is never a
    `code`-group op.
14. **malformed tags cannot bypass validation (no throw):** every malformed
    input returns a documented result; NONE throws a store error or pollutes.
    A direct `handleEditTool` call with a raw `tags: 123` returns the
    `tags must be a string array` result (the raw pass-through discipline).
15. **a failed op lands ZERO journal entries and does NOT broadcast.**

### 5.8 Census / numeric claims

- **Edit-op census: 10 → 11.** `setDocMeta` is the **11th** edit op in
  `src/main/edit-ops.ts` (the 10 landed: `setContent`, `createNode`,
  `deleteNode`, `splitNode`, `mergeNode`, `setEdge`, `setProps`, `setSubtree`,
  `setType`, `setRichText`). **RCA-10 conflict (RESOLVED):** the delegated brief
  estimated "9 → 10"; the ACTUAL landed count is 10 (Unit U5's `setRichText` is
  the 10th — `docs/specs/unit-u5-set-rich-text.md` §3), so U-D7 is 10 → 11. The
  brief's "9" predates U5. The implementation pass MUST update the census in the
  trackers (`docs/decisions.md`, `docs/next-steps.md`, and any spec that pins
  the count) to **11** in the same pass.
- **New edit op:** **1** — `setDocMeta`.
- **New result type:** **1** — `SetDocMetaResult`.
- **New module constants/helper in `edit-ops.ts`:** **3** — `MAX_DOC_TAGS`
  (64), `MAX_DOC_TAG_LENGTH` (128), `hasControlChar`.
- **New MCP tool:** **1** — `edit.set_doc_meta`.
- **`ALL_TOOLS` entries: 56 → 57** (the U-D5/U-D6 state is 56 — see
  `tests/unit-ud6-query-document-filters.test.ts:492`,
  `tests/unit-h8-operator-editor.test.ts:1271`,
  `tests/blind-unit-ud6-query-document-filters-greens.test.ts:537`, and
  `tests/unit-h2-runtime-controller.test.ts:1384`; ALL FOUR
  pins are a **sanctioned ripple** updated 56 → 57 in the same pass — see §6).
- **`TOOL_GROUPS` `edit` rows: 7 → 8** (`edit.set_content`, `edit.create_node`,
  `edit.delete_node`, `edit.split_node`, `edit.merge_node`, `edit.set_edge`,
  `edit.import_markdown`, + `edit.set_doc_meta`). New group rows: **1**.
- **`ToolGroup` union members: 9 → 9** (UNCHANGED — `edit` exists): `read`,
  `dispatch`, `graph`, `code`, `module`, `rag`, `edit`, `gnosis`, `gnosis-edit`.
- **`VALID_GROUPS` values: 9 → 9** (UNCHANGED).
- **`RpcMethod` members:** + **1** (`edit.set_doc_meta`). (Note: the union
  already omits `edit.import_markdown`, so the `edit.*` RpcMethod members are
  not a complete tool census — see the U-D5 §2 observation; U-D7 still adds its
  member per M15/the U-D7 row.)
- **SDK `graph` rows:** + **1**. **`handleEditTool` cases: 7 → 8.**
- **New `MUTATING_METHODS` members:** **0** — the tool is MAIN-handled and does
  NOT mutate the renderer graph (the Unit J negative contract). **New renderer
  switch cases:** **0**. **New IPC channels / bridge methods:** **0**.
- **New broadcasts (code paths):** **1** — the `edit.set_doc_meta` success
  emits the EXISTING `rag-store-changed` payload shape (`kind:'structural'`).
  New payload types: **0**.
- **New types (shared):** **0**. **New IPC channels/constants:** **0**.
- **New `RagNode` fields:** **0**. **New persisted formats / store / journal /
  traversal changes:** **0**. **New `BatchOp` members:** **0**.
- **Source files changed:** **4** — `src/main/edit-ops.ts`,
  `src/main/security.ts`, `src/main/mcp-server.ts`, `src/shared/types.ts`.
  `src/main/rag-store.ts`, `src/renderer/renderer.ts`, `src/main/main.ts`,
  `src/main/preload.ts`, and the rest of `src/`: **0**.

### 5.9 Cross-references

- **Gate:** `docs/specs/document-directory-category-review.md` §3 M9 (write-op
  design) + M11 (write validation/authorization) + §4 Q5/Q8 + the U-D7 row in
  §5; `docs/decisions.md` row **DOC-DIRECTORY-CATEGORY-GATE**
  (PROCEED-WITH-AMENDMENTS, RATIFIED 2026-09-11).
- **Parent (GATED):** `docs/specs/document-directory-category.md` §3.5 (the
  write surface: `edit.set_doc_meta` writes `tags` only, outside the closed
  `BatchOp`, path immutable), §3.6 (security: the `edit` group), §3.8
  (creation ops — U-D7 is tags-only, not create).
- **Predecessor / consumed (LANDED):**
  - `docs/specs/unit-ud1-document-metadata-fields.md` §5.1 (`RagNode.tags?`),
    §5.4 (the store's `normalizeTags`: trim / case-sensitive / first-occurrence
    dedupe / `[]`→omitted), §5.5 (off-root fields are stored but ignored — U-D7
    is the write-surface restriction), §3a F4.
  - `docs/specs/unit-ud2-journal-invertibility.md` §5.1 (the `putNodeSync`
    `tagsChanged` classification → structural `node-update`), §5.3 (the
    `setNodeFields` restore + re-hash).
  - `docs/specs/unit-ud3-import-path-id-scheme.md` (the `doc-head` edge
    direction: source = first section, target = document root —
    `src/main/markdown-parse.ts:602`).
  - `docs/specs/unit-ud4-doc-heads-tree.md` §5.2 (M7: the root is the
    `doc-head` TARGET) — the root predicate U-D7 reuses.
- **Sibling seams (consumed):** `docs/specs/unit-ms2-store-wiring.md` §5.2 (the
  trailing `store` schema field), §5.3 (the resolution-first ordering + the
  M1/M2/S1/S2/S3 matrix); `docs/specs/unit-ms3-store-qualified-broadcast.md`
  (the store-qualified `rag-store-changed` payload the success emit stamps);
  `docs/specs/unit-ud5-list-documents-tool.md` (the sibling main-handled
  `edit`-style seam wiring + the spec FORMAT).
- **Edit-ops contract (consumed):** `docs/specs/unit-o-edit-ops.md` §5.1 (the
  `EditOpContext`, the discriminated-result discipline, the `Set*Result`
  shapes), §5.5 (single atomic edit), §5.6 (MCP/UI equivalence), §5.9 (the
  census this unit extends); `docs/specs/unit-u5-set-rich-text.md` §3 (the
  census 9 → 10 — the `setRichText` 10th op that makes U-D7 the 11th).
- **Hardening (consumed):** `docs/specs/unit-j-mcp-security-hardening.md` §5.2
  (invariants (b)/(c)/(f): every `edit.*` is mutating + `edit`-group +
  default-off; editing is never a `code`-group op; `MUTATING_METHODS` is
  renderer-graph-only), §5.5 Seams 1–5 (a main-handled `edit` tool's ACTUAL seam
  set — `MUTATING_METHODS`/the renderer switch are the NEGATIVE contract).
- **Decisions:** `docs/decisions.md` rows **DOC-DIRECTORY-CATEGORY-GATE**,
  **RAG-EDIT-MCP-GROUPS**, **BATCH-ATOMICITY-API**, **MCP-UI-EQUIVALENCE**,
  **IPC-SURFACE-NOT-GROUP-GATED**, **SINGLE-WRITER-STORE**,
  **RAG-AUTHORITATIVE**.
- **Parked / not this spec:** `docs/pending.md` (the path RENAME — path is
  immutable in v1; the Gnosis mapping — Q6; ui-overhaul G2 — the doc-nav tree
  UI/tags editor).
- **Host patterns:** `src/main/edit-ops.ts` (`EditOpContext`, the `Set*Result`
  types, `setProps`/`setSubtree`/`setType`, the U-D7 amendment sites),
  `src/main/security.ts:3,47-56,191` (`ToolGroup`, `TOOL_GROUPS`,
  `VALID_GROUPS`), `src/main/mcp-server.ts:1324-1444` (`handleEditTool`),
  `:1718-1794` (`ALL_TOOLS`), `:2150-2238` (the SDK `graph`),
  `src/main/rag-store.ts:280` (`edgesTo`), `:414-416` (`normalizeTags`),
  `:1050-1051` (the U-D2 classification), `src/shared/types.ts:262-310`
  (`RpcMethod`), `src/renderer/renderer.ts:18` (`MUTATING_METHODS`).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set from §5.6/§5.7 BEFORE any implementation,
into `tests/unit-ud7-set-doc-meta-op.test.ts`:

- **`src/main/edit-ops.ts` (the op):** §5.6 states 1, 5–12, 15 + §5.7 states
  1–9, 14 — the signature/result type, the tags write + normalization, `[]`
  clears, path preservation, caps (inclusive/exclusive), atomicity, journal
  inversion, `BatchOp` unchanged, and every validation fail message.
- **`src/main/security.ts` (seam 1):** §5.6 states 2–4 + §5.7 state 13 —
  `groupForTool` resolves `'edit'`; default-off; `gnosis-edit` insufficient;
  `ToolGroup`/`VALID_GROUPS` unchanged.
- **`src/main/mcp-server.ts` (`ALL_TOOLS` + zod + `handleEditTool`):** §5.6
  states 2, 5, 13, 14 + §5.7 states 10–12, 15 — the `ALL_TOOLS` row, the zod
  row (no path field), the broadcast, store resolution, the `nodeId required`
  throw, and the raw-tags pass-through.
- **`src/shared/types.ts` (`RpcMethod`):** §5.6 state 2 — the union accepts
  `'edit.set_doc_meta'` (type-level, caught by `npm run typecheck`).
- **Sanctioned existing-test ripple:** FOUR tests pin `ALL_TOOLS` at 56 and
  ALL are updated 56 → 57 in the same pass — a sanctioned census ripple, not a
  behavior change:
  `tests/unit-ud6-query-document-filters.test.ts:492`,
  `tests/unit-h8-operator-editor.test.ts:1271`,
  `tests/blind-unit-ud6-query-document-filters-greens.test.ts:537`, and
  `tests/unit-h2-runtime-controller.test.ts:1384` (each with
  its title/comment). No test pins the `RpcMethod` member count or the edit-op
  count at a fixed number.
- **Post-green gates (per AGENTS.md):** the adversarial pass (§3a) records its
  findings in this spec; the blind-greens writer produces a scenario artifact
  from this spec + `docs/specs/unit-ud7-set-doc-meta-op-greens.md` (created with
  the greens); the documentation review reconciles this spec, the trackers, and
  the census updates (10 → 11, 56 → 57, `edit` rows 7 → 8).
