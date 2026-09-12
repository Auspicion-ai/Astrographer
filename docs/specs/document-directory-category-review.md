# Document Directory / Category Structure — Proposal-Gate Review (three-agent gate)

- **Proposal:** Add a corpus-relative directory/category structure for documents:
  additive optional `RagNode.documentPath: string[]` + `tags: string[]` on the
  document root, a path-qualified `/`-joined `documentId`, import path retention,
  a derived category tree, `RagDocHeadsPayload` `path`/`tags`, a read-only
  `rag.list_documents` + `rag.query` document filters, and a tag-mutation op.
- **Reviewer:** change-analysis agent (step 3 of the proposal gate, AGENTS.md item
  8), grounded by the independent validity review (step 1) and critique review
  (step 2).
- **Inputs:** `docs/specs/document-directory-category.md` (DRAFT at gate time;
  now GATED); validity review
  (VALID-WITH-AMENDMENTS, 18 findings); critique review (UNSOUND-as-written, 24
  findings); `AGENTS.md`; `docs/decisions.md`; the build.
- **Status:** **PROCEED-WITH-AMENDMENTS**, **RATIFIED 2026-09-11** — all
  Architect decisions resolved (Q1 path-qualified; `edit.set_doc_meta` in `edit`;
  doc-nav tree → ui-overhaul G2). Conditional on the must-fix amendments (§3)
  landing in the spec and the tracker reconciliation (§6), before any code.
- **Slice status (2026-09-12):** **U-D1…U-D7 ALL LANDED (2026-09-11/12) — the
  slice is COMPLETE.** The U-D8 doc-nav tree UI is the consumer, carved out to
  ui-overhaul G2 (ratified 2026-09-11); no other unit remains in this slice.

---

## 1. What the proposal asks

1. A primary corpus-relative **`documentPath`** (single-parent directory tree)
   preserved at import and shown as a tree.
2. Optional multi-valued **`tags`** for cross-cutting categories.
3. A way to list/query by category and navigate the hierarchy.

The draft is document-only (§3 contract, §6 units D1–D6, §7 open decisions
Q1–Q9). It is split out of the UI overhaul (`ui-overhaul.md` C15/§3.3); that
spec's doc-nav tree is a *consumer* of this slice and lands after it.

## 2. Feasibility verdict

**FEASIBLE, with a bounded but real blast radius.** The problem is real and
empirically confirmed: `documentId` is the sanitized basename
(`src/main/markdown-import.ts:316`), `RagNode` has no path/category/tag
(`src/main/rag-store.ts:100-117`), and nested repeated basenames collide and are
rejected within a corpus call (`:282-285`; `seenIds` is per-call, `:193`).

The **additive root-node** model reuses the exact `children` precedent
(`CHILDREN-ADDITIVE-STORE-FORMAT` / `CHILDREN-HASH-SOURCE`, `docs/decisions.md:60-61`):
`JSON.stringify` drops `undefined`, so a record without the new fields hashes
byte-identically and needs no migration. **No `provident-ssr` engine seam is
involved**, so no `docs/defects.md`/`docs/HANDOFF.md` item is expected from this
slice.

The genuinely non-additive part is the **id scheme**: path-qualified ids flow
through the `markdown-parse.ts` interpolation, the `<name>:` namespace
(`STORE-ID-PREFIX`), and the `rag-<id>` render convention. That is a contained
projection (all minting is via `${documentId}` interpolation), not a redesign —
*provided* the touch-point census is completed (M3) and the field definition is
pinned (M1).

The two reviews agree on every decisive finding. The one contested
question — flat vs path-qualified ids — is resolved for **path-qualified** (§4
Q1), because flat+metadata cannot satisfy the draft's own repeated-basename
requirement, while path-qualified preserves flat-corpus byte-equality by
construction.

## 3. MUST-FIX amendments (required before any code)

- **M1 — Pin `documentPath` (directory-only).** `documentPath` = corpus-relative
  **directory** segments, `[]` at root; `documentId = [...documentPath, basename].join('/')`.
  The draft currently defines the field three incompatible ways (§3.1/§3.3
  directory-only, §3.2 name-inclusive `['a','readme']`, §3.7 `[]` + display
  `[documentId]`). The §3.2 form makes the F9 flat byte-equality claim false and
  breaks §3.4's prefix tree. Reconcile all sections to this one definition.
- **M2 — Journal invertibility.** A `putNode` changing only `tags`/`documentPath`
  currently takes the `content` journal branch, whose before/after snapshots omit
  the new fields (`rag-store.ts:1005-1014`, `:875-885`) — an undo silently loses
  the tag change. Classify metadata deltas as the structural `node-update` branch
  (full-node snapshot), or extend the content snapshot + `applyInverse`. Add
  tags-only and content+tags undo/redo tests.
- **M3 — Complete the additive touch-point set.** `nodeSource` alone is not
  enough. Thread the fields through at least: `RagNode` (`:100-117`),
  `nodeSource` (`:364-371` — the actual fixed order is `id, type, content,
  nodeKind, children, props, ownedNodeIds, createdAt, updatedAt`; insert
  `documentPath`/`tags` after `children`, before `props`, so a pre-existing
  `nodeKind`-bearing record stays byte-identical), `validateNodeShape` (`:395-432`, an explicit
  whitelist — unlisted fields are stripped), `toPublicNode` (`:782`), `insertNode`
  (`:791-795`), `setNodeFields` (`:808-818`), `isRagNode` (`:492-505`), the boot
  load/re-verify (`:647-657`), and `adjacency.copyNode` (`adjacency.ts:44-46`).
  Without this, `getNode` strips the fields and a later `putNode({...node})` edit
  **erases** them (data loss), and a record that *has* them is quarantined at boot.
- **M4 — Do not relax `sanitizeDocumentId`.** It is local to `markdown-import.ts`
  (`:69-76`) and also strips `.md`/`.markdown`. Add a `sanitizeSegment` for
  directory segments (no extension-stripping) and keep basename sanitization
  separate; sanitize per segment, then join with `/`. The draft's "relax to
  preserve `/`" is both vacuous (segments never contain a `/`) and contradictory.
- **M5 — Pin canonical path derivation.** `''` from `path.relative` ⇒
  `documentPath = []` (the draft's naive split yields `['']`, which F3 rejects —
  i.e. every root-level file fails). Normalize `path.sep`; derive from the
  **logical** relative path (not realpath, avoiding symlink-path disclosure);
  reject a normalized `..`; pin symlink policy.
- **M6 — Correct the minting census.** Replace "the four minting sites" with the
  full set: `markdown-parse.ts:444,448,558,565,576,596,602-606,609` +
  `markdown-import.ts:316,332,345,348`. Derived ids inherit a `/`-bearing id via
  interpolation.
- **M7 — doc-heads root read.** `handleRagDocHeadsIpc` reads the head **section**
  node (`e.source`) for `title`; `path`/`tags` live on the document **root**
  (`e.target`, per `markdown-parse.ts:596-602`). Add the root read (tolerate a
  missing/quarantined root), and pin a stable sort.
- **M8 — Filter extension, rag-scoped.** Extend `RagQueryFilters`
  (`retrieval.ts:761`), `validateFilters` (`retrieval.ts:1157-1190`),
  `validateRagQueryFilters` (`mcp-server.ts:163-198`), and the
  `rag.query`/`rag-stream` zod schemas (`:2176`/`:2185`). The type is shared with
  the Gnosis proxy
  (`engine-rag-store.ts:13,296`) and duplicated in the `gnosis.*` schemas
  (`:2215-2216`); ensure those do **not** advertise/serialize the new local
  fields. Document filters need a node→document mapping in both flat and graph
  modes. *(Post-landing refs; the pre-landing M8 cited `validateFilters`
  `:1075-1096`, `validateRagQueryFilters` `:163-186`, zod `:2134,2142`, gnosis
  `:2172-2173` — corrected in `docs/specs/unit-ud6-query-document-filters.md`.)*
- **M9 — Write op design.** `edit.set_doc_meta(tags)` as a first-class single op
  **outside** the closed `BatchOp` union (`BATCH-ATOMICITY-API`, `decisions.md:62`;
  `rag-store.ts:175-184`), journaled per M2. `setProps` cannot write top-level
  `tags` (it merges `node.props` only, `edit-ops.ts:461`). Path is read-only in
  v1; group-gated under `edit` (`gnosis-edit` deferred with Q6).
- **M10 — New fail-states.** Add: aliasing (two distinct raw paths sanitizing to
  the same segment) as an explicit fail-state, not a silent merge; Unicode
  NFC/NFD + case-insensitive corpora; a non-ASCII directory sanitizing to `''`;
  malformed/duplicate tags; off-root metadata writes (reject or document
  ignored); a path segment that is also a document; empty branches; leaf label +
  sibling sort.
- **M11 — Write validation/authorization.** Reject `/ \ : . ..` and control
  characters; cap tag count/length; require the target id to be a current
  document root (a `doc-head` target); keep `documentPath` server-minted.
- **M12 — Listing scope.** `rag.list_documents` is **single-store only** and
  never a store census (preserves `UI-SELECTOR-DEFERRED`, `decisions.md:112`);
  display `documentPath`/basename, not the `<name>:`-prefixed id.
- **M13 — Migration semantics.** Backfill `documentPath` for display at the
  **read surface only**, never persisted; drop "never persisted unless edited"
  (a `toPublicNode` round-trip through an edit would persist it). No standalone
  migration unit.
- **M14 — Selector rule.** Replace Q9 with: *never interpolate a `documentId`
  into a raw selector*; `getElementById` is Map-backed (`dom-shim.ts:95`) and no
  `querySelector` exists in `src/`, so `CSS.escape` is only needed if a raw
  selector is ever added.
- **M15 — Seam-set precision.** A main-handled read tool touches `security.ts`
  `TOOL_GROUPS` + `mcp-server.ts` `ALL_TOOLS` (+ zod + handler) + `types.ts`
  `RpcMethod` (house precedent: every landed `rag.*`/`edit.*` tool is declared
  there, `types.ts:288-298`) — **not** `MUTATING_METHODS` or the renderer switch.
  The `filters` extension needs only the type + validators/schemas. Replace the
  imprecise "five-seam gate" phrasing with the actual per-landing set.
- **M16 — UI coupling.** If a doc-nav tree unit stays in this slice, name
  `pane-registry.ts:29` (`docHeads` type) + `pane-graph.ts:159-206`
  (`docNavContent`) + the provident-authoring/host-cache path; otherwise move it
  to ui-overhaul G2.

## 4. Resolved decisions (Q1–Q9)

- **Q1 — Path-qualified `documentId`** (`/`-joined; `documentPath` = directory
  segments, `[]` at root). The only form satisfying the motivating
  repeated-basename requirement; flat corpora stay byte-equal by construction.
  This **explicitly supersedes the `ui-overhaul.md` §3.3/Q13 draft flat-id
  default** (`ui-overhaul.md:509-511,743`), whose id-stability warning is real
  but yields to the requirement; the ui-overhaul spec is itself an ungated draft
  (`docs/next-steps.md:59`), so no ratified `DECIDED` row is overturned, but both
  drafts must be reconciled in the same pass. (The critique leaned flat; this
  analysis overrules it on the repeated-basename requirement — with M1/M4/M6
  enforced, nothing in the code makes path-qualified incorrect.)
- **Q2 — Root-node additive fields + derived tree.** Mirror `children`; no new
  `RagNodeKind`/`RagEdgeKind`; no separate persisted `documents:` section.
- **Q3 — Single `documentPath` + multi-valued `tags`.**
- **Q4 — Front-matter tags at import: out of scope v1.**
- **Q5 — First-class `edit.set_doc_meta` outside the closed `BatchOp` union.**
- **Q6 — Gnosis mapping: local-only v1.** A Gnosis wiki is a flat single-parent
  bucket with a single-string tag filter (`engine-crud-rag-store.ts:93-98,108,121-132`);
  directory↔wiki cannot round-trip. Revisit in a later slice.
- **Q7 — Tags: case-sensitive, trimmed, deduped; `[]`→omitted** (normalize at
  `validateNodeShape` + before hashing, mirroring `ownedNodeIds`/`documentIds`
  dedupe, `rag-store.ts:428,458`).
- **Q8 — Path immutable v1**, enforced at the op boundary; rename is a later unit.
- **Q9 — No selector action today** (see M14).

## 5. Corrected unit decomposition

Per AGENTS.md item 2 / RCA-2 (one red→green→adversarial→blind-greens→doc-review
cycle each, no unit bundling independent seams). The draft's D1–D6 is superseded:
D1 is split into model vs journal; D4 is split into listing vs filters; migration
is folded into acceptance rows; the UI unit **moves to ui-overhaul G2** (ratified
2026-09-11 — this slice ships the data model only).

| Unit | Touches | Primary fail-state coverage |
| --- | --- | --- |
| **U-D1 — store model + additive fields + round-trip** | `RagNode` `rag-store.ts:100-117`; `nodeSource` `:364-371`; `validateNodeShape` `:395-432`; `toPublicNode` `:782`; `insertNode`/`setNodeFields` `:791-818`; `isRagNode` `:492-505`; boot re-verify `:647-657`; `adjacency.copyNode` `adjacency.ts:44-46` | malformed shape → skip/quarantine, no throw; old-store **byte-identical hash**; `[]`→omitted; dedupe; off-root handling; `getNode`→`putNode` preserves fields |
| **U-D2 — journal invertibility of metadata** | `putNodeSync` classification `rag-store.ts:1005-1014`; `applyInverse` `:875-885`; boot journal validators `:467-546` | tags-only undo→redo; content+tags undo; path-mutation undo; restore re-hashes |
| **U-D3 — import path derivation + id scheme** | `markdown-import.ts` (`sanitizeSegment` new; `dirname`/`relative`/`sep`; `importMarkdownCorpus` `:132-397`); parser interpolation census `markdown-parse.ts:444,448,558,565,576,596,602-606,609` | F2 duplicate, F3 empty segment, F4 containment, F5 prefix, F6 A1, aliasing, `''`→`[]`, Unicode, sep, **F9 flat byte-equality** |
| **U-D4 — doc-heads listing + derived tree + read-surface backfill** | `RagDocHeadsPayload` `types.ts:532-536`; `handleRagDocHeadsIpc` `mcp-server.ts:865-884`; new pure tree helper | F8 empty branch; missing/empty target; missing root; segment-also-document; deterministic sort; display-only backfill |
| **U-D5 — MCP read tool `rag.list_documents`** | `security.ts:36`; `mcp-server.ts` `ALL_TOOLS`+zod+`handleRagTool`; `types.ts:288-298` `RpcMethod` | single-store scope (no census); unknown store; empty store; malformed ids |
| **U-D6 — `rag.query`/`rag-stream` document filters** | `RagQueryFilters` `retrieval.ts:761`; `validateFilters` `retrieval.ts:1157-1190`; `validateRagQueryFilters` `mcp-server.ts:163-198`; zod `:2176`/`:2185`; node→document mapping; Gnosis non-pollution `:2215-2216`/`engine-rag-store.ts:920,941` | malformed/unknown filter; tags semantics; empty prefix; gnosis rejects new fields |
| **U-D7 — tag write op `edit.set_doc_meta`** | `edit-ops.ts` (+`handleEditTool`); `security.ts`; `mcp-server.ts` `ALL_TOOLS`+zod; `types.ts` `RpcMethod`; per-store broadcast | path write rejected (immutable); invalid tags; non-root target; unauthorized group; missing node; caps |
| **U-D8 — doc-nav tree UI (consumer)** | **MOVED to ui-overhaul G2 (ratified 2026-09-11)** — not part of this slice; G2 authors the provident tree from the U-D4 payload | null/malformed `docHeads`; empty tree; deep nesting; MCP-dispatchable folder toggles |

**Sequencing:** U-D1 → U-D2 → U-D3 → U-D4 → U-D5 ∥ U-D6 → U-D7 → (U-D8 / G2).
Per AGENTS.md item 9, each unit still needs its own `docs/specs/<unit>.md`
contract **and** a TestWriter red-set before it is delegable — this review is the
gate artifact, not the per-unit spec.

**Landed status (2026-09-11/12):** U-D1…U-D7 are ALL LANDED per their per-unit
specs (`docs/specs/unit-ud*.md`). The only open item is the **U-D8 doc-nav tree
UI** — the ui-overhaul **G2** consumer, not part of this slice.

> **Line-ref note (post-U-D1, 2026-09-11):** the U-D1 row's `rag-store.ts` line
> refs are the PRE-U-D1 build state (correct at gate time). After U-D1 landed:
> `RagNode` `:100-126`, `nodeSource` `:373-383`, `validateNodeShape` `:420-471`,
> `toPublicNode` `:822-824`, `insertNode`/`setNodeFields` `:832-836`/`:849-861`,
> `isRagNode` `:531-546`, boot re-verify `:686-700`; `adjacency.copyNode` `:44-46`
> is unchanged.
>
> **U-D3 row (post-U-D3, 2026-09-11):** `importMarkdownCorpus` `:132-397`; the
> parser census `:444,448,558,565,576,596,602-606,609` is unchanged/CORRECT.
>
> **U-D6 row (post-landing, 2026-09-11):** the U-D6 refs are updated to the
> post-landing values — `validateFilters` `retrieval.ts:1157-1190`;
> `validateRagQueryFilters` `mcp-server.ts:163-198`; the `rag.query`/`rag-stream`
> zod rows `:2176`/`:2185`; the gnosis rows `:2215-2216`; the proxy serialization
> `engine-rag-store.ts:920,941`. (Pre-landing M8 cited `validateFilters`
> `:1075-1096`, `validateRagQueryFilters` `:163-186`, zod `:2134,2142`, gnosis
> `:2172-2173`; reconciled in `docs/specs/unit-ud6-query-document-filters.md`.)

## 6. Tracker / documentation reconciliation (same pass)

- **`docs/specs/document-directory-category.md`** — status → GATED
  2026-09-11 (this file); §3.1/§3.2/§3.3/§3.4/§3.7 reconciled to M1; §5 census
  corrected (M6); §6/§7 point here for the corrected units + resolved Q1–Q9.
- **`docs/specs/ui-overhaul.md`** — amend §3.3 flat-id text and Q13 to
  path-qualified (or explicitly drop the repeated-basename requirement); update
  the C15 cross-ref (now points to this gate outcome).
- **`docs/next-steps.md`** — update the document-directory/category block to the
  gate outcome + corrected unit list.
- **`docs/decisions.md`** — add a `DOC-DIRECTORY-CATEGORY-GATE` row recording
  PROCEED-WITH-AMENDMENTS + the Q1–Q9 resolutions + the must-fix pointer; note
  that `edit.set_doc_meta` is deliberately outside `BATCH-ATOMICITY-API`'s closed
  union.
- Archive nothing (all inputs are active drafts); add the cross-reference from
  the draft spec's §8.

## Open items for the Architect (final call)

1. ~~**Q1 is the one true fork.**~~ **RATIFIED 2026-09-11 (user): path-qualified
   works.** The `/`-joined path-qualified `documentId` + directory-only
   `documentPath` stands; the `ui-overhaul.md` §3.3/Q13 flat-id default is
   superseded and no repeated-basename requirement is dropped.
2. ~~**PENDING:** confirm `edit.set_doc_meta` name/group and the doc-nav tree
   placement.~~ **RATIFIED 2026-09-11 (user):** `edit.set_doc_meta` in the `edit`
   group (outside the closed `BatchOp`; `gnosis-edit` deferred with Q6), and the
   doc-nav tree UI moves to **ui-overhaul G2** (this slice lands U-D1…U-D7).

**All gate decisions are now ratified.** The next step is to fold M1–M16 into
`docs/specs/document-directory-category.md` and decompose it into per-unit specs
(`docs/specs/unit-ud1..ud7.md`), each with its own TestWriter red set before any
implementation (AGENTS.md item 9).

---

## Bottom line

**PROCEED-WITH-AMENDMENTS.** The problem is real and the additive root-node
model is sound and consistent with the store-format discipline. The gate
conditions are M1–M16 (pin `documentPath`; journal invertibility; the full
touch-point census; no `sanitizeDocumentId` relaxation; canonical path
derivation; corrected minting census; doc-heads root read; rag-scoped filters;
write-op outside the closed `BatchOp`; new fail-states; write validation;
single-store listing; read-surface backfill; selector rule; seam-set precision;
UI coupling) plus the Q1–Q9 resolutions and the tracker reconciliation in §6.
