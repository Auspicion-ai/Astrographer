# Unit U-D3 — BLIND green-scenario artifact (RCA-4)

- **Artifact:** `tests/blind-unit-ud3-import-path-id-scheme-greens.test.ts`
- **Unit spec:** `docs/specs/unit-ud3-import-path-id-scheme.md`
- **Author:** blind green-scenario writer (did NOT read
  `src/main/markdown-import.ts` or `src/main/markdown-parse.ts` to decide
  expected behavior). The TestWriter file
  `tests/unit-ud3-import-path-id-scheme.test.ts` was consulted ONLY for the
  corpus/import harness conventions; the scenarios below were authored
  independently and are not copies of the TestWriter assertions.
- **Run:** `npx vitest run tests/blind-unit-ud3-import-path-id-scheme-greens.test.ts`
- **Result (2026-09-11):** `23 passed (23)` — 23 PASS / 0 FAIL.
  Test Files 1 passed (1). No FAIL is a finding; none occurred.

## Scenario ledger

| # | Scenario id | Spec section | Assertion (abbrev.) | Result |
| --- | --- | --- | --- | --- |
| 1 | H1 | §5.6.1 / §5.4 | `nested/readme.md` ⇒ id `nested/readme`; root `documentPath ['nested']`; `:section:1`/`:p:1` exist without own `documentPath`; edge `e-nested/readme-1` | PASS |
| 2 | H2 | §5.6.2 | `x/y/z.md` ⇒ `documentPath ['x','y']`, id `x/y/z`, `x/y/z:section:1` exists | PASS |
| 3 | H3 | §5.6.3 / §5.4 | root-level `readme.md` ⇒ id `readme`; root has NO own `documentPath` property | PASS |
| 4 | H4 | §5.6.4 / §5.6.14 | `d1/readme.md` + `d2/readme.md` ⇒ distinct `d1/readme`/`d2/readme`; each root its own path | PASS |
| 5 | H5 | §5.6.8 / §5.1 | directory `notes.md` keeps its extension while basename `x.md` strips it ⇒ `notes.md/x` | PASS |
| 6 | H6 | §5.6.7 / §5.6.10 / §5.5 sep | `A B`⇒`A-B`; `a.b`⇒`a.b`; backslash dir `a\b`⇒`a-b`; case-SENSITIVE `Case`≠`case` | PASS |
| 7 | H7 | §5.6.5 / §5.3 | non-default `S` ⇒ `S:nested/readme`, path `['nested']`, exactly one `S:` prefix | PASS |
| 8 | H8 | §5.6.12 | `shared/alpha.md`+`shared/beta.md` ⇒ both `['shared']`, distinct ids, no alias | PASS |
| 9 | H9 | §5.6.13 | result echoes final ids; `nodeCount`/`edgeCount` equal store batch size | PASS |
| 10 | H10 | §5.5 F5 | two stores import `p/q.md` as `One:p/q` vs `Two:p/q` (distinct) | PASS |
| 11 | H11 | §5.6.9 | `café/x.md` ⇒ `documentPath ['caf']`, id `caf/x` | PASS |
| 12 | X1 | §5.7.2 / §5.5 F3 | `!!!/readme.md` ⇒ `empty documentPath segment for file: <file>` + `failedFile`; nothing applied | PASS |
| 13 | X2 | §5.7.3 | `日本語/readme.md` collapses to `''` ⇒ the F3 message + `failedFile` | PASS |
| 14 | X3 | §5.7.6 / §5.5 alias | `a!x/x.md`+`a?x/y.md` ⇒ `position 0: "a!x" and "a?x" both sanitize to "a-x"`; `failedFile` = 2nd; nothing applied | PASS |
| 15 | X4 | §5.7.7 | `a/b!x/x.md`+`a/b?x/y.md` ⇒ alias `position 1` (`b-x`) | PASS |
| 16 | X5 | §3a A2 / ADV-1 (§5.5) | same sanitized child under DIFFERENT parents (`docs/2024!` + `specs/2024?`) is NOT an alias; both import | PASS |
| 17 | X6 | §5.7.10 | alias state is per-call: after a rejected pair, importing one file alone succeeds | PASS |
| 18 | X7 | §5.7.1 / §5.5 F2 | `dup/readme.md` twice ⇒ `duplicate documentId: dup/readme`, `failedFile` undefined; nothing applied | PASS |
| 19 | X8 | §5.7.8 / §5.5 F6 | reserved `['readme']` + flat `readme.md` ⇒ A1 collision on joined id; nested `readme/x.md` does NOT collide | PASS |
| 20 | X9 | §5.7.5 / §5.5 F4 | file outside corpus root ⇒ `path outside corpus root: <file>` + `failedFile`; nothing applied | PASS |
| 21 | X10 | §5.7.9 / §3a A3 | composed `café`⇒`caf` vs decomposed `cafe\u0301`⇒`cafe`: no normalization, distinct, both import | PASS |
| 22 | F9a | §5.6.6 / §5.5 F9 | flat `a.md`+`b.md` ⇒ exact basename-only node-id set; edge ids `e-a-1..5`/`e-b-1..5`; no `/` edges; no root `documentPath` | PASS |
| 23 | F9b | §5.6.6 / §5.5 F9 | flat root on-disk `hash` equals the basename-only (no `documentPath`) serialization; no own `documentPath`; fresh boot loads the record | PASS |

## Non-blind-constructible / not-authored scenarios

| Spec item | Reason not authored blind |
| --- | --- |
| §3a A5 / §5.5 F9 — "import the SAME flat corpus WITH and WITHOUT the U-D3 path code and compare bytes" | The pre-U-D3 build cannot be produced from documentation alone. Approximated in F9a/F9b via (a) exact basename-only id/node-id shapes, (b) on-disk hash equality to the pinned no-`documentPath` serialization, and (c) fresh-boot reload (no quarantine). |
| §3a A7/A8 — symlinked-directory-in-root keeps its LOGICAL name; escaping symlink rejected by `isWithin(real, corpusRootReal)` | Symlink creation/realpath behavior is environment-dependent and the spec pins no byte-level assertion beyond "logical name used"; only the logical containment branch of F4 (X9) is exercised. |
| §3a A9 / §5.8 — `markdown-parse.ts` byte-for-byte unmodified; parser interpolation census | A no-source-change claim cannot be verified by a black-box test without reading/diffing the implementation (prohibited for this artifact). |
| §5.7.4 / §5.5 F3b — empty basename (`a/!!!.md`) | Not requested by the blind coverage list; derivable, but omitted to keep the artifact scoped to the assigned scenario set. |
| §5.4 `[...documentPath]` copy semantics (mutating the importer's array must not affect the stored node) | Requires access to the importer's internal array; the public contract only guarantees the stored copy (asserted indirectly via F9b / H-series reads). |
