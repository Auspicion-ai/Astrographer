# Spec — Unit U-D3: Import Path Derivation + the Path-Qualified `/`-Joined `documentId` Scheme

- **Status:** SPEC (the import/id-scheme unit of the document directory/category
  slice — the THIRD unit of the ratified U-D1…U-D7 decomposition; execution
  order U-D1 → U-D2 → **U-D3** → U-D4 → U-D5 ∥ U-D6 → U-D7). Gate references:
  `docs/decisions.md` row **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-
  AMENDMENTS, RATIFIED 2026-09-11), `docs/specs/document-directory-category-review.md`
  (M1/M4/M5/M6 + the U-D3 row in §5; Q1), and the GATED parent
  `docs/specs/document-directory-category.md` §3.2/§3.3/§4. Precedent specs:
  `docs/specs/unit-ud1-document-metadata-fields.md` (the LANDED
  `RagNode.documentPath?` field + `normalizeDocumentPath`; `[]`→omitted),
  `docs/specs/unit-ms4-id-prefixing.md` (the `<name>:` prefix + INV-3), and
  `docs/specs/unit-t-markdown-import.md` (the import seam + fail-state
  messages). This unit is the review's **U-D3** row: import path derivation +
  the path-qualified `/`-joined id scheme.
- **Scope:** exactly ONE source file — `src/main/markdown-import.ts`:
  1. a NEW `sanitizeSegment` for directory segments (the SAME charset rule as
     `sanitizeDocumentId` but WITHOUT the `.md`/`.markdown` extension
     stripping — M4; `sanitizeDocumentId` is NOT relaxed);
  2. derive `documentPath` = the sanitized corpus-relative DIRECTORY segments
     (no basename) from the LOGICAL path (`abs` relative to the logical
     `corpusRoot`, NOT realpath — M5); normalize `path.sep`→`/`; an empty
     relative dir (a file at the corpus root) ⇒ `documentPath = []` (stored as
     absent);
  3. mint `documentId = [...documentPath, sanitizedBasename].join('/')`
     (default store) / `'<name>:' + [...documentPath, sanitizedBasename].join('/')`
     (non-default store — the `<name>:` prefix applied to the WHOLE joined path
     exactly once);
  4. set `documentPath` on the document ROOT node before it is stored
     (root-level ⇒ omitted/undefined; nested ⇒ the sanitized segments);
  5. the F2 duplicate / F3 empty-segment / F4 containment / F5 prefix / F6 A1
     fail-states on the FINAL `/`-joined id, plus the NEW **aliasing**
     fail-state (M10), the Unicode + separator policies, and the F9 flat-corpus
     byte-equality acceptance criterion.
- **DELIBERATE EXCLUSIONS (the ratified decomposition splits these out — this
  unit implements NONE of them):**
  - **U-D1 — the store model (`documentPath`/`tags` fields, validation,
    normalization, hash-source).** LANDED. U-D3 consumes the field; its only
    `rag-store.ts` change is the AUTHORIZED read-path absence refinement (see
    §3a/RCA-10 C1) — the existing `validateNodeShape`/
    `normalizeDocumentPath` still validates/normalizes whatever the importer
    sets.
  - **U-D2 — journal invertibility.** LANDED.
  - **U-D4 — the doc-heads listing + derived tree + read-surface backfill.**
    `RagDocHeadsPayload.path`/`tags`, `handleRagDocHeadsIpc`, the pure
    prefix-grouping tree helper, and the display-only backfill (M7/M13) are
    U-D4. U-D3 does NOT read `documentPath` for display.
  - **U-D5 — the MCP read tool `rag.list_documents`.** U-D5.
  - **U-D6 — `rag.query`/`rag-stream` document filters.** U-D6.
  - **U-D7 — the tag write op `edit.set_doc_meta`.** U-D7. U-D3 adds NO write
    op; the path is import-minted and immutable in v1.
  - **U-D8 / ui-overhaul G2 — the doc-nav tree UI.** Moved to ui-overhaul G2
    (ratified 2026-09-11); NOT part of this slice.
  - **`src/main/markdown-parse.ts` — NO code change.** The parser interpolates
    whatever `documentId` it is given; its interpolation sites are a
    VERIFIED-BY-TESTS census (§5.8). The `/`-bearing id flows through unchanged.
  - **`src/main/rag-store.ts` — one READ-PATH refinement only (RCA-10 C1,
    AUTHORIZED 2026-09-11).** The U-D1 helpers handle the field. The only change
    is the absence discipline: `toPublicNode` (and `adjacency.copyNode`) OMIT
    `documentPath`/`tags` when undefined (conditional spread), so an absent field
    has no own property (§5.4). Hashes are UNCHANGED (they derive from
    `nodeSource`/the stored record, not the public copy); `validateNodeShape`/
    `normalizeDocumentPath` are unchanged.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, normalization rule, happy-path state, and fail-state below is
  derivable from this spec ALONE. The TestWriter writes the red set for
  `src/main/markdown-import.ts` (the new `sanitizeSegment`, the `documentPath`
  derivation, the `/`-joined `documentId` mint, the alias map, and the
  unchanged-shape fail messages) from §5.6/§5.7 before any implementation, using
  the Unit T temp-file corpus fixture pattern
  (`tests/unit-t-markdown-import.test.ts:35-47`). The red set needs NO Electron
  and NO new registry wiring.

---

## 1. What the proposal asks

The document directory/category slice needs each imported document to carry its
**corpus-relative directory** and to be **addressable by a path-qualified id**
that resolves the motivating repeated-basename collision. This unit lands the
import half of Q1/M1:

1. **`documentPath` derivation.** For each imported file, derive the
   corpus-relative DIRECTORY segments (no basename) — `a/readme.md` under corpus
   root R ⇒ `documentPath = ['a']`; a file at the corpus root ⇒ `[]` (stored as
   absent via U-D1's `normalizeDocumentPath`). Derive from the LOGICAL path
   (`abs` relative to the logical `corpusRoot`), NOT the realpath (M5). Normalize
   `path.sep`→`/`.
2. **Per-segment sanitization.** A NEW `sanitizeSegment` applies the SAME
   charset rule as `sanitizeDocumentId` (`[^a-zA-Z0-9._-]+` → `-`, strip
   leading/trailing `-`) but does NOT strip `.md`/`.markdown` (M4). The basename
   still uses `sanitizeDocumentId` (which strips the extension). Segments are
   sanitized individually, then joined with `/`.
3. **Path-qualified `documentId`.** Default store:
   `documentId = [...documentPath, sanitizedBasename].join('/')`. Non-default
   store: `'<name>:' + [...documentPath, sanitizedBasename].join('/')` — the
   `<name>:` prefix is UNCHANGED and applied to the WHOLE joined path exactly
   once. `a/readme` and `b/readme` are distinct (the repeated-basename fix).
4. **Set `documentPath` on the document root.** The document ROOT node (the
   parser's synthetic `div`, id === `documentId`) carries the sanitized segments
   before it is stored; a root-level document carries none.
5. **Fail-states + policies (M1/M4/M5/M6/M10).** F2 duplicate on the final
   `/`-joined id; F3 empty segment (byte-pinned); F4 containment unchanged
   (realpath `isWithin`); F5 two stores stay distinct via `<name>:`; F6 A1 on
   the final id (unchanged shape); **aliasing** (two distinct raw directory
   segments at the same position in one import call sanitizing to the same
   segment ⇒ REJECT the whole import); Unicode (no NFC/NFD, case-SENSITIVE);
   separator normalization; and **F9 flat-corpus byte-equality** (binding).
6. **No parser change.** `markdown-parse.ts` interpolates the given
   `documentId`; every minted id inherits the `/`-bearing id mechanically
   (§5.8 census).

## 2. Feasibility verdict

**Feasible — a contained change inside one already-landed module.**

- **The minting seam is a single call.** `parseMarkdown(markdown, documentId)`
  takes the documentId as an INPUT (`markdown-parse.ts:617-620`); all node/edge
  ids are minted by interpolating it (`:444,448,558,565,576,596,602-606,609`).
  Changing the INPUT string changes every derived id mechanically — no parser
  edit.
- **The store accepts `/`-bearing ids.** `validateNodeShape` requires only a
  non-empty string id; `documentPath` is validated as an array of non-empty
  strings (U-D1, `rag-store.ts:440-445`). A `/`-bearing id and a non-empty
  segment array pass write-time validation unchanged.
- **The field already has a normalize/copy discipline.** U-D1's
  `normalizeDocumentPath` (`rag-store.ts:411`) turns `[]`→`undefined` and copies
  the array at write time (`:464`, `:833`), so the importer may set the raw
  sanitized segments and rely on the store to canonicalize them.
- **The path machinery already exists.** `abs = resolve(corpusRoot, file)`
  (`markdown-import.ts:234`) and the realpath containment seam
  (`:252-279`) are landed (U-MS4). U-D3 only adds `dirname`/`relative` over the
  LOGICAL pair and a per-segment sanitize — no new containment code.
- **No engine gap.** The derivation, the id mint, and the alias check are
  entirely host-side (`src/main/markdown-import.ts`); the parser, the store, and
  the doc-flow validation are reused unchanged. No `docs/defects.md` /
  `docs/HANDOFF.md` item is expected.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `sanitizeSegment` (charset without extension stripping) | Project-specific | Low cost; keeps `sanitizeDocumentId` unrelaxed (M4) while sanitizing directory segments correctly. |
| Logical-path `documentPath` derivation (`dirname`/`relative`/`sep`) | Project-specific | Low cost; avoids symlink-path disclosure (M5); `''`→`[]` avoids the naive `['']` F3 false-fail. |
| Path-qualified `/`-joined `documentId` + root `documentPath` set | Project-specific | Low cost; resolves the repeated-basename collision; flat corpora stay byte-equal (Q1/M1). |
| The aliasing fail-state (M10) | Project-specific | Low/medium cost; one new byte-pinned message + a per-import per-depth map; prevents a silent derived-tree merge of distinct raw directories. |
| Unicode/separator policies | Project-specific | Low cost; pins ASCII-collapse, case-sensitivity, `path.sep` normalization, and in-filename separators. |
| F9 flat-corpus byte-equality | Project-specific | Binding acceptance criterion; the flat path must be a no-op (M1). |

No engine gap. The doc-heads listing/tree/backfill (U-D4), the MCP read tool
(U-D5), the query filters (U-D6), the `edit.set_doc_meta` write op (U-D7), and
the UI (G2) are LATER units — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — **RUN 2026-09-11**. The known edge cases
this unit's contract pins (so the adversarial pass must NOT regress them); the
pass results are recorded at the end of this section:

- **A1 — F3 empty directory segment.** A directory segment that sanitizes to
  `''` (e.g. `!!!/readme.md`, or a wholly non-ASCII directory such as
  `日本語/readme.md`) is REJECTED with the byte-pinned
  `markdown import: empty documentPath segment for file: <file>`; no node/edge
  is applied. A root-level file (no directory segments) is NOT an empty-segment
  failure.
- **A2 — aliasing (M10).** Two DIFFERENT raw directory segments UNDER THE SAME
  SANITIZED PARENT PATH in one import call that sanitize to the SAME segment
  (e.g. `a!x/x.md` and `a?x/y.md` ⇒ both depth-0 `a-x`) REJECT the WHOLE import
  with the byte-pinned alias message — even when their final documentIds differ
  (`a-x/x` ≠ `a-x/y`) and F2 would not fire. The same raw segment repeated under
  the same parent (two files in `a/`) is NOT an alias. An adversarial probe must
  confirm no partial application and that the alias map is per-import-call only.
  **RCA-10 re-pin (Architect, 2026-09-11):** an earlier example used `a!`/`a?`,
  which sanitize to `a` (the trailing `-` is stripped by `sanitizeSegment`), so
  the literal `a-` was unsatisfiable; the example was changed to an interior-dash
  value (`a!x`/`a?x` ⇒ `a-x`).
  **ADV-1 resolution (Implementer, 2026-09-11, HOST):** the alias map is scoped
  to the SANITIZED PARENT PATH, not merely the depth. The original depth-keyed
  map (`Map<number, Map<string, string>>`) wrongly rejected two distinct parents
  at the same depth whose child segment sanitized identically (e.g.
  `docs/2024!` and `specs/2024?` — both depth-1 `2024`) even though their final
  ids differ (`docs/2024/x` ≠ `specs/2024/y`) and no derived-tree merge occurs.
  The map now keys on `documentPath.join('/')` at the current position, so two
  raws alias only when they sanitize to the same segment under the same
  sanitized ancestor path. The message bytes/order (`priorRaw` then `raw`,
  `position <depth>`) are unchanged. Regression set:
  `tests/unit-ud3-import-path-id-scheme-adversarial.test.ts` (6 tests).
- **A3 — Unicode policy.** No NFC/NFD normalization; ids are case-SENSITIVE
  (`A/readme` ≠ `a/readme`). A non-ASCII segment collapses under the ASCII-only
  charset (`café` → `caf`); collapsing to `''` → the A1/F3 reject. A probe must
  confirm a decomposed vs composed non-ASCII directory does NOT alias unless the
  sanitized results coincide.
- **A4 — separator handling.** `path.sep` is normalized to `/` before
  splitting; a literal `\` (POSIX filename char) or `/` inside a segment maps to
  `-` via the charset rule; a segment is never empty from a separator. A probe
  must confirm a Windows-style backslash segment and a root-level file both
  behave.
- **A5 — F9 flat-corpus byte-equality (binding).** A flat corpus re-imports to
  byte-identical ids/nodes: `documentId === sanitizedBasename`, no root
  `documentPath` property, identical hashes/journal/result. A probe must import
  the SAME flat corpus with and without the U-D3 path code and compare bytes.
- **A6 — F5/F6 unchanged.** Two stores importing `a/readme.md` stay distinct
  (`a/readme` vs `S:a/readme`); the A1 collision check runs on the final joined
  id. Because registered store names are slash-free, a path-qualified id
  (containing `/`) can never equal a store name — so F6 only fires for flat
  root-level ids.
- **A7 — F4 containment unchanged.** A symlink escaping the corpus root is
  still rejected by `isWithin(real, corpusRootReal)`; the DERIVED `documentPath`
  uses the LOGICAL path, so a symlinked directory inside the root keeps its
  logical name while an escaping one is rejected before derivation.
- **A8 — root-level `''`→`[]`.** `dirname(relative(R, R/readme.md))` is `.`,
  yielding `documentPath = []` (NOT `['']`, which F3 would reject).
- **A9 — parser no-change census.** `src/main/markdown-parse.ts` is byte-for-byte
  unmodified; every minted id inherits the `/`-bearing id via interpolation
  (§5.8).
- **A10 — F2 on the final id.** A duplicate `/`-joined (and, for non-default
  stores, `<name>:`-prefixed) documentId is rejected with the EXISTING duplicate
  message shape, echoing the FINAL id.

Any host finding is fixed here + regression-tested; any `provident-ssr` package
finding → `docs/defects.md`/`docs/HANDOFF.md` (none expected).

- **RCA-10 C1 (Architect-authorized, 2026-09-11) — the `toPublicNode` absence
  discipline.** The §5.4 "no `documentPath: undefined` own-property" pin was
  incompatible with the landed U-D1 read path, which emitted an own
  `documentPath: undefined` (U-D1 §5.3 "preserving `undefined`"). The Architect
  authorized the refinement: `rag-store.ts` `toPublicNode` and
  `adjacency.copyNode` now OMIT `documentPath`/`tags` when undefined via a
  conditional spread. Hash behavior is unchanged (`nodeSource`/the stored record
  are unaffected). This converts the DELIBERATE-EXCLUSIONS "NO change" claim and
  §5.4's "No `rag-store.ts` change" bullet into the authorized read-path
  refinement. Verified by the U-D3 §5.6 root-level/flat-corpus absence guards
  (tests 3/6/11).

**Adversarial pass (RCA-3, 2026-09-11, post-green):** no CRITICAL/HIGH/MEDIUM
defect; no PACKAGE finding.

- **ADV-1 (LOW, HOST — FIXED + regression-tested):** the alias map was keyed by
  DEPTH only, so two different raws at the same depth under DIFFERENT parents
  (e.g. `a-x/2024!` and `b-x/2024?`, or `docs/2024/` + `specs/2024/`) were
  wrongly rejected as an alias. FIXED: the map is keyed by the SANITIZED PARENT
  PATH, so an alias fires only among segments sharing the same sanitized
  ancestor. Regression `tests/unit-ud3-import-path-id-scheme-adversarial.test.ts`
  (6 tests; 1 red → green). §5.5/§3a A2 amended.
- **ADV-2 (INFO, HOST — spec text):** the F3-vs-alias precedence is per-depth
  (interleaved in the segment loop), not whole-file F3-first; the spec's reference
  snippet matches the code. Clarified.
- **ADV-3 (INFO, HOST — pre-existing, latent):** `sanitizeDocumentId` can mint a
  `.`/`..` id segment from a basename (`...md`→`..`). No consumer treats
  `documentId` as a path. Recorded in `docs/defects.md` as
  **HOST-DOCID-DOT-SEGMENT** (out of U-D3).
- **ADV-4 (INFO, HOST):** a non-default store name containing `/` is a
  caller-contract violation (the registry guarantees slash-free names); no code
  change.
- **ADV-5 (INFO):** `adjacency.copyNode` still drops `nodeKind` — already
  catalogued as `HOST-SNAPSHOT-COPY-NODEKIND`.
- **ADV-6 (DOC):** stale pre-U-D3 line refs + the unfilled trackers/§3a; closed
  by the RCA-6 doc review.

### 3b. Proposal-review findings

The proposal-review gate returned **PROCEED-WITH-AMENDMENTS** for the document
directory/category proposal (`docs/decisions.md` row
**DOC-DIRECTORY-CATEGORY-GATE**, 2026-09-11;
`docs/specs/document-directory-category-review.md`). The amendments THIS unit
pins (each cross-referenced to the section that resolves it):

- **M1 — pin `documentPath` (directory-only)** (§5.1/§5.3):
  `documentId = [...documentPath, basename].join('/')`; `[]` at root.
- **M4 — do not relax `sanitizeDocumentId`** (§5.1): a separate
  `sanitizeSegment` without extension-stripping; sanitize per segment, join with
  `/`.
- **M5 — pin canonical path derivation** (§5.2): `''`⇒`[]`; normalize
  `path.sep`; derive from the logical path (not realpath); containment still
  rejects `..`/absolute escapes.
- **M6 — correct the minting census** (§5.8): the full parser-census set plus
  the importer mint sites; derived ids inherit a `/`-bearing id via
  interpolation.
- **M10 — new fail-states** (§5.5): aliasing as an explicit fail-state;
  Unicode; non-ASCII→`''`; the separator policy.
- **Q1 — path-qualified `/`-joined `documentId`** (§5.2): the ratified form.

**Documentation reconciliation (RECONCILED 2026-09-11):** the GATED parent
`docs/specs/document-directory-category.md` §3.2 line 107 now reads
`sanitizeSegment(segment)` (the `(M4 / U-D3)` annotation), so the earlier
conflict with M4 and this spec's `sanitizeSegment` is resolved. The gate review
(M4) and this spec remain authoritative.

## 4. Design decisions pinned by this spec

- **DOC-DIRECTORY-CATEGORY-GATE (consumed):** Q1 path-qualified `/`-joined
  `documentId` with directory-only `documentPath` (`[]` at root); M4 per-segment
  sanitize without relaxing `sanitizeDocumentId`; M5 logical-path derivation +
  `''`→`[]`; M6 the corrected minting census; M10 the aliasing/Unicode/separator
  fail-states. No new node/edge kind, no persisted `documents:` section.
- **STORE-ID-PREFIX (consumed, landed):** the `<name>:` prefix is applied to the
  WHOLE joined path exactly once for non-default stores; segments are colon-free
  (the charset maps `:`→`-`), so the first-`:`-segment INV-3 rule survives
  (`S:a/readme`'s first segment is `S`). The default store's output stays
  UNPREFIXED.
- **IMPORT-ROOT-PER-STORE (consumed, landed):** `abs = resolve(corpusRoot,
  file)` and the realpath containment seam are reused UNCHANGED; the DERIVED
  `documentPath` is logical-path-only.
- **U-D1 `documentPath` field (consumed, landed):** the importer sets sanitized
  non-empty segments on the document root; `[]` is never set (the property is
  absent for a root-level document). The store's `normalizeDocumentPath`
  canonicalizes at write time.
- **ONE-WAY-SNAPSHOT / SINGLE-WRITER-STORE (consumed):** the derivation is a
  read-side computation over the source corpus; the batch still applies as ONE
  atomic journal entry through `ctx.store.applyBatch`.

## 5. The exhaustive contract

### 5.1 `sanitizeSegment` (NEW) — the directory-segment sanitizer

A NEW local function in `src/main/markdown-import.ts`. It applies the SAME
charset rule as `sanitizeDocumentId` but WITHOUT the `.md`/`.markdown`
extension-stripping (M4). `sanitizeDocumentId` is NOT relaxed and remains the
basename sanitizer.

```ts
// src/main/markdown-import.ts — NEW (U-D3). The SAME charset rule as
// `sanitizeDocumentId` (`[^a-zA-Z0-9._-]+` → `-`, then strip leading/trailing
// `-`) but WITHOUT the `.md`/`.markdown` extension-stripping (M4). A directory
// segment's extension is preserved. Returns '' when the segment collapses to
// empty (the F3 reject).
function sanitizeSegment(segment: string): string {
  return segment
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

**The UNCHANGED basename sanitizer (pinned — do NOT relax):**

```ts
// src/main/markdown-import.ts — UNCHANGED (M4). Strips `.md`/`.markdown`, then
// the charset rule. Used for the BASENAME only.
function sanitizeDocumentId(basenameNoExt: string): string {
  const cleaned = basenameNoExt
    .replace(/\.markdown$/i, '')
    .replace(/\.md$/i, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned
}
```

**Sanitization rules (pinned):**

- **Charset:** every run of characters outside `[a-zA-Z0-9._-]` is replaced with
  a single `-`; leading/trailing `-` runs are then stripped.
- **Extension:** `sanitizeSegment` does NOT strip `.md`/`.markdown` (a directory
  named `notes.md` keeps `notes.md`); `sanitizeDocumentId` on the basename DOES.
- **Empty result:** a segment that sanitizes to `''` is the F3 empty-segment
  fail-state (§5.5).
- **Colon-free:** `:` is outside the charset, so a segment can never contain `:`
  (the `<name>:` prefix separator is preserved — INV-3).
- **Slash/backslash:** `/` and `\` are outside the charset and map to `-` (a
  segment never contains a separator after the split).
- **Unicode:** no NFC/NFD normalization; non-ASCII characters collapse to `-`
  (then a leading/trailing `-` is stripped). Case is SENSITIVE.

### 5.2 `documentPath` derivation (NEW) — the logical corpus-relative directory

The importer derives the raw directory segments from the LOGICAL path — `abs`
(the already-resolved `resolve(corpusRoot, file)`, `markdown-import.ts:234`)
relative to the LOGICAL `corpusRoot` — NOT the realpath (M5). This avoids
symlink-path disclosure: a symlinked directory inside the root keeps its logical
name.

```ts
// src/main/markdown-import.ts — NEW (U-D3). The corpus-relative DIRECTORY
// segments of `abs` under the LOGICAL `corpusRoot`, native separators
// normalized to `/`. The basename is NOT a member. A file at the corpus root
// yields [] (`dirname` is `.`), NOT [''].
function deriveDocumentPath(abs: string, corpusRoot: string): string[] {
  const relDir = dirname(relative(corpusRoot, abs))
  const normalized = relDir.split(sep).join('/')
  if (normalized === '.' || normalized === '') return []
  return normalized.split('/')
}
```

The import line gains `dirname` and `relative`:

```ts
import { basename, dirname, relative, resolve, sep } from 'node:path'
```

**Derivation rules (pinned):**

- **Logical, not realpath:** derived from `abs` and the logical `corpusRoot`;
  the realpath pair (`real`/`corpusRootReal`) is used ONLY for containment.
- **No basename:** the final path component (the file) is NOT a member of
  `documentPath` (M1). `a/readme.md` ⇒ `['a']`.
- **`''`⇒`[]`:** a file at the corpus root ⇒ `[]` (stored as absent); the naive
  `['']` is forbidden (it would fail F3 on every root-level file — M5).
- **Separator normalization:** `path.sep`→`/` before splitting; segments are
  joined with `/`.
- **No `..`:** `abs` is logically contained in `corpusRoot` (the
  `:238-240` check precedes), and `resolve` normalizes `..`, so a derived
  segment is never `..`. An absolute/`..` escape is rejected by the UNCHANGED
  containment check (F4), never by the derivation.
- **Symlink policy:** a symlink escaping the root is rejected by
  `isWithin(real, corpusRootReal)` (`:268`) before the derivation runs; a
  symlink inside the root is allowed and its LOGICAL (link) name is used in
  `documentPath`.

### 5.3 The `documentId` mint — `/`-joined + the `<name>:` prefix

```ts
// src/main/markdown-import.ts — NEW (U-D3). The per-file derivation + mint.
// (Placement within the existing pipeline is pinned in §5.4.)
const rawSegments = deriveDocumentPath(abs, corpusRoot)
const documentPath: string[] = []
for (let depth = 0; depth < rawSegments.length; depth++) {
  const raw = rawSegments[depth]
  const seg = sanitizeSegment(raw)
  if (seg === '') {
    return { ok: false, error: `markdown import: empty documentPath segment for file: ${file}`, failedFile: file }
  }
  // aliasing (§5.5, ADV-1): two DIFFERENT raw segments UNDER THE SAME SANITIZED
  // PARENT PATH in one import call that sanitize to the SAME segment are an
  // explicit fail-state.
  const parentKey = documentPath.join('/')
  const seenUnderParent = segmentAliasByParent.get(parentKey) ?? new Map<string, string>()
  const priorRaw = seenUnderParent.get(seg)
  if (priorRaw !== undefined && priorRaw !== raw) {
    return {
      ok: false,
      error: `markdown import: path segment alias at position ${depth}: ${jsonOf(priorRaw)} and ${jsonOf(raw)} both sanitize to ${jsonOf(seg)}`,
      failedFile: file,
    }
  }
  seenUnderParent.set(seg, raw)
  segmentAliasByParent.set(parentKey, seenUnderParent)
  documentPath.push(seg)
}

const base = sanitizeDocumentId(basename(file))
if (base === '') {
  return { ok: false, error: `markdown import: empty documentId for file: ${file}`, failedFile: file }
}
const joinedId = [...documentPath, base].join('/')
// A1 (unchanged shape; now on the WHOLE joined id) — default-store only.
if (snapIsDefault && Array.isArray(snapReservedNames) && snapReservedNames.includes(joinedId)) {
  return {
    ok: false,
    error: `markdown import: documentId collides with a registered store name: ${joinedId}`,
    failedFile: file,
  }
}
// The `<name>:` prefix applied to the WHOLE joined path EXACTLY ONCE.
const documentId = store != null && !snapIsDefault ? `${snapName}:${joinedId}` : joinedId
if (seenIds.has(documentId)) {
  return { ok: false, error: `markdown import: duplicate documentId: ${documentId}` }
}
seenIds.add(documentId)
```

**Mint rules (pinned):**

- **Default store:** `documentId === [...documentPath, base].join('/')`
  (`base` = `sanitizeDocumentId(basename(file))`). A flat corpus ⇒
  `documentId === base` (byte-equal today — F9).
- **Non-default store:** `documentId === \`${snapName}:${joinedId}\`` — the
  `<name>:` prefix is applied to the WHOLE joined path EXACTLY ONCE; the
  `<name>:` shape is UNCHANGED from U-MS4. `S:a/readme`.
- **Duplicate check:** on the FINAL (prefixed) `documentId`; the message echoes
  the final id (shape unchanged — F2).
- **A1 check:** on the WHOLE `joinedId` (the final string for the default store);
  message shape unchanged (F6). Store names are slash-free, so a path-qualified
  id can never collide; F6 only fires for flat root-level ids.
- **INV-3 survives:** `S:a/readme`'s first `:`-segment is `S`; segments are
  colon-free (the charset maps `:`→`-`).
- **Distinctness:** `a/readme` ≠ `b/readme` (the motivating collision fix);
  `a/readme` ≠ `S:a/readme` (F5).

### 5.4 Setting `documentPath` on the document root

After `parseMarkdown(content, documentId)` returns, the importer sets the
sanitized segments on the document ROOT node — the node whose `id ===
documentId` (the parser's synthetic root `div`, `markdown-parse.ts:558`) —
before the document is pushed for validation/batch:

```ts
const parsed = parseMarkdown(content, documentId)
if (documentPath.length > 0) {
  const rootNode = parsed.nodes.find((n) => n.id === documentId)
  if (rootNode) rootNode.documentPath = [...documentPath]
}
documents.push({ documentId, parsed, file })
```

**Root-set rules (pinned):**

- **Root only:** only the node with `id === documentId` (the document root)
  carries `documentPath`; section/block/doc-child nodes do NOT.
- **Root-level ⇒ absent:** when `documentPath` is `[]`, the property is NOT set
  (no `documentPath: []`, no `documentPath: undefined` own-property) — F9
  byte-equality.
- **Copy:** the array set on the root is a copy (`[...documentPath]`), and the
  store deep-copies/normalizes it at write time (U-D1).
- **Before storage:** the set happens BEFORE the doc-flow validation loop and
  the batch build, so the value rides the `putNode` ops.
- **`rag-store.ts` read-path refinement (RCA-10 C1, AUTHORIZED):** only
  `toPublicNode` (and `adjacency.copyNode`) omit `documentPath`/`tags` when
  undefined so the §5.4 absent-means-absent own-property pin holds; the write
  helpers `validateNodeShape`/`normalizeDocumentPath` are UNCHANGED and hashes
  are unaffected (derived from `nodeSource`/the stored record).

**The per-file pipeline (pinned order; only steps 4f/4h/4i/4j/4k/4m change):**

1. Files guard (`:137-139`) — UNCHANGED.
2. Store-context validation SC1–SC5 (`:145-170`) — UNCHANGED.
3. Corpus-root guard + resolve (`:191-211`) — UNCHANGED.
4. Per file (`:225-362`):
   a. empty-path guard (`:226-228`) — UNCHANGED.
   b. `const abs = resolve(corpusRoot, file)` (`:234`) — UNCHANGED.
   c. logical containment (`:238-240`) — UNCHANGED (F4).
   d. NUL probe + stat + directory rejection (`:248-260`) — UNCHANGED.
   e. realpath + containment + read the realpath'd path (`:265-279`) —
      UNCHANGED (F4).
   f. **NEW — derive + sanitize `documentPath`** (`:285-315`; §5.2/§5.3):
      empty-segment F3, then aliasing.
   g. `const base = sanitizeDocumentId(basename(file))` (`:316`) — the
      empty-documentId check immediately after is UNCHANGED
      (`markdown import: empty documentId for file: <file>`).
   h. `joinedId = [...documentPath, base].join('/')` (`:323`) — NEW.
   i. A1 collision check (`:332-338`) — shape UNCHANGED, predicate now on
      `joinedId`.
   j. prefix mint (`:345`) — now `'<name>:' + joinedId`.
   k. duplicate check (`:348-350`) — shape UNCHANGED, on the final id.
   l. `parseMarkdown(content, documentId)` (`:352`) — UNCHANGED call.
   m. **NEW — set `documentPath` on the root node** (`:357-360`; §5.4).
   n. `documents.push(...)` (`:361`).
5. Doc-flow validation loop (`:365-374`) — UNCHANGED.
6. Batch build + `applyBatch` + success return (`:378-396`) — UNCHANGED.

**Failure precedence (pinned):** the FIRST file (in `files` order) that triggers
a fail-state determines the result; the WHOLE import is rejected with no partial
application (the Unit T A5 discipline). Within one file: F3 empty-segment →
aliasing → basename empty → F6 A1 → F2 duplicate.

### 5.5 The fail-state matrix (F2–F6 + aliasing + Unicode + sep + F9)

| # | Case | Pinned behavior / byte-pinned message |
| --- | --- | --- |
| **F2** | duplicate `/`-joined `documentId` across the corpus | REJECT; EXISTING shape `markdown import: duplicate documentId: <final-id>` (no `failedFile`) — now on the `/`-joined (and, non-default, `<name>:`-prefixed) id. |
| **F3** | a directory segment sanitizes to `''` | REJECT; **NEW** `markdown import: empty documentPath segment for file: <file>`, `failedFile: file`. |
| **F3b** | a basename sanitizes to `''` | REJECT; EXISTING shape `markdown import: empty documentId for file: <file>`, `failedFile: file` (unchanged). |
| **F4** | a `..`/absolute path (or symlink) escaping the corpus root | REJECT by the UNCHANGED containment: logical `isWithin(abs, corpusRoot)` and realpath `isWithin(real, corpusRootReal)` → `markdown import: path outside corpus root: <file>`, `failedFile: file`. |
| **F5** | two stores import the same relative path | DISTINCT via the `<name>:` prefix (`a/readme` vs `S:a/readme`) — positive, unchanged. |
| **F6** | the final `documentId` equals a registered store name | REJECT; EXISTING shape `markdown import: documentId collides with a registered store name: <joinedId>`, `failedFile: file` (A1, default-store only). |
| **alias** | two DIFFERENT raw directory segments UNDER THE SAME SANITIZED PARENT PATH in one import call sanitize to the SAME segment | REJECT the WHOLE import; **NEW** `markdown import: path segment alias at position <depth>: ${jsonOf(priorRaw)} and ${jsonOf(raw)} both sanitize to ${jsonOf(seg)}`, `failedFile: file`. `depth` is 0-based (the message's position is the depth within the aliasing parent's path). |
| **Unicode** | non-ASCII segment / case variants | No NFC/NFD; case-SENSITIVE. Non-ASCII collapses under the charset (`café`→`caf`); a full collapse ⇒ the F3 reject. |
| **sep** | native separator / in-filename `\`/`/` | `path.sep`→`/` before splitting; an in-segment `\`/`/` maps to `-`; a segment is never empty from a separator. |
| **F9** | flat corpus re-import | **BINDING:** byte-identical to today — `documentId === sanitizedBasename`, no root `documentPath`, identical node/edge ids, hashes, journal, result. |

**Aliasing scope (pinned, ADV-1):** the alias map is per IMPORT CALL (a fresh
`Map<string, Map<string, string>>` declared immediately before the per-file
loop, mapping the SANITIZED PARENT PATH — `documentPath.join('/')` at the
current position — → sanitized-segment → first raw segment). It tracks
DIRECTORY segments only (basename collisions are F2). Two files that share the
IDENTICAL raw directory segment (e.g. `a/x.md`, `a/y.md`) are NOT an alias. The
same sanitized child under DIFFERENT sanitized parents is NOT an alias (their
final ids differ and no derived-tree merge occurs); the alias fires only among
segments sharing the same sanitized ancestor path. Each parent path is checked
independently.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Nested file → path-qualified id + `documentPath`:** importing `a/readme.md`
   under corpus root R ⇒ `{ ok: true, documentIds: ['a/readme'] }`; the document
   root node has id `a/readme` and `documentPath: ['a']`; the section/block ids
   inherit the `/` id (`a/readme:section:1`, `a/readme:p:1`); the edge id embeds
   it (`e-a/readme-1`).
2. **Multi-level nesting:** `a/b/c.md` ⇒ `documentPath: ['a','b']`,
   `documentId: 'a/b/c'`; the ids are `a/b/c:section:1`, etc.
3. **Root-level file is unchanged:** `readme.md` ⇒ `documentPath` absent on the
   root; `documentId: 'readme'` (byte-equal today).
4. **Repeated basenames are distinct (the motivating case):** importing
   `a/readme.md` + `b/readme.md` ⇒ `documentIds: ['a/readme','b/readme']`; both
   roots carry their own `documentPath`; no duplicate fail-state.
5. **Non-default store:** importing `a/readme.md` with a non-default store `S`
   ⇒ `documentId: 'S:a/readme'`, root `documentPath: ['a']`; the first
   `:`-segment of every minted id is `S` (INV-3).
6. **Flat-corpus byte-equality (F9, binding):** a flat corpus (`a.md`, `b.md`)
   imports to `documentIds: ['a','b']`; both roots have no `documentPath`
   property; every node/edge id equals the pre-U-D3 value; the root hash equals
   the hash of a node without `documentPath`.
7. **Segment charset:** `A B/c.md` ⇒ `A-B/c`; `a.b/c.md` ⇒ `a.b/c`; case is
   preserved (`A` ≠ `a`).
8. **Directory extension preserved (M4):** `notes.md/x.md` ⇒
   `documentPath: ['notes.md']`, `documentId: 'notes.md/x'` (the directory's
   `.md` is NOT stripped; the basename's is).
9. **Unicode collapse (non-empty):** `café/x.md` ⇒ `documentPath: ['caf']`,
   `documentId: 'caf/x'`; `A/x.md` and `a/x.md` mint distinct ids.
10. **Separator mapping (POSIX):** a directory whose logical name contains a
    backslash (`a\b/x.md`) ⇒ the segment `a-b`; `path.sep` is normalized before
    the split.
11. **`documentPath` on the root only:** a nested document's section node,
    block node, and inline children do NOT carry `documentPath`.
12. **Same directory, two files:** `a/x.md`, `a/y.md` ⇒ both roots carry
    `documentPath: ['a']`; ids `a/x`, `a/y`; no alias (identical raw segment).
13. **Result echoes the final ids:** `{ ok: true, documentIds }` returns the
    `/`-joined (and, non-default, prefixed) ids; `nodeCount`/`edgeCount` are the
    batch size (unchanged).
14. **Deduping across directories does not fire F2:** `a/readme.md` +
    `b/readme.md` import together (distinct ids).
15. **`documentPath` rides the batch:** after a successful nested import,
    `ctx.store.getNode('<joined id>').documentPath` equals the sanitized
    segments (the store normalized/copied them).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **F2 — duplicate final id:** two files that resolve to the same
   `/`-joined id (e.g. `a/readme.md` twice) ⇒ `{ ok: false, error: 'markdown
   import: duplicate documentId: a/readme' }` (no `failedFile`); no node/edge
   applied.
2. **F3 — empty directory segment:** `!!!/readme.md` ⇒ `{ ok: false, error:
   'markdown import: empty documentPath segment for file: <file>', failedFile:
   <file> }`; no node/edge applied.
3. **F3 — non-ASCII segment collapsing to `''`:** `日本語/readme.md` ⇒ the F3
   empty-segment message (the segment sanitizes to `''`).
4. **F3b — empty basename:** `a/!!!.md` ⇒ the EXISTING
   `'markdown import: empty documentId for file: <file>'` with `failedFile`;
   no node/edge applied.
5. **F4 — containment unchanged:** a file outside the corpus root (absolute or
   `..`) ⇒ the EXISTING `'markdown import: path outside corpus root: <file>'`
   with `failedFile`; no derivation runs.
6. **Aliasing:** `a!x/x.md` + `a?x/y.md` (both depth-0 `a-x`; the first imported
   is the prior) ⇒ `{ ok: false, error: 'markdown import: path segment alias at
   position 0: "a!x" and "a?x" both sanitize to "a-x"', failedFile: <second
   file> }`; the WHOLE import is rejected (even though `a-x/x` ≠ `a-x/y`).
7. **Alias at a deeper position:** `a/b!x/x.md` + `a/b?x/y.md` (both depth-1
   `b-x`) ⇒ the alias message with `position 1`; a depth-0 distinct pair is NOT
   affected.
8. **F6 — A1 collision on a flat joined id:** default store with
   `reservedNames: ['readme']` importing `readme.md` ⇒ the EXISTING
   `'markdown import: documentId collides with a registered store name:
   readme'` with `failedFile`; a NESTED `a/readme.md` (joined id `a/readme`)
   does NOT collide (slash-free store names).
9. **Unicode no normalization:** a composed `café/x.md` sanitizes its dir segment
   to `caf` (the `é` → `-`, trailing `-` stripped) and a decomposed
   `cafe\u0301/x.md` sanitizes to `cafe` (the combining accent → `-`, trailing
   `-` stripped) — DIFFERENT sanitized segments, so they do NOT alias and both
   import (ids `caf/x`, `cafe/x`). They would alias only if their sanitized
   results coincided. No NFC/NFD normalization is performed.
10. **Alias state is per-call:** a second `importMarkdownCorpus` call with one
    of the aliasing files alone does NOT fail (no cross-call state).

### 5.8 Census / numeric claims (minting sites + message strings)

**The parser interpolation census (COMPLETE — `src/main/markdown-parse.ts` is
NOT changed; every minted id inherits the `/`-bearing `documentId`):**

| Id shape | Mint site | Flat corpus (today, byte-equal) | Nested `a/readme` |
| --- | --- | --- | --- |
| document root node id | `markdown-parse.ts:558` (`makeNode(documentId, 'div', '')`) | `readme` | `a/readme` |
| block node ids | `:444` (`` `${documentId}:${type}:${n}` ``) | `readme:p:1` | `a/readme:p:1` |
| edge ids | `:448` (`` `e-${documentId}-${edgeCounter}` ``) | `e-readme-1` | `e-a/readme-1` |
| section node ids | `:565` (`` `${documentId}:section:${s+1}` ``) | `readme:section:1` | `a/readme:section:1` |
| root `ownedNodeIds` (inherits section ids) | `:576` (`root.ownedNodeIds = [...sectionIds]`) | `[readme:section:1]` | `[a/readme:section:1]` |
| root parent-child edge source | `:596` (`source: documentId`) | `readme` | `a/readme` |
| doc-head/doc-end/next-section `documentIds` + targets/sources | `:602-606` (`documentIds: [documentId]`) | `[readme]` | `[a/readme]` |
| returned `ParsedMarkdown.documentId` | `:609` (`return { documentId, ... }`) | `readme` | `a/readme` |

**The importer mint/derivation census (U-D3 changes all four):**

| Site | Before U-D3 | After U-D3 |
| --- | --- | --- |
| `markdown-import.ts:316` | `base = sanitizeDocumentId(basename(file))` | `base` unchanged + `documentPath` derived/sanitized from `deriveDocumentPath(abs, corpusRoot)` |
| `:332-338` (A1) | `snapReservedNames.includes(base)` | `snapReservedNames.includes(joinedId)` |
| `:345` (prefix mint) | `${snapName}:${base}` | `${snapName}:${joinedId}` where `joinedId = [...documentPath, base].join('/')` |
| `:348-350` (duplicate) | on `documentId` | unchanged shape, now a `/`-bearing (and possibly `<name>:`-prefixed) id |
| `:352` (`parseMarkdown`) | call unchanged | call unchanged |
| `:357-361` | — | set `documentPath` on the root node (`id === documentId`) |

**Message-string census (byte-pinned; EXISTING shapes preserved where present):**

| # | Message | Status |
| --- | --- | --- |
| 1 | `markdown import: empty documentPath segment for file: <file>` | **NEW (U-D3)** — F3 directory segment, `failedFile` |
| 2 | `markdown import: path segment alias at position <depth>: <jsonOf(priorRaw)> and <jsonOf(raw)> both sanitize to <jsonOf(seg)>` | **NEW (U-D3)** — aliasing, `failedFile` |
| 3 | `markdown import: duplicate documentId: <final-id>` | EXISTING — now on the `/`-joined/prefixed id (no `failedFile`) |
| 4 | `markdown import: empty documentId for file: <file>` | EXISTING — basename only, unchanged |
| 5 | `markdown import: path outside corpus root: <file>` | EXISTING — F4, unchanged |
| 6 | `markdown import: cannot read file: <file>` | EXISTING — unchanged |
| 7 | `markdown import: documentId collides with a registered store name: <joinedId>` | EXISTING shape — predicate now on `joinedId` |
| 8 | `markdown import: doc-flow validation failed for <documentId>: <reason>` | EXISTING — unchanged shape (the id is now `/`-bearing) |
| 9 | `markdown import: files must be a non-empty array` / `markdown import: empty file path` / `markdown import: invalid store context` / `markdown import: corpusRoot must be a string (got <json>)` | EXISTING — unchanged |

**Other numeric claims (pinned):**

- **Source files changed:** 3 — `src/main/markdown-import.ts` (the unit; plus
  the `node:path` import line), `src/main/rag-store.ts` (`toPublicNode`
  conditional-spread absence — RCA-10 C1), `src/main/adjacency.ts`
  (`copyNode` same). `markdown-parse.ts` 0; MCP/UI 0.
- **New functions:** 2 — `sanitizeSegment`, `deriveDocumentPath`.
- **New runtime maps:** 1 — the per-import-call `segmentAliasByParent`
  (`Map<string, Map<string, string>>`, keyed by the sanitized parent path —
  ADV-1; was depth-keyed).
- **New fields/ops/tools:** 0 — U-D3 adds NO `RagNode` field (U-D1 landed it),
  NO edit op (`edit.set_doc_meta` is U-D7), NO MCP tool (U-D5/U-D6), and NO
  `BatchOp`/`JournalEntry` shape change. The parser-node count and edge count
  are unchanged (the same grammar/chunking rule mints them).
- **`documentPath` members set by the importer:** `[]`⇒absent (root-level), else
  the sanitized non-empty segments (directory-only, no basename).
- **INV-3 colon structure:** non-default ids `S:a/readme:p:1` have first
  `:`-segment `S`; default ids are colon-free.

### 5.9 Cross-references

- **Gate:** `docs/specs/document-directory-category-review.md` (M1/M4/M5/M6/M10,
  the U-D3 row in §5) and `docs/decisions.md` row
  **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11).
- **Parent (GATED):** `docs/specs/document-directory-category.md` §3.2 (the
  path-qualified id scheme), §3.3 (import derivation; flat byte-equality), §4
  (F2–F6/F9), §5 (the minting census + the no-relax-M4 risk). **RECONCILED
  2026-09-11:** §3.2 line 107 now reads `sanitizeSegment(segment)` (M4/U-D3);
  M4 and this spec remain authoritative.
- **Precedent:** `docs/specs/unit-ud1-document-metadata-fields.md` §5.1 (the
  `documentPath` field + `[]`→omitted), §5.3/§5.4 (store normalize/copy);
  `docs/specs/unit-ms4-id-prefixing.md` §5.2 (the minting seam + prefix rule),
  §5.4 (A1), §5.5 (INV-3); `docs/specs/unit-t-markdown-import.md` §5.2 (the
  chunking rule + id scheme), §5.4 (one-way snapshot + containment), §5.7 (the
  fail-state messages this unit extends).
- **Decisions:** `docs/decisions.md` rows **DOC-DIRECTORY-CATEGORY-GATE**,
  **STORE-ID-PREFIX**, **IMPORT-ROOT-PER-STORE**, **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE**, **CHILDREN-ADDITIVE-STORE-FORMAT** (the
  `undefined`-omission additive precedent).
- **Downstream units (NOT this spec):** U-D4 (doc-heads listing/tree/backfill),
  U-D5 (`rag.list_documents`), U-D6 (query filters), U-D7
  (`edit.set_doc_meta`), ui-overhaul G2 (doc-nav tree UI). U-D1/U-D2 are LANDED.
- **Host patterns:** `src/main/markdown-import.ts` (the `sanitizeDocumentId`
  sanitizer, the per-file pipeline, the A1/prefix/duplicate seam — the
  amendment sites), `src/main/markdown-parse.ts:444,448,558,565,576,596,
  602-606,609` (the interpolation census — unmodified),
  `src/main/rag-store.ts:411,440-445,464,833` (the U-D1
  `normalizeDocumentPath`/`validateNodeShape` discipline the root set rides).
- **Page design:** this unit is an import-seam change; it does NOT change any
  page design (no `docs/skills/designing-pages.md` update warranted).
