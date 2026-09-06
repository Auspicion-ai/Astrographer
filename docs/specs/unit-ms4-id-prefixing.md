# Spec — Unit MS4: Store-Id Prefixing at the Import Minting Seam (U-MS4)

- **Status:** SPEC (the multi-store Phase-1 slice, Unit **U-MS4** of 5;
  execution order U-MS1 → U-MS2 → **U-MS4** → U-MS3 → U-MS5). Gate reference:
  `docs/specs/multi-document-store-config-review.md` §2 (decisions **D4** —
  the id-qualification mechanism — and **D11** — the import-root re-point),
  §3 (the unit decomposition table, the U-MS4 row), §4 (the zero-config
  byte-equality table — binding acceptance criteria per A4), §5 (risks **R3**
  — the prefix-namespace hole — and **R7** — the import-root containment
  regression), §8 (amendments **A1**, **A4**, **A5**). Proposal:
  `docs/feature-requests/multi-document-store-config.md` (multi-store Phase-1
  slice, USER-APPROVED 2026-09-05). Decisions: `docs/decisions.md` rows
  **STORE-ID-PREFIX** (`decisions.md:109`) + **IMPORT-ROOT-PER-STORE**
  (`decisions.md:110`) — the two rows this unit lands; consumed context:
  **MULTI-STORE-REGISTRY** (`decisions.md:105`, the name charset U-MS4
  relies on), **SINGLE-WRITER-STORE-PER-STORE** (`decisions.md:106`),
  **ONE-WAY-SNAPSHOT** (`decisions.md:70`), **SINGLE-WRITER-STORE**
  (`decisions.md:21`). Sibling unit specs (cite, do not restate):
  U-MS1 `docs/specs/unit-ms1-store-registry.md`, U-MS2
  `docs/specs/unit-ms2-store-wiring.md` (the per-store corpusRoot
  pass-through contract U-MS4 composes with), U-MS3
  `docs/specs/unit-ms3-store-qualified-broadcast.md`, U-MS5
  `docs/specs/unit-ms5-settings-listing.md` (authored in the same spec-gate
  pass; the pinned paths per review §3).
- **Scope:** exactly ONE source file — `src/main/markdown-import.ts`:
  1. the `importMarkdownCorpus` signature gains an OPTIONAL third parameter
     (the server-side store context — a NEW exported `ImportStoreContext`
     interface; the two-parameter call shape stays valid);
  2. the documentId **prefixing** for NON-default stores at the minting seam
     (`markdown-import.ts:249-286` — the value passed to `parseMarkdown`);
  3. the **per-store path resolution** (`markdown-import.ts:203` —
     `resolve(file)` → `resolve(corpusRoot, file)`);
  4. the **A1 prefix-namespace resolution** (pinned here: resolution **(a)**,
     §5.4) + the cross-store uniqueness regressions.
  The containment/TOCTOU discipline (`markdown-import.ts:207-248`) is reused
  UNCHANGED per store root. This unit does NOT change `markdown-parse.ts`
  (verified + pinned in §5.2: the parser takes the documentId as an INPUT,
  `markdown-parse.ts:617-620`, and every id-minting site inside it derives
  from that parameter — the prefix is applied at the minting seam, never
  inside the parser), does NOT change the broadcast payload shape (U-MS3),
  does NOT change the `main.ts`/`mcp-server.ts` wiring, the `store` argument
  resolution, or the corrected `edit.import_markdown` description
  (`mcp-server.ts:1196` — all U-MS2), and does NOT touch any UI surface
  (U-MS5).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this
  spec ALONE. The TestWriter writes the red set for
  `src/main/markdown-import.ts` (the store-context parameter + the prefix
  rule + the per-store path resolution + the A1 rejection) from §5.8/§5.9
  into `tests/unit-ms4-id-prefixing.test.ts` BEFORE any implementation. The
  red set is node-testable: it calls `importMarkdownCorpus` directly with
  crafted `EditOpContext`/`ImportMarkdownParams`/`ImportStoreContext` values
  and a temp-file corpus fixture (the Unit T suite's fixture pattern,
  `tests/unit-t-markdown-import.test.ts:13`). It needs NO registry module
  (U-MS1), NO Electron, and NO U-MS2 wiring code — the store context is a
  pure injected input.

---

## 1. What the proposal asks

The multi-store Phase-1 slice creates N named RAG stores (U-MS1 registry,
U-MS2 wiring). Two of its CRITICAL/HIGH findings close at the import minting
seam, which is U-MS4:

1. **Cross-store id collisions (critique B3).** Today every store would mint
   documentIds from the sanitized basename alone (`markdown-import.ts:249` —
   `sanitizeDocumentId(basename(file))`), so two stores importing the
   same-named file would both mint the document root id `readme` and the node
   id `readme:section:1` — a foreign-store result id passed to an id-based
   `edit.*` op WITHOUT `store` would silently mutate the default store's
   same-named node. U-MS4 mints `<name>:`-prefixed documentIds for NON-default
   stores at the seam (review §2 D4), so a foreign-store id passed without
   `store` MISSES in the default store (the existing
   `edit.set_content: node not found` fail-state, `edit-ops.ts:162`) instead
   of silently mutating.
2. **The A1 prefix-namespace hole (review §8 A1, from finding N1).** Importer
   node ids embed the documentId with `:` separators
   (`markdown-parse.ts:444` — `` `${documentId}:${type}:${n}` ``;
   `markdown-parse.ts:565` — `` `${documentId}:section:${s+1}` ``), and
   `validateNodeShape` accepts ANY non-empty string id (`rag-store.ts:363`),
   so a DEFAULT-store document whose sanitized basename EQUALS a registered
   non-default store name mints prefix-shaped node ids indistinguishable from
   the prefix namespace. A1 requires this spec to pin EXACTLY ONE resolution —
   this spec pins resolution **(a)** (the default store's import seam REJECTS
   such a documentId) with every state/fail-state in §5.4, and records why
   (b) was rejected (§4).
3. **The per-store import root (decision IMPORT-ROOT-PER-STORE, review §2
   D11).** U-MS2's contract passes the ADDRESSED store's `corpusRoot` per
   store; U-MS4 owns the importer's internal path-resolution change —
   relative `files` paths resolve against the STORE's corpus root
   (`resolve(corpusRoot, file)` replacing `resolve(file)`,
   `markdown-import.ts:203`), byte-identical for the default store only when
   the effective root is `process.cwd()`. The TOOL schema stays `files`-only
   (ADV-1 preserved, `unit-t-markdown-import.md:183`,
   `mcp-server.ts:1196`); the `store` argument cannot influence any path
   (risk R7).
4. **Per-store containment + ONE-WAY-SNAPSHOT reuse.** The realpath/TOCTOU
   discipline (`markdown-import.ts:207-248`) is reused UNCHANGED per store
   root; each store's import remains its own one-shot batch journal entry
   (ONE-WAY-SNAPSHOT per store, `decisions.md:70`).
5. **Zero-config byte-equality (A4).** With no registry (the implicit default
   store, or an explicit single default store whose corpusRoot is
   `process.cwd()`), the default store's import output — documentIds, node
   ids, edge ids, edge `documentIds`, `ownedNodeIds`, journal entry, result
   shape — is BYTE-EQUAL to today. §5.6 carries this as binding acceptance
   criteria.

**Boundaries (do NOT do in this unit):** no `markdown-parse.ts` change; no
`doc-flow.ts` change (`validateDocFlow` has no id-charset rule,
`doc-flow.ts:14-136` — prefixed ids flow through unchanged); no
`mcp-server.ts`/`main.ts`/`edit-ops.ts`/`rag-store.ts`/`shared/types.ts`/
`preload.ts`/renderer change; no tool-schema change; no broadcast-payload
change; no registry-module import (the store context is injected — U-MS4
stays registry-agnostic and node-testable).

## 2. Feasibility verdict

**Feasible — grounded in the existing importer seam; zero engine work.**

- **The prefix is a caller-side mint.** `parseMarkdown(markdown, documentId)`
  takes the documentId as an INPUT (`markdown-parse.ts:617-620`; its ONLY
  throw is a non-string markdown or an EMPTY documentId,
  `markdown-parse.ts:618-619`). Prefixing the documentId before the call
  (`markdown-import.ts:286`) changes every derived id mechanically — no
  parser change.
- **`:`-bearing ids round-trip the store.** `validateNodeShape` requires only
  a non-empty string id (`rag-store.ts:363`); `validateEdgeShape` likewise
  (`rag-store.ts:402`) and accepts `documentIds` as an array of non-empty
  strings (`rag-store.ts:409-410`). Prefixed node ids and prefixed
  edge-`documentIds` entries pass write-time validation unchanged.
- **The namespace rule is sound by construction.** `sanitizeDocumentId`
  replaces every character outside `[a-zA-Z0-9._-]` — including `:` — with
  `-` (`markdown-import.ts:69-76`, the regex at `:73`), so no default-store
  documentId can contain `:`; the registry name charset
  `/^[a-z0-9][a-z0-9_-]{0,63}$/` (review §2 D2) also excludes `:`. Hence a
  `<name>:`-prefixed id can never be minted by a default-store import, and
  cross-store documentId uniqueness is guaranteed (INV-1/INV-2, §5.5).
- **The programmatic seam already exists.** `params.corpusRoot` is the
  ADV-1-sanctioned programmatic input (`unit-t-markdown-import.md:183` —
  "The importer function still accepts `corpusRoot` for programmatic/test
  use"); U-MS2 feeds it per store; U-MS4 only changes what it is resolved
  AGAINST (`markdown-import.ts:203`) and adds the store-context parameter.
- **No engine gap.** The minting seam, the path resolution, and the A1
  rejection are entirely host-side (`src/main/markdown-import.ts`); the
  parser, the store, and `validateDocFlow` are reused unchanged.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The store-context parameter (`ImportStoreContext`) on `importMarkdownCorpus` | Project-specific (a pure injected input; the importer stays registry-agnostic) | Low cost; makes the seam composable with U-MS2's wiring without touching `mcp-server.ts` in this unit (the 2-arg call stays valid). |
| The `<name>:` prefix rule at the minting seam | Project-specific (a minting-order change inside `markdown-import.ts:249-286`) | Medium cost; closes B3's mutation hazard by construction. The duplicate/documentId checks must re-order onto the FINAL id (§5.2) — pinned so the error messages stay deterministic. |
| The A1 prefix-namespace hole | Project-specific (an import-seam rejection — resolution (a)) | Medium cost; one new fail-state + a byte-pinned message; avoids the (b) alternative's cross-cutting resolver change (§4). The accepted cost: an operator CANNOT import a default-store doc named exactly like a registered non-default store (rename the file or the store — the operator controls both). |
| The relative-path resolution change (`markdown-import.ts:203`) | Project-specific (a documented Unit T contract supersession — `unit-t-markdown-import.md:591-594` and `:744-747` pin the OLD cwd rule) | Medium cost; byte-equal only when the effective root is `process.cwd()`; the RCA-6 doc review must reconcile the Unit T lines in the same pass (§5.11). |
| Cross-store uniqueness regressions (two stores × same file; foreign-id miss) | Project-specific (tests only — the invariant falls out of the minting rule) | Low cost; the B3 regression tests. |
| Cross-store EDGE-id equality (the `e-` space) | Project-specific (a documented non-hazard — §5.5 INV-6) | Low cost; documented + adversarial-tested, NOT prevented: edge ids are store-local and carry no store-namespace claim. |

No engine gap. Every change is host-side inside one file plus tests.

### 3a. Adversarial findings (registered 2026-09-05 — the U-MS4 adversarial pass + the Architect's ruled fix batch)

The RCA-3 read-only adversarial pass on the U-MS4 green returned 11 findings
(F-MS4-1..F-MS4-11), covering the mandatory probes: (i) the `store` argument
cannot influence any path (§5.3 — no finding; the context carries no path
input and R6 below pins the guard precedence); (ii) the malformed
`ImportStoreContext` shapes (the SC battery — no NEW finding beyond
F-MS4-2's desync); (iii) the A1 predicate's boundaries (F-MS4-6); (iv) the
cross-store edge-id equality non-hazard (F-MS4-1 — the INV-6 erratum). The
Architect ruled: **FIXED-WITH-REGRESSION** for F-MS4-1/2/3/4/6 (the fix
batch — each landed with a red-first regression in
`tests/unit-ms4-id-prefixing-adversarial.test.ts`), **SPEC-NOTE** for
F-MS4-7/F-MS4-11 (the §5.5 corpusRoot-`/` limitation note + the §5.4
`edit.set_edge` residue sentence — no code), **DOC-REVIEW** for F-MS4-8 (the
stale pre-unit line citations — repointed by the doc-review pass, NOT
touched in this batch), **PROCESS** for F-MS4-9 (this registration itself),
**RECORDED-NO-CHANGE** for F-MS4-5, **HOST-DEFECT** for F-MS4-10 (a
host-code defect outside this unit's allowed files — recorded for its owning
unit, NOT fixed here).

Red-first record (RCA-1): the R-series regression file
`tests/unit-ms4-id-prefixing-adversarial.test.ts` (9 tests, R1–R9) was
written FIRST and run RED against the PRE-FIX module BEFORE any fix —
**3 failed** (R2 — the Proxy `isDefault` desync minted an UNPREFIXED id past
a prefix-mode SC battery; R3 — the Proxy `reservedNames` desync waved the A1
collision through; R5 — a non-string `corpusRoot` threw an uncaught
`TypeError` (`ERR_INVALID_ARG_TYPE`) at
`resolve(params.corpusRoot ?? process.cwd())`), **6 passed** as regression
guards pinning behavior the module already had correct (R1 — the INV-6
edge-id distinctness, R4 — the Proxy determinism, R6 — the guard precedence
+ the `null`/`undefined` cwd default, R7 — the NUL fail-closed cannot-read,
R8 — the sanitize-onto A1 rejections, R9 — the surviving-trailing-dot
import). After the fix batch: 9/9 green, and
`tests/unit-ms4-id-prefixing.test.ts` stays 40/40.

| id | sev | problem (one line) | concrete input | ruling + fix shape as ruled |
| --- | --- | --- | --- | --- |
| F-MS4-1 | LOW | §5.5 INV-6's example claims a cross-store edge-id COINCIDENCE that the `<name>:` mint makes IMPOSSIBLE: the non-default store's documentId is colon-prefixed, so its edge id is `e-<name>:<doc>-<n>`, and every default-store documentId is colon-free — the pair cannot coincide. | default doc `research-2026-09-readme-3` edge 1 vs store `research-2026-09` doc `readme-3` edge 1 ⇒ `e-research-2026-09-readme-3-1` vs `e-research-2026-09:readme-3-1` — DISTINCT (the example claimed IDENTICAL) | **FIXED-WITH-REGRESSION** — the §5.5 INV-6 erratum: the non-hazard conclusion stands A FORTIORI (vacuously — the coincidence is unreachable at the import seam); the example corrected to pin NON-coincidence; the only REACHABLE cross-store edge-id coincidence is the non-import `edit.set_edge` path (§5.4's residue note). Regression R1: the seam-minted edge ids for a default doc vs a non-default store's same-named doc are DISTINCT. |
| F-MS4-2 | LOW | The A1 gate + the prefix mint RE-READ the store context by property access AFTER the SC battery — a getter/Proxy context can desync (a different value per read), so the SC battery validates one shape while the gate/mint act on another. | a Proxy context whose `isDefault` getter returns `false` at the SC read and `true` at the mint read ⇒ SC validates prefix mode but the mint goes UNPREFIXED; likewise a `reservedNames` getter that desyncs between SC and the A1 gate waves the collision through | **FIXED-WITH-REGRESSION** — snapshot `isDefault`/`name`/`reservedNames` into consts immediately AFTER the SC block; the A1 gate + the mint read the SNAPSHOTTED values only (one deterministic point-in-time). Regressions: R2 (the isDefault flip ⇒ the snapshot governs the mint: `S:note`), R3 (the reservedNames desync ⇒ the snapshot governs the gate: REJECT), R4 (determinism across repeated runs). |
| F-MS4-3 | LOW | A non-string `params.corpusRoot` throws an UNCAUGHT `TypeError` (`ERR_INVALID_ARG_TYPE`) at `resolve(params.corpusRoot ?? process.cwd())` — contradicting the module's NEVER-throws-for-a-domain-failure pin. | `corpusRoot: 42` / `false` / `{}` (and `''`) ⇒ the raw TypeError, not a domain result | **FIXED-WITH-REGRESSION** — a typeof guard BEFORE the resolve returning the NEW byte-pinned fail-state `markdown import: corpusRoot must be a string (got <json>)` with the F-MS1-6 `jsonOf` rendering (TOTAL + capped at 200 chars), NO `failedFile`; `''` PINNED as a caller error with the same message (consistency chosen — the nullish coalescing keeps `''`); `null`/`undefined` keep the `process.cwd()` default. Spec amendment: §5.2 step 3 gains the guard + the message row. Regressions R5 (the four values + the cap probe) + R6 (the precedence guards). |
| F-MS4-4 | LOW | A NUL byte in a `file` path fails closed only by ACCIDENT of the host: `statSync` throws `TypeError` (`ERR_INVALID_ARG_VALUE`) and the catch happens to absorb it — the seam never states the rule. | `files: ['note\u0000.md']` ⇒ `cannot read file: note\u0000.md` (correct outcome, unstated mechanism) | **FIXED-WITH-REGRESSION** — an explicit NUL probe in the per-file pipeline (after the containment check, before `statSync`) returning the EXISTING cannot-read message (NO new string) — deterministic, host-independent. Regression R7: a NUL-bearing file ⇒ the cannot-read message, fail-closed, no batch, no ids; the outside-the-root NUL path keeps the outside-corpus-root error (containment still precedes). |
| F-MS4-5 | INFO | verified-safe — the brief's explicit probes register NO code/spec change (all inert edge cases on the SC/seam): (a) a `reservedNames` entry containing `:` is ACCEPTED (SC4/SC5 check only array-ness/string-ness) and is INERT — exact equality against a colon-free sanitized base can never fire (harmless: U-MS1's charset makes such names unregistrable; A1-S7 pins take-as-given); (b) prefix-vs-prefix: `research:` vs `research-2026:` are distinct — `:` is a hard delimiter; (c) store `research` importing `research-2026.md` mints `research:research-2026` — no collision with `research-2026:`'s namespace; (d) double-prefix (`S:S:doc`) impossible — the base is colon-free and the prefix is applied exactly once; (e) empty-after-prefix (`S:`) impossible — the empty check precedes the mint; (f) SC1 accepts any non-array object (a mutated `Date` with `isDefault: true` passes as a default context; a `Map` fails SC2); (g) unknown context fields silently ignored — spec-silent, consistent with the registry's documented unknown-key tolerance. | all seven probes vs the landed SC/A1 seam (see the disposition) | **RECORDED-NO-CHANGE** (transcribed verbatim from the adversarial report at doc-review time; NOTHING invented) — the finding stands recorded as-is with the full probe register; no code, no spec change. |
| F-MS4-6 | INFO | The A1 boundary family was untested for basenames that SANITIZE ONTO a reserved name — the exact-equality predicate operates on the SANITIZED base. | `research-2026-09-.md` (trailing-dash strip), `research-2026-09 .md` (space→dash→strip), `research:2026:09.md` (colon→dash), `research-2026-09.MD` (case-insensitive extension strip) — all sanitize onto `research-2026-09` ⇒ A1 fires; `research-2026-09..md` (the trailing dot survives the dash-only trim) ⇒ base `research-2026-09.` ⇒ IMPORT | **FIXED-WITH-REGRESSION** — the A1 boundary family extended with the five inputs (R8 rejects the four sanitize-onto basenames with the byte-pinned A1 message; R9 imports `research-2026-09..md` with documentId `research-2026-09.`). NO production change — the existing sanitizer + predicate already behave correctly (the regressions pin it). |
| F-MS4-7 | INFO | `corpusRoot: '/'` makes path containment VACUOUS (every absolute path is within `/`); the importer cannot distinguish a server-fixed root from an operator-authored one. | `importMarkdownCorpus(ctx, { files: ['/etc/passwd'], corpusRoot: '/' })` resolves + reads (containment holds trivially) | **SPEC-NOTE** — the §5.5 containment-limitation note (below): a DOCUMENTED LIMITATION, no code change; ADV-1 keeps the root server-fixed (the tool schema stays `files`-only) and the operator authors the registry (U-MS1's absolute-root validation). The supervisor lands the pending.md row. |
| F-MS4-8 | INFO | Stale pre-unit line citations in spec §5.2–§5.4/§5.9 (several cite pre-U-MS4 line numbers that shifted when the SC block + A1 + the mint landed). | the §5.2–§5.4/§5.9 citation lines vs the post-U-MS4 `src/main/markdown-import.ts` | **DOC-REVIEW** — the doc-review pass repoints the stale citations; NOT touched in this batch. |
| F-MS4-9 | PROCESS | The §3a adversarial-findings section was still the pre-green placeholder ("No findings registered yet") after the adversarial pass had run. | the §3a placeholder vs the pass's 11 findings | **PROCESS** — the FULL record is registered HERE (this section), per RCA-3, together with the red-first R-series regression file `tests/unit-ms4-id-prefixing-adversarial.test.ts`. |
| F-MS4-10 | INFO | out-of-unit observation on the unit's seam: the MCP handler SILENTLY DROPS non-string `files` elements — `mcp-server.ts:534` `.filter((x): x is string => typeof x === 'string')` — so `edit.import_markdown { files: ['a.md', 42] }` silently imports `a.md`, and the importer's pinned non-string-element fail-state (`markdown import: empty file path`) is UNREACHABLE via the MCP surface. Pre-existing handler behavior (NOT a U-MS4/U-MS2 marker). | `edit.import_markdown { files: ['a.md', 42] }` via the MCP surface ⇒ ok, imports only `a.md`; the importer's non-string-element fail-state is never surfaced through MCP. | **HOST-DEFECT** (per the Architect ruling) — recorded as OPEN host finding **HOST-MS4-10** in `docs/defects.md` (observed symptom, reproduction, proposed fix shape: fail loud on the mixed-type array with the byte-pinned `empty file path` message, OR document the filter); HOST-side, so NO `docs/HANDOFF.md` entry (no package/engine finding); NOT fixed here (outside `src/main/markdown-import.ts`). |
| F-MS4-11 | INFO | The non-import `edit.set_edge` path can PLANT caller-supplied prefix-SHAPED edge ids/documentIds in the default store — harmless now, but U-MS3's store-derivation resolver must not mis-scope them. | `edit.set_edge(ctx, { kind, source, target, documentIds: ['S:doc'] })` against the DEFAULT store plants the prefix-shaped owner string | **SPEC-NOTE** — the §5.4 residue-paragraph sentence (below); no code change in this unit. |

### 3b. Proposal-review amendments folded in

- **A1 (review §8; decisions.md:109):** the prefix namespace is reserved at
  the NODE-id level too; pin ONE resolution. **Pinned here: resolution (a)** —
  §5.4 enumerates every state/fail-state + the byte-pinned message.
- **A4 (review §8; §4 byte-equality table):** carried as binding acceptance
  criteria in §5.6 (the ONE intentional zero-config delta — the broadcast/
  result `store:'main'` field — belongs to U-MS2/U-MS3, not this unit; U-MS4's
  zero-config delta set is EMPTY).
- **A5 (review §8; decisions.md:110):** the path-resolution pin (§5.3) —
  `resolve(corpusRoot, file)`, byte-identical for the default store only when
  the effective root is `process.cwd()`; the description correction at
  `mcp-server.ts:1196` is U-MS2's (same slice, different unit — review §3
  U-MS2 row); containment/TOCTOU per store unchanged (§5.3).
- **R3 (review §5):** the red test "default store imports `research-2026-09.md`
  while `research-2026-09` is a registered store" → §5.9 F6.
- **R7 (review §5):** per-store containment + TOCTOU regression
  (`markdown-import.ts:207-248` unchanged); tool schema stays files-only;
  the `store` arg cannot influence any path → §5.3 + §3a's mandatory probe.

## 4. Design decisions pinned by this spec

- **STORE-ID-PREFIX (landed 2026-09-05, `decisions.md:109`) — implemented by
  this unit.** `importMarkdownCorpus` prefixes the documentId passed to
  `parseMarkdown` with `<name>:` for NON-default stores; the default store's
  output is byte-equal to today (unprefixed). Safe because
  `sanitizeDocumentId` strips `:` (`markdown-import.ts:69-76`) and the
  registry name charset excludes it — no default-store documentId can contain
  `:`, so cross-store documentId uniqueness is guaranteed. `edit.create_node`
  mints `n-${randomUUID()}` (`edit-ops.ts:185`) — already globally unique,
  UNTOUCHED by this unit.
- **IMPORT-ROOT-PER-STORE (landed 2026-09-05, `decisions.md:110`) — the
  importer half implemented by this unit.** The addressed store's
  `corpusRoot` is the containment root; relative `files` resolve against it
  (`resolve(corpusRoot, file)` — `markdown-import.ts:203` changes from
  `resolve(file)`); the realpath/TOCTOU discipline (`markdown-import.ts:207-248`)
  is reused UNCHANGED per store root; ONE-WAY-SNAPSHOT holds per store. U-MS2
  owns the wiring half (passing `corpusRoot` + the store context per store,
  the corrected description at `mcp-server.ts:1196`).
- **A1-RESOLUTION-(a) — the NEW unit-pinned resolution (discharges the A1
  clause of STORE-ID-PREFIX; the doc review folds it into the decision row's
  provenance in the same pass).** The DEFAULT store's import seam REJECTS a
  documentId exactly equal to any registered NON-default store name (the
  reserved `<name>:` prefix namespace), with the byte-pinned error of §5.4.
  **Why (a) and not (b):** (b) — id-based tools deriving the store from a
  recognized `<name>:` prefix at resolution time — would (i) touch every
  id-based tool's resolution seam (`mcp-server.ts`, `edit-ops.ts` — files
  outside this unit's scope, owned by U-MS2/U-MS3), (ii) CHANGE how today's
  default-store ids resolve (an id like `research-2026-09:section:1` in the
  default store would newly resolve differently — a live behavior change and
  a byte-equality risk against A4), and (iii) leave the ambiguity latent in
  the minted data instead of failing at the seam. (a) fails loud at the only
  seam that can CREATE the ambiguity, keeps all id-based behavior unchanged,
  and keeps the namespace sound by construction (INV-3, §5.5). Cost: an
  operator cannot name a default-store corpus file exactly like a registered
  non-default store — an accepted, operator-remediable restriction (rename
  the file or the store).
- **ONE-WAY-SNAPSHOT (consumed, `decisions.md:70`) + SINGLE-WRITER-STORE-PER-STORE
  (consumed, `decisions.md:106`):** each import addresses exactly ONE store
  (`ctx.store` — the ADDRESSED store's `RagStore` instance); the importer
  never writes source files; each store's import is its own one-shot batch
  journal entry serialized through ITS OWN single-writer queue. U-MS4 adds no
  cross-store transaction and no cross-store read.

## 5. The exhaustive contract

### 5.1 The `importMarkdownCorpus` signature + the store context

```ts
// src/main/markdown-import.ts (U-MS4 delta; everything else unchanged).

/** The SERVER-SIDE store context for one import — NEVER derived from MCP
 *  tool args (ADV-1 discipline: the seam is fed by U-MS2's wiring from the
 *  registry, not by the caller). Optional; omitted ⇒ the legacy
 *  (unprefixed, default-store) behavior, byte-equal to today. */
export interface ImportStoreContext {
  /** The addressed store's registry name. Used ONLY as the `<name>:` prefix
   *  source for non-default stores; UNUSED when `isDefault` is true. The
   *  registry charset (U-MS1, review §2 D2) guarantees `[a-z0-9][a-z0-9_-]{0,63}` —
   *  in particular colon-free; U-MS4 defends only the namespace-critical
   *  properties (§5.4 SC2/SC3), it does NOT re-validate the charset. */
  name: string
  /** True when the addressed store IS the default store: its import output
   *  is UNPREFIXED (byte-equal today). REQUIRED on the type; at runtime the
   *  defensive rule is `isDefault !== true` ⇒ prefix mode (§5.2). */
  isDefault: boolean
  /** The names of the OTHER registered (non-default) stores — the reserved
   *  `<name>:` prefix namespace. Consulted ONLY for the default store's A1
   *  collision rejection (§5.4). Omit (or pass []) when there are no other
   *  stores. U-MS4 treats the list as OPAQUE strings (no charset re-check). */
  reservedNames?: readonly string[]
}

export async function importMarkdownCorpus(
  ctx: EditOpContext,
  params: ImportMarkdownParams,
  store?: ImportStoreContext,
): Promise<ImportMarkdownResult>
```

- **Signature delta:** +1 OPTIONAL third parameter. The two-parameter call
  (`importMarkdownCorpus(ctx, params)`) stays valid — the LEGACY
  directory-less path (`mcp-server.ts:541`, `importMarkdownCorpus(ctx, {
  files })`) still uses it and keeps compiling byte-identically; U-MS2's wired
  call site (`mcp-server.ts:534-541`) now passes the three-argument form
  (post-U-MS2). U-MS4 must NOT edit `mcp-server.ts`.
- **`ImportMarkdownParams` / `ImportMarkdownResult`: UNCHANGED** (Unit T §5.1
  shapes — `unit-t-markdown-import.md:357-368,370-378`; the discriminated
  result `{ ok: true; documentIds: string[]; nodeCount: number; edgeCount:
  number } | { ok: false; error: string; failedFile?: string }`,
  `markdown-import.ts:32-34`). On a non-default success, `documentIds` lists
  the PREFIXED documentIds; `nodeCount`/`edgeCount` remain the BATCH SIZE
  (unchanged semantics, `markdown-import.ts:29-31,320-321`).
- **`ctx: EditOpContext` UNCHANGED** (`edit-ops.ts:18-23` — `{ store:
  RagStore }`); the addressed store is `ctx.store` (U-MS2 binds it per store).
- **Throw patterns UNCHANGED:** `importMarkdownCorpus` NEVER throws for a
  domain failure — every fail-state below returns `{ ok: false, ... }`. The
  only throw path remains a store-level failure the op does not catch (the
  Unit D/U-A discipline, `edit-ops.ts:5-7`).
- **New domain fail-state class — the invalid store context (SC):** a
  malformed `store` value ⇒ `{ ok: false, error: 'markdown import: invalid
  store context' }`, NO `failedFile`. Byte-pinned. Enumerated in §5.4.

### 5.2 The minting seam: check order, the prefix rule, and the id-shape census

**The per-call pipeline (pinned order; unchanged steps cite today's lines):**

1. **Files guard** (`markdown-import.ts:115-116`) — unchanged;
   `{ ok: false, error: 'markdown import: files must be a non-empty array' }`.
2. **NEW — store-context validation** — runs ONCE per call, immediately
   AFTER the files guard and BEFORE the corpus-root resolution (fail-fast: an
   invalid context never touches the filesystem). `store == null` (undefined
   or null) SKIPS validation entirely (the legacy shape). Otherwise:
   - **SC1** — `store` is not a plain object (a string, number, boolean,
     array, or other non-object) ⇒ invalid store context.
   - **SC2** — prefix mode (`store.isDefault !== true`) and `store.name` is
     not a non-empty string ⇒ invalid store context.
   - **SC3** — prefix mode and `store.name` contains `:` ⇒ invalid store
     context. (Load-bearing for INV-3: a colon-bearing prefix would break the
     first-segment store-derivation rule.)
   - **SC4** — `store.reservedNames` is provided (not undefined) and is not
     an array ⇒ invalid store context. A silently-ignored reservation would
     re-open A1 — fail loud instead.
   - **SC5** — `store.reservedNames` is an array containing a non-string
     element ⇒ invalid store context.
   All five ⇒ `{ ok: false, error: 'markdown import: invalid store context' }`.
3. **Corpus-root resolution** — the GUARD (NEW, F-MS4-3) then the resolve:
   - **The corpusRoot guard** — `params.corpusRoot` PROVIDED (not
     `undefined`/`null`) and (not a string OR `''`) ⇒
     `{ ok: false, error: 'markdown import: corpusRoot must be a string
     (got <json>)' }`, NO `failedFile`, BEFORE the resolve (a non-string
     would otherwise throw an uncaught `TypeError` — `ERR_INVALID_ARG_TYPE`
     — at `resolve`, contradicting the NEVER-throws-for-a-domain-failure
     pin). `<json>` is the F-MS1-6 `jsonOf` idiom: `JSON.stringify` (TOTAL —
     a throwing stringify renders `String(value)`; the bare word
     `undefined` for `undefined`), CAPPED at 200 chars (first 197 + `…` =
     exactly 198). Pinned renderings: `42` ⇒ `(got 42)`; `false` ⇒
     `(got false)`; `{}` ⇒ `(got {})`; `''` ⇒ `(got "")` — `''` IS a caller
     error (pinned for consistency: the nullish coalescing keeps `''`, and
     an empty root is never a valid corpus root).
   - `const corpusRoot = resolve(params.corpusRoot ?? process.cwd())` —
     UNCHANGED: `null`/`undefined` keep the cwd default (NOT caller errors);
     a relative `corpusRoot` still resolves against cwd here; ABSOLUTE roots
     are enforced by U-MS1's registry validation per D2/D10, NOT by the
     importer — the programmatic seam stays permissive ABOUT ABSOLUTENESS
     only (string-typedness + non-emptiness are now the importer's own
     guard). Precedence: the files guard (step 1) and the SC battery (step 2)
     both precede this guard.
4. **Per file** (`markdown-import.ts:194-288`):
   a. empty-path guard (`:195-196`) — unchanged;
      `'markdown import: empty file path'`.
   b. **`const abs = resolve(corpusRoot, file)`** (`:203` — THE change; was
      `resolve(file)`). `path.resolve` semantics: an ABSOLUTE `file` ignores
      the root (identical behavior to today); a RELATIVE `file` resolves
      against the store's root (the A5 behavior change, §5.3).
   c. logical containment (`:207-209`), stat + directory rejection
      (`:220-229`), realpath + containment + read-the-realpath'd-path
      (`:234-248`) — ALL UNCHANGED, exercised against the store's root. The
      error messages are byte-equal:
      `'markdown import: path outside corpus root: <file>'` /
      `'markdown import: cannot read file: <file>'`, each with
      `failedFile: file`.
   d. `const base = sanitizeDocumentId(basename(file))` (`:249`) — UNCHANGED
      (the regex at `:73` strips `:` — the namespace-soundness guarantee).
   e. empty-documentId check (`:252-254`) — UNCHANGED and runs on `base`
      BEFORE any prefixing (a non-default store importing a file that
      sanitizes to `''` fails with the SAME byte-equal message
      `'markdown import: empty documentId for file: <file>'` — never a
      prefixed-empty id like `<name>:`).
   f. **NEW — A1 collision check** (default-store imports ONLY): if
      `store` is provided AND `store.isDefault === true` AND
      `Array.isArray(store.reservedNames)` AND
      `store.reservedNames.includes(base)` ⇒ reject (§5.4).
   g. **NEW — prefix minting:**
      `const documentId = store && store.isDefault !== true ?
      \`${store.name}:${base}\` : base`. The prefix is uniform across the
      corpus (it derives from the store context, not the file). The default
      path (`store == null` or `isDefault === true`) yields `documentId ===
      base` — byte-equal to today.
   h. duplicate-documentId check (`:282-284`) — runs on the FINAL
      (prefixed) documentId; the message echoes the FINAL id:
      `'markdown import: duplicate documentId: <final-id>'`, NO `failedFile`
      (shape unchanged). Since the prefix is constant within one call, the
      prefix-then-check order cannot change which files collide.
   i. `parseMarkdown(content, documentId)` (`:286`) — the CALL IS UNCHANGED;
      the prefix rides on the documentId INPUT. `markdown-parse.ts` is NOT
      modified (verified: `markdown-parse.ts:617-620` takes the documentId as
      a parameter; ALL id minting inside derives from it).
5. **Doc-flow validation** (`markdown-import.ts:291-300`) — code UNCHANGED;
   on failure the message echoes the FINAL (prefixed) documentId:
   `` `markdown import: doc-flow validation failed for ${doc.documentId}: ${v.reason}` ``
   with `failedFile: doc.file` (`:294-299`). `validateDocFlow` itself has no
   id-charset rule (`doc-flow.ts:14-136`) — prefixed ids and prefixed
   edge-`documentIds` scope correctly (`doc-flow.ts:32-35` matches by
   `includes(documentId)`).
6. **Batch + applyBatch + success return** (`markdown-import.ts:304-322`) —
   UNCHANGED: ALL `putNode` ops precede ALL `putEdge` ops (`:304-310`), ONE
   atomic batch (`:312-315`, Unit N §5.3), success `documentIds` are the
   FINAL ids (`:317-319`), counts are the batch size (`:320-321`).

**Which store classes get the prefix (pinned):**

| Addressed store class | `store` argument | documentId minted | Prefix? |
| --- | --- | --- | --- |
| Default store, legacy call | omitted / null | `<base>` (sanitized basename) | NO — byte-equal today |
| Default store, explicit context | `{ name, isDefault: true, reservedNames? }` | `<base>` | NO (the A1 check may REJECT, §5.4) |
| Non-default store | `{ name: 'S', isDefault: false, … }` | `S:<base>` | YES |
| Malformed context | any non-conforming `store` | — | rejected (SC1–SC5) before any file I/O |

**The id-minting census (COMPLETE — every id-minting site in
`markdown-parse.ts`, all documentId-derived, NONE changed by U-MS4).** For a
non-default store `S` importing a file whose sanitized basename is `D`
(the prefixed documentId is `S:D`); the default-store column is today's
byte-equal output:

| Id shape | Mint site | Default store (today, byte-equal) | Non-default store `S` |
| --- | --- | --- | --- |
| documentId / document ROOT node id (`div`, `markdown-parse.ts:558`) | the documentId verbatim | `D` | `S:D` |
| Section node ids (`markdown-parse.ts:563-566`, template at `:565`) | `` `${documentId}:section:${s+1}` `` | `D:section:<n>` | `S:D:section:<n>` |
| Block node ids (`markdown-parse.ts:441-445`, template at `:444`; per-type counter `:438,442-443`) | `` `${documentId}:${type}:${n}` `` | `D:<type>:<n>` | `S:D:<type>:<n>` |
| Edge ids (`markdown-parse.ts:446-449`, template at `:448`) | `` `e-${documentId}-${edgeCounter}` `` | `e-D-<n>` | `e-S:D-<n>` (the documentId embedded VERBATIM — the colon survives inside the edge id) |
| Edge `documentIds` owners (doc-head/doc-end/next-section, `markdown-parse.ts:602-605`) | `[documentId]` | `[D]` | `[S:D]` |
| Root `ownedNodeIds` (`markdown-parse.ts:576`) | the section ids | `[D:section:1, …]` | `[S:D:section:1, …]` |
| Root parent-child edge source (`markdown-parse.ts:596`) | the documentId | `D` | `S:D` |
| Returned `ParsedMarkdown.documentId` (`markdown-parse.ts:609`) | the documentId | `D` | `S:D` |

The block `type` segments reachable via `nextId` — 10 mint call sites:
`p` (`:470`), `ul`/`ol` (`:477`), `li` (`:481`), `blockquote` (`:489`), `pre`
(`:499`), `table` (`:505`), `thead` (`:509`), `th` (`:513`), `tr` (`:520`),
`td` (`:524`). Section nodes are typed `h1`–`h6` per heading level
(`markdown-parse.ts:569`). The NON-import id-minting path —
`edit.create_node`'s `n-${randomUUID()}` (`edit-ops.ts:185`) and its
`e-${randomUUID()}` edge (`edit-ops.ts:199`) — is documentId-INDEPENDENT and
already globally unique: UNTOUCHED, and pinned by the existing suites.

### 5.3 The path-resolution rule (IMPORT-ROOT-PER-STORE, importer half)

- **The rule:** `const abs = resolve(corpusRoot, file)` (`markdown-import.ts:203`)
  where `corpusRoot` is the RESOLVED effective root from `:180`
  (`resolve(params.corpusRoot ?? process.cwd())` — line `:180` UNCHANGED).
  - ABSOLUTE `file` ⇒ `abs === resolve(file)` (path.resolve ignores the
    root) — identical behavior to today.
  - RELATIVE `file` ⇒ `abs` = the store's root + the relative path — THE
    behavior change: today a relative path resolves against
    `process.cwd()` and is then containment-checked
    (`unit-t-markdown-import.md:591-594`, fail-state 3b at `:744-747`).
    **This spec SUPERSEDES those two Unit T passages for the import seam**
    (the RCA-6 doc review reconciles them in the same pass, §5.11).
- **Byte-equality boundary:** for the DEFAULT store the behavior is
  byte-identical IFF the effective root is `process.cwd()` — i.e.
  `params.corpusRoot` omitted (zero-config, review §4 row "Import root":
  "`resolve(corpusRoot, file)` with `corpusRoot = cwd` ⇒ byte-identical") or
  explicitly `process.cwd()`. A configured default-store `corpusRoot ≠ cwd`
  intentionally changes relative-path resolution (A5's letter).
- **Containment + TOCTOU per store root (UNCHANGED code, per-store root):**
  the logical check `isWithin(abs, corpusRoot)` (`:207-209`, helper `:60-64`),
  the stat + directory rejection (`:220-229`), the realpath + containment +
  read-the-realpath'd-path discipline (`:234-248`, the ADV-2 fix). A symlink
  inside a store's root pointing outside it is rejected exactly as today:
  `'markdown import: path outside corpus root: <file>'`, `failedFile: file`.
- **No new path input:** the store context carries NO path data — `name` is
  used ONLY for the id prefix, `reservedNames` ONLY for the A1 check (§5.2
  step 4f/4g). The importer's path handling depends ONLY on
  `params.corpusRoot` (server-fed by U-MS2) and `params.files`. This is the
  R7 containment pin: the `store` argument cannot influence ANY path (the
  tool schema stays `files`-only, ADV-1, `unit-t-markdown-import.md:183`;
  `mcp-server.ts:1196` unchanged by this unit).
- **Relative corpusRoot:** still resolved against cwd at `:180` (unchanged);
  U-MS4 adds NO absoluteness validation — the registry requires absolute
  `corpusRoot`s (review §2 D2/D10; U-MS1's fail-loud domain), and the
  programmatic seam stays permissive for tests.

### 5.4 The A1 resolution — resolution (a), every state + fail-state

**Pinned resolution (a): the DEFAULT store's import seam REJECTS a documentId
equal to any registered NON-default store name.**

- **Predicate (exact):** for each file, AFTER the sanitize (`:249`) and the
  empty-documentId check (`:252-254`), BEFORE the prefix mint and the
  duplicate check: if `store != null && store.isDefault === true &&
  Array.isArray(store.reservedNames) && store.reservedNames.includes(base)`
  ⇒ `{ ok: false, error: 'markdown import: documentId collides with a
  registered store name: <base>', failedFile: file }`. `<base>` is the
  sanitized documentId (=== the would-be documentId for the default store).
  NO node/edge is applied; NO batch is submitted; NO journal entry; the store
  is unchanged (the failure precedes the batch build, `:304`).
- **Byte-pinned message:** `` `markdown import: documentId collides with a
  registered store name: ${documentId}` `` — echoes ONLY the caller-derived
  id (the caller supplied it via the filename; identical discipline to the
  duplicate-documentId error at `:283`). This does NOT violate A9/B9 (the
  no-registry-enumeration rule for the store-SELECTOR error — U-MS2's seam):
  by the definition of the failure the echoed id EQUALS one store name, so it
  carries zero information beyond the caller's own input, and it never
  enumerates the registry.
- **Exact-equality is the ONLY predicate.** `sanitizeDocumentId` strips `:`
  (`:73`), so a default documentId can never CONTAIN a colon and a
  first-`:`-segment collision reduces to whole-string equality. Substring,
  dash-extension, and case variants do NOT collide (F8/F9 + the A1 boundary
  probes in §3a): `research-2026-09-notes` ≠ `research-2026-09`;
  `Research` ≠ `research` (the store charset is lowercase, `review §2 D2`);
  `research_2026_09` ≠ `research-2026-09`.
- **State matrix (every A1 state):**

| # | Configuration | Outcome |
| --- | --- | --- |
| A1-S1 | Default store (legacy call, `store` omitted), file `research-2026-09.md` | IMPORTS (byte-equal today) — no reservation is knowable without a context |
| A1-S2 | Default store, `isDefault: true`, `reservedNames: []`/omitted, file `research-2026-09.md` | IMPORTS (nothing reserved) |
| A1-S3 | Default store, `isDefault: true`, `reservedNames: ['research-2026-09']`, file `research-2026-09.md` | REJECTED — the A1 error (review §5 R3's red test) |
| A1-S4 | Default store, `isDefault: true`, `reservedNames: ['research-2026-09']`, file `research-2026-09-notes.md` | IMPORTS (documentId `research-2026-09-notes` ≠ the reserved name) |
| A1-S5 | Default store, `isDefault: true`, `reservedNames: ['research-2026-09']`, file `Research.md` | IMPORTS (case-sensitive equality; `Research` ≠ `research-2026-09` anyway) |
| A1-S6 | Default store named `kb` (a non-`main` default), `reservedNames` = the OTHER stores, file `kb.md` | IMPORTS — the reserved set is "every registered store EXCEPT the addressed default store's own name"; a default doc named like its OWN store mints `kb:section:1`, whose first segment is not a NON-default name (INV-3 still routes it to the default store) |
| A1-S7 | Default store, `reservedNames` includes the default store's own name, file `<that-name>.md` | REJECTED (the A1 error) — **A1-S7 erratum (U-MS4, 2026-09-05):** the predicate is `includes(base)` on the list it is GIVEN — a list containing the default store's own name ⇒ REJECT; the caller (U-MS2's pass-through) supplies only the non-default names |
| A1-S8 | Non-default store `research-2026-09`, file `research-2026-09.md` | IMPORTS — documentId `research-2026-09:research-2026-09`; the A1 check is DEFAULT-STORE-ONLY (`reservedNames` is never consulted when `isDefault !== true`) |
| A1-S9 | Default store, `isDefault: true`, `reservedNames: ['research-2026-09']`, MULTI-file corpus where one file collides | WHOLE import REJECTED (no partial application — the Unit T A5 discipline); `failedFile` names the FIRST colliding file in `files` order |
| A1-S10 | Zero-config (no registry): any file name | Byte-equal to today (S1's rule — the A4 acceptance criteria hold) |

> **A1-S7 erratum (U-MS4 implementation pass, 2026-09-05):** S7's original
> outcome cell ("IMPORTS or REJECTS per S6's rule") was ambiguous against the
> predicate paragraph above it. The pin is the §5.4 predicate VERBATIM —
> `includes(base)` on the list it is GIVEN, no second-guessing — so a given
> list containing the default store's own name ⇒ REJECT; S6's rule governs
> S6's own configuration (the own name NOT in the given list ⇒ IMPORT), and
> the caller (U-MS2's pass-through, `unit-ms2-store-wiring.md` §5.6) supplies
> only the non-default names. Pinned by `tests/unit-ms4-id-prefixing.test.ts`
> test 23 (REJECT) and test 22 (S6's IMPORT).

- **Why the default store stays checkable at all:** the registry is
  BOOT-TIME-ONLY (review §2 D8), so the reserved set is stable within a run;
  U-MS2's wiring derives `reservedNames` from the U-MS1 registry getter per
  import call.
- **Legacy residue (documented, accepted):** a default-store document named
  like a LATER-registered store, imported BEFORE the registry existed, keeps
  its prefix-shaped ids in the persisted store. U-MS4 does NOT migrate,
  quarantine, or re-validate existing store content (the seam is
  import-time-only; no store scan, no write-time policing — `rag-store.ts:363`
  stays permissive). Registry renames/removals are Phase-2 (D8/D1). The A1
  guarantee is therefore: ids MINTED by this unit's import seam respect the
  namespace; pre-existing data is out of scope (pinned honestly, adversarial
  probe in §3a). **F-MS4-11 (2026-09-05):** the NON-import `edit.set_edge`
  path can PLANT caller-supplied prefix-SHAPED edge ids/documentIds in the
  default store today (`edit.set_edge` accepts caller `documentIds`, and the
  store's `validateEdgeShape` accepts any non-empty edge id); edge ids carry
  no namespace claim — harmless now, but U-MS3's store-derivation resolver
  must not mis-scope them.

### 5.5 Cross-store uniqueness invariants

- **INV-1 (documentId uniqueness across stores):** a default-store
  documentId `D` (colon-free, `:73`) can never equal a non-default
  documentId `S:Dd` (contains exactly one `:`). Two stores importing the
  SAME file (`readme.md`) mint `readme` and `S:readme` — distinct.
- **INV-2 (node-id uniqueness across stores):** default node ids have the
  colon-counts 0 (root `D`) or 2 (`D:section:n`, `D:type:n`); non-default
  node ids have 1 (root `S:D`) or 3 (`S:D:section:n`, `S:D:type:n`). The
  colon structures never coincide, so no default-store node id can equal any
  non-default node id — GIVEN the default store never mints a documentId
  equal to a reserved name (the A1 rejection makes `S:section:1`-shaped
  default ids unmintable going forward).
- **INV-3 (namespace soundness — the first-segment rule):** after this unit,
  for every node id MINTED BY THE IMPORT SEAM into any store: if the id's
  first `:`-segment equals a registered NON-default store name, the id
  belongs to that store; otherwise it belongs to the default store. Sound
  because (i) non-default ids always start `<their-name>:` (the prefix),
  (ii) default documentIds are colon-free and can never EQUAL a registered
  non-default name (the A1 rejection), and (iii) the prefix itself is
  colon-free (SC3). Legacy residue is the documented exception (§5.4).
- **INV-4 (foreign-id miss — the B3 mutation-hazard regression):** a
  non-default store's id passed to an id-based op addressed to the DEFAULT
  store (no `store` argument) MISSES: e.g. `edit.set_content(ctx-of-default,
  { nodeId: 'S:readme:section:1', … })` ⇒ `{ ok: false, error: 'edit.set_content:
  node not found' }` (`edit-ops.ts:160-163`) — never a silent mutation of a
  same-named default node. Guaranteed by construction: the default store
  contains no import-seam-minted `<name>:`-prefixed ids (INV-2).
- **INV-5 (per-store import isolation):** `importMarkdownCorpus` touches
  exactly ONE store — `ctx.store`; `seenIds` is a per-call `Set`
  (`markdown-import.ts:193`); there is NO cross-call or cross-store shared
  mutable state in the minting path. Two stores importing `readme.md`
  CONCURRENTLY (`Promise.all`, two `ctx.store`s) cannot interfere; each
  import serializes through its OWN store's single-writer queue
  (SINGLE-WRITER-STORE-PER-STORE, `decisions.md:106`).
- **INV-6 (cross-store EDGE-id equality — documented non-hazard; ERRATUM
  F-MS4-1, 2026-09-05):** edge ids are dash-separated
  (`` `e-${documentId}-${n}` ``, `markdown-parse.ts:448`) and can coincide
  ACROSS stores in principle — but at the IMPORT SEAM the coincidence is
  UNREACHABLE post-U-MS4: the non-default documentId is `<name>:<doc>`
  (colon-prefixed, §5.2 step 4g), so its edge ids embed the colon
  (`e-<name>:<doc>-<n>`), while every default-store documentId is colon-free
  (`:73`) — a default-store edge id and a non-default edge id can never be
  equal. **The original example is corrected:** it claimed default doc
  `research-2026-09-readme-3` edge 1 (`e-research-2026-09-readme-3-1`) and
  store `research-2026-09` doc `readme-3` edge 1 mint the IDENTICAL string —
  impossible now (the store's documentId is `research-2026-09:readme-3`, so
  its edge id is `e-research-2026-09:readme-3-1` — DISTINCT). The non-hazard
  conclusion stands A FORTIORI (vacuously at the seam). The only REACHABLE
  cross-store edge-id coincidence is the NON-import `edit.set_edge` path
  (§5.4's residue note). This is NOT a Phase-1 hazard: edge ids are
  store-local (each store resolves ids within itself), no tool routes edge
  ids by a store prefix, and the `e-` shape carries no `<name>:` namespace
  claim — A1 reserves the `:` namespace only. Within ONE store, edge ids
  remain collision-free given unique documentIds (the trailing counter is a
  pure integer, so equality forces the same documentId, which `seenIds`
  blocks). Pinned by the adversarial regression R1 (§3a probe iv), NOT by a
  minting change.
- **Within-store uniqueness (unchanged):** per import, duplicate documentIds
  abort (`:282-284`); the per-type node counters and the per-document edge
  counter (`markdown-parse.ts:438-439`) make all ids within one document
  distinct; cross-import re-mints produce the SAME ids and overwrite (upsert
  — §5.7).
- **Containment-limitation note (F-MS4-7, 2026-09-05 — documented, NO code
  change):** `corpusRoot: '/'` makes the containment checks VACUOUS (every
  absolute path is within `/`; the realpath'd check likewise). The importer
  does NOT special-case the root — a DOCUMENTED LIMITATION: ADV-1 keeps the
  corpus root SERVER-FIXED (the tool schema stays `files`-only, §5.3) and the
  operator authors the registry (U-MS1 validates absolute roots), so `/` is
  reachable only by operator choice or via the programmatic seam.

### 5.6 Default-store byte-equality acceptance criteria (A4 — binding)

With NO registry file (the implicit default store), or with an explicit
default store whose effective `corpusRoot` is `process.cwd()`, importing the
same corpus file(s) produces output BYTE-EQUAL to today. Each criterion is a
red-test assertion against the CURRENT (pre-U-MS4) behavior captured by the
existing Unit T suites:

1. **documentIds:** the imported `documentId` for `readme.md` is exactly
   `readme` — never prefixed (`markdown-import.ts:249` unchanged on the
   default path).
2. **Node ids:** root `readme` (`markdown-parse.ts:558`); sections
   `readme:section:<n>` (`:565`); blocks `readme:<type>:<n>` (`:444`) — for
   EVERY type in the §5.2 census.
3. **Edge ids + owners:** `e-readme-<n>` (`:448`); doc-flow
   `documentIds: ['readme']` (`:602-605`); root `ownedNodeIds`
   `['readme:section:1', …]` (`:576`).
4. **Result shape:** `{ ok: true, documentIds: ['readme', …], nodeCount,
   edgeCount }` — identical values (`markdown-import.ts:317-322`).
5. **Journal:** ONE `batch` journal entry, same ops in the same order
   (putNode-before-putEdge, `:304-310`; Unit N §5.3 via
   `unit-t-markdown-import.md:631-637`).
6. **Error messages:** all eight inherited fail-states byte-equal on the
   legacy path (files-array `:116`, empty-file-path `:196`, cannot-read
   `:225/:228/:241/:247`, outside-corpus-root `:208/:238`, duplicate-documentId
   `:283`, empty-documentId `:253`, doc-flow `:296`, batch failure `:314`).
7. **Import root:** `resolve(corpusRoot, file)` with an omitted
   `corpusRoot` ⇒ `abs === resolve(file)` (the review §4 byte-equality row,
   `multi-document-store-config-review.md:81`).
8. **Explicit default context:** `importMarkdownCorpus(ctx, params, { name:
   'main', isDefault: true, reservedNames: ['other'] })` on a NON-colliding
   corpus produces output DEEP-EQUAL to the legacy call (the context must not
   alter the default path's output; only the A1 check may reject, §5.4).
9. **The parser is untouched:** `parseMarkdown`'s output for the same
   (markdown, documentId) input is deep-identical — the
   `tests/unit-t-markdown-parse.test.ts` determinism pin
   (`:219-225`) stays green UNCHANGED.

The ONE intentional zero-config delta in the slice — the broadcast/result
`store: 'main'` field — belongs to U-MS2/U-MS3 (review §4 row "Broadcast
payloads"); U-MS4's zero-config delta set is EMPTY.

### 5.7 Idempotency / one-shot pin per store

- **ONE-WAY-SNAPSHOT per store (unchanged semantics, per store):** the
  importer performs NO write to source files; a source-file change does NOT
  propagate; each store's import is its own one-shot batch journal entry in
  ITS journal (`decisions.md:70`; `unit-t-markdown-import.md:598-605`).
- **One-shot, not idempotent (A3 of Unit T, per store):** the importer does
  NOT check for existing nodes/edges, does NOT dedupe against store content,
  does NOT merge, does NOT refuse a re-import. A re-import of the same file
  into the SAME store re-mints the SAME ids (deterministic: the sanitized
  basename + the fixed prefix + the per-type/per-edge counters,
  `markdown-parse.ts:30-33,441-449`) and OVERWRITES (upsert). For a
  non-default store the re-minted ids are the SAME PREFIXED ids
  (`S:readme:section:1` …) — the prefix is a pure function of the store name
  and the file name.
- **KNOWN LIMITATION carried per store (documented, not a defect):** a
  re-import of a SHORTENED document leaves the now-absent nodes/edges
  ORPHANED in that store (`unit-t-markdown-import.md:615-622`); unchanged for
  both store classes.
- **Atomicity per store:** a successful import lands ONE `batch` journal
  entry and persists ONCE in the ADDRESSED store; a failed import (including
  the new A1 and SC fail-states) submits NO batch, pollutes NO journal, and
  persists NOTHING (`unit-t-markdown-import.md:631-637`; Unit N §5.3). No
  cross-store transaction exists (`applyBatch` is per-store,
  `decisions.md:106`).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **H1 — default-store legacy import byte-equality (the A4 baseline):** the
   same file imported via the two-parameter call mints every id of the §5.2
   default column (root/sections/blocks/edges/documentIds/ownedNodeIds) and
   returns the byte-equal result (§5.6 criteria 1–7).
2. **H2 — explicit default context is output-neutral:**
   `importMarkdownCorpus(ctx, params, { name: 'main', isDefault: true,
   reservedNames: ['other-store'] })` produces output DEEP-EQUAL to H1 on a
   non-colliding corpus (§5.6 criterion 8).
3. **H3 — non-default import mints EVERY prefixed id shape:** store `S` +
   `readme.md` ⇒ documentId `S:readme`; root `S:readme`; sections
   `S:readme:section:<n>`; blocks `S:readme:<type>:<n>` for all 10 `nextId`
   types; edges `e-S:readme-<n>`; edge `documentIds: ['S:readme']`;
   `ownedNodeIds: ['S:readme:section:1', …]`; result `documentIds:
   ['S:readme']` with unchanged count semantics (the §5.2 census table as a
   test).
4. **H4 — two stores importing `readme.md` simultaneously:** `Promise.all`
   of two imports (distinct `ctx.store`s, same or different corpusRoots) ⇒
   both ok; documentIds `readme` vs `S:readme`; the minted node-id sets are
   DISJOINT; neither import interferes with the other (INV-5).
5. **H5 — relative path against a NON-cwd corpusRoot:**
   `corpusRoot: '<abs>/store-root'`, `files: ['readme.md']` ⇒ ok, resolving
   to `<abs>/store-root/readme.md` (RED today — resolves against cwd; the
   A5 behavior change).
6. **H6 — relative subdirectory path:** `files: ['sub/note.md']` under the
   store root ⇒ ok; containment holds against the store root.
7. **H7 — absolute path within the store root ⇒ ok** (unchanged behavior).
8. **H8 — per-store-root containment discipline:** a symlink
   `<store-root>/link.md` → outside the store root ⇒ REJECTED with the
   byte-equal `'markdown import: path outside corpus root: <file>'` (the
   `:234-248` discipline reused UNCHANGED for a non-default store's root).
9. **H9 — re-import into the same non-default store:** the second import
   re-mints the SAME prefixed ids and overwrites (upsert) — deterministic
   (§5.7).
10. **H10 — doc-flow validation on prefixed ids:** a valid headed document
    imports into store `S`; the doc-flow edges carry
    `documentIds: ['S:readme']` and pass `validateDocFlow` (no charset rule,
    `doc-flow.ts:14-136`).
11. **H11 — foreign-id miss (the B3 regression):** a prefixed id
    `S:readme:section:1` passed to `edit.set_content` against the DEFAULT
    store's ctx ⇒ `{ ok: false, error: 'edit.set_content: node not found' }`
    (`edit-ops.ts:160-163`) — never a silent mutation (INV-4).
12. **H12 — a non-default store may import a file named like ITSELF:**
    store `research-2026-09` + `research-2026-09.md` ⇒ ok, documentId
    `research-2026-09:research-2026-09` (the A1 check is default-only).
13. **H13 — SC-pass shapes:** `{ name: 'S', isDefault: false }` (no
    reservedNames) prefixes normally; `{ name: 'main', isDefault: true }`
    (no reservedNames) imports unprefixed without any A1 consult.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **F1 — SC1:** `store` truthy non-object (`'main'`, `42`, `true`, `[]`) ⇒
   `{ ok: false, error: 'markdown import: invalid store context' }`; NO
   `failedFile`; NO file read (precedence: after the files guard
   `markdown-import.ts:115-116`, before the corpus-root resolution `:180`).
2. **F2 — SC2:** prefix mode (`store.isDefault !== true`) with a
   non-string/empty `name` ⇒ invalid store context.
3. **F3 — SC3:** prefix mode with `name: 'a:b'` ⇒ invalid store context
   (the namespace-critical guard).
4. **F4 — SC4:** `reservedNames: 'research-2026-09'` (a non-array) ⇒ invalid
   store context (fail-loud; a silently-ignored reservation re-opens A1).
5. **F5 — SC5:** `reservedNames: ['ok', 42]` (a non-string element) ⇒
   invalid store context.
6. **F6 — the A1 collision (review §5 R3's red test):** default-store
   context (`isDefault: true`), `reservedNames: ['research-2026-09']`, file
   `research-2026-09.md` ⇒
   `{ ok: false, error: 'markdown import: documentId collides with a
   registered store name: research-2026-09', failedFile: '<path>' }`; no
   batch, no journal entry, store unchanged (§5.4).
7. **F7 — A1 inside a multi-file corpus:** the WHOLE import aborts; the
   error names the FIRST colliding file in `files` order; NO node/edge from
   ANY file is applied (no partial application).
8. **F8 — A1 requires the context:** the SAME colliding basename with
   `store` omitted (legacy call) ⇒ IMPORTS (A1-S1 — byte-equal today).
9. **F9 — A1 is exact-equality:** `research-2026-09-notes.md` /
   `Research.md` / `research_2026_09.md` against reserved
   `['research-2026-09']` ⇒ IMPORT (§5.4 state matrix S4/S5).
10. **F10 — doc-flow failure echoes the PREFIXED id:** a heading-less
    document in store `S` ⇒
    `` `markdown import: doc-flow validation failed for S:<doc>: missing-head` ``
    with `failedFile` (the message embeds the final prefixed id, `:296`).
11. **F11 — duplicate-documentId error echoes the PREFIXED id:** two files
    sanitizing to the same base (`a.md` + `a.markdown`) in store `S` ⇒
    `markdown import: duplicate documentId: S:a`, NO `failedFile` (shape
    unchanged, `:283`).
12. **F12 — relative path escaping the STORE root:** `files:
    ['../outside.md']` with a non-cwd `corpusRoot` ⇒
    `markdown import: path outside corpus root: ../outside.md`,
    `failedFile: '../outside.md'` (containment now against the store root;
    message format unchanged, `:208`).
13. **F13 — the inherited fail-states stay byte-equal on the legacy path**
    (the Unit T suite is the regression): files-array (`:116`), empty file
    path (`:196`), cannot read (`:225/:228/:241/:247`), outside corpus root
    (`:208/:238`), duplicate documentId (`:283`), empty documentId (`:253`),
    doc-flow (`:296`), batch failure (`:314`).
14. **F14 — empty-documentId precedence BEFORE the prefix:** a file
    sanitizing to `''` in a NON-default store ⇒ the byte-equal
    `'markdown import: empty documentId for file: <file>'` — NEVER a
    prefixed-empty id (§5.2 step 4e).

### 5.10 Census / numeric claims

- **Signature delta:** +1 optional parameter (`store?: ImportStoreContext`);
  +1 exported interface (`ImportStoreContext`, 3 fields: `name`,
  `isDefault`, `reservedNames?`). `ImportMarkdownParams`/
  `ImportMarkdownResult`/`EditOpContext`: 0 members changed.
- **Files changed by U-MS4:** exactly 1 source file
  (`src/main/markdown-import.ts`) + 2 NEW test files
  (`tests/unit-ms4-id-prefixing.test.ts` — the SpecWriter red set H1–H13/F1–F14
  — and `tests/unit-ms4-id-prefixing-adversarial.test.ts` — the post-green
  R-series R1–R9 regression file, §3a). Files NOT changed (pinned):
  `markdown-parse.ts` (0 lines), `doc-flow.ts`, `rag-store.ts`,
  `edit-ops.ts`, `mcp-server.ts`, `main.ts`, `shared/types.ts`,
  `preload.ts`, `src/renderer/*`.
- **`markdown-parse.ts` id-minting census (verified, all UNTOUCHED):** 4
  minting sites — block-node ids (`:441-445`, template `:444`), edge ids
  (`:446-449`, template `:448`), the document-root id (= the documentId,
  `:558`), section ids (`:563-566`, template `:565`); 10 `nextId` mint
  call-sites (`:470,:477,:481,:489,:499,:505,:509,:513,:520,:524`);
  documentId embeddings carried unchanged: `:576` (ownedNodeIds), `:596`
  (root parent-child source), `:602-605` (edge documentIds/owners),
  `:609` (the return). Non-import minting: `edit-ops.ts:185` (`n-${randomUUID()}`)
  + `:199` (`e-${randomUUID()}`) — documentId-independent, untouched.
- **New fail-states:** 3 new error strings — (1) `'markdown import: invalid
  store context'` (SC1–SC5); (2) `'markdown import: documentId collides with
  a registered store name: <id>'` (A1); (3) `'markdown import: corpusRoot
  must be a string (got <json>)'` (the F-MS4-3 corpusRoot guard — the THIRD
  string the initial census missed, corrected by the doc review). 8 inherited
  fail-states preserved byte-equal (§5.9 F13).
- **New tests:** the enumerated red set is 13 happy-path + 14 fail-state
  states (H1–H13, F1–F14) — the TestWriter may combine multiple triggers
  into one `it()` per family, but EVERY state/fail-state above must be
  covered. This supersedes the review §6 estimate of 12–16 for U-MS4; the
  DONE row records the actual red/green counts and the doc review reconciles
  the trio projection (RCA-6).
- **Estimated implementation delta:** ~15–25 lines inside
  `markdown-import.ts` (the context validation, the A1 check, the prefix
  mint, and the one-line `resolve` change at `:203`); no deletions. (Landed,
  the cycle added the SC battery + the A1 gate + the mint + the corpusRoot
  guard + the snapshot consts + the NUL probe — see `markdown-import.ts`
  lines 36–322.)

### 5.11 Cross-references

- Gate: `docs/specs/multi-document-store-config-review.md` §2 (D4 — the
  prefix decision + the foreign-id-miss resolution; D11 — the import-root
  re-point; D2 — the name charset), §3 (the U-MS4 row: "Store-id prefixing
  at the import minting seam… cross-store uniqueness + the A1 prefix-hole
  regressions" — `markdown-import.ts:249-286` + the store-name param), §4
  (the byte-equality table — the "Import root" and "documentId minting" rows
  are this unit's), §5 (R3 — the prefix-hole red test; R7 — the containment
  regression), §8 (A1 — the resolution pin; A4 — the binding byte-equality
  criteria; A5 — the path-resolution pin + the description correction).
- Decisions: `docs/decisions.md` **STORE-ID-PREFIX** (`decisions.md:109` —
  this spec discharges its A1 clause with resolution (a); the doc review
  folds the pin into the row), **IMPORT-ROOT-PER-STORE** (`decisions.md:110`
  — the importer half lands here; the wiring half in U-MS2),
  **MULTI-STORE-REGISTRY** (`decisions.md:105` — the charset U-MS4 relies
  on), **SINGLE-WRITER-STORE-PER-STORE** (`decisions.md:106`),
  **ONE-WAY-SNAPSHOT** (`decisions.md:70`), **SINGLE-WRITER-STORE**
  (`decisions.md:21`), **STORE-QUALIFIED-BROADCAST** (`decisions.md:108` —
  U-MS3; U-MS4 leaves the payload shape alone; the import handler's
  broadcast VALUES become the prefixed document root ids as a natural
  consequence of `result.documentIds`, `mcp-server.ts:446`), **ENGINE-PER-STORE**
  (`decisions.md:107`) + **VECTOR-TOPOLOGY-PER-STORE** (`decisions.md:111`) +
  **UI-SELECTOR-DEFERRED** (`decisions.md:112`) — context only, no U-MS4
  surface.
- Sibling units: U-MS1 `docs/specs/unit-ms1-store-registry.md` (the registry
  name charset + validation U-MS4 consumes opaquely via `reservedNames`);
  U-MS2 `docs/specs/unit-ms2-store-wiring.md` (per-store `corpusRoot`
  pass-through + the `store` resolution + the corrected
  `edit.import_markdown` description at `mcp-server.ts:1196` + the PINNED
  third-argument pass-through at the wired import call site —
  `unit-ms2-store-wiring.md` §5.6 pins
  `importMarkdownCorpus(ctx, { files, corpusRoot: entry.corpusRoot }, { name:
  entry.name, isDefault: entry.name === dir.defaultName, reservedNames:
  <the non-default store names> })` byte-for-byte to THIS unit's §5.1
  `ImportStoreContext` shape, and its §5.6 red set carries the wired-prefix
  assertion (a wired non-default import mints `<name>:`-prefixed ids; the
  default store's wired import stays unprefixed) — THAT §5.6 pin, not a vague
  assignment, is what activates STORE-ID-PREFIX in production. U-MS4 owns NONE of the
  wiring); U-MS3 `docs/specs/unit-ms3-store-qualified-broadcast.md` (the
  payload shape — untouched here); U-MS5
  `docs/specs/unit-ms5-settings-listing.md` (UI — untouched).
- Unit T: `docs/specs/unit-t-markdown-import.md` §5.1 (the
  `ImportMarkdownParams`/`ImportMarkdownResult` shapes — unchanged), §5.4
  (the one-way snapshot + one-shot semantics — extended per store, §5.7
  here), §5.5 (the write-back surface + validateDocFlow-before-commit —
  unchanged), §5.7 fail-states 1/3/3a/3b/4/5/6 (byte-equal on the legacy
  path). **Superseded passages (reconcile in the RCA-6 doc review):**
  `unit-t-markdown-import.md:591-594` ("A RELATIVE `files` path is resolved
  against the process CWD…") and the fail-state 3b wording at
  `:744-747` — U-MS4 replaces the CWD rule with the store-root rule
  (byte-identical when the effective root is `process.cwd()`).
- Unit N: `docs/specs/unit-n-batch-atomicity.md` §5.3 (the batch rollback
  the A1/SC fail-states ride on — no batch, no journal, no persist).
- Unit B: `docs/specs/unit-b-document-model.md` §5.2 (the `validateDocFlow`
  scoping U-MS4 relies on for prefixed ids).
- Unit A: `docs/specs/unit-a-rag-store.md` §5.1/§5.4 (the permissive id
  validation — `rag-store.ts:363,402` — that makes `:`-bearing ids legal
  store records).
- Host patterns: `src/main/markdown-import.ts` (`:69-76` the sanitizer; `:115-116`
  the files guard; `:180-189` the root resolution + realpath; `:194-288` the
  per-file pipeline; `:207-248` the containment/TOCTOU discipline; `:249-286`
  the minting seam; `:291-300` doc-flow; `:304-322` batch + result),
  `src/main/markdown-parse.ts` (the id-minting census, §5.2),
  `src/main/mcp-server.ts:534-541,542` (U-MS2's wired call site + the
  broadcast; the import handler's `files` filter is at `:534`),
  `src/main/edit-ops.ts:18-23,160-163,185,199` (the ctx shape, the
  miss fail-state, the non-import minting), `src/main/rag-store.ts:360-363,399-410`
  (the permissive id validation), `src/main/doc-flow.ts:14-136`.

## 6. Test plan (the red set the TestWriter will write)

**New test file:** `tests/unit-ms4-id-prefixing.test.ts` — the red set is
derived from §5.8 (H1–H13) + §5.9 (F1–F14), written BEFORE implementation
(RCA-1), run and the failing set REPORTED (RCA-1), then the least code to
green. Fixture pattern: temp corpus dirs + `createJsonRagStore` (or the Unit
T suite's store fixture) + direct `importMarkdownCorpus` calls with crafted
`ImportStoreContext` values; NO registry module, NO Electron, NO U-MS2 code
(the unit is contractually independent; the execution ORDER after U-MS2 is a
scheduling fact, not a code dependency).

**Existing suites that MUST stay green after the unit (the regression
boundary):**

- `tests/unit-t-markdown-import.test.ts` — the Unit T importer suite: THE
  byte-equality canary (containment `:206`, symlink/directory `:237,:251`,
  one-shot `:301-303`, duplicate documentId `:222`, empty-documentId `:237`,
  batch-failure rollback `:272`). Every test stays green UNCHANGED; where it
  pins relative-path resolution against CWD with a non-cwd `corpusRoot`, the
  suite is amended ONLY if it asserted the OLD cwd rule with a non-cwd root
  (check before red — the current suite passes explicit `corpusRoot`s with
  absolute paths, so no amendment is expected; any amendment is a documented
  behavior change recorded in the DONE row).
- `tests/unit-t-markdown-parse.test.ts` — the parser suite: proves
  `markdown-parse.ts` is untouched (0-line diff; the determinism pin at
  `:219-225` is the canary).
- `tests/markdown-endpoint.test.ts` — the MCP `edit.import_markdown`
  endpoint shape: the tool schema stays `files`-only (ADV-1); for THIS
  unit's cycle it stays green as-is (U-MS2 amends it when the `store`
  argument lands).
- `tests/unit-m1-inline-offset-model.test.ts` — parses via `parseMarkdown`
  (`:91-363`): indirect proof the parser is untouched.
- The full trio after green (AGENTS.md item 4): `npm test` +
  `npm run typecheck` + `npm run build`.

**Post-green gates (per RCA-2/3/4/6, one cycle for this unit):** the
adversarial pass registers findings in §3a (mandatory probes listed there);
the blind-greens writer produces `docs/specs/unit-ms4-id-prefixing-greens.md`
from the docs ONLY; the documentation review reconciles §5.11's superseded
Unit T passages + `docs/decisions.md` STORE-ID-PREFIX's A1 clause +
`docs/next-steps.md`'s DONE row (with the recorded red set) in the SAME
pass, archiving the record to `archive/reviews/<date>-unit-ms4-doc-review.md`.