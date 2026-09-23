# IMPACT REVIEW — the `provident-ssr@0.5.1` / `provident-editable@0.2.0` pull: what the updates mean for `C9 U-EDIT-1`'s editing surface

**Status:** **REVIEW RECORD — read-only pass; NOTHING was adopted.** This file records what
the two upstream updates *mean* for this repo's editing surface **before** anything is adopted.
No `package.json`, no lockfile, no `src/**`, and no tracker (`docs/decisions.md`,
`docs/pending.md`, `docs/next-steps.md`, `docs/defects.md`, `docs/HANDOFF.md`) was edited by this
pass — every tracker change this review implies is stated as an **owed row** in §7. The only file
written is this one.

**Date:** 2026-09-21 (the review's own date; the upstream 0.5.1 tag/commit is dated 2026-09-22 and
published 2026-09-23 — see §1 — so the ledger's dates are quoted with their source, never merged).

**Subject of the review.** The product owner reports: *"Provident-ssr and Provident-editable have
both been updated — pull changes and review for impact on editing."* The unit whose surface is at
stake is **`C9 U-EDIT-1`**, whose contract is
`docs/specs/unit-u-edit-1-whole-page-editing.md` — **mid-rebuild**, and which a read-only
adversarial pass just returned **FAIL** on (no production decode/diff; the commit seam routes into
a path that cannot write; the "tombstone" still materializes a real `<textarea>`; the property
oracles are vacuous — each verified here, §5).

**Layer honesty (RCA-12, declared up front).** This review is a **DOCUMENT + SOURCE** review: every
claim is read from a file in one of the three trees, and **no test, build, smoke or live run was
executed by this pass**. Every reading below is marked with the artifact it was read from. Where a
claim could not be read, it is recorded as **UNDETERMINED** (§8) rather than asserted.

**Citation convention.** `path` + symbol / row id / `§section` — **no line number appears
anywhere in this file** (the rule `docs/specs/requirement-catalog.md` §3.4 rule 7 establishes;
the same convention `docs/specs/unit-u-edit-1-whole-page-editing.md`'s header declares for
itself). Where an upstream document's own citations are line-numbered, that is quoted as that
document's text, never adopted as this file's convention.

**Upstream paths cited here (readable from this repo's parent directory).**
`../../Preempt-Providence/` (the `provident-ssr` source + docs; `AGENTS.md` item 1 names it) and
`../../Provident-Editable/` (the `provident-editable` package).

---

## 1. THE VERSION LEDGER (read, not assumed)

| Artifact | Version | Where read from | Status of the reading |
| --- | --- | --- | --- |
| **Installed `provident-ssr`** | **`0.5.0`** | `node_modules/provident-ssr/package.json` (`name`/`version`) | **READ — CONFIRMED.** Matches the task's established fact. |
| **This repo's dependency spec** | **`provident-ssr: ^0.5.0`** | `package.json` `dependencies` | **READ — CONFIRMED.** `^0.5.0` **admits `0.5.1`** (it is a compatible patch in the same major), so the pull is a **lockfile/install resolution**, not a range edit — see §6. |
| **Upstream `provident-ssr` working tree** | **`0.5.1`** | `../../Preempt-Providence/package.json` `version` | **READ — CONFIRMED.** |
| **Upstream release record** | tag **`v0.5.1`**, release commit `abd9a458fa26e11bb19c0c23420c2d89287e4b1c`, commit date **2026-09-22**, **published 2026-09-23** (`dist-tags.latest = 0.5.1`) | `../../Preempt-Providence/docs/releases.md` (the top index row + the 0.5.1 row) and `../../Preempt-Providence/docs/decisions.md` `RELEASE-0.5.1` | **READ — CONFIRMED**, including the release's own caveat that it was **published-and-propagated on 2026-09-23** while committing on 2026-09-22. |
| **`provident-editable`** | **`0.2.0`**, `type: module` (ESM), `main` → `dist/index.js`, `types` → `dist/index.d.ts`, `files: ["dist"]`, license AGPL-3.0 | `../../Provident-Editable/package.json` | **READ — CONFIRMED.** |
| **`provident-editable` in THIS repo** | **NOT INSTALLED** | `package.json` `dependencies` lists `provident-ssr` only; no `provident-editable` entry anywhere under `node_modules/` | **READ — CONFIRMED** (the task's established fact holds). |
| **`provident-editable` publish record** | published as `latest` since 2026-09-23, 41.5 kB tarball, `dist/`-only, runtime dep `parse5` | `../../Provident-Editable/README.md` §Release | **READ — ATTRIBUTED** (the README asserts it; this pass did not query the registry). |

**What 0.5.1 CARRIES — by reference (upstream's own itemization, not re-derived here):**
`../../Preempt-Providence/docs/releases.md` (the 0.5.1 row) and `docs/decisions.md`
`RELEASE-0.5.1` name exactly five items: **`BODYRUNS-DROP-DIAGNOSTICS`** (W4);
**`NO-CLONE-ENFORCEMENT` + `NO-CLONE-HARNESS-OPS` + `NO-CLONE-TEST-PHASE-ISOLATION`**;
**`DATA-DRIVEN-FAMILY-PATH-ENUMERATION`** (+ its `DERIVED-FAMILY-SHALLOW-DEF-FILL-EXCEPTION`
closeout); **`PASS2-FIT-REFERENCE-SLICE-SCOPE`** (the R1 fix); and
**`RUNTIME-FORK-GROWTH-GUARD`** (which supersedes `RUNTIME-FORK-TRIPWIRE-BOUND`).

**The ledger's single most important reading (read, and it governs §1.2/§3/§4).** The two release
rows state the release is a **patch (`X.X.Y`) whose enforcement half is "harness + test only — no
engine version implication"** — `../../Preempt-Providence/docs/specs/no-clone-invariants.md` §1
(*"Behaviour change: **NONE.** `src/**` is not a target of this unit"*) and §7 risk 5 (*"no `src/**`
change, no adapter change, no public-surface change, no version bump"*). That is the single fact
that decides most of this review: **the no-clone work is enforcement of an already-holding
invariant, and it adds no runtime behaviour.**

### 1.1 What 0.5.1 carries that IS a runtime behaviour change — and whether this repo sees it

| Release item | Runtime behaviour change? | Seen by this repo? |
| --- | --- | --- |
| **W4 `BODYRUNS-DROP-DIAGNOSTICS`** | **YES, and it is the only one** — a `console.warn` diagnostic layer at the emit resolver (`bodyruns-child-unresolved` / `bodyruns-child-duplicate` / `text-node-children-ignored`) + the C2 containment clamp in `emitElements` | **MEASURED ABSENT today, so the bump WOULD deliver it.** A read of this repo's installed engine for those exact codes found **no match** under `node_modules/provident-ssr/dist/**`; the codes are present in the upstream source at `src/core/render-helpers.ts` (symbol `warnBodyRunsDiagnostic`, called at the `bodyruns-child-unresolved` and `text-node-children-ignored` sites). Consequence for the surface at stake: **none directly** — this repo authors **no `bodyRuns` at all** (its traversal authors interleaved bare `text` children, `src/main/traversal.ts` `buildInterleavedChildren`), so the diagnostics are expected to fire **never** on this app's documents; see §6 risk R3 for why "expected never" still needs a check. |
| **`NO-CLONE-ENFORCEMENT` / `NO-CLONE-HARNESS-OPS` / `NO-CLONE-TEST-PHASE-ISOLATION`** | **NO** — test/harness/registry-side only | Not applicable to this repo's runtime; it changes the **upstream's** `npm test` shape (`"test": "vitest run && vitest run --config vitest.smoke.config.ts"` — read in `../../Preempt-Providence/package.json` `scripts`). Answering **Q2** in full. |
| **`DATA-DRIVEN-FAMILY-PATH-ENUMERATION` + its closeout** | **NO** — a `demo/fork-stress-data.js` page re-expression + the sanctioned-clone pin | Not applicable (a demo family; this repo imports no demo). |
| **`PASS2-FIT-REFERENCE-SLICE-SCOPE` (R1)** | **NO — output-preserving by contract** | **WOULD be delivered by the bump**, and it is the one engine-path change in the release: `src/core/resolve.ts` `fitReference`'s descendant walk is bounded to slice membership (`sliceSet`/bounded seed/bounded push). Upstream pins it output-preserving by **descendant-closure** and records the measured saving as ≈258 ms / 15.9 %. This repo is a *host*, not a fork-stress page, so the expected effect here is **performance-only and unmeasured by this pass**. |
| **`RUNTIME-FORK-GROWTH-GUARD`** | **NO** — a smoke guard redefinition (cross-family 3× retired → runtime-vs-runtime d10→d12 pass-2 ratio, bound 10×) | Not applicable (the upstream harness). |

### 1.2 The public API surface did NOT change across the versions — the delta is behavioural, not structural

**Read, both sides:** `../../Preempt-Providence/src/index.ts` (the 0.5.1 source re-export list) and
this repo's installed `node_modules/provident-ssr/dist/index.d.ts` (the 0.5.0 declarations) export
**the same symbol set**: the translate family, `Node`/`mintNodeId`/…, `Supervisor`/`focusedSliceFor`
+ the journal-view types, the dispatch family, `diffMinimal`/`MockAdapter`, `emitElements`/`applyOps`
/… + `BodyRun`, `DomAdapter`/`SSRFragmentAdapter`/`MarkdownAdapter`/`VOID_TAGS`, the serialize
family, `EventBridge`, `createClient`, the payload helpers, `registerTagSchema`/`validateNode`,
`Link`/…, `MAX_COMPILE_DEPTH`, the error classes, `applyDerived`/…, the debug switches, and the
type-only block. **Consequence: the bump is not expected to break `npm run typecheck`** — this
repo's 17 `provident-ssr` importers (`src/main/traversal.ts`, `src/renderer/runtime.ts`,
`src/renderer/pane-graph.ts`, `src/renderer/sidebar-panes.ts`, …, enumerated by a content search over
`src/**`) all consume names that exist on both sides.

**One documented package-identity nuance for the ledger (not a defect here).** The upstream release
pass records its own `package.json` as **`0.5.0` at the time of writing** and the bump as *"the
supervisor's edit"* (`docs/releases.md`, the version note) — while the tree now reads `0.5.1`. The
upstream tree is the authority this review reads; the reading is recorded so a later pass does not
"discover" a contradiction.

---

## 2. THE API DELTAS RELEVANT TO EDITING

### 2.1 What `provident-ssr` 0.5.0 → 0.5.1 changes on the surfaces this repo uses

**Nothing on the surfaces this repo uses — with one diagnostic-only exception, and one engine-
internal path fix.** Stated per surface, with the reading that decides it:

| Surface this repo uses | Delta | The reading |
| --- | --- | --- |
| **`DomAdapter` / element creation / prop baking** | **NONE** | `../../Preempt-Providence/src/core/adapters.ts` `DomAdapter.createEl` / `setProp` — every element type is still `document.createElement(type)` (the sole special case is the bare-`text` branch minting a `Text` node, which shipped in **0.4.0**); the boolean-attr table `BOOLEAN_ATTRS` (`hidden`, `readonly`, `inert`, `disabled`, `checked`, …) and `booleanAttrValue` are the **`HOST/U1-ENG`** contract recorded in `docs/specs/adapters.md` §3.2/§4.2 as *"Astrographer handoff HOST/U1-ENG"* — i.e. **this repo's own earlier request, already shipped**. 0.5.1's `src/**` is untouched by the no-clone unit (§1), so no adapter behaviour moves. |
| **`emitElements` / `applyOps` / the render ops** | **signature-stable; one warn added** | The W4 diagnostic keeps `emitElements`' signature stable *by design* — that is *why* it is a patch: `docs/decisions.md` `BODYRUNS-DROP-DIAGNOSTICS` (*"the `console.warn` channel keeps `emitElements`' signature stable"*) and `docs/specs/bodyruns-drop-diagnostics.md` §Target version. |
| **`translateLegacy` / the legacy envelope model** | **NONE** | No 0.5.1 item touches translate; the no-clone unit's own §2.2 EXPLICITLY OUT row 1 forbids any `src/**` change, and its §7 risk 5 states *"no adapter change, no public-surface change"*. |
| **`Supervisor` / `journalEntries`** | **NONE** | `journalEntries` shipped at **0.5.0** (`docs/releases.md`'s 0.5.0 row: `JOURNAL-READ-API`); 0.5.1 only *consumes* it (the harness census measurement). |
| **`resolve.ts` name resolution** | **R1 slice scope — output-preserving** | `src/core/resolve.ts` `fitReference`; pinned in `docs/decisions.md` `PASS2-FIT-REFERENCE-SLICE-SCOPE` (*"it changes nothing the engine computes"*) + `docs/specs/pass2-fit-reference-scope.md`. |
| **`render-helpers.ts`** | **the W4 clamp + warn only** | `docs/decisions.md` `BODYRUNS-DROP-DIAGNOSTICS` (*"`src/core/render-helpers.ts` ONLY … `emitElements`' signature unchanged"*). The C2 containment clamp is a `childOrder` **membership** test (`childWires.has(globalWire)`) — a *foreign-wire* defence, not a change to legitimate child resolution. |

**The one host-visible consequence of the W4 diagnostic, recorded because it is a real trap**
(`docs/decisions.md` `BODYRUNS-DIAGNOSTIC-DEDUP-SCOPE`, residual **R-W4-5**): C4's dedup set is
**module-level, keyed `${code}\0${elementWire}\0${value}`, and never cleared**, and the element wire
is **not document-scoped** — so the guarantee is **one warn per (code, wire, id) per PROCESS, never
per document**. A host rendering several documents in one process can be **silently denied** a
diagnostic it never saw, and an **absent line must never be read as "nothing was dropped."** This
repo is exactly such a host (multi-document tabs), so if it ever comes to rely on these warnings it
must route/wrap `console.warn` per document — recorded as an owed note (§7, O-4).

### 2.2 What `provident-editable@0.2.0` provides — the exported API, in full

Read from `../../Provident-Editable/src/index.ts` (the barrel) and `src/types.ts` (the types):

```ts
// the barrel: three value exports + five type exports — and NOTHING else
export { htmlToTree } from './html-to-tree.js'
export { diffTrees } from './diff.js'
export { providentPlainText } from './plain-text.js'
export type { ProvidentNode, ProvidentTree, StructuralDiff, ProvidentNodeType, ConvertOptions } from './types.js'
```

| Export | Exact signature (read from the source) | What it is |
| --- | --- | --- |
| **`htmlToTree`** | `htmlToTree(html: string, opts?: ConvertOptions): ProvidentTree` — `src/html-to-tree.ts` | `innerHTML` → a provident tree `{ root: ProvidentNode }`; the root is always a `div`; ids minted deterministically in pre-order `${idPrefix}-${n}` (default prefix `'n'`). `ConvertOptions` is **exactly `{ idPrefix?: string }`** — no render option, no mode option. |
| **`diffTrees`** | `diffTrees(prev: ProvidentTree, next: ProvidentTree): StructuralDiff` — `src/diff.ts` | a **two-tier ordered-tree match**: tier (a) an LCS keyed on **`type` + `content`** per sibling list (`computeLcsMatches`, key function `matchKey`), tier (b) a **NEAR-MATCH** that pairs an unmatched `prev` child with an unmatched `next` child **at the same index** and reports field-granular `update`s. Pure, deterministic, no DOM. |
| **`providentPlainText`** | `providentPlainText(node: ProvidentNode): string` — `src/plain-text.ts` | the derived plain-text projection (the value the pre-0.2.0 shape stored in `content`). Total — never throws. |
| **`ProvidentNodeType`** | the closed union, **19 members** — `src/types.ts` | the engine's element set: `h1..h6`, `p`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `strong`, `em`, `a`, `img`, `div`, plus **`text`** (the engine's own bare-emitted text-run type). Its own comment pins the relation: *"the consumer's 18-member RagNodeType … PLUS `text`"*. |
| **`ProvidentNode`** | `{ id: string; type: ProvidentNodeType; content: string; props?: Record<string, unknown>; children?: ProvidentNode[] }` | **the per-node XOR rule**: `content` is the node's OWN scalar text and is **`''` whenever the node has children** (the engine renders `escapeText(content) + children`); `children` is present ⇒ `content` is `''`. |
| **`StructuralDiff`** | `{ nodeChanges: { add: ProvidentNode[]; remove: ProvidentNode[]; update: NodeUpdate[] }; edgeChanges: { add: EdgeChange[]; remove: EdgeChange[] } }` | `add`/`remove` are **subtree-granular**; `update` is **field-granular** (`{ prevId, nextId, type?, content?, props? }` — only changed fields present); `props` carries the **FULL new props object**. |

**The four questions the brief asks about the package, answered from the files:**

1. **Peer / engine requirement.** `peerDependencies: { "provident-ssr": ">=0.4.0 <1.0.0" }`, and it is
   **`optional`** (`peerDependenciesMeta.provident-ssr.optional = true`). The engine is also an
   **exact test-only devDependency** (`"provident-ssr": "0.5.1"`) used by the `verify:engine` leg.
   `engines: { node: ">=16" }`. **⇒ this repo's `provident-ssr` (0.5.0 today, 0.5.1 after the pull)
   satisfies the peer range, and the range is OPTIONAL — the package installs and works with no
   engine present.** (Note the direction: `provident-editable` does **not** pin `0.5.1`; it requires
   `>=0.4.0 <1.0.0`. The `0.5.1` in its devDependencies is how *its own* render oracle was
   certified.)
2. **ESM or CJS.** **ESM only** — `"type": "module"`, `main` → `dist/index.js`, `exports["."]` exposes
   only `types` + `import` (there is **no `require` condition**). **⇒ a consumer must `import` it.**
   This repo is ESM already (`package.json` `"type": "module"`), so this is satisfied; but note that
   the deliverable this package would feed (`src/main/rich-decompose.ts`'s consumers, incl.
   `src/renderer/sidebar-panes.ts` and `src/main/*`) is bundled by **esbuild as CJS for main**
   (`package.json` `build`: `--format=cjs` for `src/main/main.ts`) — an ESM-only dependency is
   bundlable there, so it is a **build-shape consideration, not a blocker**.
3. **Typing surface.** `types` → `dist/index.d.ts`; the public types are the five exported from the
   barrel. Two interfaces used in signatures are **NOT exported from the barrel**:
   **`NodeUpdate`** and **`EdgeChange`** (`src/types.ts` declares them; `src/index.ts` does not
   re-export them). They are reachable by structural inference from `StructuralDiff` (a consumer can
   `type U = StructuralDiff['nodeChanges']['update'][number]`), which is what a typed adopter must do
   if it wants to name them — **recorded, because it is the one typing rough edge an adopter meets on
   day one.**
4. **Does it need a DOM?** **No.** The README pins it (*"No DOM in the core (plain-tree parsing via
   `parse5`), no network egress — pure, deterministic functions over plain data"*), the runtime
   dependency is **`parse5` only**, and the shipped `dist/` imports **no engine code** (the README's
   *"Render boundary"*: *"This package emits a DATA MODEL … no renderer, imports no engine code in its
   shipped `dist/`"*). **This is decisive for §3: it is a node-testable, DOM-free package — the same
   layer `C9`'s pure decode/diff contract already occupies.**

**The upstream package's own statement about THIS repo (read, and it is a fact this review must
carry):** `../../Provident-Editable/README.md` §Adoption status — **"There is currently NO adopter of
this package"**, *"the adjacent consumer repo that originated the requirement (Astrographer) built an
in-house equivalent instead and never installed this package"*, the public API being *"stable but
UNEXERCISED by any real adopter"*, and the recorded consumer/model divergence: *"its inline children
are `strong`/`em`/`a`/`img` with `offset`s, and a `text` child is a validation fail-state for it"*.

---

## 3. ANSWERS — per question, with the evidence

### Q1 — The deltas: what changed in `provident-ssr` 0.5.0 → 0.5.1 relative to this repo's use of it, and what `provident-editable` 0.2.0 provides

**Answer: the `provident-ssr` delta is (i) a diagnostic-only behaviour change that this repo is
expected never to trigger, (ii) one output-preserving engine path optimisation, and (iii) test/
harness/demo work that does not exist in this repo. The public API surface is unchanged and the bump
is admitted by the existing `^0.5.0` range. `provident-editable@0.2.0` provides a three-function,
ESM-only, DOM-free, optional-peer package: `htmlToTree`, `diffTrees`, `providentPlainText` (+ five
exported types).**

Evidence: §1 (the ledger), §1.1 (the per-item table), §1.2 (the identical export list both sides),
§2.1 (the per-surface table, incl. the `DomAdapter` reading and the `BOOLEAN_ATTRS` provenance),
§2.2 (the package's barrel + types + peer/engine/ESM/DOM answers).

### Q2 — THE CLONE QUESTION (the sharpest one): does 0.5.1's `no-clone enforcement` forbid `C9`'s surface authoring, which **clones** payload roots and deletes `placement` from the clones?

**VERDICT: NO — the enforcement does NOT forbid it, and it does not permit or require a different
construct either; it is simply OUT OF SCOPE for this construct.** The clone at stake is a
**host-side envelope-construction clone** (a plain object spread), not an engine cloning of a graph
node, and the enforced invariant governs **engine** placement/component paths only. The consequence
for the surface builder is therefore: **no change is required — but the rationale must be re-worded,
because the construct now sits next to a rule with the word "clone" in it, and a future reader will
otherwise read the collision as a violation.**

**The clone in question (read, exactly).** `src/renderer/pane-graph.ts`:
`assembleAppGraphEnvelope` (`assembleAppGraphEnvelopeBody`) → `pageEditSurfaceRoot(bodyRoots,
documentId, zone)` — the surface's `children` are
`bodyRoots.map(root => { const clone = { ...root, props: { ...(root.props ?? {}) } }; delete clone.placement; return clone })`.
Its sibling in the same builder does the same to the *payload entries* that the collected roots came
from (`const clone: LegacyNodeData = { ...node }; delete clone.placement`), so the document renders
exactly once inside the surface. This is `C9`'s `§2.1`/`§11.7` authoring row; the *why* is
`DECIDED: PLACEMENT-ONLY-PAYLOAD-ROOT` (a second placement anchor on the same node produced a second
route and the render emitted it TWICE — `LIVE-UF6`).

**The invariant spec, quoted (the enforcement's own statement of its scope).**
`../../Preempt-Providence/docs/specs/no-clone-invariants.md` quotes the user's verbatim rule:

> *"A placed node is attached to its parent by link only, using the original node. The graph is walked
> such that each valid path to root produces a wire, and the wire determines the render state.
> Placements and components should not clone nodes. Ever."*

and defines exactly **five invariants, I1..I5** (`§3`), each naming its **engine** code sites:
**I1** a `placement-attach` attaches the ORIGINAL node and registers ZERO new nodes (sites:
`src/core/translate.ts`'s placement mint, `src/core/ops.ts` `placementAttach`,
`src/core/supervisor.ts`'s `placement-attach` handler, `src/core/node.ts`'s anchor construction);
**I2** one node, many paths — the wire carries the multiplicity (sites: `node.ts` `enumPathWalks`,
`pathKeyFor`, `mintPathState`, `render-helpers.ts` `pathWireOf`/`armWires`); **I3** a component is
resolution + seam, never a copy (sites: `translate.ts` `mintDefPrototypes`, `registry.ts`
`registerDefPrototypes`, `node.ts` `materializeSeam`); **I4** `clone()` is reachable **only** from the
handler `clone-instance` route — *"The two and only two call sites of `Node.prototype.clone` in
`src/**` are `src/core/ops.ts:649` and `src/core/supervisor.ts:1243`, both on the `clone-instance` op
route. No translate / placement / resolution / emit / diff / apply path may call it."*; **I5** the
clone census is a measurement, not a constant.

**The code that enforces it, named.** The enforcement **is test-side**, and it is a **spy on the
engine's own class method**: `tests/unit/no-clone-invariants.test.ts` (cases NC-1a…NC-1g + the six
engine-side register rows) and `tests/unit/no-clone-guards.test.ts` (NC-2a…NC-2d + the P-SM-1 harness
row + the offline control), per `no-clone-invariants.md` §8 and its status block. The mechanism for
I4 is stated verbatim in §3 I4's *"Enforcement shape this unit required"* — *"A spy
(`vi.spyOn(Node.prototype, 'clone')`) proving **ZERO calls** across three pipelines … **plus a
positive control**"* — and it is `P-IM-4` in §5. **There is no runtime throw, no assertion, no
runtime check, and no new engine error anywhere in the release**: §2.2 EXPLICITLY OUT row 1 —
*"**Any change to engine behaviour.** A test that finds a violation is a **DEFECT discovery**, never a
licence to patch `src/**`"* — and §1 — *"Behaviour change: **NONE.** `src/**` is not a target of this
unit (only the harness `cloneOps` measurement + the guard ordering)"*.

**Two further scope ceilings that settle it outright (both quoted from the same spec):**
`§2.2` EXPLICITLY OUT row **2** puts *"The fork-stress fixture family's handler-driven cloning"* out of
scope as **SANCTIONED**; and `§6` row **10** states *"That the no-clone invariant holds for the
**handler** routes (`layer-apply`, `rows-mint`, `clone-instance`) — Those **are** handler logic and
*do* mint nodes by design … The invariant's scope is placement/component; asserting it handler-wide
would encode a rule that does not exist."* **The invariant's own scope is the engine's
placement/component pipelines — an envelope built by a host and handed to `translateLegacy` is
upstream of every site I1..I5 constrains, and the enforcement's instrument cannot even observe it.**

**The concrete consequence for the surface builder: NONE — and here is the mechanical proof from this
repo's side.** `assembleAppGraphEnvelope` calls **no** engine symbol at all on this path: it is a
**pure builder** that constructs plain `LegacyNodeData` objects (`{...root}`, `delete … .placement`)
and returns `{ envelope, paneIds }`; the envelope is later handed to `translateLegacy` inside the
engine. A `vi.spyOn(Node.prototype, 'clone')` installed around *this* repo's assembly would fire
**zero** times, because no `Node` exists yet. **Therefore: (a) the enforcement neither forbids,
permits, nor re-shapes the host clone — it is silent on it; (b) there is no throwing/reporting path to
hit; (c) no different construct is required and none is indicated by 0.5.1.**

**Is there a SANCTIONED upstream replacement for the clone approach? NO — and the honest reading is
that the clone is the *envelope-authoring* equivalent of the sanctioned pattern, not a workaround.**
The sanctioned replacement the upstream provides for *engine-side* cloning is "path enumeration over
one node + a wire per path" (invariants I1/I2; `docs/specs/placement-path-spec.md` **E2E-1** —
*"The fork test has ONLY the 22 prototype nodes (+ root). Generating the HTML elements, the compiled
states, and the passes that produce the render-adapter data must NOT require creating new nodes"*;
census row *"`cloneOps = 0`"*). At the **envelope** layer, the equivalent of "one node, one route" is
exactly what `C9` pins: the body roots **keep** their payload entries and their nodes, and only the
**route** (the placement announcement) moves to the surface. So the construct is already in the
sanctioned *spirit*; what must change is the **citation**, not the code.

**What this review therefore requires of `C9` (a documentation obligation, filed in §7 as O-1).**
`C9`'s §2.1 authoring row / §11.7 must state **by name** that (i) the "clone" is a **plain-object
envelope copy** (`{ ...root }` + `delete clone.placement`), (ii) it is **not** a `Node.clone()` /
`clone-instance` path, (iii) the enforced invariant is upstream-scoped to **engine placement/component
pipelines** (`../../Preempt-Providence/docs/specs/no-clone-invariants.md` §3 I1..I5, §2.2), and (iv)
the construct's real governing rule is this repo's own `DECIDED: PLACEMENT-ONLY-PAYLOAD-ROOT` plus
`LIVE-UF6`. **Without that sentence, the next reader will read "clones payload roots" against "no-clone
enforcement" and stop the unit for the wrong reason.**

**One genuine residual this review DID find in the construct (recorded, and it is NOT the no-clone
rule).** Because the originals survive in the envelope (they keep their payload entries) *and* the
clones carry them into the surface, the assembled envelope contains the **same authored
`props.id`/`data-rag-node-id` twice** for every collected body root. This is legal upstream — an
authored `props.id` always ships (`src/core/translate.ts`'s authored-id note: *"An AUTHORED props.id
always ships"*) — and the engine keys nodes by its own minted id internally, so it is not a translate
failure. But it is a **host-visible duplicate-id exposure**: any consumer that selects by
`props.id`/`data-rag-node-id` (this repo's MCP `get_rendered_html`/`get_markdown` surfaces, a DOM
census, a `document.querySelector`) can match an element that is not the one it believes it has. It is
**filed as an owed finding** (§7, O-2) because it is exactly the class of thing that turns into a
"phantom edit target" once the decode/diff lands. **It is not caused by 0.5.1 and the update neither
fixes nor worsens it.**

### Q3 — The editing tools question: does `provident-editable` 0.2.0 supply the decode/diff/import round-trip that `C9`'s §3.2/§3.3 require, and that the adversarial pass found missing in production?

**VERDICT: PARTLY — and the part it supplies is the part that is missing, but it does NOT drop in as
a whole-surface decode and it is NOT a substitute for the commit.** Precisely:

**What it supplies, mapped to `C9`'s contract:**

| `C9` clause | Requirement | `provident-editable@0.2.0` | Verdict |
| --- | --- | --- | --- |
| **§3.1** the decomposer — *"`decomposeRichHtml` applied to that block element's HTML"*, producing `{ content, children }` where `content` is the root's own text plus unwrapped text and `children` is the inline set (`strong`/`em`/`a`/`img`, `b`→`strong`, `i`→`em`, `span` folded into the parent's `content`) | an HTML → structured-content conversion with inline children | **`htmlToTree` returns a TREE, not the `{content, children}` pair.** Structurally it is *richer* (per-node `children` at every level, plus `text` run children and props) — and it emits **`text` run children**, a shape this repo's model does not have (`docs/decisions.md` `RICH-TEXT-EDITING-GATE` clause (1): *"`span` is NOT added to `RagNodeType` — it is a diff-matching artifact folded into the parent's `content`"*). ⇒ **adopting it means writing a reducer from `ProvidentTree` → `{ content, children }` (`RagNodeChild[]`)** — i.e. an adapter, not a call-site swap. | **PARTIAL — needs an adapter** |
| **§3.2** decoding the surface into an ordered list of `PageBlock` records `{ ragId, elementType, content, children, text }`, `ragId` from `data-rag-node-id`, `elementType` from the tag intersected with `RagNodeType` | per-block decode keyed by RAG id | `htmlToTree` mints its **own** ids (`${idPrefix}-${n}`) and its union is **`ProvidentNodeType` (19)** — not `RagNodeType` (**23**, `src/main/rag-store.ts` `type RagNodeType`). `data-rag-node-id` is not read by the package (it is not in its contract); it would arrive in `ProvidentNode.props` only if authored as a package-visible prop. ⇒ **the RAG-id mapping and the type intersection are the adopter's**, exactly as `C9` §3.2 already says. | **PARTIAL — the adopter's layer, by design** |
| **§3.2** the DIFF — per-block over the CLOSED field set `{ type, content, children, props }`, with the **minimal-op rule** (*"only changed sub-elements are written"*; a one-character edit in a 200-block document yields an op list naming **one** node id) | a structural diff with per-node granularity | **`diffTrees(prev, next)` supplies a real two-tier ordered-tree diff** — LCS by `type`+`content` then near-match by index — returning subtree-granular `add`/`remove` and field-granular `update` (`type?`/`content?`/`props?`). **It reads `prev.id` as the consumer's id** (`NodeUpdate.prevId` — *"the consumer's existing-subtree id — typically its RAG id"*), and the README's *"Which node gets the `update`?"* pins the ancestor-reporting rule (an ancestor is reported only when its OWN scalar `content` changes). | **YES — this is the missing piece** |
| **§3.3** one `applyBatch` per commit; the op list is a pure function of (decoded page, store snapshot); one invertible `batch` journal entry; one persist | the commit remains this repo's | **`diffTrees` emits a `StructuralDiff`, NOT `BatchOp[]`** — and it has **no concept of the store, the journal, `applyBatch`, `setProps` MERGE semantics, the `doc-child` containment edge, new-block id minting (`${documentId}:${type}:${n}`), the tombstone exclusion, or `CommitFailure`.** ⇒ **the commit's op-builder and the whole of §3.3/§3.4/§3.5 stay this repo's.** | **NO — out of the package's contract; it is a data-model producer** |

**What it does NOT supply, stated so it is not over-claimed:** the package's `diffTrees` has **no
`setType`/`setProps`/`setSubtree` op emission**, no **props-merge** semantics (its props update carries
the FULL new props object — an adopter must map it onto this repo's **MERGE** `setProps`, which is a
`C9` `FS3` obligation), **no** new-block id scheme, **no** deletion-edge derivation, **no** tombstone
skip, **no** `BatchResult`/`CommitFailure` vocabulary, and **no** DOM/adapter requirement (it never
touches the rendered surface — the adopter decodes `innerHTML` and hands it in). Its documented
**limitations** are also pinned and matter here: *"A pure reorder of two same-type+content nodes is NOT
detected"* (`computeLcsMatches`'s own comment), a **re-parent/reorder of distinct nodes is reported as
`remove`+`add`** (which `C9` §3.3 item 8's new-block/deletion representation would have to absorb),
and the `text` union member is a **validation fail-state for this repo's model** (the package's own
README says so).

**So: does it supply what `C9` §3.2/§3.3 require and the adversarial pass found missing?**

- **The §3.2 decode+diff half — YES, in real, adopter-untested form.** The adversarial finding is
  that the *production* decode/diff **does not exist**: a content search over `src/**` for the
  contract's own names (`PageBlock`, `decodePage`, `diffPage`, `buildPageOps`) returns **no match**,
  and the only decode implementation in the tree is **inside the test** — the
  `tests/unit-u-edit-1-property-register.test.ts` helpers `decomposeRichHtml(...)`-driven `decode(...)`
  and its local `diff(...)`, i.e. the register's oracle functions are **test-local**, which is exactly
  why the adversarial pass called the property rows vacuous (§5, MUST-FIX 2). `provident-editable`'s
  `htmlToTree` + `diffTrees` **are** that missing decode+diff, made a package — but they arrive with
  a **shape mismatch** (a tree + `text` runs instead of `{content, children}`) that an adopter must
  bridge.
- **The §3.3 commit half — NO.** Nothing in the package's exported API writes, batches, journals or
  persists. `C9`'s commit stays this repo's, and the adversarial finding about the commit seam (§5,
  MUST-FIX 1) is **untouched by this update, whichever package choice is made.**

**Does that SUPERSEDE `DECIDED: RICH-TEXT-EDITING-GATE`'s "the package plan was replaced by the
in-house build"? It CAN — but only if the repo *elects* to adopt, and this review's recommendation is
to elect it deliberately rather than by drift.** The decision row's exact text is
`docs/decisions.md` `DECIDED: RICH-TEXT-EDITING-GATE`:

> *"The rich-text converter is built IN-HOUSE as `src/main/rich-decompose.ts` (Unit U2, the pure
> `decomposeRichHtml` module — the `provident-editable@0.1.0` import plan was replaced by the in-house
> build)"*

Three facts decide whether that sentence is now false: **(i)** the package it names (`0.1.0`) never
existed as an installable release for this repo and still is not installed; **(ii)** the package that
DOES exist, `0.2.0`, is a **different shape** (ESM-only, `parse5`-backed, `text`-run union, per-node
XOR, `>=0.4.0 <1.0.0` optional peer) and is **explicitly "stable but UNEXERCISED by any real
adopter"** with the divergence this repo's own model has *"where it matters"*; **(iii)** `C9`'s
in-house decomposer decision was re-verified as a **condition** of that unit
(`docs/specs/unit-u-edit-1-whole-page-editing.md` §3.1: *"the `provident-editable` import tools … **that
package does not exist**"*, with a whole-tree `grep` as its evidence). **⇒ the honest position is:
`C9`'s §3.1 verification is now *stale in premise* (the package now exists) while its *conclusion*
(no package is installed here, so the commit may not import one) is still the recorded contract.**
The row is therefore **not superseded by this update** — it is **owed a re-verification**, and if the
supervisor adopts the package the supersession is a **named new row** with the surviving clauses
enumerated. **Two candidate supersession rows are drafted in §7 (O-3a / O-3b) — and per the
`C9` §4.2 rule (*"the `SUPERSEDED` rows land in this unit's own landing pass — never before"*) this
review writes NEITHER: it names them and leaves them to the pass that changes the code.**

**Recommendation (the review's own call, with its reason).** **Do NOT adopt `provident-editable` as
`C9`'s decomposer in this pass.** Reason, in one line: the *missing* half is the decode+diff
**within this repo's own model** (per-block `data-rag-node-id` resolution, the closed 4-field set, the
RAG-op builder, the containment edges), and the package supplies a **richer, differently-shaped tree**
that would require an adapter whose own correctness the package's README admits is unproven against
any consumer — while the package's certified-by-oracle render leg (its `verify:engine` at 38/38) is
about *rendering its own tree*, a surface `C9` does not need. **Adopt it as a cross-check oracle
instead**: `diffTrees` is a **pure, DOM-free, deterministic** implementation whose two-tier semantics
differ from `C9`'s minimal-op rule in a *documented, testable* way — using it in the rebuilt test
suites as an **independent comparator** (not as the shipped code) is a cheap way to make `C9`'s
property rows non-vacuous, because a row that must agree with an *independent* implementation cannot
be satisfied by a tautology. **That is a test-side proposal and belongs to the red set, not to this
review.**

### Q4 — The tombstone / DOM-adapter question: does 0.5.1 change how `type:'textarea'` (or any element type) materializes, prop baking (`hidden`/`readonly`), or contenteditable handling — i.e. does it change the adversarial finding that the tombstone renders a real `<textarea>`, or offer a construct for a non-rendered authored child?

**VERDICT: NO on all three. The bump changes nothing about materialization or prop baking, and the
upstream provides NO construct for a non-rendered authored child. The adversarial finding STANDS, and
the upstream's own adapters spec makes the stand explicit — which is the useful thing this review
contributes here: the finding is now *provable from the upstream contract*, not merely observed.**

**The adapter code, quoted (read at 0.5.1).** `../../Preempt-Providence/src/core/adapters.ts`,
`DomAdapter`:

```ts
createEl(type: string, wire: NodeRef, forkKey?: ForkPathKey): HTMLElement | Text {
  // BARE-TEXT-EMIT (Shape A1) — a `text` child is a REAL Text node; it has
  // no `dataset`, so the `el.dataset.wire = wire` write below must be skipped …
  if (type === 'text') { /* document.createTextNode('') | shim span; registers; returns */ }
  const el = document.createElement(type)          // ← EVERY other type, unconditionally
  el.dataset.wire = wire
  …
}
```

**Read plainly: the adapter's element-type dispatch has exactly ONE special case, and it is `text`
(0.4.0's bare-text emit). There is no `textarea` branch, no `inert` branch, no "skip creating this
element" branch — every non-`text` type is created unconditionally by `document.createElement(type)`
and mounted (or held in the open batch and then mounted).** The upstream contract states the same at
one step of abstraction in `docs/specs/adapters.md` §3.1 `createEl`'s step table: **step 0** is the
bare-`text` Text-holder branch — *"The **DOM cascade** … `createEl` special-cases `type === 'text'` →
`document.createTextNode('')` BEFORE the `dataset.wire` write"* (the same clause in
`docs/decisions.md` `BARE-TEXT-EMIT`) — and **step 1** is *"`document.createElement(type)` — de facto"*.
**There is no third branch. A `type:'textarea'` child materializes as an empty `<textarea>` element in
the live DOM, mounted inside its parent, with `data-wire` set.** That is precisely the adversarial
finding, and the update neither changes it nor offers anything that would.

**Prop baking, quoted, and the exact behaviour of the tombstone's two props.** `DomAdapter.setProp`'s
attribute branch: for a name that is not `text`/`css:`/`on:`/`data:`, the `prop:` prefix is stripped
and the name is checked against the closed **`BOOLEAN_ATTRS`** set — which contains both **`hidden`**
and **`readonly`**; when it matches:

```ts
const on = booleanAttrValue(val)                   // false/0/'0'/'false'/''/null/undefined ⇒ OFF
if (on) elem.setAttribute(attr, bakeValue(val))    // ON keeps the AUTHORED string form
else elem.removeAttribute(attr)
const el = elem as unknown as Record<string, unknown>
if (typeof el[attr] === 'boolean') el[attr] = on   // reflect the DOM property when it exists
```

with `booleanAttrValue` = *"`false`, `0`, `'0'`, `'false'`, `''`, `null`, `undefined` are OFF;
everything else is ON."* **⇒ `hidden: true` sets `hidden="true"` on a real, mounted element;
`readOnly: true` sets `readonly="true"` and reflects `el.readOnly = true`.** The *consequences for the
tombstone are exact*: the element **exists in the DOM**, is **removed from the rendered layout** by
the `hidden` attribute (so a *painted/visual* assertion may not see it), and is **non-interactive**
(`readonly`) — and the `hidden` attribute does **not** remove it from the DOM, so
`document.querySelectorAll('textarea')` **counts it**. The adversarial finding is therefore
**structurally correct and unavoidable**: the `C9` §5.1 tombstone
(`src/main/traversal.ts` `buildSubtree`'s authored child `{ type: 'textarea', props: { id:
'textarea-<ragId>', 'data-rag-node-id': ragId, hidden: true, readOnly: true } }`) **materializes a
real `<textarea>`**, `C9` §8.3 item 6's own live census (*"`document.querySelectorAll('textarea').length
=== 0` across the stage region, in **both** modes"*) would **fail**, and `FS21` (*"A rendered
`<textarea>` in the stage region…"*) is **met** by the current construct.

**Contenteditable.** Not special-cased anywhere in `createEl`/`setProp`: `contenteditable` is an
ordinary attribute name, so it routes to the generic `else elem.setAttribute(attr, bakeValue(val))`
branch and is **never** in `BOOLEAN_ATTRS` (so it is set as a *string* attribute, `"true"`). **⇒ no
change across 0.5.0 → 0.5.1, and `C9` §2.1's `props.contenteditable = true` on the surface root keeps
its 0.5.0 semantics.**

**Is there any upstream construct for a non-rendered authored child?** **NO — none is provided, and
this review checked the three places such a thing would have to appear.** (i) The adapter: no
skip/create-less branch, per the quoted dispatch above. (ii) The `text` type: the only "no wrapper"
mechanism upstream ships is **bare `text`**, and it is a *text* mechanism (a `Text` node holder) —
**it cannot carry an id + `data-rag-node-id` + two boolean props** (a `Text` node accepts only its
`text` prop: `setProp`'s `el.nodeType === 3` early return — *"a Text node (nodeType 3) accepts ONLY
its `text` prop (its data); any other prop degrades safely"* — so an id or a `hidden` on a `text` node
is silently dropped, and the engine's emit-side filter for `text` nodes drops `prop:`/`css:`/`on:`/
`data:` mappings too). (iii) The validation/adapter docs: `docs/specs/adapters.md`'s `createEl` tables
and `docs/decisions.md` `VOID_TAGS`/`BARE-TEXT-EMIT` contain no "authored but not rendered" concept —
the closest thing is `VOID_TAGS` (`br`/`img`/`input`), which is about *closing tags*, not
materialization.

**⇒ The consequence for `C9` is a decision it must take, and this review states the shape of the
options rather than choosing (it is the supervisor's, since it touches a fence):** the tombstone
cannot be made non-rendered from this repo's side by any authoring trick; the choices are
**(a)** keep the tombstone and **restate `C9` §5.1/`FS21`/§8.3 item 6** so that the assertion is on
*non-interactivity + `hidden` + the absence of handler defs* rather than a zero-`<textarea>` DOM
census (which then moves `PRUNE-311`'s **user-visible** outcome to "no *visible/interactive* textarea
editor"); **(b)** remove the child and **re-derive the fence** — which `C9` §5.1 and §11 item 2
already escalate as a **gate decision** (*"If the supervisor prefers a fence edit, that is a gate
decision … and this unit stops until it is made"*); or **(c)** author the tombstone **outside** the
traversal (e.g. as a non-rendered envelope annotation rather than a child) — which `C9` §11.7's
four-placement proof already ruled out for the surface and which the fence's child-list assertion
(`[undefined, 'textarea-ul', 'rag-li1', …]`) would reject anyway. **The update does not change which
of these is available; it removes the hope that the engine would provide a fourth.** Recorded as
O-5 in §7.

### Q5 — The other `C9` findings under the new versions: does the update change the fix shape of the adversarial MUST-FIX list?

**VERDICT: NO for three of the four; and for the fourth (the property rows) it does not change the
obligation but it does give the fix a *cheap, independent* oracle — a test-side opportunity, not a
code change.** Each finding is stated with what this pass independently verified, then the verdict.

| # | The adversarial finding | Independently verified here (read) | Does 0.5.1 / 0.2.0 change the fix shape? |
| --- | --- | --- | --- |
| **M1** | **No production decode/diff** — the §3.2 pipeline does not exist in `src/**` | **CONFIRMED.** A content search over `src/**` for the contract's own symbols (`PageBlock`, `decodePage`, `diffPage`, `buildPageOps`) returns **no match**. `src/main/rich-decompose.ts` `decomposeRichHtml` is the only production decomposer and it is **per-block HTML → `{content, children}`**, not a page decoder or a differ. The decode+diff that DOES exist is **test-local** (`tests/unit-u-edit-1-property-register.test.ts`: a local `decode(...)` over `decomposeRichHtml` + a local `diff(...)`), which is why the register's rows cannot fail against production. | **NO change.** `provident-editable` could *supply* the pair as a dependency (§Q3) but not without an adapter, and the missing piece (RAG-id resolution + the closed field set + the op builder) is this repo's in every case. The fix shape stays: **build the production decode/diff** (a new pure `src/**` module) against §3.2 and re-derive the register rows against **it**. |
| **M2** | **The commit seam routes into a path that cannot write** | **CONFIRMED, with the exact call chain.** `src/renderer/pane-graph.ts` `PAGE_EDIT_SURFACE_BLUR_BODY` reads the surface's `innerHTML` and calls `s.pageSurfaceBlur(el.innerHTML)` → `src/renderer/sidebar-panes.ts` `pageSurfaceBlur` (the `SidebarApi` bridge at `pageSurfaceBlur: (html?) => void this.pageEditSurfaceBlur(html ?? '')`) → `private pageEditSurfaceBlur(_html)` → `this.editController.commit(subject, _html)` **with the result discarded by `void`** → `src/renderer/edit-controller.ts` `EditController.commit(nodeId, content)` whose contract is **`edit.set_content`-class single-node content** (`EditControllerOptions.commit: (nodeId: string, content: string) => Promise<CommitResult>`, `CommitResult = { ok: true; nodeId } | { ok: false; reason: 'deleted-node' \| 'store-error'; error? }`). **The whole surface's HTML is passed as ONE node's `content`** — the `IPC_EDIT_BATCH`/`applyBatch` path §3.3 pins is never reached. (`C9` §3.4 step 2's own text requires `pageSurfaceBlur(html)` to *"decode the surface, diff it (§3.2) and build the op list"* — that body does not exist.) | **NO change.** The batch/journal/persist semantics the commit needs are entirely this repo's (`BatchOp`, `applyBatch`, the `batch` journal entry); `provident-editable` touches none of them. Fix shape stays: **decode → diff → one `IPC_EDIT_BATCH` → one `applyBatch`**, and the `void`-discarded result must become a read-and-branch (`FS12`). |
| **M3** | **The property oracles are vacuous** | **CONFIRMED, and mechanically explained.** The register file's rows call **test-local** `decode`/`diff` implementations; the rows that needed the production pipeline therefore verify a *re-implementation of the contract written by the same pass*, not the shipped behaviour. Two further structural reasons read here: (i) the register rows' oracles are computed **inside the same helper set that produces the inputs** (`pageFor`/`decode`/`diff`), so a wrong assumption is shared by input and oracle; (ii) `P-IM-1`'s control (*"S = ∅ ⇒ ops = []"*) and the other controls are satisfiable by a constant — the exact vacuity class `../../Preempt-Providence/docs/specs/no-clone-invariants.md` §5/§7 risk 1 names (*"an anti-vacuity clause naming the positive control its generator must CONSTRUCT and assert"*). | **NO change to the obligation** — the rows must be re-derived against the production pipeline. **A cheap new lever exists**: adopt `provident-editable` **as a test-only cross-check** (§Q3) so at least one row compares against an **independent** implementation. This is the only place in the whole update that makes an adversarial finding *easier* to fix — and it is test-side, `src/**`-free. |
| **M4** | **The tombstone still materializes a real `<textarea>`** | **CONFIRMED from the upstream adapter contract, not just from observation** — §Q4 above (one special case, `text`; every other type `document.createElement`). | **NO change**, and the update **forecloses** the "maybe the engine has a non-rendered construct" hope: it does not (§Q4, three checks). Fix shape stays `C9`'s own three-way decision (O-5). |
| **M5** (the live battery) | **The live battery is un-run, and `C9`'s own honesty note says so** | **CONFIRMED.** `docs/specs/unit-u-edit-1-whole-page-editing.md` §11 amendment `11.8` item 5: *"`U-EDIT-1-LIVE` (§8.3) is still UN-RUN and OWED, with no live measurement in the landing pass"*, and *"per RCA-11/RCA-12 the unit is not pre-DONE while `U-EDIT-1-LIVE` is un-run."* | **NO change** — the live battery is this repo's own surface (Electron + MCP/CDP), and no update touches it. Its assertions gain **nothing** from the bump: §8.3 item 6's zero-`<textarea>` census is **expected to FAIL** as the construct stands (§Q4), which is itself the live evidence that M4 is real. |

**The one cross-cutting observation worth recording:** none of the four adversarial findings is
**caused** by, **fixed** by, or **blocked** by the two updates. **The updates are orthogonal to the
`C9` failure set** — which is itself the review's most decision-relevant conclusion: **there is no
case for sequencing the dependency pull *before* the `C9` fixes in the hope that it repairs anything,
and no case for the fixes to wait on the pull.**

---

## 4. THE ADOPTION PLAN

### 4.1 The dependency change to make (and the exact diff)

**One change, and it is an INSTALL, not a range edit:** this repo's `package.json` already declares
**`"provident-ssr": "^0.5.0"`**, which **admits `0.5.1`**. So:

**Recommended (this pass's call):** _no `package.json` edit at all_ — resolve the lockfile to `0.5.1`
via the ordinary install path (`npm install` on the existing range), i.e. the diff is
**`package-lock.json` only** (`node_modules/provident-ssr/package.json` `version` `0.5.0` → `0.5.1`).
This is the **smallest** diff that delivers the update, it needs no range decision, and it cannot be
described as a version-policy change.

**If a pin is wanted instead (a supervisor choice, not this review's):** the alternative is
`"provident-ssr": "^0.5.1"` (a floor bump — still compatible-range, still no major) **or**
`"provident-ssr": "0.5.1"` (an exact pin, which is what `provident-editable` itself does for its own
test-only engine leg — `devDependencies: { "provident-ssr": "0.5.1" }`). **The exact pin is the choice
this review would make if reproducibility of the *rendered* surface outranks upgrade convenience**,
and it is consistent with the neighbouring package's own practice. **Either way, record the choice and
its reason in the pass's tracker row** (§7, O-6) — a silent range change is exactly the drift
`docs/decisions.md`'s VERSIONING-SCHEME-class rows exist to prevent.

**Not recommended now:** adding `provident-editable`. If it is ever added it should be a
**`devDependency`** (a test-only cross-check oracle per §Q3) rather than a runtime dependency — its
runtime dependency footprint is `parse5` and its engine peer is optional, but its *contract value* to
this repo is its independence, which a test-only position preserves.

### 4.2 The order, relative to `C9`'s fix list

**Rule (this review's recommendation): the pull is INDEPENDENT of the `C9` fix list and should be
sequenced AROUND it, not inside it — for one structural reason and one process reason.**

- **Structural reason:** every `C9` MUST-FIX lives in this repo's own surfaces (`src/**` decode/diff,
  the commit seam, the tombstone, the register, the live battery). The update's only runtime effect on
  those surfaces is **one warning channel this repo is expected never to trigger** (§1.1) and **one
  output-preserving engine path optimisation** (§1.1). Adopting it first therefore buys the `C9` fixes
  **nothing** (§Q5), while giving the fix pass a **moved floor** to work against.
- **Process reason:** `AGENTS.md` item 3 / RCA-1 require a **recorded red run per unit** before its
  implementation. A dependency bump that moves the engine underneath a mid-rebuild unit contaminates
  exactly that record — a red row could be a stale pin or a real regression, and the unit's own
  red/green evidence would be ambiguous. `docs/HANDOFF.md`'s `SUITE-RED-AFTER-VITEST5-ELECTRON44`
  precedent is this same hazard, already paid for once in this repo.

**Recommended order:**

1. **`C9`'s fix list FIRST, on the current `0.5.0` floor** — in the unit's own cycle (RCA-1/RCA-2/RCA-3
   /RCA-6/RCA-11/RCA-12): production decode/diff → the commit seam → the tombstone decision → the
   register re-derivation → the live battery. **Reason:** the unit is mid-rebuild and a FAIL was just
   returned; the fast path to a *sound* unit runs on an unmoved floor.
2. **Then the dependency pull as its OWN pass**, with its own recorded readings (§4.3), and with the
   `C9` unit's numbers **re-read after** the bump (because a bump can move a census and this unit pins
   censuses).
3. **Then the `C9`-adjacent documentation reconciliations the pull makes stale** — the `0.5.1` release
   facts (this review exists because they were not in the trackers), plus `C9` §3.1's
   "the package does not exist" premise, which the update **invalidates as a premise** while leaving
   its conclusion (no package installed ⇒ the commit may not import one) intact.
4. **`provident-editable` LAST and only if adopted deliberately** (§Q3) — and if adopted, as a
   `devDependency` cross-check oracle first, with adoption-as-decomposer decided as a **named
   supersession** of `DECIDED: RICH-TEXT-EDITING-GATE` (§7, O-3a/O-3b).

### 4.3 The risks, and the checks to run

| # | Risk | Why it is real here (evidence) | The check that catches it |
| --- | --- | --- | --- |
| **R1** | **A dependency bump can RED the suite — this repo has paid for that once already** | `docs/HANDOFF.md`'s current-state paragraph names the **DEC-2 regression** and the two landed units **`vitest-5` / `electron-44` migration** (`docs/specs/unit-v5-migration.md`) that fixed it (`SUITE-RED-AFTER-VITEST5-ELECTRON44`). A `provident-ssr` patch is a *smaller* bump, but the class is the same: the suite pins **rendered output and censuses** that an engine change can move. | **The trio, both sides of the bump, with the counts RECORDED:** `npm test`, `npm run typecheck`, `npm run build` (AGENTS.md item 4). **The before/after reading pair is the evidence** — a bump with no before-reading cannot be attributed. |
| **R2** | **The engine's OWN suite is currently RED, so "upgrade and re-run your tests" is not a proxy for health** | `../../Preempt-Providence/docs/defects.md` **`FORK-STRESS-TRIPWIRE-STALE-SPEC`** records *"three test-side assertions encode the RETIRED cross-family tripwire contract and now FAIL"* and *"After the guard redefinition, `npm test` reports **6 failures, all of them stale-contract assertions** (NOT engine regressions)"*, incl. `tests/unit/no-clone-guards.test.ts` still requiring the retired guard id `runtime-fork-tripwire` and `tests/unit/pass2-fit-reference-scope-measurement.test.ts` parsing the OLD `[runtime-fork:tripwire] … (3× asserted)` text. **⇒ the upstream's red is TEST-SIDE debt in the upstream's own files; it does not ship in `dist/`, so it does not transfer here — but nobody may read "upstream is red" as "the published dist is unsound", and nobody may read "upstream is green" from a tag that predates the ruling.** | **Read the upstream defect row, do not re-derive it.** For THIS repo: nothing to check beyond R1 — the six failures are files this repo does not contain. Record the reading in the pull's tracker row so a later pass does not "discover" it and mis-attribute it. |
| **R3** | **The W4 warning channel could fire on this app's documents and be read as a regression** | The diagnostic is new *here* (measured absent in the installed 0.5.0, §1.1) and its dedup is **process-scoped and never cleared** with **no per-document completeness guarantee** (`docs/decisions.md` `BODYRUNS-DIAGNOSTIC-DEDUP-SCOPE`, residual `R-W4-5`). This repo authors **no `bodyRuns`**, so the expected count is **0 — but "expected 0" must be measured, not assumed**, and an **absent** line must never be read as "nothing was dropped" (the row's own host expectation). | **Run the suite with `console.warn` captured and assert the census**: the three codes (`bodyruns-child-unresolved`, `bodyruns-child-duplicate`, `text-node-children-ignored`) must appear **zero** times. If any appears, it is a **DEFECT DISCOVERY** → `docs/defects.md` + `docs/HANDOFF.md`, **never** a licence to patch the package (AGENTS.md item 7). The upstream's `no-clone-invariants.md` §2.2 row 1 states the same discipline for its own side: *"A test written from §8 that finds a violation is a **DEFECT DISCOVERY** … and **never** a licence to patch `src/**`."* |
| **R4** | **The fence suites are this repo's most likely red under any engine bump** | `C9` §5.1/§8.4 name the fences and their standing pin: **`tests/traversal.test.ts`** and **`tests/import-render-no-duplicates.test.ts`** — *"must stay green UNCHANGED"* / *"may not be re-derived"* — and the first **pins the authored child list `[undefined, 'textarea-ul', 'rag-li1', …]`**, i.e. exactly the envelope shape the tombstone preserves on purpose. | **Keep the two fence suites green UNCHANGED across the bump** and treat any fence movement as a **gate decision**, never an adaptation (`C9` §5.1 / §11 item 2; `docs/specs/design-extensions-review.md` §14.2). Report them by name in the pull's reading. |
| **R5** | **The engine-hop suite and the divergence leg are the bump's other exposed legs** | `package.json` `scripts` includes `battery` (`tests/e2e-battery.test.mjs`) and `divergence` (`scripts/electron-divergence.mjs`) — both exercise the engine through the real shell, which is where a diagnostic or an emit-path change would show. | **Run both, before and after.** They are the closest thing this repo has to an "assembled" check that a node suite cannot provide (RCA-12's layer warning applies: a node-green is **envelope-green**, not app-green). |
| **R6** | **A silent range change is drift** | The recommended pull edits **no `package.json`** (§4.1), so a later reader cannot tell from the manifest that the engine moved — only the lockfile shows it. | **Record the version pair (`0.5.0 → 0.5.1`) and the resolution reasoning in the pull's tracker row** (§7, O-6), exactly as `docs/decisions.md`'s release rows and `docs/releases.md`'s index do upstream. |
| **R7** | **The packages must NEVER be patched here** | `AGENTS.md` item 1 (*"Agents MUST NOT make direct changes to the package code (`node_modules/provident-ssr/` or the upstream folder)"*) and item 7's **catalogue + handoff rule**, reinforced by `no-clone-invariants.md` §2.2 row 1's identical discipline on the upstream side. | **Every bump-induced failure is classified first**: **host-side** (`src/**`) → fixed here with a regression test; **package-side** → `docs/defects.md` row (observed symptom, reproduction, suspected root cause, proposed fix shape — upstream-owned) **+ `docs/HANDOFF.md`**, and **never** patched. |

**The trio readings to capture (the deliverable of the pull pass, per RCA-12's layer rule):** for
**each** of `npm test`, `npm run typecheck`, `npm run build`, and (if run) `battery` / `divergence`:
the **before** reading on `0.5.0`, the **after** reading on `0.5.1`, and the **delta**, each stated
with **which layer** it covers (envelope/pure vs assembled/renderer/app). Plus the **three named
fence suites'** individual statuses and the **W4 warn census** (R3). **A pass that reports only the
after-reading has not performed this review's checks.**

---

## 5. WHAT THIS REVIEW DID NOT DETERMINE (recorded, not smoothed)

1. **No test, build, smoke, or live run was executed.** Every "measured" claim above is a **file
   reading**. Where the review says *"the published 0.5.0 dist lacks the W4 codes"*, that is a
   **content search over `node_modules/provident-ssr/**`** — a strong reading, but not a run.
2. **The registry was not queried.** The `0.5.1` publish state and `provident-editable@0.2.0`'s
   `latest` state are read from the **upstream release records and the package README**, which state
   them; this pass did not fetch the registry. (A targeted web search from this session returned **no
   relevant registry pages** for either package name — both are low-visibility/private packages — so
   the web contributed nothing verifiable here; the authoritative sources are the two adjacent trees,
   and every citation in this file is to them.)
3. **The 0.5.0 → 0.5.1 `dist/` artifact diff was not computed** — the upstream tree has **no built
   `dist/`** (a glob over `../../Preempt-Providence/dist/**` returns nothing; upstream builds at
   `prepack`), so the comparison available was **source-to-source** plus the release records, not
   artifact-to-artifact.
4. **`provident-editable`'s `dist/` is also absent from its tree** (a glob over
   `../../Provident-Editable/dist/**` returns nothing; `files: ["dist"]`, gitignored + built at
   `prepack`), and **its `docs/` tree is absent too** — so its README could not be checked against
   `docs/specs/html-to-provident-tree.md`, which the README cites as the contract. The **source**
   (`src/**`) was read directly instead, which is why the API table in §2.2 is source-derived, not
   README-derived.
5. **Nothing about the R1 performance change was measured here** (the ≈258 ms / 15.9 % figure is
   upstream's, quoted as such).
6. **The `C9` adversarial report itself was not found as a persisted artifact** in this tree (a glob
   over `archive/reviews/**` and `docs/reviews/**` returned no `C9`/`U-EDIT-1` adversarial record), so
   the four findings are carried as the **task's report** and each was **independently re-verified
   against the code** (§5's table). **If that report exists somewhere this pass could not see, the
   findings' provenance should be repointed to it** — an owed citation, §7 O-7.

---

## 6. THE OWED-UPSTREAM ROWS (gaps this update leaves, for `docs/defects.md` + `docs/HANDOFF.md`)

**Scope note (binding, per the read-only constraint on THIS pass):** none of these rows is written by
this pass. They are **drafted here** with the fields `docs/defects.md` uses (id / severity+status /
observed symptom / reproduction / suspected root cause / proposed fix shape — upstream-owned) so the
pass that owns the pull can file them **verbatim**.

| id | Class | The gap | Evidence read | Proposed disposition |
| --- | --- | --- | --- | --- |
| **O-1** | **OWED-DOC (this repo's own spec)** | **`C9`'s §2.1/§11.7 authoring row does not distinguish the envelope-level `{...root}` copy from an engine `clone()`, and now sits beside a release whose headline word is "no-clone enforcement".** A future reader can read the collision as a violation and stop a green unit. | `src/renderer/pane-graph.ts` `pageEditSurfaceRoot`/`assembleAppGraphEnvelopeBody`; `../../Preempt-Providence/docs/specs/no-clone-invariants.md` §3 I1..I5 + §2.2 row 1 + §6 row 10. | **Re-word `C9` §2.1/§11.7** to state: plain-object envelope copy; not `Node.clone()`; the enforced invariant's scope is **engine placement/component pipelines**; the governing rule is `DECIDED: PLACEMENT-ONLY-PAYLOAD-ROOT` + `LIVE-UF6`. **No code change.** |
| **O-2** | **HOST DEFECT (this repo's, not upstream's) — NEW** | **Duplicate authored ids in the assembled envelope.** The surface's children are copies that keep the body roots' authored `props.id`/`data-rag-node-id` while the originals still carry their payload entries — so the same authored id appears twice in the assembled graph, and any `props.id`-keyed reader (MCP rendered-HTML/markdown surfaces, a DOM census, a `querySelector`) can match the wrong element. Legal upstream (authored ids always ship) ⇒ **not a package defect**. | `src/renderer/pane-graph.ts` (`pageEditSurfaceRoot`'s `{...root, props:{...}}` + the payload-entry clone); `src/core/translate.ts`'s authored-id note (*"An AUTHORED props.id always ships"*); `C9` §2.1's stable-authored-id row and §3.2's `data-rag-node-id` decode key. | **File here as a host defect row** (this repo's `src/`), with the fix shape a decision for the `C9` fix pass (e.g. mark the collected originals as non-rendered/suppressed, or move the ids to the surface's subtree deliberately and document the two-identity shape for every consumer). **Not a handoff to upstream.** |
| **O-3a** | **OWED-ROW (supersession, drafted — NOT written here)** | **If `provident-editable` is ADOPTED as `C9`'s decomposer**, `DECIDED: RICH-TEXT-EDITING-GATE`'s clause *"the `provident-editable@0.1.0` import plan was replaced by the in-house build"* becomes **stale in premise** (the package now exists at `0.2.0`). | `docs/decisions.md` `RICH-TEXT-EDITING-GATE`; `C9` §3.1 (its whole-tree `grep` verification, which the update invalidates as evidence); `../../Provident-Editable/README.md` §Adoption status; §Q3 above. | **A NAMED `SUPERSEDED` row in the landing pass** (`C9` §4.2's rule: written **at landing, never before**), enumerating the surviving clauses (the in-house module's role, the model clauses (1)/(2)/(3), the sequenced-slice record) and the superseded clause (the "replaced by the in-house build" premise). |
| **O-3b** | **OWED-ROW (re-verification, drafted — NOT written here)** | **If the package is NOT adopted**, `C9` §3.1's *"that package does not exist"* is still **factually wrong now** and must be re-pointed to the accurate statement: *"the package exists at `0.2.0`; it is not installed here; the commit may not import it under this unit's recorded contract"* — plus the `docs/decisions.md` `pending.md`-style note that the import plan was **superseded by the in-house build on its own merits**, not by the package's non-existence. | `C9` §3.1; the same evidence set as O-3a. | **A re-pointing edit to `C9` §3.1 in the unit's next pass** (citation hygiene, AGENTS.md item 6c) — **with no contract change.** |
| **O-4** | **OWED-DOC (upstream, informational — a `pending.md`-class note here)** | **The W4 diagnostic's per-document suppression.** One warn per `(code, wire, id)` per **PROCESS**, dedup set never cleared, wire not document-scoped ⇒ a multi-document host can be silently denied a diagnostic it never saw; an absent line must not be read as "nothing was dropped". | `../../Preempt-Providence/docs/decisions.md` `BODYRUNS-DIAGNOSTIC-DEDUP-SCOPE` + residual `R-W4-5` (deliberately **not fixed** upstream — *"observability/documentation debt, NOT a code bug"*). | **Record in this repo's `docs/pending.md`** as a host-side constraint the MCP/debugging surfaces must respect **if and when** the W4 diagnostics are relied on. **No upstream request** (upstream has already adjudicated it and recorded the host expectation). |
| **O-5** | **OWED-DECISION (gate, this repo's)** | **The `type:'textarea'` tombstone cannot be made non-rendered from this repo's side, and the update provides no construct that would.** The choice between (a) restating `C9` §5.1/`FS21`/§8.3 item 6, (b) re-deriving the fence, or (c) re-placing the tombstone is a **gate decision** (`C9` §11 item 2 already escalates the fence half). | `../../Preempt-Providence/src/core/adapters.ts` `createEl`/`setProp`; `docs/specs/adapters.md` §3.1 step 0/step 1; `../../Preempt-Providence/docs/decisions.md` `BARE-TEXT-EMIT`; `C9` §5.1/§8.3 item 6/`FS21`; `src/main/traversal.ts` `buildSubtree`. | **Escalate to the supervisor with this review's reading attached** (the "no upstream construct exists" half is new information for that decision). |
| **O-6** | **OWED-ROW (tracker, this pass's own)** | **Neither release is in this repo's trackers.** `provident-ssr@0.5.1` and `provident-editable@0.2.0` exist as facts with no row (`docs/decisions.md`/`docs/pending.md`/`docs/HANDOFF.md`), so the next pass would re-discover them. | §1 of this file (the whole ledger); `docs/HANDOFF.md`'s upstream-row convention; `docs/decisions.md`'s `RELEASE-0.5.1`-class precedent. | **A tracker row** recording: the version pair; the pull decision (§4.1) and its reason; the `0.5.1` release's five items **by reference**; the `provident-editable` non-adoption (or adoption) decision; and a pointer to **this file**. |
| **O-7** | **OWED-CITATION** | **The `C9` adversarial report's provenance.** The four MUST-FIX findings are cited in this review as the **task's report**, re-verified against code, but no persisted adversarial artifact for `C9`/`U-EDIT-1` resolves in this tree. | §5's table; a glob over `archive/reviews/**` + `docs/reviews/**`; `C9` §8.2 item 5's requirement that the findings be *"recorded in this file's §3a/§3b"*. | **Locate the report and repoint `C9` (and this file) to it**, or record it as **received-in-context / not persisted** — the exact device `../../Preempt-Providence/docs/specs/no-clone-invariants.md` §"RESOLVED 1" uses for its own unpersisted audit report, which is the cleanest precedent for this class. |

---

## 7. VERIFICATION KIT (what a later pass must do to falsify this review)

Read-only, cheap, and each step names the artifact it would change:

1. **Resolve the registry**: `provident-ssr@0.5.1` and `provident-editable@0.2.0` exist and are the
   `latest` versions claimed (§1) — if either does not resolve, **§4.1's pull is impossible** and this
   file's §1 ledger is wrong.
2. **Diff the artifact, not the source**: install `0.5.1` in a scratch directory and compare its
   `dist/core/adapters.js` + `dist/core/render-helpers.js` against the installed `0.5.0` — the two
   claims to falsify are *"adapter behaviour unchanged"* (§2.1) and *"the W4 warn codes are new"*
   (§1.1).
3. **Falsify the clone verdict** (§Q2) by the mechanical test the invariant's own I4 uses: install a
   `vi.spyOn(Node.prototype, 'clone')` around this repo's `assembleAppGraphEnvelope` path and assert
   **zero** calls (if it fires, the surface builder IS on a clone path the enforcement reaches, and
   §Q2's verdict is wrong).
4. **Falsify the tombstone verdict** (§Q4) with a two-line node/DOM check: author the tombstone child,
   run it through the adapter, and read `querySelectorAll('textarea').length` on the mount (if it is
   `0`, the finding M4 is wrong and `C9` §8.3 item 6 stands as written).
5. **Run the trio both sides of the pull** (§4.3 R1) and the two fence suites (§4.3 R4), capture the
   **W4 warn census** (§4.3 R3), and record every reading with its layer (RCA-12).

**Nothing in this file is a contract.** It is a review record: every finding above is either an owed
row (§6), an adoption decision for the supervisor (§4), or a re-statement of a fact already recorded
elsewhere — cited, never re-pinned.
