// src/main/rag-store-default.ts — Unit U-H7: the default-change orchestration
// home (docs/specs/unit-h7-default-reassign.md §5.2; consumed:
// docs/specs/unit-h5-teardown.md §4/§5 — BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD +
// DRAIN-SEAM-INFLIGHT; unit-f-embeddings.md §5.12/§5.13 — the W1 boot + W4/W5
// cache; review §2 D5/A-P2-4/A-P2-8). The ONLY module that lexically owns the
// tear-down call site for a default CHANGE + the NEW-default boot construction —
// the runtime module references only `releaseDefaultVectorBoot(` /
// `createDefaultVectorBoot(` (identifiers with no lowercase `teardown`),
// preserving the N1/A-P2-8 grep pins.
//
// D3 — NEVER deletes: imports NO unlink/rm/rmdir/remove; the boot release leaves
// the persisted vector-cache file + every store file byte-identical. The OLD
// default's STORE is never released here (it is retained as an ordinary
// non-default entry by the runtime). D6/A-P2-4 — no Electron, no IPC, no MCP.
// ZERO console output (errors are thrown / hangs are surfaced, never logged).

import type { RagStore } from './rag-store.js'
import type { EmbeddingProvider } from './embeddings.js'
import type { VectorBootController } from './vector-boot.js'
import { createVectorBootController } from './vector-boot.js'
import { createVectorCache } from './vector-cache.js'
import { join } from 'node:path'

/** U-H7 — construct the NEW default's vector boot controller (W1 BOOT MODEL B,
 *  born-lexical-pending). NOT started (the runtime fires the background build).
 *  Builds the byte-equal cache path `provident-vector-cache.json` under
 *  `userDataPath` — the SAME content-addressed cache file the OLD boot used, so
 *  W4/W5 reuse the warmed cache for unchanged content. A construct throw
 *  PROPAGATES (the caller has NOT written the registry yet — disk + live
 *  untouched). */
export function createDefaultVectorBoot(store: RagStore, provider: EmbeddingProvider, userDataPath: string): VectorBootController {
  return createVectorBootController(store, provider, {
    embedBatchFn: provider.embedBatch,
    cache: createVectorCache({ path: join(userDataPath, 'provident-vector-cache.json') }),
  })
}

/** U-H7 — DRAIN-THEN-RELEASE the OLD default's vector boot controller
 *  (A-P2-2/D7):
 *  1) UNBOUNDED drain — await `boot.engine.inFlight() === 0` (the old default's
 *     vector engine is never torn down while a query is mid-flight — the re-bind
 *     already routed NEW queries to the new default; in-flight-old queries settle
 *     here).
 *  2) `await boot.teardown()` — U-H5 BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD:
 *     mark STOPPED, reject an in-flight build, forward the engine release,
 *     resolve `undefined`. NO-FAIL.
 *  3) Resolve `{ drained: 0 }`. NEVER deletes/flushes the persisted cache file
 *     (D3 / U-H5 §7 Q2).
 *  F-H4-1 re-entry (RCA-3/HOST-7c): the drain loop's FINAL `inFlight() === 0`
 *  read transitions SYNCHRONOUSLY into `boot.teardown()`, and `teardown()`
 *  marks STOPPED at its first synchronous statement (before its first `await`),
 *  so NO query can enter between the final in-flight read and the STOPPED mark —
 *  an engine is NEVER marked stopped mid-query. A second `while` loop here would
 *  be DEAD (no await-boundary sits between the two loops for a query to enter
 *  through); the real re-entry guarantee is the no-await read→STOPPED transition.
 *  (Contrast `rag-store-remove.ts`'s F-H4-1 re-entry, where `await
 *  store.teardown()` YIELDS between the gate and `engine.teardown()`, so a
 *  second loop IS required there.) */
export async function releaseDefaultVectorBoot(boot: VectorBootController): Promise<{ drained: number }> {
  while (boot.engine.inFlight() !== 0) {
    // UNBOUNDED poll (no max-wait / no timeout). A tiny sleep keeps the event
    // loop cooperative while awaiting the in-flight queries.
    await new Promise<void>((res) => setTimeout(res, 1))
  }
  await boot.teardown()
  return { drained: 0 }
}
