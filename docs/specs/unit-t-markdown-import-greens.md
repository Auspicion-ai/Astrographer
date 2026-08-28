# Unit T — Markdown File Import: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-t-markdown-import.md` ONLY — no implementation reading of
  `src/main/markdown-parse.ts`, `src/main/markdown-import.ts`, or the test
  files).
- **Source contract:** `docs/specs/unit-t-markdown-import.md` §5.6 (the 22
  happy-path states) + §5.7 (the 16 fail-states incl. 3a/3b) + §5.1 (the
  `parseMarkdown`/`importMarkdownCorpus` signatures + return shapes + the
  PURE/DETERMINISTIC/TOTAL parser rules + the importer's never-throws +
  `failedFile` invariant) + §5.2 (the parser grammar + the R1–R9 chunking
  rule + the table rule) + §5.3 (the inline-children parse) + §5.4 (the
  security surface + the one-way snapshot + the one-shot semantics) + §5.5
  (the `edit.import_markdown` tool + `validateDocFlow` before commit) + §3a
  (the adversarial pins A1–A12 + the ADV-1..ADV-9 regression findings). The
  output's `children` must also pass the Unit M §5.1/§5.4 `RagNodeChild`
  shape (the closed `strong`/`em`/`a`/`img` union, string `content`,
  object-or-absent `props`, no dangerous key).
- **Modules under test:** `src/main/markdown-parse.ts` (the PURE
  `parseMarkdown(markdown, documentId)` function), `src/main/markdown-import.ts`
  (the `importMarkdownCorpus(ctx, params)` importer), `src/main/security.ts`
  (`groupForTool`/`toolAllowed`/`defaultSecurityConfig` — the
  `edit.import_markdown` gating), and the `RagStore` interface from
  `src/main/rag-store.ts` (`createJsonRagStore` — the store the importer
  routes through via `applyBatch`). The modules were imported live to RUN the
  scenarios; they were NOT read to derive them.
- **Harness:** a throwaway vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. The parser scenarios call `parseMarkdown`
  directly (PURE, node-testable). The importer scenarios call
  `importMarkdownCorpus` with a temp-file corpus fixture (`corpusRoot` set to a
  temp corpus dir, absolute file paths within it) against a real
  `createJsonRagStore` temp-file store, exactly as the MCP handler uses it. The
  security scenarios call `groupForTool`/`toolAllowed`/`defaultSecurityConfig`
  directly. The F7/F11 applyBatch-failure scenarios exercise the store's
  `applyBatch` directly (the mechanism the importer routes through).
- **Run:** 47 scenarios — 47 pass, 0 fail, 0 skipped. No spec-vs-impl drift
  observed (one doc-ambiguity noted in the findings — see below).

Each scenario lists: name, input, expected outcome (from the spec), actual
result, PASS/FAIL.

---

## A. §5.6 Happy-path states (22)

### H1. Single heading document (§5.6 1)
- **Input:** `parseMarkdown('# Title\n', 'title')`
- **Expected:** a `ParsedMarkdown` with the document root `div` node (id
  `title`, content `''`) + one `h1` section node (`title:section:1`, content
  `'Title'`) + the `doc-head` edge (source = h1, target = root) + the `doc-end`
  edge (source = h1, target = root); `validateDocFlow` returns `{ ok: true,
  order }`.
- **Actual:** root `div` (id `title`, content `''`), `h1` section
  (`title:section:1`, content `'Title'`, `props['data-doc-head']=true`), one
  `doc-head` edge (h1→root), one `doc-end` edge (h1→root);
  `validateDocFlow` → `{ ok: true, order: ['title:section:1'] }`.
- **Result:** ✅ PASS

### H2. Multi-heading document (next-section chain) (§5.6 2)
- **Input:** `parseMarkdown('# A\n## B\n### C\n', 'a')`
- **Expected:** three section nodes (`h1`/`h2`/`h3`) linked by `next-section`
  edges in heading order (A→B→C); the `doc-head` source is the `h1`, the
  `doc-end` source is the `h3`; `validateDocFlow` returns
  `{ ok: true, order: [h1, h2, h3] }`.
- **Actual:** sections `a:section:1/2/3` (`h1`/`h2`/`h3`), two `next-section`
  edges (1→2, 2→3), `doc-head` source `a:section:1`, `doc-end` source
  `a:section:3`; `validateDocFlow` → `{ ok: true, order: ['a:section:1',
  'a:section:2', 'a:section:3'] }`. Only section 1 carries
  `props['data-doc-head']=true`.
- **Result:** ✅ PASS

### H3. Paragraph body → p doc-child (§5.6 3)
- **Input:** `parseMarkdown('# A\n\nSome text.\n', 'a')`
- **Expected:** the `h1` section has one `p` doc-child (order 0) with
  `content: 'Some text.'`; a `parent-child` edge (h1 → p) and a `doc-child`
  edge (h1 → p, order 0).
- **Actual:** `a:p:1` (`p`, content `'Some text.'`), `doc-child` edge
  (h1→p, order 0), `parent-child` edge (h1→p). The `doc-child` edge carries NO
  `documentIds` (R7).
- **Result:** ✅ PASS

### H4. List → ul + li doc-children (§5.6 4)
- **Input:** `parseMarkdown('# A\n\n- one\n- two\n', 'a')`
- **Expected:** a `ul` doc-child of the `h1`; two `li` doc-children of the
  `ul` (each its own RAG object — DOC-CHILD); `parent-child` edges (ul → li1,
  ul → li2) and `doc-child` edges (ul → li1 order 0, ul → li2 order 1).
- **Actual:** `a:ul:1` (`ul`), `a:li:1` (`li`, content `'one'`), `a:li:2`
  (`li`, content `'two'`); two `doc-child` edges (order 0, 1) + two
  `parent-child` edges from the `ul`.
- **Result:** ✅ PASS

### H5. Table → table/thead/tr/td/th (§5.6 5)
- **Input:** `parseMarkdown('# A\n\n| h1 | h2 |\n|---|---|\n| a | b |\n', 'a')`
- **Expected:** a `table` doc-child of the `h1`; a `thead` doc-child (with
  `th` cells) + a `tr` doc-child (with `td` cells); the
  `table`/`thead`/`tr`/`td`/`th` types are valid `RagNodeType` members.
- **Actual:** `a:table:1` (`table`), `a:thead:1` (`thead`) with two `th`
  cells (`h1`, `h2`), `a:tr:1` (`tr`) with two `td` cells (`a`, `b`); the
  `doc-child`/`parent-child` edges nest thead→th and tr→td. All five types are
  produced and accepted by the store (the additive `RagNodeType` change).
- **Result:** ✅ PASS

### H6. Inline formatting → inline children (§5.6 6)
- **Input:** `parseMarkdown('# A\n\nSome **bold** and *em*.\n', 'a')`
- **Expected:** the `p` node's `content` is `'Some  and .'` and its
  `children` is `[{ type: 'strong', content: 'bold' }, { type: 'em', content:
  'em' }]` (the inline elements are hoisted to siblings, the plain text is the
  `content`).
- **Actual:** `a:p:1` content `'Some  and .'`, `children` =
  `[{ type: 'strong', content: 'bold' }, { type: 'em', content: 'em' }]`.
- **Result:** ✅ PASS

### H7. Inline code folded (§5.6 7)
- **Input:** `parseMarkdown('# A\n\nUse `code` here.\n', 'a')`
- **Expected:** the `p` node's `content` is `'Use code here.'` (the backticks
  stripped, the code text folded into the `content` as plain text — NO `code`
  child).
- **Actual:** `a:p:1` content `'Use code here.'`, `children` empty — no `code`
  child.
- **Result:** ✅ PASS

### H8. Safe link → a child (§5.6 8)
- **Input:** `parseMarkdown('# A\n\n[link](https://x)\n', 'a')`
- **Expected:** the `p` node's `children` is `[{ type: 'a', content: 'link',
  props: { href: 'https://x' } }]`.
- **Actual:** `a:p:1` `children` = `[{ type: 'a', content: 'link', props:
  { href: 'https://x' } }]`.
- **Result:** ✅ PASS

### H9. Safe image → img child (§5.6 9)
- **Input:** `parseMarkdown('# A\n\n![alt](https://x/i.png)\n', 'a')`
- **Expected:** the `p` node's `children` is `[{ type: 'img', content: '',
  props: { src: 'https://x/i.png', alt: 'alt' } }]`.
- **Actual:** `a:p:1` `children` = `[{ type: 'img', content: '', props:
  { src: 'https://x/i.png', alt: 'alt' } }]`.
- **Result:** ✅ PASS

### H10. Setext heading (§5.6 10)
- **Input:** `parseMarkdown('Title\n=====\n', 'a')`
- **Expected:** an `h1` section node with `content: 'Title'`.
- **Actual:** `a:section:1` (`h1`, content `'Title'`).
- **Result:** ✅ PASS

### H11. Blockquote (§5.6 11)
- **Input:** `parseMarkdown('# A\n\n> quoted\n', 'a')`
- **Expected:** a `blockquote` doc-child of the `h1`; its inner block → a
  doc-child of the `blockquote`.
- **Actual:** `a:blockquote:1` (`blockquote`) doc-child of the `h1`; `a:p:1`
  (`p`, content `'quoted'`) doc-child of the `blockquote`.
- **Result:** ✅ PASS

### H12. Fenced code block (§5.6 12)
- **Input:** `parseMarkdown('# A\n\n```\ncode\n```\n', 'a')`
- **Expected:** a `pre` doc-child of the `h1` with `content: 'code'` and NO
  children.
- **Actual:** `a:pre:1` (`pre`, content `'code'`, no children).
- **Result:** ✅ PASS

### H13. Horizontal rule dropped (§5.6 13)
- **Input:** `parseMarkdown('# A\n\n---\n\nText\n', 'a')`
- **Expected:** the `---` produces NO node (dropped); the `p` (`Text`) is the
  only doc-child of the `h1`.
- **Actual:** nodes are `div`/`h1`/`p` — no `hr` node; `a:p:1` content
  `'Text'` is the only doc-child.
- **Result:** ✅ PASS

### H14. Raw HTML dropped (§5.6 14)
- **Input:** `parseMarkdown('# A\n\n<div>html</div>\n', 'a')`
- **Expected:** the `<div>` produces NO node and NO text (dropped entirely —
  A8).
- **Actual:** nodes are only the root `div` + the `h1` section (2 nodes); no
  node carries the `'html'` text.
- **Result:** ✅ PASS

### H15. Empty preamble (§5.6 15)
- **Input:** `parseMarkdown('# A\n\nBody\n', 'a')`
- **Expected:** the document root has NO doc-children (the preamble is empty).
- **Actual:** no `doc-child` edge has the root `a` as source.
- **Result:** ✅ PASS

### H16. Multi-file corpus (§5.6 16)
- **Input:** `importMarkdownCorpus(ctx, { files: [<corpus>/a.md,
  <corpus>/b.md], corpusRoot: <corpus> })` where `a.md` = `# A\n\nBody a.\n`
  and `b.md` = `# B\n\nBody b.\n`
- **Expected:** `{ ok: true, documentIds: ['a', 'b'], nodeCount, edgeCount }`;
  each document has its own `documentId` and its own doc-flow;
  `validateDocFlow` passes for both.
- **Actual:** `{ ok: true, documentIds: ['a', 'b'], nodeCount: 6, edgeCount:
  10 }` (3 nodes + 5 edges per document).
- **Result:** ✅ PASS

### H17. One atomic batch journal entry (§5.6 17)
- **Input:** a successful import of a corpus (H16).
- **Expected:** EXACTLY ONE `batch` journal entry (not N per node/edge);
  `undoDepth()` increases by exactly 1; the file is written atomically.
- **Actual:** `journal()` has 1 entry of kind `batch`; `undoDepth()` is 1.
- **Result:** ✅ PASS

### H18. `validateDocFlow` passes before commit (§5.6 18)
- **Input:** `importMarkdownCorpus(ctx, { files: [<corpus>/a.md], corpusRoot:
  <corpus> })` (a well-formed corpus).
- **Expected:** the importer validates each document's doc-flow and the batch
  is submitted; the import succeeds.
- **Actual:** `{ ok: true, documentIds: ['a'], nodeCount: 3, edgeCount: 5 }`.
- **Result:** ✅ PASS

### H19. One-way snapshot (no write-back) (§5.6 19)
- **Input:** after a successful import, re-read the source file `a.md`.
- **Expected:** the source markdown files are UNCHANGED (the importer
  performed NO write to them); the RAG store reflects the imported content.
- **Actual:** the source file content is byte-identical before and after the
  import (A4).
- **Result:** ✅ PASS

### H20. `ownedNodeIds` derived from the chunking rule (§5.6 20)
- **Input:** `parseMarkdown('# A\n## B\n', 'a')`
- **Expected:** each imported node's `ownedNodeIds` is the RAG node ids it
  owns per the chunking rule (its doc-children's ids EXCLUDED); the document
  root's `ownedNodeIds` is the section node ids (its family children).
- **Actual:** root `a` `ownedNodeIds` = `['a:section:1', 'a:section:2']`;
  both section nodes' `ownedNodeIds` = `[]` (their body blocks are
  doc-children, so they own nothing directly — R9).
- **Result:** ✅ PASS

### H21. Determinism (§5.6 21)
- **Input:** `parseMarkdown('# A\n', 'a')` called twice.
- **Expected:** both calls return the SAME `ParsedMarkdown` (deep-equal).
- **Actual:** both calls return deep-equal results (A10).
- **Result:** ✅ PASS

### H22. Totality on malformed markdown (§5.6 22)
- **Input:** `parseMarkdown('```unclosed', 'a')` (an unclosed code fence).
- **Expected:** a best-effort `ParsedMarkdown` (never throws).
- **Actual:** returns a `ParsedMarkdown` (root `div` + a `pre` doc-child) — no
  throw (A1).
- **Result:** ✅ PASS

---

## B. §5.7 Fail-states (16)

### F1. Non-string markdown / empty documentId throws (§5.7 1)
- **Input:** `parseMarkdown(42, 'a')` and `parseMarkdown('# A', '')`.
- **Expected:** each throws `Error('markdown parse: markdown/documentId
  required')` (a caller error — the ONLY parser throw).
- **Actual:** both throw `Error('markdown parse: markdown/documentId
  required')`.
- **Result:** ✅ PASS

### F2. Empty `files` array (§5.7 2)
- **Input:** `importMarkdownCorpus(ctx, { files: [], corpusRoot })`.
- **Expected:** `{ ok: false, error: 'markdown import: files must be a
  non-empty array' }`; no node/edge is applied.
- **Actual:** `{ ok: false, error: 'markdown import: files must be a
  non-empty array' }` (no `failedFile`).
- **Result:** ✅ PASS

### F3. Unreadable file (§5.7 3)
- **Input:** `importMarkdownCorpus(ctx, { files: [<corpus>/nope.md],
  corpusRoot })` (a nonexistent path within the corpus root).
- **Expected:** `{ ok: false, error: 'markdown import: cannot read file:
  <path>', failedFile: <path> }`; no node/edge is applied.
- **Actual:** `{ ok: false, error: 'markdown import: cannot read file:
  <corpus>/nope.md', failedFile: <corpus>/nope.md }`.
- **Result:** ✅ PASS

### F3a. Empty-string file path (§5.7 3a)
- **Input:** `importMarkdownCorpus(ctx, { files: [''], corpusRoot })`.
- **Expected:** `{ ok: false, error: 'markdown import: empty file path' }`;
  no node/edge is applied.
- **Actual:** `{ ok: false, error: 'markdown import: empty file path' }` (no
  `failedFile`).
- **Result:** ✅ PASS

### F3b. Path escapes the corpus root (§5.7 3b)
- **Input:** `importMarkdownCorpus(ctx, { files: [<dir>/outside.md],
  corpusRoot: <corpus> })` (an absolute path outside the corpus root).
- **Expected:** `{ ok: false, error: 'markdown import: path outside corpus
  root: <path>', failedFile: <path> }`; no node/edge is applied (path
  containment).
- **Actual:** `{ ok: false, error: 'markdown import: path outside corpus root:
  <dir>/outside.md', failedFile: <dir>/outside.md }`.
- **Result:** ✅ PASS

### F4. Duplicate `documentId` across the corpus (§5.7 4)
- **Input:** `importMarkdownCorpus(ctx, { files: [<corpus>/a.md,
  <corpus>/a.markdown], corpusRoot })` (both sanitize to `a`).
- **Expected:** `{ ok: false, error: 'markdown import: duplicate documentId:
  a' }`; no node/edge is applied (A6).
- **Actual:** `{ ok: false, error: 'markdown import: duplicate documentId: a'
  }` (no `failedFile`).
- **Result:** ✅ PASS

### F5. Filename sanitizes to an EMPTY `documentId` (§5.7 5)
- **Input:** `importMarkdownCorpus(ctx, { files: [<corpus>/.md], corpusRoot })`
  (basename without `.md` is empty).
- **Expected:** `{ ok: false, error: 'markdown import: empty documentId for
  file: <path>', failedFile: <path> }`; no node/edge is applied.
- **Actual:** `{ ok: false, error: 'markdown import: empty documentId for
  file: <corpus>/.md', failedFile: <corpus>/.md }`.
- **Result:** ✅ PASS

### F6. Doc-flow violation aborts the WHOLE import (§5.7 6)
- **Input:** `importMarkdownCorpus(ctx, { files: [<corpus>/nohead.md],
  corpusRoot })` where `nohead.md` = `'Some text with no heading.\n'` (no
  heading → no `doc-head` edge → `missing-head`).
- **Expected:** `{ ok: false, error: 'markdown import: doc-flow validation
  failed for nohead: missing-head', failedFile: <path> }`; the WHOLE import
  aborts — NO node/edge is applied (A5).
- **Actual:** `{ ok: false, error: 'markdown import: doc-flow validation
  failed for nohead: missing-head', failedFile: <corpus>/nohead.md }`.
- **Result:** ✅ PASS

### F7. An `applyBatch` failure (§5.7 7)
- **Input:** `store.applyBatch([{ op: 'bogus' }])` (an invalid batch op — the
  mechanism the importer routes through).
- **Expected:** `{ ok: false, error: <batch error> }`; the batch rolls back —
  the store is unchanged, the journal is unpolluted, no persist (Unit N §5.3).
- **Actual:** `{ ok: false, error: 'rag applyBatch: invalid op at index 0',
  failedIndex: 0 }`; the store is unchanged.
- **Result:** ✅ PASS

### F8. Unsafe link href demoted (§5.7 8)
- **Input:** `parseMarkdown('# A\n\n[x](javascript:alert(1))\n', 'a')`.
- **Expected:** the `a` is DEMOTED to plain text (no `a` child, no
  `javascript:` URL in the output) (A7).
- **Actual:** no `a` child; the output contains no `javascript:` URL.
- **Result:** ✅ PASS

### F9. Unsafe image src dropped (§5.7 9)
- **Input:** `parseMarkdown('# A\n\n![x](data:text/html,y)\n', 'a')`.
- **Expected:** the `img` is DROPPED (no `img` child) (A7).
- **Actual:** no `img` child.
- **Result:** ✅ PASS

### F10. Raw HTML dropped (§5.7 10)
- **Input:** `parseMarkdown('# A\n\n<script>alert(1)</script>\n', 'a')`.
- **Expected:** the script AND its content are dropped (no text, no child)
  (A8).
- **Actual:** the output contains no `alert(1)` text and no child.
- **Result:** ✅ PASS

### F11. Prototype-pollution key rejected (§5.7 11)
- **Input:** `store.applyBatch([{ op: 'putNode', node: { ...n1, props:
  { __proto__: {} } } }])` (a node carrying a dangerous key — the mechanism
  the importer's batch routes through).
- **Expected:** the store's write-time validation fails the batch →
  `{ ok: false, error: <batch error> }`; the batch rolls back (A9).
- **Actual:** `{ ok: false, error: 'rag applyBatch: props required/invalid at
  index 0', failedIndex: 0 }`; `listNodes()` is empty (rolled back).
- **Result:** ✅ PASS

### F12. Re-import is NOT idempotent (one-shot upsert) (§5.7 12)
- **Input:** `importMarkdownCorpus` the same corpus twice against a fresh
  store.
- **Expected:** the second import OVERWRITES the existing nodes/edges (upsert)
  — the parser's node ids are DETERMINISTIC (R1a), so the same ids are
  re-applied; the importer does NOT dedupe, does NOT merge, and does NOT
  refuse (A3).
- **Actual:** both imports return `{ ok: true, documentIds: ['a'], nodeCount:
  3, edgeCount: 5 }`; the store's node count is 3 after both (no second set
  created — upsert over the same ids).
- **Result:** ✅ PASS

### F13. `edit.import_markdown` with the `edit` group disabled (§5.7 13)
- **Input:** `defaultSecurityConfig()` + `toolAllowed('edit.import_markdown',
  cfg.enabled)` + `groupForTool('edit.import_markdown')`.
- **Expected:** not registered, not callable (`toolAllowed` returns false)
  (A11). `defaultSecurityConfig()` = `{ token: null, enabled: ['read',
  'dispatch'] }`.
- **Actual:** `groupForTool` → `'edit'`; `toolAllowed` with the default config
  → `false`; `defaultSecurityConfig()` = `{ token: null, enabled: ['read',
  'dispatch'] }`.
- **Result:** ✅ PASS

### F14. `edit.import_markdown` with only `code` enabled (§5.7 14)
- **Input:** `toolAllowed('edit.import_markdown', ['code'])`.
- **Expected:** denied (editing is NEVER a `code`-group op).
- **Actual:** `false`.
- **Result:** ✅ PASS

---

## C. Security gating — positive (A11)

### S1. `edit.import_markdown` callable when the `edit` group is enabled
- **Input:** `toolAllowed('edit.import_markdown', ['edit'])`.
- **Expected:** `true` (the tool is in the `edit` group; callable only when
  the `edit` group is enabled — A11).
- **Actual:** `true`.
- **Result:** ✅ PASS

---

## D. Adversarial + edge scenarios (§3a / §5.2 / §5.4)

### E1. A12 — malformed table handled leniently
- **Input:** `parseMarkdown('# A\n\n| h1 | h2 |\n|---|---|\n| a |\n', 'a')`
  (a row with fewer cells than the header).
- **Expected:** parsed best-effort (the cells that exist become `td`/`th`
  nodes) — never a throw (A12).
- **Actual:** no throw; one `td` cell (`a`) is produced.
- **Result:** ✅ PASS

### E2. ADV-3 — unclosed inline raw-HTML drops content through end-of-input
- **Input:** `parseMarkdown('# A\n\n<script>alert(1)', 'a')` (no close tag).
- **Expected:** the inline handler drops the content through end-of-input when
  no close tag is found (ADV-3 fix).
- **Actual:** the output contains no `alert(1)` text.
- **Result:** ✅ PASS

### E3. ADV-6 — numeric HTML ref > 0x10FFFF never throws
- **Input:** `parseMarkdown('# A\n\n&#xFFFFFFFF;\n', 'a')`.
- **Expected:** no throw (the `code > 0x10ffff` guard before
  `String.fromCodePoint` — ADV-6 fix; TOTAL).
- **Actual:** no throw.
- **Result:** ✅ PASS

### E4. ADV-7 — deeply nested blockquote never throws
- **Input:** `parseMarkdown('# A\n\n' + '> '.repeat(200) + 'x\n', 'a')`.
- **Expected:** no throw (a blockquote nested beyond `MAX_BLOCK_DEPTH` is
  flattened to a paragraph — ADV-7 fix; TOTAL).
- **Actual:** no throw.
- **Result:** ✅ PASS

### E5. ADV-8 — deeply nested inline never throws
- **Input:** `parseMarkdown('# A\n\n' + '**'.repeat(200) + 'x' +
  '**'.repeat(200) + '\n', 'a')`.
- **Expected:** no throw (beyond `MAX_INLINE_DEPTH` the inner content is
  treated as plain text — ADV-8 fix; TOTAL).
- **Actual:** no throw.
- **Result:** ✅ PASS

### E6. URL-F1 — leading C0-control/space before a scheme is rejected
- **Input:** `parseMarkdown('# A\n\n[x]( javascript:alert(1))\n', 'a')`.
- **Expected:** the `a` is demoted to plain text (the leading space is
  stripped before the scheme test, so `javascript:` is classified as unsafe —
  the Unit S URL-F1 rule the importer inherits).
- **Actual:** no `a` child; no `javascript:` URL in the output.
- **Result:** ✅ PASS

### E7. URL — scheme checked case-insensitively
- **Input:** `parseMarkdown('# A\n\n[x](JaVaScRiPt:alert(1))\n', 'a')`.
- **Expected:** the `a` is demoted (the scheme is checked case-insensitively —
  the Unit S URL rule the importer inherits).
- **Actual:** no `a` child.
- **Result:** ✅ PASS

### E8. URL-F3 — HTML character references decoded before validation
- **Input:** `parseMarkdown('# A\n\n[x](&#106;avascript:alert(1))\n', 'a')`.
- **Expected:** the `a` is demoted (HTML character references are decoded
  before the scheme test — the Unit S URL-F3 rule the importer inherits).
- **Actual:** no `a` child.
- **Result:** ✅ PASS

---

## E. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | Single heading document (§5.6 1) | ✅ PASS |
| H2 | Multi-heading next-section chain (§5.6 2) | ✅ PASS |
| H3 | Paragraph p doc-child (§5.6 3) | ✅ PASS |
| H4 | List ul + li doc-children (§5.6 4) | ✅ PASS |
| H5 | Table table/thead/tr/td/th (§5.6 5) | ✅ PASS |
| H6 | Inline strong+em children (§5.6 6) | ✅ PASS |
| H7 | Inline code folded (§5.6 7) | ✅ PASS |
| H8 | Safe link a child (§5.6 8) | ✅ PASS |
| H9 | Safe image img child (§5.6 9) | ✅ PASS |
| H10 | Setext heading (§5.6 10) | ✅ PASS |
| H11 | Blockquote + inner doc-child (§5.6 11) | ✅ PASS |
| H12 | Fenced code pre (§5.6 12) | ✅ PASS |
| H13 | Horizontal rule dropped (§5.6 13) | ✅ PASS |
| H14 | Raw HTML dropped (§5.6 14) | ✅ PASS |
| H15 | Empty preamble (§5.6 15) | ✅ PASS |
| H16 | Multi-file corpus (§5.6 16) | ✅ PASS |
| H17 | One atomic batch journal entry (§5.6 17) | ✅ PASS |
| H18 | validateDocFlow passes before commit (§5.6 18) | ✅ PASS |
| H19 | One-way snapshot no write-back (§5.6 19) | ✅ PASS |
| H20 | ownedNodeIds derived (§5.6 20) | ✅ PASS |
| H21 | Determinism (§5.6 21) | ✅ PASS |
| H22 | Totality on malformed markdown (§5.6 22) | ✅ PASS |
| F1 | Non-string/empty documentId throws (§5.7 1) | ✅ PASS |
| F2 | Empty files array (§5.7 2) | ✅ PASS |
| F3 | Unreadable file (§5.7 3) | ✅ PASS |
| F3a | Empty-string file path (§5.7 3a) | ✅ PASS |
| F3b | Path escapes corpus root (§5.7 3b) | ✅ PASS |
| F4 | Duplicate documentId (§5.7 4) | ✅ PASS |
| F5 | Empty documentId from filename (§5.7 5) | ✅ PASS |
| F6 | Doc-flow violation aborts whole import (§5.7 6) | ✅ PASS |
| F7 | applyBatch failure (§5.7 7) | ✅ PASS |
| F8 | Unsafe link href demoted (§5.7 8) | ✅ PASS |
| F9 | Unsafe image src dropped (§5.7 9) | ✅ PASS |
| F10 | Raw HTML dropped (§5.7 10) | ✅ PASS |
| F11 | Prototype-pollution key rejected (§5.7 11) | ✅ PASS |
| F12 | Re-import not idempotent (one-shot upsert) (§5.7 12) | ✅ PASS |
| F13 | edit.import_markdown default-off (§5.7 13) | ✅ PASS |
| F14 | Only code enabled denied (§5.7 14) | ✅ PASS |
| S1 | edit group enabled → callable (A11) | ✅ PASS |
| E1 | A12 malformed table lenient | ✅ PASS |
| E2 | ADV-3 unclosed inline raw-HTML drops content | ✅ PASS |
| E3 | ADV-6 numeric HTML ref >0x10FFFF no throw | ✅ PASS |
| E4 | ADV-7 deeply nested blockquote no throw | ✅ PASS |
| E5 | ADV-8 deeply nested inline no throw | ✅ PASS |
| E6 | URL-F1 leading-space scheme demoted | ✅ PASS |
| E7 | URL case-insensitive scheme demoted | ✅ PASS |
| E8 | URL-F3 HTML char-ref scheme demoted | ✅ PASS |

**Run summary:** 47 scenarios — 47 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-t-markdown-import.md` §5.6/§5.7 (plus the §5.1 signatures +
  return shapes + the PURE/DETERMINISTIC/TOTAL parser rules + the importer's
  never-throws + `failedFile` invariant, the §5.2 grammar + R1–R9 chunking +
  table rule, the §5.3 inline parse, the §5.4 security surface + one-way
  snapshot + one-shot semantics, the §5.5 tool + `validateDocFlow`-before-commit,
  and the §3a adversarial pins A1–A12 + ADV-1..ADV-9 regression findings)
  passed against the live `src/main/markdown-parse.ts`,
  `src/main/markdown-import.ts`, `src/main/security.ts`, and the
  `createJsonRagStore` store. The parser is PURE/DETERMINISTIC/TOTAL (§5.6
  21/22, §5.7 1), produces the pinned node-id scheme (`documentId`,
  `documentId:section:<n>`, `documentId:<type>:<n>` — R1a), the doc-flow edges
  (doc-head/next-section/doc-end with `documentIds: [<documentId>]`, doc-child
  edges with NO `documentIds` — R7), the `data-doc-head` marker on the first
  section only, the derived `ownedNodeIds` (R9), the additive
  `table`/`thead`/`tr`/`td`/`th` types (§5.2 table rule), the inline-children
  parse with the closed `strong`/`em`/`a`/`img` union (§5.3), the URL-safety
  neutralization (F8/F9/E6/E7/E8), the raw-HTML drop (H14/F10/E2), and the
  totality guards (E3/E4/E5). The importer returns the pinned discriminated
  result, applies the whole corpus as ONE atomic `batch` journal entry (H17),
  validates doc-flow before commit (H18/F6), never writes back to the source
  (H19), and enforces path containment (F3b). The `edit.import_markdown` tool
  is default-off in the `edit` group (F13/F14/S1). No spec-vs-impl drift was
  observed.

### Test-authoring notes (not drifts)

- **H14 (raw HTML dropped).** The document root is itself a `div` node (R1 —
  STRUCTURAL-ROOT), so the assertion checks that the `<div>html</div>` block
  produces NO additional node and NO text (the root `div` is expected), not
  that no `div` type exists.
- **F7/F11 (applyBatch failure).** The parser NEVER produces a dangerous-key
  node or an invalid batch op from markdown (its `props` are the fixed keys
  `href`/`src`/`alt`/`data-doc-head`), so the importer's normal path cannot
  trigger an `applyBatch` failure. These scenarios exercise the store's
  `applyBatch` directly (the mechanism the importer routes through — Unit N
  §5.3) to verify the rollback behavior the spec pins. This is consistent with
  the spec: the parser's safety is why the importer path is clean, and the
  store's write-time validation is the backstop (A9).
- **Importer file paths.** The importer scenarios pass ABSOLUTE paths within
  the temp `corpusRoot` (the documented intended usage — §5.7 3b frames
  containment in terms of "an absolute path outside the configured corpus
  root"). See the doc-ambiguity note below for relative-path behavior.
- **A2 (parser PURE).** Verified indirectly: `parseMarkdown` is imported and
  run with no store/file setup and no filesystem side effects (it is a pure
  function over its two string inputs).

### Doc-ambiguity note (for the proofreader / documentation reviewer)

- **Relative-path resolution vs `corpusRoot` — RESOLVED (proofreader, 2026-08-28).**
  The spec §5.1 originally said `corpusRoot` is "the base directory the
  path-containment seam resolves paths against". The live importer resolves a
  RELATIVE `files` path against the process CWD (not against `corpusRoot`), then
  containment-checks the resolved absolute path against `corpusRoot`. Concretely,
  `importMarkdownCorpus(ctx, { files: ['a.md'], corpusRoot: <corpus> })` returns
  `{ ok: false, error: 'markdown import: path outside corpus root: a.md' }` (the
  relative path resolves to `<cwd>/a.md`, outside the corpus root), whereas the
  absolute path `<corpus>/a.md` imports successfully. The proofreader reconciled
  the spec to match the implementation: §5.1 now pins that a RELATIVE `files`
  path is resolved against the process CWD (NOT `corpusRoot`), then
  containment-checked against `corpusRoot`; §5.4 and fail-state 3b carry the same
  clarification. The intended usage is ABSOLUTE paths within `corpusRoot`.
