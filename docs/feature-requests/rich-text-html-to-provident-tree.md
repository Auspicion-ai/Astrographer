# Feature Request — Rich-Text HTML → Provident Tree Converter

- **Status:** FEATURE REQUEST (external package, for import). Not part of the
  Astrographer first-milestone slice. The consumer (Astrographer) will import
  this package; the converter itself is built and maintained in a SEPARATE
  project.
- **Date:** 2026-08-26
- **Origin:** the contenteditable editing proposal (focused validity check
  2026-08-26 — `docs/pending.md`). The textarea is kept for v1; this converter
  is the missing piece that would make rich-text contenteditable editing
  feasible later.
- **Consumer contract:** `docs/specs/unit-d-editing.md` §5.1-§5.6 (the editing
  write-back path), `docs/specs/astrographer-review.md` §9.2.9 (RAG text →
  `content`; formatting → element `type`).

---

## 1. What the feature asks

A **pure, deterministic converter** that takes rich-text HTML (the output of a
`contenteditable` element) and produces a **provident tree** — the RAG store's
representation: a tree of nodes, each with a plain-text `content` and an
element `type`. The converter is the "conversion back" step of a
contenteditable editing flow: on blur, the edited HTML is converted to a
provident tree, diffed against the existing subtree, and the changes are issued
as RAG-store edits (content edits for changed nodes, structural edits for
added/removed nodes).

The converter is **packaged as a separate, importable package** (a library),
not built into the Astrographer host. It must be framework-agnostic (pure
functions over plain data), so it can be imported by any consumer that uses the
provident tree model.

## 2. The provident tree model (the output shape)

The RAG store represents a document as a **tree of RAG nodes**, each with:

- `id: string` — a stable RAG node id.
- `type: string` — the element type (the formatting). The closed set the
  consumer uses: `h1`-`h6`, `p`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`,
  `strong`, `em`, `a`, `img`, `div` (structural root).
- `content: string` — the node's PLAIN TEXT (no markup). For a leaf (`p`,
  `h1`-`h6`, `li`, `strong`, `em`, `code`), this is the text. For a container
  (`ul`, `ol`, `blockquote`, `pre`, `div`), this may be empty and the children
  carry the content.
- `ownedNodeIds: string[]` — the ids of the node's owned subtree (the
  `parent-child` edges). A container's children are its owned nodes.
- `props?: Record<string, unknown>` — optional attributes (e.g. `href` for
  `a`, `src`/`alt` for `img`).

The converter's output is a **provident tree**: a root node + its owned subtree,
matching this shape. The consumer maps it to RAG nodes/edges.

## 3. The input shape

The input is **rich-text HTML** — the `innerHTML` of a `contenteditable`
element. It may contain:

- Block elements: `h1`-`h6`, `p`, `ul`, `ol`, `li`, `blockquote`, `pre`,
  `div`.
- Inline elements: `strong`/`b`, `em`/`i`, `code`, `a`, `img`, `br`.
- Nested lists (`ul` inside `li`), nested blockquotes, code blocks.
- Text nodes (plain text, possibly with inline formatting).

The HTML is **untrusted** (user-edited). The converter must handle malformed or
unexpected HTML gracefully (never throw on well-formed-but-unexpected input;
skip or coerce unknown elements deterministically).

## 4. The HTML → provident-tree mapping

| HTML element | Provident `type` | Notes |
| --- | --- | --- |
| `h1`-`h6` | `h1`-`h6` | heading; `content` = its text |
| `p` | `p` | paragraph; `content` = its text |
| `ul` | `ul` | unordered list; children = `li` |
| `ol` | `ol` | ordered list; children = `li` |
| `li` | `li` | list item; `content` = its text; may contain a nested `ul`/`ol` |
| `blockquote` | `blockquote` | quote; children = block content |
| `pre` | `pre` | preformatted; `content` = its text (preserve whitespace) |
| `code` | `code` | inline code; `content` = its text |
| `strong`/`b` | `strong` | bold; `content` = its text |
| `em`/`i` | `em` | italic; `content` = its text |
| `a` | `a` | link; `content` = its text, `props.href` = the href |
| `img` | `img` | image; `props.src`/`props.alt` |
| `br` | (inline break) | a line break within a text run — represent as a newline in the parent's `content`, or a `br` node (consumer decision) |
| `div` | `div` | structural root / generic block |
| unknown | (skip or coerce) | deterministic: skip the element but keep its text, or coerce to `p` (consumer decision) |

**Inline formatting within a block:** a `p` containing `Some <strong>bold</strong>
text` must be decomposed into a `p` node whose subtree contains a `strong` node
(`content: 'bold'`) — i.e. inline formatting becomes child nodes, NOT markup
inside `content`. The `content` field is ALWAYS plain text.

**Nested lists:** a `li` containing a nested `ul` produces a `li` node whose
owned subtree includes the nested `ul` (and its `li` children).

## 5. The diffing step (against an existing subtree)

The converter is used in an editing flow where the existing subtree is known.
The converter must produce a **diff** between the converted tree and the
existing subtree, expressed as RAG-store edits:

- **Content edits:** a node whose `content` changed → `edit.set_content`.
- **Structural edits:** a node added → `edit.create_node` (+ a `parent-child`
  edge); a node removed → `edit.delete_node` (+ cascade its edges); a node
  re-parented → `edit.set_edge` (retarget).

The diff must be **minimal** (only changed nodes) and **deterministic**. The
reconciliation key is the node's stable `id` (or, for a newly-created node, a
fresh id). The consumer decides whether the diff is applied as a batch or
incrementally.

## 6. Edge cases (must be specified)

1. **Nested lists** — `ul`/`ol` inside `li`; arbitrary depth.
2. **Code blocks** — `pre`/`code` with preserved whitespace and no inline
   decomposition.
3. **Inline formatting** — `strong`/`em`/`code`/`a` inside a block; adjacent
   inline runs; inline formatting spanning multiple text nodes.
4. **Images** — `img` with `src`/`alt`; an image as a block vs. inline.
5. **Links** — `a` with `href`; a link wrapping inline formatting.
6. **Empty elements** — an empty `p`/`li` (keep or drop — consumer decision).
7. **Malformed HTML** — unclosed tags, unknown elements, stray text — must be
   handled deterministically (never throw).
8. **Whitespace** — leading/trailing whitespace, multiple spaces, `&nbsp;`,
   newlines — normalized deterministically.
9. **Round-trip stability** — converting a provident tree to HTML and back must
   be stable (idempotent) for well-formed input.

## 7. Packaging requirements

- A **separate, importable package** (npm package), framework-agnostic (pure
  functions over plain data; no Electron, no DOM dependency in the core — the
  HTML parsing may use a DOM parser, but the core conversion is pure).
- **TypeScript** with published types.
- **Deterministic and testable** — the conversion + diff must be pure functions
  with exhaustive tests (the consumer's TestWriter contract).
- **No network egress** — local-first, no external calls.
- The consumer (Astrographer) imports it and wires it into the editing
  write-back path (`docs/specs/unit-d-editing.md` §5.1).

## 8. Feasibility verdict

**Feasible — composable from existing primitives, no engine gap.** The focused
validity check (2026-08-26) confirmed: the converter is host-side DOM parsing +
the RAG store + the `edit.*` ops, all composable from existing primitives. It is
a real project-specific cost (easy to get subtly wrong: nested lists, code
blocks, inline formatting), which is why it is a SEPARATE package with its own
test suite rather than an inline host feature.

## 9. Revisit condition

Revisit when rich-text contenteditable editing is pursued (the contenteditable
row in `docs/pending.md`). The textarea is kept for v1; this converter is the
missing piece that would make rich-text contenteditable editing feasible later.
If pursued, scope the FIRST version to **single-node plain-text editing** (a
`p`/leaf) where `textContent` conversion is trivial, and add the rich-subtree
converter (this feature request) as the second step.
