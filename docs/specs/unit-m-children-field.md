# Spec — Unit M: The `children` Field on `RagNode` (Inline Rich-Text Data Model)

- **Status:** SPEC (the data-model foundation for the rich-text contenteditable
  machinery — the first of the RICH-TEXT-EDITING-GATE must-fix items to land).
  Gate reference: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the
  resolved design: inline `strong`/`em`/`a`/`img` are held by a NEW `children`
  field on `RagNode`, NOT separate RAG nodes — preserves one-chunk-per-subtree;
  `span` is NOT added to `RagNodeType` — it is a diff-matching artifact folded
  into the parent's `content`). This unit is the **store-format `children`
  additive + hash-source** must-fix item. It does NOT implement the rich-text
  editing ops (Unit O), the traversal disambiguation of inline vs doc-children
  (a later slice), the retrieval indexing of inline `children` text (a later
  slice), batch atomicity (a later slice), or paste-time sanitization (a later
  slice).
- **Scope:** the additive `children?: RagNodeChild[]` field on the `RagNode`
  interface in `src/main/rag-store.ts`, the `RagNodeChild` inline-child type,
  the `nodeSource`/`nodeHash` hash-source coverage of `children`, the
  store-format additive load (existing records without `children` still load and
  hash-verify), and the write-time shape validation of `children`. This unit
  does NOT add `span` to `RagNodeType` (the union is UNCHANGED), does NOT add an
  edit op (the census 6→9 is Unit O), and does NOT change the traversal or the
  renderer. It is the persistence-layer contract the rich-text machinery builds
  on.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the amended
  `src/main/rag-store.ts` (the `RagNode` interface + the `RagNodeChild` type +
  `nodeSource` + `validateNodeShape` + the journal content-entry snapshot +
  the internal copy paths) from §5.6/§5.7 before any implementation.

---

## 1. What the proposal asks

The rich-text contenteditable machinery (the RICH-TEXT-EDITING-GATE resolved
design) needs a place to hold inline formatting (`strong`/`em`/`a`/`img`) on a
RAG node WITHOUT creating separate RAG nodes (which would break
one-chunk-per-subtree). The resolved design pins a NEW `children` field on
`RagNode`. This unit lands that field as an ADDITIVE, backward-compatible
persistence-layer change:

1. **A new optional `children?: RagNodeChild[]` field on `RagNode`**, holding the
   inline children (`strong`/`em`/`a`/`img`, each with `content` + optional
   `props`). It is ADDITIVE — existing nodes without `children` still load and
   hash-verify.
2. **`nodeSource` includes `children`** in the fixed field order, so the SHA-256
   hash covers the inline children. A node whose `children` changes gets a new
   hash.
3. **The JSON store format is additive**: existing records without `children`
   load unchanged; a record with `children` round-trips (write → persist → boot
   → read).
4. **Write-time shape validation** accepts a valid `children` array and rejects
   a malformed one (non-array, wrong child type, missing/non-string content).
5. **`RagNodeType` is UNCHANGED** — `span` is NOT added (a diff-matching
   artifact folded into the parent's `content`). The edit-op census 6→9 is Unit
   O, NOT this unit.

## 2. Feasibility verdict

**Feasible — a purely additive, backward-compatible change to the already-landed
`src/main/rag-store.ts` (Unit A).** The store already has the exact machinery
this needs:

- **The `RagNode` interface** (§5.1) already carries an optional `props?` field
  with the same deep-copy + dangerous-key discipline. `children` follows the
  same pattern (optional, deep-copied on write/read, dangerous keys rejected).
- **`nodeSource`** (§5.1) already serializes a fixed field order for hash
  reproducibility. Adding `children` to that order is a one-line change; the
  boot re-verification (`load`) already re-derives the hash from `nodeSource`,
  so a node whose `children` changed (or whose stored hash was computed without
  `children`) is automatically quarantined on mismatch.
- **`validateNodeShape`** (§5.1) already returns `{ ok: false, field }` for
  malformed records and is used at BOTH write time (throw) and boot (skip). A
  `children` validation branch slots into the same function.
- **The additive load** is free: `children` is optional, so a record without it
  passes validation unchanged; a record with it passes once the branch exists.

No engine/foundation gap blocks this unit. The `children` field is
**project-specific** (the RAG data model is host-side, per
`docs/decisions.md` ENGINE-GAP-HANDOFF). No handoff item is opened by this
unit. The `provident-editable@0.1.0` package (the rich-text converter/diff) is
consumed by Unit O, NOT this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `children?: RagNodeChild[]` field on `RagNode` | Project-specific (the RAG data model) | Low cost; the persistence home for inline rich-text formatting (one-chunk-per-subtree preserved). |
| The `RagNodeChild` inline-child type (`strong`/`em`/`a`/`img`) | Project-specific | Low cost; the closed inline-child union the rich-text machinery writes. |
| `nodeSource` coverage of `children` (fixed field order) | Project-specific | Low cost; the SHA-256 hash covers the inline children (a `children` change → a new hash). |
| Store-format additive load (existing records without `children` still load) | Project-specific | Low cost; backward compatibility — no migration, no re-hash of existing records. |
| Write-time `children` shape validation | Project-specific | Low cost; a malformed `children` array is rejected at write (throw) and skipped at boot. |
| The journal content-entry snapshot gains optional `children` | Project-specific | Low cost; a content edit that changes `children` is invertible (undo/redo correct). |

No engine gap. The rich-text editing ops (Unit O), the traversal disambiguation
of inline vs doc-children, the retrieval indexing of inline `children` text,
batch atomicity, and paste-time sanitization are LATER slices (the remaining
RICH-TEXT-EDITING-GATE must-fix items) — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — a node whose `children` changed but whose stored hash was NOT
  recomputed is QUARANTINED at boot** (the hash-verified source discipline —
  §5.2/§5.3). The adversarial pass must confirm a tampered `children` array
  (changed without a hash update) lands in `status().quarantined`, exactly like
  a tampered `content`/`props`.
- **A2 — a malformed `children` array is REJECTED at write time (throw) and
  SKIPPED at boot (never loaded)** — the same discipline as every other node
  field (§5.4). The adversarial pass must confirm a persisted node with a
  malformed `children` array does NOT load.
- **A3 — `children` is deep-copied on BOTH write and read** (no aliasing; a
  caller cannot mutate the store through a returned record) — the same
  discipline as `props` (§5.1). The adversarial pass must confirm mutating a
  returned node's `children` does not change the store.
- **A4 — dangerous keys (`__proto__`/`constructor`/`prototype`) in a child's
  `props` are REJECTED** (§5.4) — the same prototype-pollution guard as the
  node's own `props`.
- **A5 — `span` is NOT added to `RagNodeType`** (§5.1/§5.8). A `span` child
  type is REJECTED by validation. The adversarial pass must confirm a `span`
  child does not validate.

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

**Adversarial pass (2026-08-28, Unit M):** all findings are HOST findings,
fixed + regression-tested in the same pass:

- **F1 (MEDIUM) — `isContentSnapshot` did not apply the prototype-pollution
  guard to `props`.** A journal `content` entry with a dangerous-key `props`
  was accepted at boot. Fixed: `isContentSnapshot` now rejects a snapshot whose
  `props` carries a dangerous key (consistent with `validateNodeShape` at write).
- **F2 (LOW) — `isRagNode` (journal structural-op validator) was weaker than
  `validateNodeShape`.** A structural entry with `type: 'span'`/`'bogus'`, a
  dangerous-key `props`, or non-string `ownedNodeIds` was accepted at boot.
  Fixed: `isRagNode` now mirrors `validateNodeShape` (type in `RAG_NODE_TYPES`,
  non-empty `id`, `props` object + dangerous-key guard, `ownedNodeIds` all
  non-empty strings).
- **F3 (LOW) — the new `hasDangerousKey` prototype check caused false-positive
  rejection of non-plain objects (Date, class instances).** Fixed: the check is
  scoped to actual `__proto__` pollution — only a PLAIN-object prototype that is
  not `Object.prototype` (its constructor is `Object`) is flagged; a legitimate
  non-plain object (Date, class instance) is not.
- **F4 (LOW) — a dangerous key on the child ITSELF (not in its `props`) was
  silently stripped by `deepCopy` rather than rejected.** Fixed:
  `validateNodeShape` now rejects a child carrying a dangerous key.
- **F5 (INFORMATIONAL) — `__proto__` with a primitive/null value bypasses
  `hasDangerousKey`.** No fix required — these cases cannot pollute (no own key,
  no prototype change to a polluting object) and `deepCopy` sanitizes.

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** for the rich-text editing proposal
(`docs/decisions.md` row **RICH-TEXT-EDITING-GATE**, 2026-08-28). The
consolidated verdicts:

| Review | Verdict |
| --- | --- |
| Validity | VALID-WITH-AMENDMENTS |
| Critique | UNSOUND (as written) |
| Architecture | SOUND-WITH-AMENDMENTS |
| Change-analysis | PROCEED-WITH-AMENDMENTS |

The resolved design amendments that THIS unit pins (each cross-referenced to the
section that resolves it):

- **M1 — inline `strong`/`em`/`a`/`img` are held by a NEW `children` field on
  `RagNode`, NOT separate RAG nodes** (§5.1): preserves one-chunk-per-subtree.
- **M2 — `span` is NOT added to `RagNodeType`** (§5.1/§5.8): it is a
  diff-matching artifact folded into the parent's `content`. The union is
  UNCHANGED.
- **M3 — the store-format `children` additive + hash-source must-fix** (§5.2/
  §5.3): `nodeSource` covers `children`; existing records without `children`
  still load and hash-verify.
- **M4 — the edit-op census 6→9 is Unit O, NOT this unit** (§5.8): this unit
  adds no edit op.

## 4. Design decisions pinned by this spec

- **RICH-TEXT-EDITING-GATE (consumed):** the resolved design pins inline
  `strong`/`em`/`a`/`img` on a NEW `children` field on `RagNode` (not separate
  RAG nodes — preserves one-chunk-per-subtree); `span` is NOT added to
  `RagNodeType` (a diff-matching artifact folded into the parent's `content`).
  This unit lands the store-format `children` additive + hash-source must-fix.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth. The `children` field is persisted on the RAG node; the provident graph
  is a transient render materialization.
- **SUBTREE-OWNERSHIP (consumed):** a RAG node owns a subtree. The inline
  `children` are NOT separate RAG nodes and are NOT part of `ownedNodeIds` —
  they are inline content held on the owning node itself (one-chunk-per-subtree
  preserved).
- **SINGLE-WRITER-STORE (consumed):** a `children` change is a node write
  routed through the single-writer queue (via `putNode`), like any content
  change.
- **HASH-VERIFIED-SOURCE (consumed, Unit A §5.7):** the SHA-256 hash is always
  derived from the record's serialized source at write time and re-verified at
  boot. `nodeSource` now includes `children`, so a `children` change → a new
  hash.

## 5. The exhaustive contract

### 5.1 The `children` field + the `RagNodeChild` type

The `RagNode` interface in `src/main/rag-store.ts` gains a NEW optional
`children` field. The `RagNodeType` union is UNCHANGED (no `span`).

**The amended `RagNode` interface (pinned):**

```ts
// src/main/rag-store.ts — the amended RagNode. The `children` field is NEW
// and OPTIONAL (ADDITIVE — existing nodes without it still load and hash-verify).
export interface RagNode {
  id: string
  type: RagNodeType
  content: string
  /** The inline rich-text children (strong/em/a/img) held ON this node — NOT
   *  separate RAG nodes (one-chunk-per-subtree preserved). OPTIONAL and
   *  ADDITIVE: a node without `children` is a plain-text node (the v1 default).
   *  `span` is NOT a child type — it is a diff-matching artifact folded into
   *  the parent's `content`. */
  children?: RagNodeChild[]
  props?: Record<string, unknown>
  ownedNodeIds: string[]
  createdAt: string
  updatedAt: string
}
```

**The new `RagNodeChild` type (pinned):**

```ts
/** The inline rich-text child type — the closed union of inline formatting
 *  elements held on a RAG node's `children`. `span` is NOT here (a diff-matching
 *  artifact folded into the parent's `content`). */
export type RagNodeChildType = 'strong' | 'em' | 'a' | 'img'

/** An inline rich-text child of a RAG node. Held on the owning node's
 *  `children` field — NOT a separate RAG node, NOT part of `ownedNodeIds`. */
export interface RagNodeChild {
  type: RagNodeChildType
  /** The inline text content of the child. */
  content: string
  /** Arbitrary props (e.g. `href`/`src`/`alt` for `a`/`img`). Optional. */
  props?: Record<string, unknown>
}
```

**Field rules (pinned):**

- **`children` is OPTIONAL** on `RagNode`. A node without `children` is a
  plain-text node (the v1 default — plain-text is the default for all nodes;
  rich-text is opt-in per-node-type, per the RICH-TEXT-EDITING-GATE resolved
  design).
- **`children` is an ARRAY of `RagNodeChild`** when present. An empty array
  (`[]`) is valid (equivalent to no inline children).
- **`RagNodeChild.type`** is one of the closed `RagNodeChildType` union
  (`strong`/`em`/`a`/`img`). `span` is NOT a valid child type.
- **`RagNodeChild.content`** is a string (may be empty).
- **`RagNodeChild.props`** is an object or absent. Dangerous keys
  (`__proto__`/`constructor`/`prototype`) anywhere in a child's `props` are
  rejected (the prototype-pollution guard).
- **A dangerous key on the child ITSELF (not just in its `props`) is REJECTED**
  (F4) — the same prototype-pollution guard as the node's own `props`; a
  `__proto__`-bearing child is rejected rather than silently stripped.
- **`children` is deep-copied on BOTH write and read** (the same discipline as
  `props` — §5.1/§5.3): the store stores a copy and returns a copy, so a caller
  cannot mutate the store through a returned record (A3).
- **`children` is NOT part of `ownedNodeIds`** — the inline children are held on
  the owning node, not owned as separate subtree roots (SUBTREE-OWNERSHIP).

### 5.2 Hash-source (`nodeSource`/`nodeHash`)

`nodeSource` must include `children` in the fixed field order, so the SHA-256
hash covers the inline children. A node whose `children` changes gets a new
hash.

**The amended `nodeSource` (pinned):**

```ts
// src/main/rag-store.ts — the amended nodeSource. `children` is added to the
// fixed field order (after `content`, before `props`). The field order is FIXED
// so boot re-verification reproduces the exact source string.
function nodeSource(n: RagNode): string {
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    children: n.children, props: n.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function nodeHash(n: RagNode): string { return sha256(nodeSource(n)) }
```

**Hash-source rules (pinned):**

- **`children` is in the fixed field order** — after `content`, before `props`.
  The order is pinned so boot re-verification (`load`) reproduces the exact
  source string and re-derives the same hash.
- **A node whose `children` changes gets a new hash** — `nodeSource` includes
  `children`, so a `children` edit (via `putNode`) recomputes the hash.
- **A node WITHOUT `children` hashes identically to a node with `children:
  undefined`** — `JSON.stringify` omits an `undefined` field, so a plain-text
  node's source string is unchanged from the pre-Unit-M format. This is what
  makes the change ADDITIVE: an existing persisted record (no `children` field)
  re-derives the SAME hash at boot and is NOT quarantined.
- **A node whose `children` was tampered (changed without a hash update) is
  QUARANTINED at boot** — the boot re-verification (`load`) re-derives the hash
  from `nodeSource`; a mismatch marks the record quarantined and excludes it
  from `status().loadedNodes` (A1).

### 5.3 Store-format additive (load + round-trip)

The JSON store format is ADDITIVE: existing records without `children` still
load and hash-verify; a record with `children` round-trips.

**Additive-load rules (pinned):**

- **An existing persisted record WITHOUT `children` loads unchanged.** The
  `children` field is optional; `validateNodeShape` accepts a record without it,
  and `nodeSource` re-derives the SAME hash as the pre-Unit-M format (a missing
  `children` field serializes identically to `children: undefined`). No
  migration, no re-hash, no quarantine of existing records.
- **A record WITH `children` round-trips:** `putNode` stores it (deep-copied) →
  `persist()` writes it to the file → a fresh store boots from the file →
  `load` re-verifies the hash (which now covers `children`) → `getNode` returns
  it with `children` deep-copied. The `children` array survives the write →
  persist → boot → read cycle with a matching hash.
- **A record whose `children` was tampered (changed without a hash update) is
  QUARANTINED at boot** — the hash-verified source discipline (§5.2/§5.7).

**The internal copy paths (pinned):** every path that copies a node's mutable
fields must copy `children` with the same deep-copy discipline as `props`:

- `toPublicNode` (the read path) — deep-copies `children`.
- `insertNode` (the undo/redo re-insert path) — deep-copies `children`.
- `setNodeFields` (the node-update path) — deep-copies `children`.
- `applyInverse`/`applyForward` content restore — restores `children` from the
  journal snapshot (see §5.5).

### 5.4 Shape validation

The store's write-time validation (`validateNodeShape`) must accept a valid
`children` array and reject a malformed one (non-array, wrong child type,
missing/non-string content). The same validation runs at boot (a malformed
`children` array → the record is SKIPPED, never loaded).

**The amended `validateNodeShape` (pinned):**

```ts
// src/main/rag-store.ts — the amended validateNodeShape. A `children` branch is
// added. `children` is OPTIONAL; when present it must be a valid RagNodeChild[].
function validateNodeShape(input: unknown): NodeShapeResult {
  // ... existing checks (id/type/content/props/ownedNodeIds/createdAt/updatedAt) ...
  if (n.children !== undefined) {
    if (!Array.isArray(n.children)) return { ok: false, field: 'children' }
    for (const c of n.children) {
      if (c === null || typeof c !== 'object' || Array.isArray(c)) return { ok: false, field: 'children' }
      // F4 — reject a dangerous key on the child ITSELF (not just in its props),
      // so a `__proto__`-bearing child is rejected rather than silently stripped.
      if (hasDangerousKey(c)) return { ok: false, field: 'children' }
      if (typeof c.type !== 'string' || !RAG_NODE_CHILD_TYPES.has(c.type)) return { ok: false, field: 'children' }
      if (typeof c.content !== 'string') return { ok: false, field: 'children' }
      if (c.props !== undefined && (c.props === null || typeof c.props !== 'object' || Array.isArray(c.props))) return { ok: false, field: 'children' }
      if (c.props !== undefined && hasDangerousKey(c.props)) return { ok: false, field: 'children' }
    }
  }
  // ... the returned node deep-copies children (like props) ...
}
```

**Validation rules (pinned):**

- **`children` is OPTIONAL.** A record without `children` passes validation
  unchanged (ADDITIVE).
- **`children` must be an ARRAY** when present. A non-array `children` (e.g. an
  object, a string, a number) → `{ ok: false, field: 'children' }`.
- **Each child must be an OBJECT** (not null, not an array). A non-object child
  → `{ ok: false, field: 'children' }`.
- **Each child's `type` must be one of the closed `RagNodeChildType` union**
  (`strong`/`em`/`a`/`img`). A `span` type, an unknown type, or a non-string
  type → `{ ok: false, field: 'children' }` (A5).
- **Each child's `content` must be a STRING** (may be empty). A missing or
  non-string `content` → `{ ok: false, field: 'children' }`.
- **Each child's `props` must be an OBJECT or absent.** A null/array/non-object
  `props` → `{ ok: false, field: 'children' }`.
- **Dangerous keys (`__proto__`/`constructor`/`prototype`) in a child's `props`
  are REJECTED** → `{ ok: false, field: 'children' }` (A4).
- **A dangerous key on the child ITSELF (not just in its `props`) is REJECTED**
  → `{ ok: false, field: 'children' }` (F4) — a `__proto__`-bearing child is
  rejected rather than silently stripped by `deepCopy`.
- **The write-time throw:** `putNode` with a malformed `children` array throws
  `Error('rag putNode: children required/invalid')` (the existing
  `rag putNode: <field> required/invalid` pattern); the store is unchanged.
- **The boot skip:** a persisted record with a malformed `children` array fails
  `validateNodeShape` at boot → SKIPPED (never loaded), exactly like any other
  malformed node field (A2).

**The `RAG_NODE_CHILD_TYPES` runtime set (pinned):** a new module-level set
`RAG_NODE_CHILD_TYPES = new Set<string>(['strong', 'em', 'a', 'img'])` mirrors
the existing `RAG_NODE_TYPES`/`RAG_EDGE_KINDS` runtime-set pattern.

### 5.5 The journal content-entry snapshot (children in before/after)

A content edit that changes `children` must be invertible (undo/redo correct).
The `content` journal entry's `before`/`after` snapshot gains an OPTIONAL
`children` field.

**The amended `JournalEntry` content snapshot (pinned):**

```ts
export type JournalEntry =
  | {
      kind: 'content'
      nodeId: string
      before: { content: string; children?: RagNodeChild[]; props?: Record<string, unknown> }
      after: { content: string; children?: RagNodeChild[]; props?: Record<string, unknown> }
      at: string
    }
  | { kind: 'structural'; op: StructuralJournalOp; at: string }
```

**Journal rules (pinned):**

- **The `content` entry's `before`/`after` snapshot gains an OPTIONAL `children`
  field** (alongside the existing `content`/`props`). A content edit that
  changes `children` records the before/after `children` so `undo()`/`redo()`
  restore/re-apply them.
- **`isContentSnapshot` (the boot journal-entry validator) accepts an OPTIONAL
  `children` array** — a snapshot with a valid `children` array is accepted; a
  snapshot with a malformed `children` array is rejected (the entry is skipped
  at boot). A snapshot WITHOUT `children` is accepted unchanged (ADDITIVE).
- **`applyInverse`/`applyForward` content restore** restores/re-applies
  `children` from the snapshot (deep-copied) alongside `content`/`props`.
- **`isRagNode` (the boot structural-op validator) accepts an OPTIONAL
  `children` array** — a `node-add`/`node-delete`/`node-update` journal entry
  carrying a node with `children` is accepted at boot; a node with a malformed
  `children` array is rejected (the entry is skipped). A node WITHOUT `children`
  is accepted unchanged (ADDITIVE).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **`children` field present on `RagNode`:** the `RagNode` interface exposes
   `children?: RagNodeChild[]`; the `RagNodeChild` type exposes
   `{ type: RagNodeChildType; content: string; props?: Record<string, unknown> }`.
2. **`RagNodeChildType` closed union:** `'strong' | 'em' | 'a' | 'img'` (4
   members). `span` is NOT a member.
3. **Node create with `children`:** `putNode({ id, type, content, children: [{ type: 'strong', content: 'bold' }], ownedNodeIds, createdAt, updatedAt })`
   → returns the stored node; `getNode(id)` returns it with `children` intact;
   `listNodes()` has 1 entry; the file is written atomically.
4. **Node update changing `children`:** `putNode` with the same `id` and a new
   `children` array → the node is replaced; `updatedAt` is refreshed; a `content`
   journal entry is recorded with the before/after `children`; the hash is
   recomputed (a `children` change → a new hash).
5. **Node WITHOUT `children` (plain-text, the v1 default):** `putNode` with no
   `children` field → the node is stored; `getNode` returns it with `children`
   undefined; the hash matches the pre-Unit-M format (no quarantine).
6. **Empty `children` array:** `putNode` with `children: []` → valid; the node
   is stored; `getNode` returns `children: []`.
7. **`children` with `props`:** `putNode` with
   `children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }]`
   → valid; the child's `props` round-trip.
8. **Hash covers `children`:** a node with `children` hashes differently from
   the same node without `children` (the `nodeSource` field order includes
   `children`).
9. **Additive load (existing record without `children`):** a store file written
   BEFORE Unit M (records with no `children` field) boots with
   `status().corrupt === false`, all nodes loaded, none quarantined (the
   re-derived hash matches the stored hash).
10. **Round-trip with `children`:** store A writes a node with `children` to path
    P; a fresh store B boots from P → `status().corrupt === false`; `getNode`
    returns the node with `children` intact (the hash re-verifies).
11. **Journal content undo/redo with `children`:** a node with `children` is
    created, then updated with new `children` → `undo()` restores the prior
    `children`; `redo()` re-applies the new `children`.
12. **Deep-copy on read:** mutating a returned node's `children` (e.g. pushing a
    child) does NOT change the store (the store returns a copy).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`children` is a non-array** (e.g. an object, a string, a number) →
   `putNode` throws `Error('rag putNode: children required/invalid')`; the store
   is unchanged.
2. **A child is a non-object** (null, a string, a number, an array) → `putNode`
   throws `Error('rag putNode: children required/invalid')`; the store is
   unchanged.
3. **A child has an invalid `type`** (a `span`, an unknown type, a non-string
   type) → `putNode` throws `Error('rag putNode: children required/invalid')`;
   the store is unchanged.
4. **A child has a missing or non-string `content`** → `putNode` throws
   `Error('rag putNode: children required/invalid')`; the store is unchanged.
5. **A child has a null/array/non-object `props`** → `putNode` throws
   `Error('rag putNode: children required/invalid')`; the store is unchanged.
6. **A child's `props` contains a dangerous key** (`__proto__`/`constructor`/
   `prototype`) → `putNode` throws `Error('rag putNode: children required/invalid')`;
   the store is unchanged.
7. **A persisted record with a malformed `children` array at boot** → the record
   is SKIPPED (never loaded); `status().loadedNodes` does not include it.
8. **A persisted record whose `children` was tampered (changed without a hash
   update) at boot** → the record is QUARANTINED; `status().quarantined`
   includes it; it is NOT in `status().loadedNodes`.
9. **A journal content entry with a malformed `children` snapshot at boot** →
   the entry is SKIPPED (the `isContentSnapshot` validator rejects it).
10. **A journal structural entry carrying a node with a malformed `children`
    array at boot** → the entry is SKIPPED (the `isRagNode` validator rejects
    it).

### 5.8 Census / numeric claims

- **`RagNodeType` union members:** 18 — UNCHANGED (no `span` added):
  `h1`–`h6` (6), `p`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code` (7),
  `strong`, `em`, `a`, `img` (4), `div` (1). The union is UNCHANGED by this
  unit.
- **`RagNodeChildType` union members:** 4 — `strong`, `em`, `a`, `img`. `span`
  is NOT a member.
- **New fields on `RagNode`:** 1 — `children?: RagNodeChild[]` (optional,
  additive).
- **New types exported from `src/main/rag-store.ts`:** 2 — `RagNodeChildType`,
  `RagNodeChild`.
- **New runtime set:** 1 — `RAG_NODE_CHILD_TYPES` (4 members).
- **`nodeSource` field order:** 8 fields — `id, type, content, children, props,
  ownedNodeIds, createdAt, updatedAt` (`children` added after `content`, before
  `props`).
- **Hash:** SHA-256 (`createHash('sha256')`), hex-encoded, always derived from
  the record's serialized source at write time (unchanged — now covers
  `children`).
- **Edit-op census 6→9:** the edit-op census context (6→9) is Unit O, NOT this
  unit. This unit adds NO edit op. The current edit-op count (6: `setContent`,
  `createNode`, `deleteNode`, `splitNode`, `mergeNode`, `setEdge`) is unchanged
  by Unit M.
- **`span`:** NOT added to `RagNodeType` and NOT a valid `RagNodeChildType` — a
  diff-matching artifact folded into the parent's `content`.

### 5.9 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (the `RagNode`/`RagEdge` shapes
  this unit amends — the `children` field + the `RagNodeChild` type), §5.2 (the
  persisted file format the `children` field round-trips through), §5.4 (the
  `RagStore` interface — `putNode`/`getNode` the `children` field flows
  through), §5.6 (the project journal — the content-entry snapshot this unit
  extends with `children`), §5.7 (the hash-verified source + quarantine
  discipline the `children` hash coverage rides), §5.10 (the census — the
  `RagNodeType` union + the hash).
- Unit D: `docs/specs/unit-d-editing.md` §5.1 (the edit ops — the census 6→9
  context is Unit O, NOT this unit), §5.1.1 (the `src/main/edit-ops.ts` module
  the rich-text ops will extend in Unit O).
- Unit O (future): the rich-text editing ops (`setProps`/`setSubtree`/`setType`)
  that consume the `children` field — the census 6→9. NOT this unit.
- Gate: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the resolved design
  this unit pins: inline `strong`/`em`/`a`/`img` on a NEW `children` field, NOT
  separate RAG nodes; `span` NOT added to `RagNodeType`; the store-format
  `children` additive + hash-source must-fix).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE**, **SUBTREE-OWNERSHIP** (the inline `children` are NOT
  separate RAG nodes and NOT part of `ownedNodeIds`).
- Pending: `docs/pending.md` (the remaining RICH-TEXT-EDITING-GATE must-fix
  items — batch atomicity, retrieval indexing of inline `children` text,
  traversal disambiguation of inline vs doc-children, paste-time sanitization —
  LATER slices, NOT this unit).
- Host patterns: `src/main/rag-store.ts` (the `RagNode` interface, the
  `RagNodeType` union, `nodeSource`/`nodeHash`, `validateNodeShape`, the
  `JournalEntry` content snapshot, the internal copy paths — the amendment
  sites), `src/main/edit-ops.ts` (the edit ops — the census 6→9 context, Unit
  O).
