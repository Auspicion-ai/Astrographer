// src/main/query-audit.ts — Unit X: the PURE query-audit log module
// (docs/specs/unit-x-rag-provenance-traversal.md §5.7). It hosts the
// ring-buffer audit log that records every RAG query's provenance-relevant
// facts (the query string, the filters, the mode, the result count, the
// ISO-8601 UTC timestamp, and the requester) so the provenance traversal can
// reconstruct which query produced which result.
//
// PURE and node-testable by contract (§5.7): NO Electron import, NO I/O — the
// module imports only the `RagQueryFilters` TYPE from ./retrieval.js (the
// retrieval chunk exports it; until then the type import is unresolved and the
// module does not type-check — expected, reported to the supervisor).
//
// Ring-buffer semantics (§5.7): `record` appends; when the log exceeds
// `maxEntries` (default 1000) the OLDEST entry is dropped. `list` returns a
// COPY of the entries, NEWEST first (a fresh array — the caller cannot mutate
// the log through it). `clear` empties the log. `record` never throws on a
// full log.
import type { RagQueryFilters } from './retrieval.js'

/** One recorded query-audit entry (§5.7). `timestamp` is ISO-8601 UTC. */
export interface QueryAuditEntry {
  query: string
  filters: RagQueryFilters | null
  mode: 'flat' | 'graph'
  resultCount: number
  timestamp: string
  requester: string
  /** A-F2 — present ONLY for a `stores:"all"` fan-out (the canonical-order
   *  store names the fan-out queried); ABSENT (undefined) in a single-store
   *  audit entry (the existing entries stay byte-equal). */
  stores?: string[]
}

/** The query-audit log surface (§5.7). */
export interface QueryAuditLog {
  record(entry: QueryAuditEntry): void
  list(): QueryAuditEntry[]
  clear(): void
}

/** Creates a ring-buffer query-audit log (§5.7). `maxEntries` defaults to
 *  1000; a non-positive-integer value throws the byte-pinned fail message. */
export function createQueryAuditLog(maxEntries?: number): QueryAuditLog {
  if (maxEntries === undefined) {
    maxEntries = 1000
  }
  if (!Number.isInteger(maxEntries) || maxEntries <= 0) {
    throw new Error('createQueryAuditLog: maxEntries must be a positive integer')
  }
  const entries: QueryAuditEntry[] = []
  return {
    record(entry: QueryAuditEntry): void {
      if (entry == null) {
        throw new Error('query audit: entry required')
      }
      entries.push(entry)
      if (entries.length > maxEntries!) {
        entries.shift()
      }
    },
    list(): QueryAuditEntry[] {
      // A COPY, NEWEST first — the caller cannot mutate the log through it.
      return entries.slice().reverse()
    },
    clear(): void {
      entries.length = 0
    },
  }
}
