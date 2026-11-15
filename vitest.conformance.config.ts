import { defineConfig } from 'vitest/config'

// The `PD-VENDOR` conformance leg's OWN config (unit spec §3.5 item 6 / D-3).
//
// WHY A SECOND CONFIG. The vendored foundation suites enter as an ADDITIVE leg
// (`DECIDED: REBUILD-ARCHIVE-POLICY` clause (2)) and may never be collected by
// `npm test`: `vitest.config.ts` is a `G-9`-pinned file (its `include` and its
// `testTimeout` are both asserted exactly by the protected pin row), so the leg
// gets its own config and its own script key instead of an edit to the pinned one.
//
// LAYER (RCA-12). This leg is `[T]`/`[H]` — the FOUNDATION'S OWN node suites re-run
// against the vendored copies. A suite passing here proves the COPY matches the
// pinned contract; it is NOT app-green and NOT envelope-green-as-app.
//
// ⟨ANNOTATED 2026-11-15 BY UNIT `V-2` (`conformance-refresh`) — the paragraph above is KEPT
// VERBATIM and this is the measured correction beside it: A SUITE PASSING HERE PROVES NOTHING
// ABOUT THE COPY. There is no `vendor/Provident-Electron/src/`, so every `../src/shared/<x>.js`
// specifier resolves to nothing and the suites fail by construction (11 files, 11 failed, 511
// failed / 59 passed / 570 at this head, 3 suites collecting zero tests). Copy fidelity is
// `tests/integration/foundation-vendor/conformance-refresh-register.test.ts`'s claim — per-copy
// md5 against the pinned blob, with an anti-vacuity limb — and this leg is a class tally only.⟩
//
// `O-3` / `O-5` (unit spec §1.3, §3.5 item 4). The leg's colour is NOT a green/red
// word and is NOT this unit's pass condition. Two recorded reasons, neither papered
// over: (a) every suite also carries rows that assert the FOUNDATION REPO'S own
// state (a `git status --porcelain` diff-scope audit, reads of the foundation's own
// `docs/specs/<unit>.md` artifacts, an `existsSync` absence probe of
// `docs/skills/designing-pages.md`, a read of the foundation's frozen
// `src/shared/dom-shim.ts`) — those rows cannot pass in this repo and are not
// copy-fidelity evidence; (b) the suites' specifiers are written for the
// foundation's own tree layout (`../src/shared/<x>.js`) and resolve against the
// vendored tree's own `src/shared/` as copied, which is why the byte copies are
// filed under `vendor/Provident-Electron/tests/` with the audit rows named in the
// unit's DONE row rather than absorbed.
export default defineConfig({
  test: {
    include: ['vendor/Provident-Electron/tests/*.test.ts'],
    environment: 'node',
  },
})
