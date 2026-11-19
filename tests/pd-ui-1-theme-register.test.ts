// tests/pd-ui-1-theme-register.test.ts — unit `PD-UI-1` (THE THEME UNIT, wave `W1`):
// the register rows whose subject is the PIN/TOKEN/PERSISTENCE SAFETY of the adoption and
// the vendored bytes' non-touch — `P-TH-IM-4` (a)/(b), `P-TH-SM-1`, `P-TH-SM-2` — plus the
// register's ARITHMETIC, printed with its terms.
//
// The unit's other five register rows live in `tests/pd-ui-1-theme-adoption.test.ts`
// (`P-TH-IM-1` · `P-TH-IM-2` · `P-TH-TP-1` · `P-TH-TP-2` · `P-TH-TP-3`), so the register is
// spread across the unit's TWO files exactly as `PD-VENDOR`'s is spread across three.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-pd-ui-1-theme.md
//     §1.2 (c)   the token block, the persisted `theme` carrier and the boot wiring's
//                structure are KEPT, unchanged, OUTSIDE this unit's write set
//     §1.4       the ALLOWED surface (`src/renderer/theme.ts`, `src/renderer/renderer.ts`)
//                and the DENIED surface (every `src/shared/**` byte — the vendored module
//                and the four divergent baseline files; `vitest.config.ts`; `package.json`;
//                `scripts/**`; `src/main/markdown-import.ts`; the two fence files)
//     §2.1       the adapter's import census (EXACTLY one statement → `src/shared/theme.ts`)
//     §2.4       the prohibitions the adoption carries (never relaxed)
//     §3.1       the vendored module's declared records
//     §4         the typed register: `P-TH-IM-4` (6 = 4 facts + 2 controls),
//                `P-TH-SM-1` (8 = 6 pin classes + 2 controls), `P-TH-SM-2` (8 = 3 facts × 2
//                readings + 2 controls); the shared machinery: seed `0x20260928`, a
//                hand-rolled 32-bit LCG (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`,
//                `index = stateₙ₊₁ mod pool.length`), ≤100 attempts/row, rows sequential in
//                register order, STOP AFTER 5 CONSECUTIVE FAILURES, every row carrying a
//                control whose expected outcome is the OPPOSITE of the row's verdict
//     §4 tally   `28 + 26 + 67 + 24 + 27 + 6 + 8 + 8 = 194` attempts ⟨A-6/A-7/A-3 CORRECTED
//                2026-09-28 (the filed total was `20 + 26 + 59 + 20 + 26 + 6 + 8 + 8 = 173`,
//                still printed here as the SUPERSEDED figure)⟩, printed with its terms;
//                `194 ≤ 120` is FALSE and the overshoot is DECLARED with the route taken;
//                ⟨A-8⟩ NO row is generator-backed (declared), and the STOP-AFTER-5 rule is
//                declared INAPPLICABLE (no row runs a bounded attempt loop)
//     §6.3       this unit retires NO test and archives NO file
//     §6.4       the `[T]`-side obligations: no `'electron'` mock (the protected census
//                pins the exact five-name set); nothing a `G-9` pin freezes is written;
//                census-stable titles; the terms printed as their sums
//   docs/specs/pd-ui-1-adoption-dossier.md
//     §1 rows 1–8 · `C-1`..`C-7`  the adopted identifiers and the collision reconciliations
//     `A-1`                       the blocking `PD-VENDOR` pin re-statement (Task 2 of this
//                                 red set; performed in `tests/pd-vendor-set.test.ts`, in the
//                                 SAME commit as the unit's implementation)
//
// LAYER (RCA-12): `[T]` / source-layer. Byte-identity, a digest, a source-text census and a
// `git`-recorded provenance read prove the PIN and the ABSENCES — they do NOT prove that any
// consumer works, that an attribute was applied, that a stylesheet reacted, or that the app
// renders. NOTHING here is app-green.
//
// RED-FIRST (RCA-1): at this head the adapter does NOT import the vendored module
// (`P-TH-IM-4` (d) reads `0` and must read `1`), and the adapter does not yet READ the
// vendored declaration's `removal` member (`P-TH-IM-4` (c)), so those rows are RED and name
// the adapter as the site. The protection rows (`P-TH-SM-1`, `P-TH-SM-2`) read the
// pre-landing tree and become the unit's regression guard (§6.1 order 4).
//
// `G-9`/`X-9` PIN SAFETY: this file mocks NOTHING (in particular never `'electron'`, in any
// access form), and it READS `vitest.config.ts` / `package.json` / `src/main/markdown-import.ts`
// only as the SUBJECTS of the protection rows — it writes no pinned byte and edits no config.

import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
// `typescript` is an EXISTING devDependency (the sibling pd-vendor rows use it) — no new
// dependency is added (§4's machinery forbids one; no sixth leg).
import ts from 'typescript'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const SET_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-set.test.ts')
const MANIFEST_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const ADAPTER_PATH = join(REPO_ROOT, 'src', 'renderer', 'theme.ts')
const VENDORED_PATH = join(REPO_ROOT, 'src', 'shared', 'theme.ts')
const INDEX_HTML_PATH = join(REPO_ROOT, 'src', 'renderer', 'index.html')
const REGISTER_SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-pd-ui-1-theme.md')

/** §4's shared machinery — the pinned seed, a fixed literal in the test file: never
 *  `Date.now()`, never `Math.random()`, never an environment read. */
const REGISTER_SEED = 0x20260928

/** §1.2 (c) — the fifteen token NAMES the token block declares (a census, never a value
 *  claim: this unit changes no token value). */
const PINNED_TOKENS = [
  '--bg',
  '--fg',
  '--muted',
  '--muted-2',
  '--muted-3',
  '--muted-4',
  '--card-bg',
  '--border',
  '--border-strong',
  '--input-bg',
  '--input-fg',
  '--input-border',
  '--error',
  '--accent',
  '--hover',
] as const

/** §4 `P-TH-SM-1` (c) — the five names the protected bridge-mock census pins (derived
 *  here by scanning `tests/**` for the mock call, so a SIXTH joiner reds the row). */
const PINNED_BRIDGE_MOCK_CENSUS = [
  'template-adversarial.test.ts',
  'unit-live11-bridge-seams.test.ts',
  'unit-u5-rich-commit-ipc.test.ts',
  'unit-v5-bridge-capture.test.ts',
  'unit-wave-1-bridge-wiring.test.ts',
]

/** §4 `P-TH-SM-1` (e)/(f) and §1.2 (c) — the files whose bytes must NOT move, PINNED BY
 *  RECORDED md5 DIGEST (the `P-TH-IM-4 (a)` manifest pattern).
 *
 *  ⟨A-1 CORRECTION 2026-09-28 (gate-4 remand).⟩ The superseded limbs asserted
 *  `git status --porcelain -- <paths>` is EMPTY — and a CLEAN COMMITTED tree yields `''` for ANY
 *  committed content, so only an UNCOMMITTED edit could ever fail them (a committed change to
 *  any of these files passed VACUOUSLY). The recorded digests below were taken from the landed
 *  bytes at this head (`7bbc1d7`), so a COMMITTED change to any of these files now FAILS. The
 *  superseded working-tree reading is RETAINED, labelled as the weaker limb it is. */
const UNTOUCHED_DIGESTS: Array<{ file: string; md5: string; superseded?: string; restated?: string }> = [
  // ⟨RE-STATED 2026-09-29 — unit `U-APP-HARNESS-READINESS` (this pass's date; that unit's spec is
  //  filed 2026-10-15, so the note's date is the PASS date and not the spec's filing date).⟩
  //  THE ROW'S SUBJECT IS UNCHANGED — §4 `P-TH-SM-1` (e)/(f) / §1.2 (c): the vendoring/theme landing
  //  did not move these bytes — and its MECHANISM is unchanged (per-file RECORDED md5 equality, the
  //  ⟨A-1⟩ committed-change detector above). WHAT MOVED IS THE RECORDED VALUE: a LATER, RECORDED unit
  //  legitimately moved two of the seven files — `src/shared/types.ts` gains the boot-install
  //  observable's channel constant (`U-APP-HARNESS-READINESS` §2.2 `B-1` item 4) and
  //  `src/main/preload.ts` gains the bridge half of that same report — so their CURRENT bytes are
  //  re-recorded below, and each row's as-filed digest is KEPT VISIBLE beside the new one.
  //  THE SUPERSEDED VALUES, as filed (kept, never deleted): types `303e63d28ec430920aebf0d4a8f3fd3f`
  //  · preload `76d2299070d4333e0e66189359baad22`. THE TEETH ARE NOT RELAXED: `md5` stays a RECORDED
  //  value, so an UNRECORDED move of EITHER file still FAILS this row — a later pass may move the file
  //  only by re-stating it here, with its reason and its unit named, exactly as this note does.
  //  (Both new digests MEASURED by this pass at this head: types `ff8c0b9a7cfb2f37cc94c6b018c1f756` ·
  //  preload `00dba3cdd5e1eb3c7de632a838e3d28b`.)⟩
  // ⟨RE-STATED 2026-11-16 — unit `U-4` (`menu-opener`), §2 `R-2`; §4 `P-TH-SM-1` (e)/(f) / §1.2 (c).⟩
  //  (This row is re-stated a FOURTH time; every earlier note above is KEPT VERBATIM as that pass's
  //  record — `RCA-8(c)`, annotate-beside, never rewritten.)
  //  THE ROW'S SUBJECT IS UNCHANGED — the path stays a RECORDED, md5-pinned digest and its TEETH are
  //  not relaxed (an UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the working-tree
  //  limb). WHAT MOVED IS THE RECORDED VALUE, licensed by this row's own text (*"a later pass may move
  //  the file only by re-stating it here, with its reason and its unit named, exactly as this note
  //  does"*). **THE REASON:** `R-2` adds the ONE settings-opener channel constant
  //  (`IPC_SETTINGS_OPEN`, main→renderer, one-way, no payload member, manual-UI only) beside the
  //  U-MENU-1 block in `src/shared/types.ts` — so its bytes MOVE by construction. **THE UNIT:**
  //  `U-4` (`menu-opener`), contract `docs/L1/unit-u-4-menu-opener.md` §2 `R-2` / §5.2. **THE SUPERSEDED
  //  VALUE is the previous recorded digest, kept as this row's `superseded:` field and never deleted:**
  //  `ff8c0b9a7cfb2f37cc94c6b018c1f756` (the `U-APP-HARNESS-READINESS` value; the older chain
  //  `303e63d28ec430920aebf0d4a8f3fd3f` stays visible on the notes above). **THE NEW VALUE IS MEASURED,
  //  never inferred** (`md5sum src/shared/types.ts`, run TWICE at this landing's head AFTER every `src/`
  //  write, identical both times: `8cdc2b81eef0b3fb0cd7a96f95881009`). **NO OTHER ROW OF THIS TABLE IS
  //  TOUCHED** — the table stays SEVEN rows and `UNRESTATED_CONTROL_PATH` stays DERIVED from the table
  //  itself (this row already carried a `restated:` field, so the derivation still resolves to
  //  `src/shared/demo-envelope.ts`) and is NOT hand-edited here.
  { file: 'src/shared/types.ts', md5: '8cdc2b81eef0b3fb0cd7a96f95881009', superseded: 'ff8c0b9a7cfb2f37cc94c6b018c1f756', restated: 'U-4' }, // ⟨RE-STATED BY `U-4` 2026-11-16 (`R-2`, the settings-opener channel constant): the md5 is re-MEASURED at the landing head and `U-APP-HARNESS-READINESS`'s `ff8c0b9a7cfb2f37cc94c6b018c1f756` is now this row's `superseded` field; the as-filed `303e63d28ec430920aebf0d4a8f3fd3f` stays visible on the notes above⟩
  { file: 'src/main/operator-settings-store.ts', md5: '0f846fa907c36000511ec5d516056a42', superseded: '11841179e004f22dd758edbe927f1a40', restated: 'U-ATOMICITY-SWEEP-CLASS-B' },
  // ⟨RE-STATED 2026-10-07 — unit `U-ATOMICITY-SWEEP-CLASS-B`, §1.1 member 4 / §3.2 `I-7` / `O-4`.⟩
  //  THE ROW'S SUBJECT IS UNCHANGED — §4 `P-TH-SM-1` (e)/(f) / §1.2 (c): the path stays a RECORDED,
  //  md5-pinned digest and its TEETH are not relaxed (an UNRECORDED move of it still FAILS both the
  //  ⟨A-1⟩ digest limb and the working-tree limb). WHAT MOVED IS THE RECORDED VALUE, and the move is
  //  LICENSED BY THIS ROW'S OWN TEXT: *"a later pass may move the file only by re-stating it here,
  //  with its reason and its unit named, exactly as this note does"*. **THE REASON:** this unit lands
  //  the ATOMIC FIVE-STEP WRITE on this carrier — its `persist()` is re-shaped from the plain
  //  `writeFileSync(opts.path, …)` against the LIVE path to `mkdirSync(dirname,{recursive:true})` →
  //  `${path}.tmp` write → `fsync(tmp)` → `renameSync(tmp, path)` → `fsync(dir)`, its empty
  //  `catch {}` is REMOVED in favour of the RETURNED receipt (`lastWriteReceipt()`), and
  //  `OperatorSettingsStoreOptions` gains the ADDITIVE-OPTIONAL `fs?` façade
  //  (`docs/specs/unit-atomicity-sweep-class-b.md` §1.1 members 1/3, §2.2, §2.6) — so its bytes MOVE
  //  by construction, and §1.1 member 4 is the clause that orders THIS row re-stated in the landing's
  //  own commit. **THE UNIT:** `U-ATOMICITY-SWEEP-CLASS-B`. **THE SUPERSEDED VALUE IS THE ROW'S OWN
  //  `superseded:` FIELD BESIDE IT** (`11841179e004f22dd758edbe927f1a40`, kept VISIBLE and NEVER
  //  deleted). **THE NEW VALUE IS MEASURED, never inferred** (`md5sum`, taken at the landing's head
  //  AFTER this unit's `src/` writes, never copied from another row). **NO OTHER ROW OF THIS TABLE IS
  //  TOUCHED** by this re-statement; the table stays SEVEN rows and `UNRESTATED_CONTROL_PATH` stays
  //  DERIVED (this row now carries a `restated:` field, so the derivation moves on to the next
  //  un-re-stated row — see the PRE-EMPTIVE re-anchor note below, which names that path) and is NOT
  //  hand-edited here.
  // ⟨RE-STATED 2026-10-04 — unit `U-STORE-PERSIST-ADOPT` (`core`; unit 2 of the
  //  store-adoption program, F2), §9 `C-10` / §10 `O-8`.⟩
  //  THE ROW'S SUBJECT IS UNCHANGED — §4 `P-TH-SM-1` (e)/(f) / §1.2 (c): the path stays a
  //  RECORDED, md5-pinned digest and its TEETH are not relaxed (an UNRECORDED move of it
  //  still FAILS both the ⟨A-1⟩ digest limb and the working-tree limb). WHAT MOVED IS THE
  //  RECORDED VALUE, and the move is LICENSED BY THIS ROW'S OWN TEXT: *"a later pass may
  //  move the file only by re-stating it here, with its reason and its unit named, exactly
  //  as this note does"*. **THE REASON:** this unit lands the tier-1 store surface — §2.5's
  //  THREE `store.*` preload members (`get` · `put` · `onFileChanged`) under a `store`
  //  sub-namespace, each importing the channel-name constants from the NEW
  //  `src/main/store-channels.ts` (§1.1 member 5; `K-3`; the surface the `store` member's
  //  own arm-4 regex targets) — so its bytes MOVE by construction, and §9 (`C-10`)'s
  //  units-order row orders THIS row re-stated in the landing's own commit, because units
  //  2 / 2b / 3 SHARE `src/main/preload.ts` + `src/main/main.ts` +
  //  `src/renderer/renderer.ts` and therefore CANNOT land in one wave. **THE UNIT:**
  //  `U-STORE-PERSIST-ADOPT` (core). THE SUPERSEDED VALUE, kept visible and NEVER deleted:
  //  `00dba3cdd5e1eb3c7de632a838e3d28b` (the `U-APP-HARNESS-READINESS` re-statement, itself
  //  superseding the as-filed `76d2299070d4333e0e66189359baad22` — both kept visible).
  //  THE NEW VALUE is MEASURED at the landing's head (`md5sum src/main/preload.ts`, taken
  //  AFTER this unit's `src/` writes) — never inferred, never copied from another row.
  //  **NO OTHER ROW OF THIS TABLE IS TOUCHED** by this re-statement; the
  //  `UNRESTATED_CONTROL_PATH` stays DERIVED from the table itself (this row now carries a
  //  `restated:` field, so the derivation still resolves to the same un-re-stated path) and
  //  is NOT hand-edited here.
  // ⟨RE-STATED 2026-10-04 — unit `U-STORE-SECURITY-ADOPT` (the SPLIT's own name for the
  //  store-adoption program's unit 3; the LANDING unit is its FIRST half
  //  `U-STORE-SECURITY-WRITE`/3a, §1.1 member 5 / `S-P-3` / `O-2`).⟩
  //  THE ROW'S SUBJECT IS UNCHANGED — §4 `P-TH-SM-1` (e)/(f) / §1.2 (c): the path stays a
  //  RECORDED, md5-pinned digest and its TEETH are not relaxed (an UNRECORDED move of it
  //  still FAILS both the ⟨A-1⟩ digest limb and the working-tree limb). WHAT MOVED IS THE
  //  RECORDED VALUE, and the move is LICENSED BY THIS ROW'S OWN TEXT: *"a later pass may
  //  move the file only by re-stating it here, with its reason and its unit named, exactly
  //  as this note does"*. **THE REASON:** this unit lands the security-tier write
  //  discipline's OBSERVABILITY SEAM — §2.5's TWO `security.set` declarations (the
  //  `ProvidentBridge` interface declaration AND the bridge implementation) are BOTH
  //  widened to return `SecuritySettings & { write: SecurityWriteReceipt }`, so the
  //  persist receipt rides the channel response; §1.1 member 4 is the clause that orders
  //  this row re-stated in the landing's own commit, because units 2 / 2b / 3 SHARE
  //  `src/main/preload.ts` + `src/main/main.ts` and therefore CANNOT land in one wave.
  //  **THE UNIT:** `U-STORE-SECURITY-ADOPT` (the split unit's name; landed by its 3a half
  //  `U-STORE-SECURITY-WRITE`). THE SUPERSEDED VALUE, kept visible and NEVER deleted:
  //  `f24ea717a5f8f93a3ac490334611d22a` (the `U-STORE-PERSIST-ADOPT` re-statement, itself
  //  superseding `00dba3cdd5e1eb3c7de632a838e3d28b` and, before that, the as-filed
  //  `76d2299070d4333e0e66189359baad22` — ALL kept visible).
  //  THE NEW VALUE is MEASURED at the landing's head (`md5sum src/main/preload.ts`, taken
  //  AFTER this unit's `src/` writes) — never inferred, never copied from another row.
  //  **THE PRIOR PASS'S PROVISIONAL VALUE**, superseded WITHIN THE SAME UNIT and kept
  //  visible beside the new one: `21b8120cddadd1b1531bd0422cb5d613` was recorded by the
  //  prior implementer pass BEFORE the store module's final shape landed (§1.1 member 1's
  //  `fs?` façade annotation and the receipt declaration form both moved after it), so
  //  `A-3A-2` ④(c)'s measure-then-record ORDER re-measures at the FINAL head. The
  //  superseded chain is now `cb1ee2ff…` ← `21b8120c…` ← `f24ea717…` ← `00dba3cd…`.
  //  **NO OTHER ROW OF THIS TABLE IS TOUCHED** by this re-statement; the
  //  `UNRESTATED_CONTROL_PATH` stays DERIVED from the table itself (this row already
  //  carried a `restated:` field, so the derivation still resolves to the same un-re-stated
  //  path) and is NOT hand-edited here.
  // ⟨RE-STATED 2026-11-15 — unit `U-1b` (`zone-collapse`), D-22 (1); §4 `P-TH-SM-1` (e)/(f) / §1.2 (c).⟩
  //  THE ROW'S SUBJECT IS UNCHANGED — the path stays a RECORDED, md5-pinned digest and its TEETH are not
  //  relaxed (an UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the working-tree limb).
  //  WHAT MOVED IS THE RECORDED VALUE, and the move is LICENSED BY THIS ROW'S OWN TEXT: *"a later pass may
  //  move the file only by re-stating it here, with its reason and its unit named, exactly as this note
  //  does"*. **THE REASON:** `U-1b` lands the ONE collapsed zone state (D-22 (1)) and the `sidebar` bridge
  //  seam it writes is RENAMED WITH IT — the zone seam becomes `zoneCollapseToggle` (the superseded
  //  spelling is `C-5`'s left column in `docs/L1/unit-u-1b-zone-collapse.md`; it is NOT spelled here
  //  because this unit's own vocabulary census forbids it under `tests/**`, `RCA-8(c)`) — at all THREE
  //  sites this file owns (the `SidebarMethods` declaration, the default `sidebarHolder`, and the exposed
  //  `sidebar` proxy), so its bytes MOVE by construction and §2 `C-6` is the clause that orders THIS row
  //  re-stated in the landing's own commit. **THE UNIT:** `U-1b` (`zone-collapse`), contract
  //  `docs/L1/unit-u-1b-zone-collapse.md`. **THE SUPERSEDED CHAIN, kept VISIBLE and NEVER deleted:**
  //  `76d2299070d4333e0e66189359baad22` (as filed) ← `00dba3cdd5e1eb3c7de632a838e3d28b` ←
  //  `f24ea717a5f8f93a3ac490334611d22a` (`U-STORE-PERSIST-ADOPT`) ← `21b8120cddadd1b1531bd0422cb5d613`
  //  (that unit's provisional value) ← `cb1ee2ff3cd409363dd656a9914e72ad` (`U-STORE-SECURITY-ADOPT`) — the
  //  new value is that chain's next link. **THE NEW VALUE IS MEASURED, never inferred**
  //  (`md5sum src/main/preload.ts`, taken at this unit's landing head AFTER its `src/` writes:
  //  `eb230a8bcbe9b5444f95aa6a89c7fec2`). **NO OTHER ROW OF THIS TABLE IS TOUCHED** — the table stays
  //  SEVEN rows and `UNRESTATED_CONTROL_PATH` stays DERIVED from the table itself (this row already
  //  carried a `restated:` field, so the derivation still resolves to `src/shared/demo-envelope.ts`).
  //  ⟨THE `restated:` FIELD IS DELIBERATELY LEFT NAMING `U-STORE-SECURITY-ADOPT`, AND THE REASON IS A
  //  LANDED ORACLE RATHER THAN PREFERENCE:⟩ `tests/pd-store-security-write.test.ts` (arms 1 and 3) and
  //  `tests/store-security-write-register.test.ts` (`P-SSW-H-3`) pin THIS row's `restated` to
  //  `'U-STORE-SECURITY-ADOPT'` and require the `U-STORE-PERSIST-ADOPT`-era superseded digest literal to
  //  stay VISIBLE on the row's OWN line. This unit is not licensed to move those oracles, so `U-1b`'s
  //  re-statement is recorded exactly as the row's licence allows: **the reason, the unit and the whole
  //  superseded chain are named in this note**, the digest is re-MEASURED, and the SSW-era literal stays
  //  on the row line as a trailing note.⟩
  // ⟨RE-STATED 2026-11-16 — unit `U-4` (`menu-opener`), §2 `R-4`; §4 `P-TH-SM-1` (e)/(f) / §1.2 (c).⟩
  //  (This row is re-stated a THIRD time; EVERY earlier note above is KEPT VERBATIM as that pass's
  //  record — `RCA-8(c)`, annotate-beside, never rewritten.)
  //  THE ROW'S SUBJECT IS UNCHANGED — the path stays a RECORDED, md5-pinned digest and its TEETH are
  //  not relaxed (an UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the working-tree
  //  limb). WHAT MOVED IS THE RECORDED VALUE, licensed by this row's own text (*"a later pass may move
  //  the file only by re-stating it here, with its reason and its unit named"*). **THE REASON:** `R-4`
  //  adds ONE top-level `ProvidentBridge` member — `onSettingsOpen(handler: () => void): () => void`,
  //  the `onPaneVisibility` analogue for the native View opener's arrival, implemented over ONE
  //  `ipcRenderer.on` whose listener ignores the payload and returns the detach for the SAME listener —
  //  so its bytes MOVE by construction. **THE UNIT:** `U-4` (`menu-opener`), contract
  //  `docs/L1/unit-u-4-menu-opener.md` §2 `R-4` / §5.2.
  //  ⟨THE `restated:` FIELD IS AGAIN DELIBERATELY LEFT NAMING `U-STORE-SECURITY-ADOPT`, AND THE REASON
  //  IS THE `U-1b` PRECEDENT TAKEN ON THIS SAME ROW:⟩ two LANDED oracles pin it —
  //  `tests/store-security-write-register.test.ts` (`P-SSW-H-3`) and `tests/pd-store-security-write.test.ts`
  //  (arm 3(a)) — and THIS unit is not licensed to move them. So the re-statement names the unit (`U-4`),
  //  the reason (`R-4`) and the WHOLE superseded chain in this note, RE-MEASURES the digest, and leaves
  //  the pinned field alone: `76d2299070d4333e0e66189359baad22` (as filed) ←
  //  `00dba3cdd5e1eb3c7de632a838e3d28b` ← `f24ea717a5f8f93a3ac490334611d22a` (SSW-era) ←
  //  `21b8120cddadd1b1531bd0422cb5d613` ← `cb1ee2ff3cd409363dd656a9914e72ad` ←
  //  `eb230a8bcbe9b5444f95aa6a89c7fec2` (`U-1b`) — the new value is that chain's next link. **THE NEW
  //  VALUE IS MEASURED, never inferred** (`md5sum src/main/preload.ts`, run TWICE at this landing's head
  //  AFTER every `src/` write, identical both times: `78b237e4d53af16a846ec540c4b5be7c`). **NO OTHER ROW
  //  OF THIS TABLE IS TOUCHED** — the table stays SEVEN rows and `UNRESTATED_CONTROL_PATH` stays DERIVED
  //  from the table itself (still `src/shared/demo-envelope.ts`) and is NOT hand-edited here.
  // ⟨RE-STATED 2026-11-18 — unit `B-2` (`display-wire`), §4; §4 `P-TH-SM-1` (e)/(f) / §1.2 (c).⟩
  //  (This row is re-stated a FOURTH time; EVERY earlier note above is KEPT VERBATIM as that pass's
  //  record — `RCA-8(c)`, annotate-beside, never rewritten.)
  //  THE ROW'S SUBJECT IS UNCHANGED — the path stays a RECORDED, md5-pinned digest and its TEETH are
  //  not relaxed (an UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the working-tree
  //  limb). WHAT MOVED IS THE RECORDED VALUE, and the move is LICENSED BY THIS ROW'S OWN TEXT: *"a
  //  later pass may move the file only by re-stating it here, with its reason and its unit named"*.
  //  **THE REASON:** `B-2` lands the DISPLAY CROSSING's bridge half — ONE top-level `ProvidentBridge`
  //  member `display` (`{ read, onChanged }`, the realm's ONLY door to the crossing), implemented over
  //  the TWO channel constants that same landing declares in `src/main/store-channels.ts`
  //  (`DISPLAY_READ`, a REQUEST over `invoke`/`handle`; `DISPLAY_CHANGED`, a SIGNAL over `send`/`on`
  //  that carries nothing) — so its bytes MOVE by construction. **THE UNIT:** `B-2` (`display-wire`),
  //  contract `docs/L1/unit-b-2-display-wire.md` §4 / §9. **THE SUPERSEDED VALUE IS THE ROW'S OWN
  //  `superseded:` FIELD BESIDE IT** (`78b237e4d53af16a846ec540c4b5be7c`, the `U-4` value, kept
  //  VISIBLE and NEVER deleted; the SSW-era literal `f24ea717a5f8f93a3ac490334611d22a` STAYS VISIBLE
  //  on the row line, because two landed SSW oracles require it there). **THE NEW VALUE IS MEASURED,
  //  never inferred** (`md5sum src/main/preload.ts`, run TWICE at this landing's head AFTER every
  //  `src/` write, identical both times: `b13c31891c2d798f01f7041d920ff49b`). **NO OTHER ROW OF THIS
  //  TABLE IS TOUCHED** — it stays SEVEN rows and `UNRESTATED_CONTROL_PATH` stays DERIVED from the
  //  table itself (still `src/shared/demo-envelope.ts`) and is NOT hand-edited here; and
  //  `src/shared/types.ts`, the OTHER file this unit's neighbourhood touches, is NOT touched by `B-2`
  //  at all, so its row stays at `8cdc2b81eef0b3fb0cd7a96f95881009`.
  //  ⟨THE `restated:` FIELD IS AGAIN DELIBERATELY LEFT NAMING `U-STORE-SECURITY-ADOPT`, AND THE REASON
  //  IS THE `U-1b`/`U-4` PRECEDENT TAKEN ON THIS SAME ROW:⟩ two LANDED oracles pin it —
  //  `tests/store-security-write-register.test.ts` (`P-SSW-H-3`) and `tests/pd-store-security-write.test.ts`
  //  (arm 3(a)) — and THIS unit is not licensed to move them. So the re-statement names the unit
  //  (`B-2`), the reason and the WHOLE superseded chain in this note, RE-MEASURES the digest, and
  //  leaves the pinned field alone: `76d2299070d4333e0e66189359baad22` (as filed) ←
  //  `00dba3cdd5e1eb3c7de632a838e3d28b` ← `f24ea717a5f8f93a3ac490334611d22a` (SSW-era) ←
  //  `21b8120cddadd1b1531bd0422cb5d613` ← `cb1ee2ff3cd409363dd656a9914e72ad` ←
  //  `eb230a8bcbe9b5444f95aa6a89c7fec2` (`U-1b`) ← `78b237e4d53af16a846ec540c4b5be7c` (`U-4`) — the
  //  new value is that chain's next link.⟩
  { file: 'src/main/preload.ts', md5: 'b13c31891c2d798f01f7041d920ff49b', superseded: '78b237e4d53af16a846ec540c4b5be7c', restated: 'U-STORE-SECURITY-ADOPT' }, // ⟨RE-STATED BY `U-1b` 2026-11-15 (`C-6`, D-22 (1)): the md5 is re-MEASURED at the landing head and the immediate predecessor `cb1ee2ff3cd409363dd656a9914e72ad` is its `superseded` field; the SSW-era superseded literal stays visible on this line — `f24ea717a5f8f93a3ac490334611d22a`⟩ ⟨RE-STATED BY `U-4` 2026-11-16 (`R-4`, the `onSettingsOpen` bridge member): the md5 is re-MEASURED at the landing head and `U-1b`'s `eb230a8bcbe9b5444f95aa6a89c7fec2` is now this row's `superseded` field; the SSW-era superseded literal `f24ea717a5f8f93a3ac490334611d22a` STAYS VISIBLE on this line and the pinned `restated:` field is left alone (two landed SSW oracles pin it — the `U-1b` precedent)⟩ ⟨RE-STATED BY `B-2` 2026-11-18 (`docs/L1/unit-b-2-display-wire.md` §4, the display crossing's bridge member): the md5 is re-MEASURED at the landing head and `U-4`'s `78b237e4d53af16a846ec540c4b5be7c` is now this row's `superseded` field; the SSW-era superseded literal `f24ea717a5f8f93a3ac490334611d22a` STAYS VISIBLE on this line, the pinned `restated:` field is left alone (two landed SSW oracles pin it — the `U-1b`/`U-4` precedent), and the reason + unit are named in the note block above⟩
  // ⟨RE-STATED 2026-10-04 — unit `U-ZONE-REPLACEMENT` / `PD-UI-14`, §5 `G-7` / §10 `O-8`.⟩
  //  THE ROW'S SUBJECT IS UNCHANGED — §4 `P-TH-SM-1` (e)/(f) / §1.2 (c): the path stays a
  //  RECORDED, md5-pinned digest and its TEETH are not relaxed (an UNRECORDED move of it still
  //  FAILS both the ⟨A-1⟩ digest limb and the working-tree limb). WHAT MOVED IS THE RECORDED
  //  VALUE, and the move is LICENSED BY THIS ROW'S OWN TEXT: *"a later pass may move the file
  //  only by re-stating it here, with its reason and its unit named"*. **THE REASON:** this
  //  unit REPLACES the zone/sidebar build inside that file — §3 row 3's `gutter` adoption
  //  reduces the file's hand-rolled resize-controller duplicate to the vendored module's
  //  composition, and §3 row 5's `gutter-affordance` adoption takes the fork's cursor/axis
  //  seams with it — so its bytes MOVE by construction and §5 `G-7` is the clause that orders
  //  this one row re-stated in the landing's own commit. **THE UNIT:** `U-ZONE-REPLACEMENT`
  //  (`PD-UI-14`). THE SUPERSEDED VALUE, kept visible and NEVER deleted:
  //  `df1930a3d6cac72796cc6c42609dd6c6`. THE NEW VALUE is MEASURED at the landing's final head
  //  (`md5sum src/renderer/sidebar-panes.ts`), AFTER this unit's `src/` writes — never inferred,
  //  never copied from another row. NO OTHER ROW OF THIS TABLE IS TOUCHED by this re-statement.
  // ⟨RE-STATED AGAIN 2026-10-04 — the SAME unit (`U-ZONE-REPLACEMENT` / `PD-UI-14`) and the SAME clause
  //  (§5 `G-7` / §10 `O-8`).⟩ **THE SUBJECT, THE MECHANISM AND THE TEETH ARE UNCHANGED** (the path stays a
  //  RECORDED md5 digest; an UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the
  //  working-tree limb). **WHAT MOVED IS THE RECORDED VALUE**, licensed by this row's own text
  //  (*"a later pass may move the file only by re-stating it here, with its reason and its unit
  //  named"*). **THE REASON:** the unit's GATE-4 FIX PASS then moved the SAME file again, under this
  //  unit's own contract — §3 row 1's write rule (`'0px'` is the collapse write, a SIZED value must be
  //  applied) and §3 row 1/§3.4's write site (`sidebar-panes.ts` → `applyZoneTracks`, which now applies the
  //  §3 row 2 projection record, the one-write controller composition, and the session seam the wiring
  //  supplies) — so its bytes moved by construction and this row is re-stated a second time.
  //  **THE SUPERSEDED VALUES, kept visible and NEVER deleted:** `df1930a3d6cac72796cc6c42609dd6c6`
  //  (the pre-landing value) and `3f87d796f19ac839c9837d0d6f0506e8` (the landing's first re-statement).
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, taken at the
  //  fix pass's head AFTER its `src/` writes). **NO OTHER ROW OF THIS TABLE IS TOUCHED.**
  // ⟨RE-STATED 2026-11-15 — unit `U-1a` (`zone-vocabulary`), THE D-16 ZONE RENAME; §4 `P-TH-SM-1` (e)/(f) / §1.2 (c).⟩
  //  THE ROW'S SUBJECT IS UNCHANGED — the path stays a RECORDED, md5-pinned digest and its TEETH are not relaxed (an
  //  UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the working-tree limb). WHAT MOVED IS THE RECORDED
  //  VALUE, and the move is LICENSED BY THIS ROW'S OWN TEXT: *"a later pass may move the file only by re-stating it here,
  //  with its reason and its unit named"*. **THE REASON:** `U-1a` lands the D-16 ZONE RENAME WHOLE and
  //  `src/renderer/sidebar-panes.ts` is one of its write sites — `LayoutZoneName` becomes `'top' | 'bottom' | 'left' |
  //  'right'` (the two row zones the pre-rename vocabulary called `header`/`footer` renamed BY POSITION to `top`/`bottom`,
  //  `ASM-U1a-1`), the authored carrier the pane graph writes becomes the bare `zone` attribute (no alias, no dual read:
  //  `ASM-U1a-3`), the MCP-visible container ids become `zone:top`/`zone:bottom`, and the persisted pane entry's member
  //  moves `order` → `index` — so its bytes MOVE by construction, and §2 row 11 of
  //  `docs/L1/unit-u-1a-zone-vocabulary.md` is the clause that orders THIS row re-stated in the landing's own commit.
  //  **THE UNIT:** `U-1a` (`zone-vocabulary`) — the split's first of three (`docs/L1/unit-u-1a-zone-vocabulary.md` §1).
  //  **THE SUPERSEDED CHAIN, kept VISIBLE and NEVER deleted:** `df1930a3d6cac72796cc6c42609dd6c6` (the pre-landing value)
  //  ← `3f87d796f19ac839c9837d0d6f0506e8` (`U-ZONE-REPLACEMENT`'s landing re-statement) ←
  //  `f0b43b52565ad33145a3c979599214eb` (the same unit's GATE-4 fix pass) — the new value is that chain's fourth link.
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, taken at this unit's landing
  //  head AFTER its `src/` writes: `c56e3aac3bb4cf32302636d69d7c1b64`, measured twice and identical). **NO OTHER ROW OF
  //  THIS TABLE IS TOUCHED** — the table stays SEVEN rows; `UNRESTATED_CONTROL_PATH` stays DERIVED from the table itself
  //  (this row already carried a `restated:` field, so the derivation still resolves to the first row with none,
  //  `src/shared/demo-envelope.ts`) and is NOT hand-edited here; and `src/main/preload.ts` IS NOT TOUCHED by this unit
  //  (its carrier work is `U-1b`'s and it carries no zone literal — so it is not re-recorded either).
  // ⟨RE-STATED 2026-11-15 — unit `U-1b` (`zone-collapse`), D-22 (1); §4 `P-TH-SM-1` (e)/(f) / §1.2 (c).⟩
  //  (This row is re-stated a SECOND time inside `U-1b`; the `U-1a` re-statement block above is KEPT
  //  VERBATIM as that pass's record, `RCA-8(c)` — annotate-beside, never rewritten.)
  //  THE ROW'S SUBJECT IS UNCHANGED — the path stays a RECORDED, md5-pinned digest and its TEETH are not
  //  relaxed (an UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the working-tree limb).
  //  WHAT MOVED IS THE RECORDED VALUE, licensed by this row's own text (*"a later pass may move the file
  //  only by re-stating it here, with its reason and its unit named"*). **THE REASON:** D-22 (1) answers
  //  question 1 with ONE collapsed state, so every site in this file that names the zone state moves in
  //  this unit: the act becomes `private zoneCollapseToggle(zone)`, `paneTabExpand` writes `collapsed:
  //  false` instead of the superseded zone member (`C-5`'s left column in
  //  `docs/L1/unit-u-1b-zone-collapse.md` — not spelled here, this unit's vocabulary census forbids it
  //  under `tests/**`, `RCA-8(c)`), both `isGutterResizable` call sites read `zoneCollapsedOf(...)`, the
  //  bridge map key and its comment, the `applyZoneTracks` prose, and the four mirror prose sites (the
  //  zone container's mirror class becomes `is-collapsed`). Its bytes therefore MOVE by construction and
  //  §2 `C-6` orders THIS row re-stated in the landing's own commit.
  //  **THE UNIT:** `U-1b` (`zone-collapse`), contract `docs/L1/unit-u-1b-zone-collapse.md`.
  //  **THE SUPERSEDED CHAIN, kept VISIBLE and NEVER deleted:** `df1930a3d6cac72796cc6c42609dd6c6` (the
  //  pre-`U-ZONE-REPLACEMENT` value) ← `3f87d796f19ac839c9837d0d6f0506e8` (`U-ZONE-REPLACEMENT` landing) ←
  //  `f0b43b52565ad33145a3c979599214eb` (that unit's GATE-4 fix pass) ← `c56e3aac3bb4cf32302636d69d7c1b64`
  //  (`U-1a` `zone-vocabulary`) — the new value is that chain's fifth link.
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, taken at this
  //  unit's landing head AFTER its `src/` writes: `153841785965f9efe68c410313c37214`). **NO OTHER ROW OF
  //  THIS TABLE IS TOUCHED** — the table stays SEVEN rows; `UNRESTATED_CONTROL_PATH` stays DERIVED from
  //  the table itself (this row already carried a `restated:` field).
  // ⟨RE-STATED AGAIN 2026-11-15 — the SAME unit (`U-1b`, `zone-collapse`), the SAME clause (§4 `P-TH-SM-1`
  //  (e)/(f) / §1.2 (c)); this is the POST-LANDING REPAIR PASS that follows the landing's adversarial `G5`
  //  pass.⟩ (The `U-1b` landing re-statement block directly above is KEPT VERBATIM as that pass's record,
  //  `RCA-8(c)` — annotate-beside, never rewritten; the figure IT measured is the `superseded:` value below.)
  //  THE ROW'S SUBJECT IS UNCHANGED — §4 `P-TH-SM-1` (e)/(f) / §1.2 (c): the path stays a RECORDED,
  //  md5-pinned digest and its TEETH are not relaxed (an UNRECORDED move of it still FAILS both the ⟨A-1⟩
  //  digest limb and the working-tree limb). WHAT MOVED IS THE RECORDED VALUE, licensed by this row's own
  //  text (*"a later pass may move the file only by re-stating it here, with its reason and its unit
  //  named"*). **THE REASON:** the `G5` adversarial pass's FIX 2 landed the SECOND CARRIER for the ONE
  //  collapsed state (`ASM-U1b-9`): the RUNTIME MIRROR in `src/renderer/sidebar-panes.ts` now RE-EMITS the
  //  zone container's `props.collapsed` carrier in the SAME state-slice as its `is-collapsed` class, so the
  //  two carriers cannot disagree at the runtime mirror — its bytes MOVE by construction, and §2 `C-6` is
  //  the clause that orders THIS row re-stated in the repairing pass's own commit. **THE UNIT:** `U-1b`
  //  (`zone-collapse`), contract `docs/L1/unit-u-1b-zone-collapse.md`. **THE SUPERSEDED CHAIN, kept VISIBLE
  //  and NEVER deleted:** `df1930a3d6cac72796cc6c42609dd6c6` (the pre-`U-ZONE-REPLACEMENT` value) ←
  //  `3f87d796f19ac839c9837d0d6f0506e8` (`U-ZONE-REPLACEMENT` landing) ← `f0b43b52565ad33145a3c979599214eb`
  //  (that unit's GATE-4 fix pass) ← `c56e3aac3bb4cf32302636d69d7c1b64` (`U-1a` `zone-vocabulary`) ←
  //  `153841785965f9efe68c410313c37214` (`U-1b`'s landing re-statement — the value on the row line below as
  //  `superseded:`); the new value is that chain's SIXTH link. **THE NEW VALUE IS MEASURED, never inferred**
  //  (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this repair pass's head, identical both times:
  //  `01ccc70c8ada681854d995e45fc9c82a`). **NO OTHER ROW OF THIS TABLE IS TOUCHED** — the table stays SEVEN
  //  rows (`tests/pd-atomicity-sweep-class-b.test.ts` §2.7 `C-3` pins the seven-row census and is NOT moved
  //  by this pass); `UNRESTATED_CONTROL_PATH` stays DERIVED from the table itself (this row already carried a
  //  `restated:` field, so the derivation still resolves to `src/shared/demo-envelope.ts`); and
  //  `src/main/preload.ts` IS NOT TOUCHED BY THIS PASS — its recorded `eb230a8bcbe9b5444f95aa6a89c7fec2` was
  //  re-MEASURED at this head and still reads MATCH, so it is not re-recorded.
  // ⟨RE-STATED 2026-11-15 — unit `U-2` (`pane-head`), §4 `P-TH-SM-1` (e)/(f) / §1.2 (c); `RCA-8(c)`
  //  ANNOTATE-BESIDE.⟩ (Both `U-1b` re-statement blocks above are KEPT VERBATIM as those passes'
  //  records — annotate-beside, never rewritten; the figure the SECOND of them measured is the
  //  `superseded:` value on the row below.)
  //  THE ROW'S SUBJECT IS UNCHANGED — the path stays a RECORDED, md5-pinned digest and its TEETH are
  //  not relaxed (an UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the working-tree
  //  limb). WHAT MOVED IS THE RECORDED VALUE, licensed by this row's own text (*"a later pass may move
  //  the file only by re-stating it here, with its reason and its unit named"*). **THE REASON:** `U-2`
  //  `C-3` (the one-leaf collapse) replaces the act's inline `panes.map(...)` flip with ONE
  //  `this.setLayout(setPaneCollapsed(base, paneId, entry.collapsed !== true))`, so this file's bytes
  //  MOVE BY CONSTRUCTION in that landing; §2 `C-7` orders THIS row re-stated in the landing's own
  //  pass. **THE UNIT:** `U-2` (`pane-head`), contract `docs/L1/unit-u-2-pane-head.md`. **THE
  //  SUPERSEDED CHAIN, kept VISIBLE and NEVER deleted:** `df1930a3d6cac72796cc6c42609dd6c6` (the
  //  pre-`U-ZONE-REPLACEMENT` value) ← `3f87d796f19ac839c9837d0d6f0506e8` (`U-ZONE-REPLACEMENT`
  //  landing) ← `f0b43b52565ad33145a3c979599214eb` (that unit's GATE-4 fix pass) ←
  //  `c56e3aac3bb4cf32302636d69d7c1b64` (`U-1a` `zone-vocabulary`) ← `153841785965f9efe68c410313c37214`
  //  (`U-1b`'s landing re-statement) ← `01ccc70c8ada681854d995e45fc9c82a` (`U-1b`'s `G5` FIX 2
  //  second-carrier re-emit — the value on the row line below as `superseded:`); the new value is that
  //  chain's SEVENTH link. **THE NEW VALUE IS MEASURED, never inferred** (`md5sum
  //  src/renderer/sidebar-panes.ts`, run TWICE at this landing's head AFTER every `src/` write, identical
  //  both times: `24322cccde5875dd1406e6fa34e946e5`). **NO OTHER ROW OF THIS TABLE IS TOUCHED** — the
  //  table stays SEVEN rows (`pane-graph.ts`/`renderer.ts`/`index.html` are NOT in it, so their landing
  //  owes no second record); `UNRESTATED_CONTROL_PATH` stays DERIVED from the table itself (this row
  //  already carried a `restated:` field, so the derivation still resolves to
  //  `src/shared/demo-envelope.ts`); and `src/main/preload.ts` IS NOT TOUCHED BY THIS UNIT — the bridge
  //  seam keeps its name `togglePaneCollapse` (only the authored control's OPERAND moves,
  //  `data-pane-id` → `props.pane`), so its recorded digest is not re-recorded.
  // ⟨RE-STATED 2026-11-15 — unit `U-3` (`pane-move`), §4 `P-TH-SM-1` (e)/(f) / §1.2 (c); `RCA-8(c)`
  //  ANNOTATE-BESIDE.⟩ (Every `U-1b`/`U-2` re-statement block above is KEPT VERBATIM as those passes'
  //  records — annotate-beside, never rewritten; the figure the LAST of them measured
  //  `24322cccde5875dd1406e6fa34e946e5` is the `superseded:` value on the row below.)
  //  THE ROW'S SUBJECT IS UNCHANGED — the path stays a RECORDED, md5-pinned digest and its TEETH are
  //  not relaxed (an UNRECORDED move of it still FAILS both the ⟨A-1⟩ digest limb and the working-tree
  //  limb). WHAT MOVED IS THE RECORDED VALUE, licensed by this row's own text (*"a later pass may move
  //  the file only by re-stating it here, with its reason and its unit named, exactly as this note
  //  does"*). **THE REASON:** `U-3` `C-2` reworks `commitPaneDrop` into the contract's order (resolve
  //  the effective placement → compose the ONE comparison word (zone + place) → the zone-first gate →
  //  ONE `setLayout`) and adds the private `declaredPlacesOf()` (the registry's `defaultOrder`-else-`seq`
  //  enumeration handed to `panePlace` through `panePlacementOf`/`movePane`), so this file's bytes MOVE
  //  BY CONSTRUCTION in that landing; `docs/L3/shell-chrome/pane-move.md` §5 step 7 orders THIS row
  //  re-stated in the landing's own pass. **THE UNIT:** `U-3` (`pane-move`), contract
  //  `docs/L1/unit-u-3-pane-move.md`. **THE SUPERSEDED CHAIN, kept VISIBLE and NEVER deleted:**
  //  `df1930a3d6cac72796cc6c42609dd6c6` (the pre-`U-ZONE-REPLACEMENT` value) ←
  //  `3f87d796f19ac839c9837d0d6f0506e8` ← `f0b43b52565ad33145a3c979599214eb` ←
  //  `c56e3aac3bb4cf32302636d69d7c1b64` ← `153841785965f9efe68c410313c37214` ←
  //  `01ccc70c8ada681854d995e45fc9c82a` ← `24322cccde5875dd1406e6fa34e946e5` (`U-2`'s landing re-statement
  //  — the value on the row line below as `superseded:`); the new value is that chain's EIGHTH link.
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at
  //  this landing's head AFTER every `src/` write, identical both times:
  //  `cc85d7358ba342be5e1736125990b373`). **NO OTHER ROW OF THIS TABLE IS TOUCHED** — the table stays
  //  SEVEN rows (`layout-state.ts`/`pane-graph.ts`/`pane-drag.ts`/`renderer.ts`/`index.html` are NOT in
  //  it, so their landing owes no second record); `UNRESTATED_CONTROL_PATH` stays DERIVED from the table
  //  itself (this row already carried a `restated:` field, so the derivation still resolves to
  //  `src/shared/demo-envelope.ts`); and `src/main/preload.ts` IS NOT TOUCHED BY THIS UNIT — `N` stays
  //  **26** (no IPC channel, no bridge method, no MCP tool, no menu item), so its recorded
  //  `eb230a8bcbe9b5444f95aa6a89c7fec2` was re-MEASURED at this head, still reads MATCH, and is NOT
  //  re-recorded.
  //  ⟨RE-STATED BY `B-3` `pane-update-channel` 2026-11-18 — THE REASON, and the same discipline as the links above.⟩
  //  The file's bytes MOVE BY CONSTRUCTION in this landing: the per-pane paint seam (`updatePane`/`paintPane`/
  //  `panePayloadEnvelope`/`paneDocumentCensus`/`liveEnvelopeOf`), the ONE declared census `REPLUMBED_PANE_IDS`, the
  //  `SidebarPanesOptions.events` member and the `boot`-time registration of that census. Nothing else of the host moves, and no
  //  other row of this table is touched (the table stays SEVEN rows; `UNRESTATED_CONTROL_PATH` still derives to
  //  `src/shared/demo-envelope.ts` because this row already carried a `restated:` field).
  //  **THE NEW VALUE IS MEASURED, never inferred**, and it is the value AFTER the adversarial pass's second round (an
  //  intermediate `f3964b4f03bbea98c0a25a6a7dfaf94d` was recorded between the two rounds and is now this row's `superseded`):
  //  `md5sum src/renderer/sidebar-panes.ts` reads `34045dd2cb281ab785c4681f6f0b7d85` in TWO independent runs at this landing's
  //  head, and the two runs' other three digest limbs agree with it. The links above stay visible.
  //  ⟨RE-STATED BY UNIT `B-5` (`pane-links`) 2026-11-18 — THE REASON, and the same discipline as the links above.⟩
  //  The file's bytes MOVE BY CONSTRUCTION in this landing: the moved census `REPLUMBED_PANE_IDS` (from `gnosis-query` alone
  //  to `gnosis-query` plus `crosslinks`, with its `B-5` cause in the docblock), the ONE subject helper
  //  `linksPaneSubjectNodeId()` (`ASM-B5-1`: `_currentNodeId` else the current document's doc-head) that `refresh()`'s
  //  backlink fetch now asks instead of reading `_currentNodeId` itself, the per-pane dispatch `paintReplumbedPane(paneId)`
  //  (the `boot` subscription's body), and the FIRE in `onRagStoreChanged` between the `pendingContentChange` commit and
  //  `requestRebuild('content')`. Nothing else of the host moves (`updatePane`/`paintPane` are `B-3`'s, byte-for-byte), and no
  //  other row of this table is touched (the table stays SEVEN rows; `UNRESTATED_CONTROL_PATH` still derives to
  //  `src/shared/demo-envelope.ts` because this row already carried a `restated:` field).
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this landing's head
  //  AFTER every `src/` write, identical both times: `1386a404d9a279f103bb254a7455d0ec`) and `B-3`'s
  //  `34045dd2cb281ab785c4681f6f0b7d85` is now this row's `superseded` field. The links above stay visible.
  //  ⟨RE-STATED BY THE `B5-F5` FIX PASS 2026-11-19 (unit `B-5` `pane-links`) — THE REASON, and the same discipline as the links above.⟩
  //  The file's bytes MOVE BY CONSTRUCTION in this pass: `setCurrentDocumentId`/`setCurrentNodeId` now FIRE the `crosslinks` pane
  //  when, and only when, the RESOLVED SUBJECT actually moves (the subject is read before AND after the assignment and the two are
  //  compared — a same-value call dispatches nothing), `paintReplumbedPane`'s re-read now carries a SUBJECT STAMP (the subject
  //  captured before the await and re-resolved after it, a mismatch DROPPING the answer instead of committing and painting a
  //  superseded one — the host's own `pageSubjectStamp`/`superseded()` idiom), and `boot`'s initial document selection assigns the
  //  field directly so a boot is state initialisation and not a subject move. `updatePane`/`paintPane` are byte-unchanged, and no
  //  other row of this table is touched (the table stays SEVEN rows; `UNRESTATED_CONTROL_PATH` still derives to
  //  `src/shared/demo-envelope.ts` because this row already carried a `restated:` field).
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this pass's head AFTER
  //  every `src/` write, identical both times: `9a717c271805794f629caa945d91d045`) and the `pane-links` landing's
  //  `1386a404d9a279f103bb254a7455d0ec` is now this row's `superseded` field. The links above stay visible.
  //  ⟨RE-STATED BY UNIT `B-6` (`pane-doc-nav`) 2026-11-18 — THE REASON, and the same discipline as the links above.⟩
  //  The file's bytes MOVE BY CONSTRUCTION in this landing, and every moving part is NAMED: the ENGINE-ORIGIN label DECLARED once in
  //  the renderer (`ENGINE_ORIGIN_STORE_LABEL`, its home named in the comment — `ASM-B6-1`; a VALUE import of the main module would drag
  //  `undici` into the renderer bundle for one string), the ENGINE branch at `onRagStoreChanged`'s HEAD (exact equality on the `store`
  //  member → `publishChange()` → `return`, ABOVE the three unchanged local guards, so an engine frame is no longer dropped as
  //  foreign), the UNCONDITIONAL local `fire('doc-nav')` between the `pendingContentChange` commit and `requestRebuild('content')`
  //  (`ASM-B6-4`: the store decides, not the kind and not `edgeIds`), the census's THIRD id `doc-nav` with its cause in the
  //  `REPLUMBED_PANE_IDS` docblock, the ONE change-interest declaration (`CHANGE_INTERESTED_PANE_IDS`) plus the `boot` loop's per-id
  //  DECLARATION choice (`subscribeChange` for a change-interested id, plain `subscribe` otherwise — ONE registration per id, never
  //  both), and the `doc-nav` RE-READ ARM in `paintReplumbedPane` with its generation stamp (`ASM-B6-3`) and its gate
  //  (`replumbedPaneCanRender`). `updatePane`/`paintPane` are `B-3`'s, byte-for-byte, and no other row of this table is touched (the
  //  table stays SEVEN rows; `UNRESTATED_CONTROL_PATH` still derives to `src/shared/demo-envelope.ts` because this row already carried
  //  a `restated:` field).
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this landing's head with every
  //  `src/` write already in place, identical both times: `bd8a82cb68dc067770448b5a8abb3296`) and the `B5-F5` fix pass's
  //  `9a717c271805794f629caa945d91d045` is now this row's `superseded` field. The links above stay visible.
  //  ⟨RE-STATED BY UNIT `B-7` (`pane-search-template`) 2026-11-19 — THE REASON, and the same discipline as the links above.⟩
  //  The file's bytes MOVE BY CONSTRUCTION in this landing, and every moving part is NAMED: the census `REPLUMBED_PANE_IDS` gains the
  //  unit's TWO ids (`search` and `template-editor`) with a `B-7` cause paragraph in its docblock and the `B-3` paragraph's
  //  "exactly three" enumeration corrected in place; `paintReplumbedPane`'s docblock records `ASM-B7-1` (both panes owe NO re-read
  //  arm, so both reach `updatePane` synchronously inside the fire) with its BODY byte-untouched; and the five producer sites become
  //  COMMIT then FIRE — `submitQuery` (its `if (anyDirty()) return` guard and its `loadAppGraph` re-assembly DELETED, `ASM-B7-3`),
  //  `submitAdvancedQuery`'s local `rerender` helper (the same deletion, both arms), `searchAdvancedToggle` (`requestRebuild()`
  //  REMOVED), `onTemplateChanged` (commit, then fire, then the KEPT `requestRebuild('template')` — `ASM-B7-4`'s asymmetry) and
  //  `templateValidateResult` (its `requestRebuild()` REMOVED: the verdict reaches nobody but this pane's render).
  //  `paintPane`/`updatePane`/`replumbedPaneCanRender`/`buildTemplateContext`, the `boot` loop and both registrations are
  //  `B-3`/`B-6`'s, byte-for-byte, and no other row of this table is touched (the table stays SEVEN rows; `UNRESTATED_CONTROL_PATH`
  //  still derives to `src/shared/demo-envelope.ts` because this row already carried a `restated:` field).
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this landing's head with every
  //  `src/` write already in place, identical both times: `3b0bf75c315bad5b7d728d9cc17562d9`) and `B-6`'s
  //  `bd8a82cb68dc067770448b5a8abb3296` is now this row's `superseded` field. The links above stay visible.
  //  ⟨RE-STATED BY UNIT `B-8` (`pane-gnosis`) 2026-11-20 — THE REASON, and the same discipline as the links above.⟩
  //  The file's bytes MOVE BY CONSTRUCTION in this landing, and the moving part is NAMED: `B6-F15`'s containment clause — ONE exported counter
  //  `changeInterestSubsetProblems(changeInterest, census)` (pure, total) plus `boot`'s VALIDATE-THEN-SUBSCRIBE (the subscription plan is computed
  //  FIRST and a non-empty problem list refuses the WHOLE plan with one loud error, attaching NO subscription — never a half-subscribed host).
  //  That counter is the module's ONE new export declaration (`strata/modules.json`'s `N` gains +1; `docs/L1/unit-b-8-pane-gnosis.md` §9 `O-1`,
  //  whose edit definition counts export declarations — the census, the declarations and the verdict words are VALUES and move no count).
  //  Nothing else of the host moves: `REPLUMBED_PANE_IDS`, `CHANGE_INTERESTED_PANE_IDS`, `paintReplumbedPane`, `updatePane`/`paintPane` and
  //  both `boot` registrations are `B-3`/`B-6`/`B-7`'s, byte-for-byte. No other row of this table is touched (the table stays SEVEN rows;
  //  `UNRESTATED_CONTROL_PATH` still derives to `src/shared/demo-envelope.ts` because this row already carried a `restated:` field), and
  //  `tests/pd-atomicity-sweep-class-b.test.ts` §2.7 `C-3`'s seven-row census is NOT moved by this pass.
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this landing's head with every
  //  `src/` write already in place, identical both times: `b9cae9415b761b560ceff58cbb3e303b`) and `B-7`'s
  //  `3b0bf75c315bad5b7d728d9cc17562d9` is now this row's `superseded` field. The links above stay visible.
  //  ⟨THIS RE-STATEMENT IS OUTSIDE THIS UNIT'S ENUMERATED TEST WRITE SCOPE AND IS TAKEN UNDER L0'S COUNTERSIGNATURE — the `D-40`/`D-43`
  //  precedent (`B-6` and `B-7` each took this same single-site re-record and asked for countersignature). It is a RECORDED-VALUE
  //  RE-STATEMENT and not a relaxation: no other row's value moves, no assertion is narrowed, and no `expect(` is deleted or weakened.⟩
  //  ⟨RE-STATED AGAIN BY UNIT `B-8` (`pane-gnosis`) — THE `§12a` RE-STATE 2026-11-21 — THE REASON, and the same discipline as every
  //  link above.⟩ The file's bytes moved AGAIN inside this same unit (§12a's amendment, the census grant), and every moving part is NAMED
  //  so the note above cannot be read as the whole story: the census `REPLUMBED_PANE_IDS` gains `gnosis-documents` and `gnosis-wikis`
  //  with its own `B-8` cause paragraph above the declaration (seven ids at this head), the `pane-events.ts`-facing seams WIDEN
  //  (`SidebarPanesOptions.gnosis` gains `documents`, `wikis` and `refreshFromEngine` — the CRUD panes' own controls plus the ENGINE
  //  arm's producer), `installSidebarBridge`'s `methods` gains `gnosisDocuments` and `gnosisWikis` (the two members whose absence made
  //  every `window.provident.sidebar.gnosisDocuments`/`gnosisWikis` body run `undefined?.()`, so the panes were read-once-at-boot — `F-7`),
  //  and the engine branch of `onRagStoreChanged` gains its ONE `refreshFromEngine()` call (the engine descriptor is a TRIGGER and the
  //  host's read is what answers it — `F-3`/`ASM-B8-2`). That ONE call is also why `CHANGE_INTERESTED_PANE_IDS` stays ONE id wide
  //  (`doc-nav`): a `publishChange()` fire reaches a CRUD pane that has no re-read arm by design (`F-4`) and paints nothing, which is
  //  precisely the declared-but-inert path `D-40`'s `m6` class names — the engine route is the host's own producer, never a second
  //  publisher. The engine branch's COMMENT was COMPRESSED in the same pass and that is a comment-only move: the `pane-links` `S1`
  //  clause reads a FIXED `HANDLER_WINDOW_LINES = 70` window from the handler, and the earlier six-line comment pushed
  //  `requestRebuild('content')` past the window's end.
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this landing's head with every
  //  `src/` write already in place, identical both times: `d4a1c00f42e529b1a891b0ae9684f71e`) and the earlier `B-8` note's
  //  `b9cae9415b761b560ceff58cbb3e303b` is now this row's `superseded` field. **THIS IS A RE-STATEMENT, NEVER A RELAXATION:** `expect(`
  //  and `it(` counts on this file are UNCHANGED, the table still carries exactly SEVEN rows, and each of the other six tuples is
  //  BYTE-IDENTICAL to its previous reading. No other row of this table is touched (`UNRESTATED_CONTROL_PATH` still derives to
  //  `src/shared/demo-envelope.ts` because this row already carried a `restated:` field), and `tests/pd-atomicity-sweep-class-b.test.ts`
  //  §2.7 `C-3`'s seven-row census is NOT moved by this re-state either. The superseded chain and every older note on this line stay
  //  VISIBLE — extended, never truncated.⟩
  //  ⟨RE-STATED ONCE MORE BY UNIT `B-8` (`pane-gnosis`) — THE THIRD AND FINAL RE-STATE OF THIS PASS 2026-11-21 — one clause, and it is the
  //  whole of the new cause.⟩ The engine-branch COMMENT moved out of `onRagStoreChanged`'s body and into the method's own docblock, so the
  //  `pane-links` `S1` fixed `HANDLER_WINDOW_LINES = 70` window measures from the handler again and still sees `requestRebuild('content')`;
  //  the branch itself is unchanged in behaviour — its three body lines are the same three lines as before, only shorter of prose.
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this landing's head with every
  //  `src/` write already in place, identical both times: `ed28ce6338ad21927ac07c99a62b55d5`) and the `§12a` note block's
  //  `d4a1c00f42e529b1a891b0ae9684f71e` is now this row's `superseded` field, with `restated: 'pane-gnosis'` KEPT. Every note above stays
  //  VISIBLE, and this is the third reason named in this pass: the first was `B6-F15`'s exported counter, the second was `§12a`'s census
  //  grant plus the widened seams and the engine arm's ONE `refreshFromEngine()` call, and this third is the comment's relocation.
  //  **THIS IS A RE-STATEMENT, NEVER A RELAXATION:** `expect(` and `it(` counts on this file are UNCHANGED, the table still carries
  //  exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous reading — extended, never truncated.⟩
  //  ⟨RE-STATED BY UNIT `B-8` (`pane-gnosis`) — THE CLOSING RE-STATE 2026-11-21 (after the two adversarial findings were fixed), and the
  //  discipline is the same as every link above.⟩ ONE clause, and it is the whole of the new cause: the engine branch's delegate call is
  //  contained in a `try`/`catch` so a throwing producer cannot skip `publishChange()` nor escape into the IPC listener — a synchronously
  //  throwing engine-frame producer was the hole; the branch is otherwise identical (same guard, same delegate, same fire order, the
  //  delegate now wrapped rather than bare).
  //  **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this pass's head with every
  //  `src/` write already in place, identical both times: `a58b3aa4e6d460fd03001145b542d99e`) and the third re-state's
  //  `ed28ce6338ad21927ac07c99a62b55d5` is now this row's `superseded` field, with `restated: 'pane-gnosis'` KEPT. Every note above stays
  //  VISIBLE, and this is the FOURTH reason named in this pass — after `B6-F15`'s exported counter, `§12a`'s census grant plus the widened
  //  seams and the engine arm's ONE `refreshFromEngine()` call, and the engine-branch comment's relocation.
  //  **THIS IS A RE-STATE, NEVER A RELAXATION:** the assertion-call and test-call counts on this file are UNCHANGED, the table still carries
  //  exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous reading — extended, never truncated.⟩
  //  ⟨NOTE — CLOSING SQUARE BRACKETS ARE BANNED IN THIS TABLE'S COMMENTS, and it is MEASURED, not stylistic: the sibling guards
  //  read the table as a slice from the declaration to the FIRST closing square bracket in the text, so one such bracket
  //  anywhere in a comment row TRUNCATES the census (measured at this landing's first attempt: the four rows below this point
  //  vanished and `pd-store-security-journal`'s `DENIED-2-SUBSTRATE`, `pd-store-security-write`'s `DERIVED-CONTROL-VACUOUS` and
  //  `store-security-write-register`'s `S-SSW-MD5-1` all reddened). Write the census in PROSE; never as a bracketed array.⟩
  //  ⟨RE-STATED BY UNIT `B-8` (`pane-gnosis`) — THE CLOSE-OUT RE-STATE 2026-11-21 (both source repairs in; the
  //  `gnosis-crud-panes.ts` narrowing cast lands beside it and is NOT a table subject).⟩ ONE clause, and it is the whole of
  //  the new cause: the engine branch's producer call is CONTAINED in a private method — `containedProducerRefresh()`, a
  //  `try`/`catch` around the delegate's `refreshFromEngine()` followed by the inline `this.events?.publishChange()` — so a
  //  throwing producer cannot skip `publishChange()` nor escape into the IPC listener, and so the handler's body stays
  //  inside the fixed-size window a sibling unit's row reads (`tests/unit/shell-chrome/pane-links.test.ts` `S1`'s
  //  `HANDLER_WINDOW_LINES = 70`, which must still see `requestRebuild('content')`: the containment is REAL, and the
  //  extra comment lines are NOT allowed in the body). **THE NEW VALUE IS MEASURED, never inferred** (`md5sum
  //  src/renderer/sidebar-panes.ts`, run TWICE at this close-out head with every `src/` write already in place, identical
  //  both times: `ecd2e539a9006bc4e56506198ccd6d04`) and the closing re-state's `a58b3aa4e6d460fd03001145b542d99e` is now
  //  this row's `superseded` field, with `restated: 'pane-gnosis'` KEPT. Every note above stays VISIBLE: this is the FIFTH
  //  reason named in this pass — after `B6-F15`'s exported counter, `§12a`'s census grant plus the widened seams and the
  //  engine arm's ONE `refreshFromEngine()` call, the engine-branch comment's relocation, and the closing re-state's
  //  `try`/`catch` around a BARE delegate — and what moved this time is only WHERE that containment LIVES (a named private
  //  method rather than two inline statements in the handler), which is also what keeps `S1`'s fixed window satisfied.
  //  **THIS IS A RE-STATEMENT, NEVER A RELAXATION:** the assertion-call and test-call counts on this file are UNCHANGED,
  //  the table still carries exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous
  //  reading — extended, never truncated.⟩
  //  ⟨RE-STATED A SIXTH TIME BY `B-9` (`pane-operator-settings`) — **THE ADVERSARIAL CLOSE-OUT'S RE-STATE, `2026-11-21`.**⟩ ONE
  //  clause, and it is the whole of the new cause: the operator-settings handler's FIELD CENSUS was corrected on a measurement
  //  (`B-9`'s ADJ 1/2/3), so the file's bytes move BY CONSTRUCTION — `settingsMovesAppGraph` names exactly TWO members
  //  (`representationMode`, `layout`) with the three removed members and their reasons written beside them, a SECOND exported
  //  PURE TOTAL predicate `settingsMovesOperatorCensus` lands (the operator scope's SECTION SET), both predicates read every
  //  member INSIDE the guard and answer MOVED for an INCOMPARABLE one, `onOperatorSettingsChanged` gains
  //  `refreshOperator()` between the fire and the guarded rebuild, and `paintOperatorPane`'s release comment is rewritten to the
  //  measured reading (containment, three censuses, no stale-handler hazard). **THE NEW VALUE IS MEASURED, never inferred**
  //  (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this close-out head with every `src/` write already in place,
  //  identical both times: `74d5947947328efee163231b164deeeb`) and the landing's own recorded value
  //  `092b438e48ddc3b867514cfe08c61954` is now this row's `superseded` field, with `restated: 'pane-operator-settings'` KEPT
  //  (the SAME unit, its close-out pass — the `U-STORE-SECURITY-ADOPT` precedent of leaving a pinned `restated:` alone). **THE
  //  SUPERSEDED CHAIN STAYS VISIBLE:** `092b438e…` ← `4711c554a06a81a999f98bf5be67c3f6` (this row's previous `superseded`,
  //  named here because the field can hold one value at a time) ← the older values still named in the notes above.
  //  **THIS IS A RE-STATEMENT, NEVER A RELAXATION:** the assertion-call and test-call counts on this file are UNCHANGED, the
  //  table still carries exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous reading.
  //  ⟨THE COUNTERSIGNATURE IS OWED TO L0, not assumed — the `D-40`/`D-44` recorded-value precedent, exactly as the landing's own
  //  re-state recorded; the two digest literals and this note are ALL that changed on this row.⟩
  //  ⟨A SEVENTH RE-STATE, SAME PASS, SAME UNIT — and the reason is again a MEASURED correction rather than a cosmetic edit
  //  (`D-43`: evidence against the reading, then fix the reading): the ADVERSARIAL EXAMINATION of this close-out's own bytes found
  //  that two docblocks OVERCLAIMED — `settingsMovesOperatorCensus`'s said the routed `refreshOperator()` CLOSES the
  //  pane/surface disagreement (measured: the handler writes no registry, so on a push arriving outside the local toggle route the
  //  re-author mints the registry's OLD section set and the disagreement SURVIVES the leg; on the local route's own echo the leg
  //  costs a SECOND whole-surface mount), and `settingsMemberPrint`'s said the comparison half "does not share" the printer's
  //  collapse (measured: it shares the nested-`undefined`/`NaN` half, in the UNSAFE direction, while it does detect a cycle).
  //  Both now state their limit at the site, so the file's bytes moved: **`3bac76d4e53ebf9f7723630704bb8081` IS THE MEASURED VALUE**
  //  (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this head, identical both times), `74d5947947328efee163231b164deeeb` is
  //  now this row's `superseded` field, and the chain below stays visible: `3bac76d4…` ← `74d59479…` ← `092b438e…` ← `4711c554…`.
  //  The table still carries exactly SEVEN rows and each of the other six tuples is BYTE-IDENTICAL; assertion/test counts UNCHANGED.
  //  ⟨THE COUNTERSIGNATURE FOR **BOTH** THIS PASS'S RE-STATES IS OWED TO L0 — two literals, one row, no relaxation.⟩
  { file: 'src/renderer/sidebar-panes.ts', md5: '3bac76d4e53ebf9f7723630704bb8081', superseded: '74d5947947328efee163231b164deeeb', restated: 'pane-operator-settings' }, // ⟨RE-STATED BY `B-7` 2026-11-19 (unit `pane-search-template`, contract `docs/L1/unit-b-7-pane-search-template.md` §5 + `docs/L3/shell-chrome/pane-search-template.md` §1/§6): THE REASON — the file's bytes MOVE BY CONSTRUCTION in this landing: the census `REPLUMBED_PANE_IDS` gains `search` and `template-editor` with a `B-7` cause paragraph above the declaration (and the `B-3` paragraph's enumeration corrected in place), `paintReplumbedPane`'s docblock records `ASM-B7-1` with its body untouched, and five producer sites become COMMIT then FIRE (`submitQuery` and `submitAdvancedQuery`'s `rerender` lose `anyDirty()` + `loadAppGraph`; `searchAdvancedToggle` and `templateValidateResult` lose `requestRebuild()`; `onTemplateChanged` gains the fire BEFORE its KEPT `requestRebuild('template')`). **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this landing's head with every `src/` write already in place, identical both times: `3b0bf75c315bad5b7d728d9cc17562d9`) and `B-6`'s `bd8a82cb68dc067770448b5a8abb3296` is now this row's `superseded` field. **THE SUPERSEDED CHAIN STAYS VISIBLE AND SO DO THE OLDER NOTES ON THIS LINE** — `U-3` 2026-11-15 (the act's order becomes placement → ONE word → the zone-first gate → ONE `setLayout`, plus `declaredPlacesOf`), `reveal-without-reassembly` 2026-11-16 (the carrier-fallback pass: `R-2`'s `applyRevealPaint`, `R-3`'s re-pointed `onRevealChange`, `R-5`'s `derivedPlacementOf`/`familyWithTheDraggedPane`), `B-3` (`updatePane`/`paintPane`/`payload`/`documentCensus` + the census + the `events` member + the boot registration), `B-5` (`linksPaneSubjectNodeId`, `paintReplumbedPane`, the `onRagStoreChanged` fire), the `B5-F5` fix pass (the subject stamp, the subject-move fires, the boot document assignment) and `B-6` (the engine-origin label, the engine branch, the unconditional local `fire('doc-nav')`, the change-interest declaration, the `docHeads` arm with its generation stamp and its gate) — every one of them still spelled on the notes above, with its own superseded literal intact.⟩ ⟨KEPT VISIBLE, VERBATIM — the earlier notes on this row:⟩ ⟨RE-STATED BY `U-3` 2026-11-15 (`pane-move` `C-2`: the act's order becomes placement → ONE word → the zone-first gate → ONE `setLayout`, plus `declaredPlacesOf`): the md5 is re-MEASURED at the landing head and `U-2`'s `24322cccde5875dd1406e6fa34e946e5` is now this row's `superseded` field; `U-2`'s own trailing note is kept VISIBLE below and the older links above (`01ccc70c8ada681854d995e45fc9c82a`, `153841785965f9efe68c410313c37214`, `c56e3aac3bb4cf32302636d69d7c1b64`, …) stay visible on the notes above — ⟨SUPERSEDED, kept verbatim: `U-2` read `24322cccde5875dd1406e6fa34e946e5` with `superseded: 01ccc70c8ada681854d995e45fc9c82a`, `restated: 'U-2'`⟩⟩ ⟨RE-STATED BY `reveal-without-reassembly` 2026-11-16 (unit `reveal-without-reassembly`, contract `docs/L1/unit-reveal-without-reassembly.md` §2 `R-1`…`R-5` + `docs/L3/shell-chrome/reveal-without-reassembly.md` §7, the carrier-fallback pass): THE REASON — the file's bytes MOVE BY CONSTRUCTION in this landing: `R-2`'s `private applyRevealPaint()` (the class half on the live `zone:<z>` container's `className`, CONFIRMED by its `zone` attribute, then the TRACK half `this.applyZoneTracks()` unconditionally), `R-3`'s re-pointed `onRevealChange` (the paint, never `rerenderAppGraph`) and the PAINTED `commitPaneDrop` clear, and `R-5`'s record back-fill `derivedPlacementOf`/`familyWithTheDraggedPane` (the `H1` derivation with TWO callers); `syncZoneMirrors`/`currentZoneMirror`/`rerenderAppGraph` are BYTE-UNCHANGED, and `pane-drag.ts` does NOT move. **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE at this landing's head AFTER every `src/` write, identical both times: `56397cba66afbac501dcf40a612040ad`) and `U-3`'s `cc85d7358ba342be5e1736125990b373` is now this row's `superseded` field. **THE SUPERSEDED CHAIN STAYS VISIBLE AND NO LINK IS DELETED** — `U-3`'s own trailing note is kept verbatim above (`cc85d735…`, `superseded: 24322ccc…`, `restated: 'U-3'`), and the whole older chain (`24322cccde5875dd1406e6fa34e946e5`, `01ccc70c8ada681854d995e45fc9c82a`, `153841785965f9efe68c410313c37214`, `c56e3aac3bb4cf32302636d69d7c1b64`, `f0b43b52565ad33145a3c979599214eb`, `3f87d796f19ac839c9837d0d6f0506e8`, `df1930a3d6cac72796cc6c42609dd6c6`) stays visible on the notes above. **NO OTHER ROW OF THIS TABLE IS TOUCHED** — it stays SEVEN rows (and `src/renderer/pane-graph.ts` is NOT in it, so its exported `zoneMirrorClasses` + the new `zoneMirrorsFor` owe no second record); `UNRESTATED_CONTROL_PATH` stays DERIVED (this row still carries a `restated:` field, so the derivation still resolves to `src/shared/demo-envelope.ts`); and `src/main/preload.ts` IS NOT TOUCHED by this unit — `N` stays **26**, so its recorded `eb230a8bcbe9b5444f95aa6a89c7fec2` was re-MEASURED at this head, still reads MATCH, and is NOT re-recorded⟩ ⟨RE-STATED BY UNIT `B-6` (`pane-doc-nav`) 2026-11-18: the md5 is re-MEASURED at the landing head (`bd8a82cb68dc067770448b5a8abb3296`) and the `B5-F5` fix pass's `9a717c271805794f629caa945d91d045` is now this row's `superseded` field, with `restated:` naming this unit; the REASON — the engine-origin label, the engine branch at the head of `onRagStoreChanged`, the unconditional local `doc-nav` fire, the census's third id plus the change-interest declaration and the `boot` loop's per-id declaration choice, and the `doc-nav` re-read arm with its generation stamp and its gate — is named in the note block above⟩ ⟨RE-STATED BY UNIT `B-8` (`pane-gnosis`) 2026-11-20: the md5 is re-MEASURED at the landing head (`b9cae9415b761b560ceff58cbb3e303b`) and `B-7`'s `3b0bf75c315bad5b7d728d9cc17562d9` is now this row's `superseded` field, with the re-statement field naming THIS unit; the REASON — `B6-F15`'s ONE exported counter `changeInterestSubsetProblems(changeInterest, census)` plus `boot`'s validate-then-subscribe, which REFUSES the whole subscription plan rather than attach a half-subscription — is named in the note block above; and this re-record is OUTSIDE this unit's enumerated test write scope, taken under L0's countersignature (the `D-40`/`D-43` precedent): a recorded-value re-statement, never a relaxation⟩ ⟨RE-STATED BY UNIT `B-8` (`pane-gnosis`) — THE `§12a` RE-STATE 2026-11-21: the md5 is re-MEASURED at the head this landing actually leaves behind (`d4a1c00f42e529b1a891b0ae9684f71e`) and the value the earlier `B-8` note on this row recorded (`b9cae9415b761b560ceff58cbb3e303b`) is now this row's `superseded` field, with `restated: 'pane-gnosis'` KEPT; the REASON — §12a's cause, every moving part named — is spelled in the `B-8` `§12a` note block above this row, and the superseded chain plus every older note on this line stay VISIBLE. **A RE-STATEMENT, NEVER A RELAXATION:** `expect(` and `it(` counts on this file are UNCHANGED, the table still carries exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous reading — no assertion is narrowed, weakened or deleted, and no digest is inferred rather than measured⟩ ⟨RE-STATED ONCE MORE BY UNIT `B-8` (`pane-gnosis`) — THE THIRD AND FINAL RE-STATE OF THIS PASS 2026-11-21: the md5 is re-MEASURED at the head this pass actually leaves behind (`ed28ce6338ad21927ac07c99a62b55d5`, `md5sum src/renderer/sidebar-panes.ts` run TWICE, identical both times) and the `§12a` value (`d4a1c00f42e529b1a891b0ae9684f71e`) is now this row's `superseded` field, with `restated: 'pane-gnosis'` KEPT; the REASON is one clause — the engine-branch comment moved out of `onRagStoreChanged`'s body into the method's own docblock so the `pane-links` `S1` fixed 70-line window still sees `requestRebuild('content')`, and the branch itself is unchanged in behaviour — spelled in full in the note block above this row, with the superseded chain and every older note staying VISIBLE. **A RE-STATEMENT, NEVER A RELAXATION:** `expect(` and `it(` counts on this file are UNCHANGED, the table still carries exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous reading — extended, never truncated⟩ ⟨RE-STATED ONCE MORE BY UNIT `B-8` (`pane-gnosis`) — THE CLOSING RE-STATE 2026-11-21 (after the two adversarial findings were fixed): the md5 is re-MEASURED at the head this pass actually leaves behind (`a58b3aa4e6d460fd03001145b542d99e`, `md5sum src/renderer/sidebar-panes.ts` run TWICE, identical both times) and the third re-state's value (`ed28ce6338ad21927ac07c99a62b55d5`) is now this row's `superseded` field, with `restated: 'pane-gnosis'` KEPT; the REASON is one clause — the engine branch's delegate call is contained in a try/catch so a throwing producer cannot skip publishChange() nor escape into the IPC listener — spelled in full in the note block above this row, with the superseded chain and every older note staying VISIBLE. **A RE-STATEMENT, NEVER A RELAXATION:** the assertion-call and test-call counts on this file are UNCHANGED, the table still carries exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous reading — extended, never truncated⟩ ⟨RE-STATED ONCE MORE BY UNIT `B-8` (`pane-gnosis`) — THE CLOSE-OUT RE-STATE 2026-11-21 (after the two source repairs landed): the md5 is re-MEASURED at the head this pass actually leaves behind (`ecd2e539a9006bc4e56506198ccd6d04`, `md5sum src/renderer/sidebar-panes.ts` run TWICE, identical both times) and the closing re-state's value (`a58b3aa4e6d460fd03001145b542d99e`) is now this row's `superseded` field, with `restated: 'pane-gnosis'` KEPT; the REASON is one clause — the engine branch's producer call is CONTAINED in a private method (`containedProducerRefresh()`, a `try`/`catch` around the delegate's `refreshFromEngine()`, then the inline `publishChange()`) so a throwing producer cannot skip `publishChange()` nor escape into the IPC listener, and so the handler's body stays inside the fixed-size window a sibling unit's row reads — spelled in full in the note block above this row, with the superseded chain and every older note staying VISIBLE. **A RE-STATEMENT, NEVER A RELAXATION:** the assertion-call and test-call counts on this file are UNCHANGED, the table still carries exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous reading — extended, never truncated⟩ ⟨RE-STATED BY UNIT `B-9` (`pane-operator-settings`) 2026-11-21 (contract `docs/L1/unit-b-9-pane-operator-settings.md` §4 SITE 1/SITE 2, §5, §6 `O1`/`O6`/`S1`): **THE REASON — the file's bytes MOVE BY CONSTRUCTION in this landing, and every moving part is named.** (i) THE CENSUS `7 -> 9`: `REPLUMBED_PANE_IDS` gains `settings` and `gnosis-status`, each with its own CAUSE PARAGRAPH above the declaration (`settings`' source is the operator-settings PUSH — `onOperatorSettingsChanged` commits then fires — plus the stamped store-listing settlement; `gnosis-status`' source is its OWN settled health report through `onChanged`), so the census is now NINE ids and NO family keeps the pre-migration `refresh()` route. (ii) `paintPane`'s OPERATOR ARM BECOMES A PAINT: step 2 stops answering `operator-scope` and routes to `this.paintOperatorPane(paneId, def, verdict)`, which re-authors ONE section of the RETAINED operator graph and re-renders that surface through its OWN adapter (re-assembling nothing: `0 loadAppGraph`, `0 mountOperator`, `0 refresh()` — `INV-E` holds for every pane family now), plus the exported field-census predicate `settingsMovesAppGraph` and its three private helpers. (iii) `onOperatorSettingsChanged`'s GUARDED REBUILD: the handler COMMITS, FIRES `settings`, and only then re-derives the app graph when `settingsMovesAppGraph(previous, payload)` says an app-graph member moved — replacing the unconditional `requestRebuild('operator')` that re-read the store and CLOBBERED the push that triggered it. (iv) `refreshRegistryManage`'s STAMP: the store-listing re-read bumps a host-owned generation BEFORE the `rag.stores()` call, drops a superseded answer, and on the winning settlement COMMITS then FIRES `settings` instead of re-mounting the operator surface. (v) The `⟨B-9⟩` FALLBACK IN `renderer.ts` IS DELETED: `firePaneUpdate`'s body is now ONLY `paneEvents.fire(paneId)` — no `const report = …`, no `if (report.fired) return`, no `registry.get(paneId)?.scope === 'operator'` probe and no `host.refresh()`, which removes the LAST re-assembly in the app. **THE NEW VALUE IS MEASURED, never inferred** (`md5sum src/renderer/sidebar-panes.ts` at this landing's head, run TWICE with every `src/` write already in place, identical both times: `f509de321979c99872e58aae6edd96f9`), and the close-out `B-8` value `ecd2e539a9006bc4e56506198ccd6d04` is now this row's `superseded` field while `restated:` names THIS unit. **A RE-STATEMENT, NEVER A RELAXATION:** the `expect(` and `it(` counts on this file are UNCHANGED, the table still carries exactly SEVEN rows, and each of the other six tuples is BYTE-IDENTICAL to its previous reading; `UNRESTATED_CONTROL_PATH` stays DERIVED from the table itself (this row still carries a `restated:` field, so the derivation still resolves to `src/shared/demo-envelope.ts`). Every older note on this line stays VISIBLE, in place.⟩ ⟨RE-STATED ONE MORE TIME BY UNIT `B-9` (`pane-operator-settings`) 2026-11-21 — THE GUARDED-REPAIR RE-STATE, and its cause is the whole of it: this SECOND re-state of the SAME landing follows a GUARDED SOURCE REPAIR of the operator paint — the GRAFT ORDERING (the replaced section is grafted into the retained operator graph in the contract's order, BEFORE that surface is re-rendered, so no paint renders a half-swapped tree) and the replaced subtree's `markDestroyed()` RELEASE (the subtree the graft displaces is released through its own `markDestroyed()`, so no destroyed node outlives the swap) — per `docs/L3/shell-chrome/pane-operator-settings.md` §11 `L3-F1`/`F2`/`F3` and the L2 page's `L2-F3` channel-absent degradation. **THE NEW VALUE IS MEASURED AT THIS HEAD, never inferred** (`md5sum src/renderer/sidebar-panes.ts`, run TWICE with every `src/` write already in place, TWO IDENTICAL READINGS: `4711c554a06a81a999f98bf5be67c3f6`), and the landing's `f509de321979c99872e58aae6edd96f9` is now this row's `superseded` field, with the `restated:` field left naming THIS unit and the reason, the unit and the whole superseded chain named here and in the note block above. **A RE-STATEMENT, NEVER A RELAXATION:** the assertion-call and test-call counts on this file are UNCHANGED, the table still carries exactly SEVEN rows, each of the other six tuples is BYTE-IDENTICAL to its previous reading, and every older note on this line stays VISIBLE.⟩
  { file: 'src/shared/demo-envelope.ts', md5: 'fd2178d2ab56be95b929d33422f7d67c' },
  { file: 'src/shared/dom-shim.ts', md5: 'a93e1cfc4fdcf52a01de9c16cf0f5556' },
  { file: 'src/shared/path-fork-cycle.ts', md5: 'eee412ed7609a1c8c727f2dafb2d97fb' },
]

/** §4 `P-TH-SM-1` (e)/(f) and §1.2 (c) — the same set, by path (the superseded list, kept so the
 *  weaker working-tree limb can still name it). */
const UNTOUCHED_BY_THE_LANDING = UNTOUCHED_DIGESTS.map((d) => d.file)

/** ⟨RE-POINTED `2026-10-04` — unit `U-ZONE-REPLACEMENT` / `PD-UI-14`, §5 `G-7` / §10 `O-8`.⟩
 *  THE CONTROL'S SUBJECT IS "an UNRECORDED change is CAUGHT", so the path this control drives
 *  must be one that carries NO recorded re-statement. It is DERIVED from the table itself (a
 *  second, hand-kept copy of the membership would go stale exactly the way the as-filed control
 *  did) and it resolves — at this head — to `src/main/operator-settings-store.ts`: an
 *  `UNTOUCHED_DIGESTS` row with no `restated:` field, i.e. a path §5 `G-7` does NOT license this
 *  unit to move, so an UNRECORDED working-tree change to it must still FAIL.
 *  ⟨SUPERSEDED IN PLACE — `RCA-8(c)`, KEPT VISIBLE, NEVER DELETED: the as-filed control drove
 *   the literal `' M src/renderer/sidebar-panes.ts\n'` and required the reading
 *     `['src/renderer/sidebar-panes.ts: no RECORDED re-statement in §4 `P-TH-SM-1` (f)']`.
 *   WHY IT WAS WRONG: §5 `G-7` / §10 `O-8` REQUIRE that very `sidebar-panes.ts` row to be
 *   RE-STATED when a later RECORDED unit legitimately moves its bytes (superseded value kept
 *   visible, reason and unit named, a `restated:` field) — `U-ZONE-REPLACEMENT` replaces the
 *   zone/sidebar build inside that file, so the landing MUST re-state it. A control demanding
 *   `no RECORDED re-statement` for the ONE row the contract orders re-stated is UNSATISFIABLE
 *   once that licensed re-statement lands (and leaving it un-re-stated only keeps the digest
 *   limb above red). THE FIX IS A RE-POINT, NOT A RELAXATION: the tooth (an UNRECORDED change
 *   to an un-re-stated pinned path FAILS), the reader and the assertion's shape are unchanged,
 *   and the `sidebar-panes.ts` row itself is NOT touched here — its re-statement is the LANDING
 *   pass's act under `G-7`'s own licence, and the digest limb above stays exactly as landed.⟩
 *  ⟨RE-ANCHORED PRE-EMPTIVELY `2026-10-07` — unit `U-ATOMICITY-SWEEP-CLASS-B`, §1.1 member 5 /
 *   §3.2 `I-6` / `O-4`.⟩ THIS IS A PRE-EMPTIVE RE-ANCHOR, NOT A RE-POINT TAKEN AFTER A FAIL: the
 *  difference from the `2026-10-04` precedent above is exactly that this re-point is taken BEFORE
 *  the control goes stale, so the note never asserts a false statement about its own subject.
 *  **WHAT MOVED THE DERIVATION:** member 4's lawful re-statement above gave the
 *  `src/main/operator-settings-store.ts` row a `restated:` field, so
 *  `UNTOUCHED_DIGESTS.find((d) => d.restated === undefined)?.file` — left DERIVED, never
 *  hand-edited — now answers the FIRST row in table order that still carries no recorded
 *  re-statement. **THE PATH IT ACTUALLY RESOLVES TO AT THIS HEAD IS `src/shared/demo-envelope.ts`**
 *  (the three un-re-stated rows are `src/shared/demo-envelope.ts`, `src/shared/dom-shim.ts` and
 *  `src/shared/path-fork-cycle.ts`, and `Array.prototype.find` answers the first of those in table
 *  order). **WHY THAT PATH IS A LEGITIMATE SUBJECT:** `src/shared/demo-envelope.ts` is a row this
 *  unit is **NOT LICENSED TO MOVE** — `U-ATOMICITY-SWEEP-CLASS-B` touches no shared-tree byte,
 *  so the row carries no re-statement and the tooth holds: an UNRECORDED working-tree change to it
 *  must still FAIL. The tooth, the reader, the DERIVED expression and the assertion's shape are
 *  UNCHANGED — **this is an AIM, not a relaxation, and the derivation is NOT hand-edited to this
 *  literal.** (§2.7 `C-4` flags this path as `OWED` to the landed table: were an intervening
 *  landing to re-state a row ahead of `src/shared/demo-envelope.ts`, the derivation would move
 *  again and this note would have to name THAT path — never a relaxed expectation.)⟩ */
const UNRESTATED_CONTROL_PATH = UNTOUCHED_DIGESTS.find((d) => d.restated === undefined)?.file ?? ''

/** ⟨A-1⟩ the digest oracle: ONE reader, driven over the real files AND over a synthetic
 *  "committed change" corpus, so its discrimination is shown rather than asserted. */
function md5Of(bytes: string | Buffer): string {
  return createHash('md5').update(bytes).digest('hex')
}
function digestReading(): Array<{ file: string; recorded: string; actual: string; matches: boolean }> {
  return UNTOUCHED_DIGESTS.map((d) => {
    const actual = md5Of(readFileSync(join(REPO_ROOT, d.file)))
    return { file: d.file, recorded: d.md5, actual, matches: actual === d.md5 }
  })
}
/** A synthetic corpus standing in for "a COMMITTED change" (the case the superseded limb could
 *  not see): one byte of a pinned file's own bytes replaced. */
function committedChangeCorpus(file: string): Buffer {
  const bytes = readFileSync(join(REPO_ROOT, file))
  return Buffer.concat([bytes.subarray(0, 5), Buffer.from(bytes[5] === 0x58 ? 'Y' : 'X'), bytes.subarray(6)])
}
/** ⟨RE-STATED 2026-09-29 — unit `U-APP-HARNESS-READINESS`.⟩ THE RE-SCOPED READER for the weaker,
 *  superseded working-tree limb of `P-TH-SM-1 (f)`: a `git status --porcelain` reading over the
 *  seven pinned paths is ADMISSIBLE iff every path it names (a) carries a RECORDED re-statement in
 *  `UNTOUCHED_DIGESTS` and (b) reads the RECORDED status code — an unstaged modification (` M`),
 *  never a deletion, a rename or a staged change. ANY OTHER PATH IN THE READING IS A FAILURE, so an
 *  unrecorded uncommitted change to any of the seven still reds the row. The oracle is driven BOTH
 *  ways in the row itself (the empty, fully-committed reading is admissible; an unrecorded path and
 *  a non-recorded status code both fail), so its discrimination is shown rather than asserted. */
function unrecordedWorkingTreeChanges(porcelain: string): string[] {
  const restated = new Set(UNTOUCHED_DIGESTS.filter((d) => d.restated !== undefined).map((d) => d.file))
  const problems: string[] = []
  for (const line of porcelain.split('\n')) {
    if (line.trim() === '') continue
    const code = line.slice(0, 2)
    const path = line.slice(3).trim()
    if (!restated.has(path)) {
      problems.push(`${path}: no RECORDED re-statement in §4 \`P-TH-SM-1\` (f)`)
      continue
    }
    if (code !== ' M') problems.push(`${path}: status code "${code}" is not the recorded unstaged modification (" M")`)
  }
  return problems
}

// ===========================================================================
// §4's pinned machinery: the hand-rolled 32-bit LCG, one step per draw.
// ===========================================================================
function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

// ===========================================================================
// The pinned fifteen (read out of the landing pin, never re-typed) and the two
// import-census readers this register's rows drive.
// ===========================================================================
function pinnedFifteenFromPin(): string[] {
  expect(existsSync(SET_PIN_PATH), `RED (PD-UI-1 §2.3): the pin ${SET_PIN_PATH} does not exist — the vendored member set is DERIVED from it`).toBe(true)
  const text = readFileSync(SET_PIN_PATH, 'utf8')
  const block = /const PINNED_FIFTEEN = \[([\s\S]*?)\] as const/.exec(text)
  expect(block, `RED (PD-UI-1 §4): ${SET_PIN_PATH} no longer carries \`const PINNED_FIFTEEN = [ … ] as const\``).not.toBeNull()
  const names = [...block![1]!.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]!)
  expect(names.length, 'the pin’s fifteen-name list must carry fifteen names').toBe(15)
  return names
}

const PINNED_FIFTEEN = pinnedFifteenFromPin()
const VENDORED_PATHS = new Set(PINNED_FIFTEEN.map((n) => resolve(join(REPO_ROOT, 'src', 'shared', `${n}.ts`))))

/** Every import-shaped construct in a source text, by AST — the static `from` form plus the
 *  three forms that evade a text scan (§9 item 1's refused evasion route). */
function importHits(src: string, file: string): Array<{ specifier: string; kind: string }> {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const stemSuffix = new RegExp(`(?:^|/)(${PINNED_FIFTEEN.join('|')})\\.js$`)
  const out: Array<{ specifier: string; kind: string }> = []
  const push = (spec: string, kind: string): void => {
    if (!stemSuffix.test(spec)) return
    out.push({ specifier: spec, kind })
  }
  const walk = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) push(node.moduleSpecifier.text, 'static-from')
    if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteralLike(node.moduleSpecifier)) push(node.moduleSpecifier.text, 'static-from')
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'require') {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'require')
      }
      if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'resolve') {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL')
      }
    }
    if (ts.isNewExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'URL') {
        const arg = node.arguments?.[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL')
      }
    }
    // `import('…')` parses as an ImportExpression whose expression is the `import` keyword.
    // The TYPE-position form (`import('./x.js').T` inside a type annotation, which the repo’s
    // renderer files carry) is a separate TYPE node and is NOT a runtime edge.
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0]
      if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'dynamic-import')
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return out
}

function resolveSpecifier(file: string, spec: string): string {
  if (!spec.startsWith('.')) return `<bare:${spec}>`
  return resolve(dirname(resolve(REPO_ROOT, file)), spec.replace(/\.(js|ts)$/, '.ts'))
}

// ---------------------------------------------------------------------------
// §4 `P-TH-SM-1` (a)/(b) — the two frozen config pins' oracles.
// ---------------------------------------------------------------------------
const FORBIDDEN_CONFIG = /(clearMocks|restoreMocks|mockReset|\bisolate\b|\bpool\b|poolOptions)\s*:/

/** The `'electron'`-mock census derivation (§4 `P-TH-SM-1` (c)): a `vi.mock('electron', …)`
 *  call, by any access form of the bound `vi` (an aliased or computed call joins it too). */
function electronMockFiles(root: string): string[] {
  const list = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = join(dir, e.name)
      if (e.isDirectory()) return list(p)
      return e.name.endsWith('.test.ts') ? [p] : []
    })
  const bindsElectronMock = (src: string): boolean => {
    const sf = ts.createSourceFile('scan.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    const aliases = new Set<string>(['vi'])
    for (const stmt of sf.statements) {
      if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier) || stmt.moduleSpecifier.text !== 'vitest') continue
      const clause = stmt.importClause
      if (clause === undefined) continue
      if (clause.name !== undefined) aliases.add(clause.name.text)
      const named = clause.namedBindings
      if (named !== undefined && ts.isNamespaceImport(named)) aliases.add(named.name.text)
      if (named !== undefined && ts.isNamedImports(named)) {
        for (const el of named.elements) {
          if ((el.propertyName ?? el.name).text === 'vi') aliases.add(el.name.text)
        }
      }
    }
    let found = false
    const walk = (node: ts.Node): void => {
      if (found) return
      if (ts.isCallExpression(node)) {
        const callee = node.expression
        let bound = false
        if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
          bound = callee.name.text === 'mock' && aliases.has(callee.expression.text)
        } else if (ts.isElementAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
          const arg = callee.argumentExpression
          bound = arg !== undefined && ((ts.isStringLiteral(arg) && arg.text === 'mock') || (ts.isIdentifier(arg) && arg.text === 'mock')) && aliases.has(callee.expression.text)
        }
        if (bound) {
          const first = node.arguments[0]
          if (first !== undefined && ts.isStringLiteral(first) && first.text === 'electron') {
            found = true
            return
          }
        }
      }
      ts.forEachChild(node, walk)
    }
    walk(sf)
    return found
  }
  return list(root)
    .filter((f) => bindsElectronMock(readFileSync(f, 'utf8')))
    .map((f) => relative(REPO_ROOT, f).split('\\').join('/'))
    .sort()
}

// ---------------------------------------------------------------------------
// §4 `P-TH-SM-1` (d) — `src/main/markdown-import.ts`'s source contract, read the way the
// protected pin's own row reads it (ONE `.applyBatch(`, putNode before putEdge, no per-op
// persist). This is a READ of a pinned subject; the register writes no byte of it.
// ---------------------------------------------------------------------------
function applyBatchCalls(text: string): number {
  return [...text.matchAll(/\.applyBatch\(/g)].length
}
function perOpPersistSites(text: string): string[] {
  return [...text.matchAll(/\bstore\s*\.\s*(putNode|putEdge|put)\s*\(/g)].map((m) => m[0])
}
function putNodeBeforePutEdge(text: string): boolean {
  const node = text.indexOf("op: 'putNode'")
  const edge = text.indexOf("op: 'putEdge'")
  return node >= 0 && edge >= 0 && node < edge
}

// ---------------------------------------------------------------------------
// §4 `P-TH-SM-1` (e) / `P-TH-SM-2` (a) — the token census, read STRUCTURALLY from the CSS
// (a selector block's own declarations), with an ORACLE function so the controls drive the
// SAME reader over a synthetic corpus.
// ---------------------------------------------------------------------------
function cssBlock(css: string, selectorPattern: RegExp): string | null {
  // CSS COMMENTS ARE STRIPPED FIRST: the token block’s own comment NAMES
  // `html[theme='dark']` in prose, so an un-stripped read picks the comment up as if it
  // were the selector and reports the NEXT block’s braces.
  // ⟨RE-GRAINED `2026-11-15` — unit `U-1c` (`theme-carrier`), D-14: the prose names the LANDED
  //  carrier (`theme`); the SUPERSEDED spelling was `data-theme`, kept visible in this note
  //  (`RCA-8(c)`, annotate-beside). The REASON the strip exists is UNMOVED — which is why the
  //  re-grained prose still names the selector this reader must not mistake for a rule.⟩
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, (c) => ' '.repeat(c.length))
  const m = selectorPattern.exec(stripped)
  if (m === null) return null
  const start = stripped.indexOf('{', m.index)
  if (start < 0) return null
  let depth = 1
  for (let i = start + 1; i < css.length; i++) {
    const ch = css[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return `${m.index}|${start}|${stripped.slice(start + 1, i)}`
    }
  }
  return null
}
function customPropertiesIn(body: string): string[] {
  return [...body.matchAll(/(--[A-Za-z0-9-]+)\s*:/g)].map((m) => m[1]!)
}
/** The oracle: `[rootIndex, rootNames, darkNames]`, or `null` when a required block is absent. */
function tokenBlockOracle(css: string): { rootIndex: number; darkIndex: number; root: string[]; dark: string[]; mediaPresent: boolean; media: string[] } | null {
  // ⟨RE-GRAINED `2026-11-15` — unit `U-1c` (`theme-carrier`), D-14 (the foundation's vocabulary
  //  wins): the CARRIER these two selectors key on is the bare `theme` attribute, so the two
  //  patterns move with it. The SUPERSEDED patterns were `/:root\s*,\s*html\[data-theme='light'\]/`
  //  and `/html\[data-theme='dark'\]/`, kept visible in this note (`RCA-8(c)`, annotate-beside).
  //  WHAT IS **NOT** RE-GRAINED: the fifteen-name census, the `@media` presence/15-name arms and
  //  the root-before-dark ordering arm — this is a RE-POINT of which carrier the blocks are keyed
  //  on, never a change to what the census counts (`§3` row 6 of the unit contract).⟩
  const root = cssBlock(css, /:root\s*,\s*html\[theme='light'\]/)
  const dark = cssBlock(css, /html\[theme='dark'\]/)
  const media = cssBlock(css, /@media\s*\(prefers-color-scheme:\s*dark\)/)
  if (root === null || dark === null) return null
  const mediaPresent = media !== null
  /** `selectorIndex|braceIndex|body` → the part wanted */
  const part = (payload: string, i: number): string => payload.split('|').slice(i).join('|')
  return {
    rootIndex: Number(part(root, 1).split('|')[0]),
    darkIndex: Number(part(dark, 1).split('|')[0]),
    root: [...new Set(customPropertiesIn(part(root, 2)))],
    dark: [...new Set(customPropertiesIn(part(dark, 2)))],
    mediaPresent,
    media: mediaPresent ? [...new Set(customPropertiesIn(part(media!, 2)))] : [],
  }
}

// ---------------------------------------------------------------------------
// §4 `P-TH-SM-2` (b)/(c) — the no-store / no-write-back token scan over this unit's write
// set, and the persistence carrier's byte-identity (`git` is the durable record).
// ---------------------------------------------------------------------------
const STORE_TOKENS = /localStorage|sessionStorage|\bnew Map\(\)|\bnew Set\(\)|\bmemo\b|\bcache\b|createStore/
const WRITE_BACK_TOKENS = /operatorSettings(?:\?\.)*\s*set(?:\?\.)*\s*\(|operatorSet\s*\(/

/** `installTheme`'s BODY, read STRUCTURALLY (braces-balanced from its declaration):
 *  `installTheme` is module-private and NOT exported (§2.2 item 1), so its contract is read
 *  as source, never by importing it. */
function installThemeBodyText(): string {
  const path = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
  expect(existsSync(path), `RED (PD-UI-1 §2.2): ${path} does not exist`).toBe(true)
  const text = readFileSync(path, 'utf8')
  const m = /function installTheme\(\): void \{/.exec(text)
  expect(m, 'RED (PD-UI-1 §2.2 item 1): `function installTheme(): void` is absent — the wiring contract cannot be read').not.toBeNull()
  const start = m!.index + m![0].length
  let depth = 1
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i)
    }
  }
  throw new Error('RED (PD-UI-1 §2.2): the `installTheme` body is unbalanced — the contract cannot be read')
}

// ===========================================================================
// §4 `P-TH-IM-4` — THE VENDORED MODULE IS CONSUMED, NOT TOUCHED
// (6 = 4 facts × 1 reading + 2 independent controls)
// ===========================================================================
describe('§4 P-TH-IM-4 — the vendored module is consumed, not touched (strat:theme-vendored-consumption)', () => {
  /** (a) the digest: the vendored bytes equal the manifest's `md5` for `theme`. */
  function digestOf(): { file: string; manifest: string } | null {
    if (!existsSync(MANIFEST_PATH) || !existsSync(VENDORED_PATH)) return null
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as { modules: Array<Record<string, unknown>> }
    const entry = manifest.modules.find((m) => String(m.name) === 'theme')
    if (entry === undefined) return null
    return { file: createHash('md5').update(readFileSync(VENDORED_PATH)).digest('hex'), manifest: String(entry.md5) }
  }

  it('P-TH-IM-4 (a) — the vendored bytes match the manifest’s `theme` md5 (the Phase-0 digest pin, unchanged by this unit)', () => {
    const d = digestOf()
    expect(d, `RED (PD-UI-1 §4 P-TH-IM-4 (a)): the manifest ${MANIFEST_PATH} or the vendored ${VENDORED_PATH} is absent`).not.toBeNull()
    expect(
      d!.file,
      '§4 P-TH-IM-4 (a) / R-4: a change to a vendored byte is a PIN VIOLATION, not a cleanup — the adoption wraps, never patches',
    ).toBe(d!.manifest)
  })

  it('P-TH-IM-4 (b) — the vendored bytes still carry ZERO imports and none of the four prohibited forms', () => {
    const bytes = readFileSync(VENDORED_PATH, 'utf8')
    expect(importHits(bytes, 'src/shared/theme.ts'), '§4 P-TH-IM-4 (b): the vendored module’s import census is EMPTY (R-2)').toEqual([])
    expect(bytes, '§4 P-TH-IM-4 (b): no `data-theme` literal in the mechanism (P-TH-7)').not.toMatch(/data-theme/)
    expect(bytes, '§4 P-TH-IM-4 (b): no `matchMedia` / `prefers-color-scheme` in the mechanism (P-TH-8)').not.toMatch(/matchMedia|prefers-color-scheme/)
    expect(bytes, '§4 P-TH-IM-4 (b): no store token in the mechanism (P-TH-4/P-TH-11)').not.toMatch(STORE_TOKENS)
    expect(bytes, '§4 P-TH-IM-4 (b): no ambient realm access in the mechanism (P-TH-9)').not.toMatch(/\bdocument\b|\bwindow\b|\bfs\b/)
  })

  it('P-TH-IM-4 (c) — the prohibitions survive the adoption: the adapter does not ask the mechanism for a decision, a default, state or a persistence write', () => {
    expect(existsSync(ADAPTER_PATH), `RED (PD-UI-1 §2.1): the adapter ${ADAPTER_PATH} does not exist`).toBe(true)
    // Comments stripped: the adapter’s own PROSE names the things it does not do (its header
    // says the vendored module is "never read here" and the file documents the mechanism). A
    // token in a comment is documentation; a token in code is the contract.
    const text = readFileSync(ADAPTER_PATH, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, ''))
      .join('\n')
    // the attribute name is the CALLER's (P-TH-7) and is passed IN as data
    expect(text, '§2.1 item 2: the one write site’s attribute name is the fork’s own `\'theme\'` token, passed as the caller’s argument').toMatch(/applyThemeDeclaration\s*\(\s*'theme'/)
    // the adapter READS the vendored resolution’s `prefersDark` member (the ENV READING half
    // of the adoption) — reading the raw argument instead is the corpus §3a `ADV-T4` names.
    expect(text, '§2.1’s NEW internal duty: the adapter must READ the vendored record’s `prefersDark` member rather than hand the raw boolean on').toMatch(/\.prefersDark\b/)
    // the adapter READS the write record’s `removal` member: an unread record is a silent divergence (§2.1 item 3)
    expect(text, '§2.1 item 3: the adapter must honour the declared write record’s `removal` member (§3.2 item 5)').toMatch(/\.removal\b/)
    // no store, no default asked of the mechanism, no sibling imported into it
    expect(text, '§2.4: the adapter asks the mechanism for no default and holds no store').not.toMatch(STORE_TOKENS)
    expect(text, '§2.4 / P-TH-12: no sibling is imported into the mechanism, and the mechanism is never re-exported by the adapter').not.toMatch(/export\s+\{[^}]*\}\s+from\s+['"][^'"]*shared\/theme/)
  })

  it('P-TH-IM-4 (d) — the adapter’s import census is EXACTLY ONE statement, resolving to src/shared/theme.ts', () => {
    expect(existsSync(ADAPTER_PATH), `RED (PD-UI-1 §2.1): the adapter ${ADAPTER_PATH} does not exist`).toBe(true)
    const hits = importHits(readFileSync(ADAPTER_PATH, 'utf8'), 'src/renderer/theme.ts')
    expect(
      hits.map((h) => `${h.specifier} (${h.kind}) → ${relative(REPO_ROOT, resolveSpecifier('src/renderer/theme.ts', h.specifier)).split('\\').join('/')}`),
      'RED (PD-UI-1 §4 P-TH-IM-4 (d)): the census reads 0 at the red head and must read 1 — and the ONE statement must RESOLVE to the vendored `src/shared/theme.ts`, never to a sibling or a bare specifier. §2.1’s own census clause: *"the row asserts the RESOLVED path, never a spelling"*',
    ).toEqual(['../shared/theme.js (static-from) → src/shared/theme.ts'])
    expect(
      VENDORED_PATHS.has(resolveSpecifier('src/renderer/theme.ts', hits[0]!.specifier)),
      'the census’s one hit must resolve to a VENDORED member (the RESOLVED path is the predicate)',
    ).toBe(true)
  })

  it('P-TH-IM-4 CONTROLS — a ONE-BYTE perturbation fails the digest limb and does NOT change the census limb; a zero-import adapter fails the census limb alone', () => {
    // control 1: the by-byte perturbation — the two limbs must be INDEPENDENTLY falsifiable.
    const bytes = readFileSync(VENDORED_PATH, 'utf8')
    const perturbed = bytes.slice(0, 20) + (bytes[20] === 'x' ? 'y' : 'x') + bytes.slice(21)
    const md5 = (t: string): string => createHash('md5').update(t).digest('hex')
    expect(perturbed, 'the synthetic perturbation must really change the bytes').not.toBe(bytes)
    expect(md5(perturbed), 'a ONE-BYTE perturbation MUST fail P-TH-IM-4 (a)').not.toBe(md5(bytes))
    expect(
      importHits(perturbed, 'src/shared/theme.ts'),
      '…and MUST NOT change P-TH-IM-4 (b)’s census reading, so the two limbs are distinguishable',
    ).toEqual(importHits(bytes, 'src/shared/theme.ts'))
    // control 2: an adapter that stops importing the module — §3a `ADV-T4`’s strongest false-green.
    const zeroImportAdapter = `export function resolveTheme(setting: unknown, prefersDark: boolean): 'light' | 'dark' {\n  if (setting === 'light') return 'light'\n  if (setting === 'dark') return 'dark'\n  return prefersDark ? 'dark' : 'light'\n}\n`
    expect(importHits(zeroImportAdapter, 'src/renderer/theme.ts'), 'an adapter with ZERO imports MUST fail the (d) limb').toEqual([])
    // …and the census oracle is not vacuous: it sees the static form AND the three refused forms.
    const forms = [
      `import { resolveTheme } from '../shared/theme.js'\n`,
      `const later = () => import('../shared/theme.js')\n`,
      `const legacy = require('../shared/theme.js')\n`,
      `const p = new URL('../shared/theme.js', import.meta.url)\n`,
    ]
    for (const form of forms) {
      expect(importHits(form, 'src/renderer/theme.ts'), `the census oracle must SEE the refused form ${form.trim()}`).toHaveLength(1)
    }
    expect(
      importHits(`const fixture = "import { X } from '../shared/theme.js'"\n`, 'src/renderer/theme.ts'),
      'a construct inside a STRING must not be a hit — an AST census is not a text scan',
    ).toEqual([])
  })

  it('P-TH-IM-4 — the register’s term is printed as the sum of its factors: 4 facts × 1 reading + 2 independent controls = 6', () => {
    expect(4 * 1 + 2, '§4 P-TH-IM-4: 4 + 2 = 6').toBe(6)
  })
})

// ===========================================================================
// §4 `P-TH-SM-1` — NO `G-9`-PINNED ARTIFACT AND NO PROTECTED FILE IS DISTURBED
// (8 = 6 pin classes × 1 reading + 2 controls)
// ===========================================================================
describe('§4 P-TH-SM-1 — nothing G-9-pinned is disturbed (strat:theme-protected-pin-safety)', () => {
  const PIN_CLASSES = ['vitest.config.testTimeout', 'package.json test scripts', 'the protected bridge-mock census', 'src/main/markdown-import.ts source contract', 'src/renderer/index.html token census', 'the persisted theme carrier’s byte-identity']

  it('P-TH-SM-1 (a) — `vitest.config.ts`’s `testTimeout` reads EXACTLY 15_000 (floor AND ceiling) and the file carries no forbidden override', () => {
    const text = readFileSync(join(REPO_ROOT, 'vitest.config.ts'), 'utf8')
    const m = /testTimeout\s*:\s*([0-9_]+)/.exec(text)
    expect(m, '§1.4 / G-9: the pinned test budget row is gone').not.toBeNull()
    expect(Number(m![1]!.replace(/_/g, '')), 'the pinned budget is EXACTLY 15 000 — floor AND ceiling, both asserted').toBe(15_000)
    expect(text, '§1.4: an edit of ANY kind to `vitest.config.ts` is a protected-pin violation — a wave that wants headroom cannot buy it here (K-6)').not.toMatch(FORBIDDEN_CONFIG)
  })

  it('P-TH-SM-1 (b) — `package.json`’s `scripts.test` / `scripts.test:watch` are the pinned values with no `--testTimeout`', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    expect(pkg.scripts.test).toBe('vitest run')
    expect(pkg.scripts['test:watch']).toBe('vitest')
    expect(pkg.scripts.test, '§1.4: this unit adds no script, no dependency and no leg — and no `--testTimeout` override').not.toMatch(/--testTimeout/)
    expect(pkg.scripts['test:watch']!).not.toMatch(/--testTimeout/)
  })

  it('P-TH-SM-1 (c) — the DERIVED bridge-mock census is EXACTLY the five pinned names, and neither of this unit’s two files joins it', () => {
    const derived = electronMockFiles(join(REPO_ROOT, 'tests'))
    expect(derived.length, 'the census is EMPTY — a pin that scans nothing is not evidence').toBeGreaterThan(0)
    expect(derived.map((f) => f.replace(/^tests\//, '')), '§4 P-TH-SM-1 (c): the census is exactly the five pinned names, DERIVED (never hard-coded)').toEqual(PINNED_BRIDGE_MOCK_CENSUS)
    expect(
      derived.filter((f) => /pd-ui-1-theme/.test(f)),
      '§1.4 / §6.4 item 1 / `K-2`: no file this unit adds may mock `\'electron\'` in any access form — a sixth joiner reds the protected census AND this row',
    ).toEqual([])
  })

  it('P-TH-SM-1 (d) — `src/main/markdown-import.ts` satisfies its source contract (ONE `.applyBatch(`, putNode before putEdge, no per-op persist)', () => {
    const path = join(REPO_ROOT, 'src', 'main', 'markdown-import.ts')
    expect(existsSync(path), `RED (PD-UI-1 §1.4): the protected ${path} does not exist`).toBe(true)
    const text = readFileSync(path, 'utf8')
    expect(applyBatchCalls(text), '§1.4: exactly ONE `.applyBatch(` on the production import path').toBe(1)
    expect(perOpPersistSites(text), '§1.4: NO per-op `store.putNode(`/`store.putEdge(`/`store.put(` — the corpus is applied as ONE atomic batch').toEqual([])
    expect(putNodeBeforePutEdge(text), '§1.4: the `op: \'putNode\'` literal precedes `op: \'putEdge\'` (all putNode ops before all putEdge ops)').toBe(true)
  })

  // ⟨RE-GRAINED `2026-11-15` — unit `U-1c` (`theme-carrier`), D-14: this row's SUBJECT is
  //  unchanged (the fifteen-token census, the two attribute selectors and the `@media` fallback),
  //  and the two selectors are re-pointed to the LANDED carrier `html[theme='light']` /
  //  `html[theme='dark']` (the superseded `html[data-theme=…]` spelling is kept visible in the
  //  messages below, `RCA-8(c)`). The re-grain was authored BEFORE the `index.html` byte moved and
  //  read RED at that head (`tokenBlockOracle` answers `null` when the light/dark block is absent),
  //  which is RCA-1's red for this unit. The census arms are UNMOVED.⟩
  it('P-TH-SM-1 (e) — `src/renderer/index.html`’s 15 token names, its two `html[theme=…]` selectors and its `@media` fallback are unchanged', () => {
    const css = readFileSync(INDEX_HTML_PATH, 'utf8')
    const block = tokenBlockOracle(css)
    expect(block, '§1.2 (c) / R-3 / ⟨U-1c, D-14⟩: the token block’s `:root, html[theme=\'light\']` block and its `html[theme=\'dark\']` block must both be present (the superseded carrier was `html[data-theme=…]`)').not.toBeNull()
    expect([...block!.root].sort(), '§1.2 (c) / §4 P-TH-SM-2 (a): the `:root` block declares EXACTLY the 15 pinned custom-property names (a CENSUS, never a value claim)').toEqual([...PINNED_TOKENS].sort())
    expect([...block!.dark].sort(), '§4 P-TH-SM-2 (a): each of the 15 names is also declared in the `html[theme=\'dark\']` block (carrier re-grained by `U-1c`)').toEqual([...PINNED_TOKENS].sort())
    expect(block!.mediaPresent, '§1.2 (c): the `@media (prefers-color-scheme: dark)` fallback is present').toBe(true)
    expect(
      block!.media.length,
      '§1.2 (c): the fallback redeclares the same fifteen names (a census, not a value claim) — the block is KEPT unchanged by this unit, and `ASM-U1c-3` keeps it keyed on `:root`',
    ).toBe(15)
    expect(
      block!.rootIndex,
      '§1.2 (c): the `:root, html[theme=\'light\']` block precedes the `html[theme=\'dark\']` override, so an explicit attribute still wins by specificity (carrier re-grained by `U-1c`)',
    ).toBeLessThan(block!.darkIndex)
  })

  it('P-TH-SM-1 (f) — the persisted `theme` carrier and the boot wiring’s non-theme neighbours are byte-UNCHANGED: ⟨A-1⟩ per-file RECORDED md5 DIGESTS (a COMMITTED change now fails), with the superseded working-tree reading retained', () => {
    const readings = digestReading()
    expect(readings.length, '§1.2 (c) / §1.4: the seven pinned neighbours of the theme path').toBe(7)
    expect(
      readings.map((r) => `${r.file}: recorded ${r.recorded} ≠ actual ${r.actual}`).filter((_, i) => !readings[i]!.matches),
      '§1.2 (c) / §1.4 (⟨A-1⟩): every pinned file must equal its RECORDED digest — a COMMITTED change fails THIS limb, which the superseded `git status --porcelain` limb could never see (a clean committed tree reads empty for ANY content)',
    ).toEqual([])
    expect(
      readings.every((r) => /^[0-9a-f]{32}$/.test(r.recorded)),
      '⟨A-1⟩ the recorded pins are real md5 digests (a blank/placeholder pin would be vacuous)',
    ).toBe(true)
    // THE SUPERSEDED LIMB, RETAINED AND LABELLED: it catches an UNCOMMITTED working-tree edit
    // (`A-1` removes its vacuous CLAIM, never an assertion the register already carried).
    // ⟨RE-STATED 2026-09-29 — unit `U-APP-HARNESS-READINESS` (reason and unit named; the values are
    //  in the `UNTOUCHED_DIGESTS` note above).⟩ AS FILED this expectation was the EMPTY reading `''`
    // over ALL SEVEN paths, taken against a head at which the vendoring/theme landing is COMMITTED.
    // The two paths `U-APP-HARNESS-READINESS` legitimately moved are UNCOMMITTED at THIS head, so
    // that reading is no longer `''` — the SUPERSEDED READING (`''`) is therefore KEPT VISIBLE here
    // as a DRIVEN VALUE (the first control below) instead of being asserted as the whole expectation.
    // THE MECHANISM IS UNCHANGED (the same `git status --porcelain` over the same seven paths) and
    // THE MEMBERSHIP IS UNCHANGED (all seven are still scanned), and THE TEETH ARE NARROWED, NOT
    // LOOSENED: any path this reading names must carry a RECORDED re-statement AND its recorded
    // status code (` M`, an unstaged modification — never a deletion, a rename or a staged change),
    // so an UNRECORDED uncommitted change to ANY of the seven still FAILS, while the CONTENT of the
    // two re-stated files stays pinned by the recorded digests in the limb above. The oracle is
    // driven BOTH ways below, so the remaining teeth are shown rather than asserted.
    const status = spawnSync('git', ['-C', REPO_ROOT, 'status', '--porcelain', '--', ...UNTOUCHED_BY_THE_LANDING], { encoding: 'utf8' })
    expect(status.status, `could not read \`git status\` for the untouched surface — ${(status.stderr ?? '').trim()}`).toBe(0)
    expect(
      unrecordedWorkingTreeChanges(status.stdout as string),
      '§1.2 (c) / §1.4: (the WEAKER, superseded limb — an uncommitted working-tree change) ⟨RE-STATED 2026-09-29, unit U-APP-HARNESS-READINESS⟩ every path this reading names must carry a RECORDED re-statement at its recorded status code — an UNRECORDED uncommitted change to ANY of the seven still fails',
    ).toEqual([])
    // THE CONTROLS — the SAME reader driven both ways (the ⟨A-1⟩ pattern: one oracle, a synthetic corpus).
    expect(
      unrecordedWorkingTreeChanges(''),
      'the SUPERSEDED reading (EMPTY — a fully committed tree) stays ADMISSIBLE, exactly as filed: the re-statement does not red a committed head',
    ).toEqual([])
    // ⟨RE-POINTED `2026-10-04` — unit `U-ZONE-REPLACEMENT` / `PD-UI-14`, §5 `G-7` / §10 `O-8`:
    //   the control's subject is "an UNRECORDED change is CAUGHT", so its path is one that
    //   carries NO recorded re-statement — the as-filed literal (`src/renderer/sidebar-panes.ts`)
    //   is superseded and KEPT VISIBLE above, because `G-7`/`O-8` order that very row re-stated
    //   (which would make it satisfiable only by violating the contract). THE TOOTH IS UNCHANGED:
    //   an un-re-stated pinned path is not admissible, and the control must HAVE a subject.⟩
    expect(
      UNRESTATED_CONTROL_PATH,
      'the control must have a subject: at least ONE `UNTOUCHED_DIGESTS` row still carries no recorded re-statement — §5 `G-7` re-states exactly ONE row of the seven, so the other six stay un-re-stated and drive this control; if NO row were left un-re-stated the control would be vacuous',
    ).not.toBe('')
    expect(
      unrecordedWorkingTreeChanges(` M ${UNRESTATED_CONTROL_PATH}\n`),
      '…an UNRECORDED path in the same reading must FAIL — the re-statement is a RECORDED exception, never a relaxation',
    ).toEqual([`${UNRESTATED_CONTROL_PATH}: no RECORDED re-statement in §4 \`P-TH-SM-1\` (f)`])
    expect(
      unrecordedWorkingTreeChanges(' D src/shared/types.ts\n'),
      '…and even a RE-STATED path fails on a status code that is not the recorded unstaged modification',
    ).toEqual(['src/shared/types.ts: status code " D" is not the recorded unstaged modification (" M")'])
    expect(
      unrecordedWorkingTreeChanges(' M src/shared/types.ts\n'),
      '…while the recorded re-statement itself IS admissible, else the two controls above would prove nothing',
    ).toEqual([])
  })

  it('P-TH-SM-1 — the register’s term is printed as the sum of its factors: 6 pin classes × 1 reading + 2 controls = 8', () => {
    expect(PIN_CLASSES.length, '§4: the six pin classes are enumerated exactly').toBe(6)
    expect(6 * 1 + 2, '§4 P-TH-SM-1: 6 + 2 = 8').toBe(8)
  })

  it('P-TH-SM-1 CONTROLS — a synthetic config override FAILS the text oracle, a synthetic `vi.mock(\'electron\', …)` corpus JOINS the census (it is DERIVED, not hard-coded), and ⟨A-1⟩ a synthetic COMMITTED change FAILS the digest oracle', () => {
    expect(FORBIDDEN_CONFIG.test('test: { clearMocks: false }'), 'a synthetic `clearMocks: false` config MUST fail P-TH-SM-1 (a)').toBe(true)
    expect(FORBIDDEN_CONFIG.test('test: { testTimeout: 15_000 }'), 'the real config shape must PASS the same oracle, else the control proves nothing').toBe(false)
    // ⟨A-1⟩ THE DIGEST ORACLE, driven BOTH ways: the real bytes pass, a synthetic COMMITTED
    // change (one byte of the same file replaced — the case the superseded `git status` limb
    // could not see) fails, and the two limbs are INDEPENDENT (the change moves no other reading).
    const sample = UNTOUCHED_DIGESTS[0]!
    const realBytes = readFileSync(join(REPO_ROOT, sample.file))
    expect(md5Of(realBytes), '⟨A-1⟩ the real bytes must PASS the recorded digest, else the pin is vacuous').toBe(sample.md5)
    const committed = committedChangeCorpus(sample.file)
    expect(committed.equals(realBytes), 'the synthetic corpus must really differ from the file').toBe(false)
    expect(
      md5Of(committed),
      '⟨A-1⟩ a synthetic COMMITTED change to a pinned file MUST fail the digest oracle — this is the case the superseded `git status --porcelain` limb could not see',
    ).not.toBe(sample.md5)
    expect(
      digestReading().filter((r) => !r.matches),
      '⟨A-1⟩ …and the synthetic change is confined to the corpus: the TREE’s readings all still match (the two limbs are independently falsifiable)',
    ).toEqual([])
    // the second control, driven through the SAME census reader on a synthetic corpus —
    // never by writing a file into `tests/**` (which would mutate the tree under test).
    const synthetic = `import { vi } from 'vitest'\nvi.mock('electron', () => ({ ipcRenderer: {} }))\nit('x', () => {})\n`
    const fixture = `const s = "vi.mock('electron', () => ({}))"\nit('x', () => {})\n`
    expect(electronMockFilesFromCorpora([synthetic]), 'a synthetic `vi.mock(\'electron\', …)` corpus MUST join the census').toEqual(['<synthetic>'])
    expect(electronMockFilesFromCorpora([fixture]), 'a construct inside a STRING fixture MUST NOT join the census').toEqual([])
    expect(electronMockFilesFromCorpora([synthetic, fixture]).length, 'the derived count must move with the corpus, so the census is not hard-coded').toBe(1)
  })
})

/** The census reader, driven over synthetic corpora: the SAME derivation the row above uses,
 *  so the control is over the reader and not over a copy of it. */
function electronMockFilesFromCorpora(corpora: string[]): string[] {
  const binds = (src: string): boolean => {
    const sf = ts.createSourceFile('scan.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    let found = false
    const walk = (node: ts.Node): void => {
      if (found) return
      if (ts.isCallExpression(node)) {
        const callee = node.expression
        if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'mock' && ts.isIdentifier(callee.expression)) {
          const first = node.arguments[0]
          if (first !== undefined && ts.isStringLiteral(first) && first.text === 'electron') {
            found = true
            return
          }
        }
      }
      ts.forEachChild(node, walk)
    }
    walk(sf)
    return found
  }
  return corpora.map((c, i) => ({ c, i })).filter(({ c }) => binds(c)).map(() => '<synthetic>')
}

// ===========================================================================
// §4 `P-TH-SM-2` — THE TOKEN BLOCK AND THE PERSISTENCE CONTRACT ARE UNTOUCHED, AND
// THE THEME IS NOT REPERSISTED BY THIS UNIT
// (8 = 3 facts × 2 readings + 2 controls; `(bounded) ON (b)`)
// ===========================================================================
describe('§4 P-TH-SM-2 — the token/persistence safety of the adoption (strat:theme-token-and-persistence-safety)', () => {
  it('P-TH-SM-2 (a) — the token census and its VALUE-INDEPENDENCE: the same 15 names in both blocks, and no value claim is made', () => {
    const css = readFileSync(INDEX_HTML_PATH, 'utf8')
    const block = tokenBlockOracle(css)
    expect(block, 'the token block’s two selector blocks must be present').not.toBeNull()
    expect([...block!.root].sort(), 'the token census is exactly the 15 pinned names').toEqual([...PINNED_TOKENS].sort())
    expect(
      [...block!.dark].sort(),
      'each name is declared in the dark override too — the census is NAME-level: this unit makes NO value claim (§1.2 (c): the token block is unchanged)',
    ).toEqual([...PINNED_TOKENS].sort())
  })

  it('P-TH-SM-2 (b) — the no-store scan over this unit’s write set: no `localStorage`/`sessionStorage`/store/cache/memo token rides the theme path (`(bounded)`: a token scan is not a runtime proof)', () => {
    expect(existsSync(ADAPTER_PATH), `RED (PD-UI-1 §2.1): the adapter ${ADAPTER_PATH} does not exist`).toBe(true)
    const adapterCode = readFileSync(ADAPTER_PATH, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, ''))
      .join('\n')
    // `(bounded) ON (b)`: a token scan over the write set cannot prove the absence of a store
    // at runtime — a store reached through an alias or a helper would not be seen.
    expect(adapterCode, '§4 P-TH-SM-2 (b): the adapter holds no store — a store addition is a NEW GATE (R-5)').not.toMatch(STORE_TOKENS)
    const wiring = readFileSync(join(REPO_ROOT, 'src', 'renderer', 'renderer.ts'), 'utf8')
    expect(wiring, 'RED (PD-UI-1 §2.2 item 2): the `matchMedia` read belongs to the WIRING').toMatch(/matchMedia\(\s*'\(prefers-color-scheme: dark\)'\s*\)/)
    expect(installThemeBodyText(), '§4 P-TH-SM-2 (b): the theme boot path holds no store, cache or memo').not.toMatch(STORE_TOKENS)
  })

  it('P-TH-SM-2 (c) — the persistence surface’s ABSENCE and the carrier’s byte-identity: `installTheme` reads the setting and writes NOTHING back, and the carrier matches its ⟨A-1⟩ RECORDED digest', () => {
    expect(
      installThemeBodyText(),
      '§4 P-TH-SM-2 (c): the theme path performs NO `operatorSettings.set(...)` / `operatorSet(...)` write-back — the persisted setting is read-only here (R-5)',
    ).not.toMatch(WRITE_BACK_TOKENS)
    const carrier = digestReading().filter((r) => /(?:^|\/)(types|operator-settings-store)\.ts$/.test(r.file))
    expect(carrier.map((r) => r.file), '§4 P-TH-SM-2 (c) / R-5: the persisted `theme` carrier is `src/shared/types.ts` (`ThemeSetting`) + `src/main/operator-settings-store.ts` (`coerceTheme`)').toEqual([
      'src/shared/types.ts',
      'src/main/operator-settings-store.ts',
    ])
    expect(
      carrier.filter((r) => !r.matches).map((r) => `${r.file}: recorded ${r.recorded} ≠ actual ${r.actual}`),
      '§4 P-TH-SM-2 (c) / R-5 (⟨A-1⟩): the carrier must equal its RECORDED md5 digest — the superseded `git status --porcelain` limb reads EMPTY for a clean tree even after a COMMITTED change to the carrier',
    ).toEqual([])
  })

  it('P-TH-SM-2 — the register’s term is printed as the sum of its factors: 3 facts × 2 readings + 2 controls = 8', () => {
    expect(3 * 2 + 2, '§4 P-TH-SM-2: 6 + 2 = 8').toBe(8)
  })

  it('P-TH-SM-2 CONTROLS — a synthetic token corpus dropping ONE name FAILS the census oracle, and a synthetic theme path calling `operatorSet({ theme })` FAILS the no-write-back oracle', () => {
    const real = readFileSync(INDEX_HTML_PATH, 'utf8')
    const dropped = real.replace('--hover: rgba(15, 23, 42, 0.06);', '')
    const realBlock = tokenBlockOracle(real)
    const droppedBlock = tokenBlockOracle(dropped)
    expect(realBlock, 'the real token corpus must parse, else the control proves nothing').not.toBeNull()
    expect(droppedBlock, 'the synthetic corpus must still parse').not.toBeNull()
    expect(realBlock!.root.length, 'the real corpus declares 15 names').toBe(15)
    expect(droppedBlock!.root.length, 'a synthetic corpus DROPPING one token name MUST fail the census (14 ≠ 15)').toBe(14)
    expect([...droppedBlock!.root].sort(), '…and the dropped name must be NAMED, so the failure is loud').not.toEqual([...PINNED_TOKENS].sort())
    expect(
      WRITE_BACK_TOKENS.test('void themeBridge.operatorSettings?.set?.({ theme: resolved })'),
      'a synthetic theme path calling `operatorSettings.set({ theme })` MUST fail P-TH-SM-2 (c) — a persistence addition is a NEW GATE',
    ).toBe(true)
    expect(
      WRITE_BACK_TOKENS.test('s.operatorSet({ representationMode: mode })'),
      'the oracle must also see the in-tree `operatorSet(...)` shape (the sibling preference’s control, E-4)',
    ).toBe(true)
    expect(WRITE_BACK_TOKENS.test('void themeBridge.operatorSettings?.get?.()'), 'the READ must pass the same oracle').toBe(false)
  })
})

// ===========================================================================
// §4's ARITHMETIC — the attempt total, printed with its eight terms (the register
// spans the unit's two files; this file carries the accounting `A-13` requires).
// ===========================================================================
describe('§4 — the register’s arithmetic, printed with its terms', () => {
  /** ⟨THE ACCOUNTING CONVENTION, declared so a count is never smuggled.⟩ A row's printed TERM
   *  counts (a) its shape-grid drives × its named observations, (b) its declared CONTROLS, and
   *  (c) any PRIMARY drive class a correction adds (⟨A-6⟩'s two domain shapes, ⟨A-7⟩'s
   *  removal-branch drive + its corpus controls, ⟨A-3⟩'s third control). The corrections'
   *  ORACLE-DISCRIMINATION reads — the faithfulness limbs, the false-green rejections, the
   *  coercing-corpus diagnostics — are DECLARED DIAGNOSTICS: each row counts its own and prints
   *  the figure, and NONE is folded into an attempt term, because their subject is the ORACLE's
   *  discrimination rather than a new datum about the adapter. Every row asserts its own term
   *  EXACTLY (`⟨A-8⟩`: a printed count that is not what runs was the filed defect).
   *
   *  Declared diagnostics, per row (in-row, counted): `P-TH-IM-1` 1 (the coercing corpus over
   *  the grid), `P-TH-IM-2` 3 (faithfulness · the 11-shape false-green rejection · the 11-shape
   *  indistinguishability read), `P-TH-TP-1` 1 (the coercing corpus over the added shapes),
   *  `P-TH-TP-2` 15 (4 AST write-site corpora · the write-path faithfulness pass · the 8-cell
   *  divergent-record grid · the 8-cell false-green rejection · ⟨A-7 RULED⟩ 2 classifier
   *  diagnostics (the resolution-writing corpus · the set-then-delete corpus) · 5 re-scoped
   *  source-limb corpora (handed delete · ambient `document` · another function’s parameter ·
   *  the DECLINED `removeAttribute` · `Reflect.deleteProperty`) · the ⟨A-7 RULED⟩ positive
   *  control corpus `RULED_FIX_SOURCE`, accepted by BOTH oracles), `P-TH-TP-3` 2 (the
   *  silent-skip pair), `P-TH-IM-4` 3 (the ⟨A-12⟩ void / unused / discarded corpora),
   *  `P-TH-SM-1` 1 (⟨A-1⟩'s synthetic COMMITTED change) = 26 diagnostics, declared and NOT
   *  attempt-term factors.
   *
   *  The eight rows of §4's register table, with the file each row's drives land in.
   *
   *  ⟨A-6 / A-7 / A-3 CORRECTIONS 2026-09-28 (gate-4 remand).⟩ FOUR terms GREW, because four
   *  corrections oblige drives the filed terms did not carry:
   *   · `P-TH-IM-1` 20 → 28  — ⟨A-6⟩ `''` and a boxed `String` join the precedence GRID
   *                             (+2 shapes × 2 readings × 2 observations = +8);
   *   · `P-TH-TP-1` 59 → 67  — ⟨A-6⟩ the same two shapes join the HOSTILE list
   *                             (+2 shapes × 4 non-boolean readings = +8);
   *   · `P-TH-TP-2` 20 → 24  — ⟨A-7⟩ the removal branch is DRIVEN (1 landed drive + 3 corpus
   *                             controls = +4), where the filed term only asserted it by regex;
   *   · `P-TH-TP-3` 26 → 27  — ⟨A-3⟩ a third control (a SILENT-SKIP corpus that never attempts
   *                             the write) proves the new attempt oracle discriminates (+1).
   *  `P-TH-IM-2` (26) and `P-TH-TP-3`'s 24 observations are UNCHANGED IN COUNT and now EXACT
   *  (⟨A-5⟩/⟨A-8⟩: the executed counts are the printed ones, with no floor and no bonus drive).
   *  The total is `194`. **⟨AMENDED 2026-09-28 (`§0B` item 1, the spec's `§4`): the SPEC's `§4`
   *  table is now TRUTHFUL at `194` — its eight printed terms are the executed ones, so the
   *  divergence this file used to DECLARE is CLOSED. The superseded figures (`20 + 26 + 59 + 20 +
   *  26 + 6 + 8 + 8 = 173`) are KEPT VISIBLE and DATED in the spec's `§4` AS-FILED block, with
   *  their finding ids, and this file reads BOTH back: the current total must be the sum of the
   *  table's own printed terms, and the `173` must still be present AS the superseded figure.
   *  A pass that reverted the spec's table to `173` would RE-FILE the defect the amendment
   *  closes — the table is the contract and the test follows it, never the reverse.⟩**
   *  `generator: false` on every row is ⟨A-8⟩'s DECLARED route: NO row is generator-backed. */
  const REGISTER_TERMS: Array<{ row: string; file: string; terms: string; total: number; generator: boolean }> = [
    { row: 'P-TH-IM-1', file: 'pd-ui-1-theme-adoption.test.ts', terms: '6 setting shapes × 2 prefersDark values × 2 observations (identity + domain) = 24, + 4 controls', total: 6 * 2 * 2 + 4, generator: false },
    { row: 'P-TH-IM-2', file: 'pd-ui-1-theme-adoption.test.ts', terms: '11 env shapes × 2 observations = 22, + 4 controls', total: 11 * 2 + 4, generator: false },
    { row: 'P-TH-TP-1', file: 'pd-ui-1-theme-adoption.test.ts', terms: '14 setting shapes × 4 non-boolean readings = 56, + 3 root shapes × 3 settings = 9, + 2 controls', total: 14 * 4 + 3 * 3 + 2, generator: false },
    { row: 'P-TH-TP-2', file: 'pd-ui-1-theme-adoption.test.ts', terms: '4 setting shapes × 2 readings × 2 observations = 16, + 4 controls, + 4 removal-branch drives', total: 4 * 2 * 2 + 4 + 4, generator: false },
    { row: 'P-TH-TP-3', file: 'pd-ui-1-theme-adoption.test.ts', terms: '3 root shapes × 2 settings × 2 readings = 12 drives × 2 observations = 24, + 3 controls', total: 3 * 2 * 2 * 2 + 3, generator: false },
    { row: 'P-TH-IM-4', file: 'pd-ui-1-theme-register.test.ts', terms: '4 facts × 1 reading = 4, + 2 independent controls', total: 4 * 1 + 2, generator: false },
    { row: 'P-TH-SM-1', file: 'pd-ui-1-theme-register.test.ts', terms: '6 pin classes × 1 reading = 6, + 2 controls', total: 6 * 1 + 2, generator: false },
    { row: 'P-TH-SM-2', file: 'pd-ui-1-theme-register.test.ts', terms: '3 facts × 2 readings = 6, + 2 controls', total: 3 * 2 + 2, generator: false },
  ]

  /** §4's register table AS FILED before the 2026-09-28 amendment — the SUPERSEDED printed terms.
   *  ⟨RECONCILED (`§0B` item 1 / `§9` item 9): the spec's `§4` table is now TRUTHFUL at `194`, so
   *  these figures are no longer what the table PRINTS as current — they are the figures the spec
   *  KEEPS VISIBLE, dated, in its AS-FILED block. This array is the reading that block is checked
   *  against: the superseded terms must remain VISIBLE and dated, and must NOT be asserted as
   *  current.⟩ */
  const SUPERSEDED_SPEC_TERMS: Array<{ row: string; printed: number }> = [
    { row: 'P-TH-IM-1', printed: 20 },
    { row: 'P-TH-IM-2', printed: 26 },
    { row: 'P-TH-TP-1', printed: 59 },
    { row: 'P-TH-TP-2', printed: 20 },
    { row: 'P-TH-TP-3', printed: 26 },
    { row: 'P-TH-IM-4', printed: 6 },
    { row: 'P-TH-SM-1', printed: 8 },
    { row: 'P-TH-SM-2', printed: 8 },
  ]

  it('§4 — the eight rows, each with its own term; every row ≤ 100; the total is the SUM OF ITS OWN TERMS', () => {
    expect(REGISTER_TERMS.length, '§4: the register is FULL at eight rows — the cap is ≤8 and a further row requires retiring one').toBe(8)
    const perRow = REGISTER_TERMS.map((r) => `${r.row}: ${r.terms} = ${r.total}`)
    expect(perRow, '§4: the per-row terms, printed in register order (four grew under ⟨A-6⟩/⟨A-7⟩/⟨A-3⟩; those superseded figures are now KEPT VISIBLE and DATED in the spec’s §4 AS-FILED block — see `SUPERSEDED_SPEC_TERMS`)').toEqual([
      'P-TH-IM-1: 6 setting shapes × 2 prefersDark values × 2 observations (identity + domain) = 24, + 4 controls = 28',
      'P-TH-IM-2: 11 env shapes × 2 observations = 22, + 4 controls = 26',
      'P-TH-TP-1: 14 setting shapes × 4 non-boolean readings = 56, + 3 root shapes × 3 settings = 9, + 2 controls = 67',
      'P-TH-TP-2: 4 setting shapes × 2 readings × 2 observations = 16, + 4 controls, + 4 removal-branch drives = 24',
      'P-TH-TP-3: 3 root shapes × 2 settings × 2 readings = 12 drives × 2 observations = 24, + 3 controls = 27',
      'P-TH-IM-4: 4 facts × 1 reading = 4, + 2 independent controls = 6',
      'P-TH-SM-1: 6 pin classes × 1 reading = 6, + 2 controls = 8',
      'P-TH-SM-2: 3 facts × 2 readings = 6, + 2 controls = 8',
    ])
    for (const r of REGISTER_TERMS) {
      expect(r.total, `§4: ${r.row}’s term must be ≤ 100 (the largest is P-TH-TP-1 at 67)`).toBeLessThanOrEqual(100)
    }
    const total = REGISTER_TERMS.reduce((a, r) => a + r.total, 0)
    // eslint-disable-next-line no-console -- the register’s total is PRINTED with its terms (§4)
    console.log(`PD-UI-1 register: ${REGISTER_TERMS.map((r) => `${r.row}=${r.total}`).join(' + ')} = ${total} attempts`)
    expect(
      total,
      '§4 (⟨A-6⟩/⟨A-7⟩/⟨A-3⟩-corrected terms): `28 + 26 + 67 + 24 + 27 + 6 + 8 + 8 = 194` — the total is the SUM OF ITS OWN PRINTED TERMS. The superseded total was `20 + 26 + 59 + 20 + 26 + 6 + 8 + 8 = 173`',
    ).toBe(194)
    const supersededTotal = SUPERSEDED_SPEC_TERMS.reduce((a, r) => a + r.printed, 0)
    expect(supersededTotal, '§4: the SUPERSEDED total (the §4 table AS FILED) is still `173` — kept VISIBLE and DATED in the spec’s AS-FILED block, never silently replaced and never asserted as current').toBe(173)
    expect(
      total - supersededTotal,
      '§4: the composition is unchanged and still declared by the spec — ⟨A-6⟩ +8 (IM-1: 2 shapes × 2 readings × 2 observations) +8 (TP-1: 2 shapes × 4 readings), ⟨A-7⟩ +4 (TP-2 removal-branch drives), ⟨A-3⟩ +1 (TP-3 silent-skip control) = 21. The spec prints `` `194` = `173 + 21` ``; the AMENDMENT moves the figure, never the composition',
    ).toBe(21)
    expect(total, '§4 route (b) (carried): the declared total is over the ≤120 cap — stated, not smoothed').toBeGreaterThan(120)
  })

  it('§4 — the total is read back OUT OF the landed spec’s register table, so a term dropped from the table without a contract amendment is a LOUD failure', () => {
    expect(existsSync(REGISTER_SPEC_PATH), `RED (PD-UI-1 §4): the spec ${REGISTER_SPEC_PATH} does not exist`).toBe(true)
    const lines = readFileSync(REGISTER_SPEC_PATH, 'utf8').split('\n')
    const headerIndex = lines.findIndex((l) => /^\|\s*#\s*\|\s*Row id\b/.test(l))
    expect(headerIndex, '§4: the register table header `| # | Row id |` is absent — the register cannot be derived from a table that is not there').toBeGreaterThanOrEqual(0)
    const rows: Array<{ id: string; cells: string[] }> = []
    for (let i = headerIndex + 2; i < lines.length; i++) {
      const line = lines[i]!
      if (!line.startsWith('| ')) break
      // The row is read as cells, but the PROPERTY cell carries markdown tables of its own, so
      // its pipes make a naive split ragged. The attempts cell is therefore found by its own
      // FORM (`= <digits> [+ …] controls`), never by a pinned column index.
      const cells = line.split('|').slice(1, -1)
      const id = /\bP-TH-(?:IM|SM|TP)-\d+\b/.exec(cells[1] ?? '')
      expect(id, `§4: the register row "${line.slice(0, 40)}…" carries no \`P-TH-*\` row id`).not.toBeNull()
      rows.push({ id: id![0], cells })
    }
    expect(rows.map((r) => r.id), '§4: the register’s rows, in table order — the SAME eight ids this file accounts for').toEqual(
      REGISTER_TERMS.map((r) => r.row),
    )
    /** The attempts cell, found by its own FORM (`` `N`** = … ``) — the property cell carries
     *  markdown tables whose pipes make a positional read ragged. */
    const attemptsCell = (cells: string[]): string => cells.find((c) => /`\d+`\*\*\s*=/.test(c)) ?? ''
    // every row's cell list must carry its attempts term AS A SUM OF ITS FACTORS — an
    // expression with at least one operator and its `controls` term named — never a bare
    // literal (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`).
    const termless = rows.filter((r) => {
      // `| # | Row id | Property | Domain/strategy | Attempts | (bounded)? |` — read from the
      // RIGHT, never at a pinned index (a `|` inside a property cell makes the row ragged).
      const cell = attemptsCell(r.cells)
      return !(/[0-9]/.test(cell) && /(?:\*|×|\+)/.test(cell))
    })
    expect(termless.map((r) => r.id), '§4 `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`: a row whose cell carries no sum of factors is a review finding').toEqual([])
    // A SECOND, recorded reading: how many rows name their `controls` term EXPLICITLY. The
    // spec’s `P-TH-TP-1` cell writes its third addend as a bare `2` (`59 = 48 + 9 + 2`), so
    // three rows carry the controls term implicitly — RECORDED here as a reading rather than
    // smoothed away, and REPORTED to the supervisor as a documentation nit in the unit spec’s
    // `§4` table (no behaviour depends on it).
    const namesControlsExplicitly = rows.filter((r) => /controls/i.test(attemptsCell(r.cells))).map((r) => r.id)
    // eslint-disable-next-line no-console -- the reading is PRINTED rather than smoothed (§4)
    console.log(`PD-UI-1 register: ${namesControlsExplicitly.length} of ${rows.length} attempts cells name their controls term explicitly`)
    expect(
      namesControlsExplicitly,
      '§4: the rows whose attempts cell names its `controls` term explicitly — the complement is the IMPLICIT-controls set (a spec-table nit, recorded, never a row weakened)',
    ).toEqual(['P-TH-IM-1', 'P-TH-IM-2', 'P-TH-TP-2', 'P-TH-TP-3', 'P-TH-IM-4', 'P-TH-SM-1', 'P-TH-SM-2'])
    // …and each printed term must be the SUM OF ITS OWN FACTORS, and the spec’s own printed total
    // the sum of its own terms (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`).
    // ⟨RECONCILED 2026-09-28 (`§0B` item 1 / `§9` item 9): the spec’s `§4` table is now TRUTHFUL at
    // `194` (`28 + 26 + 67 + 24 + 27 + 6 + 8 + 8`), the four superseded row terms and the `173`
    // total are KEPT VISIBLE and DATED in the spec’s AS-FILED block, and NO printed term is
    // superseded. This row therefore asserts the AMENDMENT instead of the divergence it used to
    // declare — and it still fails LOUDLY if the table drifts again.⟩
    // The cell is located by its own FORM — a `|` inside a property cell’s markdown table makes a
    // positional read ragged, so the attempts cell is found by `` `N`** = `` and never by an index.
    // The emphasis (`**\`28\`**`, `**28**`, a bare `28`) is not pinned; the COUNT is.
    const leadingCount = (cell: string): number => {
      const firstRun = (/\d+/.exec(cell) ?? [])[0]
      return firstRun === undefined ? NaN : Number(firstRun)
    }
    /** The FACTORS a cell prints after its `=`, read only up to the amendment annotation (`⟨…⟩`) so
     *  the AS-FILED figures an annotation keeps visible are never mistaken for the term’s factors. */
    const printedFactors = (cell: string): number[] => {
      const head = cell.split('⟨')[0] ?? ''
      const eq = head.indexOf('=')
      if (eq < 0) return []
      return [...head.slice(eq + 1).matchAll(/\d+/g)].map((m) => Number(m[0]))
    }
    const specPrintedCounts = rows.map((r) => leadingCount(attemptsCell(r.cells)))
    expect(specPrintedCounts.some((n) => Number.isNaN(n)), '§4: every register row’s attempts cell must open with its count').toBe(false)
    const specTotal = specPrintedCounts.reduce((a, n) => a + n, 0)
    // eslint-disable-next-line no-console -- the spec’s total is PRINTED with its terms (§4)
    console.log(`PD-UI-1 register (spec §4, AMENDED 2026-09-28): ${rows.map((r, i) => `${r.id}=${specPrintedCounts[i]}`).join(' + ')} = ${specTotal} attempts`)
    expect(
      specPrintedCounts,
      '§4 (⟨AMENDED 2026-09-28 — `§0B` item 1⟩): the spec’s §4 table must print the EXECUTED terms, in register order — `28 + 26 + 67 + 24 + 27 + 6 + 8 + 8`. A printed count that is not what runs is the filed defect `A-8`; a cell drifted back to a superseded figure fails HERE',
    ).toEqual(REGISTER_TERMS.map((r) => r.total))
    const factorSumMismatch = rows
      .map((r, i) => ({ id: r.id, printed: specPrintedCounts[i]!, factors: printedFactors(attemptsCell(r.cells)) }))
      .filter((r) => r.factors.length === 0 || r.factors.reduce((a, n) => a + n, 0) !== r.printed)
    expect(
      factorSumMismatch,
      '§4 `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`: EVERY cell must print its count as the SUM OF ITS OWN FACTORS (the addends after its `=` must add up to its leading count) — a count quoted without its terms, or one that is not their sum, is a review finding',
    ).toEqual([])
    expect(
      specTotal,
      '§4 (⟨AMENDED 2026-09-28⟩): the spec’s eight printed terms must sum to `194` = `28 + 26 + 67 + 24 + 27 + 6 + 8 + 8` — the total is the SUM OF ITS OWN PRINTED TERMS, and each moved term is printed as the sum of its own factors in its own cell',
    ).toBe(194)
    const specText = readFileSync(REGISTER_SPEC_PATH, 'utf8')
    // The spec’s own printed eight-term tally, REBUILT from this file’s executed terms, so a term
    // dropped from the tally (or a figure moved back to a superseded one) reds here.
    const tally = new RegExp(
      REGISTER_TERMS.map((r) => `\`${r.total}\` \\(\`${r.row}\`\\)`).join('[\\s\\S]{0,40}') + '[\\s\\S]{0,40}= `194` attempts',
    )
    expect(
      specText,
      '§4: the spec’s AMENDED attempt tally — its eight terms in register order, each followed by its row id, summing to `194` — is REBUILT here and matched, so a term silently dropped from the tally is a LOUD failure',
    ).toMatch(tally)
    expect(specText, '§4: the spec DECLARES the composition of the amendment (`194 = 173 + 21`), not only its total').toMatch(/`194` = `173 \+ 21`/)
    // ⟨THE SUPERSEDED FIGURES STAY VISIBLE AND DATED — and are NEVER asserted as current.⟩
    expect(
      specText,
      '§4: the superseded total must still be present AS the AS-FILED figure — `173` inside the kept-visible, dated block (deleting it would erase the record that the amendment was made)',
    ).toMatch(/⟨AS FILED, KEPT VISIBLE \(the superseded figure[\s\S]{0,500}`173` attempts/)
    expect(
      specText,
      '§4: …and it must be DATED with the finding ids its amendment came from, so no reader can take it for a current figure',
    ).toMatch(/superseded 2026-09-28[\s\S]{0,160}A-6[\s\S]{0,40}A-7[\s\S]{0,40}A-3/)
    const asFiledStart = specText.lastIndexOf('⟨AS FILED, KEPT VISIBLE', specText.indexOf('`173` attempts'))
    const asFiledBlock = specText.slice(asFiledStart, specText.indexOf('`173` attempts') + 120)
    // the term is matched WHITESPACE-TOLERANTLY: the spec's AS-FILED block wraps one term pair
    // across a line break, and a line break is not a vanished figure.
    const supersededPresent = (row: string, printed: number): boolean =>
      new RegExp(`\`${printed}\`\\s*\\(\\s*\`${row}\`\\s*\\)`).test(asFiledBlock)
    const missingSuperseded = SUPERSEDED_SPEC_TERMS.filter((r) => !supersededPresent(r.row, r.printed)).map((r) => r.row)
    expect(
      missingSuperseded,
      '§4: every SUPERSEDED row term must stay VISIBLE in the AS-FILED block, carrying its printed figure AND its row id — a superseded term that vanishes is a review finding, and none of them may be asserted as current (`specPrintedCounts` above)',
    ).toEqual([])
    // ⟨NO PRINTED TERM IS SUPERSEDED ANY MORE: the table and the executed register agree, row by row.⟩
    const grew = rows
      .map((r, i) => ({ id: r.id, spec: specPrintedCounts[i]!, executed: REGISTER_TERMS[i]!.total }))
      .filter((r) => r.spec !== r.executed)
    expect(
      grew,
      '§4 (⟨AMENDED 2026-09-28 — `§0B` item 1⟩): NO row’s executed term differs from the spec’s printed one — the four superseded figures (`P-TH-IM-1` 20 · `P-TH-TP-1` 59 · `P-TH-TP-2` 20 · `P-TH-TP-3` 26) live in the spec’s AS-FILED block, dated, while the table is the contract',
    ).toEqual([])
    const executedTotal = REGISTER_TERMS.reduce((a, r) => a + r.total, 0)
    expect(
      executedTotal - specTotal,
      '§4: the executed register and the spec’s §4 table now differ by ZERO — the amendment closed the divergence this row used to declare, and the composition `194 = 173 + 21` is asserted in the arithmetic row above',
    ).toBe(0)
  })

  // ===========================================================================
  // ⟨A-8 CORRECTION 2026-09-28 (gate-4 remand).⟩ THE REGISTER'S DECLARED GENERATOR
  // MACHINERY, stated PLAINLY rather than implied. The audit found: "no row carries a
  // generator, the seed's LCG is exercised only in the arithmetic block, the stop-after-5
  // rule exists only as a comment". The route CHOSEN (and reported) is (i): DECLARE that no
  // row is generator-backed — because the register's rows quantify over CLOSED, PINNED shape
  // enumerations whose property text matches the enumeration EXACTLY (`§4`'s own domain cells),
  // so a drawn subset would falsify the very count the term prints. The seed and its LCG stay
  // the register's pinned machinery, exercised as their own determinism check below; the
  // `≤100 per row` / `≤120 total` caps and the `STOP AFTER 5 CONSECUTIVE FAILURES` rule are
  // then declared INAPPLICABLE — there is no bounded attempt loop for them to govern.
  // ===========================================================================
  it('⟨A-8⟩ §4’s machinery — DECLARED: NO row is generator-backed, so the stop-after-5 rule has NO subject (the route taken, printed)', () => {
    const generatorBacked = REGISTER_TERMS.filter((r) => r.generator).map((r) => r.row)
    expect(
      generatorBacked,
      '⟨A-8⟩ NO row is generator-backed: every row drives a CLOSED, PINNED enumeration whose property text matches it exactly, so a DRAWN subset would falsify the printed term',
    ).toEqual([])
    expect(REGISTER_TERMS.length, '§4: the declaration covers all eight rows').toBe(8)
    // the spec's machinery block still carries the stop rule — recorded so the declaration's
    // subject is visible rather than assumed.
    const specText = readFileSync(REGISTER_SPEC_PATH, 'utf8')
    expect(specText, '§4: the spec still declares the STOP rule (the rule is not deleted from the contract — it is declared to have no subject in this register)').toMatch(/STOP AFTER 5 CONSECUTIVE FAILURES/)
    expect(specText, '§4: the spec still pins the seed and the LCG form').toMatch(/0x20260928/)
    // eslint-disable-next-line no-console -- ⟨A-8⟩'s route is PRINTED, never implied
    console.log('PD-UI-1 register: 0 of 8 rows are generator-backed (⟨A-8⟩ route (i): DECLARED); the seed/LCG is exercised as its own determinism check, and the ≤100/≤120 attempt caps + the STOP-AFTER-5 rule are declared INAPPLICABLE (no row runs a bounded attempt loop)')
  })

  it('§4’s shared machinery — the pinned seed drives a hand-rolled 32-bit LCG with one step per draw, and the draw selects a pool member by `index = state mod pool.length`', () => {
    const pool = ['light', 'dark', 'system', 'undefined'] as const
    const sequences = (seed: number): string[] => {
      let state = seed >>> 0
      const out: string[] = []
      for (let i = 0; i < 4; i++) {
        const step = lcgDraw(state, pool.length)
        state = step.state
        out.push(pool[step.index]!)
      }
      return out
    }
    expect(REGISTER_SEED, '§4: the seed is the fixed literal `0x20260928` — never `Date.now()`, never `Math.random()`, never an environment read').toBe(0x20260928)
    expect(sequences(REGISTER_SEED), '§4: the LCG’s draws are DETERMINISTIC — the pinned seed yields this exact sequence, one step per draw').toEqual([
      'undefined',
      'system',
      'dark',
      'light',
    ])
    // the control: a DIFFERENT seed must move the sequence (else the generator is constant
    // and every drawn row would be vacuous).
    expect(
      sequences(0x20260929),
      '§4 control: a different seed MUST move the drawn sequence — a constant generator would make every drawn row vacuous',
    ).not.toEqual(sequences(REGISTER_SEED))
  })
})
