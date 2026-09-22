# Blind-test Greens — Unit U-IMPORT-1 — File → Import… FS/Browse Surface (C17)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-import-1-import-surface.md` (§2.1 `MAX_IMPORT_FILES` /
  `expandImportDirectory` / `buildImportDialogOptions` / `resolveImportSelection`
  incl. the mixed-array whole-poison rule-7, the cap `count===N`, the path
  coercion; §2.3/§2.8 the two-item menu + source-pin; §2.4 the `main.ts` routing;
  §2.5 `IPC_IMPORT_RESULT`; §3a states + §3b wiring; §4 F1–F15; §5.7 the PBT
  register P-IM-1/2/3 + P-TP-1/2/3/4/5). **NO implementation read** for
  expectation logic: `src/main/import-directory.ts` was NOT read — its pure
  surface was discovered by **executing** the module over `node:fs`/`node:os`
  temp-dir fixtures (the §3a pure states + the §5.7 PBT rows). Only the §2.8
  **source-pin literal surface** (`app-menu.ts` / `main.ts` / `types.ts`) is
  statically asserted via `readFileSync`, per the house convention. The
  win/linux two-item menu was driven LIVE through the `buildMenuTemplate` +
  `AppMenuActions` module (`app-menu.ts`); `importSelectionFromDialog` was
  driven live for the §2.4-step-2 cancel no-op. The red test's assertions were
  NOT used as the source of truth — only its header/imports were read (the
  blind-gate carve-out).
- **Run file:** a throwaway `tests/__blind_u_import_1_greens.test.ts` (vitest),
  **DELETED after the run**; no persistent `src/**` or `tests/**` change; no
  commit (the artifact is the only new tracked file).
- **Runner invocation:** `npx vitest run tests/__blind_u_import_1_greens.test.ts`
  from the Astrographer repo root. **36 PASS / 0 FAIL / 5 NOT-TESTABLE** (all 5
  `it.todo` — Electron/live-runtime-only, never a failure).
- **Source under test (LIVE modules):** `src/main/import-directory.ts`
  (`expandImportDirectory`, `buildImportDialogOptions`, `resolveImportSelection`,
  `MAX_IMPORT_FILES`) driven over temp-dir fixtures; `src/main/app-menu.ts`
  (`buildMenuTemplate` two-item drive + `importSelectionFromDialog`); §2.8
  source-pin on `app-menu.ts`, `main.ts`, `src/shared/types.ts`.
- **Result:** **36 PASS / 0 FAIL / 5 NOT-TESTABLE**. No package findings; no
  host regressions; **no doc/spec drift observed**.

## Legend

- **PASS** — observed behavior matches the spec contract (driven through the
  live modules over temp-dir fixtures, the live menu-template drive, or
  statically source-pinned per §2.8).
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a
  pass — none observed).
- **NT** — NOT-TESTABLE (recorded via `it.todo`, never a failure): requires a
  real Electron process (the native `dialog.showOpenDialog` dialog, the native
  `Menu` application), a host filesystem race, or the full live store/handler
  runtime (the `importMarkdownCorpus` domain-fail/throw branches).

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| S1 | `resolveImportSelection([one.md])` → `{ ok:true, files:[p], directories:0 }` | §3a.1, §2.1 | PASS |
| S2 | multi-file, case-insensitive extensions (`.MD`/`.MarkDown`/`.mD`), deduped + codepoint-sorted | §3a.2, §2.1 | PASS |
| S3 | directory expanded to top-level `a.md`+`b.markdown`; nested `sub/c.md` excluded (non-recursive Q17) | §3a.3, §2.1 | PASS |
| S4 | mixed `.md` file + directory → aggregate deduped + codepoint-sorted, `directories===1` | §3a.4, §2.1 | PASS |
| S5/§2.2 | `buildImportDialogOptions('darwin')` ⇒ combined; `'win32'/'linux'/unknown` ⇒ multi-file; filters always `md`/`markdown` | §3a.5, §2.1/§2.2 | PASS |
| F1 | expand missing / file-as-dir / `''` / `undefined` / `null` ⇒ `not-a-directory`, `path` echoes dir else `''`, never throws | §4 F1, §2.1 rule 7 | PASS |
| F1b | a valid EMPTY directory ⇒ `{ ok:true, files:[] }` | §2.1 rule 7 | PASS |
| F3 | resolve `null`/`undefined`/non-array/`[]`/`['',5,{}]`/`['a.txt']` ⇒ `no-markdown-files`, never throws | §4 F3, rule 6 | PASS |
| rule-7 | mixed-array WHOLE-POISON: a valid `.md` + a non-string/`''`/`null` element ⇒ `no-markdown-files` | §2.1 rule 7, §8 W-Q7 | PASS |
| F4 | dialog cancel / empty ⇒ `importSelectionFromDialog` → `null` (a no-op); non-cancel returns raw paths | §4 F4, §2.4 step 2 | PASS |
| F5 | a directory with no `.md` ⇒ `resolve([dir])` → `no-markdown-files` | §4 F5 | PASS |
| F6/F7 | cap fail-loud with `count===N` (6 files / max 5 ⇒ `cap-exceeded, cap:5, count:6`, never truncated); exactly-max boundary OK | §4 F6/F7, rule 6 | PASS |
| F6b | aggregate cap — 6 explicit md / max 5 ⇒ `cap-exceeded` (never a truncated import) | §2.4 step 4 | PASS |
| F9 | dot-file (`.md`, `.hidden.md`) + dot-dirs (`.git/`, `.hidden/`) skipped | §4 F9, rule 3 | PASS |
| F10 | non-md (`a.txt`, `README`, `noext`) dropped; only `.md`/`.markdown` survive | §4 F10, rules 1/2 | PASS |
| F2/F10 | resolve never throws on a non-md file contribution (dropped, other md kept) | §4 F2/F10 | PASS |
| F13 | bad `options.max` (0/-1/NaN/'x') coerced to `MAX_IMPORT_FILES` (fail-closed) — 513 files ⇒ `cap-exceeded, cap:512` | §4 F13, rule 7 | PASS |
| ADV-3 | fractional positive `max:2.5` floored ⇒ expand + resolve both `cap-exceeded, cap:2` with 3 files | §3c, §8 W-Q7 | PASS |
| F14 | unknown/`''`/`null`/`42`/non-string platform ⇒ non-darwin multi-file shape, never a throw | §4 F14 | PASS |
| F8 | symlink entry (file- or directory-link) excluded, no follow, no pull-through | §4 F8, rule 4, W-Q1 | PASS |
| S7 | `buildMenuTemplate` win32 + linux ⇒ two-item (`Import…` + `Import folder…`); darwin ⇒ single `Import…` | §3b.7, §2.8.1 | PASS |
| S8/§2.3 | the `Import folder…` item routes to `actions.openImportFolder()`, `Import…` to `actions.openImport()` | §3b.8, §2.8.1 | PASS |
| SP1 | `AppMenuActions` gains `openImportFolder():void`; both menu labels + the darwin single-item guard in `app-menu.ts` | §2.8.1/2 | PASS |
| SP2 | `main.ts` calls `buildImportDialogOptions(process.platform)` (NOT a hard-coded properties spread) | §2.8.3, §2.4 step 1 | PASS |
| SP3 | `main.ts` calls `resolveImportSelection(selection, { max: MAX_IMPORT_FILES })` | §2.8.4, §2.4 steps 3–4 | PASS |
| SP4 | `main.ts` calls `importMarkdownCorpus(` with `corpusRoot: defaultEntry.corpusRoot` (server-fixed) + `isDefault:true` | §2.8.5, §2.4 step 5 | PASS |
| SP5 | `main.ts` broadcasts `IPC_IMPORT_RESULT` (+ `IPC_RAG_STORE_CHANGED` on success) | §2.8.6, §2.5 | PASS |
| SP6 | `types.ts` defines `IPC_IMPORT_RESULT = 'provident:import-result'` | §2.8, §5.8 | PASS |
| P-IM-1 | `expandImportDirectory` TOTAL over dir×max domain (missing / empty-dir / path-to-file / `''` / `undefined`) × (512 / -1 / 0 / NaN / 'x') | §5.7 | PASS |
| P-IM-2 | `buildImportDialogOptions` TOTAL over the platform domain (`darwin`/`win32`/`linux`/`aix`/`freebsd`/undefined/null/42/{}) | §5.7 | PASS |
| P-IM-3 | `resolveImportSelection` TOTAL over the selection domain → `no-markdown-files` | §5.7 | PASS |
| P-TP-1 | expand deterministic + codepoint-sorted, host-insertion-order independent, nested excluded | §5.7 | PASS |
| P-TP-2 | expansion scope = exactly top-level md/markdown, dot- and non-md-skipped | §5.7 | PASS |
| P-TP-3 | symlink conservative + deterministic (link named `.md`, dir-link; excluded twice) | §5.7 | PASS |
| P-TP-4 | cap fail-loud boundary — N∈{max, max+1, max*2} + dir-cap poisons the WHOLE aggregate | §5.7 | PASS |
| P-TP-5 | resolve aggregates deterministically — md-only, deduped, codepoint-sorted, dir-expanded, `directories` counted | §5.7 | PASS |
| NT1 | the real native `dialog.showOpenDialog` hit (openImport + openImportFolder) | §2.4 step 1 | NT — Electron-only |
| NT2 | native `Menu` application rendering the two-item File menu | §2.8 | NT — Electron-only |
| NT3 | F12 `importMarkdownCorpus` returns `{ok:false}` → `import-failed` + 0× `IPC_RAG_STORE_CHANGED` (live handler+store) | §4 F12, §2.5 | NT — full-runtime (source-pinned SP5) |
| NT4 | F2 raced `not-a-directory` directory-in-resolve (host race) — never-throws proxy node-tested (F10) | §4 F2 | NT — host race |
| NT5 | F15 `importMarkdownCorpus` throws → caught, no unhandled rejection | §4 F15 | NT — full-runtime |

---

## Coverage notes

**Pure / node-testable core (§2.1 + §3a + §4 + §5.7):** `expandImportDirectory`,
`buildImportDialogOptions`, and `resolveImportSelection` are driven over
`node:fs`+`node:os` temp-dir fixtures (mkdtemp under `os.tmpdir()`) — never
Electron. The module is `src/main/import-directory.ts` (dynamic ESM import of the
pinned §2.1 exports); its pure surface is discovered by EXECUTING it, with all
expectations derived from the spec. The PBT rows (P-IM-1/2/3 + P-TP-1..5) are
deterministic-seeded (mulberry32) + bounded; every proposition in §5.7 holds.

**§2.8 source-pin:** `app-menu.ts`, `main.ts`, and `src/shared/types.ts` are
asserted via `readFileSync` literal checks (the house source-pin convention) —
never read for expectation logic. All six sub-surfaces (SP1–SP6) pass.

**Live menu / cancel drive (§3b):** `buildMenuTemplate` + `AppMenuActions`
(`app-menu.ts`) are driven LIVE — win32/linux emit the two-item File menu, darwin
the single `Import…`; the `Import folder…` click routes to `openImportFolder()`;
`importSelectionFromDialog` (a cancel/empty → `null` no-op) is executed
directly.

**Symlinks (F8/P-TP-3):** this host (Linux) supports symlink creation, so both
symlink rows **actually ran and passed** — a link named `x.md` → a real `.md`
target and a directory link `dl` → a dir holding `.md` are both excluded and
never pulled-through. (On a host without symlink permission they would fall to
`it.skip`. Not the case here.)

**§3a.6 / the `importMarkdownCorpus` corpus import itself** is OUTSIDE the
fs-surface node core (it is Unit T / MS4 / UD3 unchanged behavior). It is NOT
re-executed here; the routing/broadcast wiring is source-pinned (SP4/SP5). This
honesty is recorded in NOT-TESTABLE.

## NOT-TESTABLE list (Electron-only / full-runtime / host-race)

1. **NT1 — the actual native `dialog.showOpenDialog` hit** (`openImport` →
   `buildImportDialogOptions(platform)`; `openImportFolder` →
   `['openDirectory']`): requires a real Electron dialog. The node-testable
   proxies — `buildImportDialogOptions` (S5/§2.2/F14, PASS) + the source-pin
   that `main.ts` calls it with `process.platform` (SP2) — pass. **NOT-TESTABLE.**
2. **NT2 — the native `Menu` application** (`Menu.buildFromTemplate` /
   `setApplicationMenu`) rendering the two-item File menu: Electron-only. The
   pure `buildMenuTemplate` two-item drive (S7) + the §2.8 literal (SP1) pass.
   **NOT-TESTABLE.**
3. **NT3 — §4 F12:** `importMarkdownCorpus` returning `{ ok:false, error,
   failedFile? }` → the `import-failed` `IPC_IMPORT_RESULT` outcome + 0×
   `IPC_RAG_STORE_CHANGED` + no engine reconcile: needs the live handler + store
   runtime. The resolve/fs side is node-tested; the broadcast literal is
   source-pinned (SP5). **NOT-TESTABLE.**
4. **NT4 — §4 F2 the raced `not-a-directory` directory-in-resolve** (a path that
   `lstat` classifies as a directory but that then expands as
   `not-a-directory`): a host race not reproducible deterministically in node.
   The never-throws / contributes-nothing property is node-tested via the
   non-md-file proxy (F10). **NOT-TESTABLE.**
5. **NT5 — §4 F15:** `importMarkdownCorpus` throws (a non-domain host/battery
   error) → caught, no unhandled rejection, the operator surfaced a failed
   outcome: needs the live handler+runtime. **NOT-TESTABLE.**

## Tally

| Result | Count |
| --- | --- |
| **PASS** | **36** |
| **FAIL** | **0** |
| **NOT-TESTABLE** | **5** (`it.todo`, Electron/live-runtime-only — never a failure) |

## Drift / notes

- **No doc-vs-code drift observed.** The live `expandImportDirectory`,
  `buildImportDialogOptions`, and `resolveImportSelection` behave exactly per
  §2.1 (incl. the rule-7 whole-poison, the cap `count===N`, the `path`
  coercion, the fractional-max floor from §3c ADV-3); `buildMenuTemplate`
  emits the §2.3 two-item menu; every §2.8 source-pin literal (SP1–SP6) is
  present; all §5.7 propositions hold.
- **Two test-bugs, self-corrected, NOT spec drifts:** the first PBT `P-TP-1`
  write failed because `subdir` was referenced before it existed (a fixture-bug
  in the throwaway, not the implementation); the `makeDir()` call had a stray
  syntax token. Both were fixed in the throwaway and the suite re-ran all-pass.
  The live modules are correct.
- **Blind-gate honored:** `src/main/import-directory.ts` was never read — its
  behavior was confirmed purely by executing it over fixtures against
  spec-derived expectations. `app-menu.ts` was read only for the `buildMenuTemplate`
  CALL SURFACE (needed to drive it live) — no expectation logic drawn from it.
- No `provident-ssr` findings; no `docs/defects.md` / `docs/HANDOFF.md`
  addition required.
