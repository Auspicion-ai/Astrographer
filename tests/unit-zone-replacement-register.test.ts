// tests/unit-zone-replacement-register.test.ts
// UNIT `U-ZONE-REPLACEMENT` — the unit's TYPED PROPERTY REGISTER (contract §6, six rows)
// plus the ADOPTION-WIRING ARMS its rows name (contract §3's swap table, §5's pin
// obligations, §7.1's node-side arm list).
//
// =====================================================================================
// SOURCE OF EVERY ASSERTION (THE CONTRACT ONLY)
// =====================================================================================
//   docs/specs/unit-zone-replacement.md
//     §0 `R-1`…`R-12`      the rulings this unit derives from — NOT re-opened here.
//                          `R-3`: no vendored module may be edited and every adoption is
//                          a `DECLARED_CONSUMER_EDGES` row. `R-9`: the four pane zones
//                          are `left`/`right`/`header`/`footer`; `stage`/`top-bar` are
//                          REGIONS (`LAYOUT_PANE_ZONES` / `LAYOUT_REGIONS`).
//                          `R-11`: a node green is ENVELOPE-green, not app-green.
//                          `R-12`: a code-bearing unit adopting externally-sourced
//                          identifiers carries a typed register; the zero-row exemption
//                          is NOT available to it, and a declared term is NEVER reduced.
//     §1.1 / §1.2          the ALLOWED write set is THIS suite alone (plus the landing's
//                          own `src/` work, owned by the Implementer); DENIED: every
//                          vendored byte, `package.json`, `vitest.config.ts`, the two
//                          fence files, the `PROTECTED` set, every tracker/decision/spec
//                          row, and any widening of the exempt/archived class (`D-8`).
//                          An existing test's assertions are NEVER relaxed, skipped,
//                          retitled or deleted — this file READS the pin files and edits
//                          none of them.
//     §2                   the six design points (a)…(g) and their verdicts, plus §2.2's
//                          ASSERTION-LAYER NOTE — the binding rule this suite's head
//                          obeys (see the LAYER block below).
//     §3                   the SWAP TABLE: six adoption rows (census+zones ·
//                          layout-projection · gutter · gesture-session ·
//                          gutter-affordance · relocate) with their local duplicates, and
//                          §3.1's explicit NON-ADOPTIONS (`slot-host`,
//                          `mount-invariant-guard`) which this suite does NOT assert as
//                          adoptions.
//     §4                   the surfaced items (i)…(viii): the clamp's `NaN` vs `min`
//                          conflict and its coercer resolution (i); the MANDATORY
//                          `revealed` CLOSURE ADAPTER (ii); the capture-at-`pointerdown`
//                          contradiction (iii); the `slot-host` non-adoption (iv); the
//                          `relocate` `distance` measurement seam (v); the row-overlap
//                          disposition (vi); the double-click reset (vii); the
//                          multi-element `detach` refusal (viii).
//     §5                   the pin obligations `G-1`…`G-7`, each with its site and reader.
//     §6                   THE REGISTER — the shared machinery (seed `0x20261004`, the
//                          hand-rolled 32-bit LCG, at most 100 attempts/row, at most 400
//                          total, sequential rows, STOP AFTER 5 CONSECUTIVE FAILURES with
//                          the abandonment REPORTED through `stoppedAt`) and the SIX ROWS
//                          with their subject and their declared-term sum.
//     §7.1                 the node-side arms (the envelope layer, and nothing more).
//     §7.2                 the LAYOUT-EFFECT live assertion node CANNOT hold.
//     §7.3                 the three STRUCTURALLY NON-APPLICABLE gates and the two
//                          MANDATORY ones.
//     §9                   the defaults `D-1`…`D-13`, including `D-12`'s honesty
//                          statements and `D-13`'s contract-status findings.
//     §10                  the owed items `O-1`…`O-12` (this suite's reading is reported
//                          to the supervisor; it writes no tracker row).
//   docs/specs/zone-replacement-adoption-dossier.md
//     §1 the identifier table (8 rows — CONTRACT for the adopted identifiers, their seams
//        and their referents) · §2 the collision block `C-1`…`C-7` (CONTRACT for the
//        identifier collisions; `C-2` the zone vocabulary is the CALLER's, `C-3` the two
//        `CommitSink` declarations stay DISTINCT, `C-5` the capture-timing ban, `C-6`
//        the consumer-vocabulary ban) · §3 the escalations `A-1`…`A-8`.
//
// =====================================================================================
// §2.2 / §7.1 / §7.2 / §8 — THE ASSERTION LAYER, STATED SO NO READING OF THIS FILE
// OVER-CLAIMS (`R-11`; `D-12`)
// =====================================================================================
// WHAT THIS FILE HOLDS: the [T] node-pure ENVELOPE layer — the register's six rows: the
//   adoption wiring, the edge declarations, the census/track record, the one-write-per-
//   gesture discipline, the shell DECLARATION clauses, and the byte-identity of the
//   adopted set. The arms read `src/` and the pin files as TEXT and as ASTs, never as
//   imports of the pin files themselves. A green here proves the authoring model, the
//   imports, the seam supplies and the removals — it DOES NOT prove the app works
//   (`RCA-12`).
// WHAT THIS FILE STRUCTURALLY CANNOT HOLD — and does NOT fake: THE LAYOUT EFFECT, the
//   three limbs of contract §7.2 — (1) a pane rearrange inside a zone must not relayout
//   outside it, (2) the zones are `position: fixed` with internal scrolling, (3) the
//   stage scrolls internally. The dom-shim is deliberately layout-less and CSS-less: it
//   has no layout engine, no computed style, no scroll range and no paint. Under §2.2's
//   note a `SHELL` point (the six points' (b)/(d)/(f)/(g)) has NO node-side arm at all;
//   the honest node-side form is a SOURCE-CLAUSE CENSUS plus the RENDERED arm of §7.2,
//   and the two are NEVER conflated. §7.2's limbs therefore enter the `§5.U` live matrix
//   as a RE-PIN of an existing declared row (`R-10`: the matrix is FULL at 8 and
//   `MATRIX_ROWS` must NOT change) and are a LANDING-TIME act — this suite asserts
//   NOTHING about them, and reading any row below as "the layout holds" is the layer
//   confusion `R-11` forbids.
// THE GATES (§7.3): the blind-greens pass is APPLICABLE and MANDATORY for a UI-overhaul
//   unit (the layout-effect limbs are NOT-BLIND-DERIVABLE and a blind artifact must mark
//   them so rather than pass them silently); the live battery (`scripts/live-drive.mjs`)
//   is APPLICABLE and MANDATORY, and its only admissible park is the ENVIRONMENTAL
//   precondition, reported `PRECONDITION-FAILED` WITH its reading; `npm run battery` is
//   APPLICABLE; `npm run divergence` is APPLICABLE as the MANDATORY PRE-LIVE LEG and is
//   RED at this head for the ENVIRONMENTAL `/dev/shm` reason (`O-5`) — this suite passes
//   that red precondition through and claims nothing; the read-only adversarial pass
//   (`RCA-3`) and the documentation review (`RCA-6`) are MANDATORY after the greens and
//   are NOT this file's leg. NONE of these is named "waived" anywhere here.
//   ⟨SUPERSEDED `2026-10-05` — KEPT VISIBLE, `RCA-8(c)`: THE READING ABOVE IS THE FILING
//   PASS'S, AND ITS ONE LOAD-BEARING CLAIM — *"is RED at this head for the ENVIRONMENTAL
//   `/dev/shm` reason (`O-5`)"* — NO LONGER HOLDS AT THIS HEAD. It is kept verbatim as that
//   pass's reading and is superseded by the marker below. `CURRENT READING` (instrument:
//   `npm run divergence` itself, i.e. the `R13` runner, invoked as the greens artifact's
//   `I-8` at `docs/specs/unit-zone-replacement-greens.md` → row `I-08`): **GREEN —
//   `R13 RESULT: 9 checks, 0 failures`, exit `0`**; the sanctioned route
//   (`--disable-dev-shm-usage` + a fresh scratch `--user-data-dir`) is already in the leg's
//   own spawn vector, so the environmental precondition does NOT reproduce at this head.
//   THE CONSEQUENCE, BINDING AND RECORDED HERE SO THIS FILE IS NOT READ AS LICENSING A PARK:
//   the contract marks that RED clause `SUPERSEDED` in all four places it appeared (`§7.3`,
//   `§8`, `§10` `O-5`, and §7.2's last sentence — the doc-defect pass's table, row 4), `O-5`
//   is CLOSED with its harness-fix half WITHDRAWN, and **THE UNIT'S LIVE SET IS THEREFORE
//   MANDATORY — `PRECONDITION-FAILED` may be reported ONLY from a run that actually failed,
//   with its reading, and a DONE row that parks this unit's live set on this leg is a review
//   finding** (`§7.3`, `§8`, `R-11`, `RCA-11`). `R-3`'s honesty clause is UNMOVED: this note
//   claims NOTHING live and is NOT this file's leg — the layer is DOC/LAYER-NOTE only
//   (`RCA-12`), and NO assertion, arm, figure, seed or cap of this suite moves by it.⟩
// HONESTY (`D-12`): no app-green from this file; no `SKIPPED` reading is a pass; a scoped
//   live `OK` would carry its scope; the conformance leg supplies ZERO behaviour evidence
//   for the fifteen modules (`R-3`) and no green subset is reported from it.
//
// =====================================================================================
// THE RED-FIRST READING (RCA-1) — what this suite is EXPECTED to read at THIS head
// =====================================================================================
// ⟨THE REMAND'S MEASURED READING `2026-10-04` — `RCA-8(c)`: the paragraph below is KEPT as
// the filing pass's expectation, and the RUN at the `bb229da` head reads OTHERWISE, so the
// correction is recorded here rather than left to drift: **rows 1/2/3/5 are BROKEN and
// rows 4/6 are HELD** (the gesture row's three terminals, three policy seams, four
// fail-states and per-move discriminator all pass at this head, and the byte-identity row
// is green). Rows 1/2/3/5 stop at arm 5 under §6's mechanical stop rule, so the arms BELOW
// the fifth are REPORTED abandoned (`stoppedAt 5`), never silently dropped. THE REGISTER'S
// DECLARED TERMS ARE UNMOVED by the remand: `13 + 13 + 13 + 11 + 12 + 14 = 76`.
// TWO ARMS WERE RE-POINTED/CORRECTED BY THE REMAND, each with its superseded text kept
// VISIBLE beside it: row 5's clause #6 (the four authored affordances are read at the
// ENVELOPE AUTHORING SITE — `src/renderer/pane-graph.ts`, driven through the producing
// graph — never by a source census of `src/renderer/index.html`, the file the markup is
// LEAVING; see the SUPERSEDED block at this file's affordance reader), and the register
// report's as-filed `red.length > 0` target (which demanded that the unit FAIL; see the
// SUPERSEDED block at that assertion).⟩
// ⟨THE TESTWRITER REMAND'S OWN READING `2026-10-04` — `RCA-8(c)`: the blocks above are KEPT as
// their passes' readings; this block is the CURRENT one, and it fixes the THREE test-side
// expectations whose SUBJECT was wrong (no register figure moves: six rows, `76` declared and
// executed, seed `0x20261004`, caps ≤100/row · ≤400, no arm added or removed, no assertion
// deleted, each superseded text kept VISIBLE beside its correction and each correction naming
// its owning contract clause). **(C1)** row 1's arm 2 was decided by a HARD-CODED `adopters`
// list and CONTRADICTED the same row's duplicate-absence witness (arm 8) for row 2 — the
// contract's subject (§3 row 2 read through §3.1) is *the file that HOLDS THE REDUCED
// DUPLICATE and IMPORTS the module*, so the arm now DERIVES the seam holder from the row's own
// seam vocabulary and requires the `DECLARED_CONSUMER_EDGES` row to name that SAME file, with
// both teeth (imported by NO file; imported only by a file that does NOT hold the seam) DRIVEN
// on synthetic hits inside the arm. **(C2)** row 3's sized/`emptyToken` limbs were driven with
// `revealedClosure([])` — the DECLINED state for every member (verified by driving it) — so the
// module correctly returned `''` and those expectations could never hold; the arms now drive
// `revealedAll()` (the closure over `LAYOUT_PANE_ZONES`) and the DECLINED limb keeps
// `declinedAll()`, while the falsifier still drives the fork's ARRAY form against a closure.
// **(C3)** is `tests/pd-ui-1-theme-register.test.ts`'s (`§5` `G-7` / `§10` `O-8`) and lives
// there. **THE READING AT THE LANDED TREE (HEAD `bb229da` PLUS THE LANDING'S WORKING-TREE WORK)
// AFTER THESE THREE FIXES: ALL SIX ROWS HELD, every declared term EXECUTED
// (`13 + 13 + 13 + 11 + 12 + 14 = 76`), `stoppedAt` null for all six, zero counterexamples,
// zero abandoned arms.**⟩
// ⟨AS FILED — the pre-landing expectation below, KEPT as that pass's reading (the adoption HAS
// since landed; the current reading is the block above).⟩
//
// =====================================================================================
// ⟨THE DECLINE-RECORDING PASS'S RE-DECLARATION `2026-10-04` — `RCA-8(c)`: THIS BLOCK IS THE
// CURRENT RE-DECLARATION READING. Every block above it is KEPT as its own pass's reading, and
// nothing in them is retitled, relaxed or deleted.⟩
// =====================================================================================
// THE ARCHITECT'S RULING, ITS RECORDED HOME, AND THE CLAUSES THAT LICENSE THIS ACT.
//   RULING (owner: the architect), verbatim in substance: **"Record the declines + re-declare
//   the two rows."** Its recorded homes, all in `docs/specs/unit-zone-replacement.md`:
//     §3.5      the ruling and the TWO DECLINES named, each `DECLINED FOR THIS UNIT — RECORDED`
//               ("No register figure moves by this subsection — the arithmetic moves only by
//               the TestWriter's own recorded re-declaration (§6.0)").
//     §3.6      the re-declared adopted-member sets, one subsection per row, each pairing the
//               FILED member list (KEPT VISIBLE, marked `SUPERSEDED`) with the re-declared one.
//     §3.6.1    §3 row 6 (`relocate`): the comparator and the measured seam LANDED; the session
//               composition DECLINED.
//     §3.6.2    §3 row 5 (`gutter-affordance`): the source and cursor halves LANDED; the
//               affordance controller composition DECLINED.
//     §4.0      the measured blockers, and the two FALSE-IFIABLE tree clauses of the decline
//               (clause (1): the two factories are "imported by NOTHING under this unit's
//               name"; clause (2): no element-creation path authored under this unit's name).
//     §6.0      THE REGISTER'S RE-DECLARATION OBLIGATION — "the TestWriter's act", four clauses:
//               (1) the SUBJECTS are re-declared to the landed members, NOTHING WIDER;
//               (2) the TestWriter re-declares the ARMS WITH BOTH TERMS VISIBLE, "never a
//               replacement in place and never a deletion"; (3) the arithmetic moves ONLY by
//               that recorded re-declaration ("a quiet edit is `D-13`'s forbidden form");
//               (4) a row is still REPORTED, never suppressed.
//   THE ROUTE this act travels is §4 items (v)/(vi) and §9 `D-13` — "a recorded contract
//   amendment, never a quiet edit". §6.0's own tail is explicit that the decline-recording pass
//   "PERFORMED NO RE-DECLARATION — it records the obligation and the sets (§3.6); the
//   re-declaration, the arms and the arithmetic are the TestWriter's": this pass IS that act.
//
// THE TWO DECLINES, NAMED (both `DECLINED FOR THIS UNIT — RECORDED`, §3.5's table):
//   1. `createRelocateSession` — the `relocate.ts` session factory — TOGETHER WITH ALL SEVEN OF
//      ITS OPTIONAL SEAMS (`threshold`, `candidatesFor`, `resolveTarget`, `onReveal`, `commit`,
//      `onPreview`, `preDragValueOf`; §3.6.1). THE BLOCKER (§4.0 blocker 1, read at the vendored
//      source): `gesture-session.ts`'s `installOperation` opens with `if (ledgerKnows(element))
//      return false` — the module REFUSES A SECOND INSTALL OF THE SAME ELEMENT — and the
//      renderer's pane path already installs that element. Composing the session therefore means
//      MOVING the pane-drag establishment into it, which is the sibling row `PD-UI-4a`'s
//      declared REWRITE and OUTSIDE this unit's scope. Deferred, not denied in principle.
//   2. `createGutterAffordance` — the `gutter-affordance.ts` controller factory — TOGETHER WITH
//      ITS REMAINING SEAMS (`sizeFromPointer`, `axisOf`, `cursorOf`, `applyPreview`,
//      `applyCursor`-as-a-composed-seam, `startSizeOf`, `boundsOf`, `resizableOf`, `commit`,
//      and the optional `pointerOf`/`moveTypeOf`; §3.6.2). THE BLOCKERS: §4.0 blocker 1 (the
//      same install collision) and §4.0 blocker 2 (the vendored module's OWN declaration that
//      the capture opt-in cannot travel through the composed controller's `attach`; the host
//      write seam `commitGutterSize` is PRIVATE; and the `applyPreview` definition the fork does
//      not have). §3.6.2 states the consequence: "the affordance controller is authored by
//      NOTHING under this unit's name".
//
// WHAT THE REGISTER NOW DECLARES, PER RE-DECLARED ROW — THE SUBJECTS RE-DECLARED TO THE LANDED
// MEMBERS, NOTHING WIDER (§6.0 clause 1):
//   · ROW 5 (`P-TP-zone-repl-5`): THE DECLARED SUBJECT IS RE-DECLARED to the LANDED set §3.6.2
//     names — (a) the ELEMENT-BACKED SOURCE `domEventSource()`; (b) `cursorDeclarationFor` and
//     the fork's CURSOR WRITE through the `applyCursor` SHAPE (`renderer.ts`'s cursor write,
//     with the DECLARATION string staying the caller's vocabulary and the CSS rules staying
//     shell CSS); (c) the FOUR ENVELOPE-AUTHORED AFFORDANCES at §3.1's authoring site
//     (`src/renderer/pane-graph.ts`, one per `LAYOUT_PANE_ZONES` member, driven through the
//     producing graph) WITH their §3.2 class/attribute vocabulary — BESIDE the declaration
//     clauses the filed register already declared (§6 row 5: `containerDeclarationFor`'s
//     returned text applied AS A STRING per container, the fork's own track/token names, the
//     grid consuming the TRACK tokens with the stage track written `minmax(0, …)`, and the four
//     `R-9` region/zone rulings). **THE FACTORY'S COMPOSITION IS NOT PART OF THIS ROW ANY MORE**,
//     and NO term of the row reds for the factory's absence: the row's twelve terms were never
//     the factory or its seams (see the arithmetic below), every tooth that grades a LANDED
//     member is KEPT (the cursor-declaration drive and its falsifier · the authoring-site and
//     vocabulary limbs · the `''`/`'0px'`/sized write rule of the grid arm · the `G-5` theme
//     census · the two controls), and the decline's own witness rides ROW 1's row-5 adoption arm
//     (`§4.0(1)`: the declined factory is imported by NOTHING). The row's own site carries the
//     same re-declaration, term by term, with the stimulus for every kept tooth.
//   · ROW 6 (`P-TP-zone-repl-6`): **NO RE-DECLARATION IS OWED, AND THIS PASS INVENTED NONE.**
//     §6's row 6 declares PURELY the byte-identity property of the adopted set —
//     `8 (adopted modules byte-identical) + 1 (the manifest set) + 4 (baseline files
//     unreplaced) + 1 (the one-byte mutation control)` — and NOT ONE of its fourteen terms
//     names the relocate session, its seven seams, or any other member §3.6.1 re-declares. The
//     amendment therefore licenses NO move here, and a "re-declaration" of this row would be a
//     term invented for a subject the contract does not declare (`§6.0` (1): "NOTHING WIDER").
//     What the decline DOES require of this file is a RECORD of its consequence (§4.0(1)): the
//     DECLINED factory `createRelocateSession` is imported by NOTHING (per §3.6.1), while the
//     row's LANDED half IS wired — `withinProximity` reached through the fork's own
//     `measuresWithinSnapThreshold`, the `distance` seam `distanceToZoneBox`, and the four named
//     suppliers `legalZonesForScope` / `insertionIndexForPoint` / `createDragController` /
//     `setZoneMinimized`. That record lives at three sites in this file: the `ADOPTIONS` table's
//     row 6 (`declinedFactory`, plus its provenance comment), row 6's own describe block, and
//     the driven limb on row 1's row-6 adoption arm. The byte-identity set itself is UNMOVED:
//     `relocate` and `gutter-affordance` REMAIN adopted modules whose bytes are pinned —
//     §3.6.1/§3.6.2's words, "the two modules' OTHER members landed ... what stays unimported is
//     the two FACTORIES, not the two modules".
//
// THE ARITHMETIC — BOTH VALUES, AS §6.0 CLAUSE 3 REQUIRES (both figures visible, §10.3-class):
//   SUPERSEDED (as filed by §6, and as this file has declared it since the first pass):
//     13 + 13 + 13 + 11 + 12 + 14 = 76   — row 5 `6 + 4 + 2 = 12`, row 6 `8 + 1 + 4 + 1 = 14`.
//   RE-DECLARED (this pass):
//     13 + 13 + 13 + 11 + 12 + 14 = 76   — row 5 `6 + 4 + 2 = 12`, row 6 `8 + 1 + 4 + 1 = 14`.
//   **THE ARITHMETIC IS UNMOVED, AND THE READING THAT SHOWS IT:** no register term ever had a
//   DECLINED subject to lose. §6 declared row 5's twelve attempts as SIX shell-clause assertions
//   + FOUR zone tokens + TWO controls — not one of them the affordance factory or any of its
//   eleven seams — and row 6's fourteen as the byte-identity set. Every one of the thirty-two
//   terms across rows 5/6 still has a subject, every subject is LANDED, and every landed member
//   keeps the tooth that grades it. A reduced row is REPORTED, never suppressed (§6.0 clause 4),
//   and NO row is reduced here: the two declined compositions are witnessed by limbs riding
//   EXISTING named arms, so NOTHING is added to or removed from the declared counts. THE SEED
//   (`0x20261004`), THE CAPS (≤100 per row, ≤400 total), THE STOP RULE (5 consecutive failures)
//   and THE OTHER FOUR ROWS' FIGURES are all UNMOVED.
//
// THIS PASS'S OWN RUN, BEFORE AND AFTER — the readings are MEASURED, never staged (`RCA-1`):
//   BEFORE (HEAD `bb229da` with the landing's working-tree work in place):
//     `npx vitest run tests/unit-zone-replacement-register.test.ts` → NINE tests pass; ALL SIX
//     ROWS `held`; every declared term executed (`13 + 13 + 13 + 11 + 12 + 14 = 76`);
//     `stoppedAt` null for all six; zero counterexamples; zero abandoned arms.
//   AFTER the re-declaration:
//     the SAME reading — nine tests pass, six rows `held`, `76` executed, `stoppedAt` null, zero
//     counterexamples. **THIS PASS ADDS NO RED, and that is the honest outcome**: a
//     re-declaration moves a DECLARED SUBJECT, not a tree state, and every member the amendment
//     re-declares to was ALREADY LANDED and already graded by the arms kept below (§3.6's own
//     `VERIFIED-BY-READ` items, and the blind-greens rows `A-05`/`E-10`/`E-14`). The two limbs
//     this pass ADDS (the §4.0(1) decline witness, and the §3.2 class/attribute vocabulary limb
//     on the authored affordance) are GREEN at this head too — the two factories are imported by
//     NOTHING and the authored nodes carry `gutter` — so they SHARPEN the register without
//     staging a red. A red invented to make this pass look red-first would be a FALSE red: the
//     red set is a MEASURED reading, and a re-declaration that is not owed a red does not owe one
//     either (the same discipline as "a re-declaration that is not owed is worse than none").
//
// WHAT THIS PASS TOUCHED: THIS FILE AND NOTHING ELSE — no `src/**` byte, no `scripts/**` (a
//   concurrent implementer owns `scripts/live-drive.mjs`), no other test, no doc, no config.
//   `G-3`'s `vitest.config.ts` is untouched; `G-4` binds NO mock, this file still binds no mock
//   API at all and the five-name `'electron'` census gains no sixth member; no assertion is
//   deleted, retitled away or weakened; every superseded reading stays VISIBLE beside its
//   successor; and both declines are recorded rather than quietly dropped (`D-13`).
// =====================================================================================
// ⟨THE GATE-4 FIX PASS — THE TESTWRITER'S RED-FIRST TEETH. `RCA-8(c)`: nothing above is
// retitled, relaxed or deleted; every superseded reading stays VISIBLE, and each new limb
// rides an EXISTING named arm — NO arm was added or removed, no register figure moved.
// THE REGISTER IS UNMOVED: six rows, `13 + 13 + 13 + 11 + 12 + 14 = 76` declared and
// executed, the same row ids / strategy ids / terms, the same seed `0x20261004`, the same
// caps (≤100/row, ≤400 total) and the same mechanical STOP AFTER 5 CONSECUTIVE FAILURES.
// THIS PASS'S CHANGE SET IS THIS FILE AND NOTHING ELSE (no `src/**` byte, no other test,
// no doc, no config; `G-3`'s `vitest.config.ts` untouched; `G-4` binds NO mock — the five
// name `'electron'` census gains no sixth member, and the DOM/`SidebarPanes` surfaces the
// new drives use are TEST DOUBLES of the DOM and the REAL fork host, never module mocks).
//
// THE FINDINGS THIS PASS AUTHORS TEETH FOR, each with the arm it rides:
//   · `F1` (BLOCKER — ONE ESTABLISHMENT PER GESTURE) rides row 4's arm 1 ("terminal — end
//     writes exactly ONCE with the value the seam supplied"): the REAL establishment pair
//     is DRIVEN end to end (`installShellPointers` → the vendored `domEventSource().on` →
//     `element.addEventListener` → the session's own `beginOperation`, PLUS the delegated
//     `pointerdown` → `establishGutterGesture` → `host.startGutter` → the second `begin`),
//     on the fork's own `dom-shim` DOM and the REAL `SidebarPanes` host. One gesture must
//     produce exactly ONE establishment, ZERO mid-gesture teardown, and exactly ONE commit
//     on the ONE write path; a `'busy'` answer from the second `begin` is NOT a failed
//     establishment. It REDs at this head (both a fresh control and the repeat gesture).
//   · `F2` (HIGH — THE CAPTURE CAPABILITY MUST BE REAL) rides row 4's arm 6 ("policy —
//     the takeover-commit (H-4) and stage.size untouched: the fork own rules hold at the
//     boundary", i.e. §3 row 4's POLICY arm, whose column names the deferred-capture
//     policy in terms): the fork's capture path must carry a POINTER IDENTITY into the
//     DOM call (the shim records `setPointerCapture`'s argument), and a pointer that
//     LEAVES the element after establishment must not lose the gesture. REDs.
//   · `F5` (MEDIUM — THE MODULE'S RETURNED TOKEN MUST REACH THE GRID) rides row 5's arm 2
//     ("clause — the grid consumes the TRACK tokens for the four zones"): the fork's OWN
//     write site is driven against a recording grid sink — a non-empty zone's module value
//     must be APPLIED (removal belongs ONLY to the `''`/absent case), and a sink WITHOUT
//     `removeProperty` must not keep a stale `0px` after a zone becomes non-empty. REDs.
//   · `F6` (MEDIUM — THE PROJECTION RECORD MUST BE APPLIED, OR THE DEAD CALL GONE) rides
//     row 5's arm 3 (the stage-track clause): the §3 row 2 record's own keys must reach
//     the sink OR the `layoutCssVars(...)` call site must be gone. REDs at this head.
//   · `F8` (MEDIUM — THE ROWS' DECLARED SUBJECTS MUST BE INHABITED BY THE FORK'S OWN
//     SEAMS) rides four arms, each INSTANTIATING AND DRIVING the fork's own reduced seam
//     rather than censusing source text: row 3's arm 1 and arm 2 drive `zoneTrackVars`
//     with the fork's real inputs (its own census source, its own closure adapter, its own
//     collapse policy) and grade the `revealed` polarity BOTH WAYS through the FORK's
//     function; row 4's arm 11 keeps its census and ADDS a driven
//     `createGutterResizeController` (exactly one commit per committing gesture, ZERO on
//     cancel, ZERO on a refused establishment, no non-finite/negative/out-of-window write);
//     row 5's arm 5 keeps its three authored-affordance limbs and ADDS the
//     cursor-declaration consumption (`renderer.ts`'s `applyGutterCursorDeclaration` + the
//     module's `cursorDeclarationFor`), which gate 4 found exercised by NO suite, plus its
//     own falsifier (an unknown axis token must leave the cursor declaration UNWRITTEN).
//   THE `F8` DRIVES ALSO RED, at a reading the gate-4 list did not name: row 3's arm 2
//   surfaces that `layout-state.ts`'s `zoneTrackVars` indexes the vendored record by the
//   TOKEN name (`--zone-<z>-track`) instead of the ZONE MEMBER the module keys by — so
//   every lookup misses, the `''` the reveal predicate's DECLINED member carries is thrown
//   away, and the C11 carve-out (an empty zone that IS being revealed must not collapse)
//   is DEAD at the fork's own seam. THAT IS A FORK DEFECT, not a test-side expectation:
//   §3 row 1's policy column states the carve-out, and the function's own doc block claims
//   the `''` "degrade[s] to the size rather than to a collapse" while its code answers
//   `0px`.
//
// THE LAYER IS UNCHANGED (`§2.2`, `§7.1`, `R-11`, `D-12`): every new limb holds the `[T]`
// node-pure ENVELOPE/wiring layer — establishment, the ONE commit write, the record's
// tokens, the capture CALL and its argument, a cursor declaration's TEXT. NONE of it is a
// layout claim: the shim has no layout engine, no computed style, no scroll range and no
// real capture semantics (only the CALL is observable — its own documented limit), and
// §7.2's three limbs remain LIVE-ONLY and asserted by NOTHING here.
// =====================================================================================
// ─────────────────────────────────────────────────────────────────────────────────────
// ⟨SUPERSEDED `2026-10-05` — KEPT VISIBLE, `RCA-8(c)`: THE READING BELOW IS THE FILING
//   PASS'S (the red-first expectation), AND BOTH OF ITS LOAD-BEARING CLAIMS ARE
//   CONTRADICTED AT THIS HEAD — the first by the tree, the second by THIS FILE'S OWN
//   CURRENT BLOCK ABOVE. It is kept verbatim as that pass's reading and is superseded by
//   the two markers below. `CURRENT READING` (1) — THE ADOPTION HAS LANDED, ON THIS FILE'S
//   OWN MEASURED ROWS: `P-IM-zone-repl-1 · strat:zone-replacement-adoption-wiring · held ·
//   declared 6 (one per adoption) + 6 (duplicate-absence witnesses) + 1 (the closure adapter
//   existence) = 13 · executed 13 · stoppedAt null · counterexamples 0 · abandoned 0` and
//   `P-IM-zone-repl-2 · strat:zone-replacement-consumer-edges-declared · held · declared
//   6 (adopted edges declared) + 4 (evasion shapes refused) + 3 (pre-existing rows untouched)
//   = 13 · executed 13 · stoppedAt null · counterexamples 0 · abandoned 0` — so the six
//   adoption edges ARE declared and the six duplicate-absence witnesses (which demand the
//   local duplicate's ABSENCE from its owner file) all hold. The local duplicates the
//   paragraph below names as *"all still present"* are, at this head, the DECLINED half the
//   contract records in §3.5/§3.6 (`createRelocateSession`'s session composition and the
//   affordance-controller composition — DECLINED FOR THIS UNIT, RECORDED, each witnessed by
//   its own limb rather than by being left in place unremarked). `CURRENT READING` (2) — THE
//   SIX ROWS: **ALL SIX ROWS HELD**, every declared term EXECUTED
//   (`13 + 13 + 13 + 11 + 12 + 14 = 76`), `stoppedAt` null for all six, zero
//   counterexamples, zero abandoned arms (`MEASURED`: this file's own run — the same reading
//   the block at `:136-139` of this head already records, i.e. the very block that
//   contradicts the paragraph below). SO THE PARAGRAPH'S OWN CONCLUSION — *"rows 1/2/3/4/5
//   are expected BROKEN and row 6 is expected HELD … this file must be the RED SET the
//   Implementer turns green, not a green suite"* — IS ITS FILING PASS'S EXPECTATION AND IS
//   SUPERSEDED BY THAT MEASURED READING. NOTHING ELSE MOVES: no assertion, arm, term, figure,
//   seed or cap changes by this note; the paragraph stays VISIBLE verbatim (`RCA-8(c)`); and
//   this note asserts nothing itself — every figure it names is the register's own printed
//   reading, quoted, never re-derived here. LAYER (`RCA-12`): `[T]` node/envelope reading
//   only, never app-green.⟩
// ─────────────────────────────────────────────────────────────────────────────────────
// The adoption has NOT landed: nothing under `src/` imports the vendored modules; the
// local duplicates (`layout-state.ts`'s `zoneTrackCssVars` and its private
// `isZoneEmpty`-class helper, `pane-graph.ts`'s `enabledZonePaneCounts`, `pane-gutter.ts`'s
// `createGutterController`, `pane-drag.ts`'s `withinSnapThreshold`, `renderer.ts`'s
// hand-rolled gesture session and its immediate gutter capture, `index.html`'s inline
// gutter markup) are all still present; the `DECLARED_CONSUMER_EDGES` allow-list still
// carries its three pre-existing rows; and the two named semantic findings
// (`clampToBounds`'s `NaN` vs the fork's `min`, and `computeTrackVars`' callable-only
// `revealed` at the write site) are UNFIXED. So rows 1/2/3/4/5 are expected BROKEN and
// row 6 is expected HELD — the register must say so itself, with its counterexamples, and
// this file must be the RED SET the Implementer turns green, not a green suite.
//
// =====================================================================================
// `G-3` / `G-4` / `G-6` / `G-7` — THE HARD CONSTRAINTS THIS FILE OBEYS
// =====================================================================================
// `G-3`: this suite reads no configuration and edits none — `vitest.config.ts`
//   (`testTimeout` `15_000`, floor AND ceiling) is never named as a subject and never
//   touched; this file buys no headroom anywhere.
// `G-4`: NEW TESTS MUST MOCK NOTHING. This suite binds NO mock API at all — no `vi.mock`,
//   no `vi['mock']`, no alias, no helper that joins the protected five-name `'electron'`
//   census (`tests/pd-vendor-set.test.ts` §3a `A-12`;
//   `tests/pd-ui-1-theme-register.test.ts` -> `PINNED_BRIDGE_MOCK_CENSUS`). The event
//   sources this suite builds are plain objects implementing the vendored `EventSource`
//   seam — test doubles, never module mocks.
// `G-6`: this suite asserts the `PROTECTED` import-use contract of
//   `tests/unit-live11-bridge-seams.test.ts` (`defaultLayout`/`coerceLayout` keep their
//   names, arity, parameter types, return shape and total/fail-soft behaviour) and never
//   edits it. `layout-state.ts` is NOT replaced whole-file (`D-2`).
// `G-7`: the `UNTOUCHED_DIGESTS` re-statement is a LANDING obligation (`O-8`). This suite
//   READS that table and asserts its SHAPE (seven rows, exactly one `sidebar-panes.ts`
//   row) — it never edits it and never encodes the landing's new value.
//
// =====================================================================================
// THE REGISTER'S DECLARED TERM ORDER — declared here, because §6 declares each row's
// subject and its term SUM but no intra-row order (`O-11` is the seed; §6's machinery
// fixes the caps, the sequence of ROWS and the stop rule, not the order of a row's own
// arms). The order used below is §6's own grouping order, arm for arm:
//   row 1: the six adoption arms (§3's row order) · the six duplicate-absence witnesses ·
//          the closure adapter's existence.
//   row 2: the six adopted edges declared · the four refused evasion shapes · the three
//          pre-existing rows untouched.
//   row 3: the four track limbs · the four census shapes · the four unusable-input
//          classes · the array-vs-closure falsifier.
//   row 4: the three gesture terminals · the three policy seams · the four fail-states ·
//          the per-move write-stream discriminator.
//   row 5: the six shell-clause assertions · the four zone tokens' names and units · the
//          two controls.
//   row 6: the eight adopted modules' bytes · the manifest set · the four baseline files ·
//          the one-byte mutation control.
// ⟨AMENDED `2026-10-04` (THE DECLINE-RECORDING PASS) — `RCA-8(c)`: the six lines above are KEPT
//   as the FILED term order, and the two below record what the re-declaration changes about
//   them. THE ARITHMETIC MOVES FOR NEITHER ROW — the re-declaration moves SUBJECTS, and this is
//   the reading that shows why no term does:
//   row 5 — UNMOVED (`6 + 4 + 2 = 12`). The DECLARED SUBJECT of the twelve terms is re-declared
//          to the landed members (`§3.6.2`): the element-backed source, the cursor declaration
//          and the fork's cursor write through the `applyCursor` shape, the four
//          envelope-authored affordances WITH their §3.1/§3.2 clauses — beside the declaration
//          clauses and the grid/track consumption the filed register already declared. The
//          affordance factory's COMPOSITION is NOT part of the row any more (`§3.5`/`§3.6.2`/
//          `§4.0`), and no term reds for its absence; the decline's own witness rides ROW 1's
//          row-5 adoption arm (`§4.0(1)`). The per-term subject map and every kept tooth's
//          stimulus are at the row's own site.
//   row 6 — UNMOVED (`8 + 1 + 4 + 1 = 14`), AND NO RE-DECLARATION IS OWED: §6's row 6 is purely
//          the byte-identity property of the adopted set, and none of its fourteen terms names
//          the declined relocate session or its seven seams. `§3.6.1`'s decline is RECORDED at
//          the `ADOPTIONS` table's row 6, at row 6's own site, and witnessed by a limb on row
//          1's row-6 adoption arm — the decline's consequence (`createRelocateSession` imported
//          by NOTHING), never a term invented for a subject the contract does not declare.⟩
// THE CAPS ARE HONOURED (at most 100 per row, 400 in total) and THE STOP RULE IS
// MECHANICAL: on the fifth CONSECUTIVE failure a row abandons its remaining arms and
// REPORTS the stop through `stoppedAt`. Because most rows are red at this head, several
// rows legitimately stop early — so every arm's outcome is ALSO recorded, in declared
// order, with the ABANDONED arms named (never hidden), and the DECLARED term is NEVER
// reduced to match what ran.

import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

import { computeTrackVars } from '../src/shared/census.js'
import { isEmpty as vendoredIsEmpty, trackFor as vendoredTrackFor } from '../src/shared/zones.js'
import { containerDeclarationFor } from '../src/shared/container.js'
import { createResizeController } from '../src/shared/gutter.js'
import { createGestureSession, type EventSource } from '../src/shared/gesture-session.js'
// §3 row 5's `cursorOf` seam resolution — the MODULE's own answer, so the fork's consumed
// cursor declaration is graded against the module rather than against a second copy.
import { cursorDeclarationFor } from '../src/shared/gutter-affordance.js'
// ⟨THE GATE-4 FIX PASS⟩ THE FORK'S OWN SEAMS, INSTANTIATED AND DRIVEN RATHER THAN CENSUSED
// (`F8`): the `dom-shim` element/document surface is the fork's own test-expressible DOM
// (a TEST DOUBLE of the DOM — never a module mock; `G-4` binds no mock API here), the
// envelope/`SidebarPanes` host is the REAL host class, and `installShellPointers` is the
// REAL renderer wiring.
import { installShim, ShimElement } from '../src/shared/dom-shim.js'
// `D-2`/`G-6`: the PROTECTED model stays; this suite only READS it as the caller data its
// rows need (the four zone names, the total coercion, and the pinned defaults).
import {
  LAYOUT_PANE_ZONES,
  defaultLayout,
  zoneTrackVars,
  type LayoutState,
  type LayoutZoneName,
} from '../src/renderer/layout-state.js'
// §3 row 2's PROJECTION SEAM SUPPLIER — read for the RECORD it produces, so the write
// site's treatment of that record is graded against the record itself (`F6`).
import { layoutCssVars } from '../src/renderer/layout-vars.js'
// `F8`: the FORK'S OWN controller factory (`createGutterResizeController`) beside the pure
// seam suppliers it composes.
import {
  createGutterResizeController,
  gutterAxis,
  gutterBounds,
  isGutterResizable,
} from '../src/renderer/pane-gutter.js'
// `F1`/`F2`/`F5`/`F6`: the REAL host class and the REAL shell pointer wiring — the two
// halves of the establishment pair the `F1` drive exists to exercise.
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { installShellPointers } from '../src/renderer/renderer.js'
// ⟨`PD-UI-14` REMAND `2026-10-04`⟩ §3 row 5's RE-POINTED authoring site: the four
// gutter affordances must be authored as ENVELOPE DATA at `src/renderer/pane-graph.ts`
// and driven through the producing graph — so this suite DRIVES that module's real
// assembler (`assembleAppGraphEnvelope`, the SAME entry `sidebar-panes.ts` calls) rather
// than censusing the shell HTML for markup that is leaving it.
import { assembleAppGraphEnvelope } from '../src/renderer/pane-graph.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

/** The pin file this suite READS (never edits) for the pinned set, the pin commit and the
 *  declared consumer-edge allow-list. */
const SET_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-set.test.ts')
/** The theme register this suite READS (never edits) for the token census and the
 *  `UNTOUCHED_DIGESTS` table. */
const THEME_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-ui-1-theme-register.test.ts')
const PANE_GUTTER_PATH = join(REPO_ROOT, 'src', 'renderer', 'pane-gutter.ts')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const SIDEBAR_PANES_PATH = join(REPO_ROOT, 'src', 'renderer', 'sidebar-panes.ts')
const INDEX_HTML_PATH = join(REPO_ROOT, 'src', 'renderer', 'index.html')
const MANIFEST_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')

// ===========================================================================
// §6 — SHARED MACHINERY, pinned once and binding on every row.
//
// Seed `0x20261004` — a FIXED LITERAL in this file: never `Date.now()`, never
// `Math.random()`, never an environment read. Where a row draws a pool member it is a
// hand-rolled 32-bit LCG, ONE STEP PER DRAW (`state(n+1) = (state(n) * 1664525 +
// 1013904223) mod 2^32`), selecting a member by `index = state(n+1) mod pool.length`.
// At most 100 attempts per row; at most 400 in total; the rows run SEQUENTIALLY in
// register order; STOP AFTER 5 CONSECUTIVE FAILURES — the running row's remaining
// attempts are abandoned, and the abandonment is REPORTED through `stoppedAt` — never
// hidden.
// ===========================================================================
const REGISTER_SEED = 0x20261004
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5

function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

/** ⟨`O-11`⟩ The seed's literal is a RECORDED READING of the filing pass's day in the house
 *  form (`0x20261004` is `2026-10-04`). The contract's own clause: if the run's day
 *  differs, the RUN's day governs and the literal is re-taken, never copied. The literal
 *  is pinned above and this sentinel records whether it was re-taken — a re-take is a
 *  VISIBLE decision, never a quiet edit. */
const SEED_RE_TAKEN_ON: string | null = null

interface RowReport {
  row: string
  strategyId: string
  /** the DECLARED term, printed as the sum of its own factors */
  declared: string
  declaredTotal: number
  /** the EXECUTED term, read from the run — never copied from the declaration */
  executed: number
  held: boolean
  stoppedAt: number | null
  counterexamples: string[]
  /** the per-attempt outcome record — which arms held, in order */
  limbs: Array<{ index: number; held: boolean }>
  /** every arm's name and outcome, in declared order (the ABANDONED arms included, so no
   *  arm's reading is hidden) */
  arms: Array<{ index: number; name: string; held: boolean; driven: boolean }>
}

/** One arm of a register row: its NAME (its declared subject) and a CHECK that returns a
 *  counterexample string, or `null` when the arm HELD. */
interface Arm {
  name: string
  check: () => string | null
}

const REPORTS: RowReport[] = []
let TOTAL_ATTEMPTS = 0

/** THE DECLARED REGISTER, §6's six rows in register order, each row's term printed as the
 *  sum of its own factors — the contract's own arithmetic, never a count this file chose. */
const DECLARED_REGISTER: Array<{ row: string; strategyId: string; declared: string; declaredTotal: number }> = [
  {
    row: 'P-IM-zone-repl-1',
    strategyId: 'strat:zone-replacement-adoption-wiring',
    declared: '6 (one per adoption) + 6 (duplicate-absence witnesses) + 1 (the closure adapter existence)',
    declaredTotal: 13,
  },
  {
    row: 'P-IM-zone-repl-2',
    strategyId: 'strat:zone-replacement-consumer-edges-declared',
    declared: '6 (adopted edges declared) + 4 (evasion shapes refused) + 3 (pre-existing rows untouched)',
    declaredTotal: 13,
  },
  {
    row: 'P-SM-zone-repl-3',
    strategyId: 'strat:zone-replacement-census-track-record',
    declared:
      '4 (track limbs: sized / empty / declined / symbol-dropped) + 4 (census shapes) + 4 (unusable-input class) + 1 (the array-vs-closure falsifier)',
    declaredTotal: 13,
  },
  {
    row: 'P-SM-zone-repl-4',
    strategyId: 'strat:zone-replacement-one-write-per-gesture',
    declared: '3 (gesture terminals) + 3 (policy seams) + 4 (fail-states) + 1 (per-move discriminator)',
    declaredTotal: 11,
  },
  // ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`/§6.0: THE ROW-5 TERMS ARE UNMOVED
  //   (`6 + 4 + 2 = 12`), AND THE DECLARED SUBJECT BESIDE THEM IS RE-DECLARED to the LANDED set
  //   `§3.6.2` names (the element-backed source `domEventSource`; `cursorDeclarationFor` and the
  //   fork's cursor write through the `applyCursor` shape; the four envelope-authored affordances
  //   with their §3.1/§3.2 clauses) BESIDE the declaration clauses and the grid/track
  //   consumption §6 row 5 filed. `SUPERSEDED` (§3.5/§3.6.2): §3 row 5's filed adopted set —
  //   `createGutterAffordance` + `cursorDeclarationFor` + `domEventSource` + the eleven seams —
  //   whose COMPOSITION is `DECLINED FOR THIS UNIT — RECORDED` and is NOT part of this row. No
  //   term moves: the filed terms never named the factory or its seams, so nothing is reduced and
  //   no `stoppedAt` is owed. The row's site carries the term-by-term map and the kept teeth.⟩
  {
    row: 'P-TP-zone-repl-5',
    strategyId: 'strat:zone-replacement-shell-declaration-clauses',
    declared: '6 (shell clause assertions) + 4 (zone tokens) + 2 (controls)',
    declaredTotal: 12,
  },
  // ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`/§6.0: **NO RE-DECLARATION IS OWED
  //   HERE**, and this pass invented none. §6's row 6 declares PURELY the byte-identity property
  //   of the adopted set; not one of its fourteen terms names `createRelocateSession`, its seven
  //   seams, or any member `§3.6.1` re-declares — so the amendment licenses no move (§6.0 (1):
  //   the subjects are re-declared to the landed members and "NOTHING WIDER"). The decline's
  //   consequence is RECORDED instead (§4.0(1); §3.6.1): the session factory is imported by
  //   NOTHING, while the row's LANDED half — `withinProximity` through `measuresWithinSnapThreshold`,
  //   the `distance` seam `distanceToZoneBox`, and the four named suppliers — IS wired. The eight
  //   adopted modules stay adopted and byte-pinned: what stays unimported is the two FACTORIES,
  //   never the two modules.⟩
  {
    row: 'P-TP-zone-repl-6',
    strategyId: 'strat:zone-replacement-vendored-bytes-unmoved',
    declared:
      '8 (adopted modules byte-identical) + 1 (the manifest set) + 4 (baseline files unreplaced) + 1 (one-byte mutation control)',
    declaredTotal: 14,
  },
]

/** §6's own printed arithmetic, derived from the register above — `13 + 13 + 13 + 11 + 12 + 14 = 76`.
 *  A DERIVED reading of the declared column, never a second hand-typed figure. */
const REGISTER_DECLARED_TOTAL = DECLARED_REGISTER.reduce((sum, r) => sum + r.declaredTotal, 0)

/** THE ROW'S BOUNDED ATTEMPT LOOP — §6's machinery, mechanically. The arm is evaluated
 *  ONCE, its outcome ALWAYS recorded (so an ABANDONED arm is REPORTED as abandoned rather
 *  than silently dropped), the row's remaining attempts are abandoned once `STOP_AFTER`
 *  CONSECUTIVE failures have been seen, and the abandonment is reported through
 *  `stoppedAt`. The DECLARED term is never reduced. */
function runRow(id: string, arms: Arm[]): RowReport {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)
  if (declared === undefined) throw new Error(`ZONE-REPLACEMENT register failure: ${id} is not a declared register row`)
  const counterexamples: string[] = []
  const limbs: RowReport['limbs'] = []
  const armRecords: RowReport['arms'] = []
  let attempts = 0
  let consecutive = 0
  let stoppedAt: number | null = null
  for (let i = 0; i < arms.length; i++) {
    const arm = arms[i]!
    if (stoppedAt !== null || attempts >= CAPS.perRow || TOTAL_ATTEMPTS >= CAPS.total) {
      if (stoppedAt === null) stoppedAt = i + 1
      armRecords.push({ index: i + 1, name: arm.name, held: false, driven: false })
      continue
    }
    attempts += 1
    TOTAL_ATTEMPTS += 1
    const ce = arm.check()
    const held = ce === null
    limbs.push({ index: i + 1, held })
    armRecords.push({ index: i + 1, name: arm.name, held, driven: true })
    if (held) {
      consecutive = 0
      continue
    }
    consecutive += 1
    counterexamples.push(`arm ${i + 1} (${arm.name}): ${ce}`)
    if (consecutive >= STOP_AFTER && stoppedAt === null) stoppedAt = i + 1
  }
  const report: RowReport = {
    row: id,
    strategyId: declared.strategyId,
    declared: declared.declared,
    declaredTotal: declared.declaredTotal,
    executed: attempts,
    held: counterexamples.length === 0 && attempts === declared.declaredTotal,
    stoppedAt,
    counterexamples,
    limbs,
    arms: armRecords,
  }
  REPORTS.push(report)
  expect(
    report.held,
    `${id} ${declared.strategyId}: declared ${declared.declared} = ${declared.declaredTotal} attempt(s); executed ${attempts}; ` +
      `stoppedAt ${String(stoppedAt)} — ${report.held ? 'HELD' : 'BROKEN'}` +
      (counterexamples.length > 0 ? `; counterexamples: ${counterexamples.slice(0, 5).join(' | ')}` : ''),
  ).toBe(true)
  return report
}

// ===========================================================================
// THE [T] READERS. Every one reads a REAL file or drives a REAL module: nothing is
// mocked, nothing is simulated, and no helper joins the protected bridge-mock census.
// ===========================================================================
const TEXT_CACHE = new Map<string, string>()

function readText(path: string): string {
  const hit = TEXT_CACHE.get(path)
  if (hit !== undefined) return hit
  try {
    const text = readFileSync(path, 'utf8')
    TEXT_CACHE.set(path, text)
    return text
  } catch (e) {
    throw new Error(`ZONE-REPLACEMENT [T] read failure: ${path} — ${(e as Error).message}`)
  }
}

function md5(bytes: Buffer | string): string {
  return createHash('md5').update(bytes).digest('hex')
}

/** Every TypeScript file under `src`, repo-relative and POSIX-shaped. */
function listSrcFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return listSrcFiles(p)
    return e.name.endsWith('.ts') ? [relative(REPO_ROOT, p).split('\\').join('/')] : []
  })
}

// ---------------------------------------------------------------------------
// The pin's DERIVATION, re-implemented here (the pin is READ, never imported: importing it
// would bind a second derivation's side effects, and a copy of its ARRAY would be a second
// authority over the allow-list). The four statement SHAPES are the pin's own: the static
// from form plus the three refused EVASION shapes (dynamic `import(...)`, `require(...)`,
// `new URL(...)`) — with a construct inside a STRING never a hit, because the reader is
// AST-shaped, not a text scan.
// ---------------------------------------------------------------------------
function pinnedFifteenFromPin(): string[] {
  const text = readText(SET_PIN_PATH)
  const block = /const PINNED_FIFTEEN = \[([\s\S]*?)\] as const/.exec(text)
  expect(block, `RED: ${SET_PIN_PATH} no longer carries the PINNED_FIFTEEN constant`).not.toBeNull()
  const names = [...block![1]!.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]!)
  expect(names.length, 'the pinned fifteen-name list must carry fifteen names').toBe(15)
  return names
}

function pinnedCommitFromPin(): string {
  const m = /const PINNED_COMMIT = '([0-9a-f]{40})'/.exec(readText(SET_PIN_PATH))
  expect(m, `RED: ${SET_PIN_PATH} no longer carries PINNED_COMMIT`).not.toBeNull()
  return m![1]!
}

interface DeclaredEdge {
  file: string
  specifier: string
  member: string
  unit: string
}

/** THE DECLARED CONSUMER-EDGE ALLOW-LIST, read out of the pin's own source — the three
 *  pre-existing rows plus whatever a landing adds. Read as a READING of the pin, never
 *  taken from a copy. */
function declaredConsumerEdgesFromPin(): DeclaredEdge[] {
  const text = readText(SET_PIN_PATH)
  const block = /const DECLARED_CONSUMER_EDGES:[\s\S]*?= \[([\s\S]*?)\n\]/.exec(text)
  expect(block, `RED: ${SET_PIN_PATH} no longer carries the DECLARED_CONSUMER_EDGES array`).not.toBeNull()
  return [
    ...block![1]!.matchAll(
      /\{\s*file:\s*'([^']+)',\s*specifier:\s*'([^']+)',\s*member:\s*'([^']+)',\s*unit:\s*'([^']+)'\s*\}/g,
    ),
  ].map((m) => ({ file: m[1]!, specifier: m[2]!, member: m[3]!, unit: m[4]! }))
}

/** The theme pin's token-NAME table (the `G-5` census' fifteen names). */
function pinnedTokensFromPin(): string[] {
  const block = /const PINNED_TOKENS = \[([\s\S]*?)\] as const/.exec(readText(THEME_PIN_PATH))
  expect(block, `RED: ${THEME_PIN_PATH} no longer carries PINNED_TOKENS`).not.toBeNull()
  return [...block![1]!.matchAll(/'(--[a-z0-9-]+)'/g)].map((m) => m[1]!)
}

interface UntouchedRow {
  file: string
  md5: string
  superseded?: string
  restated?: string
}

/** `UNTOUCHED_DIGESTS` — READ for its SHAPE only (`G-7`): a landing re-states exactly one
 *  of these rows, and this suite must neither encode the new value nor tolerate a row's
 *  disappearance. */
function untouchedDigestsFromPin(): UntouchedRow[] {
  const block = /const UNTOUCHED_DIGESTS:[\s\S]*?= \[([\s\S]*?)\n\]/.exec(readText(THEME_PIN_PATH))
  expect(block, `RED: ${THEME_PIN_PATH} no longer carries the UNTOUCHED_DIGESTS table`).not.toBeNull()
  return [...block![1]!.matchAll(/\{\s*file:\s*'([^']+)'[^}]*\}/g)].map((m) => {
    const row = m[0]
    const digested = /md5:\s*'([0-9a-f]{32})'/.exec(row)
    const superseded = /superseded:\s*'([0-9a-f]{32})'/.exec(row)
    const restated = /restated:\s*'([^']+)'/.exec(row)
    return {
      file: m[1]!,
      md5: digested === null ? '' : digested[1]!,
      ...(superseded !== null ? { superseded: superseded[1]! } : {}),
      ...(restated !== null ? { restated: restated[1]! } : {}),
    }
  })
}

const PINNED_FIFTEEN = pinnedFifteenFromPin()
const PINNED_COMMIT = pinnedCommitFromPin()
const PINNED_TOKENS = pinnedTokensFromPin()

/** The vendored member a specifier stem names, or `null` (the pin's own `vendoredStemOf`). */
function vendoredStemOf(spec: string): string | null {
  const m = /(?:^|\/)([a-z-]+)\.js$/.exec(spec)
  return m !== null && PINNED_FIFTEEN.includes(m[1]!) ? m[1]! : null
}

interface DerivedEdge {
  file: string
  spec: string
  kind: 'static-from' | 'dynamic-import' | 'require' | 'new-URL'
  resolved: string
  /** the vendored member the RESOLVED path names, or `null` (a fork module / a bare spec) */
  member: string | null
}

/** The pin's four statement SHAPES, over the AST: the static from form plus the three
 *  EVASION forms §5 `G-2` says are caught, never hidden. */
function derivedEdges(src: string, file: string): DerivedEdge[] {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const out: DerivedEdge[] = []
  const push = (spec: string, kind: DerivedEdge['kind']): void => {
    const stem = vendoredStemOf(spec)
    if (stem === null) return
    const resolved = spec.startsWith('.') ? resolve(dirname(resolve(REPO_ROOT, file)), spec.replace(/\.js$/, '.ts')) : ''
    const member = resolved !== '' && resolved === join(REPO_ROOT, 'src', 'shared', `${stem}.ts`) ? stem : null
    out.push({ file, spec, kind, resolved: resolved === '' ? `<bare:${spec}>` : resolved, member })
  }
  const walk = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) push(node.moduleSpecifier.text, 'static-from')
    if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteralLike(node.moduleSpecifier)) {
      push(node.moduleSpecifier.text, 'static-from')
    }
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'require') {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'require')
      }
      const calleeReadsUrl = ts.isPropertyAccessExpression(callee) && (callee.name.text === 'resolve' || callee.name.text === 'href')
      const parentNode = node.parent as ts.Node | undefined
      const calledThenHref =
        parentNode !== undefined &&
        ts.isPropertyAccessExpression(parentNode) &&
        parentNode.expression === node &&
        parentNode.name.text === 'href'
      if (calleeReadsUrl || calledThenHref) {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL')
      }
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'dynamic-import')
      }
    }
    if (ts.isNewExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'URL') {
        const arg = node.arguments?.[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL')
      }
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return out
}

const SRC_FILES = listSrcFiles(join(REPO_ROOT, 'src')).sort()
const SRC_EDGE_CACHE = new Map<string, DerivedEdge[]>()

function edgesOf(file: string): DerivedEdge[] {
  const hit = SRC_EDGE_CACHE.get(file)
  if (hit !== undefined) return hit
  const edges = derivedEdges(readText(join(REPO_ROOT, file)), file)
  SRC_EDGE_CACHE.set(file, edges)
  return edges
}

/** EVERY vendored-resolving hit in the tree: the consumer edges plus the vendored set's own
 *  INTRA-VENDORED edges (`census` to `zones` and friends), which the pin assigns to
 *  `P-IM-3` and NOT to the consumer-edge allow-list. The distinction is §5 `G-2`'s and it
 *  is kept visible here rather than collapsed. */
function allVendoredResolvingEdges(): DerivedEdge[] {
  return SRC_FILES.flatMap((f) => edgesOf(f)).filter((e) => e.member !== null)
}

function isVendoredMemberFile(file: string): boolean {
  return PINNED_FIFTEEN.some((n) => file === `src/shared/${n}.ts`)
}

/** A consumer file's vendored-resolving hits that are NOT on the allow-list — `G-2`'s own
 *  oracle: an unlisted hit whose source is a CONSUMER file still fails. */
function unlistedVendoredEdges(declared: DeclaredEdge[]): DerivedEdge[] {
  const listed = new Set(declared.map((d) => `${d.file} ${d.specifier}`))
  return allVendoredResolvingEdges().filter((e) => !isVendoredMemberFile(e.file) && !listed.has(`${e.file} ${e.spec}`))
}

/** Every CONSUMER file that imports a vendored member, by RESOLVED member. */
function importersOf(member: string): DerivedEdge[] {
  return allVendoredResolvingEdges().filter((e) => e.member === member && !isVendoredMemberFile(e.file))
}

/** Strip comments, so a token asserted as a WRITE/CONSUME form is never satisfied by prose
 *  (the sibling registers' discipline). */
function codeOf(path: string): string {
  return readText(path)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, ''))
    .join('\n')
}

function codeOfAllSrc(): Array<{ file: string; code: string }> {
  return SRC_FILES.map((f) => ({ file: f, code: codeOf(join(REPO_ROOT, f)) }))
}

/** Does the code reference this symbol anywhere (a declaration, a call or a reference)? */
function mentionsSymbol(code: string, symbol: string): boolean {
  return new RegExp(`\\b${symbol}\\b`).test(code)
}

// ---------------------------------------------------------------------------
// ⟨`PD-UI-14` REMAND `2026-10-04` — THE ENVELOPE AUTHORING SITE'S AFFORDANCE READER
// (`RCA-8(c)`: the superseded reading is kept VISIBLE beside this one, never deleted)⟩
//
// THE RULING THIS READER EXECUTES (contract §3 row 5's local-duplicate column, read
// with §2.1(e) and §2.2):
//   *"the fork has no gutter-affordance module; what exists is inline authored markup +
//   CSS in `src/renderer/index.html` (the four `div.gutter[data-zone][data-axis]` and
//   their cursor rules) — that markup is REPLACED by a provident-authored affordance
//   (the project-wide UI constraint: a non-shell UI element is authored as envelope
//   data), not by host-authored DOM"*, and the cursor DECLARATION stays `SHELL` CSS.
//
// THEREFORE THE SITE IS `src/renderer/pane-graph.ts` — the fork's ENVELOPE-AUTHORING
// module — and the honest reading is NOT a source-text census of a `.html` file: the
// four authored affordances must be ENVELOPE DATA DRIVEN THROUGH THE PRODUCING GRAPH.
// This reader drives `assembleAppGraphEnvelope` (the producing graph's assembler, the
// SAME entry the host calls) and reads the assembled envelope's own nodes. A host-
// authored `div` in `index.html` can NEVER appear here — its absence from the envelope
// IS the "not host-authored DOM" verdict, asserted by construction rather than by a
// second source census.
//
// ⟨SUPERSEDED IN PLACE — `RCA-8(c)`, KEPT VISIBLE, NEVER DELETED: the as-filed clause #6
//   read the WRONG FILE and is recorded here verbatim as that pass's reading:
//     const authored = [...gridText().matchAll(/class="gutter" data-zone="([a-z-]+)"/g)]
//       .map((m) => m[1]!)
//     if (authored.length !== 4 || authored.slice().sort().join(',')
//         !== LAYOUT_PANE_ZONES.slice().sort().join(',')) {
//       return `the authored affordances are [${authored.join(',')}] (${authored.length}) —
//         §4 item (viii)/§2 point (g) allow exactly the four pane zones`
//     }
//   WHY IT WAS WRONG: `index.html` is the file the markup is LEAVING (row 5's own
//   duplicate column). A census of it demanding FOUR inline gutters contradicts row 1's
//   duplicate-absence witness #5, which demands ZERO — arm A's regex is a strict subset of
//   arm B's, so no byte string satisfied both. THE FIX IS A RE-POINT, NOT A RELAXATION:
//   the count FOUR survives at the AUTHORING SITE, and the count ZERO survives at the
//   shell HTML.⟩
// ---------------------------------------------------------------------------

/** One affordance node authored as envelope data: it carries BOTH the zone identity and
 *  the AXIS identity (`data-axis` — the attribute the vendored affordance family's
 *  `axisOf` seam feeds; a zone CONTAINER carries `data-orientation` instead, which is a
 *  different fact and never satisfies this reader).
 *  ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: `classes` is ADDED, because §3.6.2's
 *  re-declared item (4) names the landed affordances as carrying §3.2's FULL vocabulary
 *  (`class="gutter"` + `data-zone` + `data-axis`), and the class half had no tooth; the
 *  attribute half keeps the two limbs it had. `§3.2`'s OWN ESCAPE IS HONOURED rather than
 *  overridden: the clause binds the RENDERED attribute set and admits "a different internal
 *  representation ... only if the RENDERED attribute set is this one" — so the reader takes the
 *  authored node's OWN class surface in ANY of its plausible authored forms (a `props['class']`
 *  / `props['className']` string, a `css.classes` array, a node-level `classes`/`class`) and a
 *  landing that re-points the vocabulary must re-point the two dependents AND re-declare this
 *  register row in the same pass, as §3.2 requires.⟩ */
interface AuthoredAffordance {
  zone: string
  axis: string
  /** the node's OWN class surface (its authored class tokens), never a subtree's */
  classes: string[]
}

/** The authored class tokens of ONE envelope node, read from that node's own surfaces only
 *  (never from its children, so a container's class can never satisfy an affordance's). PURE. */
function authoredClassSurface(node: unknown): string[] {
  const out: string[] = []
  const push = (value: unknown): void => {
    if (typeof value === 'string') {
      out.push(...value.split(/\s+/).filter((t) => t !== ''))
      return
    }
    if (Array.isArray(value)) {
      for (const entry of value) push(entry)
    }
  }
  const holder = node as { props?: unknown; css?: unknown; classes?: unknown; class?: unknown; className?: unknown }
  const props = holder.props
  if (props != null && typeof props === 'object' && !Array.isArray(props)) {
    const p = props as Record<string, unknown>
    push(p['class'])
    push(p['className'])
    push(p['classes'])
  }
  const css = holder.css
  if (css != null && typeof css === 'object' && !Array.isArray(css)) {
    push((css as Record<string, unknown>)['classes'])
    push((css as Record<string, unknown>)['class'])
  }
  push(holder.classes)
  push(holder.class)
  push(holder.className)
  return out
}

/** §3.2's CLASS HALF, as a PURE predicate: does the authored node's own class surface carry the
 *  `gutter` token the shell's two dependents (`renderer.ts`'s `GESTURE_SELECTOR` family and
 *  `index.html`'s two `.layout .gutter[data-axis=…]` cursor rules) already target? */
function carriesGutterClass(a: AuthoredAffordance): boolean {
  return a.classes.includes('gutter')
}

/** The authored affordances in ONE node subtree walk: a node whose `props` carry BOTH
 *  `data-zone` and `data-axis`. PURE. */
function affordancesIn(nodes: readonly unknown[]): AuthoredAffordance[] {
  const out: AuthoredAffordance[] = []
  const walk = (node: unknown): void => {
    if (node == null || typeof node !== 'object' || Array.isArray(node)) return
    const props = (node as { props?: unknown }).props
    if (props != null && typeof props === 'object' && !Array.isArray(props)) {
      const p = props as Record<string, unknown>
      if (typeof p['data-zone'] === 'string' && typeof p['data-axis'] === 'string') {
        out.push({ zone: p['data-zone'], axis: p['data-axis'], classes: authoredClassSurface(node) })
      }
    }
    const children = (node as { children?: unknown }).children
    if (Array.isArray(children)) for (const child of children) walk(child)
  }
  for (const node of nodes) walk(node)
  return out
}

/** §3.2'S VOCABULARY LIMB (`clause — the gutters are FOUR ONLY ...`, row 5's arm 5), with its
 *  OWN DRIVEN VACUITY GUARD: the predicate must REJECT a node whose own class surface carries no
 *  `gutter` token, so the limb can never be satisfied by a reader that sees nothing. The
 *  counterexample names §3.2's escape (`a landing that changes that vocabulary MUST re-point
 *  BOTH dependents ... and MUST SAY SO in its DONE row`) rather than pretending the clause
 *  admits any vocabulary silently. */
function affordanceVocabularyOffences(authored: AuthoredAffordance[]): string[] {
  const offenders: string[] = []
  const missing = authored.filter((a) => !carriesGutterClass(a))
  if (missing.length > 0) {
    offenders.push(
      `the authored affordance(s) ${missing
        .map((a) => `${a.zone}/data-axis=${a.axis} (class surface [${a.classes.join(' ')}])`)
        .join(', ')} do NOT carry the \`gutter\` class token §3.2 binds — \`class="gutter"\` plus \`data-zone\` plus \`data-axis\` is the vocabulary BOTH shell dependents already target ` +
        `(renderer.ts's \`GESTURE_SELECTOR\` family and index.html's two \`.layout .gutter[data-axis=…]\` cursor rules), so a changed vocabulary kills the delegated listener and the resize cursor SILENTLY, with every suite green (§3.2's escape: re-point BOTH dependents and say so in the DONE row — and re-declare this register row, §6.0)`,
    )
  }
  if (carriesGutterClass({ zone: 'left', axis: 'columns', classes: [] })) {
    offenders.push(
      'the §3.2 vocabulary limb is VACUOUS: its predicate accepts a synthetic node whose own class surface carries no `gutter` token',
    )
  }
  return offenders
}

/** THE AUTHORING-SITE DRIVE — the four affordances read from the envelope
 *  `assembleAppGraphEnvelope` produces, on the SAME entry the host calls. The traversal
 *  envelope is a minimal real one (one zone-container producer per pane zone is the
 *  assembler's own job, W2-Q3) and the registry carries ONE enabled app-graph pane, so
 *  the drive is a real assembly, never a simulation. */
function authoredAffordancesFromAssembly(): AuthoredAffordance[] {
  const registry = createPaneRegistry()
  registry.register({
    id: 'zone-replacement-affordance-probe',
    title: 'Zone replacement affordance probe',
    scope: 'app-graph',
    defaultZone: 'left',
    render: () => ({ type: 'div', props: { id: 'zone-replacement-affordance-probe' } }),
  })
  registry.enable('zone-replacement-affordance-probe')
  const traversalEnvelope = {
    template: { root: { type: 'div', props: { id: 'wiki-root' }, children: [] } },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
  const ctx = {
    snapshot: null,
    docHeads: null,
    currentDocumentId: null,
    currentNodeId: null,
    backRefs: new Map<string, string[]>(),
    crosslinks: [],
  }
  const assembled = assembleAppGraphEnvelope({
    traversalEnvelope: traversalEnvelope as never,
    registry,
    ctx: ctx as never,
  })
  const root = assembled.envelope.template.root as { children?: unknown[] }
  return affordancesIn([...(root.children ?? [])])
}

// ===========================================================================
// ⟨THE GATE-4 FIX PASS — THE DRIVEN FORK SEAMS (`F1`/`F2`/`F5`/`F6`/`F8`)⟩
//
// WHY THESE DRIVES EXIST, AT THE FINDING THAT MOTIVATED EACH:
//   · `F1` — the fork installs the gesture control on the ELEMENT-BACKED source
//     (`session.install(element, { capture: true })` → the vendored `domEventSource().on`
//     → `element.addEventListener` → the session's own `beginOperation`) AND the
//     document-delegated `pointerdown` path calls `establishGutterGesture` →
//     `host.startGutter(zone, element)` → a SECOND `begin`. Whichever `begin` loses is
//     treated as a FAILED establishment, and `gutterCommit` then returns without writing.
//     The only honest instrument is the REAL pair, driven: the FORK's own wiring
//     (`installShellPointers` from `src/renderer/renderer.ts`), the FORK's own host
//     (`SidebarPanes`), and a DOM the drive can actually dispatch through (the fork's
//     `dom-shim`). A synthetic source that never calls back (the row's other arms) can
//     never see this: it drives ONE establishment and the fork's second one never runs.
//   · `F2` — the CAPTURE CAPABILITY must be REAL: the vendored session calls the source's
//     `capturePointer(element)` with NO pointer identity, so the fork's
//     `element.setPointerCapture()` (no argument) throws on a real DOM and is swallowed —
//     and the session's tracking listeners are bound on the gutter element only, so a
//     drag that leaves its box loses the gesture. The shim records the capture CALL and
//     its ARGUMENT (`ShimElement.setPointerCapture(pointerId)`), which is the fork-side
//     observable: the call must carry an IDENTITY. (The upstream API gap — the session
//     passing no identity — is a `docs/defects.md` → `docs/HANDOFF.md` item, NOT this
//     suite's subject; the FORK side is graded.)
//   · `F5`/`F6` — the WRITE SITE: `sidebar-panes.ts`'s `applyZoneTracks` composes the
//     record (`zoneTrackVars`) with the projection (`layoutCssVars`) and then writes ONLY
//     `'0px'` or REMOVES the property — so the module's own emitted value for a non-empty
//     zone never reaches the grid, and the projection record is computed and DISCARDED.
//   · `F8` — the ROWS' DECLARED SUBJECTS must be INHABITED BY THE FORK'S OWN SEAMS:
//     `zoneTrackVars` (`layout-state.ts`) and `createGutterResizeController`
//     (`pane-gutter.ts`) were invoked by NO test in the repo, so rows 3/4's substantive
//     arms called the VENDORED modules directly and their fork-side teeth were
//     source-text censuses a planted literal satisfies. Every drive below INSTANTIATES
//     AND DRIVES the fork's own reduced seam.
//
// THE LAYER (`§2.2`, `R-11`, `D-12`) IS UNCHANGED BY ALL OF THIS: the drives hold the
// `[T]` node-pure ENVELOPE/envelope-wiring layer — a gesture's establishment, its ONE
// commit write and its record's tokens. They are NOT a layout claim, NOT a rendered-DOM
// claim, and NOT an app-green: the shim has no layout engine, no capture semantics and no
// paint (its own documented limits), and `§7.2`'s three limbs stay LIVE-ONLY.
// ===========================================================================

/** §6's caller-side pane registration used by the drives below: ONE enabled `app-graph`
 *  pane in the named zone. DERIVED from the fork's own registry API — never a literal
 *  census map. */
function registerZoneProbe(registry: ReturnType<typeof createPaneRegistry>, id: string, zone: LayoutZoneName): void {
  registry.register({
    id,
    title: `Zone replacement probe (${zone})`,
    scope: 'app-graph',
    defaultZone: zone,
    render: () => ({ type: 'div', props: { id } }),
  })
}

/** THE REAL SHELL GESTURE DRIVE (`F1`/`F2`) — the establishment pair, end to end.
 *
 *  WHAT IS REAL HERE, and what is an instrument: the host is the REAL `SidebarPanes`; the
 *  wiring is the REAL `installShellPointers`; the document and the gutter element are the
 *  fork's own `dom-shim` (a DOM double — never a module mock); the gesture control carries
 *  the shell's own vocabulary (`class="gutter"` + `data-zone` + `data-axis`, §3.2). The
 *  INSTRUMENTS are three wrappers over the host's own seams: `startGutter` (the fork's
 *  establishment path, counted), `cancelGutter` (the fork's mid-gesture teardown, counted)
 *  and the `bridge.operatorSettings.set` sink (the ONE write path a commit reaches —
 *  `setLayout`'s own persist, §3 row 3's `commit` seam). The wrappers call the real
 *  methods through, so nothing about the wiring is simulated.
 *
 *  THE SHIM'S TWO DOCUMENTED LIMITS, NAMED SO NO READING OVER-CLAIMS: it has no layout and
 *  no real pointer-capture semantics — only the `setPointerCapture(pointerId)` CALL and its
 *  argument are observable (`src/shared/dom-shim.ts`'s own header). `isConnected` is not
 *  modelled on a shim element either, so the drive sets it the way a real DOM answers it. */
interface ShellGestureDrive {
  /** the gutter element the drive dispatches through */
  gutter: ShimElement
  host: SidebarPanes
  /** the fork's own establishment path: one entry per `host.startGutter(zone, element)` */
  starts: Array<{ zone: unknown; element: unknown }>
  /** the fork's own mid-gesture teardown count (`host.cancelGutter()`) */
  cancels: () => number
  /** every layout that reached the ONE write path (`bridge.operatorSettings.set({ layout })`) */
  layoutWrites: LayoutState[]
  /** dispatch a pointer turn ON the gutter element (the target phase, then the document) */
  fire: (type: string, props?: Record<string, unknown>) => void
  /** dispatch a pointer turn OFF the element (on the document body) — the "the pointer has
   *  left the element's box" state, which only a REAL capture retargets */
  fireOff: (type: string, props?: Record<string, unknown>) => void
  restore: () => void
}

function shellGestureDrive(opts?: { zone?: LayoutZoneName; axis?: string }): ShellGestureDrive {
  const zone: LayoutZoneName = opts?.zone ?? 'left'
  const previousDocument = (globalThis as Record<string, unknown>)['document']
  installShim()
  const doc = (globalThis as Record<string, unknown>)['document'] as {
    body: ShimElement
  }
  const layoutEl = new ShimElement('main')
  layoutEl.className = 'layout'
  layoutEl.setRect({ left: 0, top: 0, right: 1200, bottom: 800 })
  doc.body.appendChild(layoutEl)
  const gutter = new ShimElement('div')
  gutter.className = 'gutter'
  gutter.setAttribute('data-zone', zone)
  gutter.setAttribute('data-axis', opts?.axis ?? gutterAxis(zone))
  // The shim element does not model `isConnected`; a REAL DOM element answers `true`, and
  // the fork's source seam reads it (`domEventSource().isConnected`). Set the way the live
  // DOM answers it, so the drive grades the WIRING rather than the shim's gap.
  ;(gutter as unknown as { isConnected: boolean }).isConnected = true
  layoutEl.appendChild(gutter)

  const registry = createPaneRegistry()
  registerZoneProbe(registry, 'zone-repl-shell-drive', 'left')
  registry.enable('zone-repl-shell-drive')

  const layoutWrites: LayoutState[] = []
  const host = new SidebarPanes({
    mount: new ShimElement('div'),
    operatorMount: new ShimElement('div'),
    registry,
    bridge: {
      operatorSettings: {
        set: async (patch: { layout: LayoutState }): Promise<unknown> => {
          layoutWrites.push(patch.layout)
          return patch
        },
      },
    },
    backRefs: new Map<string, string[]>(),
    editController: {},
  } as never)

  const starts: ShellGestureDrive['starts'] = []
  let cancels = 0
  const realStart = host.startGutter.bind(host)
  ;(host as unknown as Record<string, unknown>)['startGutter'] = (z: LayoutZoneName, element?: unknown): void => {
    starts.push({ zone: z, element })
    realStart(z, element)
  }
  const realCancel = host.cancelGutter.bind(host)
  ;(host as unknown as Record<string, unknown>)['cancelGutter'] = (): void => {
    cancels += 1
    realCancel()
  }
  installShellPointers(host)
  return {
    gutter,
    host,
    starts,
    cancels: () => cancels,
    layoutWrites,
    fire: (type: string, props?: Record<string, unknown>) => {
      gutter.dispatchPointer(type, props)
    },
    fireOff: (type: string, props?: Record<string, unknown>) => {
      doc.body.dispatchPointer(type, props)
    },
    restore: () => {
      ;(globalThis as Record<string, unknown>)['document'] = previousDocument
    },
  }
}

/** THE GRID WRITE-SITE DRIVE (`F5`/`F6`) — the fork's OWN projection/write site
 *  (`SidebarPanes.setLayout` → its private `applyZoneTracks`) driven against a recording
 *  grid sink, so `getComputedStyle`-class questions are answered by what was WRITTEN.
 *
 *  THE SINK IS A DOM DOUBLE, and it is named as one: `applyZoneTracks` resolves the grid
 *  through `document.querySelector('#app > #wiki-root')`, a selector the fork's own shim
 *  deliberately does not parse (its CSS subset rejects `#`), so the drive installs a
 *  document whose `querySelector` answers that one call with the recording element. No
 *  module is mocked (`G-4`): only `globalThis.document` is replaced for the drive's
 *  duration and restored after it. */
interface GridSinkDrive {
  host: SidebarPanes
  registry: ReturnType<typeof createPaneRegistry>
  /** the zone the probe pane lands in (enabled only when the arm enables it) */
  probeId: string
  writes: Array<{ name: string; value: string }>
  removals: string[]
  /** the live value the sink holds per property (the `getComputedStyle`-class reading) */
  values: () => Record<string, string>
  restore: () => void
}

function gridSinkDrive(opts?: { withRemoveProperty?: boolean; enableProbe?: boolean }): GridSinkDrive {
  const withRemoveProperty = opts?.withRemoveProperty !== false
  const previousDocument = (globalThis as Record<string, unknown>)['document']
  const writes: Array<{ name: string; value: string }> = []
  const removals: string[] = []
  const live: Record<string, string> = {}
  const style: Record<string, unknown> = {
    setProperty: (name: string, value: string): void => {
      writes.push({ name, value })
      live[name] = value
    },
  }
  if (withRemoveProperty) {
    style['removeProperty'] = (name: string): void => {
      removals.push(name)
      delete live[name]
    }
  }
  const grid = { style }
  ;(globalThis as Record<string, unknown>)['document'] = {
    querySelector: (sel: unknown): unknown => (sel === '#app > #wiki-root' ? grid : null),
  }

  const registry = createPaneRegistry()
  const probeId = 'zone-repl-grid-sink-probe'
  registerZoneProbe(registry, probeId, 'left')
  // The probe's ENABLED state is part of the STIMULUS (it is the census the record is
  // derived from): the stale-`0px` arm starts with the zone EMPTY and repopulates it.
  if (opts?.enableProbe !== false) registry.enable(probeId)

  const host = new SidebarPanes({
    mount: new ShimElement('div'),
    operatorMount: new ShimElement('div'),
    registry,
    bridge: { operatorSettings: { set: async (patch: unknown): Promise<unknown> => patch } },
    backRefs: new Map<string, string[]>(),
    editController: {},
  } as never)
  return {
    host,
    registry,
    probeId,
    writes,
    removals,
    values: () => ({ ...live }),
    restore: () => {
      ;(globalThis as Record<string, unknown>)['document'] = previousDocument
    },
  }
}

/** The fork's OWN record for a drive's state — driven through `zoneTrackVars` (the fork's
 *  write-site function), never through the vendored module, so a limb's expectation is
 *  the fork's answer and not a second copy of the arithmetic. */
function forkRecord(
  registry: ReturnType<typeof createPaneRegistry>,
  revealedZones: readonly LayoutZoneName[],
  layout: LayoutState = defaultLayout(),
): Record<string, string> {
  return zoneTrackVars(registry, layout, { revealedZones })
}

/** The zones the fork's OWN record says are NON-EMPTY — read off the record itself, so the
 *  drive's expectations are derived from the fork's answer (a non-empty zone's track is the
 *  caller's `String(size)+unit`; an empty one is the caller's `emptyToken` or the revealed
 *  carve-out's `''`). PURE. */
function nonEmptyZonesOf(record: Record<string, string>): LayoutZoneName[] {
  return LAYOUT_PANE_ZONES.filter((zone) => {
    const value = record[`--zone-${zone}-track`]
    return value !== undefined && value !== '0px' && value !== ''
  })
}

// ===========================================================================
// §3's SWAP TABLE — the six adoption rows, in the table's own order, with (a) the vendored
// member(s) the row adopts, (b) the local duplicate the row REMOVES or REDUCES and its
// symbol(s), and (c) THE CONTRACT'S SUBJECT — the fork-side seam vocabulary the REDUCED
// DUPLICATE is HELD BY, which is what decides arm 2.
//
// ⟨RE-POINTED IN PLACE `2026-10-04` — `RCA-8(c)`: the as-filed construction is KEPT VISIBLE
//   below and is NEVER deleted; it was WRONG, and the contract decides why.⟩
//
// AS FILED (verbatim, the filing pass's own reading — a HARD-CODED per-row list of the files
// the row's wiring "names", and the arm required an importer among them):
//   row 1 (census + zones)        : adopters ['src/renderer/layout-state.ts', 'src/renderer/sidebar-panes.ts']
//   row 2 (layout-projection)     : adopters ['src/renderer/layout-state.ts', 'src/renderer/sidebar-panes.ts']
//   row 3 (gutter)                : adopters ['src/renderer/sidebar-panes.ts', 'src/renderer/pane-gutter.ts']
//   row 4 (gesture-session)       : adopters ['src/renderer/renderer.ts', 'src/renderer/sidebar-panes.ts']
//   row 5 (gutter-affordance)     : adopters ['src/renderer/renderer.ts', 'src/renderer/pane-graph.ts', 'src/renderer/sidebar-panes.ts']
//   row 6 (relocate)              : adopters ['src/renderer/pane-drag.ts', 'src/renderer/sidebar-panes.ts']
//
// WHY IT WAS WRONG, at the row where it bites — ROW 2, and the two arms that could not both
// hold: arm 2 demanded that `src/shared/layout-projection.ts` be imported by
// `src/renderer/layout-state.ts` OR `src/renderer/sidebar-panes.ts` (the hard-coded list),
// while arm 8 — the SAME row's duplicate-absence witness — requires `layoutCssVars` and
// `applyLayoutToRoot` to be ABSENT from `layout-state.ts` (§3 row 2's local-duplicate column,
// `seamSuppliers: []` for that row). The import was therefore demanded FROM a file the row's
// own witness forbids the reduced seam to live in. THE CONTRACT DECIDES (§3 row 2 read
// through §3.1's discipline): the subject is **the file that HOLDS THE REDUCED DUPLICATE
// (the caller's spec map) and IMPORTS the module** — never a hard-coded name. The landing
// moved that reduced seam to the seam module `src/renderer/layout-vars.ts` (which holds the
// named seam suppliers `layoutCssVars`/`applyLayoutToRoot` and imports
// `../shared/layout-projection.js`) precisely BECAUSE arm 8 forbids those symbols in
// `layout-state.ts`.
//
// THE RE-POINTED EXPECTATION: arm 2 DERIVES the row's seam holder — the importing file whose
// OWN CODE carries the row's `reducedSeamEvidence` vocabulary (§3's local-duplicate column) —
// instead of consulting a fixed list, and the `DECLARED_CONSUMER_EDGES` row must name the
// SAME file (§5 `G-2`: ONE ROW PER ADOPTION EDGE).
// THE TEETH ARE KEPT AND SHARPENED, NEVER RELAXED: a vendored module imported by NO file
// under `src` still reds, and a module imported ONLY by a file that does NOT hold the row's
// reduced seam NOW REDS TOO — a case the as-filed list could not see at all, because it
// accepted ANY named file whether or not that file held the seam. Both teeth are DRIVEN on
// synthetic hits inside the arm (`adoptionTeeth`), so the re-point cannot have widened arm 2
// into a tautology.
//
// WHERE THE SEAM HOLDER LANDS, PER ROW, AT THIS HEAD (the landing's file map, DERIVED by the
// evidence below and never asserted as a name): row 1 → `src/renderer/layout-state.ts` ·
// row 2 → `src/renderer/layout-vars.ts` · row 3 → `src/renderer/pane-gutter.ts` · row 4 →
// `src/renderer/renderer.ts` · row 5 → `src/renderer/renderer.ts` · row 6 →
// `src/renderer/pane-drag.ts`. ROWS 3 AND 4 LEGITIMATELY IMPORT FROM TWO/THREE FILES EACH
// (`gutter`: `pane-gutter.ts` + `sidebar-panes.ts`; `gesture-session`: `renderer.ts` +
// `sidebar-panes.ts` + `pane-gutter.ts`): the contract's subject is checked per row against
// the EVIDENCE, never against a fixed count — and every one of those edges still has to be a
// declared, static, non-evasive edge (row 1's arm here and row 2's `unlisted … edges` arm).
// ===========================================================================
interface AdoptionRow {
  /** the swap-table row's own label */
  label: string
  /** the vendored members this row adopts (the imported identifiers) */
  members: string[]
  /** THE CONTRACT'S SUBJECT (§3's local-duplicate column, read through §3.1's discipline):
   *  ANY ONE of these evidence GROUPS, each a set of names the importing file's OWN CODE must
   *  carry ENTIRELY. The file that imports the vendored member and holds one such group IS the
   *  row's seam holder — DERIVED, never named. A row with ONE group has one subject; row 5
   *  carries TWO because §3 row 5's replacement seam legitimately has two holders (`§3.1(a)`'s
   *  authoring site and `§3.2`'s consumer endpoint), so whichever of them imports the module is
   *  accepted rather than one being fixed and the other false-red. */
  reducedSeamEvidence: string[][]
  /** the local duplicate's OWNER file (the duplicate-absence witness' subject) */
  duplicateFile: string
  /** the duplicate symbols that must be GENUINELY ABSENT (or reduced to the named seam) */
  duplicateSymbols: string[]
  /** the seam supplier(s) §3 says may legitimately REMAIN in the renderer */
  seamSuppliers: string[]
  /** ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`, §3.5/§3.6.1/§3.6.2/§4.0(1)⟩ THE
   *  COMPOSITION THIS ROW'S `§3` HALF DECLINES FOR THIS UNIT, or `null` where the row declines
   *  nothing. The declined member is the row's FACTORY (never the row's module, whose other
   *  members LANDED): `relocate.ts`'s `createRelocateSession` together with its seven optional
   *  seams, and `gutter-affordance.ts`'s `createGutterAffordance` together with its remaining
   *  seams. §4.0's consequence clause makes it FALSE-IFIABLE — "the two factories are imported
   *  by NOTHING under this unit's name" — so the limb that drives it rides row 1's adoption arm
   *  for this row (`declinedFactoryOffences`). It is DATA here rather than prose alone, so the
   *  decline is recorded at the row it belongs to AND witnessed. */
  declinedFactory: { module: string; factory: string; seams: string[] } | null
}

const ADOPTIONS: AdoptionRow[] = [
  {
    label: 'row 1 (census + zones)',
    members: ['census', 'zones'],
    // §3 row 1's caller position `specOf`: the per-zone `TrackSpec` record naming `trackProp`
    // `--zone-<z>-track`, `unit` `px`, `emptyToken` `0px`. The duplicate is removed as
    // COMPUTATION and the CALLER DATA stays — so the file that imports `census`/`zones` and
    // carries this vocabulary is the row's seam holder.
    reducedSeamEvidence: [['trackProp', 'emptyToken']],
    duplicateFile: 'src/renderer/layout-state.ts',
    duplicateSymbols: ['zoneTrackCssVars', 'isZoneEmpty'],
    seamSuppliers: ['layoutCssVars', 'applyLayoutToRoot'],
    declinedFactory: null,
  },
  {
    label: 'row 2 (layout-projection)',
    members: ['layout-projection'],
    // §3 row 2's local-duplicate column: `layoutCssVars` and `applyLayoutToRoot` "REDUCED to the
    // caller's spec map + the injected sink" — i.e. the two names §3 row 2 keeps as SEAM
    // SUPPLIERS, held by the file that imports the vendored projection. The landing holds them
    // in `src/renderer/layout-vars.ts` (`arm 8` forbids them in `layout-state.ts`).
    reducedSeamEvidence: [['layoutCssVars', 'applyLayoutToRoot']],
    duplicateFile: 'src/renderer/layout-state.ts',
    duplicateSymbols: ['layoutCssVars', 'applyLayoutToRoot'],
    seamSuppliers: [],
    declinedFactory: null,
  },
  {
    label: 'row 3 (gutter)',
    members: ['gutter'],
    // §3 row 3's seam supplies `axisFor` / `boundsFor` / `sizeFor` ← the fork's own
    // `gutterAxis` / `gutterBounds` / `gutterSizeForPoint`, held beside the ONE clamp.
    reducedSeamEvidence: [['gutterAxis', 'gutterBounds', 'gutterSizeForPoint']],
    duplicateFile: 'src/renderer/pane-gutter.ts',
    duplicateSymbols: ['createGutterController'],
    seamSuppliers: ['gutterAxis', 'gutterBounds', 'gutterSizeForPoint', 'clampGutterSize', 'isGutterResizable'],
    declinedFactory: null,
  },
  {
    label: 'row 4 (gesture-session)',
    members: ['gesture-session'],
    // §3 row 4's "policy that stays": the fork's OWN delegated resolution of a target (its
    // `closest` call — the module's bytes carry no selector) and the element it resolves
    // against, `GESTURE_SELECTOR`. The hand-rolled session is removed from the file that holds
    // that policy, so that file is the row's seam holder.
    reducedSeamEvidence: [['GESTURE_SELECTOR', 'closest']],
    duplicateFile: 'src/renderer/renderer.ts',
    duplicateSymbols: ['beginGesture', 'onGestureMove', 'onGestureUp', 'onGestureCancel'],
    seamSuppliers: [],
    declinedFactory: null,
  },
  {
    label: 'row 5 (gutter-affordance)',
    members: ['gutter-affordance'],
    // §3 row 5's local duplicate is host MARKUP in `src/renderer/index.html` (it holds no TS
    // symbol at all), and §3.2 names its two dependents: this row's adopting importer holds
    // dependent #1 — `GESTURE_SELECTOR`, the delegated consumer of the `gutter`/`data-zone`
    // vocabulary the authored affordance MUST carry (§3.2). The AUTHORING site is asserted by
    // this suite's row 5 (the assembly drive), not here.
    //
    // ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: §3 ROW 5'S ADOPTED SET IS
    //   RE-DECLARED HERE, WITH THE FILED SET KEPT VISIBLE BESIDE IT (`§3.5`/`§3.6.2`/`§6.0`).⟩
    // `SUPERSEDED` — THE FILED SET (§3 row 5 as filed, kept as that reading): `gutter-affordance.ts`
    //   → `createGutterAffordance`, `cursorDeclarationFor`, `domEventSource`, the sixteen types,
    //   and **the eleven seams (9 REQUIRED + 2 OPTIONAL)** — `sizeFromPointer`, `axisOf`,
    //   `cursorOf`, `applyPreview`, `applyCursor`, `startSizeOf`, `boundsOf`, `resizableOf`,
    //   `commit`, and the optional `pointerOf`/`moveTypeOf`.
    // RE-DECLARED — THE LANDED SET (§3.6.2, one item per limb, each `VERIFIED-BY-READ` there):
    //   (1) the element-backed source `domEventSource()`; (2) `cursorDeclarationFor` (the
    //   module's total resolution of the caller's declaration value); (3) the fork's cursor write
    //   through the `applyCursor` SHAPE; (4) the four envelope-authored affordances at §3.1's
    //   authoring site `src/renderer/pane-graph.ts`, carrying §3.2's vocabulary — with the module
    //   edge living at `src/renderer/renderer.ts` (greens `A-05`), i.e. TWO jobs, both owed.
    // DECLINED FOR THIS UNIT — RECORDED: `createGutterAffordance` and its remaining seams
    //   (§4.0 blockers 1 and 2). It is the row's `declinedFactory` DATA below, so the decline is
    //   WITNESSED (`declinedFactoryOffences`) and not merely written down.
    // WHAT THIS ROW'S ADOPTION ARM STILL WITNESSES: the MODULE is imported by a file that holds
    //   the row's reduced seam — `GESTURE_SELECTOR` (dependent #1) or `data-zone`+`data-axis`
    //   (dependent #2's vocabulary) — and the `DECLARED_CONSUMER_EDGES` row names that SAME file.
    //   THE MODULE, NEVER THE FACTORY: §3.6.2's words, "what stays unimported is the two
    //   FACTORIES, not the two modules".
    reducedSeamEvidence: [['GESTURE_SELECTOR'], ['data-zone', 'data-axis']],
    duplicateFile: 'src/renderer/index.html',
    duplicateSymbols: ['the inline gutter markup'],
    seamSuppliers: [],
    declinedFactory: {
      module: 'gutter-affordance',
      factory: 'createGutterAffordance',
      seams: [
        'sizeFromPointer',
        'axisOf',
        'cursorOf',
        'applyPreview',
        'applyCursor-as-a-composed-seam',
        'startSizeOf',
        'boundsOf',
        'resizableOf',
        'commit',
        'pointerOf',
        'moveTypeOf',
      ],
    },
  },
  {
    label: 'row 6 (relocate)',
    members: ['relocate'],
    // §3 row 6's "policy that stays": scope legality and order derivation — the fork's own
    // `legalZonesForScope` / `insertionIndexForPoint`, held by the file that adopts the
    // comparator.
    //
    // ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: §3 ROW 6'S ADOPTED SET IS
    //   RE-DECLARED HERE, WITH THE FILED SET KEPT VISIBLE BESIDE IT (`§3.5`/`§3.6.1`/`§6.0`).⟩
    // `SUPERSEDED` — THE FILED SET (§3 row 6 as filed, kept as that reading): `relocate.ts` →
    //   `withinProximity`, `createRelocateSession`, the nine types, and **the session's seven
    //   optional seams** — `threshold`, `candidatesFor`, `resolveTarget`, `onReveal`, `commit`,
    //   `onPreview`, and `preDragValueOf` (a handle member, not a factory option).
    // RE-DECLARED — THE LANDED SET (§3.6.1, each `VERIFIED-BY-READ` there): (1) the COMPARATOR
    //   `withinProximity`, reached through the fork's own private `measuresWithinSnapThreshold`
    //   (the fork MEASURES, the module COMPARES — the landed static edge is greens `A-06`);
    //   (2) the `distance` seam — the fork's own measured scalar `distanceToZoneBox(point, zone):
    //   number | null`, `0` inside the box, the not-a-number member for unusable input (§4 item
    //   (v)); (3) THE FOUR NAMED SEAM SUPPLIERS — `legalZonesForScope` (scope legality),
    //   `insertionIndexForPoint` (order derivation), `createDragController` (the drag-time reveal
    //   state and the commit) and `setZoneMinimized` (the zone-minimize interplay).
    // DECLINED FOR THIS UNIT — RECORDED: `createRelocateSession` AND ITS SEVEN SEAMS, the row's
    //   `declinedFactory` DATA below. **THE CONSEQUENCE, RECORDED PER §3.6.1 AND §4.0(1):
    //   `createRelocateSession` IS IMPORTED BY NOTHING** — the comparator adoption is the row's
    //   whole landed subject, and the session half "returns to the row that must rewrite the
    //   pane-drag establishment" (`PD-UI-4a`), deferred rather than denied in principle. THE
    //   MODULE STAYS ADOPTED: `relocate` keeps its `DECLARED_CONSUMER_EDGES` row and its
    //   byte-identity pin (register row 6).
    reducedSeamEvidence: [['legalZonesForScope', 'insertionIndexForPoint']],
    duplicateFile: 'src/renderer/pane-drag.ts',
    duplicateSymbols: ['withinSnapThreshold'],
    seamSuppliers: ['createDragController', 'legalZonesForScope', 'insertionIndexForPoint', 'setZoneMinimized'],
    declinedFactory: {
      module: 'relocate',
      factory: 'createRelocateSession',
      seams: ['threshold', 'candidatesFor', 'resolveTarget', 'onReveal', 'commit', 'onPreview', 'preDragValueOf'],
    },
  },
]

// ---------------------------------------------------------------------------
// THE CONTRACT'S SUBJECT, DERIVED — §3's local-duplicate column read through §3.1's
// discipline: THE FILE THAT HOLDS THE REDUCED DUPLICATE (THE CALLER'S SEAM) AND IMPORTS THE
// MODULE. The holder is DERIVED from the row's own seam vocabulary, never named — so a
// re-point of the seam module by a later landing is FOLLOWED rather than failed, and a file
// that merely happens to import the module is NOT the subject.
// ---------------------------------------------------------------------------

/** Does THIS FILE hold the row's reduced seam? TRUE where the file's OWN CODE (comments
 *  stripped, so a prose mention never satisfies the vocabulary) carries EVERY name of ANY ONE of
 *  the row's evidence GROUPS. PURE. */
function holdsReducedSeam(row: AdoptionRow, file: string): boolean {
  const code = codeOf(join(REPO_ROOT, file))
  return row.reducedSeamEvidence.some((group) => group.every((token) => mentionsSymbol(code, token)))
}

/** The row's evidence, printed for a counterexample — one group per `|`, its names per `+`. */
function reducedSeamEvidenceText(row: AdoptionRow): string {
  return row.reducedSeamEvidence.map((group) => group.join(' + ')).join(' | ')
}

/** The importing files that hold the row's reduced seam (`holdsReducedSeam`) — the row's
 *  DERIVED seam holders, in the tree's own file order. */function reducedSeamHolders(row: AdoptionRow, member: string): DerivedEdge[] {
  return importersOf(member).filter((h) => holdsReducedSeam(row, h.file))
}

/** ONE ROW's adoption-edge oracle, over a given reading of the member's importing edges —
 *  PURE, so the arm can drive it on synthetic hits as well as on the tree's real ones.
 *  The offenders, in §5 `G-2`'s own order:
 *   (1) NO FILE imports the vendored member at all — it is not adopted;
 *   (2) the importers exist but NONE of them holds §3's reduced seam for this row (the
 *       contract's subject, and the case the as-filed hard-coded list could not see);
 *   (3) the holder's edge is an EVASION shape, not the static `from '…'` form;
 *   (4) the holder's edge has NO `DECLARED_CONSUMER_EDGES` row naming the SAME file. */
function adoptionEdgeOffences(
  row: AdoptionRow,
  member: string,
  hits: DerivedEdge[],
  declared: DeclaredEdge[],
): string[] {
  const offenders: string[] = []
  if (hits.length === 0) {
    offenders.push(`NO FILE under src imports src/shared/${member}.ts`)
    return offenders
  }
  const holders = hits.filter((h) => holdsReducedSeam(row, h.file))
  if (holders.length === 0) {
    offenders.push(
      `src/shared/${member}.ts is imported by ${hits.map((h) => h.file).join(', ')}, but NONE of them HOLDS the reduced seam §3 ${row.label} names ` +
        `(evidence read on the importing file's own code: ${reducedSeamEvidenceText(row)}) — the contract's subject is the file that HOLDS the reduced duplicate and imports the module, never any file that happens to import it`,
    )
    return offenders
  }
  for (const holder of holders) {
    if (holder.kind !== 'static-from') {
      offenders.push(`the edge into ${member} from ${holder.file} is the refused ${holder.kind} shape, not a static from-edge (§5 G-2)`)
    }
    const onList = declared.some((d) => d.file === holder.file && d.specifier === holder.spec && d.member === member)
    if (!onList) {
      offenders.push(
        `the edge ${holder.file} -> ${holder.spec} (member ${member}) has NO DECLARED_CONSUMER_EDGES row naming that SAME file (§5 G-2: ONE ROW PER ADOPTION EDGE)`,
      )
    }
  }
  return offenders
}

/** ARM 2's TEETH, DRIVEN RATHER THAN ASSERTED. The re-point of the expectation must not have
 *  widened the arm into a tautology, so the SAME oracle is driven on two synthetic readings
 *  (§5 `G-2` / §3's subject), and an oracle that accepts either one is itself the offence:
 *   (A) a vendored module imported by NO file — the as-filed tooth, kept;
 *   (B) a vendored module imported ONLY by a file that does NOT hold the row's reduced seam —
 *       the tooth the contract's subject ADDS, and the one that reds the `layout-state.ts`
 *       reading the as-filed list demanded for row 2. */
function adoptionTeeth(row: AdoptionRow, declared: DeclaredEdge[]): string[] {
  const offenders: string[] = []
  const member = row.members[0]!
  if (adoptionEdgeOffences(row, member, [], declared).length === 0) {
    offenders.push(
      `the arm's oracle no longer reds a vendored module imported by NO file under src (tooth A is vacuous for §3 ${row.label})`,
    )
  }
  const foreign = SRC_FILES.find((f) => !isVendoredMemberFile(f) && !holdsReducedSeam(row, f))
  if (foreign === undefined) {
    offenders.push(
      `the driven tooth has no subject for §3 ${row.label}: every file under src holds one of the row's reduced-seam evidence groups, so a file that does NOT hold the seam cannot be synthesised`,
    )
    return offenders
  }
  const foreignHit: DerivedEdge = {
    file: foreign,
    spec: `../shared/${member}.js`,
    kind: 'static-from',
    resolved: join(REPO_ROOT, 'src', 'shared', `${member}.ts`),
    member,
  }
  if (adoptionEdgeOffences(row, member, [foreignHit], declared).length === 0) {
    offenders.push(
      `the arm's oracle ACCEPTS a vendored module imported only by ${foreign}, which does NOT hold §3 ${row.label}'s reduced seam (tooth B is vacuous: the subject has drifted back to "any importing file")`,
    )
  }
  return offenders
}

/** ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: `§4.0(1)`'S FALSE-IFIABLE CLAUSE,
 *  DRIVEN.⟩ §4.0's consequence block states, as one of "TWO CLAUSES, EACH FALSE-IFIABLE":
 *  *"**THE SESSIONS STAY `IMPORTED BY NOTHING`.** `relocate.ts`'s session factory and
 *  `gutter-affordance.ts`'s affordance factory are imported by NOTHING under this unit's name —
 *  the two modules' OTHER members landed (§3.6.1/§3.6.2), so what stays unimported is **the two
 *  factories**, not the two modules."* This is that clause's witness, and it is the tooth that
 *  makes the re-declaration LOAD-BEARING rather than prose: a landing that COMPOSES a declined
 *  factory under this unit's name reds here, which is exactly the shape §4.0 refuses (blocker 1:
 *  the vendored `ledgerKnows`/`installOperation` guard refuses a SECOND install of one element,
 *  so the composition would displace the register's own row-4 arms' subject; blocker 2: the
 *  affordance's own declaration that the capture opt-in cannot travel through the composed
 *  controller's `attach`, plus the private host write seam and the missing `applyPreview`
 *  definition).
 *
 *  THE CENSUS IS A SYMBOL CENSUS OVER THE CONSUMER FILES, and its exclusions are stated so the
 *  arm cannot be satisfied by a definition: every file under `src/**` EXCEPT the fifteen
 *  byte-pinned vendored modules (`isVendoredMemberFile` — a module's own `export function` line
 *  is the DECLARATION of the factory, never a composition of it), read with comments stripped
 *  (`codeOf`), so a prose mention can never satisfy it either. PURE. */
function declinedFactoryMentions(
  decline: NonNullable<AdoptionRow['declinedFactory']>,
  readings: Array<{ file: string; code: string }>,
): string[] {
  return readings.filter((r) => mentionsSymbol(r.code, decline.factory)).map((r) => r.file)
}

/** The decline's WITNESS, WITH ITS OWN DRIVEN VACUITY GUARD (the `adoptionTeeth` pattern, so a
 *  re-declaration cannot be recorded through a limb that has quietly stopped biting): the same
 *  oracle is driven on a SYNTHETIC consumer reading that DOES mention the factory, and an oracle
 *  that accepts it is itself the offence. */
function declinedFactoryOffences(row: AdoptionRow): string[] {
  const decline = row.declinedFactory
  if (decline === null) return []
  const offenders: string[] = []
  const readings = SRC_FILES.filter((f) => !isVendoredMemberFile(f)).map((f) => ({
    file: f,
    code: codeOf(join(REPO_ROOT, f)),
  }))
  const named = declinedFactoryMentions(decline, readings)
  if (named.length > 0) {
    offenders.push(
      `the DECLINED composition ${decline.factory} (src/shared/${decline.module}.ts, together with its seams [${decline.seams.join(', ')}]) is named by ${named.join(', ')} — ` +
        `§4.0(1) makes it imported by NOTHING under ${CONFIRMED_UNIT_ID}'s name (§3.5/§3.6.1/§3.6.2 record the decline: §4.0 blocker 1 is the install collision, blocker 2 the affordance's own capture declaration), ` +
        `and §3.6's words are that what stays unimported is the two FACTORIES, not the two modules. A composition authored here is the refused shape; the deferred composition belongs to the later unit §4.0 names, whose DONE row must amend §4.0(1)`,
    )
  }
  const probe = declinedFactoryMentions(decline, [
    { file: 'src/renderer/decline-probe.ts', code: `const probe = ${decline.factory}()\n` },
  ])
  if (probe.length === 0) {
    offenders.push(
      `the decline witness is VACUOUS for ${decline.factory}: its oracle accepts a synthetic consumer file that mentions the factory, so the limb can never red a composed decline`,
    )
  }
  return offenders
}

/** The six adopted consumer edges §5 `G-2` requires — one row per ADOPTING FILE's edge, with
 *  the vendored member it targets and the CONFIRMED unit id (`O-1`: `PD-UI-14` is CONFIRMED
 *  for this unit; the contract's PROPOSED form is superseded). **The FILE is the DERIVED seam
 *  holder (§3's subject), never the as-filed `adopters[0]`** — where no holder can be derived at this head
 *  the entry names the ABSENCE, so the arm reds with that reading instead of with a stale
 *  file name. */
const REQUIRED_EDGES = ADOPTIONS.map((a) => {
  const holder = reducedSeamHolders(a, a.members[0]!)[0]
  return {
    file: holder === undefined ? `<NO SEAM HOLDER under src for §3 ${a.label}>` : holder.file,
    member: a.members[0]!,
  }
})

const CONFIRMED_UNIT_ID = 'PD-UI-14'

/** The three EVASION SHAPES the AST reader must find zero of, and the fourth refused shape:
 *  a construct spelled inside a STRING, which an AST reader (and the pin's derivation)
 *  never counts as an edge. */
const EVASION_KINDS: Array<DerivedEdge['kind']> = ['dynamic-import', 'require', 'new-URL']
const STRING_FORM_PROBE = `const decoy = "import { computeTrackVars } from '../shared/census.js'"\n`

// ---------------------------------------------------------------------------
// The fork's caller data, read from the ONE authority (`D-2`: `layout-state.ts` keeps its
// model — this suite never re-derives the zone vocabulary).
// ---------------------------------------------------------------------------
const DEFAULT_LAYOUT: LayoutState = defaultLayout()

/** The caller's census SOURCE (`D-4`: the count stays the fork's fact, handed in as data).
 *  The four-member enumeration is `LAYOUT_PANE_ZONES` — never a literal list here. */
function censusRecord(counts: Partial<Record<LayoutZoneName, number>>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const zone of LAYOUT_PANE_ZONES) out[zone] = counts[zone] ?? 1
  return out
}

/** The caller's `sizes` position: §3 row 1 names the per-zone size LOOKUP (today the coerced
 *  `LayoutState.zones[zone].size`). */
function sizesLookup(layout: LayoutState): (id: unknown) => unknown {
  return (id: unknown) =>
    typeof id === 'string' && (LAYOUT_PANE_ZONES as readonly string[]).includes(id)
      ? (layout.zones as unknown as Record<string, { size: number }>)[id]!.size
      : undefined
}

/** The caller's `specOf` record: §3 row 1's own TrackSpec per zone — `trackProp`
 *  `--zone-<z>-track`, `unit` `px`, `emptyToken` `0px`. */
function specOfMap(): Record<string, { trackProp: string; unit: string; emptyToken: string }> {
  const out: Record<string, { trackProp: string; unit: string; emptyToken: string }> = {}
  for (const zone of LAYOUT_PANE_ZONES) out[zone] = { trackProp: `--zone-${zone}-track`, unit: 'px', emptyToken: '0px' }
  return out
}

/** THE MANDATORY CLOSURE ADAPTER (§4 item (ii)): the module takes a CALLABLE; the fork
 *  holds an ARRAY. The adapter is a closure over the array, created at the write site —
 *  never the array itself, never a module-level mutable.
 *
 *  THE POLARITY, STATED BECAUSE THE ARMS DEPEND ON IT (§3 row 1's `revealed` position, §4 item
 *  (ii)): `computeTrackVars` asks this predicate whether to DISPLAY a member. A TRUTHY answer
 *  produces the member's token (`trackFor(spec, size, isEmpty(census, member))` — so
 *  `String(size)+unit`, or the caller's `emptyToken` where the census says empty); a FALSY
 *  answer is the DECLINED member, whose key is KEPT carrying exactly `''`.
 *
 *  ⟨`PD-UI-14` REMAND `2026-10-04` — `RCA-8(c)`: the CLOSED-OVER SET is what the as-filed arms
 *  got wrong, and the corrected reading is named here rather than left to each arm. Every arm
 *  that asserts a SIZED or `emptyToken` value must be driven by a closure that answers TRUE for
 *  the members it means to display — `revealedAll()` below, whose set IS
 *  `LAYOUT_PANE_ZONES` — because the as-filed arms' `revealedClosure([])` returns `false` for
 *  EVERY member
 *  (verified by driving it), so the module correctly returned `''` for all four zones and the
 *  sized/`emptyToken` expectations could never hold. THE DECLINED LIMB keeps its own closure
 *  (`declinedAll()`), whose whole subject is the `''` the module documents, and the falsifier
 *  keeps the fork's ARRAY form as the shape that yields the EMPTY record.⟩ */
function revealedClosure(zones: readonly string[]): (id: unknown) => boolean {
  return (id: unknown) => typeof id === 'string' && zones.includes(id)
}

/** THE DISPLAYED STATE for this row's generated limbs: the closure answers TRUE for every
 *  member of the caller's own enumeration, so every member carries its `trackFor` token. */
const revealedAll = (): ((id: unknown) => boolean) => revealedClosure(LAYOUT_PANE_ZONES)

/** THE DECLINED STATE: the closure answers FALSE for every member, so every key is kept
 *  carrying `''` (the module's documented declined-member semantics). */
const declinedAll = (): ((id: unknown) => boolean) => ((): boolean => false)

/** The predecessor's own reading, reused so a row's expectations are `zones.ts`'s answers
 *  rather than a second copy of the arithmetic. */
function forkExpectedTrack(zone: LayoutZoneName, census: unknown, layout: LayoutState): string {
  if (vendoredIsEmpty(census, zone)) return '0px'
  return vendoredTrackFor(
    { trackProp: `--zone-${zone}-track`, unit: 'px', emptyToken: '0px' },
    layout.zones[zone].size,
    false,
  )
}

// ===========================================================================
// §6 ROW 1 — `P-IM-zone-repl-1` · `strat:zone-replacement-adoption-wiring`
// THE ADOPTION WIRING: for every adoption row of §3 the module is imported by the named
// file, the import is a STATIC from-edge resolving to `src/shared/<module>.ts`, the local
// duplicate it replaces is GENUINELY ABSENT (or exists solely as the seam supplier the row
// names), and a `DECLARED_CONSUMER_EDGES` row exists for it.
// ⟨RE-POINTED IN PLACE `2026-10-04` — `RCA-8(c)`: the sentence above is KEPT as the filing's
// reading, and the phrase "the named file" is SUPERSEDED. THE CONTRACT'S SUBJECT (§3 row 2 read
// through §3.1, and the row's own duplicate-absence witness): the module must be imported by
// **the file that HOLDS the row's reduced seam/duplicate AND imports the module** — DERIVED from
// the row's own seam vocabulary (`reducedSeamEvidence`) — and the `DECLARED_CONSUMER_EDGES` row
// must name that SAME file. A hard-coded list was a SECOND authority over the same fact, and for
// row 2 it was an authority that its own witness contradicted.⟩
// ===========================================================================
describe('§6 P-IM-zone-repl-1 — the adoption wiring (strat:zone-replacement-adoption-wiring)', () => {
  const adoptionArms: Arm[] = ADOPTIONS.map((a) => ({
    // ⟨RE-POINTED IN PLACE `2026-10-04` — `RCA-8(c)`: the as-filed arm name was
    //   `adoption ${a.label} — ${a.members.join('+')} imported by the named file and declared`
    //   and is KEPT VISIBLE here; "the named file" is the HARD-CODED list that contradicted the
    //   row's own duplicate-absence witness (see the SUPERSEDED block above the ADOPTIONS
    //   table). The name now states the contract's subject (§3 read through §3.1).⟩
    name: `adoption ${a.label} — ${a.members.join('+')} imported by the file that HOLDS the row's reduced seam (§3's subject) and declared`,
    check: () => {
      const declared = declaredConsumerEdgesFromPin()
      const offenders: string[] = []
      for (const member of a.members) {
        offenders.push(...adoptionEdgeOffences(a, member, importersOf(member), declared))
      }
      // THE TEETH, DRIVEN ON SYNTHETIC HITS: the re-point must not have turned this arm into a
      // tautology, so the SAME oracle is driven both ways here (§5 `G-2`; the as-filed tooth A
      // — imported by NO file — and the subject's tooth B — imported only by a file that does
      // NOT hold the row's reduced seam).
      offenders.push(...adoptionTeeth(a, declared))
      // ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: `§4.0(1)`'S FALSE-IFIABLE CLAUSE,
      //   RIDING THIS ARM (`§6.0` clause 2: a limb rides an EXISTING named arm, so NO declared
      //   term is added and the arithmetic is UNMOVED). The arm is the §3 row's own adoption
      //   arm, which is where the row's DECLINE belongs; `declinedFactory` is `null` for the
      //   four rows that decline nothing, so the limb is inert there.⟩
      offenders.push(...declinedFactoryOffences(a))
      return offenders.length === 0 ? null : offenders.join('; ')
    },
  }))

  const witnessArms: Arm[] = ADOPTIONS.map((a) => ({
    name: `witness ${a.label} — the local duplicate is absent from ${a.duplicateFile}`,
    check: () => {
      if (a.duplicateFile.endsWith('index.html')) {
        const html = readText(INDEX_HTML_PATH)
        const inlineGutters = [...html.matchAll(/<div class="gutter" data-zone="[a-z]+" data-axis="(?:columns|rows)"><\/div>/g)].length
        if (inlineGutters > 0) {
          return `src/renderer/index.html still carries ${inlineGutters} host-authored div.gutter[data-zone][data-axis] element(s): §3 row 5 replaces them with a provident-authored affordance and §12 item 6 forbids moving a control node out of the graph`
        }
        return null
      }
      const code = codeOf(a.duplicateFile)
      const present = a.duplicateSymbols.filter((s) => mentionsSymbol(code, s))
      if (present.length === 0) return null
      const removed = present.filter((s) => !a.seamSuppliers.includes(s))
      if (removed.length === 0) return null
      return `the local duplicate §3 ${a.label} REMOVES is still present in ${a.duplicateFile}: ${removed.join(', ')}`
    },
  }))

  const arms: Arm[] = [
    ...adoptionArms,
    ...witnessArms,
    {
      name: 'closure adapter — the revealed predicate exists at the write site as a CALLABLE over the fork array',
      check: () => {
        const withCallable = codeOfAllSrc().filter(
          (c) => /revealed\s*:\s*\(/.test(c.code) || /revealedClosure|revealedPredicate/.test(c.code),
        )
        if (withCallable.length === 0) {
          return 'NO closure adapter exists anywhere under src (contract §4 item (ii) makes it a MANDATORY deliverable): no `revealed: (id) => ...` predicate and no named adapter, so the fork still holds only the array and `computeTrackVars` returns the EMPTY record for every zone'
        }
        return null
      },
    },
  ]

  it('P-IM-zone-repl-1 — the six adoption edges, the six duplicate-absence witnesses and the closure adapter (13)', () => {
    runRow('P-IM-zone-repl-1', arms)
  })
})

// ===========================================================================
// §6 ROW 2 — `P-IM-zone-repl-2` · `strat:zone-replacement-consumer-edges-declared`
// THE EDGE DECLARATION DISCIPLINE: every vendored-resolving import hit under `src` is on
// `DECLARED_CONSUMER_EDGES` with the adopting unit's id; the three pre-existing rows are
// unchanged; the three stem-collision hits are NOT rows; and none of the four evasion
// shapes is used for an adopted edge.
// ===========================================================================
describe('§6 P-IM-zone-repl-2 — the edge-declaration discipline (strat:zone-replacement-consumer-edges-declared)', () => {
  const PRE_EXISTING: DeclaredEdge[] = [
    { file: 'src/renderer/theme.ts', specifier: '../../shared/theme.js', member: 'theme', unit: 'PD-UI-1' },
    { file: 'src/renderer/theme.ts', specifier: '../shared/theme.js', member: 'theme', unit: 'PD-UI-1' },
    { file: 'src/renderer/modal-state.ts', specifier: '../shared/overlay.js', member: 'overlay', unit: 'PD-UI-6' },
  ]
  const STEM_COLLISIONS = [
    { file: 'src/renderer/renderer.ts', specifier: './theme.js', forkModule: 'src/renderer/theme.ts' },
    { file: 'src/renderer/renderer.ts', specifier: './pane-gutter.js', forkModule: 'src/renderer/pane-gutter.ts' },
    { file: 'src/renderer/sidebar-panes.ts', specifier: './pane-gutter.js', forkModule: 'src/renderer/pane-gutter.ts' },
  ]

  const arms: Arm[] = [
    ...REQUIRED_EDGES.map((e) => ({
      name: `declared edge — ${e.file} -> src/shared/${e.member}.ts, unit ${CONFIRMED_UNIT_ID}`,
      check: () => {
        const declared = declaredConsumerEdgesFromPin()
        const row = declared.find((d) => d.file === e.file && d.member === e.member)
        if (row === undefined) {
          const hits = importersOf(e.member)
          return `NO DECLARED_CONSUMER_EDGES row declares ${e.file} -> src/shared/${e.member}.ts (§5 G-2: ONE ROW PER ADOPTION EDGE); the §3 adoption is ${
            hits.length === 0 ? 'wired by NOTHING' : `wired by ${hits.map((h) => h.file).join(', ')}`
          }`
        }
        if (row.unit !== CONFIRMED_UNIT_ID) {
          return `the row for ${e.file} -> ${e.member} names unit ${row.unit}, not the CONFIRMED unit id ${CONFIRMED_UNIT_ID} (O-1)`
        }
        return null
      },
    })),
    ...EVASION_KINDS.map((kind) => ({
      name: `evasion refused — no ${kind} edge into a vendored member`,
      check: () => {
        const offenders = allVendoredResolvingEdges().filter((e) => e.kind === kind)
        if (offenders.length === 0) return null
        return `${offenders.length} vendored-resolving edge(s) use the refused ${kind} shape (§5 G-2 — caught, never hidden): ${offenders
          .slice(0, 3)
          .map((e) => `${e.file} -> ${e.spec}`)
          .join(', ')}`
      },
    })),
    {
      name: 'evasion refused — a construct spelled inside a STRING is not an edge',
      check: () => {
        const decoy = derivedEdges(STRING_FORM_PROBE, 'src/renderer/decoy.ts')
        if (decoy.length === 0) return null
        return `the AST reader counted ${decoy.length} hit(s) inside a string literal — the reader discrimination is broken`
      },
    },
    {
      name: 'pre-existing rows — the three rows are present and unchanged (G-2)',
      check: () => {
        const declared = declaredConsumerEdgesFromPin()
        const missing = PRE_EXISTING.filter(
          (p) => !declared.some((d) => d.file === p.file && d.specifier === p.specifier && d.member === p.member && d.unit === p.unit),
        )
        if (missing.length > 0) {
          return `the pre-existing allow-list row(s) ${missing
            .map((m) => `${m.file} ${m.specifier} (${m.unit})`)
            .join(', ')} are NOT present unchanged (§5 G-2 forbids touching them)`
        }
        const preExistingOnList = declared.filter((d) => d.unit === 'PD-UI-1' || d.unit === 'PD-UI-6')
        if (preExistingOnList.length !== PRE_EXISTING.length) {
          return `the allow-list carries ${preExistingOnList.length} row(s) from PD-UI-1/PD-UI-6, not the pinned three`
        }
        return null
      },
    },
    {
      name: 'stem-collision hits — the three are NOT allow-list rows and resolve to FORK modules',
      check: () => {
        const declared = declaredConsumerEdgesFromPin()
        for (const c of STEM_COLLISIONS) {
          if (!existsSync(join(REPO_ROOT, c.forkModule))) return `the fork module ${c.forkModule} named by the collision record does not exist`
          if (!readText(join(REPO_ROOT, c.file)).includes(`'${c.specifier}'`)) return `${c.file} no longer carries the ${c.specifier} stem-collision edge`
          if (declared.some((d) => d.file === c.file && d.specifier === c.specifier)) {
            return `${c.file} -> ${c.specifier} was ADDED to DECLARED_CONSUMER_EDGES (§5 G-2: the stem-collision hits resolve to FORK modules and are NOT rows)`
          }
        }
        return null
      },
    },
    {
      name: 'unlisted vendored-resolving edges — none, with the adoption edges declared',
      check: () => {
        const unlisted = unlistedVendoredEdges(declaredConsumerEdgesFromPin())
        if (unlisted.length === 0) return null
        return `${unlisted.length} consumer edge(s) resolve to a vendored member and are NOT on the allow-list, so the §3 adoptions are undeclared (§5 G-2): ${unlisted
          .map((e) => `${e.file} -> ${e.spec} [${e.kind}]`)
          .join(', ')}`
      },
    },
  ]

  it('P-IM-zone-repl-2 — the six adopted edges, the four refused evasion shapes and the three pre-existing rows (13)', () => {
    runRow('P-IM-zone-repl-2', arms)
  })
})

// ===========================================================================
// §6 ROW 3 — `P-SM-zone-repl-3` · `strat:zone-replacement-census-track-record`
// THE CENSUS RECORD IS THE CALLER'S, AND THE REVEALED PREDICATE IS CALLABLE. For every
// generated (zone set, census, sizes, revealed-set) state: the record's own keys are
// EXACTLY the enumerated members in first-seen order; each value is String(size)+unit or
// the caller's emptyToken; a declined member keeps its key with the empty string; and the
// DISCRIMINATING ARM — the same input as the fork ARRAY yields the EMPTY record while the
// CLOSURE form yields the full one.
//
// ⟨`PD-UI-14` REMAND `2026-10-04` — `RCA-8(c)`, THE CORRECTION RECORDED IN PLACE.⟩ THE
// CLOSED-OVER SET IS PART OF THE STIMULUS, and the as-filed arms passed the WRONG ONE: every
// limb that asserts a SIZED or `emptyToken` value drove `revealedClosure([])`, a closure that
// answers FALSE for every member (verified by driving it), so the module returned the DECLINED
// member's `''` for all four zones — arm 3's own `''` result, under a closure that arm 3's
// sibling limbs were asserting sized values against, and arm 10's falsifier shows the ARRAY
// form is the shape that yields the EMPTY RECORD. THE CONTRACT DECIDES (§3 row 1's `revealed`
// position; §4 item (ii)): `revealed` is a PREDICATE and a member it DECLINES keeps its key
// carrying `''`, so a limb that means "displayed" must say so. THE ROWS' STIMULI, as re-pointed:
//   · arms 1, 2, 4, 5, 6, 7, 8, 9, 11, 12 → `revealedAll()` — the closure over
//     `LAYOUT_PANE_ZONES`, i.e. every enumerated member is DISPLAYED and carries its token.
//   · arm 3 → `declinedAll()` — the DECLINED limb, the ONE arm whose subject is the `''`.
//   · arm 10/13 (the falsifier) → the fork's ARRAY form vs a closure with its OWN revealed
//     set; the array form must still yield the EMPTY record and the closure the full one.
// NO ARM WAS ADDED OR REMOVED AND NO ASSERTION WAS DELETED: the declared term below is
// unchanged (`13`), and each re-pointed limb is now the state its own expectation names.
// ===========================================================================
describe('§6 P-SM-zone-repl-3 — the census/track record (strat:zone-replacement-census-track-record)', () => {
  const SPEC_OF = specOfMap()
  const SIZES = sizesLookup(DEFAULT_LAYOUT)

  /** Is the write site wired to the vendored census? The row's limbs are driven THROUGH
   *  the vendored module once the adoption lands; at this head nothing imports it, and the
   *  arm reports that absence instead of pretending the write site was exercised. */
  const censusWired = (): string | null => {
    if (importersOf('census').length === 0) {
      return 'nothing under src imports src/shared/census.ts — the write site still computes the record locally (layout-state.ts -> zoneTrackCssVars)'
    }
    return null
  }

  const runCensus = (census: unknown, revealed: (id: unknown) => boolean): Record<string, string> =>
    computeTrackVars(LAYOUT_PANE_ZONES, census, SIZES, revealed, SPEC_OF)

  // -------------------------------------------------------------------------
  // ⟨THE GATE-4 FIX PASS — `F8`: THE FORK'S OWN RECORD FUNCTION, INSTANTIATED AND
  // DRIVEN.⟩ `zoneTrackVars` (`src/renderer/layout-state.ts`) is §3 row 1's WRITE-SITE
  // function — the file that holds the row's reduced seam — and NO test in the repo
  // invoked it: every limb above drives the VENDORED `computeTrackVars` directly, so the
  // fork's own caller positions (its enumeration, its census SOURCE, its size lookup, its
  // CLOSURE ADAPTER and its collapse policy) were never reached, and its `revealed`
  // POLARITY was graded only through the vendored module. The two limbs below drive the
  // FORK's function and grade the polarity BOTH ways at the fork's own boundary:
  //   · A: a zone the caller REVEALS is kept (the C11 carve-out — a revealed drop target
  //     never collapses), and an unrevealed EMPTY zone collapses to the `emptyToken`;
  //   · B: the same two states through the fork's function with the census emptied, so the
  //     polarity is graded on BOTH sides of the predicate rather than on one.
  // -------------------------------------------------------------------------

  /** ARM 1's driven fork limb: the fork's OWN record, keyed and valued by the CALLER. */
  function forkRecordOffences(): string[] {
    const offenders: string[] = []
    const registry = createPaneRegistry()
    registerZoneProbe(registry, 'zone-repl-fork-record', 'left')
    registry.enable('zone-repl-fork-record')
    const base = defaultLayout()
    const record = forkRecord(registry, [])
    const expectedKeys = ['--stage-weight', ...LAYOUT_PANE_ZONES.map((zone) => `--zone-${zone}-track`)]
    if (Object.keys(record).join(',') !== expectedKeys.join(',')) {
      offenders.push(
        `the FORK's own \`zoneTrackVars\` record keys are [${Object.keys(record).join(',')}], not the caller's own (the stage weight plus the four enumerated track tokens, in the enumeration's first-seen order) — §3 row 1 makes the enumeration, the token names and the stage token CALLER data`,
      )
    }
    const nonEmpty = nonEmptyZonesOf(record)
    if (nonEmpty.length === 0) {
      offenders.push(
        "the FORK's own `zoneTrackVars` reports NO non-empty zone for a registry carrying one ENABLED app-graph pane placed in `left` — the census source or the record arithmetic has drifted from §3 row 1 (the census is the caller's fact, handed to the module as data)",
      )
    }
    for (const zone of nonEmpty) {
      const got = record[`--zone-${zone}-track`]
      if (got !== `${base.zones[zone].size}px`) {
        offenders.push(
          `the FORK's own record reads ${JSON.stringify(got)} for the non-empty zone ${zone}, not the caller's \`String(size)+unit\` ${base.zones[zone].size}px (§3 row 1's TrackSpec: unit \`px\`)`,
        )
      }
    }
    for (const zone of LAYOUT_PANE_ZONES) {
      if (nonEmpty.includes(zone)) continue
      const got = record[`--zone-${zone}-track`]
      if (got !== '0px') {
        offenders.push(
          `the FORK's own record reads ${JSON.stringify(got)} for the EMPTY zone ${zone}, not the caller's \`emptyToken\` 0px (§3 row 1: the empty-track collapse is the caller's policy and the caller's token)`,
        )
      }
    }
    if (record['--stage-weight'] !== `${base.stage.size}fr`) {
      offenders.push(
        `the FORK's own record reads ${JSON.stringify(record['--stage-weight'])} for the stage weight, not the caller's coerced \`${base.stage.size}fr\` (§3 row 1: the stage's share is the caller's token, written by the write site)`,
      )
    }
    // POLARITY A — a REVEALED zone never collapses, THROUGH THE FORK's own function.
    const revealedRecord = forkRecord(registry, ['left'])
    if (revealedRecord['--zone-left-track'] !== `${base.zones.left.size}px`) {
      offenders.push(
        `the FORK's own record reads ${JSON.stringify(revealedRecord['--zone-left-track'])} for the non-empty zone \`left\` while \`left\` is REVEALED — the C11 carve-out keeps a revealed drop target's size, and the polarity must be graded through the fork's own predicate, never only through the vendored module`,
      )
    }
    return offenders
  }

  /** ARM 2's driven fork limb: the polarity's OTHER side, with the census emptied. */
  function forkRecordEmptyPolarityOffences(): string[] {
    const offenders: string[] = []
    const base = defaultLayout()
    const registry = createPaneRegistry()
    // REGISTERED, NOT ENABLED — so every zone's census count is zero for the fork's own
    // `enabledZonePaneCounts`-derived source (the caller's fact, D-4).
    registerZoneProbe(registry, 'zone-repl-fork-record-empty', 'left')
    const collapsed = forkRecord(registry, [])
    for (const zone of LAYOUT_PANE_ZONES) {
      const got = collapsed[`--zone-${zone}-track`]
      if (got !== '0px') {
        offenders.push(
          `the FORK's own record reads ${JSON.stringify(got)} for the empty, UNREVEALED zone ${zone}, not the caller's \`emptyToken\` 0px — §3 row 1's collapse policy (an empty zone collapses only when it is NOT revealed) graded through the fork's own function`,
        )
      }
    }
    // THE OTHER SIDE OF THE SAME PREDICATE: an EMPTY zone the caller IS revealing must NOT
    // collapse — the C11 carve-out. TWO REPRESENTATIONS ARE ADMISSIBLE AT THIS SEAM and the
    // limb grades the OUTCOME, not one of them: (i) the module's own DECLINED reading, the
    // empty string, which the write site turns into a REMOVAL (the stylesheet fallback then
    // supplies the persisted size), or (ii) the fork's own words for the same state
    // ("`zoneTrackVars` below turns a declined member back into the zone's persisted size")
    // — the persisted `String(size)+unit`. BOTH are "no collapse"; `0px` is neither.
    const carveOut = forkRecord(registry, ['header'])
    const headerValue = carveOut['--zone-header-track']
    const headerAdmissible = ['', `${base.zones.header.size}px`]
    if (headerValue === '0px' || !headerAdmissible.includes(headerValue as string)) {
      offenders.push(
        `the FORK's own record reads ${JSON.stringify(headerValue)} for the empty zone \`header\` while \`header\` IS REVEALED — §3 row 1's collapse policy collapses an empty zone ONLY when it is NOT revealed, so a revealed empty zone must carry either the module's DECLINED reading (the empty string, which the write site turns into a removal) or the persisted size (${base.zones.header.size}px); the \`emptyToken\` 0px is a COLLAPSE and is the one reading the carve-out forbids`,
      )
    }
    for (const zone of LAYOUT_PANE_ZONES) {
      if (zone === 'header') continue
      const got = carveOut[`--zone-${zone}-track`]
      if (got !== '0px') {
        offenders.push(
          `the FORK's own record reads ${JSON.stringify(got)} for the empty zone ${zone} while only \`header\` is revealed — the polarity must select ONE revealed member, not every member`,
        )
      }
    }
    return offenders
  }

  const arms: Arm[] = [
    {
      name: 'track limb — sized: every value is String(size)+unit, keys EXACTLY the enumerated members in first-seen order',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const census = censusRecord({})
        const out = runCensus(census, revealedAll())
        const keys = Object.keys(out)
        if (keys.join(',') !== LAYOUT_PANE_ZONES.join(',')) {
          return `the record keys are [${keys.join(',')}], not the enumerated members in first-seen order [${LAYOUT_PANE_ZONES.join(',')}]`
        }
        for (const zone of LAYOUT_PANE_ZONES) {
          const expected = forkExpectedTrack(zone, census, DEFAULT_LAYOUT)
          if (out[zone] !== expected) return `zone ${zone} reads ${String(out[zone])}, not the caller String(size)+unit ${expected}`
        }
        // ⟨THE GATE-4 FIX PASS — `F8`, RIDING THIS ARM (`RCA-8(c)`: the vendored drive
        //   above is KEPT; the fork's OWN function is driven beside it).⟩
        const forkOffences = forkRecordOffences()
        if (forkOffences.length > 0) return forkOffences.join(' | ')
        return null
      },
    },
    {
      name: 'track limb — empty: a census-zero zone yields the caller emptyToken (0px), not a size',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const out = runCensus(censusRecord({ left: 0, right: 0, header: 0, footer: 0 }), revealedAll())
        if (Object.keys(out).length !== LAYOUT_PANE_ZONES.length) {
          return `the record key census is ${Object.keys(out).length}, not ${LAYOUT_PANE_ZONES.length}`
        }
        for (const zone of LAYOUT_PANE_ZONES) {
          if (out[zone] !== '0px') return `the census-empty zone ${zone} reads ${String(out[zone])}, not the caller emptyToken 0px`
        }
        // ⟨THE GATE-4 FIX PASS — `F8`, RIDING THIS ARM (`RCA-8(c)`: the vendored drive
        //   above is KEPT; the fork's own function is driven beside it).⟩
        const forkOffences = forkRecordEmptyPolarityOffences()
        if (forkOffences.length > 0) return forkOffences.join(' | ')
        return null
      },
    },
    {
      name: 'track limb — declined: a member the predicate declines KEEPS its key with the empty string',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const out = runCensus(censusRecord({}), declinedAll())
        const keys = Object.keys(out)
        if (keys.join(',') !== LAYOUT_PANE_ZONES.join(',')) return `a declined member did not keep its key: keys [${keys.join(',')}]`
        // ⟨`PD-UI-14` REMAND `2026-10-04`: the DECLINED limb is the ONLY limb whose closure
        //   answers FALSE for the members — every other arm drives `revealedAll()`, so that a
        //   sized/`emptyToken` expectation is never satisfied by a declined member's `''`.⟩
        const nonEmpty = LAYOUT_PANE_ZONES.filter((z) => out[z] !== '')
        if (nonEmpty.length > 0) return `declined member(s) ${nonEmpty.join(', ')} carry ${String(out[nonEmpty[0]!])}, not the empty string`
        return null
      },
    },
    {
      name: 'track limb — symbol-dropped: a Symbol member is the ONE member dropped, and the others still key',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const zones: unknown[] = [Symbol('zone:synthetic'), 'left', 'right']
        const out = computeTrackVars(zones, censusRecord({}), SIZES, revealedAll(), SPEC_OF)
        const keys = Object.keys(out)
        if (keys.join(',') !== 'left,right') return `a Symbol member was not the single dropped member: keys [${keys.join(',')}] (expected [left,right])`
        return null
      },
    },
    {
      name: 'census shape — Map, keyed by the caller ids',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const census = new Map<string, number>(LAYOUT_PANE_ZONES.map((z) => [z, z === 'left' ? 0 : 2]))
        const out = runCensus(census, revealedAll())
        if (out.left !== '0px') return `a Map census with a 0 count for left read ${String(out.left)}, not 0px`
        if (out.right !== forkExpectedTrack('right', census, DEFAULT_LAYOUT)) return `a Map census right track read ${String(out.right)}`
        return null
      },
    },
    {
      name: 'census shape — record (own string keys, the fork own form)',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const census = censusRecord({ footer: 0 })
        const out = runCensus(census, revealedAll())
        if (out.footer !== '0px') return `the record-shaped census read ${String(out.footer)} for the zero-count footer, not 0px`
        return null
      },
    },
    {
      name: 'census shape — array (NOT a count source: every zone reads as non-empty)',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const out = runCensus(['left'], revealedAll())
        for (const zone of LAYOUT_PANE_ZONES) {
          if (out[zone] !== forkExpectedTrack(zone, ['left'], DEFAULT_LAYOUT)) {
            return `the array-shaped census changed zone ${zone} to ${String(out[zone])} — an array is not a count source (isEmpty answers false for every member)`
          }
        }
        return null
      },
    },
    {
      name: 'census shape — malformed (null / primitive / hostile): total, never a throw, the full key set stands',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const hostile = new Proxy(Object.create(null) as Record<string, unknown>, {
          get: () => {
            throw new Error('hostile census')
          },
        })
        const forms: Array<[string, unknown]> = [
          ['null', null],
          ['primitive', 7],
          ['hostile Proxy', hostile],
        ]
        for (const [label, form] of forms) {
          const keys = Object.keys(runCensus(form, revealedAll()))
          if (keys.join(',') !== LAYOUT_PANE_ZONES.join(',')) return `the ${label} census did not yield the full key set: [${keys.join(',')}]`
        }
        return null
      },
    },
    {
      name: 'unusable input — a non-numeric size yields the emptyToken, never NaN',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const sizes = (id: unknown): unknown => (id === 'left' ? 'not-a-number' : DEFAULT_LAYOUT.zones.right.size)
        const out = computeTrackVars(LAYOUT_PANE_ZONES, censusRecord({}), sizes, revealedAll(), SPEC_OF)
        if (out.left !== '0px') return `a string size read ${String(out.left)}, not the emptyToken 0px`
        if (Object.values(out).some((v) => v.includes('NaN'))) return `a NaN reached the record: ${Object.values(out).join(' | ')}`
        return null
      },
    },
    {
      name: 'unusable input — NaN / Infinity / negative sizes reach no NaN token (§4 item (i) coercer property)',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const forms: Array<[string, unknown]> = [
          ['NaN', Number.NaN],
          ['Infinity', Number.POSITIVE_INFINITY],
          ['negative', -25],
        ]
        for (const [label, value] of forms) {
          const out = computeTrackVars(LAYOUT_PANE_ZONES, censusRecord({}), () => value, revealedAll(), SPEC_OF)
          for (const v of Object.values(out)) {
            if (/NaN|Infinity|-\d/.test(v)) {
              return `the ${label} size produced the token ${v} — §4 item (i): a finite positive value must reach the write (the fork coercer runs BEFORE the seam)`
            }
          }
        }
        return null
      },
    },
    {
      name: 'unusable input — an absent size lookup (undefined for every member) degrades to the emptyToken',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const out = computeTrackVars(LAYOUT_PANE_ZONES, censusRecord({}), () => undefined, revealedAll(), SPEC_OF)
        if (Object.values(out).some((v) => v !== '0px')) {
          return `an absent size lookup yielded ${Object.values(out).join(' | ')}, not the emptyToken for every member`
        }
        return null
      },
    },
    {
      name: 'unusable input — a throwing size lookup is absorbed (the module is TOTAL) and lands on the emptyToken',
      check: () => {
        const wiring = censusWired()
        if (wiring !== null) return wiring
        const out = computeTrackVars(
          LAYOUT_PANE_ZONES,
          censusRecord({}),
          () => {
            throw new Error('throwing lookup')
          },
          revealedAll(),
          SPEC_OF,
        )
        if (Object.values(out).some((v) => v !== '0px')) {
          return `a throwing size lookup yielded ${Object.values(out).join(' | ')}, not the emptyToken`
        }
        return null
      },
    },
    {
      name: 'falsifier — the SAME input as the fork ARRAY yields the EMPTY record; the CLOSURE yields the full one',
      check: () => {
        const census = censusRecord({})
        const asArray = computeTrackVars(LAYOUT_PANE_ZONES, census, SIZES, ['left'] as unknown, SPEC_OF)
        const asClosure = computeTrackVars(LAYOUT_PANE_ZONES, census, SIZES, revealedClosure(['left']), SPEC_OF)
        if (Object.keys(asArray).length !== 0) {
          return `the ARRAY form produced ${Object.keys(asArray).length} key(s) — the falsifier did not reproduce §4 item (ii) silent total regression, so the row discriminating power cannot be shown`
        }
        if (Object.keys(asClosure).length !== LAYOUT_PANE_ZONES.length) {
          return `the CLOSURE form produced ${Object.keys(asClosure).length} key(s), not the full ${LAYOUT_PANE_ZONES.length}-key record`
        }
        return null
      },
    },
  ]

  it('P-SM-zone-repl-3 — the four track limbs, the four census shapes, the four unusable-input classes and the array-vs-closure falsifier (13)', () => {
    runRow('P-SM-zone-repl-3', arms)
    // THE FALSIFIER IS DRIVEN WHETHER OR NOT THE STOP RULE REACHED IT (§4 item (ii)): a row
    // that abandoned it would leave the silent total regression unshown. This is a READING
    // for the report, not a second attempt.
    const census = censusRecord({})
    expect(
      Object.keys(computeTrackVars(LAYOUT_PANE_ZONES, census, SIZES, ['left'] as unknown, SPEC_OF)).length,
      '§4 item (ii) falsifier: the fork ARRAY form must yield the EMPTY record (a missing-key regression, not a wrong value)',
    ).toBe(0)
    expect(
      Object.keys(computeTrackVars(LAYOUT_PANE_ZONES, census, SIZES, revealedClosure(['left']), SPEC_OF)).length,
      '§4 item (ii): the CLOSURE form must yield the full record',
    ).toBe(LAYOUT_PANE_ZONES.length)
  })
})

// ===========================================================================
// §6 ROW 4 — `P-SM-zone-repl-4` · `strat:zone-replacement-one-write-per-gesture`
// THE WRITE DISCIPLINE AND THE POLICY THAT STAYS. For every gesture path: at most ONE
// commit write per gesture; a cancel writes ZERO; a refused establishment writes ZERO; and
// the fork fail-closed resizability and takeover-commit rules hold at the composition
// boundary (no write ever carries a non-finite or negative size).
// ===========================================================================
describe('§6 P-SM-zone-repl-4 — the one-write-per-gesture discipline (strat:zone-replacement-one-write-per-gesture)', () => {
  /** A plain event source for the session's INJECTED seam: a test double, NOT a module mock
   *  (no `vi.mock`, no alias, nothing binds `'electron'`). It keeps ONE handler per
   *  (element, type) pair — the shape the vendored `EventSource` seam implies, because the
   *  session attaches its three tracking handlers on three DIFFERENT types for the same
   *  element and calls `off` per handler. */
  function eventSource(): {
    source: EventSource
    fire: (element: unknown, type: string) => void
    captures: () => number
  } {
    const handlers = new Map<unknown, Map<string, () => void>>()
    let captures = 0
    const source: EventSource = {
      on(element: unknown, type: string, handler: () => void): void {
        const perElement = handlers.get(element) ?? new Map<string, () => void>()
        perElement.set(type, handler)
        handlers.set(element, perElement)
      },
      off(element: unknown, type: string): void {
        handlers.get(element)?.delete(type)
      },
      capturePointer(): void {
        captures += 1
      },
    }
    return { source, fire: (element: unknown, type: string) => handlers.get(element)?.get(type)?.(), captures: () => captures }
  }

  interface Composition {
    control: { zone: LayoutZoneName }
    session: ReturnType<typeof createGestureSession>
    writes: number[]
    /** fire one of the source's own pointer events for this control */
    fire: (type: string) => void
    captures: () => number
    /** the HANDLE the module built, read on the module's own channel: the session's `gesture()`
     *  reading carries no handle and the module exports none, so the composition's only legal
     *  read of it is the `onMove` hook the controller hands it (and the `sizeFor` seam beside) */
    handle: () => { set: (value: unknown) => unknown } | null
    /** the per-move value the fork would compute; it is pushed onto the gesture at the move */
    setValue: (value: unknown) => void
  }

  /** THE COMPOSITION §3 rows 3/4 name: the vendored session injected into the vendored
   *  controller, with the fork seams (axis, bounds, default, the FAIL-CLOSED resizability
   *  adapter, and the ONE commit sink). Its `sizeFor` seam is the fork's value channel: it
   *  reads the per-move value, pushes it onto the gesture the module built, and returns it. */
  function compose(opts?: { resizable?: unknown }): Composition {
    const control = { zone: 'left' as LayoutZoneName }
    const writes: number[] = []
    const src = eventSource()
    const session = createGestureSession({ source: src.source })
    const raw = opts !== undefined && 'resizable' in opts ? opts.resizable : () => isGutterResizable(true, false)
    // THE FORK'S FAIL-CLOSED ADAPTER (C-1): the module reads truthiness, so the fork's closure
    // is what makes a non-`true` answer refuse. A throw is a refusal, never a propagated error.
    const failClosed = (element: unknown, axis: unknown): boolean => {
      try {
        return (raw as (e: unknown, a: unknown) => unknown)(element, axis) === true
      } catch {
        return false
      }
    }
    let captured: { set: (value: unknown) => unknown } | null = null
    let pending: unknown = undefined
    const controller = createResizeController({
      session,
      axisFor: (el: unknown) => gutterAxis((el as { zone: string }).zone),
      boundsFor: (el: unknown) => gutterBounds((el as { zone: LayoutZoneName }).zone),
      defaultSizeFor: (el: unknown) => DEFAULT_LAYOUT.zones[(el as { zone: LayoutZoneName }).zone].size,
      isResizable: failClosed,
      sizeFor: (_el: unknown, gesture: { value: unknown; set: (v: unknown) => unknown }) => {
        captured = gesture
        return gesture.value
      },
      commit: (_gesture: unknown, value: number) => {
        writes.push(value)
      },
    })
    const attached = controller.attach(control, {
      onMove: (gesture: unknown) => {
        // THE MODULE'S OWN HANDLE CHANNEL: `onMove` is the one hook the composition is handed
        // the live gesture on, so this is where the fork reads it and pushes the per-move size.
        captured = gesture as { set: (value: unknown) => unknown }
        captured.set(pending)
      },
    })
    expect(attached, 'the composition must attach its control to the vendored controller').toBe(true)
    return {
      control,
      session,
      writes,
      fire: (type: string) => src.fire(control, type),
      captures: src.captures,
      handle: () => captured,
      setValue: (value: unknown) => {
        pending = value
      },
    }
  }

  /** FIRE the control's `pointerdown` and report whether the SESSION established a gesture by
   *  its own establishment path — the injected source is the only establishment route, so a
   *  second `begin` over an in-flight gesture (the module's own `busy` refusal) is never taken. */
  function establish(comp: Composition): { id: number } | null {
    comp.fire('pointerdown')
    const stats = comp.session.gesture()
    return stats === null ? null : { id: stats.id }
  }

  // -------------------------------------------------------------------------
  // ⟨THE GATE-4 FIX PASS — `F1`/`F2`: THE REAL ESTABLISHMENT PAIR, DRIVEN.⟩
  //
  // THE OFFENCE THIS LIMB GRADES, IN THE FINDING'S OWN WORDS: the fork installs the
  // gesture control on the ELEMENT-BACKED source AND the document-delegated
  // `pointerdown` begins the SAME gesture again; the second `begin` answers
  // `{ ok: false, code: 'busy' }` while the slot is held, and the fork treats ANY
  // non-`ok` answer as a failed establishment (`gutterGesture = null;
  // state.host.cancelGutter(); return false`) — so the gesture is torn down and
  // `gutterCommit` returns without writing. The synthetic source the row's other arms
  // use can NEVER see this: it drives one establishment, and the fork's second one is
  // never reached. So this limb drives the REAL pair end to end — the REAL
  // `installShellPointers` wiring, the REAL `SidebarPanes` host, a DOM the fork's own
  // `dom-shim` provides, and the shell's own control vocabulary (§3.2).
  //
  // WHAT IS ASSERTED, per gesture, and why each is the contract's own property:
  //   (i)   the fork's establishment path ran EXACTLY once (§3 row 4: one establishment
  //         per gesture — the pair must not produce two);
  //   (ii)  the fork did NOT tear the gesture down mid-flight (zero mid-gesture
  //         `cancelGutter`) — a `busy` answer is NOT a failed establishment;
  //   (iii) the gesture reached the ONE WRITE PATH exactly once with a finite,
  //         positive, in-window zone size (`§3` row 3's `commit` seam →
  //         `setLayout`/`commitGutterSize`; `§6` row 4: AT MOST ONE commit write per
  //         gesture — and, for a gesture that did happen, exactly one).
  // GESTURE 2 IS THE FINDING'S OWN STATE: the control is already installed, so the
  // element-backed `begin` wins the slot and the delegated `begin` is the loser.
  // -------------------------------------------------------------------------
  function establishmentPairOffences(): string[] {
    const offenders: string[] = []
    const drive = shellGestureDrive()
    const bounds = gutterBounds('left')
    const driveGesture = (label: string): void => {
      const startsBefore = drive.starts.length
      const cancelsBefore = drive.cancels()
      const writesBefore = drive.layoutWrites.length
      drive.fire('pointerdown', { pointerId: 7, clientX: 300, clientY: 120 })
      drive.fire('pointermove', { pointerId: 7, clientX: 350, clientY: 120 })
      drive.fire('pointerup', { pointerId: 7, clientX: 350, clientY: 120 })
      const startDelta = drive.starts.length - startsBefore
      const cancelDelta = drive.cancels() - cancelsBefore
      const writeDelta = drive.layoutWrites.length - writesBefore
      if (startDelta !== 1) {
        offenders.push(`${label}: the fork's establishment path ran ${startDelta} time(s), not exactly ONCE per gesture (§3 row 4)`)
      }
      if (cancelDelta !== 0) {
        offenders.push(
          `${label}: the fork TORE THE GESTURE DOWN mid-gesture — ${cancelDelta} mid-gesture \`cancelGutter\` call(s): a second \`begin\` that answers a non-ok code (the vendored session's \`busy\`, while the slot is held by this same control) is being treated as a FAILED establishment, so the gesture has no zone and no value at its commit terminal`,
        )
      }
      if (writeDelta !== 1) {
        offenders.push(
          `${label}: a full gutter gesture (pointerdown → pointermove → pointerup through the REAL wiring) reached the ONE write path ${writeDelta} time(s), not exactly once — §3 row 3's \`commit\` seam (\`setLayout\`/\`commitGutterSize\` → the operator-settings persist) is never reached, so the commit terminal writes NOTHING and the drag commits no zone size`,
        )
        return
      }
      const layout = drive.layoutWrites[drive.layoutWrites.length - 1]!
      const size = layout.zones.left.size
      if (!Number.isFinite(size) || size <= 0 || size < bounds.min || size > bounds.max) {
        offenders.push(
          `${label}: the single layout write carried the zone size ${String(size)}, which is not a finite positive size inside the zone's own clamp window [${bounds.min}, ${bounds.max}] (§4 item (i)'s coercer property, §3 row 3's clamp policy)`,
        )
      }
    }
    driveGesture('gesture 1 (a FRESH control — the element is installed by this very pointerdown)')
    driveGesture('gesture 2 (the SAME, already-installed control — the element-backed begin wins the slot and the delegated begin loses it)')
    drive.restore()
    return offenders
  }

  // -------------------------------------------------------------------------
  // ⟨THE GATE-4 FIX PASS — `F2`: THE CAPTURE CAPABILITY MUST BE REAL.⟩
  //
  // THE OFFENCE: the fork opts in (`capture: true`), and the vendored session calls the
  // source's `capturePointer(element)` with NO pointer identity — so the fork's
  // `element.setPointerCapture()` passes no argument, which THROWS on a real DOM and is
  // swallowed (the gesture is then captured not at all), and the session's tracking
  // listeners are bound on the gutter element ONLY, so a drag leaving its box loses the
  // gesture. THE FORK SIDE IS WHAT IS GRADED (the session's element-only call is the
  // upstream API gap, filed to `docs/defects.md` → `docs/HANDOFF.md`, never patched).
  // The shim records the capture CALL and its ARGUMENT, which is exactly the fork-side
  // observable: the DOM call must CARRY the gesture's pointer identity.
  // -------------------------------------------------------------------------
  function captureCapabilityOffences(): string[] {
    const offenders: string[] = []
    const drive = shellGestureDrive()
    const writesBefore = drive.layoutWrites.length
    drive.fire('pointerdown', { pointerId: 7, clientX: 300, clientY: 120 })
    // THE SUBJECT GUARD: a drive whose pointerdown never reached the fork's establishment
    // path would grade nothing at all, so it is REPORTED rather than silently passed.
    if (drive.starts.length === 0) {
      return [
        'the drive has no subject: a dispatched `pointerdown` on an authored gutter affordance did not reach the fork\u2019s establishment path (`host.startGutter`) at all, so the capture capability cannot be graded',
      ]
    }
    if (drive.gutter.captureCalls === 0) {
      offenders.push(
        'after establishment the fork requested NO pointer capture at all (§4 item (iii): capture is permitted AFTER establishment and is the per-gesture opt-in this control took — a capture-less gesture is lost the moment the pointer leaves the element)',
      )
    }
    const captured = drive.gutter.capturePointerId
    if (typeof captured !== 'number' || !Number.isFinite(captured)) {
      offenders.push(
        `the fork's capture path supplied NO pointer identity: the DOM call the element recorded was \`setPointerCapture(${String(captured)})\` — a real DOM \`setPointerCapture\` REQUIRES a pointer id and throws for the no-argument call, so the capture never happens (the fork must carry the gesture's own pointer identity, 7, into the DOM call)`,
      )
    } else if (captured !== 7) {
      offenders.push(`the fork's capture path used pointer identity ${String(captured)}, not the gesture's own pointer 7`)
    }
    // THE POINTER LEAVES THE ELEMENT'S BOX: an off-element move, then a `pointerout` and a
    // `pointerleave` ON the element. The gesture must SURVIVE both (no fork teardown) and
    // still commit once at the capture retarget's terminal.
    const cancelsBefore = drive.cancels()
    drive.fireOff('pointermove', { pointerId: 7, clientX: 420, clientY: 120 })
    drive.fire('pointerout', { pointerId: 7 })
    drive.fire('pointerleave', { pointerId: 7 })
    if (drive.cancels() !== cancelsBefore) {
      offenders.push(
        'a pointer leaving the element ENDED the gesture (§4 item (iii): the drag must survive leaving its box — the capture, or the fork’s own tracking, keeps the gesture alive; nothing in the contract ends a gesture on a leave)',
      )
    }
    drive.fire('pointerup', { pointerId: 7, clientX: 420, clientY: 120 })
    const writeDelta = drive.layoutWrites.length - writesBefore
    if (writeDelta !== 1) {
      offenders.push(
        `a gesture whose pointer LEFT the element's box committed ${writeDelta} time(s), not exactly once — the drag left its box and the commit terminal carried no value, so the gesture was LOST (the capture that would retarget it is the §4 item (iii) capability this limb grades)`,
      )
    }
    drive.restore()
    return offenders
  }

  // -------------------------------------------------------------------------
  // ⟨THE GATE-4 FIX PASS — `F8`: THE FORK'S OWN CONTROLLER, INSTANTIATED AND DRIVEN.⟩
  //
  // `createGutterResizeController` (`src/renderer/pane-gutter.ts`) is the fork's OWN
  // row-3 composition — the file that HOLDS the row's reduced seam — and NO test in the
  // repo invoked it: the row's substantive arms composed the VENDORED controller
  // directly, so the fork's own seams (`zoneOf` identity, the FAIL-CLOSED resizability
  // adapter, the one commit sink, the clamp in front of the write) were never reached.
  // This limb drives the fork's factory itself and grades §6 row 4's subject at its
  // boundary: AT MOST ONE commit per gesture, ZERO on a cancel, ZERO on a refused
  // establishment, and no write carrying a non-finite, negative or out-of-window size.
  // -------------------------------------------------------------------------
  function forkControllerOffences(): string[] {
    const offenders: string[] = []
    const bounds = gutterBounds('left')
    const commits: number[] = []
    const control = { zone: 'left' as LayoutZoneName }
    let resizableAnswer: unknown = isGutterResizable(false, false)
    const src = eventSource()
    const session = createGestureSession({ source: src.source })
    const controller = createGutterResizeController({
      session,
      zoneOf: (element: unknown): LayoutZoneName | null => (element === control ? 'left' : null),
      isResizable: (): unknown => resizableAnswer,
      commit: (_zone: LayoutZoneName, size: number): void => {
        commits.push(size)
      },
    })
    let pending: unknown = 320
    const attached = controller.attach(control, {
      onMove: (gesture: unknown) => {
        ;(gesture as { set: (value: unknown) => unknown }).set(pending)
      },
    })
    if (!attached) {
      return [
        "the fork's own createGutterResizeController refused to attach its control element — §3 row 3's composition is the fork's ONE gutter controller, and a factory that refuses an attached control with a usable session has no subject at all",
      ]
    }
    const drive = (value: unknown): void => {
      pending = value
      src.fire(control, 'pointerdown')
      src.fire(control, 'pointermove')
      src.fire(control, 'pointerup')
    }
    // AT MOST ONE per committing gesture — and exactly one for a gesture that commits.
    drive(320)
    if (commits.length !== 1) {
      offenders.push(
        `the fork's OWN controller committed ${commits.length} time(s) for one gesture, not exactly one (§6 row 4: at most ONE commit write per gesture, reached through ONE sink)`,
      )
    }
    // A CANCEL writes ZERO.
    const beforeCancel = commits.length
    src.fire(control, 'pointerdown')
    src.fire(control, 'pointermove')
    session.cancel(control)
    if (commits.length !== beforeCancel) {
      offenders.push(
        `a CANCEL through the fork's own controller wrote ${commits.length - beforeCancel} time(s); §3 rows 3/4 require ZERO on a cancel`,
      )
    }
    // A REFUSED establishment writes ZERO (the fork's FAIL-CLOSED gate).
    resizableAnswer = 'yes'
    const beforeRefusal = commits.length
    drive(320)
    if (commits.length !== beforeRefusal) {
      offenders.push(
        `a REFUSED establishment (a non-\`true\` resizability answer) wrote ${commits.length - beforeRefusal} time(s) through the fork's own controller — §3 row 3's policy column makes the fork's gate FAIL-CLOSED (\`=== true\`)`,
      )
    }
    resizableAnswer = isGutterResizable(false, false)
    // UNUSABLE INPUT: no write may carry a non-finite, negative or out-of-window size.
    const unusable: Array<[string, number]> = [
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
      ['negative', -40],
      ['absurd', 1e9],
    ]
    for (const [label, value] of unusable) {
      const before = commits.length
      drive(value)
      for (const size of commits.slice(before)) {
        if (!Number.isFinite(size) || size <= 0 || size < bounds.min || size > bounds.max) {
          offenders.push(
            `the ${label} size wrote ${String(size)} through the fork's own controller — §4 item (i)'s coercer property: only a finite size inside the zone's own clamp window [${bounds.min}, ${bounds.max}] may reach the write`,
          )
        }
      }
    }
    // THE ANTI-VACUITY GUARD, DRIVEN: every "zero writes" limb above is satisfied by a
    // controller that NEVER writes at all — so the sink's own reach is asserted. A fork
    // whose controller commits nothing has no subject for §6 row 4 and is REPORTED, not
    // passed.
    if (commits.length === 0) {
      offenders.push(
        "the fork's own controller never reached its commit sink across five driven gestures — every zero-write limb above would hold vacuously (§3 row 3: the composed controller's `commit` seam IS the fork's one write path)",
      )
    }
    return offenders
  }

  /** The gesture the module built — read the way the fork reads it, on the module's own move
   *  channel with the per-move value pushed onto it; the terminal then reads that value. */
  function moveHandle(comp: Composition, value: number): Parameters<ReturnType<typeof createGestureSession>['end']>[1] {
    comp.setValue(value)
    comp.fire('pointermove')
    const handle = comp.handle()
    expect(handle, 'the composition must expose the gesture handle on its own move channel (the module hands it to onMove)').not.toBeNull()
    return handle as unknown as Parameters<ReturnType<typeof createGestureSession>['end']>[1]
  }

  /** Drive one gesture to `end` with the value supplied on the move channel. */
  function gestureToEnd(comp: Composition, value: number): void {
    const begun = establish(comp)
    expect(begun, 'the session must establish the gesture through the injected source').not.toBeNull()
    if (begun === null) return
    const outcome = comp.session.end(comp.control, moveHandle(comp, value), value)
    expect(outcome.ok, `the terminal must reach the session (code ${outcome.code})`).toBe(true)
  }

  const arms: Arm[] = [
    {
      name: 'terminal — end writes exactly ONCE with the value the seam supplied',
      check: () => {
        const comp = compose({ resizable: () => true })
        gestureToEnd(comp, 320)
        if (comp.writes.length !== 1) return `a gesture reaching end performed ${comp.writes.length} commit write(s), not exactly one`
        if (comp.writes[0] !== 320) return `the single write carried ${String(comp.writes[0])}, not the supplied 320`
        // ⟨THE GATE-4 FIX PASS — `F1`, RIDING THIS ARM (`RCA-8(c)`: the arm's own name and
        //   its own assertions are UNCHANGED; the driven limb is ADDED beside them).⟩
        // THE CLAUSE IT GRADES: §3 row 4's "at most one write per gesture" read at the REAL
        // establishment pair, and §4 item (iii)'s establishment order — one gesture, one
        // establishment, one commit, no mid-gesture teardown. The composition above is the
        // row's OWN synthetic source (it drives one establishment only); the limb below
        // drives the pair the fork actually ships.
        const pairOffences = establishmentPairOffences()
        if (pairOffences.length > 0) return pairOffences.join(' | ')
        return null
      },
    },
    {
      name: 'terminal — reset writes at most once, and the fork keeps its OWN reset route (the module own reset refuses outside a gesture, §4 item (vii))',
      check: () => {
        const comp = compose({ resizable: () => true })
        if (establish(comp) === null) return 'the fork gate refused establishment for a resizable control — the reset limb has no subject'
        comp.session.reset(comp.control, moveHandle(comp, 400), 400)
        if (comp.writes.length > 1) return `the reset terminal performed ${comp.writes.length} write(s) — the discipline is AT MOST ONE per gesture`
        const code = codeOfAllSrc()
          .map((c) => c.code)
          .join('\n')
        if (!/\bresetGutter\b/.test(code)) {
          return 'no fork-side reset route exists (§4 item (vii): the module own reset refuses `no-gesture` outside a gesture, so the double-click reset must be the fork\u2019s own)'
        }
        return null
      },
    },
    {
      name: 'terminal — a cancel writes ZERO',
      check: () => {
        const comp = compose({ resizable: () => true })
        if (establish(comp) === null) return 'the session refused establishment for a resizable control'
        comp.session.cancel(comp.control)
        if (comp.writes.length !== 0) return `a cancelled gesture performed ${comp.writes.length} write(s); §3 rows 3/4 require ZERO on cancel`
        return null
      },
    },
    {
      name: 'policy — fail-closed resizability: a non-true answer refuses the gesture and reaches no write',
      check: () => {
        const comp = compose({ resizable: () => 'yes' })
        if (establish(comp) === null) return 'the session refused establishment for the composed control — the limb has no subject'
        // The module's decision seam reads TRUTHINESS; the fork's fail-closed closure answers
        // `=== true`, and `isGutterResizable`'s body is the predicate it wraps.
        const gate = codeOf(PANE_GUTTER_PATH)
        if (!/empty !== true && minimized !== true/.test(gate)) {
          return 'isGutterResizable no longer carries the fail-closed body (empty !== true && minimized !== true) (§3 row 3 policy column)'
        }
        // The fork's fail-closed form is a DISTINCT SHAPE, not the module's truthiness rule: a
        // landing that hands the raw predicate to the module is the C-1 finding, so the fork's
        // own `=== true` comparison must be visible in the tree.
        const strict = codeOfAllSrc().filter((c) => /isResizable\s*:/.test(c.code) && /===\s*true/.test(c.code))
        if (strict.length === 0) {
          return 'NO file under src supplies an isResizable seam whose answer is the fork fail-closed form (=== true) — C-1: the module reads truthiness, so a raw predicate lets a non-true answer ENABLE a gesture'
        }
        // A refused establishment reaches NO commit, and the non-true answer is never coerced
        // into a size: the write stream stays empty for the whole gesture.
        comp.session.end(comp.control, moveHandle(comp, 'yes' as unknown as number), 'yes' as unknown as number)
        const nonNumeric = comp.writes.filter((w) => typeof w !== 'number')
        if (nonNumeric.length > 0) return `a refused establishment wrote ${nonNumeric.length} non-numeric value(s): ${nonNumeric.join(', ')}`
        if (comp.writes.length !== 0) return `a refused establishment performed ${comp.writes.length} write(s)`
        return null
      },
    },
    {
      name: 'policy — a THROWING resizability predicate refuses (never propagates) and reaches no write',
      check: () => {
        const comp = compose({
          resizable: () => {
            throw new Error('throwing gate')
          },
        })
        if (establish(comp) === null) return 'the session refused establishment for the composed control — the limb has no subject'
        comp.session.end(comp.control, moveHandle(comp, 320), 320)
        if (comp.writes.length !== 0) {
          return `a THROWING resizability predicate still performed ${comp.writes.length} write(s) — the gate must refuse (a throw is a falsy decision on every path)`
        }
        return null
      },
    },
    {
      name: 'policy — the takeover-commit (H-4) and stage.size untouched: the fork own rules hold at the boundary',
      check: () => {
        const hosts = [SIDEBAR_PANES_PATH, RENDERER_PATH].map((p) => ({ p, code: codeOf(p) }))
        const withTakeover = hosts.filter((h) => /revertPriorGesture|finishGesture|takeover/i.test(h.code))
        if (withTakeover.length === 0) {
          return 'no takeover-commit rule is reachable on the gesture start path (§3 row 3: the H-4 takeover-commit is fork-side policy that STAYS)'
        }
        const stageWriters = codeOfAllSrc().filter((c) => /stage\.size\s*=/.test(c.code) && /gutter/i.test(c.file))
        if (stageWriters.length > 0) {
          return `a zone-commit path writes stage.size (${stageWriters.map((c) => c.file).join(', ')}) — §3 row 3: a zone commit never touches it`
        }
        // ⟨THE GATE-4 FIX PASS — `F2`, RIDING THIS ARM (`RCA-8(c)`: the arm's own name and
        //   its own assertions are UNCHANGED; the driven limb is ADDED beside them).⟩
        // WHY THIS ARM: §3 row 4's "policy that stays" column names THE DEFERRED-CAPTURE
        // POLICY in terms — "capture is per-control opt-in and capture happens AFTER
        // establishment — the fork's own recorded rule; §4 item (iii) is the LIVE
        // CONTRADICTION this unit fixes". This limb grades that policy at the REAL wiring:
        // the fork's capture path must CARRY the gesture's pointer identity into the DOM
        // call, and a pointer that leaves the element's box must not lose the gesture.
        const captureOffences = captureCapabilityOffences()
        if (captureOffences.length > 0) return captureOffences.join(' | ')
        return null
      },
    },
    {
      name: 'fail-state — a non-finite or negative size reaches NO write',
      check: () => {
        const comp = compose({ resizable: () => true })
        for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, -40]) gestureToEnd(comp, bad)
        const offending = comp.writes.filter((w) => typeof w !== 'number' || !Number.isFinite(w) || w < 0)
        if (offending.length > 0) {
          return `${offending.length} write(s) carried a non-finite or negative size: ${offending.join(', ')} — §4 item (i) coercer property is violated at the boundary`
        }
        return null
      },
    },
    {
      name: 'fail-state — a THROWING commit sink is absorbed: the attempt is counted, never retried, never a throw',
      check: () => {
        const control = { zone: 'left' as LayoutZoneName }
        const src = eventSource()
        const session = createGestureSession({ source: src.source })
        let attempts = 0
        let captured: { set: (value: unknown) => unknown } | null = null
        const controller = createResizeController({
          session,
          axisFor: () => gutterAxis(control.zone),
          boundsFor: () => gutterBounds(control.zone),
          defaultSizeFor: () => DEFAULT_LAYOUT.zones.left.size,
          isResizable: () => true,
          sizeFor: (_e: unknown, gesture: { value: unknown; set: (v: unknown) => unknown }) => {
            captured = gesture
            return gesture.value
          },
          commit: () => {
            attempts += 1
            throw new Error('throwing sink')
          },
        })
        const attachedSink = controller.attach(control, {
          onMove: (gesture: unknown) => {
            captured = gesture as { set: (value: unknown) => unknown }
            captured.set(300)
          },
        })
        if (!attachedSink) return 'the composition did not attach its control'
        src.fire(control, 'pointerdown')
        if (session.gesture() === null) return 'the session refused establishment for a resizable control'
        src.fire(control, 'pointermove')
        const gesture = captured
        if (gesture === null) return 'the composition exposed no gesture handle at its sizeFor seam'
        session.end(control, gesture as unknown as Parameters<typeof session.end>[1], 300)
        if (attempts !== 1) return `a throwing sink was reached ${attempts} time(s), not exactly once (never retried)`
        return null
      },
    },
    {
      name: 'fail-state — a double terminal writes ONCE (the record is discarded, never put back)',
      check: () => {
        const comp = compose({ resizable: () => true })
        if (establish(comp) === null) return 'the session refused establishment for a resizable control'
        const gesture = moveHandle(comp, 320)
        comp.session.end(comp.control, gesture, 320)
        comp.session.end(comp.control, gesture, 999)
        if (comp.writes.length !== 1) {
          return `a double terminal performed ${comp.writes.length} write(s); the per-gesture record must be spent after the first`
        }
        return null
      },
    },
    {
      name: 'fail-state — a terminal AFTER a cancel writes nothing',
      check: () => {
        const comp = compose({ resizable: () => true })
        if (establish(comp) === null) return 'the session refused establishment for a resizable control'
        const gesture = moveHandle(comp, 320)
        comp.session.cancel(comp.control)
        comp.session.end(comp.control, gesture, 320)
        if (comp.writes.length !== 0) return `a terminal after a cancel performed ${comp.writes.length} write(s)`
        return null
      },
    },
    {
      name: 'discriminator — the fork composes the vendored controller with the seam names the row declares (no second commit authority on the move path)',
      check: () => {
        // §3 rows 3/4: the module owns "at most one write per gesture". The fork reaches it by
        // composing the vendored controller with its option SEAMS — `session`, `axisFor`,
        // `boundsFor`, `isResizable`, `sizeFor`, `commit` — and its ONE commit sink is that
        // `commit` seam. A wiring that keeps the fork controller's own per-move `onCommit`
        // authority (or re-points `moveGutter` at it) is a SECOND writer on the move path.
        const composed = codeOfAllSrc().filter(
          (c) =>
            /createResizeController\s*\(/.test(c.code) &&
            /\baxisFor\s*:/.test(c.code) &&
            /\bboundsFor\s*:/.test(c.code) &&
            /\bisResizable\s*:/.test(c.code) &&
            /\bsizeFor\s*:/.test(c.code) &&
            /\bcommit\s*:/.test(c.code),
        )
        if (composed.length === 0) {
          return 'NO file under src composes the vendored resize controller with its declared seams (session/axisFor/boundsFor/isResizable/sizeFor/commit) — §3 rows 3/4 leave the fork per-move controller as the write authority'
        }
        const perMoveWriters = composed.filter((c) => /gutterController\.move\s*\(/.test(c.code) && /onCommit\s*\(/.test(c.code))
        if (perMoveWriters.length > 0) {
          return `${perMoveWriters.map((c) => c.file).join(', ')} still drive a fork-side per-move controller whose own onCommit is a SECOND commit authority (§3 row 3)`
        }
        // ⟨THE GATE-4 FIX PASS — `F8`, RIDING THIS ARM (`RCA-8(c)`: the census above is
        //   KEPT, never deleted; the DRIVEN form is ADDED beside it).⟩
        // WHY: the census above is satisfiable by a planted literal, and it never
        // INSTANTIATES the fork's own reduced seam. `createGutterResizeController`
        // (`src/renderer/pane-gutter.ts`) is the fork's row-3 composition, and NO test in
        // the repo invoked it; the limb below drives it with the fork's own seams and
        // grades §6 row 4's subject at the boundary: AT MOST ONE commit per gesture, ZERO
        // on a cancel, ZERO on a refused establishment, and no write ever carrying a
        // non-finite or negative size inside the zone's own clamp window.
        const drivenOffences = forkControllerOffences()
        if (drivenOffences.length > 0) return drivenOffences.join(' | ')
        return null
      },
    },
  ]

  it('P-SM-zone-repl-4 — the three terminals, the three policy seams, the four fail-states and the per-move discriminator (11)', () => {
    runRow('P-SM-zone-repl-4', arms)
  })
})

// ===========================================================================
// §6 ROW 5 — `P-TP-zone-repl-5` · `strat:zone-replacement-shell-declaration-clauses`
// THE DECLARATION CLAUSES: the zone containers carry `containerDeclarationFor`'s returned
// text applied AS A STRING per container; the four zone track tokens and the stage/top-bar
// tokens are the fork's own names; the grid consumes the TRACK tokens (never the raw
// sizes) with the stage track written `minmax(0, ...)`; and the four region/zone rulings of
// `R-9` hold. Under §2.2 these are SOURCE-CLAUSE CENSUSES — never a layout claim.
// ===========================================================================
describe('§6 P-TP-zone-repl-5 — the shell declaration clauses (strat:zone-replacement-shell-declaration-clauses)', () => {
  // ===========================================================================
  // ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: ROW 5'S DECLARED SUBJECT AND ITS
  // ARMS RE-DECLARED, WITH THE SUPERSEDED SUBJECT KEPT VISIBLE BESIDE THE NEW ONE.⟩
  //
  // THE LICENCE (`§6.0` clause 1/2; `§3.5`; `§3.6.2`; `D-13` — "a recorded contract amendment,
  // never a quiet edit"): the architect ruled **"Record the declines + re-declare the two
  // rows"**, and this register row is the TestWriter's to re-declare.
  //
  // `SUPERSEDED` — THE FILED SUBJECT TEXT, KEPT VERBATIM AS THAT READING (§6 row 5 as filed):
  //   *"THE DECLARATION CLAUSES. The zone containers carry `containerDeclarationFor`'s returned
  //   text applied **as a string** (`contain: layout style paint`) **per container**; the four
  //   zone track tokens and the stage/top-bar tokens are the fork's own names; the grid consumes
  //   the **track** tokens (never the raw sizes) with the stage track written `minmax(0, …)`;
  //   and **the four region/zone rulings of `R-9` hold** (`stage`/`top-bar` are regions, no
  //   gutter, no pane placement)"* — with its `R-9` enumeration (four pane zones; two regions;
  //   no region gutter; the C14 tab strip as chrome) and its declared terms
  //   `6 + 4 + 2 = 12`. BESIDE it, `SUPERSEDED` at the §3 side (§3.5/§3.6.2): §3 row 5's FILED
  //   ADOPTED SET — `createGutterAffordance`, `cursorDeclarationFor`, `domEventSource`, the
  //   sixteen types, and the ELEVEN SEAMS (9 required + 2 optional) — whose COMPOSITION is
  //   `DECLINED FOR THIS UNIT — RECORDED` (§4.0 blockers 1 and 2).
  //
  // RE-DECLARED — WHAT THIS ROW NOW DECLARES (the landed set §3.6.2 names, BESIDE the
  // declaration clauses above, and NOTHING WIDER):
  //   (a) the ELEMENT-BACKED SOURCE `domEventSource()` — landed at `src/renderer/renderer.ts`;
  //   (b) `cursorDeclarationFor` + the fork's CURSOR WRITE through the `applyCursor` SHAPE —
  //       landed at the same file, with the DECLARATION string staying the caller's vocabulary;
  //   (c) the FOUR ENVELOPE-AUTHORED AFFORDANCES at §3.1's authoring site
  //       (`src/renderer/pane-graph.ts`), one per `LAYOUT_PANE_ZONES` member, driven through the
  //       producing graph, WITH their §3.2 class/attribute vocabulary;
  //   (d) the declaration clauses the filed subject already declared (`containerDeclarationFor`
  //       per container, as a string) — BESIDE (e) the grid/track consumption the filed subject
  //       already declared (the TRACK tokens, never the raw sizes; the stage written
  //       `minmax(0, …)`).
  //   **THE FACTORY'S COMPOSITION IS NOT PART OF THIS ROW ANY MORE** (§3.6.2: "the affordance
  //   controller is authored by NOTHING under this unit's name"), and **NO TERM OF THIS ROW
  //   REDS FOR THE FACTORY'S ABSENCE**: the twelve terms below were never the factory and never
  //   any of its eleven seams — the row's arms never instantiate it — so a red here means a
  //   LANDED MEMBER's tooth broke, never "the decline is unbuilt". The decline's own witness
  //   rides ROW 1's row-5 adoption arm (`declinedFactoryOffences`, §4.0(1): the factory is
  //   imported by NOTHING), so the record and its tooth live where the §3 row's adoption lives.
  //
  // THE TERM-BY-TERM SUBJECT MAP, AND THE STIMULUS THAT PROVES EACH KEPT TOOTH STILL BITES
  // (§6.0 clause 2: "the filed arm's term named as superseded beside the re-declared term,
  // never a replacement in place and never a deletion" — every arm below is UNCHANGED in name,
  // count and predicate; the two limbs this pass ADDS ride arm 5 and add no term):
  //   1. clause — the container declaration applied AS A STRING per container. Stimulus: remove
  //      `pane-graph.ts`'s `containerDeclarationFor` call site → `src/shared/container.ts` is
  //      imported by nothing / called by no file → RED.
  //   2. clause — the grid consumes the TRACK tokens, never the raw sizes. Stimulus: point the
  //      grid rule at `--zone-<z>-size`, or drop a zone's track token → RED. Its DRIVEN half
  //      (the §3 row 1 record reaching the grid) reds on: a non-empty zone whose module value
  //      never reaches the sink; a removal while the record holds a non-empty value; and (the
  //      driven anti-vacuity limb) a sink WITHOUT `removeProperty` keeping a stale `0px` after
  //      the zone becomes non-empty. The `''`/`'0px'`/sized write rule is THIS tooth: `'0px'`
  //      (the collapse) must be APPLIED, `''` (the removal path) must be REMOVED, and a sized
  //      member must be WRITTEN — all three graded against the FORK's own record.
  //   3. clause — the stage track written `minmax(0, …)` with the `1fr` weight. Stimulus: drop
  //      either `minmax` or `var(--stage-weight, 1fr)` → RED. Its DRIVEN half (`F6`) reds when
  //      the §3 row 2 projection record is computed and DISCARDED at the write site (`layoutCssVars`
  //      called, its exclusive keys never reaching the sink, no call site removed).
  //   4. clause — the two REGIONS excluded. Stimulus: add `--zone-stage-track`, or an inline
  //      `class="gutter" data-zone="stage"`, or a `[data-zone="stage"]` grid area → RED.
  //   5. clause — the gutters are FOUR ONLY (a four-member `GUTTER_ZONES`, four affordances
  //      PROVIDENT-AUTHORED at the envelope site). Stimulus: (i) leave the four `div.gutter` in
  //      `index.html` and author nothing → the assembly drive reads ZERO → RED with the count;
  //      (ii) author a fifth affordance, or one for a region → RED with the zone set;
  //      (iii) author a wrong `data-axis` vs `gutterAxis(zone)` → RED with the axis reading;
  //      (iv) ⟨ADDED BY THIS PASS, riding this arm⟩ drop the `gutter` CLASS token from the
  //      authored node's own class surface → RED with §3.2's escape named; and (v) the DRIVEN
  //      cursor-declaration pair: the module's own `cursorDeclarationFor` resolution must reach
  //      the affordance element, with its own falsifier DRIVEN INSIDE THE ARM — an axis token the
  //      fork authored no declaration for (`data-axis="diagonal"`) must leave the cursor
  //      UNWRITTEN (the module answers `undefined`; the shell CSS rule stays in force).
  //   6. clause — the C14 tab strip is chrome ABOVE the header zone. Stimulus: move `#tab-strip`
  //      below `<main class="layout">`, or give it a `--zone-…-track` → RED.
  //   7–10. token — per zone: `trackProp` `--zone-<z>-track`, `unit` `px`, `emptyToken` `0px`,
  //      graded against the module's own `trackFor` emission. Stimulus: change any of the three
  //      caller values, or the emitted string → RED.
  //   11. control — no region host is proposed or emulated (`slot-host` imported by nothing, no
  //      allow-list row for it). Stimulus: import `src/shared/slot-host.ts` anywhere under
  //      `src/**`, or add an allow-list row for it/`mount-invariant-guard` → RED.
  //   12. control — the `G-5` FIFTEEN-TOKEN THEME CENSUS unchanged (three blocks, exactly the
  //      pinned fifteen, and no zone/grid token inside them). Stimulus: add, rename, move or drop
  //      a token in `:root`/`html[data-theme='dark']`/the `@media` fallback → RED.
  // THE DECLARED TERMS ARE UNMOVED: `6 + 4 + 2 = 12` (as filed, as re-declared), and the
  // register's total stays `13 + 13 + 13 + 11 + 12 + 14 = 76`. `§6.0` clause 4: a reduced row is
  // REPORTED, never suppressed — nothing is reduced here, so nothing is reported abandoned.
  // ===========================================================================
  const gridText = (): string => readText(INDEX_HTML_PATH)

  /** The `#app > #wiki-root` grid rule's declaration body. */
  function gridRuleBody(): string | null {
    const m = /#app > #wiki-root \{([\s\S]*?)\n {4}\}/.exec(gridText())
    return m === null ? null : m[1]!
  }

  /** The three THEME blocks' custom-property NAMES (the `G-5`/`D-6` census). The blocks
   *  are read STRUCTURALLY (a selector block's own declaration body), with the CSS comments
   *  stripped first — the file's own prose NAMES `html[data-theme='dark']`, so an
   *  un-stripped read would pick the comment up as if it were the selector. */
  function themeBlockTokens(): { root: string[]; dark: string[]; media: string[] } | null {
    const raw = gridText()
    const css = raw.replace(/\/\*[\s\S]*?\*\//g, (c) => ' '.repeat(c.length))
    const bodyOf = (pattern: RegExp): string => {
      const m = pattern.exec(css)
      if (m === null) return ''
      const open = css.indexOf('{', m.index)
      if (open < 0) return ''
      let depth = 0
      for (let i = open; i < css.length; i++) {
        if (css[i] === '{') depth++
        else if (css[i] === '}') {
          depth--
          if (depth === 0) return css.slice(open + 1, i)
        }
      }
      return ''
    }
    const names = (body: string): string[] => [...new Set([...body.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]!))]
    const root = bodyOf(/:root\s*,\s*html\[data-theme='light'\]/)
    const dark = bodyOf(/html\[data-theme='dark'\]/)
    const media = bodyOf(/@media\s*\(prefers-color-scheme:\s*dark\)/)
    if (root === '' || dark === '') return null
    return { root: names(root), dark: names(dark), media: names(media) }
  }

  // -------------------------------------------------------------------------
  // ⟨THE GATE-4 FIX PASS — `F5`: THE MODULE'S RETURNED TOKEN MUST REACH THE GRID.⟩
  //
  // THE OFFENCE: the fork's write site (`SidebarPanes.applyZoneTracks`) computes the
  // record (`zoneTrackVars` — including the vendored `computeTrackVars`' own emitted
  // values) and then, PER ZONE, writes ONLY `'0px'` when the value IS `'0px'` and
  // REMOVES the property OTHERWISE — so for a NON-EMPTY zone the module's own emitted
  // string (e.g. `220px`) is NEVER written: a `getComputedStyle`-class oracle reads the
  // empty string, and on a sink without `removeProperty` a stale `0px` survives a zone
  // becoming non-empty. THE REMOVAL BELONGS ONLY TO THE `''`/absent case (the C11
  // carve-out, whose whole point is that the stylesheet fallback then supplies the
  // persisted size).
  //
  // GRADED BY DRIVING: the fork's OWN write site, through its own `setLayout`, against a
  // recording grid sink (§3 row 1's "write site" policy column; §3 row 2's write target).
  // -------------------------------------------------------------------------
  function gridTrackApplicationOffences(): string[] {
    const offenders: string[] = []
    const drive = gridSinkDrive({ withRemoveProperty: true })
    try {
      drive.host.setLayout(defaultLayout())
      const record = forkRecord(drive.registry, [])
      const nonEmpty = nonEmptyZonesOf(record)
      if (nonEmpty.length === 0) {
        return [
          "the drive has no subject: the fork's own record reports no non-empty zone for a registry carrying one ENABLED app-graph pane placed in `left` (the census source is the caller's fact, D-4)",
        ]
      }
      for (const zone of nonEmpty) {
        const name = `--zone-${zone}-track`
        const applied = drive.writes.filter((write) => write.name === name)
        if (applied.length === 0) {
          offenders.push(
            `the module's own token value for the NON-EMPTY zone ${zone} (${JSON.stringify(record[name])}) never reached the grid: the write site ${
              drive.removals.includes(name) ? `REMOVED ${name} instead` : `wrote nothing for ${name}`
            } — §3 row 1's record value must be APPLIED, and the removal belongs ONLY to the \`''\`/absent case (the C11 carve-out), so a populated zone is left to the stylesheet fallback and a stale value survives any sink without \`removeProperty\``,
          )
        } else if (applied.some((write) => write.value !== record[name])) {
          offenders.push(
            `the grid received ${applied.map((write) => JSON.stringify(write.value)).join(', ')} for ${name}, not the module's own record value ${JSON.stringify(record[name])} (§3 row 1: the record's value IS the token the grid consumes)`,
          )
        }
      }
      for (const removal of drive.removals) {
        const zone = LAYOUT_PANE_ZONES.find((candidate) => removal === `--zone-${candidate}-track`)
        if (zone === undefined) continue
        const value = record[removal]
        if (value !== undefined && value !== '') {
          offenders.push(
            `the write site REMOVED ${removal} while the fork's own record carries the non-empty value ${JSON.stringify(value)} for that zone — the removal is the \`''\`/absent case's treatment ONLY`,
          )
        }
      }
      // THE ANTI-VACUITY GUARD, DRIVEN (and a limb in its own right): the COLLAPSE side of
      // the same clause must still be APPLIED — an empty zone's `emptyToken` reaches the
      // grid — so a sink that receives nothing at all can never make the limbs above hold
      // vacuously.
      const collapsedZones = LAYOUT_PANE_ZONES.filter((zone) => record[`--zone-${zone}-track`] === '0px')
      if (collapsedZones.length === 0) {
        offenders.push(
          "the drive has no subject for the collapse limb: the fork's own record reports no `emptyToken` zone for a registry carrying one enabled pane in `left` (four enumerated zones, three of them empty)",
        )
      }
      for (const zone of collapsedZones) {
        const name = `--zone-${zone}-track`
        const applied = drive.writes.filter((write) => write.name === name)
        if (applied.length !== 1 || applied[0]!.value !== '0px') {
          offenders.push(
            `the EMPTY zone ${zone}'s collapse never reached the grid (the sink recorded ${applied.length === 0 ? 'no write' : applied.map((write) => JSON.stringify(write.value)).join(', ')}) — the census-empty collapse is the one half of §3 row 1's record the write site must apply, and without it the stage reclaims nothing`,
          )
        }
      }
    } finally {
      drive.restore()
    }
    // THE STALE-`0px` ARM: a sink WITHOUT `removeProperty` (a shim `style`, a minimal host
    // surface) must not keep the collapse after the zone becomes non-empty.
    const stale = gridSinkDrive({ withRemoveProperty: false, enableProbe: false })
    try {
      stale.host.setLayout(defaultLayout()) // the probe is DISABLED → `left` is empty
      const collapsedValue = stale.values()['--zone-left-track']
      stale.registry.enable(stale.probeId) // …and now `left` holds an enabled pane
      stale.host.setLayout(defaultLayout())
      const wanted = forkRecord(stale.registry, [])['--zone-left-track']
      const held = stale.values()['--zone-left-track']
      if (wanted !== undefined && wanted !== '0px' && wanted !== '' && held !== wanted) {
        offenders.push(
          `on a grid sink WITHOUT \`removeProperty\` the zone \`left\` kept the STALE ${JSON.stringify(held)} (written while it was empty, ${JSON.stringify(collapsedValue)}) after it became NON-EMPTY — the fork's own record now carries ${JSON.stringify(wanted)}, so the stale collapse survives the zone's repopulation`,
        )
      }
    } finally {
      stale.restore()
    }
    return offenders
  }

  // -------------------------------------------------------------------------
  // ⟨THE GATE-4 FIX PASS — `F6`: THE PROJECTION RECORD MUST BE APPLIED (OR THE DEAD CALL
  // GONE).⟩ `layoutCssVars(base)`'s output is SPREAD INTO THE MAP at the write site and
  // NEVER READ — only `--zone-<z>-track` is iterated — so the four `--zone-<z>-size`,
  // `--stage-weight` and `--top-bar-size` values the §3 row 2 seam produces are computed
  // and DISCARDED there. TWO OUTCOMES ARE ADMISSIBLE and this limb grades WHICHEVER the
  // implementer lands: (A) the projection record is APPLIED at that site (its keys reach
  // the grid sink with the projection's own values), or (B) the call is NOT MADE there (no
  // `layoutCssVars(...)` call site remains in the write site's file). A record that is
  // computed and thrown away satisfies NEITHER.
  // -------------------------------------------------------------------------
  function projectionRecordApplicationOffences(): string[] {
    const drive = gridSinkDrive({ withRemoveProperty: true })
    try {
      const base = defaultLayout()
      drive.host.setLayout(base)
      const projection = layoutCssVars(base)
      const record = forkRecord(drive.registry, [])
      // The projection's OWN keys — the ones the track record does not carry (so a limb
      // can never be satisfied by the record's own `--stage-weight`).
      const exclusive = Object.keys(projection).filter((key) => !(key in record))
      const applied = exclusive.filter((key) =>
        drive.writes.some((write) => write.name === key && write.value === projection[key]),
      )
      const callSites = [...codeOf(SIDEBAR_PANES_PATH).matchAll(/layoutCssVars\s*\(/g)].length
      if (applied.length === 0 && callSites > 0) {
        return [
          `the §3 row 2 projection record is COMPUTED AND DISCARDED at the write site: \`layoutCssVars(...)\` is called ${callSites} time(s) in src/renderer/sidebar-panes.ts, its own key(s) [${exclusive.join(', ')}] never reach the grid sink, and no call site was removed — the two admissible outcomes are (A) APPLY the record at that site, or (B) do NOT make the call there; a record computed and thrown away is neither`,
        ]
      }
      return []
    } finally {
      drive.restore()
    }
  }

  // -------------------------------------------------------------------------
  // ⟨THE GATE-4 FIX PASS — `F8`: THE CURSOR-DECLARATION CONSUMPTION, DRIVEN.⟩
  // `renderer.ts`'s `applyGutterCursorDeclaration` + the module call
  // (`cursorDeclarationFor`) is §3 row 5's `cursorOf`/`applyCursor` seam pair, and GATE 4
  // found it exercised by NO suite. This limb drives the REAL wiring
  // (`installShellPointers` → its delegated `pointerdown` → the resolution → the write)
  // and grades that the module's RESOLVED declaration TEXT reaches the affordance
  // element's own cursor declaration, for BOTH axis tokens (`columns` / `rows` — the
  // shell's own vocabulary, §3.2). The shell's CSS cursor rules stay the primary path.
  // -------------------------------------------------------------------------
  function cursorDeclarationOffences(): string[] {
    const offenders: string[] = []
    const axes: Array<[LayoutZoneName, string, string]> = [
      ['left', 'columns', 'col-resize'],
      ['header', 'rows', 'row-resize'],
    ]
    for (const [zone, axis, declaration] of axes) {
      const drive = shellGestureDrive({ zone, axis })
      try {
        drive.fire('pointerdown', { pointerId: 7, clientX: 300, clientY: 120 })
        // THE SUBJECT GUARD: the drive must have ROUTED, or the limb grades nothing.
        if (drive.starts.length === 0) {
          return [
            `the drive has no subject for the ${axis} affordance: a dispatched \`pointerdown\` did not reach the fork's establishment path, so the cursor declaration's consumption cannot be graded`,
          ]
        }
        const applied = (drive.gutter.style as unknown as Record<string, unknown>)['cursor']
        const expected = cursorDeclarationFor({ cursor: declaration })
        if (expected !== declaration) {
          return [
            `the vendored \`cursorDeclarationFor({ cursor: ${JSON.stringify(declaration)} })\` resolved ${JSON.stringify(expected)} — the module's own resolution is the fork's ` +
              `\`cursorOf\` seam and §3 row 5 requires the DECLARATION text to be the caller's vocabulary`,
          ]
        }
        if (applied !== expected) {
          offenders.push(
            `${zone}'s affordance (data-axis=${JSON.stringify(axis)}) carries the cursor declaration ${JSON.stringify(applied)} after the real wiring resolved it, not the module's own resolved text ${JSON.stringify(expected)} — §3 row 5's \`applyCursor\` seam (the fork's cursor write) is not reached, so the module's returned string is consumed by nobody`,
          )
        }
      } finally {
        drive.restore()
      }
    }
    // THE FALSIFIER THAT PROVES THE DRIVE OBSERVES THE WRITE: an axis token the fork
    // authored NO declaration for must leave the element's cursor UNWRITTEN (the module
    // resolves `undefined` and the shell CSS rule stays in force) — so the positive limb
    // above is not satisfied by a drive that writes unconditionally.
    const unknownDrive = shellGestureDrive({ zone: 'left', axis: 'diagonal' })
    try {
      unknownDrive.fire('pointerdown', { pointerId: 7, clientX: 300, clientY: 120 })
      if (unknownDrive.starts.length === 0) {
        return [
          'the falsifier has no subject: the unknown-axis drive never reached the fork\u2019s establishment path',
        ]
      }
      const strayed = (unknownDrive.gutter.style as unknown as Record<string, unknown>)['cursor']
      if (strayed !== undefined) {
        offenders.push(
          `an axis token the fork authored NO declaration for (\`data-axis="diagonal"\`) left the element's cursor declaration at ${JSON.stringify(strayed)} — the module resolves \`undefined\` for an unknown token and the fork must INVENT NO DEFAULT (§3 row 5's \`cursorOf\` seam: the declaration text is the caller's, and absence is the declared degradation)`,
        )
      }
    } finally {
      unknownDrive.restore()
    }
    return offenders
  }

  const arms: Arm[] = [
    {
      name: 'clause — every zone container carries containerDeclarationFor returned text, applied AS A STRING, per container',
      check: () => {
        const vendoredText = containerDeclarationFor('zone-probe').declaration
        if (vendoredText !== 'contain: layout style paint') return `the vendored declaration text reads ${vendoredText} — the module opaque constant moved`
        const importers = importersOf('container')
        const callers = codeOfAllSrc().filter((c) => mentionsSymbol(c.code, 'containerDeclarationFor') || /\.declaration\b/.test(c.code))
        if (importers.length === 0 || callers.length === 0) {
          return `the declaration is NOT applied anywhere under src: src/shared/container.ts is imported by ${
            importers.length === 0 ? 'NOTHING' : importers.map((i) => i.file).join(', ')
          }, and no file calls containerDeclarationFor (§4 item (iv): this is the ONE foundation element of the family this unit uses, applied per zone container at the unit own write site)`
        }
        return null
      },
    },
    {
      name: 'clause — the grid consumes the TRACK tokens for the four zones (never the raw sizes)',
      check: () => {
        const body = gridRuleBody()
        if (body === null) return 'the #app > #wiki-root grid rule is absent — the grid declaration clauses cannot be read'
        const missing = LAYOUT_PANE_ZONES.filter((z) => !body.includes(`--zone-${z}-track`))
        if (missing.length > 0) return `the grid rule does not consume the track token(s) ${missing.map((z) => `--zone-${z}-track`).join(', ')}`
        const rawSizes = LAYOUT_PANE_ZONES.filter((z) =>
          new RegExp(`grid-template-(columns|rows):[^;]*var\\(--zone-${z}-size`).test(body),
        )
        if (rawSizes.length > 0) {
          return `the grid consumes the RAW size token(s) ${rawSizes.map((z) => `--zone-${z}-size`).join(', ')} instead of the track token`
        }
        // ⟨THE GATE-4 FIX PASS — `F5`, RIDING THIS ARM (`RCA-8(c)`: the `index.html` clause
        //   above is KEPT; the WRITE-SITE half of the SAME clause — the grid CONSUMING the
        //   module's track token at the JS write path — is driven beside it).⟩
        const writeSiteOffences = gridTrackApplicationOffences()
        if (writeSiteOffences.length > 0) return writeSiteOffences.join(' | ')
        return null
      },
    },
    {
      name: 'clause — the stage track is written minmax(0, ...) with the 1fr weight (point (c))',
      check: () => {
        const body = gridRuleBody()
        if (body === null) return 'the grid rule is absent'
        if (!/minmax\(0,\s*var\(--stage-weight,\s*1fr\)\)/.test(body)) {
          return 'the stage track is not minmax(0, var(--stage-weight, 1fr)) — a collapsed track without the 1fr stage track reclaims nothing (defect EMPTY-ZONE-TRACK-NOT-COLLAPSED own cause)'
        }
        if (!/grid-template-rows:[^;]*minmax\(0,\s*1fr\)/.test(body)) return 'the rows template carries no minmax(0, 1fr) middle row'
        if (!/grid-template-columns:[^;]*minmax\(0,\s*var\(--stage-weight/.test(body)) {
          return 'the columns template carries no minmax(0, var(--stage-weight ...)) middle column'
        }
        // ⟨THE GATE-4 FIX PASS — `F6`, RIDING THIS ARM (`RCA-8(c)`: the `index.html` clause
        //   above is KEPT; the stage's `--stage-weight` is ALSO a §3 row 2 PROJECTION key,
        //   so the projection record's fate at the write site is driven beside it).⟩
        const projectionOffences = projectionRecordApplicationOffences()
        if (projectionOffences.length > 0) return projectionOffences.join(' | ')
        return null
      },
    },
    {
      name: 'clause — the two REGIONS are excluded: no region track token, no region pane area, no region gutter',
      check: () => {
        const allCode = codeOfAllSrc()
          .map((c) => c.code)
          .join('\n')
        const badTokens = ['--zone-stage-track', '--zone-top-bar-track'].filter((t) => allCode.includes(t) || gridText().includes(t))
        if (badTokens.length > 0) {
          return `region track token(s) ${badTokens.join(', ')} exist — §2 point (g)/D-5: a region token goes through the projection path, NEVER through the census record`
        }
        const regionGutters = [...gridText().matchAll(/class="gutter" data-zone="(stage|top-bar)"/g)].map((m) => m[1]!)
        if (regionGutters.length > 0) return `gutter(s) exist for the region(s) ${regionGutters.join(', ')} — GUTTER_ZONES has four members, not six`
        const regionAreas = [...gridText().matchAll(/\[data-zone="(stage|top-bar)"\]\s*\{/g)].map((m) => m[1]!)
        if (regionAreas.length > 0) return `a grid AREA is declared for the region(s) ${regionAreas.join(', ')} — regions are not pane zones (R-9)`
        return null
      },
    },
    {
      name: 'clause — the gutters are FOUR ONLY (a four-member GUTTER_ZONES, four affordances PROVIDENT-AUTHORED at the envelope site and driven through the producing graph)',
      // ⟨`PD-UI-14` REMAND `2026-10-04` — CLAUSE #6 RE-POINTED, `RCA-8(c)`: the as-filed
      //   reading is kept VISIBLE above the new site (see the SUPERSEDED block at this
      //   file's affordance reader). The contract's §3 row 5 fixes the SITE: the four
      //   affordances are authored as ENVELOPE DATA (provident-authored), never as
      //   host-authored DOM — and `index.html` is the file the markup is LEAVING, so a
      //   source census of it can never hold the count FOUR. The three teeth are KEPT and
      //   are driven by the named mutations recorded in the red-set report:
      //     (a) the markup stays host-authored in `index.html`  → limb 1 reds (no
      //         affordance is authored as envelope data at all);
      //     (b) fewer or more than four affordances are authored → limb 1 reds with the count;
      //     (c) an affordance carries the wrong zone              → limb 2 reds with the zone set.
      //   ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: limbs 1–3 (and the `F8` cursor
      //   pair) are KEPT EXACTLY as the remand left them; limb 4 (the §3.2 `gutter` class token,
      //   with its driven vacuity guard) is ADDED, riding this arm, so the re-declared subject's
      //   §3.2 clause is inhabited rather than only declared. Its stimulus: (d) drop the `gutter`
      //   class token from the authored node's own class surface → limb 4 reds with §3.2's escape
      //   named. NO arm is retitled, no predicate relaxed and no declared term added.⟩
      //   The SHELL half of the row stays where §2.1(e) puts it: the cursor DECLARATION
      //   is SHELL CSS and is asserted as SOURCE TEXT elsewhere in this suite (§2.2 — a
      //   SHELL clause is never asserted as layout).⟩
      check: () => {
        const gutterZones = /export const GUTTER_ZONES: readonly LayoutZoneName\[\] = \[([^\]]*)\]/.exec(codeOf(PANE_GUTTER_PATH))
        if (gutterZones === null) return 'GUTTER_ZONES is absent from pane-gutter.ts'
        const names = [...gutterZones[1]!.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]!)
        if (names.join(',') !== LAYOUT_PANE_ZONES.join(',')) {
          return `GUTTER_ZONES is [${names.join(',')}], not the four pane zones [${LAYOUT_PANE_ZONES.join(',')}]`
        }
        // LIMB 1 — the FOUR affordances, authored as ENVELOPE DATA and driven through the
        // producing graph. A host-authored `div.gutter` in `index.html` is INVISIBLE to
        // this drive, so it reads ZERO and reds (direction (a)); a fifth affordance, or a
        // missing one, reds on the count (direction (b)).
        const authored = authoredAffordancesFromAssembly()
        if (authored.length !== 4) {
          return (
            `the PRODUCING GRAPH authors ${authored.length} gutter affordance(s) ` +
            `[${authored.map((a) => `${a.zone}/${a.axis}`).join(', ')}] — §3 row 5 makes the four affordances ` +
            `PROVIDENT-AUTHORED envelope data driven through the producing graph at the authoring site ` +
            `(src/renderer/pane-graph.ts), and §4 item (viii)/§2 point (g) allow exactly the four pane zones. ` +
            `A host-authored div.gutter in src/renderer/index.html is the file the markup is LEAVING and ` +
            `cannot be driven here (row 1 witness #5 requires ZERO inline gutters there).`
          )
        }
        // LIMB 2 — the ZONE IDENTITY: one affordance per `LAYOUT_PANE_ZONES` member, and no
        // member of the two REGIONS (`R-9`: `stage`/`top-bar` are regions, never pane zones).
        const zones = authored.map((a) => a.zone).sort()
        if (zones.join(',') !== LAYOUT_PANE_ZONES.slice().sort().join(',')) {
          return `the authored affordances carry the zones [${zones.join(',')}] — §4 item (viii)/§2 point (g) allow exactly the four pane zones [${LAYOUT_PANE_ZONES.slice().sort().join(',')}], and ` +
            `R-9 excludes the two regions (a gutter for stage/top-bar is a FIFTH/SIXTH zone by the back door)`
        }
        // LIMB 3 — the AXIS IDENTITY the vendored affordance family's `axisOf` seam needs:
        // the fork's own `gutterAxis` mapping is the authority, never a second literal map.
        const wrongAxis = authored.filter((a) => a.axis !== gutterAxis(a.zone))
        if (wrongAxis.length > 0) {
          return `the authored affordance(s) ${wrongAxis
            .map((a) => `${a.zone} (data-axis ${a.axis}, gutterAxis reads ${gutterAxis(a.zone)})`)
            .join(', ')} carry the wrong axis — §3 row 5's eleven seams include axisOf ← gutterAxis`
        }
        // ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: LIMB 4 — §3.2'S CLASS HALF,
        //   RIDING THIS ARM (`§6.0` clause 2: a limb rides an EXISTING named arm, so NO declared
        //   term is added and the arithmetic is UNMOVED). The re-declared subject names the four
        //   authored affordances WITH their §3.2 clauses, and of §3.2's three vocabulary tokens
        //   only `data-zone`/`data-axis` had a tooth (limbs 1–3); the `gutter` CLASS token — the
        //   one `GESTURE_SELECTOR` and the two cursor rules both match — had none, so a landing
        //   could drop it with every suite still green. The limb carries its own driven vacuity
        //   guard.⟩
        const vocabularyOffences = affordanceVocabularyOffences(authored)
        if (vocabularyOffences.length > 0) return vocabularyOffences.join(' | ')
        // ⟨THE GATE-4 FIX PASS — `F8`, RIDING THIS ARM (`RCA-8(c)`: the three authored-
        //   affordance limbs above are KEPT; the §3 row 5 `cursorOf`/`applyCursor` seam
        //   pair — the module's returned declaration reaching the affordance element — is
        //   driven beside them, because GATE 4 found it exercised by NO suite).⟩
        const cursorOffences = cursorDeclarationOffences()
        if (cursorOffences.length > 0) return cursorOffences.join(' | ')
        return null
      },
    },
    {
      name: 'clause — the C14 tab strip is chrome ABOVE the header zone (not a fifth zone, no track)',
      check: () => {
        const html = gridText()
        const strip = html.indexOf('id="tab-strip"')
        const layout = html.indexOf('<main class="layout">')
        if (strip < 0) return 'the #tab-strip element is absent'
        if (layout < 0) return 'the main.layout element is absent'
        if (strip > layout) {
          return 'the tab strip is INSIDE the layout region — §2 point (g): the tab strip is chrome ABOVE the header zone, not a fifth zone'
        }
        if (/--zone-(tab-strip|top-bar)-track/.test(html)) return 'the tab strip gained a zone track'
        return null
      },
    },
    ...LAYOUT_PANE_ZONES.map((zone) => ({
      name: `token — the caller TrackSpec for ${zone} is trackProp --zone-${zone}-track, unit px, emptyToken 0px`,
      check: () => {
        const spec = specOfMap()[zone]!
        if (spec.trackProp !== `--zone-${zone}-track`) return `the caller trackProp for ${zone} is ${spec.trackProp}`
        if (spec.unit !== 'px') return `the caller unit for ${zone} is ${spec.unit}, not px`
        if (spec.emptyToken !== '0px') return `the caller emptyToken for ${zone} is ${spec.emptyToken}, not 0px`
        const emitted = vendoredTrackFor(spec, DEFAULT_LAYOUT.zones[zone].size, false)
        if (emitted !== `${DEFAULT_LAYOUT.zones[zone].size}px`) return `the token emitted for ${zone} is ${emitted}`
        return null
      },
    })),
    {
      name: 'control — no region host is proposed or emulated (R-8; slot-host is NOT adopted)',
      check: () => {
        const importers = importersOf('slot-host')
        if (importers.length > 0) {
          return `src/shared/slot-host.ts is imported by ${importers.map((i) => i.file).join(', ')} — §3.1/§4 item (iv) make it an explicit NON-adoption, and R-8 forbids an emulated region host`
        }
        const slotRows = declaredConsumerEdgesFromPin().filter((d) => d.member === 'slot-host' || d.member === 'mount-invariant-guard')
        if (slotRows.length > 0) return `the allow-list declares a row for the NON-adopted module(s) ${slotRows.map((r) => r.member).join(', ')}`
        return null
      },
    },
    {
      name: 'control — the three THEME blocks fifteen-token census is unchanged (G-5 / D-6)',
      check: () => {
        const blocks = themeBlockTokens()
        if (blocks === null) return 'the three THEME blocks are not readable in index.html — the G-5 census cannot be taken'
        const expected = [...PINNED_TOKENS].sort().join(',')
        const labelled: Array<[string, string[]]> = [
          [':root/light', blocks.root],
          ["html[data-theme='dark']", blocks.dark],
          ['@media fallback', blocks.media],
        ]
        for (const [label, names] of labelled) {
          if (names.slice().sort().join(',') !== expected) {
            return `the ${label} block declares [${names.slice().sort().join(',')}] (${names.length}), not the pinned fifteen`
          }
        }
        const zoneTokensInTheme = [...blocks.root, ...blocks.dark, ...blocks.media].filter(
          (t) => t.startsWith('--zone-') || t === '--stage-weight' || t === '--top-bar-size',
        )
        if (zoneTokensInTheme.length > 0) {
          return `zone/grid token(s) ${zoneTokensInTheme.join(', ')} are declared INSIDE the theme blocks — §5 G-5 requires them on the grid element, never inside those blocks`
        }
        return null
      },
    },
  ]

  it('P-TP-zone-repl-5 — the six shell-clause assertions, the four zone tokens and the two controls (12)', () => {
    runRow('P-TP-zone-repl-5', arms)
  })
})

// ===========================================================================
// §6 ROW 6 — `P-TP-zone-repl-6` · `strat:zone-replacement-vendored-bytes-unmoved`
// THE BYTE-IDENTITY PROPERTY OF THE ADOPTED SET: for every adopted module its working
// bytes' md5 equals the manifest's declared value; the manifest's module set is unchanged;
// and the four divergent baseline files do not appear in the manifest's module set.
//
// ⟨THE DECLINE-RECORDING PASS `2026-10-04` — `RCA-8(c)`: **NO RE-DECLARATION IS OWED HERE, AND
// THIS PASS INVENTED NONE — SAID PLAINLY, WITH THE READING THAT SHOWS IT.**⟩
//   · WHAT §6 DECLARES FOR THIS ROW (the authority, read at `§6`'s table): the row's subject is
//     *"THE BYTE-IDENTITY PROPERTY OF THE ADOPTED SET. ∀ adopted module: its working bytes' md5
//     equals the manifest's declared value; the manifest's module set is unchanged; and the four
//     divergent baseline files do not appear in the manifest's module set"*, with the terms
//     `8 (adopted modules byte-identical) + 1 (the manifest set unchanged) + 4 (baseline files
//     unreplaced) + 1 (a control that reds on a one-byte mutation of a synthetic copy) = 14`.
//     THE READING THAT SHOWS NO MOVE IS OWED: **not one of those fourteen terms names
//     `createRelocateSession`, its seven seams, or any other member §3.6.1 re-declares** — the
//     row's whole subject is a DIGEST COMPARISON over the manifest's module set, which the
//     decline does not touch. `§6.0` clause 1 re-declares the subjects "to the landed members the
//     architect's ruling names ... and NOTHING WIDER"; a subject the ruling does not name would be
//     exactly the "wider" that clause forbids, so a re-declaration here would be an invented one.
//   · WHY THE DECLINE CANNOT MOVE THE SET EITHER (§3.6.1/§3.6.2's own words): *"the two modules'
//     OTHER members landed ... so what stays unimported is the two FACTORIES, not the two
//     modules."* `relocate.ts` and `gutter-affordance.ts` therefore REMAIN two of the eight
//     adopted modules — the comparator (`withinProximity` through the fork's own
//     `measuresWithinSnapThreshold`) and the source/cursor halves (`domEventSource`,
//     `cursorDeclarationFor`) are the adopted members that keep them in the set — so the eight
//     byte-identity terms, the manifest-set term and the four baseline terms are all unmoved, and
//     the one-byte mutation control is unmoved with them.
//   · THE DECLINE'S CONSEQUENCE, RECORDED WHERE THIS FILE RECORDS ROW-LEVEL PROVENANCE (§4.0(1);
//     §3.6.1): **`createRelocateSession` IS IMPORTED BY NOTHING.** The records are (1) the
//     `ADOPTIONS` table's row 6 — `declinedFactory: { module: 'relocate', factory:
//     'createRelocateSession', seams: [the seven] }`, with the filed member list kept VISIBLE
//     above it as `SUPERSEDED` — and (2) the WITNESS this pass adds: the limb on ROW 1's row-6
//     adoption arm (`declinedFactoryOffences`, with its own driven vacuity guard), which reds if
//     any consumer file under `src/**` names the declined factory. THE LANDED HALF IS RECORDED
//     BESIDE IT: `withinProximity` via `measuresWithinSnapThreshold`, the `distance` seam
//     `distanceToZoneBox`, and the four named suppliers `legalZonesForScope` /
//     `insertionIndexForPoint` / `createDragController` / `setZoneMinimized`.
//   · THE ARITHMETIC: this row's terms are `14` BEFORE and `14` AFTER (`8 + 1 + 4 + 1`), and the
//     register's total is `76` before and after. NO TERM IS ADDED FOR THE DECLINE — the decline
//     IS recorded, at the three sites above — and the figure the contract declares for this row
//     is UNMOVED, exactly as `§6.0` clause 3 requires ("the arithmetic moves only by that
//     recorded re-declaration", and there is nothing here to re-declare).
// ===========================================================================
describe('§6 P-TP-zone-repl-6 — the vendored bytes unmoved (strat:zone-replacement-vendored-bytes-unmoved)', () => {
  interface ManifestModule {
    name: string
    vendored: string
    md5: string
  }
  interface Manifest {
    foundation: { commit: string }
    modules: ManifestModule[]
    moduleCount: number
    baselineFilesNotReplaced?: unknown
  }

  function manifest(): Manifest {
    expect(existsSync(MANIFEST_PATH), `RED: the manifest ${MANIFEST_PATH} is absent`).toBe(true)
    return JSON.parse(readText(MANIFEST_PATH)) as Manifest
  }

  const ADOPTED_EIGHT = ['census', 'zones', 'layout-projection', 'gutter', 'gesture-session', 'gutter-affordance', 'relocate', 'container']
  const BASELINE_FOUR = ['dom-shim', 'types', 'demo-envelope', 'path-fork-cycle']

  const arms: Arm[] = [
    ...ADOPTED_EIGHT.map((name) => ({
      name: `bytes — src/shared/${name}.ts equals the manifest declared md5`,
      check: () => {
        const entry = manifest().modules.find((m) => m.name === name)
        if (entry === undefined) return `the manifest declares no module named ${name}`
        const path = join(REPO_ROOT, 'src', 'shared', `${name}.ts`)
        if (!existsSync(path)) return `${path} does not exist — the adopted module cannot be byte-identical`
        const actual = md5(readFileSync(path))
        if (actual !== entry.md5) {
          return `src/shared/${name}.ts reads md5 ${actual}, the manifest declares ${entry.md5} — a vendored byte moved (G-1: a module whose bytes would need to change is a SURFACED item, never an edit)`
        }
        return null
      },
    })),
    {
      name: 'set — the manifest module set is still the pinned fifteen',
      check: () => {
        const m = manifest()
        const names = m.modules.map((x) => x.name).sort()
        if (names.join(',') !== PINNED_FIFTEEN.slice().sort().join(',')) return `the manifest module set is [${names.join(',')}], not the pin fifteen`
        if (m.moduleCount !== PINNED_FIFTEEN.length) return `the manifest moduleCount is ${m.moduleCount}, not ${PINNED_FIFTEEN.length}`
        if (m.foundation.commit !== PINNED_COMMIT) return `the manifest pins commit ${m.foundation.commit}, the set pin reads ${PINNED_COMMIT}`
        return null
      },
    },
    ...BASELINE_FOUR.map((name) => ({
      name: `baseline — ${name} does not appear in the manifest module set (R-7)`,
      check: () => {
        const m = manifest()
        if (m.modules.some((x) => x.name === name)) {
          return `${name} appears in the manifest module set — R-7: the four divergent baseline files are NEVER replaced`
        }
        const path = join(REPO_ROOT, 'src', 'shared', `${name}.ts`)
        if (!existsSync(path)) return `${path} is absent — a baseline file was replaced or removed`
        if (m.baselineFilesNotReplaced === undefined) return 'the manifest no longer records baselineFilesNotReplaced'
        return null
      },
    })),
    {
      name: 'control — a ONE-BYTE mutation of a synthetic copy reds the md5 comparison',
      check: () => {
        const name = ADOPTED_EIGHT[lcgDraw(REGISTER_SEED, ADOPTED_EIGHT.length).index]!
        const entry = manifest().modules.find((x) => x.name === name)
        if (entry === undefined) return `the control subject ${name} is not a manifest module`
        const bytes = readFileSync(join(REPO_ROOT, 'src', 'shared', `${name}.ts`))
        const posDraw = lcgDraw(REGISTER_SEED, bytes.length)
        const mutated = Buffer.from(bytes)
        mutated[posDraw.index] = (mutated[posDraw.index]! ^ 0x01) & 0xff
        if (mutated.equals(bytes)) return `the LCG draw at ${posDraw.index} was the identity — the control has no subject`
        if (md5(mutated) === entry.md5) return `a ONE-BYTE mutation of ${name} at byte ${posDraw.index} still reads the declared md5 — the comparison is vacuous`
        return null
      },
    },
  ]

  it('P-TP-zone-repl-6 — the eight adopted modules bytes, the manifest set, the four baseline files and the mutation control (14)', () => {
    runRow('P-TP-zone-repl-6', arms)
  })
})

// ===========================================================================
// THE REGISTER'S OWN SELF-CHECKS — the declaration, not a limb of any row: the six rows,
// their declared sums and the contract's own printed arithmetic, the strategy ids, the
// seed, and the "no F- row / no FS-n citation inside the register" clause.
// ===========================================================================
describe('§6 — the register declaration (six rows, the printed arithmetic, the seed, the caps)', () => {
  it('§6 — six rows in register order, each with its declared strat id and its declared-term sum, and the printed arithmetic 13 + 13 + 13 + 11 + 12 + 14 = 76', () => {
    expect(DECLARED_REGISTER.length, '§6: the register is SIX rows — under the 8-row cap').toBe(6)
    expect(DECLARED_REGISTER.map((r) => r.row)).toEqual([
      'P-IM-zone-repl-1',
      'P-IM-zone-repl-2',
      'P-SM-zone-repl-3',
      'P-SM-zone-repl-4',
      'P-TP-zone-repl-5',
      'P-TP-zone-repl-6',
    ])
    for (const r of DECLARED_REGISTER) {
      expect(r.strategyId, `§6: the ${r.row} strategy id is declared by the contract`).toMatch(/^strat:zone-replacement-[a-z-]+$/)
      expect(r.row, '§6: every row id is TOKEN-QUALIFIED (P-<IM|SM|TP>-zone-repl-N)').toMatch(/^P-(IM|SM|TP)-zone-repl-[1-6]$/)
    }
    expect(DECLARED_REGISTER.map((r) => r.declaredTotal)).toEqual([13, 13, 13, 11, 12, 14])
    expect(DECLARED_REGISTER.reduce((sum, r) => sum + r.declaredTotal, 0), '§6: 13 + 13 + 13 + 11 + 12 + 14 = 76').toBe(76)
    expect(
      REGISTER_SEED,
      '§6: the seed is the fixed literal 0x20261004 — never Date.now(), never Math.random(), never an environment read',
    ).toBe(0x20261004)
    expect(
      SEED_RE_TAKEN_ON,
      'O-11: the seed literal is re-taken ONLY when the run day differs from 2026-10-04; a re-take is a VISIBLE decision, never a quiet edit',
    ).toBeNull()
    let state = REGISTER_SEED >>> 0
    const draws = [0, 1, 2].map(() => {
      const d = lcgDraw(state, 15)
      state = d.state
      return d.index
    })
    expect(
      draws.every((i) => Number.isInteger(i) && i >= 0 && i < 15),
      '§6: index = state(n+1) mod pool.length',
    ).toBe(true)
    expect(new Set(draws).size, '§6: the LCG must not collapse to a constant').toBeGreaterThan(1)
    expect(CAPS.perRow).toBe(100)
    expect(CAPS.total).toBe(400)
    expect(STOP_AFTER).toBe(5)
    const registerText = readText(fileURLToPath(import.meta.url))
    const declaredBlock = registerText.slice(registerText.indexOf('const DECLARED_REGISTER'), registerText.indexOf('function runRow'))
    expect(declaredBlock, '§6: the register carries NO F- row').not.toMatch(/'F-[0-9]/)
    expect(declaredBlock, '§6: the register carries no FS-n citation').not.toMatch(/FS-[0-9]/)
  })

  it('§5 G-7 / O-8 — the LANDING pin: `UNTOUCHED_DIGESTS` is READ for its shape only (seven rows, exactly ONE `sidebar-panes.ts` row) and is NEVER edited or pre-empted here', () => {
    const rows = untouchedDigestsFromPin()
    expect(rows.length, 'G-7: the `UNTOUCHED_DIGESTS` table carries SEVEN md5-pinned paths').toBe(7)
    expect(rows.every((r) => r.md5 !== ''), 'G-7: every row still carries a recorded md5 (the landing RE-STATES one row and deletes none)').toBe(true)
    const sidebarRows = rows.filter((r) => r.file === 'src/renderer/sidebar-panes.ts')
    expect(sidebarRows.length, 'G-7/O-8: exactly ONE `sidebar-panes.ts` row — the one this unit\u2019s landing re-states').toBe(1)
    // This suite encodes NO landing value: it asserts the SHAPE, so a re-statement by the
    // landing (superseded value kept visible beside the new one, unit named) stays admissible.
    expect(
      Object.prototype.hasOwnProperty.call(sidebarRows[0], 'md5'),
      'G-7: the `sidebar-panes.ts` row records a digest this suite never writes',
    ).toBe(true)
  })

  it('§6 — THE REGISTER REPORT: every row reported held/broken with its strat id, its declared-vs-executed term, its stoppedAt, its counterexamples and its ABANDONED arms (a report, never a silent pass)', () => {
    expect(REPORTS.length, 'every one of the six rows must have run').toBe(6)
    expect(TOTAL_ATTEMPTS, '§6 cap: at most 400 attempts in total').toBeLessThanOrEqual(CAPS.total)
    for (const r of REPORTS) {
      expect(r.executed, `${r.row}: §6 cap — at most 100 attempts per row`).toBeLessThanOrEqual(CAPS.perRow)
      expect(r.limbs.length, `${r.row}: every DRIVEN attempt is recorded`).toBe(r.executed)
      expect(r.arms.length, `${r.row}: every declared arm is recorded in declared order`).toBe(r.declaredTotal)
      const abandoned = r.arms.filter((a) => !a.driven)
      console.log(
        `[ZONE-REPLACEMENT REGISTER] ${r.row} · ${r.strategyId} · ${r.held ? 'held' : 'broken'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · stoppedAt ${String(r.stoppedAt)} · counterexamples ${r.counterexamples.length} · abandoned ${abandoned.length}` +
          (abandoned.length > 0 ? ` [${abandoned.map((a) => `${a.index}:${a.name}`).join(' | ')}]` : ''),
      )
      for (const ce of r.counterexamples) console.log(`[ZONE-REPLACEMENT REGISTER] ${r.row} offence: ${ce}`)
      if (r.stoppedAt !== null) {
        expect(abandoned.length, `${r.row}: a row that stopped reports its ABANDONED arms through stoppedAt (never hidden)`).toBeGreaterThan(0)
      }
    }
    // ⟨SUPERSEDED IN PLACE `2026-10-04` — `RCA-8(c)`: the as-filed assertion is KEPT
    //   VISIBLE here, NEVER deleted, and is NOT the target this suite asserts any more.⟩
    //
    // AS FILED (verbatim, the filing pass's own reading):
    //   const red = REPORTS.filter((r) => !r.held)
    //   expect(red.length, 'the contract own reading: the adoption is NOT landed, so the
    //     adoption rows are BROKEN').toBeGreaterThan(0)
    //
    // WHY IT WAS WRONG (the SECOND DEFECT, independent of the clause-#6 re-point): it
    //   HARD-CODES THE RED STATE. The unit's TARGET is the OPPOSITE reading — all six rows
    //   HELD, every declared term executed (76 in total) and no `stoppedAt` abandonment —
    //   so once the implementation lands, six held rows give `red.length === 0` and this
    //   assertion FAILS BY CONSTRUCTION. A test that must fail when the unit succeeds is
    //   not a fail-safe arm; it is a red-state claim wearing an assertion's clothes. The
    //   red-state OBSERVATION belongs to the TestWriter's RED-SET report, not to an
    //   assertion that must survive the implementation.
    //
    // THE GREEN-STATE TARGET THAT REPLACES IT is below: the register REPORTS all six rows,
    //   each reporting its `strat:` id / its declared-vs-executed term / its `stoppedAt` /
    //   its counterexamples, the arithmetic prints 76, and EVERY row is HELD with no
    //   abandonment. The arms' own teeth are unchanged and live one level up, in each row's
    //   `runRow` — every row's `held` is already asserted TRUE at its own site, so a red row
    //   still reds loudly; this row asserts the report's SHAPE plus the green-state target.
    const red = REPORTS.filter((r) => !r.held)
    expect(
      REGISTER_DECLARED_TOTAL,
      '§6: the declared arithmetic prints 13 + 13 + 13 + 11 + 12 + 14 = 76 — the declared term is NEVER reduced',
    ).toBe(76)
    expect(
      REPORTS.map((r) => r.declaredTotal).reduce((sum, n) => sum + n, 0),
      '§6: the EXECUTED register prints the same 76 — a declared row reduced to match what ran is a review finding',
    ).toBe(76)
    expect(
      red.length,
      `§6 — THE GREEN-STATE TARGET: the six rows are HELD with every declared term executed and no ` +
        `stoppedAt abandonment; broken row(s): ${red.map((r) => `${r.row}(${String(r.stoppedAt)})`).join(', ')}`,
    ).toBe(0)
    for (const r of REPORTS) {
      expect(r.stoppedAt, `${r.row}: a HELD row abandons NO declared arm — §6 STOP AFTER 5 CONSECUTIVE FAILURES`).toBeNull()
      expect(r.executed, `${r.row}: every declared term is EXECUTED (declared ${r.declaredTotal})`).toBe(r.declaredTotal)
      expect(r.strategyId, `${r.row}: the row reports its declared strat id`).toMatch(/^strat:zone-replacement-[a-z-]+$/)
      expect(r.declared, `${r.row}: the row reports its DECLARED term as the sum of its own factors`).toContain('+')
      expect(r.counterexamples, `${r.row}: a HELD row reports zero counterexamples`).toHaveLength(0)
    }
  })
})
