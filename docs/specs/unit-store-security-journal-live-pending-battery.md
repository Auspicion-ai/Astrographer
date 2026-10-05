# `U-STORE-SECURITY-JOURNAL` (3b) — THE LIVE LEG — the rendered-DOM battery, **PARKED BY NAME**

**Unit:** `U-STORE-SECURITY-JOURNAL` (3b, the RH-3 half of the SPLIT unit 3 of the store-adoption program, F2).
**Contract:** `docs/specs/unit-store-security-journal.md` §Status (the NAMED PARK + the park reason) · §6 (the layer ledger's `[U]` row) · §8 gate 6 (the structural refusal + the NAMED PARK) · §9 `O-8` (this artifact, `OPEN`/live-pending with the NAMED reason) · §10's ledger entry **`A-3B-1` ⑤** (the reason re-stated a third time, now MEASURED).
**Status:** **OPEN / live-pending — NEVER green, NEVER DONE.** `RCA-11` clause (b): the park is **NAMED**, not parked-by-default; `RCA-11` clause (a) is satisfied because this unit authors **NO rendered surface** (no element, no text, no handler body, no DOM change — §8 gate 6 REFUSES that temptation by name).

**Layer (`RCA-12`, mandatory): `[U]` — the ASSEMBLED Electron app.** No reading below is `[T]`/`[H]`; no node-green implies any row here, and no row here strengthens or restates the unit's register.

---

## 1. THE NAMED PARK REASON — **STRUCTURAL NON-EXERCISABILITY + THE MEASURED SKIP**

**THE PARK REASON IS STRUCTURAL NON-EXERCISABILITY, NOT AN ABSENT SESSION.** The unit's `[T]`/`[H]` instruments settle, drive and byte-scan a CONSTRUCTED pane; the live leg would ask one further question — *"does the Debug pane's `#status` visibly change when a read-only reply arrives?"* — and **that question has no separating instrument, for two independent structural reasons:**

- **(i) THE TWO STALE STATES RENDER IDENTICALLY.** The two candidate states — *stale because the reply was read-only* vs *stale because nothing changed* — produce the **same** `#status` text, the same classes and the same DOM. **No `[T]`/`[H]` instrument separates them**, and the only separating oracle would be a **TIMING** one, which §2.3/§2.4 **forbid as a claim**.
- **(ii) THE MEASURED SKIP (the `A-3B-1` ⑤ reading).** The ENGINE's cap is **live** on this pane (`basePresent` readable, the trigger fires), but the **D5 size guard ALWAYS SKIPS here** — **`base 7622B >= pre-base journal 2312B`** — because the pane's base snapshot covers all **41** registered nodes while a single-node drive carries a tiny payload. **The cap's ATTEMPT is node-observable; the SETTLE BOUND is unreachable through any legal mechanism on this fixture.** The skip is the structurally **NORMAL** outcome here, not an edge case.

The card this closes is **parked-by-default**, which is the exact failure mode `RCA-11` clause (b) exists to prevent: the reason above is a property of the SUBJECT, not of a session that happens to be missing.

## 2. WHAT **IS** VERIFIED, AND BY WHICH LAYER (the park is never read as "nothing is known")

| The claim | The layer that carries it | The instrument |
| --- | --- | --- |
| `journalDepth(): number` answers **`supervisor.journal.length`** (never `undoDepth`) | `[T]` constructed pane | the seam's identity drive (`P-SSJ-IM-1` · `P-SSJ-IM-4`) |
| the option is **ADDITIVE-OPTIONAL**; omission re-produces the landed INERT behaviour | `[T]` + `[H]` | the construction-site pin + the positional forgery (`P-SSJ-IM-3`) |
| the cap is **CONFIGURED** at the pane `Supervisor` and a condense is **ATTEMPTED** after the drive | `[T]` | the attempt reading (`P-SSJ-IM-2` limb 1, re-cast by `A-3B-1` ②) |
| the **uncapped control** still grows past `M` (anti-vacuity) | `[T]` | `P-SSJ-IM-2` limb 2 |
| the journal's growth is bounded **at its SOURCE** by the volume guard | `[T]` | the drawn-op counts (`P-SSJ-SM-1` · `P-SSJ-TP-1`) |
| the burst is **RE-HOMED** into the notify callback; **TWO** `refreshDebug` sites, a THIRD fails | `[H]` byte-scan | the occurrence probe (`P-SSJ-H-1`) |
| the predicate boundary: `iff reply.ok && MUTATING_METHODS.has(req.method)` | `[H]` | the predicate pin (`P-SSJ-H-2`, `P-SSJ-H-1` pin 5) |

**THE SHAPE-ONLY CLAUSE, binding.** Every claim above is a reading over a **CONSTRUCTED** pane or a **byte-scan**. **None models the assembled app**, the runtime stage↔graph assembly, or a real operator's `M`.

## 3. WHAT IS **NOT** VERIFIED ANYWHERE (the honesty block — each a named non-claim)

- **NO `≤ M` SETTLE IS VERIFIED** — the cap is ATTEMPTED, never SETTLED, on this pane (the D5 skip above). `A-3B-1` **SUPERSEDES-IN-PART** §2.1(c)'s `≤ M` claim by pointer.
- **NO RENDERED-DOM SEPARATION IS VERIFIED** — the two stale states are indistinguishable in a DOM reading (§1(i)).
- **NO TIMING PROPERTY IS VERIFIED** — no notify-callback firing, no reply-ordering, no settle window.
- **NO APP / ENVELOPE / STORE / ENGINE / LIVE-GREEN** — each is a NAMED NON-CLAIM (§6's honesty block).
- **NO DURABILITY CLAIM EXISTS** in the contract, the register, the greens set, the DONE row or this file (`P-SSJ-H-3`, the anti-overclaim row, polices exactly this) — **this unit moves no byte on any durability axis.**
- **NO ENGINE-GREEN** — the engine is UNPATCHED; the microtask-comment defect stays CATALOGUED, never patched.

## 4. THE SCENARIO LIST A LATER LIVE ITERATION WOULD RUN TO LIFT THE PARK

| # | Scenario | The observable that lifts the row |
| --- | --- | --- |
| **L-1** | Boot the assembled app on a usable display; confirm the Debug pane renders its `#status` census + SSR preview | the pane is reachable at all — the precondition for every row below |
| **L-2** | Set the operator's `maxJournalLength` to a small `M`; drive one mutating MCP reply | the pane's journal reaches the cap and the engine's deferred condense is **ATTEMPTED** (the `condense-skipped-size` warn, or a landed `basePresent`) |
| **L-3** | Drive a **read-only** MCP reply; read `#status` | **the ONLY row that even approaches the park's question — and it still does not answer it**: the pane is unchanged, but *stale-because-read-only* and *stale-because-nothing-changed* render identically (§1(i)) |
| **L-4** | Drive a **mutating** reply; read `#status` | the burst ran (the pane refreshed); still no reading SEPARATES the two stale states |
| **L-5** | Grow the pane's base past its journal (a fixture that makes D5 NOT skip), then drive past `M` | the settle bound `≤ M` becomes reachable — the row that would make the cap's BOUND an observable, and it needs a fixture this unit does not author |

**STOP HERE: even a full L-1..L-5 sweep does NOT lift the park's structural reason.** L-3/L-4 observe a state; they do not separate it. **Only L-5 changes a MEASURED structural relation, and it is outside this unit's surface.**

## 5. THE REVISIT CONDITION

**Revisit when EITHER (a) a live-drivable session against the assembled app is available** (`scripts/live-drive.mjs` / CDP, on a usable display) **AND a fixture exists that makes the D5 guard NOT skip** (a pane whose base is smaller than its journal), **OR (b) the contract admits a TIMING oracle** — then RUN §4's rows and record each reading here, in place, with its verdict. **Lifting the park changes THIS file's status line to `DRIVEN` and never to a durability claim, never to an `≤ M` claim without L-5's reading.** Conversely, the park **stays** `OPEN/live-pending` while neither holds: it is a NAMED park (`RCA-11` clause (b)), so its status is an honest statement about a structurally non-exercisable surface — **never a green, never a DONE.**
