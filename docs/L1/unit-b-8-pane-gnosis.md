# L1 — unit `B-8` `pane-gnosis`: the contract — the four gnosis panes, each source NAMED, the one they cannot hear, and the STOP

**Layer:** L1 · **Date:** `2026-11-20` · **Ceiling:** 150 lines (D-2's design class) · **Write scope:** `docs/L1/`; and, by this unit's grant,
`src/renderer/gnosis-panes.ts`, `src/renderer/gnosis-crud-panes.ts`, `src/renderer/sidebar-panes.ts` (the seams, the two censuses, the re-reads),
`src/renderer/pane-events.ts` (**an addition only**), `scripts/live-drive.mjs` (only if an instrument must move, then `node --check`),
`tests/{unit,integration}/shell-chrome/**`, `tests/integration/{record-engine,gnosis-changes}/**`, `docs/L2/shell-chrome/`, `docs/L3/shell-chrome/`.
**Status:** **FILED AND BLOCKED-ON-GRANT — the census does NOT move in this pass.** §1 `F-1` is the block: three of the four panes' final
`host.refresh()` sites — and the only edge that could carry their fire — live in `src/renderer/renderer.ts`, which the delegation's write scope
excludes ("Nothing else") while the map's own §3 `B-8` row cites that file as what `B-8` replaces. Per the delegation's own rule (*"if a wiring is
missing, say so and stop rather than widen"*) this contract is the deliverable and the tree stays byte-clean. What IS landed is the one demanded
item that needs no unwired byte: `B6-F15`'s containment clause and its row (§9). §10 names the exact grant lines owed.
**Markers:** `READ` = read in this pass, the site named by NAME (`D-41`, never an offset). `RUN` = a gate reading with its runner. **This seat holds
no shell**, so every gate below is written as its obligation and no figure is quoted as this seat's own (D-2).
**Layer declaration (D-10, RCA-12):** §6's rows are **envelope**-class (text oracles over `src/**` + the REAL host under the layout-less `dom-shim`).
**`G8` is the only assembled-app reading** and §8 is the only place that claims one — and it claims NOT-DRIVEN, per pane, with the cause.

## 1. The unit, and the seven `READ` findings that decide its shape

**The act (the map's §3 `B-8` row, verbatim):** *"each host fires its OWN pane (replacing `onChanged → host.refresh()`)"* for `gnosis-status`,
`gnosis-query`, `gnosis-documents`, `gnosis-wikis`, *"a document mutated through the engine reaches the document pane via `B-4`"*.

- **`F-1` — THE FIRE IS NOT THIS UNIT'S BYTE; THE MISSING EDGE IS IN `renderer.ts`.** `gnosis-panes.ts`'s `onChanged` was re-grained to
  `(paneId: string) => void` by `B-3` and `renderer.ts` wires it to `firePaneUpdate(paneId)` (`READ` the `GnosisPanes` construction: the comment
  *"the DIRECT arm's second half"*), so `gnosis-query` and `gnosis-status` already FIRE. `gnosis-crud-panes.ts`'s `GnosisCrudOnChanged` is still
  `() => void` and `renderer.ts` wires it to `onChanged: () => { if (host) void host.refresh() }` (`READ` the `GnosisCrudPanes` construction:
  *"the host re-assembles + re-mounts"*). **`host.refresh()` is `renderer.ts`'s line, and `firePaneUpdate`/`paneEvents` are `renderer.ts`'s locals** —
  no seam inside the CRUD host, the shared `PaneRegistry`, the preload bridge or `pane-events.ts` can reach the channel. A type-only change to
  `(paneId: string) => void` is INERT: the renderer's zero-arg arrow ignores the id and still calls `refresh()`. **So a census move for
  `gnosis-documents`/`gnosis-wikis` without that line buys a half-wire**, and `D-42`'s rule ("a half-wired pane is worse than an absent one") applies.
- **`F-2` — THE FOUR SOURCES, read.** `gnosis-query`: its OWN settled answer — `submitQuery`'s five settle arms each commit one host field and
  call `onChanged('gnosis-query')` (`READ` both hosts; the arms are the gate-closed arm, the success arm, the rejection arm and two security-failure
  arms). `gnosis-status`: its OWN settled engine health report — `refreshStatus`'s two arms both name `'gnosis-status'`. `gnosis-documents` /
  `gnosis-wikis`: their OWN bridge-call settle (`gnosisDocuments`/`gnosisWikis`, every arm) **plus** the engine-originated descriptor (§2).
- **`F-3` — THE ENGINE DESCRIPTOR IS A TRIGGER FOR THESE PANES, NOT THEIR DATA, AND THE MIRROR IS THE WRONG SOURCE.** `B-4`'s sink broadcasts the
  engine's frame on the EXISTING `IPC_RAG_STORE_CHANGED` with `store: ENGINE_ORIGIN_STORE === 'gnosis:engine'` (`READ` main's sink, above the
  broadcast, and `B-4a`'s settle-then-broadcast order). `B-4a`'s mirror projects that write into the **LOCAL** store, and the local store's
  doc-heads are the **doc-nav**'s data, not these panes': `gnosisDocumentsContent`/`gnosisWikisContent` render `DocumentList`/`Wiki[]` answered by
  `bridge.gnosis.documents`/`.wikis` — the ENGINE CRUD proxy (`READ` both `applyDocumentsResult`/`applyWikisResult`). **So the panes' re-read is
  their own engine list, and the descriptor's `nodeIds` (the engine's GRAPH node ids) can never name a document** — the same limit `D-41` recorded
  for `B-4a`'s limb (b).
- **`F-4` — THE LOOP, and it is structural.** These panes' producer is a bridge call whose settle calls `onChanged`. A paint that re-issued its own
  producer would be `settle → fire → settle → …` — unbounded, with no terminating condition, and no debounce is admissible (`D-82` clause 4). This is
  `ASM-B7-2`'s shape one family over, and it is why §3 gives **zero** re-reads in the paint and puts every re-read on the producer side.
- **`F-5` — `gnosis-status` IS `operator`-SCOPE, AND THE CENSUS IS A TRAP FOR IT.** `paintPane` step 2 answers `operator-scope` for it (declared by
  `B-3`, and `REPLUMBED_PANE_IDS`' own docblock says *"`gnosis-status` is deliberately NOT here: it is `operator`-scope, the operator mount is
  `B-9`'s surface"*). The operator surface is a SEPARATE graph (isolated scope + `DomAdapter` + `renderProducingProcess` over `operatorNodes`), not a
  runtime-materialized root, so the paint's reconcile/apply path cannot reach it; giving it one would be a second op family for a node (`B-3`'s
  Must NOT). **Therefore adding `gnosis-status` to the census today makes `fire` answer `fired:true` while nothing paints — and `renderer.ts`'s
  `⟨B-9⟩` operator fallback is skipped precisely because `fired` is true — a SILENTLY DEAD OPERATOR PANE: the `m6` class as a real hazard, not a
  mutant.** Its paint is B-9's, and B-9's row already fixes INV-E's reading for it (`0 loadAppGraph`, a lawful `mountOperator`).
- **`F-6` — `queryError` IS WRITE-ONLY, so an engine-absent settle paints NOTHING.** `queryContent` authors `gnosisQueryContent(ctx, this.lastQuery)`
  and nothing else; `queryError` is set in three arms and read nowhere (`grep`: the declaration and the writes). A rejected query therefore authors
  the SAME subtree as "no query yet" → `unchanged`. That falsifies the live oracle a careless limb would assume, and it decides §8.
- **`F-7` — THE CRUD PANES' OWN CONTROLS ARE INERT AT THIS HEAD (measured elsewhere, quoted).** `installSidebarBridge`'s `methods` object carries
  `gnosisStatus`/`gnosisQuery` and **no `gnosisDocuments`/`gnosisWikis`**, while preload's `installSidebar(methods)` REPLACES the holder — so
  `window.provident.sidebar.gnosisDocuments(...)` (the body every A2 control runs, `READ` `GNOSIS_*_REFRESH/SELECT/CREATE_BODY`) reaches `undefined?.()`
  post-install. The driver already reads it: `UF-GNOSIS-1`/**`6`** print *"the pane's own handler seam is a no-op"* and *"REAL click
  `#gnosis-documents-refresh` → reassembled=FALSE (⇒ no `gnosis.wiki.list` wire call)"*, and `UF-GNOSIS-2` prints *"the ONLY live engine reads came
  from the host's BOOT path"*. So the two CRUD panes have been **read-once-at-boot** since A2 — a defect in `sidebar-panes.ts` (in this unit's grant)
  whose fix needs the `SidebarPanes` delegate widened to the CRUD host, which is `renderer.ts`'s line (`F-1`).
- **`F-8` — THE TWO CRUD PANES SHARE FIELDS, so a settle can move BOTH.** `lastWikis` is read by `documentsContent` AND `wikisContent`;
  `noEditAccess` is rendered by BOTH; `gnosis.wiki.list` is issued by `refreshWikis()` *through* `gnosisDocuments`. A fire's OWNER is therefore a
  declared **pane census per written field**, not the entry point — otherwise one of the two panes goes stale on a settle that moved its data.

## 2. The four sources, NAMED, and what each MUST refuse

| Pane | Source (the ONE producer) | Refused, with the reason |
|---|---|---|
| `gnosis-query` | its OWN settled answer: `submitQuery`'s five arms commit then `onChanged('gnosis-query')` | **the store/engine descriptor** (a re-issue on a fire is `F-4`'s unbounded loop, and the channel's `fire` cannot tell a settlement fire from a descriptor fire — `B-7` `ASM-B7-2`, verbatim); **a second `bridge.gnosis.query`** for the same reason |
| `gnosis-status` | its OWN settled health report: `refreshStatus`'s two arms, which already name `'gnosis-status'` | **the census itself** (`F-5`: the paint does not exist; entering it kills the pane) and **the store descriptor** (a health report is not store-derived) |
| `gnosis-documents` | (a) its OWN bridge-call settle (`gnosisDocuments`) — (b) the engine-originated descriptor, which re-reads (a) | **a LOCAL store descriptor** (`F-3`: the local store is not this pane's data); **a paint-side `bridge.gnosis.documents` re-read** (`F-4`); **the descriptor's `nodeIds`** (engine graph ids, never document ids) |
| `gnosis-wikis` | the same two, on `gnosisWikis` | the same three |

- **The engine arm's shape, stated so it cannot loop:** the descriptor is heard in `onRagStoreChanged`'s engine branch (`B-6`'s, already landed:
  exact `store` equality, ABOVE the three local guards, `publishChange` → `return`), and the panes' answer is produced by the HOST: a
  `refreshFromEngine()` on the CRUD host issues `gnosis.wiki.list` (+ the selected wiki's `document.list`) and lets each SETTLE fire its own pane.
  **The paint re-reads nothing** (`ASM-B8-1`), so the cycle is `descriptor → read → settle → fire → paint` and terminates.
- **The one new wiring the arm needs inside the grant:** the CRUD host must be told to re-read — one call from `sidebar-panes.ts`'s engine branch
  into a delegate. `SidebarPanesOptions.gnosis` is `{status, query}`; widening it is `sidebar-panes.ts`, but the OBJECT is constructed in
  `renderer.ts` (`F-1`). **Named, not smoothed: the engine arm is unreachable until the grant lands too.**

## 3. The re-read censuses — the paint re-reads NOTHING; every re-read is the producer's

- **`gnosis-query`:** `snapshot` 0 · `docHeads` 0 · `security` 0 · `backlinks` 0 · `template.get` 0 · `rag.query` **0 from the paint** — the
  settlement's own `gnosis.query` is the positive that makes the zeros readable (`B-7`'s shape; `gnosis-query`'s one per-submit `security.get` is
  the producer's, not the paint's). Paint = `B-3`'s no-arm path, synchronous inside the fire.
- **`gnosis-status`:** the same all-zero census; its paint owes NO arm because the operator surface re-renders from `lastStatus`, which the settle
  committed in the same tick.
- **`gnosis-documents` / `gnosis-wikis`:** `snapshot` 0 · `docHeads` 0 · `backlinks` 0 · `security` 0 · `template.get` 0 — and their own
  `gnosis.wiki.list`/`gnosis.document.list`/`gnosis.wiki.get` counts are **the producer's**, never the paint's. `ASM-B8-1`: `paintReplumbedPane`
  gains NO arm for any of the four (a five-arm dispatch would be a second reader table, `B-5` `O-3`).
- **The one re-read that IS the paint's, and only if the grant lands:** none. If a later pass finds a pane needing one, it argues `ASM-B8-1`
  against it with `F-4`'s loop proof.

## 4. The census, the declaration pick, and the families that remain

- **The move, measured rather than assumed: `REPLUMBED_PANE_IDS` is `['gnosis-query','crosslinks','doc-nav','search','template-editor']` and
  `gnosis-query` is ALREADY in it** (`B-3`'s landing). So the delegation's "+FOUR" is **+THREE** on the value: `gnosis-documents`, `gnosis-wikis`
  (both landable once `F-1`'s line lands) and `gnosis-status` (**NOT in this pass** — `F-5`, and its entry is B-9's, with its paint).
- **The remaining families that still keep `refresh()`, stated:** `settings` (operator scope, `B-9`'s surface) · `gnosis-status` (operator scope,
  B-9's paint, `F-5`) · and nothing else — after a landed B-8 every app-graph pane that has a producer is on the channel.
- **ONE registration per id, still** (`B2-ADV-04`): the `boot` loop subscribes one handler per census id and picks the DECLARATION per id
  (`subscribeChange` for a change-interested id, `subscribe` otherwise). The two CRUD panes are change-interested (§2's engine arm), so they take
  `subscribeChange` and `CHANGE_INTERESTED_PANE_IDS` becomes `['doc-nav','gnosis-documents','gnosis-wikis']` — **which is exactly the state
  `B6-F15`'s containment clause exists to make impossible to half-land** (§9).
- **`refresh()` is not deleted** (`B-6` §5's rule): it stops being these panes' FRESHNESS ROUTE, not the host's context cache.

## 5. What the grant's files owe (byte inventory, so a landing is not under-counted twice)

- **`sidebar-panes.ts`:** the census + its `B-8` cause paragraph; `CHANGE_INTERESTED_PANE_IDS`' extension + its comment; the engine branch's one
  delegate call (§2); `paintReplumbedPane`'s docblock recording the four no-arm panes (`ASM-B8-1`); `installSidebarBridge`'s `gnosisDocuments`/
  `gnosisWikis` seams (`F-7`) + `SidebarPanesOptions.gnosis`'s widening; the `B6-F15` containment clause (§9).
- **`gnosis-crud-panes.ts`:** `GnosisCrudOnChanged` becomes `(paneId: string) => void`; every settle arm names its pane(s) by `F-8`'s field census;
  `refreshFromEngine()` (the engine arm's producer). **`gnosis-panes.ts` owes ZERO byte for `gnosis-query`** (its fire is `B-3`'s) and only its
  `F-6`/`B6-F15` comments.
- **`pane-events.ts` owes ZERO LOGIC BYTE** and that is a DECISION (the `B-6`/`B-7` precedent): its docblock's *"`B-8`'s gnosis family EXTENDS
  that same declaration"* stays true; a `B-8` sentence is added as a comment only if the landing makes one false.
- **The pin files that WILL red, enumerated (the `B-7` `F-2` lesson, second repeat):** IN GRANT as recorded-value extensions —
  `tests/unit/shell-chrome/pane-events.test.ts` (`r9`), `tests/integration/shell-chrome/pane-update-channel.test.ts` (`r5`),
  `tests/unit/shell-chrome/pane-doc-nav.test.ts` (`PINNED_REPLUMBED` + `D4`), `tests/integration/shell-chrome/pane-links.test.ts` (`L3`).
  **OUT OF GRANT, L0's countersignature owed:** `tests/pd-ui-1-theme-register.test.ts`'s `sidebar-panes.ts` digest and
  `tests/unit-wave-1-bridge-wiring.test.ts` (if it pins a seam census).
- **`scripts/live-drive.mjs` owes an INSTRUMENT MOVE, not a `BLOCKS` key** (§8): the `gnosis_*` family's existing `gnosisPaneFrameCensus` is
  `gnosis-query`-shaped and `gnosis_query`'s body opens with `#gnosis-query-input`, which a GATE-CLOSED pane never authors (`F-5`/`F-6` of `B-3`'s
  park). The limb therefore needs one OPENING seam-drive before its first real gesture — then `node --check`.

## 6. The red set — to be `RUN` before any byte (`G1`), and what may NOT be authored

*`B-3`'s `r1`–`r5` are the shared discipline and are re-driven ON THESE PANES where they can be: `Q1` is `r1`, `X2` is `r2`, `X3` is `r1`'s counters,
`X4` is `r5`.*

- **`Q1` A SETTLED QUERY PAINTS `pane-gnosis-query` ALONE** from all five settle arms, carriers held, every other root the SAME OBJECT, **0/0/0**,
  §3's census all-zero; control: an identical re-settle is `unchanged` (`r1`'s idempotence).
- **`Q2` THE CRUD PANES' OWN SETTLE PAINTS ITS OWN PANE** — `onChanged` names `'gnosis-documents'`/`'gnosis-wikis'` by `F-8`'s field census;
  control: a settle that writes a SHARED field fires both, a settle that writes one pane's private field fires one.
- **`Q3` THE ENGINE DESCRIPTOR RE-READS AND PAINTS, AND NEVER RE-ISSUES FROM THE PAINT** — one `gnosis.wiki.list` from the PRODUCER, zero from
  the paint, `publishChange` once, `requestRebuild` 0; the fence: a local descriptor re-reads NOTHING for these panes (`D3`'s two directions).
- **`Q4` THE LOOP IS IMPOSSIBLE** (`F-4`): with the paint's arm removed the settle-fire count for one descriptor is exactly ONE — a row that reds
  a paint which re-issues its producer.
- **`X1` THE CENSUS MOVES BY EXACTLY THREE** with its `B-8` cause paragraph, and `gnosis-status` is ABSENT with the reason asserted (`F-5`) —
  **the row that reds a landing which enters the operator pane into the census without its paint** (the `m6` hazard, graded as a ROW).
- **`X2` NEITHER CRUD PANE TOUCHES THE OTHER** (source moved first — `B-7`'s `F-5` correction: a bare fire over painted state is UNSATISFIABLE).
- **`X3` `INV-E` AND ITS MUTANTS, ONE `m6`-CLASS PER PANE.** `m1`→`refresh ≥ 1`; `m2`→`loadAppGraph ≥ 1`; `m3`→`mountOperator ≥ 1`; `m4` a no-op
  handler → `painted:false` with the source DID move; `m5` a paint by re-assembly; and **`m6` per pane** — the FIRE REMOVED (the host commits and
  nothing fires): **0/0/0 on all three counters, ZERO paints, the pane still naming the OLD data while the host field moved** (`B-6`'s `D-40`
  lesson: the counters are necessary and not sufficient). For `gnosis-status`, if B-9 later enters it, the reading is
  `0 loadAppGraph / 1 mountOperator / 0 refresh()` and its `m6` is the same silence.
- **`X4` AN ABSENT/UNMOUNTED PANE COSTS NO PAINT AND NO IPC**, each with its declared word; the control must MOVE THE SOURCE, then enable, then
  fire (`B-7`'s `F-5`/`F-10` lesson).
- **`S1` THE LETTER** (comments stripped): the census is the eight ids; every CRUD settle names its pane; the engine branch calls the producer and
  the paint re-reads nothing.
- **AUTHORING REFUSALS (each a row that cannot be satisfied would be evidence against the row, `D-43`):** no row may demand a PAINT from a bare
  fire over already-painted state; no row may demand a `gnosis-status` paint through `updatePane`; no row may require the engine to answer (`F-3`).

## 7. The gates, and the layer each reads at (map §6)

| # | Gate | Layer |
|---|---|---|
| `G1` | §6's red set `RUN` and reported before any byte, `git status --porcelain -- src package.json` EMPTY | envelope/harness |
| `G2` | `npm test` (every red named with its class — the standing FOUR real-ollama class-(a) gates and nothing else), `npm run typecheck`, `npm run build` | envelope/harness (D-10) |
| `G3` | `npm run drift` — `CLEAN`, `PIN ARM` equal to `49d3137dbf81b6e535e62a30d9e494d80e9589b3` (40 chars, `D-33`) | byte/revision oracle |
| `G5` | read-only adversarial pass (RCA-3); a package finding is catalogued, never patched (D-9) | mixed |
| `G6` | blind greens from this document alone, or a recorded refusal | document layer |
| `G7` | proofreader + per-unit documentation review (RCA-6), record to `archive/reviews/` | document layer |
| `G8` | **the assembled-app limb of §8** — the only app-green reading; per-pane `DRIVEN` or the pane's exact cause | assembled app |
| `G9` | this contract before delegation; the DONE row states each reading's layer; **no `package.json`, `vendor/`, `strata/`, `src/main/**`, `src/shared/`, `tests/live-drive-contract.test.ts`, and (this pass) no `src/renderer/renderer.ts`** | document layer |

## 8. The live readings — what is earnable NOW, and each pane's exact cause

- **`gnosis-query` — EARNED-BY-PLAN, with `F-6` as the discriminator.** The pane's closed→open transition IS a real paint: the first drive
  (`window.provident.sidebar.gnosisQuery('…')` — the app's own surface, and the ONLY route while the gate is closed because the closed pane
  authors no control) refreshes the gate cache (M13), sets `queryClosed=false`, issues `gnosis.query`, and the engine-absent rejection
  (`B-4`'s `sse: non-2xx` / `EngineUnavailable`) settles → fire → the pane re-authors from `"the gnosis group is not enabled"` to
  `#gnosis-query-input` + `#gnosis-query-submit` + the empty result state. Then a REAL typed query through those controls settles and paints
  NOTHING (`F-6`: `queryError` is write-only) — the idempotence CONTROL, printed as such. **No engine answer is claimed**, and the counters are
  node-only, so the limb's claim is the four DOM limbs (`(i)` `#wiki-root` held, `(ii)` sibling marks + node ids held, `(iii)` exactly one
  `#pane-gnosis-query` re-minted once with carriers held, `(iv)` the pane's text MOVED closed→open) — the `B-5`/`B-6`/`B-7` shape.
- **`gnosis-documents` / `gnosis-wikis` — NOT-DRIVEN, three named causes, none a park-by-default:** (a) **`F-7`** — their only controls are inert
  at the sidebar boundary (`installSidebar` replaces the holder and the holder's methods carry no `gnosisDocuments`/`gnosisWikis`), already
  printed by `UF-GNOSIS-1/2/6`; (b) **`F-1`** — their `onChanged` is `host.refresh()`, so TODAY a settle on them is a whole-graph re-assembly, and a
  limb that reads that would be reading the pre-migration route, not a paint; (c) **`F-3`/`F-6`**-class — the engine they read is absent
  (`127.0.0.1:8080`) and the adjacent `../Gnosis` build refuses the fork's CRUD envelope (`malformed envelope: schemaVersion`), so even a
  producer-side re-read answers a rejection whose authored state is the unavailable/empty state (a shape-equal paint).
- **`gnosis-status` — NOT-DRIVEN, by design:** its pane is modal-confined and its paint is B-9's (`F-5`); its settle fire exists and is proven at
  node grain; the assembled-app reading belongs to `UF-GNOSIS-4` after B-9 (`0 loadAppGraph`, one lawful `mountOperator`).
- **What no limb here can EVER earn, named so nobody quotes a node green:** the three counters, the re-read census, the IPC count, and the engine
  source itself — §6's rows are their only evidence.

## 9. `B6-F6` / `B6-F15`, the assumptions, and what this pass lands

- **`B6-F15` — BITES, and it is the ONE thing this pass LANDS.** `CHANGE_INTERESTED_PANE_IDS` carries no subset clause against
  `REPLUMBED_PANE_IDS`, so an id added to the change-interest declaration but not to the census subscribes NOTHING while `publishChange()` drifts
  on — exactly the half-wire this unit's block would produce. **Landed (in grant, `sidebar-panes.ts` + rows):** ONE exported counter
  `changeInterestSubsetProblems(changeInterest, census): string[]` (pure, total) and `boot`'s **validate-then-subscribe** — the subscription plan
  is computed FIRST and a non-empty problem list refuses the WHOLE plan with one loud error, attaching NO subscription (never a half-subscribed
  host). The row parses BOTH declarations and drives the counter with a forged bad pair, so it REDS if the clause is absent and REDS if it is
  present but not consulted by `boot`.
- **`B6-F6` — DOES NOT BITE this unit, and the reason is `F-4`:** the stamp orders two answers to ONE subject; these panes' paints make no
  re-read at all, so there is no stamp-versus-commit interleaving to order. What remains is `B-7`'s `F-7` cousin (two racing settlements, last
  one wins — the answer to a different question), refused here for `B-7`'s reason: a stamp over two different questions IS a queue (`D-82`
  clause 4). **CARRIED to B-9** with B-6's owner, ungraded and said so.
- **`ASM-B8-1`** — every pane of this family is a NO-ARM pane: the producer commits, the fire paints, the paint re-reads nothing. *Rejected:* a
  per-pane re-read arm (`F-4`'s unbounded loop for the two CRUD panes and for `gnosis-query`; an IPC that can change nothing for `gnosis-status`).
- **`ASM-B8-2`** — the engine descriptor is a TRIGGER for these panes and `B-4a`'s mirror is not their data path (`F-3`). *Rejected:* reading the
  local store's doc-heads, which is the doc-nav's data and a second authority for these panes' list.
- **`O-1` — `strata/modules.json` is NOT this unit's.** `shell-chrome`'s `N` (34, `D-41`'s definition: export declarations the module's files
  carry) gains **+1** for `changeInterestSubsetProblems`; a landed B-8 would gain **+0** more (the census and the verdict words are VALUES). L0's
  DONE row states the definition it counts and must not invent the delta.
- **`O-2` — the cost row, recorded not hidden.** The engine arm issues ONE list read per descriptor per interested pane, uncoalesced; the CRUD
  panes' own settles fire per call. No timer, poll, retry or queue is added (`D-82` clause 4).
- **`O-3` — INFO for `B-9`:** the operator paint is the ONE missing surface of this family (`F-5`), and it is `mountOperator`-shaped — B-9 must
  state which re-mount is lawful, must NOT add `gnosis-status`'s id to the census before that paint exists (row `X1`), and inherits the widened
  `SidebarPanesOptions.gnosis` delegate if the engine arm lands first.

## 10. The STOP, and the exact grant lines owed (L0's decision, not this layer's)

**What blocks the map's act, in the order each line unblocks something:**
1. **`src/renderer/renderer.ts`, the `GnosisCrudPanes` construction's `onChanged`** → `onChanged: (paneId) => firePaneUpdate(paneId)` (`F-1`).
   Unblocks `gnosis-documents`/`gnosis-wikis`: their named fire, the census move, `Q2`/`Q3`/`Q4`/`X1`–`X3`. **One line**, and the type change it
   needs is already in this grant.
2. **`src/renderer/renderer.ts`, the `SidebarPanes` construction's `gnosis` delegate** → carry the CRUD host's `documents`/`wikis`/`refreshFromEngine`
   so `installSidebarBridge` can serve the panes' own bodies (`F-7`) and the engine arm has a route (§2). **Three lines**, and it also repairs a
   defect that predates this program (read-once-at-boot panes).
3. **`src/renderer/renderer.ts`, the `⟨B-9⟩` operator fallback** — NOT this unit's even after the grant: `gnosis-status` stays out until B-9's
   operator paint exists (`F-5`), and `X1` is the row that reds an early entry.

**What this pass therefore claims, and nothing beside it:** the four sources are NAMED with their refusals (§2), the four re-read censuses are
FIXED (§3), the census move is MEASURED at +3 rather than +4 (§4), the `m6`-class mutant is specified per pane (§6 `X3`), `B6-F15` is DISPOSED and
LANDED (§9), and the tree takes no byte outside the grant. **No paint is claimed for any of the four panes at this head**, and the two assembled-app
readings that ARE earnable are named with their commands (§8).
