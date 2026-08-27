# Spec — A2/A6: RendererBackend Lifecycle Hardening

Status: **SPEC** (delegation gate for the A2 + A6 reshape unit). Source:
`docs/specs/architecture-review.md` §4 A2 + A6. The top-level arch review
flagged the `RendererBackend` (main↔renderer IPC bridge) as missing lifecycle
guards: an unbounded `readyPromise`, no per-request timeout, no reload/destroy
rejection of in-flight `pending`, and an unstated stateless-HTTP idempotency
consequence. This unit hardens `RendererBackend` (host code; no package change,
no Electron-API change beyond wiring existing events).

## 1. Scope

`src/main/mcp-server.ts` `RendererBackend`:
- `readyPromise` resolves once on `markReady()` — **never times out** (a
  never-ready renderer hangs `invoke` forever). **A6.**
- `pending` Map has **no per-request timeout** — a renderer that receives a
  request but never replies leaves the MCP tool call hanging forever. **A2.**
- A `webContents.destroyed` / `did-finish-load` (reload) event does NOT reject
  `pending` or re-arm readiness — a reload mid-flight leaves stale `pending`
  entries + a graph reset the agent is not told about. **A2.**
- Large rendered payloads (~180MB for a 4095-node SSR fragment) serialize over
  IPC unbounded — a bounded/digest result is the safe default. **A2.**

This unit:
1. **Readiness timeout (A6)** — `await readyPromise` with a configurable
   timeout; a timeout rejects `invoke` with a clear error (never hangs).
2. **Per-request timeout (A2)** — each `pending` entry has a timeout; a timeout
   rejects the entry + removes it (never a permanent hang).
3. **Reload/destroy re-arm (A2)** — on `webContents.destroyed` OR
   `did-finish-load` (a reload), reject ALL in-flight `pending` with a clear
   error, then RE-ARM readiness (a fresh `readyPromise` so a new load's
   `provident:ready` re-arms the backend). No silent demo-rebind.
4. **Bounded/digest large results (A2)** — `renderedHtml`/`ssrHtml` results over
   a threshold are returned as a census + a `hash64` digest + a truncated
   preview, NOT the full fragment (mirror the battery's census+hash64 shape).
   The full payload stays available via an opt-in flag.
5. **Stateless-HTTP idempotency note (A6, doc)** — record in `decisions.md` that
   each HTTP POST builds a fresh `McpServer` (dedup is per-supervisor, not
   per-session); a stateless client MUST NOT assume cross-request dedup.

## 2. The surface (exact)

```ts
export interface RendererBackendOptions {
  readyTimeoutMs?: number      // default 30000 — the readiness-gate timeout
  invokeTimeoutMs?: number     // default 60000 — the per-request timeout
  largePayloadBytes?: number   // default 1_000_000 — the digest threshold
}

export class RendererBackend implements McpBackend {
  constructor(opts?: RendererBackendOptions)
  attachWindow(win: Electron.BrowserWindow): void
  markReady(): void
  async invoke(method: string, payload: unknown): Promise<unknown>
  handleReply(reply: RpcReply): void
  // test seams
  isReady(): boolean
  pendingCount(): number
}
```

- `invoke` first `await`s the readiness gate with `readyTimeoutMs`; on timeout
  → throws `renderer not ready (timeout <ms>ms)`.
- `invoke` then sends the IPC request + installs a `pending` entry with a
  `setTimeout(invokeTimeoutMs)` that rejects + deletes the entry on fire.
- `attachWindow(win)` wires `win.webContents` `did-finish-load` + the window
  `closed`/`destroyed` events to a single `handleReset(reason)` that rejects all
  `pending` + re-arms `readyPromise` (a new one, resolving on the next
  `markReady()`).

## 3. Behavior (every state / fail-state)

- `invoke` BEFORE `markReady` → rejects after `readyTimeoutMs` (never hangs).
- `invoke` AFTER `markReady` → sends + awaits the reply (the happy path).
- A reply for a known `id` → resolves the entry, clears its timeout.
- A reply for an UNKNOWN `id` (timed out / reset) → no-op (the entry is gone).
- A per-request timeout fire → rejects the entry with `renderer invoke timeout
  (<ms>ms)` + deletes it (a late reply for that id is a no-op).
- A `did-finish-load` (reload) → rejects ALL `pending` with `renderer reloaded
  (pending cleared)` + re-arms `readyPromise` (the next `provident:ready`
  re-arms; `invoke` blocks on the new gate until then).
- A `closed`/`destroyed` → rejects ALL `pending` with `renderer window
  destroyed` + the gate stays CLOSED (a new window must `attachWindow` +
  `markReady` again).
- A `renderedHtml`/`ssrHtml`/`dispatch`-renderedHtml result exceeding
  `largePayloadBytes` → the returned value is replaced with
  `{ census, digest, preview, truncated: true }` (the full value is NOT
  serialized over IPC unless the caller passes `{ fullPayload: true }`).

## 4. Verify (states)

- `new RendererBackend()` before `markReady`: `isReady()` → `false`;
  `await invoke(...)` rejects after `readyTimeoutMs` (use a tiny timeout in the
  test).
- After `markReady()`: `isReady()` → `true`; `invoke` sends + a synthetic
  `handleReply` resolves it.
- A `pending` entry whose `invokeTimeoutMs` fires → rejects + `pendingCount()`
  drops; a late `handleReply` for it is a no-op.
- `attachWindow(win)` + a fake `did-finish-load` event → `pendingCount()` → 0,
  all rejected; `isReady()` → `false` (re-armed); a subsequent `markReady`
  re-arms; a NEW `invoke` then succeeds.
- A `closed`/`destroyed` → `pending` cleared, all rejected; `isReady()` →
  `false`.
- A large synthetic rendered payload (> `largePayloadBytes`) returned via
  `handleReply` → the `invoke` resolves with `{ census, digest, preview,
  truncated: true }`, NOT the full value.

## 5. Wiring (main.ts)

`main.ts` constructs `RendererBackend({ readyTimeoutMs, invokeTimeoutMs })`,
`attachWindow(win)` (now also wires the reload/destroy hooks), and the existing
`provident:ready` IPC re-arms via `markReady()`. No Electron-API change.

## 3a. Adversarial findings (2026-08-23) — landed as fixes

A read-only adversarial review of the A2/A6 green landed these host-side fixes
(no package defect). The greens (`renderer-backend-greens.md`) encode them.

| # | Finding | Fix (documented contract) |
| --- | --- | --- |
| F1 | The INITIAL `did-finish-load` (the first load, not a reload) spuriously reset the gate — could leave the backend permanently not-ready if it fired after `markReady`. | `attachWindow` skips the FIRST `did-finish-load` (`firstLoadSeen` flag); only a subsequent `did-finish-load` is a reload. |
| F2/F7 | A caller awaiting the OLD `readyPromise` was never released by a post-reset `markReady` (the stale closure was orphaned) — `invoke` hung for `readyTimeoutMs`. | `handleReset` REJECTS the current `readyPromise` (releasing its awaiters) before building a new one. |
| F3 | The readiness-timeout `setTimeout` (`rejectAfter`) was never cleared on success — a timer leak per `invoke`. | `invoke` captures the readiness timer + `clearTimeout`s it in a `finally` once the gate resolves. |
| F4 | A `webContents.send` on a destroyed webContents (destroy between the check and the send) threw a bare `Object has been destroyed` + left a dangling `pending` entry. | `invoke` wraps `send` in try/catch — on throw, cleans the `pending` entry + rethrows `renderer window destroyed`. |
| F5 | `closed` then `destroyed` both firing double-reset (the second rebuilds the gate, orphaning promise #1). | The double-fire is idempotent (empty map + already-closed gate); the `handleReset` reject-the-old-promise contract (F2) makes the second fire safe. |
| F6 | `attachWindow` twice leaked the first window's listeners — the first window's close reset the backend for the second. | `attachWindow`'s `rearm` closure ignores resets from a window that is no longer `this.window` (a re-attach replaces the window; the old window's events are no-ops). |