# foundation import — critique review (2026-11-15, `role_l0_critique`, read-only, ADJUDICATION)

Independent of the validity review (neither saw the other). Verdict: **ADJUDICATION** — the four-surface split is a
**scope** split and names no admitted unit, so no red set can be run; and three surfaces move domains that landed
specs, registers and the MCP target vocabulary already pin (`decisions.md` D-13, D-14).

**Headline: the cost driver is (c), by an order.** (a) is cheap but not free; (b) supplies no evidence by
construction; (d) is not additive at all — the foundation *deleted* the store the fork is mid-adoption of.

| Finding | Source | Sev |
|---|---|---|
| (a) re-points a **second blob oracle** to a revision where its subject is **gone**: the foundation's `store-core-graph.ts`/`store-graph-references.ts` do not exist at the head (a tombstone docblock records where each went) | foundation `src/renderer/renderer.ts:331-351`; fork `tests/pd-store-core-adopt.test.ts:234` | blocking |
| …and it fails **silently**: a failed `git show` returns `SKIPPED`, and only `status==='RED'` counts as a problem, so two held byte-identity arms go DRIVEN→SKIPPED with no red | `tests/pd-store-core-adopt.test.ts:235-240,663-669` | blocking |
| (c) renames a **closed, guarded, spec-pinned** domain: `LayoutZoneName = 'left'\|'right'\|'header'\|'footer'`, its enumeration, its total guard, `GUTTER_ZONES`, `PANE_ZONE_NAMES` and two `Record` literals — **149** `LayoutZoneName` matches (12 src files, a 3,851-line register, ~30 spec cells), **54 src / 19 tests / 43 live-driver** `data-zone` sites, **32** `zone:header|footer` tokens | `src/renderer/layout-state.ts:41,85,112-113`; `pane-gutter.ts:51`; `pane-drag.ts:58`; `pane-graph.ts:188,215`; grep counts | blocking |
| (c) renames **MCP-visible node ids**: a contract-pinned checklist row requires `provident.list_targets` to carry stable `zone:left/right/header/footer` nodes | `docs/specs/user-flow-audit-checklist.md:142`; `docs/specs/unit-u-shell-1-layout-zones.md:85-86` | blocking |
| (d) is **not a backlog — it is the successor to the store** the fork is mid-adoption of: the foundation head carries 8 families and a tombstone where the store stood, while the fork has landed 2 of 8 F2 units and **pins that pair to the pin as an ACTIVE decision** | foundation `src/main/**`; `src/main/view-record/index.ts:1`; `docs/decisions.md:19,303`; `docs/specs/store-adoption-program.md:7` | blocking |
| The port's three spec clauses name the current words **verbatim**: `R-9` ("the four pane zones are left/right/header/footer"), the `grid-template-areas` block `header header header / left main right / footer footer footer`, and the greens row verifying those declarations | `docs/specs/unit-zone-replacement.md:31,101`; `-greens.md:152` | material |
| **Over-fit**: the foundation's zone ids are its *demo's*, held in a file the fork does not vendor — and the fork guide's own split hands ids to the fork and forbids copying its census | foundation `src/shared/view-shape.ts:255,263,292-293`; `forking.md:944,929-932` | material |
| **Volume**: the behaviour lives in the foundation's `index.html` 1999 L / `renderer.ts` 7844 / `demo-envelope.ts` 2240, against the fork's 376 / 1601 / 132 (plus `pane-graph.ts` 2039 and `sidebar-panes.ts` 4234). The port is **re-authoring**, and the fork has **no authored-node census instrument** | file censuses; lock `:180-185`; `forking.md:179-183` | material |
| Two ported behaviours **already own a ruling**: cross-zone drop and live resize preview are upstream-first with the fork's repairs as fallback; and passing an array where `computeTrackVars` takes a closure is recorded as "an empty record for every zone: a silent total regression no current test catches" | `docs/decisions.md:21,25` | material |
| The only app-green leg **hardcodes the vocabulary**: 43 `data-zone` sites and dozens of `zone:header`/`[data-zone="left"]` reads in `scripts/live-drive.mjs` — and RCA-11 makes it a pre-DONE gate for UI units, so a missed site yields a false FAIL | `scripts/live-drive.mjs:629,708-709,717,760,806,867,897,934,947,958,5275,5578,5591,6036,6041,6043,6076,6343-6345,6396,7143-7144,8649` | material |
| The **theme** half of the ruling is cheap and already parameterised: the vendored `theme.ts` is byte-identical at head and takes the attribute name as a caller argument; `data-theme` is 8 src / 13 test matches | `src/shared/theme.ts:67`; `tests/pd-ui-1-theme-register.test.ts:520-521,592,710-723` | note |
| **Paradigm**: the port is where a UI-authority violation would enter — and enter **green-looking**, because hand-written DOM is REFUSED at `dispatch`, SILENT at `get_markdown` and LEAKED into `get_rendered_html`, i.e. visible to a reviewer's grep and to no agent target | `forking.md:583-591`; `src/renderer/pane-graph.ts:545,554`; `index.html:134-157,191-195,273-278` | material |
| A branch-wide scope ruling makes much of (c)'s regression cost **legally avoidable** — but only by a recorded act whose own size is 73 files / 869 citation repoints | `docs/decisions.md:27`; `docs/next-steps.md:121` | material |
| **Same-commit freeze**: the landed tests freeze the lock at 15 modules, so vendoring any record-family half of (d) reds a landed suite and owes a recorded amendment | `tests/pd-store-persist-adopt.test.ts:494,498`; lock `:179` | material |
| Five active docs state the pin present-tense and go stale **in the same commit** — a per-unit doc-review finding by construction | `docs/decisions.md:19-20`; `docs/defects.md:102`; `docs/pending.md:89`; `brief.md` §2; `decisions.md` D-11 | material |
| Deferral cost, per pairing: (d) without (c) lands records writing `zone:'top'` that no fork carrier answers; (c) without (a) lands a port whose provenance pin is still the old revision; (b) alone is unclaimable; (a) alone re-FAILs the drift the moment the adjacent tree commits again | `src/shared/view-shape.ts:255,263`; `foundation-drift.mjs:390-399` | material |

**The question this review climbs to the user** (the one that decides whether (c) is a port or a contract
rename): does "the foundation's vocabulary wins" reach the fork's closed `LayoutZoneName` domain and its
MCP-visible `zone:` ids — pinned by `R-9`, `P-IM-1`/`P-SM-2` and the `UF-LAYOUT-2` clause — or only carriers the
import newly authors? The critique's second and third questions (the two store-adopt anchors, and whether (d)
supersedes the F2 store program's remaining six units) are recorded in `pending.md`.
