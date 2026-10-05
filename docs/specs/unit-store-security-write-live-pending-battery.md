# `U-STORE-SECURITY-WRITE` (3a) — THE LIVE LEG — the rendered-DOM battery, **PARKED BY NAME**

**Unit:** `U-STORE-SECURITY-WRITE` (3a, the FIRST half of the SPLIT unit 3 of the store-adoption program, F2).
**Contract:** `docs/specs/unit-store-security-write.md` §Status (the NAMED PARK + the park reason) · §6 (the layer ledger's `[U]` row) · §7 gate 6 (the structural refusal + the NAMED PARK) · §8 `O-8` (the artifact, `OPEN`/live-pending with the NAMED park reason).
**Status:** **OPEN / live-pending — NEVER green, NEVER DONE.** `RCA-11` clause (b): the park is **NAMED**, not parked-by-default; `RCA-11` clause (a) is satisfied because this unit's subject is **not** a UI-overhaul/UI-rendering surface (the contract's §Status and §7 gate 6 refuse any authored rendered surface).

**Layer (`RCA-12`, mandatory): `[U]` — the ASSEMBLED Electron app.** No reading below is `[T]`/`[H]`; no node-green implies any row here, and no row here strengthens or restates the unit's register.

---

## 1. THE NAMED PARK REASON (the contract's §Status, restated — never re-derived)

**THE PARK REASON IS THE MECHANISM'S INVISIBILITY TO A DOM READING, NOT AN ABSENT SESSION.** The manual-UI channel's observable behaviour to an OPERATOR is **UNCHANGED**: the Settings pane's token/group/journal-length controls fire the same `security.set` invocations and the pane renders the same elements, classes, text and hook outputs before and after this unit. What this unit changed is (i) the **ATOMICITY of the write** (a `mkdir`→tmp→`fsync`→`rename`→`dir-fsync` replace in place of a plain `writeFileSync`) and (ii) the **EXISTENCE of the persist receipt** (`lastWriteReceipt()` + the additive `write` member on the `IPC_SECURITY_SET` response). **NEITHER is visible in a rendered-DOM reading:** a successful atomic write and a successful plain write leave an identical pane, and the receipt is **discarded by every renderer `set()` call site** (the four fire-and-forget handler bodies — contract §3.3 leg 3). There is therefore **no DOM predicate** whose truth value differs between the pre-unit and post-unit builds.

**THE STRUCTURALLY NON-EXERCISABLE SURFACE, named (the clause-(b) park class):** the `fsync` legs cannot be driven to a **real kernel-level fault** from a DOM/CDP reading — the MCP + CDP surface can assert that a file was written and read back, never that a `fsync` COMPLETED or that a torn write was prevented. This is the OS-owned outcome class, not a session that happens to be missing.

## 2. WHAT **IS** VERIFIED, AND BY WHICH LAYER (so the park is never read as "nothing is known")

| The claim | The layer that carries it | The instrument |
| --- | --- | --- |
| the atomic five-step runs **in order, exactly once each** | `[H]`-shim / `[T]` | the injected-`fs` façade's call-order ledger (`P-SSW-IM-1` · `P-SSW-SM-1`) |
| **each descriptor opened is closed** (2 opens / 2 closes per successful write; whatever a failed path opens is still closed) | `[H]`-shim / `[T]` | the same ledger's `openSync`/`closeSync` counts (`P-SSW-IM-1`/`-2` shape rows) |
| the previous file stays **byte-identical** at each injection point | `[H]`-shim / `[T]` | the façade's failure arms (`P-SSW-IM-2` · `P-SSW-IM-4`) |
| the receipt's **two closed forms**, totality, and non-absence | `[T]` | the driven store + the handler substrate (`P-SSW-TP-1` · `P-SSW-H-2`) |
| the widened preload declarations + the SET response's `write` member | `[H]` byte-scan | byte pins (`P-SSW-H-1` · `P-SSW-H-2`) |

**THE SHAPE-ONLY CLAUSE, binding.** Every atomic claim above is a **CALL ORDER/COUNT** over the **INJECTED** façade. The façade is an instrument that records invocation; it **models no `fsync` completion, no power loss and no crash recovery.**

## 3. WHAT IS **NOT** VERIFIED ANYWHERE (the honesty block — each a named non-claim)

- **NO `fsync` COMPLETION IS VERIFIED** — in node, in the live leg, or anywhere in this unit's artifacts. The `fsync` legs are asserted as calls, never as durable effects.
- **NO CRASH-RECOVERY OUTCOME IS VERIFIED** — no run kills the process between the rename and the directory `fsync`, and no run replays a torn state.
- **NO BYTES-ON-DISK-AFTER-A-POWER-LOSS STATE IS VERIFIED** — no artifact of this unit claims, asserts or implies it.
- **NO DURABILITY CLAIM EXISTS** in the contract, the register, the greens set, the DONE row or this file (`P-SSW-H-4`, the anti-overclaim row, polices exactly this).
- **NO RENDERED-SURFACE CLAIM** — the unit authors no element, no text, no handler body and no "persist failed" indicator (refused by name at §7 gate 6).

## 4. THE SCENARIO LIST A LATER LIVE ITERATION WOULD RUN TO LIFT THE PARK

Each row is written to be **DOM/CDP- or process-observable**, so an operator can see its answer without reading this unit's node instruments.

| # | Scenario | The observable that lifts the row |
| --- | --- | --- |
| **L-1** | Boot the assembled app against a controlled user-data root; confirm the Settings pane renders its controls and the app settles (`renderer ready`, no `fatal` line) | the Pane is reachable at all — the precondition for every row below |
| **L-2** | Drive the pane's token/group controls; then read the persisted settings file | the file carries the new value, and **no residual `${path}.tmp`** remains (the rename published it) |
| **L-3** | **Restart the app** against the same root; read the pane | the operator-visible state round-trips across a REAL app restart |
| **L-4** | Kill the process **between the tmp write and the rename** (a seam-driven or signal-driven abort), then reboot against that root | the REAL path still answers the PREVIOUS record — the failed-write-intact rule at the assembled boundary, with the torn write visible on disk |
| **L-5** | Kill the process **after the rename, before the directory `fsync`**, then reboot | the record's presence on disk is observed — **the only row that even approaches the durability question, and it still does not answer it** |
| **L-6** | Corrupt the settings file, reboot, read the pane | the first-run default is answered and **nothing throws** (`I-3` at the assembled boundary) |

**STOP HERE: even a full L-1..L-6 sweep does NOT claim durability.** L-4/L-5 observe a state on disk; they do not prove a `fsync` completed or that a power cut preserves the rename. **The park lifts on the observable surface (a live session driving L-1..L-6), and the durability non-claim STANDS regardless of the outcome.**

## 5. THE REVISIT CONDITION

**Revisit when a live-drivable session against the assembled app is available** (`scripts/live-drive.mjs` / CDP, on a usable display) — then RUN §4's rows and record each reading here, in place, with its verdict, before the park is lifted. **Lifting the park changes THIS file's status line to `DRIVEN` and never to a durability claim.** Conversely, the park **stays** `OPEN/live-pending` while no such session is available: it is a NAMED park (`RCA-11` clause (b)), so its status is an honest statement about an un-drivable surface — **never a green, never a DONE.**
