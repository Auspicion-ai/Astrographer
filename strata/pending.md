# pending — work that is real, agreed, and blocked (D-2). Ceiling 40 lines.

**Each row says what it waits on** (D-2). A row leaves this file when its work lands; one whose
blocker never clears is deleted with the reason recorded here, not quietly kept. Actionable work is
`strata/next-steps.md`.

| # | Work | Waits on | Owner when unblocked |
|---|---|---|---|
| 1 | **THE DEPENDENCY RULING, now blocking the UI port.** The item-8 reviews measured that the pinned `provident-ssr` **0.5.1 drops an authored provider from render** (`dist/core/node.js:1222-1224`, `!isSeamProvider(node)`) while 0.5.2 renders it through the `valueRecord` gate — so the by-position zone inheritance the UI port promises is not expressible on the pinned engine, and the port's provenance rests on an engine that cannot express its own contract. Beside it: `provident-storeroom`, needed by every record family surface (d) would adopt. Both are PACKAGE facts, catalogued and never patched (D-9), and both need a dependency decision rather than a unit | **the user's ruling** (findings: `strata/records/foundation-import-validity-2026-11-15.md`, `…-critique-2026-11-15.md`) | L1, once ruled |
| 2 | **The store-program relation and the two anchors.** Surface (d) is a LATER program (D-15): whether it adopts the foundation's record families wholesale, reconciles them against the fork's carriers, or is narrowed. Beside it: where the two store-adopt anchors go (`tests/pd-store-core-adopt.test.ts:107`, `tests/pd-store-persist-adopt.test.ts:452`), which byte-pin two fork files to the old revision while their subject no longer exists at the foundation's head | **the UI program's landing** | L1, when (d) is admitted |
| 3 | **The `docs/` migration ruling** — whether the existing corpus (`docs/specs/` 227 files and the five trackers) stays live beside the layers' write scopes or migrates into them | **the user's ruling** (D-1 records that no migration is taken at install) | L1, with the first unit that would touch the corpus |
