# Unit U-D1 — Document Metadata Fields (`documentPath` / `tags`): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4) — derived from DOCUMENTATION ONLY. No
  implementation reading of `src/main/rag-store.ts` / `src/main/adjacency.ts`.
- **Source contract:** `docs/specs/unit-ud1-document-metadata-fields.md`
  §5.1 (fields), §5.2 (hash source), §5.3 (additive load + copy paths), §5.4
  (validation/normalization), §5.5 (off-root), §5.6 (happy-path states 1–20),
  §5.7 (fail-states 1–13), §3a (adversarial findings A1–A7 + F1).
- **Harness:** `tests/blind-unit-ud1-document-metadata-fields-greens.test.ts`.
  The store is exercised through the real `createJsonRagStore` factory against
  temp-file JSON stores. `newSource`/`newHash` replicate the spec's amended
  11-field order (`id, type, content, nodeKind, children, documentPath, tags,
  props, ownedNodeIds, createdAt, updatedAt` — §5.2, `nodeKind` KEPT per the
  RCA-10 resolution); `oldSource`/`oldHash` replicate the pre-U-D1 order (no
  `documentPath`/`tags`) for the additive-load / tamper fixtures. The
  structural-replay F1 scenarios use the documented `redo()` path
  (`docs/specs/unit-a-rag-store.md` §5.4/§5.6: `redo()` re-applies the forward
  journal op).
- **Harness-only reference:** `tests/unit-ud1-document-metadata-fields.test.ts`
  was consulted ONLY for harness conventions (temp-file setup, imports,
  spec-order hash helpers). The scenarios below are independently authored; the
  TestWriter assertions were not copied.
- **Command:**
  `npx vitest run tests/blind-unit-ud1-document-metadata-fields-greens.test.ts`
- **Run:** 29 scenarios — 29 pass, 0 fail, 0 skipped. No spec-vs-impl drift.

Each scenario lists: id, the spec section it derives from, the assertion, and
the result.

---

## A. Persistence + round-trip

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| A1 | §5.6 2/14 | both fields survive write→persist→fresh-boot→read; `corrupt=false`, zero quarantined, `loadedNodes` contains the id, both arrays intact | ✅ PASS |
| A2 | §5.6 3/4 | `documentPath`-only and `tags`-only nodes round-trip independently; the other field reads back `undefined` | ✅ PASS |
| A3 | §5.6 5 | neither field: both read `undefined`; both keys are OMITTED on disk (`JSON.stringify` drops `undefined`); fresh boot zero quarantines | ✅ PASS |
| A4 | §5.5/§5.6 18, A6 | a node whose id is NOT a document root ('not-a-document-root') stores/hashes/round-trips both fields — not rejected or stripped | ✅ PASS |

## B. Normalization

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| B1 | §5.6 6, A4 | `documentPath: []` reads back `undefined`, the key is omitted on disk, and its on-disk hash equals the absent-field hash | ✅ PASS |
| B2 | §5.6 7, A4 | `tags: []` reads back `undefined`, the key is omitted on disk, and its on-disk hash equals the absent-field hash | ✅ PASS |
| B3 | §5.6 8, A5 | `tags: [' b ','a','b','A']` stores as `['b','a','A']` (trim + dedupe on trimmed value + first-occurrence order + case-SENSITIVE) | ✅ PASS |
| B4 | §5.6 9, §3a F5 | `documentPath: ['a','a']` keeps `['a','a']` (no dedupe); `[' a ','  ']` keeps `[' a ','  ']` (no trim) | ✅ PASS |
| B5 | §3a F5, §5.4 | `documentPath: ['  ']` (whitespace-only segment) is ACCEPTED and not trimmed; `tags: ['  ']` is REJECTED | ✅ PASS |

## C. Write-time throw messages

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| C1 | §5.7 1–3 | non-array `documentPath` (`{}`, `'a'`), non-string member (`[42]`, `['ok',null]`), empty-string member (`['']`) each reject with the exact `Error('rag putNode: documentPath required/invalid')`; store unchanged | ✅ PASS |
| C2 | §5.7 4–6 | non-array `tags` (`{}`, `'x'`), non-string member (`[42]`), empty/whitespace member (`['']`, `['   ']`) each reject with the exact `Error('rag putNode: tags required/invalid')`; store unchanged | ✅ PASS |

## D. Hash coverage + fixed field order

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| D1 | §5.6 10 | same base node with vs without `documentPath:['a']` yields different on-disk hashes; the with-field hash equals `sha256(spec-order source)` and differs from the pre-U-D1 hash | ✅ PASS |
| D2 | §5.6 11 | same base node with vs without `tags:['x']` yields different on-disk hashes; the with-field hash equals `sha256(spec-order source)` and differs from the pre-U-D1 hash | ✅ PASS |
| D3 | §5.6 12 | persisted hash equals `sha256` of the spec-pinned order (`id,type,content,nodeKind,children,documentPath,tags,props,ownedNodeIds,createdAt,updatedAt`) and NOT a swapped order (`props` before `documentPath`) | ✅ PASS |

## E. Additive old-store load

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| E1 | §5.6 13/§5.7 13, A1 | a pre-U-D1 file with a `nodeKind`-bearing node + a `children` node, hashed with `oldHash`, boots `corrupt=false`, zero quarantined, both loaded, on-disk hashes byte-equal `oldHash`, fields read `undefined` | ✅ PASS |

## F. Deep-copy

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| F1 | §5.6 15, A3 | mutating a returned node's `documentPath`/`tags` arrays does NOT change the store (re-read is unchanged) | ✅ PASS |
| F2 | §5.6 16, A3 | mutating the arrays passed to `putNode` after the call returns does NOT change the store | ✅ PASS |

## G. M3 data-loss guard

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| G1 | §5.6 17, A7 | `putNode({ ...getNode('n1')! })` preserves both fields (not stripped); a subsequent fresh boot has zero quarantines and the fields intact | ✅ PASS |

## H. Tampered field → quarantine

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| H1 | §5.7 10, A1 | a persisted node carrying `documentPath:['a']` with a hash computed WITHOUT the field (pre-U-D1 `oldHash`) is QUARANTINED, excluded from `loadedNodes`, absent from `getNode` | ✅ PASS |
| H2 | §5.7 11, A1 | same discipline for `tags:['x']` with a pre-U-D1 hash → QUARANTINED | ✅ PASS |

## I. Malformed persisted record → skipped at boot

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| I1 | §5.7 8, A2 | a persisted node with a non-string `documentPath` member, hashed with the spec order (so the skip is NOT a hash failure), is SKIPPED: not loaded, NOT quarantined, `getNode` undefined, `corrupt=false` | ✅ PASS |
| I2 | §5.7 9, A2 | a persisted node with a non-array `tags` value, spec-hashed, is SKIPPED (not loaded, not quarantined) | ✅ PASS |

## J. Structural journal — shape acceptance + F1 replay normalization

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| J1 | §5.6 19 | a persisted valid structural `node-add` entry carrying both fields survives boot (`corrupt=false`, `journal()` length 1) | ✅ PASS |
| J2 | §5.7 12 | a persisted `node-add` entry whose node has a malformed `documentPath` is SKIPPED (`journal()` is `[]`, `corrupt=false`) | ✅ PASS |
| J3 | §3a F1 | `node-add` replay (documented `redo()`) of a raw `documentPath:[]`/`tags:[' b ','b']` entry reads back normalized (`documentPath` undefined, `tags` `['b']`); a fresh boot after the persisted replay has ZERO quarantines | ✅ PASS |
| J4 | §3a F1 | `node-update` replay (documented `redo()`) of a raw `after` node normalizes before hashing/storing (`documentPath` undefined, `tags` `['x']`, `content` 'after'); a fresh boot after the persisted replay has ZERO quarantines | ✅ PASS |

## K. applyBatch

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| K1 | §5.6 20 | a one-op `applyBatch([{op:'putNode',...}])` applies, stores the normalized fields (`tags:[' b ','b']`→`['b']`), and persists the file | ✅ PASS |
| K2 | §5.7 7 | a malformed `documentPath` batch returns `{ ok:false, error:'rag applyBatch: documentPath required/invalid at index 0', failedIndex:0 }`; store rolled back (`listNodes` empty) | ✅ PASS |
| K3 | §5.7 7 | a malformed `tags` at index 1 returns `{ ok:false, error:'rag applyBatch: tags required/invalid at index 1', failedIndex:1 }`; the already-applied op is rolled back (nodes and journal empty) | ✅ PASS |

---

## Run record

**Totals: 29 scenarios — 29 PASS, 0 FAIL, 0 SKIPPED.**

### F1 blind-construction note

J3/J4 exercise the F1 structural-replay normalization invariant through the
documented public `redo()` path (`docs/specs/unit-a-rag-store.md` §5.4/§5.6:
`redo()` re-applies the forward journal op, routing a `node-add` through
`insertNode` and a `node-update` through `setNodeFields`). The authored file
places the raw entry at `cursor: 0`, boots a store, calls `redo()` (the replay),
asserts the replayed node reads back normalized, then boots a fresh store from
the now-persisted file and asserts zero quarantines. This is a blind
construction from the spec's named replay paths (`insertNode`/`setNodeFields`)
plus the documented `redo()` semantics — no implementation reading.

### Scenarios that could NOT be blind-constructed

- **None.** Every §5.6/§5.7/§3a state in scope for U-D1 was constructible from
  the documentation alone. In particular the F1 replay invariant was reachable
  via the documented `redo()` API, and the off-root (A6), `[]`→omitted (A4),
  tag-dedupe (A5), tamper (A1), malformed (A2), and deep-copy (A3) adversarial
  pins all mapped directly to public store behavior.

### Findings (spec-vs-impl drift)

- **None observed.** All 29 scenarios passed against the live
  `src/main/rag-store.ts`. The two fields are optional and additive; `[]`
  normalizes to absent before hashing; `tags` trim/dedupe/case-sensitively while
  `documentPath` neither dedupes nor trims; the hash covers both fields in the
  fixed 11-field order; old `nodeKind`-bearing stores re-derive byte-identical
  hashes with zero quarantines; the fields are deep-copied on write and read;
  the M3 `getNode`→`putNode` guard holds; off-root fields are stored/hashed;
  tampered shape-valid records quarantine while malformed persisted records are
  skipped; the structural journal accepts valid entries and skips malformed
  ones; the F1 replay normalizes before hashing; and `applyBatch` normalizes,
  rolls back, and reports the exact indexed errors.
- No PACKAGE findings → no `docs/defects.md` / `docs/HANDOFF.md` update.
