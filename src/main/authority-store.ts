// src/main/authority-store.ts — Unit A2 §5.4 (docs/specs/unit-a2-document-crud-
// wiring.md): the shell-side authority store (H3 — GNOSIS-RBAC-CALLER-STORE).
// Maps a caller identity (a human/agent user) to their edit-authority credential
// (the opaque `caller` string the engine's RBAC check consumes). The engine is
// the RBAC enforcer; this store is the shell's mapping of WHO may edit.
//
// The mapping is a boot-time, in-memory mapping (loaded by `loadAuthorityMapping`
// in main.ts from the operator settings — the same engine-config seam). It is
// NOT a credential store (the credentials are opaque application-level strings,
// not secrets); it is the shell's "who may edit" RBAC mapping (H3). A callerId
// with no entry (or a null/empty credential) has NO edit authority.

/** Unit A2 §5.4 — the shell-side authority store (H3). Maps a caller identity
 *  (a human/agent user) to their edit-authority credential (the opaque `caller`
 *  string the engine's RBAC check consumes). The engine is the RBAC enforcer;
 *  this store is the shell's mapping of WHO may edit. */
export interface AuthorityStore {
  /** Resolve the caller's edit-authority credential for a mutating CRUD call.
   *  Returns the credential string, or null if the caller has no edit
   *  authority (the mutating call is denied caller-side). */
  callerCredential(callerId: string): string | null
  /** The set of caller identities that have edit authority. */
  editors(): string[]
}

/** Create the authority store from a mapping of callerId → credential. A
 *  callerId with no entry (or a null/empty credential) has NO edit authority. */
export function createAuthorityStore(
  mapping: Record<string, string>,
): AuthorityStore {
  const hasCredential = (id: string): boolean => {
    const cred = mapping[id]
    return typeof cred === 'string' && cred !== ''
  }
  return {
    callerCredential(callerId) {
      return hasCredential(callerId) ? mapping[callerId] : null
    },
    editors() {
      return Object.keys(mapping).filter(hasCredential)
    },
  }
}
