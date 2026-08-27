# Spec — Unit A: RAG Store (Persistence)

- **Status:** SPEC (first-milestone Unit A). Gate reference:
  `docs/specs/astrographer-review.md` §9.2.6 (SINGLE-WRITER-STORE), §9.2.1
  (PROJECT-JOURNAL), §9.3(b) (invertible structural journal entries), §10
  (SUBTREE-OWNERSHIP), §11 (markdown export-only). Decisions:
  `docs/decisions.md` rows **SINGLE-WRITER-STORE**, **PROJECT-JOURNAL**,
  **SUBTREE-OWNERSHIP**, **RAG-AUTHORITATIVE**.
- **Scope:** the main-process `createRagStore` persistence module — RAG
  node/edge CRUD, the single-writer write queue (the lock point), the project
  journal with invertible entries, and the subtree-ownership convention on the
  RAG node/edge types. This unit does NOT implement the document model
  semantics (Unit B), the traversal/render spine (Unit C), or any MCP tool
  (Unit B gating). It defines the persisted shapes those units build on.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/rag-store.ts` from
  §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

A main-process RAG store that is the **authoritative persistent knowledge
graph** (RAG nodes + edges), mirroring the foundation's `createModuleStore`
pattern (`src/main/module-store.ts`). It must:

1. Persist RAG nodes and edges via `node:fs` with the module-store discipline:
   **atomic write** (temp + rename), **fail-disabled boot** (a corrupt/missing
   file boots to an empty store + a `corrupt` flag, never throws, never
   hard-fails the app), and **hash-verified source** (each record stores a
   SHA-256 hash always derived from its source at write time, re-verified on
   boot; a mismatch quarantines the record).
2. Serialize all writes through a **single-writer write queue** — the lock
   point. The main process owns all writes; MCP `edit`-group tool handlers and
   the renderer's commit-on-blur IPC both call the same main-process store
   methods. No renderer-side writes to the RAG store.
3. Maintain a **project journal** with **invertible entries** for both content
   and structural ops. Undoing a structural edit re-traverses (the materialized
   graph is rebuilt). Undo/redo lives HERE, not in the engine Supervisor
   journal (which dies on rebuild).
4. Carry the **SUBTREE-OWNERSHIP convention** on the RAG node/edge types: a
   RAG object declares the provident node ids it owns (the subtree boundary).

## 2. Feasibility verdict

**Feasible — grounded in the foundation's `createModuleStore`.** The
`src/main/module-store.ts` module (read at
`/media/ryanr/Shared Files1/Projects/Provident-Electron/src/main/module-store.ts`)
is the exact persistence pattern to mirror: `readFileSync`/`writeFileSync`/
`mkdirSync`/`existsSync`/`renameSync` from `node:fs`, `dirname` from
`node:path`, `createHash('sha256')` from `node:crypto`, a `load()` that
sanitizes + hash-verifies + quarantines, a `persist()` that does the atomic
temp+rename write, and a factory `createModuleStore(opts)` returning a
store object. The RAG store extends this with:

- **Two record kinds** (nodes + edges) instead of one module record.
- A **single-writer queue** (a promise-chain mutex) — the module store is
  synchronous, but the RAG store's writes may trigger a re-traversal (Unit C),
  so writes are serialized through an async queue.
- A **project journal** (persisted, invertible) — the module store has no
  journal; this is net-new host-side work, but it composes the same
  `node:fs` atomic-write discipline.

No engine/foundation gap blocks this unit. The RAG store is **project-specific**
(per `docs/decisions.md` ENGINE-GAP-HANDOFF: the RAG layer is not a foundation
feature). No handoff item is opened by this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| Single-writer async queue | Project-specific (composes a promise chain; no engine primitive) | Low cost; the lock point for MCP↔UI equivalence (SINGLE-WRITER-STORE). |
| Project journal with invertible structural entries | Project-specific (the engine Supervisor journal dies on rebuild — §9.2.1) | Medium cost; the only correct undo/redo home given RAG-AUTHORITATIVE. |
| Subtree-ownership declaration on RAG types | Project-specific (the envelope cannot express the boundary — §10.2 Q2) | Low cost; a `ownedNodeIds` field on the RAG node type. |
| Hash-verified source + quarantine | Mirrors the module-store pattern (foundation) | Low cost; reuses the proven fail-disabled discipline. |
| Persisted journal (survives restart) | Project-specific | Medium cost; undo/redo across restarts is a design choice — see §5.6. |

No engine gap. The one known engine gap (ENG-GAP-1, MarkdownAdapter
`data-node-id` D7) is unrelated to persistence and stays a non-blocking
handoff item.

## 4. Design decisions pinned by this spec

- **RAG-AUTHORITATIVE:** the RAG store is the persistent source of truth; the
  provident graph is a transient render materialization (Unit C). The store
  holds no graph state not derivable from RAG nodes/edges.
- **SINGLE-WRITER-STORE:** every mutation to the RAG store routes through the
  single-writer queue. Read methods are synchronous and lock-free.
- **PROJECT-JOURNAL:** undo/redo lives in the store's journal, not the engine
  Supervisor journal.
- **SUBTREE-OWNERSHIP:** a RAG node declares the provident node ids it owns
  (`ownedNodeIds`). The runtime back-reference map (Unit C) is the SOLE
  authoritative carrier; the persisted field is the last-traversal snapshot.

## 5. The exhaustive contract

### 5.1 RAG node/edge types (persisted shapes)

These are the persisted record shapes. Unit B refines their *semantics*
(doc-flow validation, doc-head marker prop); Unit C refines the *traversal*
(how `ownedNodeIds` is populated). The shapes below are the store's contract.

```ts
// src/main/rag-store.ts (project-specific; NOT in shared/types.ts — the store
// is main-process only; MCP/UI reach it via IPC, not by importing the type).

/** The RAG node element type — the provident element type the subtree root
 *  renders as (resolution 9: RAG text → content; formatting → element type).
 *  Closed union for the first slice. */
export type RagNodeType =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'ul' | 'ol' | 'li' | 'blockquote' | 'pre' | 'code'
  | 'strong' | 'em' | 'a' | 'img'

/** A RAG node — one knowledge-graph object. OWNS a subtree of provident
 *  nodes (SUBTREE-OWNERSHIP). */
export interface RagNode {
  /** Stable RAG node id. NEVER the provident minted node id (which re-mints
   *  per traversal — §9.2.1 finding 4). Minted by the store on create. */
  id: string
  type: RagNodeType
  /** The text content of the subtree root. The RAG object's chunk = the
   *  markdown of its whole subtree (one embedding — §10.1). */
  content: string
  /** Arbitrary props. The doc-head marker prop (a convention, Unit B) lives
   *  here. */
  props?: Record<string, unknown>
  /** SUBTREE-OWNERSHIP declaration: the provident node ids this RAG object
   *  owns. Populated/updated by the traversal (Unit C). The runtime
   *  back-reference map is authoritative; this is the last-traversal snapshot. */
  ownedNodeIds: string[]
  createdAt: string   // ISO-8601
  updatedAt: string   // ISO-8601
}

/** The RAG edge kinds. Doc-flow kinds (doc-head/next-section/doc-end) are
 *  authoritative in the store (Unit B validates them at traversal). The
 *  `doc-child` kind expresses HIERARCHICAL NESTING (a nested semantic unit —
 *  e.g. a paragraph-length `li` inside a `ul` — is its own RAG object, a
 *  doc-child of the containing RAG object). */
export type RagEdgeKind =
  | 'parent-child'   // a RAG node's family parent (multi-parent allowed)
  | 'doc-head'       // source is the head of target's document
  | 'next-section'   // source's next section in document order is target
  | 'doc-end'        // source is the end of target's document
  | 'doc-child'      // target's subtree is nested WITHIN source's subtree at `order`
  // 'crosslink' is a LATER unit (Unit G) — not in the first slice.

/** A RAG edge — a directed relationship between two RAG nodes. */
export interface RagEdge {
  id: string
  kind: RagEdgeKind
  source: string   // RAG node id
  target: string   // RAG node id
  /** For `doc-child` edges only: the position of the child's subtree within
   *  the parent's subtree (relative to the parent's owned nodes and other
   *  doc-children). Absent for the other kinds. */
  order?: number
  /** The documents that OWN/USE this edge (document root node ids). An edge can
   *  have MULTIPLE document owners — a shared reference/content edge (e.g. the
   *  A→D edge carrying the shared explanation of D's use in function A) is used
   *  by both document B and document C, so it lists both (CROSS-DOCUMENT-SHARED,
   *  review §13). A `next-section` edge's TARGET (the next section) differs per
   *  document, so those are separate edges each with ONE owner. Absent for
   *  `parent-child`/`doc-child`. */
  documentIds?: string[]
  createdAt: string
  updatedAt: string
}
```

**Shape rules (enforced by the store, mirroring `sanitizeRecord`):**

- `RagNode.id` — non-empty string. `RagNode.type` — one of the closed
  `RagNodeType` union. `RagNode.content` — string (may be empty). `props` —
  object or absent. `ownedNodeIds` — string array (may be empty). `createdAt`/
  `updatedAt` — ISO-8601 strings.
- `RagEdge.id` — non-empty string. `kind` — one of the closed `RagEdgeKind`
  union. `source`/`target` — non-empty strings (RAG node ids). `createdAt`/
  `updatedAt` — ISO-8601 strings.
- A record that fails a shape rule is **rejected at write time** (throw) and
  **skipped at boot** (never loaded) — the module-store `sanitizeRecord`
  discipline.

### 5.2 The persisted file format

The store persists to a single JSON file at `opts.path` (usually in
`userData`). The file shape:

```ts
interface RagStoreFile {
  version: 1
  nodes: RagNode[]
  edges: RagEdge[]
  /** The project journal (persisted — see §5.6). */
  journal: JournalEntry[]
  /** The undo/redo cursor (index into `journal`). */
  cursor: number
}
```

- `version: 1` — a future schema bump is a separate migration concern (not in
  this slice). A file with a non-`1` version is treated as **corrupt**
  (fail-disabled boot).
- The file is written atomically (temp + rename) on every mutation.

### 5.3 `createRagStore` factory + options

```ts
export interface RagStoreOptions {
  /** The JSON file the RAG store persists to (usually in userData). */
  path: string
}

export function createRagStore(opts: RagStoreOptions): RagStore
```

- **Throws:** `createRagStore` throws `Error('rag store: path required')` if
  `opts` is null/undefined or `opts.path` is not a non-empty string. It does
  NOT throw on a corrupt/missing file (fail-disabled boot — §5.7).
- **Return:** a `RagStore` object (§5.4).

### 5.4 The `RagStore` interface

```ts
export interface RagStoreStatus {
  /** The store file was corrupt/missing → NO nodes/edges loaded (fail-disabled). */
  corrupt: boolean
  /** Node/edge ids quarantined on this boot (hash verification failed). */
  quarantined: string[]
  /** Node ids active (not quarantined). */
  loadedNodes: string[]
  /** Edge ids active (not quarantined). */
  loadedEdges: string[]
}

export interface RagStore {
  // ---- node CRUD ---------------------------------------------------------
  getNode(id: string): RagNode | undefined
  listNodes(): RagNode[]
  /** Create/update a node. Computes the hash from the record (never trusts
   *  input). Serialized through the write queue. */
  putNode(node: RagNode): RagNode
  /** Remove a node. Returns true if it existed. Serialized. Also removes any
   *  edge whose source/target references the removed node (cascade). */
  removeNode(id: string): boolean

  // ---- edge CRUD ---------------------------------------------------------
  getEdge(id: string): RagEdge | undefined
  listEdges(): RagEdge[]
  /** Create/update an edge. Serialized. */
  putEdge(edge: RagEdge): RagEdge
  /** Remove an edge. Returns true if it existed. Serialized. */
  removeEdge(id: string): boolean

  // ---- status ------------------------------------------------------------
  status(): RagStoreStatus

  // ---- project journal ---------------------------------------------------
  /** The journal entries (read-only snapshot). */
  journal(): JournalEntry[]
  /** Undo the top journal entry (invert it). A structural undo re-traverses
   *  (Unit C). Returns the inverted entry, or null at the base boundary. */
  undo(): JournalEntry | null
  /** Redo the next undone entry. Returns the re-applied entry, or null at the
   *  redo boundary. */
  redo(): JournalEntry | null
  /** The number of undoable entries. */
  undoDepth(): number
  /** The number of redoable entries. */
  redoDepth(): number

  // ---- single-writer queue ----------------------------------------------
  /** Serialize a write through the queue. All mutating methods use this
   *  internally; exposed for a caller that must run a multi-step write
   *  atomically (e.g. a structural edit that touches several nodes/edges). */
  enqueue<T>(fn: () => T | Promise<T>): Promise<T>
}
```

**Return-shape rules:**

- `getNode`/`getEdge` return a **shallow copy** (never the internal record —
  the module-store `get` discipline). `listNodes`/`listEdges` return fresh
  arrays of shallow copies.
- `putNode`/`putEdge` return a shallow copy of the stored record.
- `removeNode`/`removeEdge` return `true` if the id existed and was removed,
  `false` if it did not exist (no-op).
- `status()` returns a fresh `RagStoreStatus`.
- `journal()` returns a fresh array of shallow copies of the journal entries.
- `undo()`/`redo()` return the inverted/re-applied entry, or `null` at the
  boundary.

### 5.5 The single-writer write queue (the lock point)

- **Purpose:** serialize all writes to the RAG store. The main process owns all
  writes; MCP `edit`-group handlers and the renderer's commit-on-blur IPC both
  call the same store methods. No write happens outside the queue.
- **Mechanism:** a promise chain (a mutex). `enqueue(fn)` appends `fn` to the
  tail of the chain; each `fn` runs only after the previous one settles.
- **FIFO:** writes run in the order enqueued.
- **Failure isolation:** a write that throws does NOT block subsequent writes —
  the chain continues with the next enqueued write. The rejection propagates to
  the caller of the failed `enqueue`.
- **Reads are lock-free:** `getNode`/`listNodes`/`getEdge`/`listEdges`/
  `status()`/`journal()`/`undoDepth()`/`redoDepth()` are synchronous and do NOT
  go through the queue (they read the in-memory store, which is only mutated
  inside the queue).
- **Mutating methods are queue-serialized:** `putNode`, `removeNode`,
  `putEdge`, `removeEdge`, `undo`, `redo` each enqueue their work. They return
  synchronously-shaped results but the actual mutation is queued; the store
  exposes the synchronous return for the common single-write case and
  `enqueue` for atomic multi-step writes. (Implementation note: the mutating
  methods may be async or may enqueue-and-return; the spec pins the *ordering*
  guarantee — all mutations are serialized — and the *return* shapes above.)
- **The queue is the concurrency model for MCP↔UI equivalence** (§9.2.6): two
  concurrent writers (an MCP `edit` call and a UI commit-on-blur) are
  serialized; neither observes a half-applied write.

### 5.6 The project journal (invertible entries)

The journal records **invertible** entries for both content and structural ops.
Undoing a structural edit re-traverses (the materialized graph is rebuilt —
Unit C). The journal is **persisted** in the store file (§5.2) so undo/redo
survives a restart.

```ts
export type JournalEntry =
  | {
      kind: 'content'
      nodeId: string
      /** The node's content+props before the edit (invertible by restore). */
      before: { content: string; props?: Record<string, unknown> }
      after: { content: string; props?: Record<string, unknown> }
      at: string
    }
  | {
      kind: 'structural'
      op: StructuralJournalOp
      at: string
    }

export type StructuralJournalOp =
  | { op: 'node-add'; node: RagNode }
  | { op: 'node-delete'; node: RagNode }
  | { op: 'edge-add'; edge: RagEdge }
  | { op: 'edge-remove'; edge: RagEdge }
  | { op: 'edge-retarget'; edgeId: string; before: { source: string; target: string }; after: { source: string; target: string } }
  | { op: 'doc-flow-role-change'; edgeId: string; before: RagEdgeKind; after: RagEdgeKind }
```

**Inversion rules:**

- **Content entry:** `undo()` restores the node's `content`/`props` to
  `before`. `redo()` re-applies `after`. No re-traversal (a content edit is
  maintained in-place — §9.2.1).
- **Structural entry:** `undo()` applies the inverse op to the store, then
  triggers a **re-traversal** (Unit C rebuild). `redo()` re-applies the forward
  op, then re-traverses. The inverse ops:
  - `node-add` → `node-delete` (remove the node + cascade its edges).
  - `node-delete` → `node-add` (re-insert the node + its edges).
  - `edge-add` → `edge-remove`.
  - `edge-remove` → `edge-add`.
  - `edge-retarget` → restore `before` source/target.
  - `doc-flow-role-change` → restore `before` kind.
- **Boundary:** `undo()` at the base (cursor at 0) returns `null` (no-op).
  `redo()` at the redo boundary (cursor at journal length) returns `null`.
- **Journal cap:** the journal is bounded (a `maxJournalLength` option,
  defaulting to a project constant — see §5.10). When the journal exceeds the
  cap, the oldest entries are condensed into a base snapshot (the module-store
  condense discipline). A condensed base is a boundary: `undo()` past the base
  is a guarded no-op (`null`).

### 5.7 Persistence details (module-store pattern)

- **Atomic write:** every mutation persists via temp + rename:
  `writeFileSync(tmp, JSON.stringify(payload, null, 2))` then
  `renameSync(tmp, opts.path)`, where `tmp = `${opts.path}.tmp``. A crash
  mid-write never leaves a truncated/partial store file (data loss).
- **Fail-disabled boot:** `createRagStore` reads the file at `opts.path`. If
  the file is missing, the store boots empty with `corrupt: false`. If the file
  exists but fails `JSON.parse`, or is not an object, or has a non-`1`
  `version`, the store boots empty with `corrupt: true` — **never throws,
  never hard-fails the app**. A corrupt store does NOT silently boot a partial
  registry (unlike the security store, which defaults on corrupt).
- **Hash-verified source:** each node/edge record stores a SHA-256 `hash`
  derived from its serialized source. The hash is ALWAYS derived at write time
  (never trusted from the caller). On boot, every record is re-verified: a
  record whose stored hash does not match its derived source hash is kept in
  the store but marked **quarantined** and EXCLUDED from `status().loadedNodes`/
  `loadedEdges` (never reported active). An operator recovery action (re-put/
  clear) is the clear path, surfaced via `status().quarantined`.
- **Persist failure is non-fatal:** a `persist()` failure (e.g. disk full) is
  caught and does not crash the process; the in-memory store still reflects the
  write, but the on-disk state may be stale. (The module-store `persist()`
  catch discipline.)

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **Fresh boot (missing file):** `createRagStore({ path: '/nonexistent.json' })`
   → `status()` = `{ corrupt: false, quarantined: [], loadedNodes: [], loadedEdges: [] }`.
2. **Node create:** `putNode({ id: 'n1', type: 'p', content: 'hello', ownedNodeIds: [], createdAt, updatedAt })`
   → returns the stored node; `getNode('n1')` returns it; `listNodes()` has 1
   entry; the file is written atomically.
3. **Node update:** `putNode` with the same `id` and new `content` → the node is
   replaced; `updatedAt` is refreshed; a `content` journal entry is recorded.
4. **Edge create:** `putEdge({ id: 'e1', kind: 'parent-child', source: 'n1', target: 'n2', ... })`
   → `getEdge('e1')` returns it; `listEdges()` has 1 entry.
5. **Node remove cascade:** `removeNode('n1')` where `e1` references `n1` →
   returns `true`; `getNode('n1')` is `undefined`; `getEdge('e1')` is
   `undefined` (cascade).
6. **Edge remove:** `removeEdge('e1')` → returns `true`; `getEdge('e1')` is
   `undefined`.
7. **Queue serialization:** two concurrent `enqueue` writes → both run, in FIFO
   order; the second observes the first's effect.
8. **Content undo:** after a content edit, `undo()` restores the prior
   `content`/`props`; `redo()` re-applies.
9. **Structural undo:** after a `node-add`, `undo()` removes the node (inverse)
   and signals a re-traversal; `redo()` re-adds it.
10. **Boot with a valid file:** a well-formed `RagStoreFile` (version 1, valid
    records, matching hashes) → `status()` reports all nodes/edges loaded, none
    quarantined.
11. **Boot with a quarantined record:** a record whose stored hash mismatches
    its source → `status().quarantined` includes it; it is NOT in
    `loadedNodes`/`loadedEdges`.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`createRagStore` with null/undefined opts or empty path** → throws
   `Error('rag store: path required')`.
2. **Corrupt file boot:** a file that fails `JSON.parse`, or is not an object,
   or has a non-`1` version → boots empty, `status().corrupt === true`, never
   throws.
3. **`putNode` with a malformed record** (null, non-object, empty `id`, invalid
   `type`, non-string `content`, non-array `ownedNodeIds`) → throws
   `Error('rag putNode: <field> required/invalid')`; the store is unchanged.
4. **`putEdge` with a malformed record** (null, non-object, empty `id`, invalid
   `kind`, empty `source`/`target`) → throws; the store is unchanged.
5. **`putEdge` referencing a nonexistent node** → throws
   `Error('rag putEdge: source/target node not found')`; the store is unchanged.
   (Referential integrity: an edge must reference existing nodes.)
6. **`removeNode` of a nonexistent id** → returns `false` (no-op, no throw).
7. **`removeEdge` of a nonexistent id** → returns `false` (no-op, no throw).
8. **`undo()` at the base boundary** → returns `null` (no-op, no throw).
9. **`redo()` at the redo boundary** → returns `null` (no-op, no throw).
10. **A write that throws inside the queue** → the rejection propagates to the
    caller; the NEXT enqueued write still runs (failure isolation).
11. **Persist failure** (e.g. disk full) → caught, no crash; the in-memory store
    reflects the write; the on-disk state may be stale (documented, not
    surfaced as a throw).

### 5.10 Census / numeric claims

- **Hash:** SHA-256 (`createHash('sha256')`), hex-encoded, always derived from
  the record's serialized source at write time.
- **Atomic write:** temp file `${opts.path}.tmp` + `renameSync`; JSON written
  with 2-space indent.
- **Journal cap:** `maxJournalLength` option; default **1000** entries. When
  exceeded, the oldest entries condense into a base snapshot (a boundary for
  `undo()`).
- **File version:** `version: 1`. A non-`1` version is corrupt.
- **Record counts:** `status().loadedNodes`/`loadedEdges` count active
  (non-quarantined) records; `status().quarantined` counts hash-failed records.

### 5.11 Cross-references

- Foundation pattern: `src/main/module-store.ts` (the `createModuleStore`
  shape this mirrors).
- Gate: `docs/specs/astrographer-review.md` §9.2.6 (SINGLE-WRITER-STORE),
  §9.2.1 (PROJECT-JOURNAL), §9.3(b) (invertible structural entries), §10
  (SUBTREE-OWNERSHIP).
- Decisions: `docs/decisions.md` rows **SINGLE-WRITER-STORE**,
  **PROJECT-JOURNAL**, **SUBTREE-OWNERSHIP**, **RAG-AUTHORITATIVE**.
- Downstream: Unit B (`docs/specs/unit-b-document-model.md`) refines the
  node/edge semantics (doc-flow validation, doc-head marker prop); Unit C
  (`docs/specs/unit-c-rendering-spine.md`) consumes the store to build the
  envelope + back-reference map and populates `ownedNodeIds`.
- Engine invariants referenced: `node.md` §1.2 SI-1 (single-parent), §7.1
  FS-10 (`placement-target-blocked`), P3 §2.4 (contentNodes family-'in-tree'
  ≠ compiled viability); `payload.md` P-4/P-5 (registered content persists
  unplaced). These constrain Unit C, not the store itself.
