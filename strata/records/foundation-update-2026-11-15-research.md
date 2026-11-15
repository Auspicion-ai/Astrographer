# foundation update — intake findings (2026-11-15, `role_l0_research`, read-only)

Topic: what the foundation's update contains, pin `7bd1de4…` (2026-10-04) → HEAD `e8dfb57…` (2026-11-14).
Each claim carries its source; `unsourced` claims are never a decision's sole basis (`research.md` §2).

| Claim | Source | Conf | If false |
|---|---|---|---|
| **911 commits** stand between the pin and HEAD | `git rev-list --count 7bd1de4..HEAD` = 911 | high | window scale |
| The **UI/layout window** is 2026-11-12 → 11-14, the foundation's rows **248…287** (78 ref transitions; each row lands with its raw twin commit) | `git log` subjects over the range; foundation `.git/logs/HEAD:1442-1519` | high | row list mis-bounded |
| **None of the fifteen modules the fork vendors changed** (`src/shared` diff touches only `demo-envelope`, `types`, `tabs-channels`, `tabs-landing`, `view-channels`, `view-shape`) | `git diff --stat 7bd1de4..HEAD -- src/shared/`; the fifteen are md5-identical to HEAD in the fork's tree | high | a vendoring refresh would be owed |
| The update is mostly the foundation's **own chrome**, not the mechanisms: `renderer.ts` 1203→7844, `renderer/index.html` 43→1999, `demo-envelope.ts` 433→2239 | `git show <pin>:<path> \| wc -l` vs `wc -l` at HEAD | high | an import would be a vendoring task |
| It also gained **record families**: `main/{data,view-record,view-surface,tabs-record,tabs-surface,operator-settings,settings-surface,storeroom}`, `renderer/{view,tabs,module,security}-client`, `shared/{view-shape,view-channels,tabs-channels,tabs-landing}` | `git diff --stat 7bd1de4..HEAD -- src/` | high | scope of the full backlog |
| `provident-ssr` moved **0.5.1 → 0.5.2** at its row 265 (panes inherit their zone class **by position**) | foundation row 265; fork pins `^0.5.1` (`package.json`) | high | engine prerequisite for the zone work |
| The foundation's fork guide `docs/guides/forking.md` is **981 lines, 11 sections**: §7 changed behaviours, §8 what refuses you, §9 what not to copy, §10 you-provide-this (7 rows), §11 how the examples were checked | file read, section headings | high | the import's own contract source |
| §8's verdict table: `updatedAt` leaf-clear REFUSED · a tab row's `index` COMMITTED-BUT-WRONG · `viewTabsPlaceholder` REFUSED · status-only `commitPane` COMMITTED-BUT-WRONG · undeclared pane/zone REFUSED · hand-written DOM REFUSED at `dispatch` but LEAKED into `get_rendered_html` · `css.style` write replaces WHOLE | `forking.md:583-591` | high | a port would copy traps |
| §7's behaviour list: zone collapse is a **derivation** the record may overturn; a collapsed extent is `auto`, the remembered size untouched; pane collapse is one leaf write; rearrangement is (zone, place) with the declared place sorting; relocation is a **drag** with `zone` as the moving member; **a drag cannot beat the head's `min-content`**; the gutter is a `min(48px,100%)` pill over a `::before` divider | `forking.md:472-564` | high | the behaviour set to port |
| §10's split: the fork provides **your ids, your pane names/menu/theme control, your terminal predicates, your `updated` policy, your census figures**; the component provides the channel, the closed `status` words, the four families/tiers/routes and the census instrument | `forking.md:938-946` | high | what is a port vs a policy call |
| Foundation evidence discipline is per-row: measured-live vs read vs refused; its node suite read **2,969 passed / 2 skipped of 2,971** at row 278's head on a real renderer for the layout rows | commit messages at the window; foundation `AGENTS.md`'s layer rule | med | trusting a suite green for app behaviour |
| The guide's census instrument climbs **38→73→75→89→105→109** authored nodes across the layout eras and must be re-taken by a fork — "a fork's census is its own" | `forking.md:179-183`, `:929-932`; foundation `docs/L3/*/design*.md` | high | any census row the fork writes |

**Questions only the user can answer (each put to the user under D-12):** (1) does the fork want the `updatedAt` producer and a "last view"
policy at all, or the channel present and provably inert? (2) must the fork keep its own `dom-shim` /
`demo-envelope` baseline (the lock's X-1 exclusions rest on it) while the foundation's own copies grew?
(3) is the fork's census to be re-taken in the foundation's shape, or does the fork's own envelope make
those instrument rows moot?
