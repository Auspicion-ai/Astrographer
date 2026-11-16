# FEATURE REQUESTS → the **Provident-Electron foundation** project (handover from Astrographer)

**Date:** `2026-11-16` · **Requester:** the Astrographer shell (a fork of Provident-Electron, pinned at `e8dfb57730f657521d543c8d49f0d67e7ee1e6d4`) ·
**Status:** OPEN — filed; **the foundation tree is never patched from here** (`AGENTS.md` item 7, `strata/decisions.md` D-9) ·
**Companion handoffs:** `docs/L1/foundation-features-findings.md` (the finding list these three items are the disposition of), `docs/L1/foundation-migration-program.md` (the program that met them), `docs/HANDOFF.md` (the index), `docs/feature-requests/provident-electron-shell-chrome-requests.md` (`SC-1..SC-7`) and `docs/feature-requests/provident-electron-shell-chrome-handoff.md` (`SCH-1..SCH-13`) — **the sibling mechanism sets**.
**Numbering:** `DLV-1..DLV-3` is a **new series on purpose**. `SC-n` is the SC document's numbering authority and `SCH-n` the handoff's; a request filed in a third document does not claim a slot in either (`docs/feature-requests/gnosis-engine-prerequisites.md`'s `GRQ-n` is the precedent).

**How each request is written:** *problem → the foundation's today shape (file:line, read in this repo's pin) → why the existing route cannot serve → requested contract → acceptance criteria (assertable without layout) → MCP-visibility consequence → priority → fallback if upstream declines → filing verdict.* Priorities are the SC document's: **P0** blocks a shipped consumer path; **P1** blocks a planned consumer unit; **P2** quality/parity; **P3** destination/future.

**Verification discipline.** Every foundation and fork `file:line` below was re-read on `2026-11-16` in `/media/ryanr/Shared Files/Projects/Provident-Electron` at the pin and in this repo. **No line is cited from memory, and this document claims no run**: it is an intake artifact (the program it serves ran no leg either).

---

## Why these are foundation requests, not app features

`docs/FORKER.md:33-34` fixes the split this document obeys: *"A fork change that is a MECHANISM belongs in an `SC-n` request; app behavior stays in the fork."* Every item below is **the structure beneath a fork's own panes** — a subscription's arity, a family's extension contract, the delivery shape for a source that is not the record. None of them asks the foundation to learn Astrographer's vocabulary: no pane id, no RAG term, no engine route, and no display-state member appears in any requested shape (§5).

**The honest priority statement, made once so no reader over-reads the set.** **None of these three blocks a unit of the migration program.** That program ports the seam by hand (`docs/L1/foundation-migration-program.md` §8 `ASM-B-1`), so it needs none of the three to land. They block the route `strata/pending.md` row 1 still holds open — *"whether surface (d) adopts the foundation's record families wholesale, reconciles them against the fork's carriers, or is narrowed"* — and they block **every other fork** that adds a pane family today.

---

## DLV-1 — the delivery's subscription must carry the address it was called for (P2)

**Problem.** `ViewDelivery.subscribe(handler: () => void)` takes **no argument** and the fan-out calls `handler()` with nothing, while the app's `sink` is handed the **address** on the same delivery:

```ts
// src/main/view-record/index.ts:1416-1419, :1442-1452
export interface ViewDelivery { readonly entries: readonly ViewDeliveryEntry[]; subscribe(handler: () => void): () => void }
/* … */ const notify = (address: readonly string[]): void => { for (const handler of [...handlers]) { try { handler() } /* … */ } sink(address) }
```

It is the **stated** contract, not a bug: *"`subscribe(handler: () => void): () => void` STANDS, VERBATIM … a committed change of any of the four roots calls `handler` once"* (`READ` `docs/L3/view-record/delivery.md:30`), and the foundation's own app has exactly ONE destination (`READ` `src/main/view-record/index.ts:1432-1433`).

**Why the existing route cannot serve.** A fork has N panes, not one. With an address-less fan-out, each pane's consumer either subscribes N times and repaints all N on every family's change, or re-reads the whole shape and diffs it — which is the re-assembly the consumer's own ruling exists to delete, displaced one layer down. A consumer cannot ask *"was this delivery mine?"*, which is the one question a pane-scoped update model needs answered.

**Requested contract.** One addendum, no new member:

1. `subscribe(handler: (address: readonly string[]) => void): () => void` — the handler receives **the same address the sink was handed**, on the same delivery, in the same order (fan-out before sink, `:1430-1433`'s stated order, preserved).
2. **Back-compatible by construction:** a handler declared `() => void` still type-checks and still works (a function of fewer parameters is assignable), so no existing caller changes.
3. The address is the **only** thing added. **Nothing about the value**: *"a push carries an address"* (`D-92`) is unchanged, and a handler that reads a value out of the callback is still a cache the design forbids.
4. `ViewDeliveryEntry` is untouched — `{address, handle, listener}` with the third required.

**Acceptance (assertable under the layout-less shim).** On a store with the four declared roots: (a) a write at `['zones']` delivers to a registered handler with `['zones']` and to a write at `['theme']` with `['theme']`; (b) a handler declared with **no** parameter still receives no error and its call count is unchanged; (c) the sink and the fan-out see the same address on the same delivery, in the fan-out-first order; (d) no member of `ViewDelivery`, `ViewDeliveryEntry` or the store's own surface moves.

**MCP-visibility consequence.** None. No graph node, no tool, no resource changes; a subscription's arity is invisible to `dispatch`/`get_rendered_html`/`get_markdown`.

**Fallback if upstream declines.** A fork subscribes once and re-reads the whole shape, then diffs per family in its own realm — lawful, and what a fork does today. Cost: N panes pay one whole-shape read per change.

**Filing verdict.** **FILE.** It is one signature, it is back-compatible, and it is the difference between a fork's pane-scoped update model and a whole-shape one.

---

## DLV-2 — a documented extension contract for a fork that needs its OWN record family (P1)

**Problem.** The mechanism a fork needs is **present and working**, and **no document states it**. A family is declared by spreading its delivery entries into the app's ONE construction and its constraint declarations into the same call:

```ts
// src/main/main.ts:437, :445-452 (the foundation's own boot)
constraints: [...tabsConstraintDeclarations(() => storeHolder.current), ...viewConstraintDeclarations(() => storeHolder.current)] as never,
listeners: [...tabsDelivery.entries, ...viewDelivery.entries],
```

and both lists are the caller's (`READ` `src/main/storeroom.ts:97-126`). But the four view roots are a closed module-private array (`READ` `src/main/view-record/index.ts:1395-1400`), `viewDeclaredRoots()` is the module's own (`:1334-1341`), the placeholder set is closed by `forking.md` §8.3, and **`docs/guides/forking.md` never mentions the two lists, the entry shape, or the construction-time adoption** in any of its eleven sections.

**The second half, which is a live trap and is documented nowhere.** A family appears in **two** lists that are not the same list: `viewDeclaredRoots()` publishes **four** roots while the constraint batch declares **three**, the fourth being *"a root no pair holds"* (`READ` `src/main/data/types.ts:180-182`, foundation `D-145`). Declare the roots and not the batch and the family has no repair; declare the batch and not the roots and the `data` surface cannot refuse a second version of the family's address (`READ` `src/main/data/types.ts:198-211`) — *"a root the array omits is a write the renderer NEVER HEARS"* (`READ` `src/main/view-record/index.ts:1390-1392`).

**Third clause — the pre-window hold.** A delivery fires at the **construction**, before any `BrowserWindow` exists, so a bare `webContents.send` is discarded; the foundation's answer is a per-channel held-then-flushed queue — `createDeliveryQueue`'s body (`READ` `src/main/main.ts:173-197`) and `createPendingChange`'s pending set (`:230-251`), constructed beside the two push loops (`:266-334`, `:983`; recorded there as `D-218`/`D-222`). A fork that adds a channel without it loses exactly one delivery — its first — and the foundation's own docblock records that as the defect this pattern replaced (*"the empty array this line replaces was the whole defect"*, `READ` `:438-443`).

**Why the existing route cannot serve.** `forking.md` §8.3 answers the wrong question (*"the placeholder export you guessed does not exist"*); §10's "you provide this" table assigns the fork its pane names, ids and figures, and **not** a family. The only route today is to read 1,828 lines of `view-record/index.ts` and infer the contract.

**Requested contract.** A documentation-and-shape item, no source change required unless the foundation prefers to close it in code:

1. **A `forking.md` section** (`§2.5`, "A family of your own") carrying, as its own worked example: the address + tier choice; the value admission that **refuses** junk rather than coercing; the creation placeholder; the constraint id and what it repairs; the `{address, handle, listener}` entries; the **two lists** and the rule that a family is in both; the `subscribe` fan-out; and the client's shape-holds / re-read-inside-the-listener discipline.
2. **The pre-window hold**, stated beside it: a delivery can fire before a window exists, so the channel holds and flushes on ready — with the queue's shape, not a description of the defect.
3. **The seam's own contract:** a caller supplies `constraints` and `listeners` and the surface constructs no instance (the foundation's `D-80` measured a second store); a fork's seam therefore lives beside the boot, not inside a surface.
4. *(Optional, if the foundation prefers a shape to a paragraph)* an exported helper that mints a family's `entries` + `declaredRoots` + `constraintDeclarations` from one declaration object, so the two lists cannot disagree by construction.

**Acceptance.** From the documentation alone, a fresh agent can add a working third family to a copy of the foundation and prove: its writes commit; its refusals name its own sentence; its creation repair delivers; its root is listed in **both** lists; and a channel added for it loses no delivery across a boot. No layout, no browser.

**MCP-visibility consequence.** Positive and indirect: a fork family declared through the documented path is reachable by the foundation's own `data` tool surface (`provident.data.read/write/delete/list/journal`, `READ` `src/main/data/types.ts:223-234`) — a family invented outside the two lists is not.

**Fallback if upstream declines.** A fork copies this pattern from `view-record/index.ts` by reading it — which is precisely what this fork did, and what every fork will do — and carries the two-list trap as its own review finding.

**Filing verdict.** **FILE.** The mechanism exists, is load-bearing, and is undocumented; the corpus's own rule is that a mechanism a fork must re-invent belongs in a request (`docs/FORKER.md:33-34`).

---

## DLV-3 — a stated delivery shape for a data source that is NOT the record (P2)

**Problem.** The fork guide's complete list of lawful runtime-content routes is **three**, and all three are graph or record writes: *"A record write … A graph write on the node itself … A `rows-mint`"* (`READ` `docs/guides/forking.md:189-199`). The foundation's deliveries bind **profile-store addresses only** (`READ` `src/main/view-record/index.ts:1395-1400`), and the graph *"is not a store"* by the foundation's own ruling — *"It is a rendering engine. Do not refer to it as a store. Do not use it as one. It controls the render and the data shape is driven by the listener events"* (`READ` `src/renderer/view-client.ts:3-20`).

**Why the existing route cannot serve.** A fork's pane data may live in a database, a file, or an HTTP peer — none of which is a record family, and none of which the foundation's own rulings permit a consumer to push into the record for content's sake. The guide therefore describes no route at all for the commonest fork shape: **pane data owned outside the record**. The fork must author the channel and loses every guarantee the record route states — the address-only push, the re-read inside the listener, no poll/timer/retry, and delivery at a named instant.

**Requested contract.** A documented **delivery source**, and (the foundation's choice) either an exported shape or a stated paragraph:

1. A source declares **addresses** it will announce (opaque strings the fork owns), mints `{address, handle, listener}`-shaped entries against them, and calls its own sink — the same two halves `createViewDelivery` has (`READ` `src/main/view-record/index.ts:1412-1479`).
2. **The invariants travel with it:** the listener body writes nothing and contains its own throw (`READ` `docs/L3/view-record/delivery.md:23`); the push carries an address and never a value; the consumer's only correct answer is a re-read; **no poll, no timer, no retry** (`D-82` clause 4's discipline, `READ` `src/renderer/view-client.ts:34-40`).
3. **The one instant it cannot promise:** there is no construction to adopt the entries, so the source must state its own ready/flush moment — and name what a consumer may assume before it.
4. **What it must not become:** a second store. The source holds no address space, no persistence, no constraint, no journal (`READ` `src/renderer/view-client.ts:13-20`'s own test) — a fork's queue and cache, and nothing else.

**Acceptance.** A source with two addresses announces an address; a consumer subscribed to one re-reads and repaints; a throwing consumer starves no sibling; a delivery before the consumer exists is held and then served once, in order; and a source that tried to persist would fail the stated "not a store" test.

**MCP-visibility consequence.** None for the surface itself; the consequence is that a pane updated through a documented source is updated **through the graph** — a pane repainted by hand-written DOM is invisible to `dispatch`/`get_rendered_html`/`get_markdown` (`forking.md` §8.6).

**Fallback if upstream declines.** A fork authors the source — the fork already must — and carries the four invariants as its own documented rule. Cost: every downstream fork re-derives them, and the pre-window hold (DLV-2 clause 3) is the one that bites silently.

**Filing verdict.** **FILE**, as documentation first and a shape only if the foundation wants one. No behaviour changes; nothing here asks the foundation to learn a fork's data model.

---

## 5. What these requests deliberately do NOT ask for

| Not requested | Why |
|---|---|
| any member of the display-state family — the caret, the scroll, the visible section, the tab id | that is Astrographer's payload under `strata/decisions.md` D-23; the foundation must not learn it |
| Astrographer's pane ids, pane titles, RAG vocabulary, engine routes, tool names | app vocabulary; `docs/guides/forking.md` §10's table already assigns these to the fork |
| a snapshot/revision route, a change feed, a durable store | those are the **Gnosis engine's** items (`GR-4`/`GR-5`/`GR-7`), not the foundation's, and the engine's feed is landed |
| the `css.style`-replace, `updatedAt`, tab-`index` or placeholder behaviours | already stated as refusals or as commits-but-is-wrong in `forking.md` §8.1–§8.8; re-filing them is the mistake this document avoids |
| a base swap, a re-vendoring, or a pin move | this fork's scope is its own program (`strata/decisions.md` D-25); a pin move is a unit of its own (D-11) |
| any `provident-ssr` package change | a different upstream; the package's requests live in `docs/feature-requests/provident-ssr-expressibility-requests.md` |

## 6. Provenance — how these were found (reproducible)

1. Read the foundation's own refusal guide first: `docs/guides/forking.md` §8 (seven refusals + the six §8.8 rows), §9, §10 — so nothing below re-files it. `docs/L1/foundation-features-findings.md` §0 records that check.
2. Read the delivery model as it actually is: `src/main/view-record/index.ts:1386-1479` (the entries, the fan-out, the sink), `src/main/main.ts:266-334`, `:437-453` (the queue and the one construction), `src/renderer/view-client.ts:1-40`, `:662-700` (the shape and the re-read), and the module's own contract page `docs/L3/view-record/delivery.md` §1–§3.
3. Read what the guide says about a fork's own half: `docs/guides/forking.md` §2 (`… a fourth pane: five places to touch`), §3.1 (the three lawful runtime routes), §10 (the fork's-half table) — the three places a family/route would be described, and none of them describes one.
4. Measured the mechanism's existence against the boot: `src/main/storeroom.ts:97-126` (both lists are the caller's) + `src/main/main.ts:437`, `:445-452` (the foundation spreads its own) + `src/main/data/types.ts:180-211` (the required `declaredRoots` and the fourth, undeclared root).
