# Blind Greens — Unit U-D7: The Tag Write Op `edit.set_doc_meta`

- **Artifact:** `tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts`
- **Derived from:** `docs/specs/unit-ud7-set-doc-meta-op.md` §5.1–§5.8 + §3a
  (A1–A12) **ONLY**, plus the harness conventions of the existing test files.
  `src/main/edit-ops.ts` was NOT read to decide expected behavior; only its
  public exports (`setDocMeta`, `SetDocMetaResult`, `EditOpContext`) were
  imported. No TestWriter assertion was copied — the fixtures, values, and
  assertions below are independently authored.
- **Command:** `npx vitest run tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts`
- **Result (2026-09-12):** **26 passed / 0 failed** (1 file).
- **Author role:** Blind-test writer (RCA-4 / AGENTS.md item 10a).

## Fixtures (independent of the TestWriter fixtures)

- **Root fixture** (`seedRoot`): a document root (default id `root`) is the
  TARGET of a `doc-head` edge; a sibling section (`root::sec`) is the edge
  SOURCE. Optional `documentPath`, `tags`, and `type` are set at seed.
- **Multi-store fixture:** default store `alpha-catalogue`, second store
  `beta-catalogue`. Store names are distinct from the TestWriter's
  `main` / `research-2026-09`.
- **Normalization value:** `['  sol  ', 'luna', 'sol', 'Luna', 'luna ']` →
  `['sol','luna','Luna']` (distinct from the TestWriter's `[' b ','a','b','A']`).
- **Cap values:** 64 / 65 tags; 128 / 129-char tags.

## Scenario ledger

| Id | Spec section | Assertion | Result |
| --- | --- | --- | --- |
| G1 | §5.1, §5.6.5, §5.6.8, A2 | Tags-only update on a `doc-head` root: `documentPath`, `id`, `type`, `content`, `ownedNodeIds` all unchanged; returned + stored tags updated. | PASS |
| G2 | §5.2, §5.6.6, A5 | Store-authoritative normalization: `['  sol  ','luna','sol','Luna','luna ']` → `['sol','luna','Luna']`; the caller's array is not mutated (op does not pre-normalize). | PASS |
| G3a | §5.6.7, §5.6.11, A5 | `[]` clears: stored + returned `tags === undefined`; one journal entry still lands. | PASS |
| G3b | §5.6.11, A10 | A semantically-unchanged write (`[]` on an untagged root) still journals (no synthesized no-op guard). | PASS |
| G4 | §5.2 row 8, §5.7.8, A1 | `doc-head` TARGET accepted; section (edge SOURCE), hand-created `div`, `parent-child` target, and `doc-end` participants (source + target) all rejected with `edit.set_doc_meta: target is not a document root`; only the success journaled. | PASS |
| G5a | §5.2 rows 1, §5.7.1, A3 | Non-array `tags` (`{}`, `'sol'`, `7`, `null`, `undefined`, `true`) → `edit.set_doc_meta: tags must be a string array`; store + journal unchanged. | PASS |
| G5b | §5.2 row 2, §5.7.2, A3 | Non-string members (`['a',1]`, `[null]`, `[{}]`, `['a',true]`) → same message; store + journal unchanged. | PASS |
| G6 | §5.2 row 3, §5.7.3, A4 | 64 tags accepted (all preserved); 65 → `edit.set_doc_meta: too many tags (max 64)`; store unchanged. | PASS |
| G7 | §5.2 row 4, §5.7.4, A4 | 128-char tag accepted; 129 → `edit.set_doc_meta: tag too long (max 128)`; store unchanged. | PASS |
| G8 | §5.2 row 5, §5.7.5, A3 | `\u0000` / `\u001F` / `\u007F` / `\n` / `\t` → `edit.set_doc_meta: tags must not contain control characters`; store + journal unchanged. | PASS |
| G9 | §5.2 row 6, §5.7.6, A3 | `''` / `'   '` / `['x','']` → `edit.set_doc_meta: tags must be non-empty strings`; `'  ok  '` is valid and stores `['ok']`. | PASS |
| G10 | §5.2 (order), §5.6.10 | Deterministic order: non-string member beats count cap; count cap beats control; length cap beats control and empty-after-trim. | PASS |
| G11 | §5.2 row 7, §5.7.7 | Unknown `nodeId` → `edit.set_doc_meta: node not found`; journal unchanged. | PASS |
| G12a | §5.2, §5.4.1, §5.7.12 | `handleEditTool` with missing/empty/non-string `nodeId` → throws exactly `edit.set_doc_meta: nodeId required`. | PASS |
| G12b | §5.4.1 | `handleEditTool(null, …)` → throws exactly `edit.set_doc_meta: no rag store configured`. | PASS |
| G13 | §5.7.14, A3 | Raw handler `tags: 123` → `edit.set_doc_meta: tags must be a string array` (never a throw); no broadcast; store + journal unchanged. | PASS |
| G14 | §5.6.12, A6 | `orig → mid → final`; `undo()` twice restores `orig`, `redo()` twice re-applies `final`; fresh boots after undo and after redo have the root loaded, `documentPath` intact, and zero quarantines. | PASS |
| G15a | §5.3, §5.6.2, §5.8 | `groupForTool('edit.set_doc_meta') === 'edit'`; `ALL_TOOLS` contains it and has length 57 (the U-D7 census). | PASS |
| G15b | §5.6.2, §5.3 Seam 4 | `RpcMethod` accepts `'edit.set_doc_meta'` (type-level). | PASS |
| G15c | §5.6.3-4, §5.7.13, A7 | `defaultSecurityConfig().enabled === ['read','dispatch']`; `toolAllowed` false for default/`gnosis-edit`/`gnosis`/`code`, true only with `['edit']`. | PASS |
| G15d | §5.3, §5.8, A7 | `src/renderer/renderer.ts` does not contain `edit.set_doc_meta` (negative contract; the known `MUTATING_METHODS` members are present as a pin guard). | PASS |
| G16 | §5.4, §5.6.5, §5.6.13, A8, A12 | `store:'beta'` routes the write to beta and stamps the broadcast `store: BETA`; omitted and explicit-default both resolve `alpha` identically; each success emits exactly ONE `{kind:'structural', nodeIds:[id], edgeIds:[], store}` broadcast with the store name as 2nd arg; unknown store throws exactly `edit.set_doc_meta: unknown store 'nowhere'` before the op (no broadcast, target unchanged); non-string/empty store throws `edit.set_doc_meta: store must be a non-empty string`. | PASS |
| G17 | §5.7.15, A9, A12 | Non-root target via the handler and an empty tag via the op: zero journal entries, zero undo-depth change, zero broadcasts; tags unchanged. | PASS |
| G18 | §5.2, §5.6.8, §5.7.9, A2 | A raw handler call carrying `documentPath`/`path` succeeds normally, ignores both, and leaves the root's `documentPath` unchanged; exactly one broadcast. | PASS |
| G19 | §5.3 Seam 3, §5.6.2, A2 | SDK row: `nodeId:string`, `tags:array<string>`, `store?:string`; `nodeId`+`tags` required, `store` not; NO `documentPath`/`path` property anywhere in the schema. | PASS |
| G20 | §5.1, §5.5, §5.6.11, §5.6.14-15, A9 | One success = exactly ONE journal entry + `undoDepth` +1; handler and direct op produce identical store state; `applyBatch` still accepts the existing union and rejects a `setDocMeta` op at `failedIndex: 0`. | PASS |

Totals: **26 PASS / 0 FAIL**.

## Non-blind-constructible scenarios (recorded, not faked)

| Spec ref | Scenario | Why not blind-constructible |
| --- | --- | --- |
| A11 | The U-D2 `nodeKind` default (`nodeKind ?? 'content'`) is materialized by `{ ...node, tags }` on a root stored with `nodeKind: undefined`, and remains public-API-unobservable with no quarantine. | The spec itself states it is public-API-unobservable; there is no blind seam that observes the raw stored `nodeKind` without inspecting internals. The no-quarantine half is covered indirectly by G14's fresh-boot checks. |
| A9 / §5.5 | A successful op performs exactly ONE persist. | Persist count is not exposed on the `RagStore` public interface; the journal-entry count (G20) is the observable proxy, which is what the spec pins behaviorally. |
| §5.7.9 (round-trip half) | An SDK `edit.set_doc_meta` call carrying `documentPath` has the field stripped by zod at the transport before the handler. | G19 confirms the schema advertises no path field and G18 confirms the handler ignores one; an actual SDK round-trip with an undeclared field was not exercised (outside the required coverage list). |
| §5.8 | The `MAX_DOC_TAGS`/`MAX_DOC_TAG_LENGTH` constants are module-private (not exported). | Not observable; caps are enforced behaviorally by G6/G7 as the spec prescribes. |
| §5.5 | `applyBatch` never dispatches `setDocMeta` through the store queue. | G20 confirms the reject path; the absence of any internal dispatch is not directly observable. |
| §5.6.14 | A future UI/IPC tags path routes through the SAME op (MCP-UI-EQUIVALENCE). | No UI/IPC tags path exists in v1 (specified as MCP-only); the forward-looking binding has no current seam to exercise. |

## Notes

- No FAIL was observed; no assertion was adjusted to pass and
  `src/main/edit-ops.ts` was not read to explain any behavior.
- The only asserted numeric census is `ALL_TOOLS` length 57 (§5.8 post-landing
  state), matching the three sanctioned ripple pins in the existing suite.
- One fixture-integrity detail discovered from a thrown store error only (never
  from implementation reading): `putEdge` requires both endpoints to exist, so
  every edge target/source is seeded before its edge. `documentPath` values in
  fixtures are arrays of non-empty segments per the landed U-D1 store shape.
