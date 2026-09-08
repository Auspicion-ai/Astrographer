// src/main/rag-store-remove.ts — Unit U-H4: THE drain-then-teardown caller of
// the U-H5 teardown primitives for a REMOVED store
// (docs/specs/unit-h4-hot-remove.md §5.2; consumed: docs/specs/unit-h5-teardown.md
// §4/§5 — TEARDOWN-ASYNC, STORE-TEARDOWN-REVOKES-MUTATION-ONLY,
// ENGINE-TEARDOWN-STOP-SERVING, DRAIN-SEAM-INFLIGHT; the review §2
// D7 / A-P2-2 / A-P2-8). The ONLY module that lexically calls `teardown(` /
// `inFlight()` for a removed entry — the runtime module `rag-store-runtime.ts`
// references only `drainAndReleaseEntry(` (whose identifier contains no lower-
// case `teardown`), preserving the U-H2/U-H5 N1/A-P2-8 grep pins.
//
// D3 — the persistence file + journal are NEVER deleted: this module imports NO
// `unlink`/`rm`/`rmdir`/`remove` primitive and calls only the U-H5 no-delete
// `teardown()`s (the store file + journal STRAND byte-identical — the orphan).
//
// D6 / A-P2-7 — no Electron, no IPC, no MCP tool. ZERO console output (errors
// are thrown / hangs are surfaced, never logged).
//
// §7 Architect ruling (Q1/Q4): the drain is UNBOUNDED — correctness-first
// (A-P2-2/D7 — a removed engine is NEVER torn down while `inFlight() > 0`); a
// genuinely never-settling in-flight query / store queue hangs the drain
// (F-H5-3's documented awareness), NOT a bounded/timeout fail-state. New
// byte-pinned message templates: 0.

import type { RagStore } from './rag-store.js'
import type { RetrievalEngine } from './retrieval.js'

/** The drain input — the removed `RagStoreEntry`'s `store` + `engine`,
 *  captured from the live entries Map BEFORE the write+swap unregisters it
 *  (compatible with the `RagStoreEntry` type from `rag-store-directory.ts`). */
export interface RemovedEntry {
  store: RagStore
  engine: RetrievalEngine
}

/** The result of a drained + torn-down release. */
export interface RemovedEntryReleaseResult {
  /** The settled in-flight query count at teardown — ALWAYS 0 (the drain gate
   *  never tears down mid-query, A-P2-2/D7). */
  drained: number
}

/** Drain-then-teardown a removed store's store + engine:
 *  1. UNBOUNDED drain — await `engine.inFlight() === 0` (a removed engine is
 *     never torn down while a query is mid-flight; A-P2-2). A never-settling
 *     query/queue hangs here (F-H5-3 awareness), by design (§7 Q4).
 *  2. `await store.teardown()` — drain the single-writer queue + revoke
 *     mutations; the persistence file + journal STRAND byte-identical (D3).
 *  3. `await engine.teardown()` — post-release `query()` throws `retrieval
 *     engine: torn down`.
 *  Returns `{ drained: 0 }` — the settled in-flight count at teardown. */
export async function drainAndReleaseEntry(entry: RemovedEntry): Promise<RemovedEntryReleaseResult> {
  while (entry.engine.inFlight() !== 0) {
    // UNBOUNDED poll (no max-wait / no timeout — §7 Q4). A tiny sleep keeps
    // the event loop cooperative while awaiting the in-flight queries.
    await new Promise<void>((res) => setTimeout(res, 1))
  }
  await entry.store.teardown()
  // F-H4-1 (RCA-3) — the drain-gate TOCTOU re-entry. `await store.teardown()`
  // YIELDS to the event loop, so a caller holding a captured reference to the
  // removed engine can enter `engine.query()` DURING that yield — `inFlight()`
  // becomes 1 AFTER the gate above observed 0. Re-enter the drain gate
  // immediately before `engine.teardown()` so a removed engine is NEVER marked
  // STOPPED mid-query (A-P2-2/D7). Because `engine.teardown()` synchronously
  // marks STOPPED, this re-check in the SAME synchronous block closes the
  // window (no `await` between the final `inFlight() === 0` read and the stop).
  while (entry.engine.inFlight() !== 0) {
    await new Promise<void>((res) => setTimeout(res, 1))
  }
  await entry.engine.teardown()
  return { drained: 0 }
}
