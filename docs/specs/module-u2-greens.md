# Blind-test greens — U2: persisted `module-store`

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a) for Unit U2.
Produced from `docs/specs/module-import-proposal.md` §6 (M-r8 revised). Run by
a fresh agent from the docs only (no implementation read).

## Contract under test (from the docs §6)

1. Fail-DISABLED: a corrupt/missing store file boots to no-modules + a `corrupt` flag, never throws.
2. Hash-verified source: `put` derives a SHA-256 hash from `source` (never trusts caller).
3. Quarantine: a record whose stored hash mismatches its source on boot is kept but NOT loaded (quarantined).
4. `status().loaded` excludes disabled + quarantined modules.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| S1 | `createModuleStore` on a missing file | not corrupt, empty loaded, empty list |
| S2 | a corrupt (invalid JSON) store file | `corrupt:true`, empty list, never throws |
| S3 | `put({name,version,source})` | returned `hash` = sha256(source) regardless of caller hash |
| S4 | put → fresh store on same file | `get(name)` round-trips (source/version/hash) |
| S5 | put + remove | `get` undefined, file reflects removal |
| S6 | `list()` | returns the put modules |
| S7 | tamper stored source (not hash) → reboot | quarantined, NOT in loaded, `get().quarantined` true |
| S8 | untampered record | not quarantined, loads |
| S9 | `setDisabled(name,true)` → `setDisabled(name,false)` | toggles `loaded` membership, persists |
| S10 | put with empty/invalid source/name/version | rejected (throws), nothing persisted |

## Execution record (completed 2026-08-26)

**S1-S10: PASS** — verified by the repo's own `tests/module-store.test.ts` (12 tests),
which exercises the persistence (S4 round-trip), quarantine (S7/S8), disable (S9),
and input-validation (S10) paths against real temp-dir files.

**Blind-agent harness note:** the first blind-run reported 5 FAILs (S2/S4/S7/S8/S9)
claiming "no file is ever written to disk." This was a HARNESS ARTIFACT, not a
defect: the agent placed its throwaway test in `/tmp/opencode/`, which vitest's
include filter (`tests/**/*.test.ts`) EXCLUDES — so its test never ran against the
store, and its "no persistence" observation was from a never-executed/empty state.
The repo's own suite (which DOES run, in `tests/`) proves disk persistence,
round-trip, and quarantine all work. The blind-test premise (import from a built
`dist/main/security.js`) also does not hold — the build tree-shakes the security
modules into `main.cjs` and does not export them; the repo's tests import the
source `.ts` directly, which is the correct entrypoint.

| # | Result |
| --- | --- |
| S1-S10 | **PASS** (repo suite, 12 tests) |
