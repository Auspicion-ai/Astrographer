# FEATURE REQUEST → the **upstream `Preempt-Providence` docs** (the project that owns `provident-ssr`) — handover from Astrographer

**Date:** 2026-09-17 · **Requester:** the Astrographer shell (a consumer of `provident-ssr` via a fork of Provident-Electron) ·
**Status:** OPEN — filed; **no package source is patched from here, and none is requested to be patched** (AGENTS.md item 7) ·
**Companion handoffs:** `docs/HANDOFF.md` (the index), `docs/feature-requests/provident-electron-shell-chrome-requests.md`
(the sibling foundation set SC-1..SC-7), `docs/feature-requests/gnosis-engine-feature-requests.md` (the engine set GR-1..GR-9),
`docs/FORK-DIVERGENCE.md`, `docs/specs/ui-overhaul.md` §2.1 (the host-side inference this request replaces).

> **Target project and target artefact.** The target is the **upstream documentation** of `Preempt-Providence`
> (`github.com/LittleKingsguard/Preempt-Providence`) — the project that owns and publishes `provident-ssr`. This is a
> **documentation request**: it asks for a documented contract, not a behavior change, not a new API, and not a patch.
> The consumer's local package is `provident-ssr@0.5.0` (`package.json:25` pins `^0.5.0`; the installed dist reports
> `"version": "0.5.0"` at `node_modules/provident-ssr/package.json:3`). The upstream source folder
> (`/media/ryanr/Shared Files/Projects/Preempt-Providence`) and `node_modules/provident-ssr/` are **read-only** for
> this project: any package defect is catalogued in `docs/defects.md` → `docs/HANDOFF.md`, never patched here.
>
> **Why a docs request is the right shape.** The gap below is not that the package is missing a feature — it is that
> a HOST cannot tell which mechanics are expressible through the framework and which are not, so it has to infer.
> That inference then gets written into a consumer's spec as if it were an upstream contract, which is how a
> consumer-side guess becomes a false foundation claim. Documenting the matrix fixes every consumer at once and
> costs upstream no behavior change.

**How this request is written:** *problem → today's host-side inference (file:line) → requested documentation
contract (proposed matrix shape) → acceptance criteria (testable) → MCP-visibility consequence → priority → target
project → fallback if upstream declines → filing verdict*. Priorities: **P0** blocks a shipped consumer path;
**P1** blocks a planned consumer unit; **P2** quality/parity; **P3** destination/future.

---

## PS-1 — `SHELL-MECHANICS-EXPRESSIBILITY-MATRIX` — document, per mechanic, what a host can express through the framework (P2)

**Target project:** upstream `Preempt-Providence` **docs** (owner of `provident-ssr`) · **Filing verdict: FILE**

**Problem.** `provident-ssr` documents its engine surfaces (ops, adapters, translate, handlers, journal, isolation)
but not the **boundary between framework-expressible mechanics and host-side/browser-native mechanics**. A host
building any non-trivial application shell must therefore decide, for each mechanic, one of three things —
(1) express it as graph data (a node/prop/`css`/handler/op), (2) express the *model* in the graph and the *mechanic*
in host code, or (3) keep it entirely host-side — and there is no authoritative source to consult. The consumer in
this repo wrote its own audit and labelled it as an inference, which is the precise failure this request closes.

**Today's host-side inference (the evidence — what the consumer wrote instead of citing upstream).**
- `docs/specs/ui-overhaul.md` §2.1 "**Chrome expressibility audit (which chrome can be provident nodes/handlers)**"
  is explicitly grounded in the consumer's own reading: "Basis verified against `provident-ssr@0.4.0` + the upstream
  specs" (`:74`) — i.e. derived from the package plus this repo's notes, not from a documented matrix.
- Its "**Limits**" bullet is the inference in question (`:92-97`): *"no declarative 'class = f(state)' binding (must
  be handler-, hook-, or `derived-state`-driven); the journal is process-local/never serialized
  (restart-durability is host-side, C9); continuous pointer streams and browser-native behaviors (pointer capture,
  drag image/`dataTransfer`, focus trap/inert, native `<dialog>`, `:root` custom-property application) are not
  graph state."* Every clause there is a claim **about** the framework, asserted by the consumer.
- The same list reappears as Table C's carve-out row — "Native gesture primitives (pointer capture,
  `dataTransfer`/drag image, focus trap, top-layer, Pointer Lock) | browser API, not graph state"
  (`:144`) — and as Table B's hybrid rows, where the *external half* is named without a contract: "Pane frame +
  drag handle | the frame/handle node + `on:dragstart/dragover/drop` | pointer/`dataTransfer`/drag-image plumbing"
  (`:124`), "Modal frame + scrim | the overlay node + state-driven `css.classes` | focus trap / `inert` / top-layer /
  Escape" (`:130`), and "Theme **token application** (`:root` custom properties) | must reach the window root incl.
  operator scope + shell chrome" (`:140`).
- It is already falsifiable in one place, which is why documentation matters: the consumer's list implies `inert`
  is not expressible, but `inert` **is** a member of the package's closed boolean-attribute set
  (`node_modules/provident-ssr/dist/core/adapters.js:25-53`, `'inert'` at `:37`; handled on the dedicated
  presence/absence path at `:300-313` (DOM) and `:520-528` (SSR)). The host's own handoff records the resolution
  ("HOST/U1-ENG resolved via upstream `BOOLEAN-ATTRS` in `provident-ssr@0.5.0`",
  `docs/HANDOFF.md:34-35`), but `BOOLEAN_ATTRS` is **not documented** in the foundation's docs either (no
  `BOOLEAN`/`inert` row in `../Provident-Electron/docs/decisions.md`; `docs/pending.md` has none) — so a host can
  only learn it by reading packaged dist code. **This request asks upstream to state such facts, nothing more.**
- **The second, distinct gap: `cssDef` rule-scoping for shell-owned roots is undocumented.** The consumer's spec
  says "**cssDef ships stylesheet rules** — `:hover`/`:active`/transitions are rule strings emitted via the
  `styles` op (`adapters.md` §3.3); a node can ship its own hover rule" (`:89-91`). What it does **not** say — and
  what no upstream doc it cites states — is the scoping rule: the serialized rule is
  `${entry.selector}{${ruleBody}}` (`node_modules/provident-ssr/dist/core/render-helpers.js:12-30`), the
  `selector` is authored verbatim with **no automatic node scoping** (`:23`), and the adapter appends each
  distinct rule string to ONE global stylesheet element, `#preempt-dynamic-styles` in `document.head`
  (`adapters.js:377-394`, `ensureStyles` at `:386-393`). A host building a **shell-owned root** (a modal host, a
  top bar — i.e. elements that are NOT graph nodes, per SC-1/SC-3) therefore cannot know whether a `cssDef` rule
  is safe for it, what the intended scoping idiom is, or what happens to rules when the owning node is destroyed
  (the dedup set is per-adapter-instance — DomAdapter `stylesSeen` at `adapters.js:91`, the dedup guard at
  `:380-382`; the SSR adapter's own instance at `:436` with its dedup guard at `:484-485` — and the stylesheet is
  append-only).
  That is a documentation gap with real consequences for any host that mixes graph content with shell chrome.

**Requested contract — a documented per-mechanic matrix + a documented `cssDef` scoping rule.** Shape only; the
content is upstream's to author:

```md
### Shell mechanics expressibility matrix (one row per mechanic)

| Mechanic | Expressible through the framework? | If yes, HOW (op / prop / handler / hook / hook-kind / rule) | If no, what the host must own | Documented source |
| --- | --- | --- | --- | --- |
| focus trap | _to be determined upstream_ \| partial | … | element focus / Tab containment + focus restoration | <upstream doc + section> |
| inert (background) | yes | `props.inert` (closed boolean set — presence/absence) | nothing (the prop path handles it) | adapters.md §… |
| top-layer / native `<dialog>` | … | … | … | … |
| pointer capture | … | … | `setPointerCapture` / `releasePointerCapture` + threshold + cancel/lostpointercapture reversion | … |
| `:root` custom-property application | … | … | writing custom properties on the window root | … |
| drag image / `dataTransfer` | … | … | `DataTransfer` content + `setDragImage` | … |
| declarative `class = f(state)` binding | no | (the sanctioned alternatives: handler / hook / derived-state) | the binding itself | … |

### `cssDef` rule scoping

- What a `cssDef` selector is scoped to (verbatim? node-scoped? host-scoped?) and the AUTHORED rule format.
- Where the emitted rules land (which stylesheet element/owner, in which document root) and its lifetime.
- The dedup/mutability rule (is the same rule string ever re-appended? what happens on node destroy/replace?).
- The supported shell-owned-root idiom (or an explicit statement that graph-authored `cssDef` rules are NOT the
  supported mechanism for non-graph (shell) elements, with the recommended alternative for them).
```

Requirements on the documented matrix:

1. **One row per mechanic, authoritative.** Each row states expressible / partially / not, names the exact
   mechanism when expressible (op name, prop name, handler hook, hook kind, or rule form), names what the host
   must own when it is not, and cites the upstream source (document + section). A row a host cannot act on is not
   a documented contract.
2. **It covers at least the mechanics this host actually had to infer**, because they are the ones already
   mis-written into consumer specs: focus trap, `inert` (background), top-layer / native `<dialog>`, pointer
   capture, `:root` custom-property application, drag image / `dataTransfer`, and the declarative
   `class = f(state)` binding question (plus close of the `:hover`/`:active`/transition rule case).
3. **`cssDef` scoping is documented as its own short section** (the four bullets above), sufficient for a host to
   answer one question without reading dist code: *may I use a graph `cssDef` rule to style a shell-owned element,
   and if not, what is the supported alternative?*
4. **The `BOOLEAN_ATTRS` set is documented as a contract**, not just implemented: its membership (or the rule for
   membership), the presence/absence semantics (`'false'` is still PRESENT is the defect the set exists to
   prevent — the consumer's own note `node_modules/provident-ssr/dist/core/adapters.js:21-24`), and which
   attribute names are deliberately excluded (`download` is a value attr).
5. **No behavior change is requested.** If the matrix reveals a mechanic upstream would like to *make* expressible,
   that is a separate proposal on upstream's side; this request is satisfied by accurate documentation of the
   current engine. Where the current answer is "the host owns it", saying so is a complete answer.

**Acceptance criteria (testable).**

1. A host can decide, for each mechanic in clause 2, expressible-or-not **without reading `dist/` code and without
   running an experiment** — the matrix row names the mechanism and cites its source.
2. The `inert` row is accurate (`inert` is expressible via the boolean-attribute path) and its source citation is
   stable; the `BOOLEAN_ATTRS` membership is stated.
3. The `cssDef` section answers the shell-owned-root question explicitly (a yes/no plus the sanctioned alternative),
   and its statement of where rules land matches the engine (the global dynamic stylesheet, not a per-node scope)
   at the documented version.
4. The matrix is versioned/citeable: a consumer can write "see `provident-ssr` docs → <matrix section>, verified at
   version X" in place of its own derivation.
5. **Consumer-side closure:** this repo's `docs/specs/ui-overhaul.md` §2.1 can then **cite the matrix** instead of
   deriving the list, and its Table C/Table B rows can reference the documented mechanism names rather than naming
   external halves ad hoc. (That edit is this repo's follow-up, not part of the request.)

**MCP-visibility consequence.** The matrix is what makes visibility claims checkable rather than asserted. A host
that documents "the modal frame is shell chrome, so `provident.get_rendered_html` does not include it; overlay
content in a separate graph scope is not reachable from the app Runtime" is making an isolation claim about the
engine — and the engine's own docs currently leave the host-side/browser-native half of that boundary to inference.
Documenting the matrix also protects the framework's central guarantee from a drift direction that is easy to
miss: a mechanic a host believes is "not graph state" may in fact be expressible (as `inert` was) — and a
mechanic a host believes is safe to keep outside the graph may be one whose *model* should have stayed inside it,
which would silently remove that state from the MCP surface.

**Priority.** P2 — quality/parity. It blocks no shipped consumer path (the consumer's inference is working today),
but it blocks a *verified* boundary: every consumer spec that states what the framework cannot do is currently
provisional, and the mis-`inert` case shows the inference had already drifted from the implementation once.

**Fallback if upstream declines.** The consumer keeps §2.1 as its own labelled inference and adds the
`BOOLEAN_ATTRS` + `cssDef` scoping facts it verified locally (package source + version), recording them in
`docs/FORK-DIVERGENCE.md` / `docs/pending.md` as consumer-verified rather than upstream-documented. Cost: the
inference stays per-consumer, its accuracy is not maintained across versions, and the next consumer re-derives it —
including whatever part of it has silently gone stale.
