# Shell-integration unit — PROPOSAL-REVIEW record

- **Unit:** the shell-integration unit — the transport mechanism connecting the
  Astrographer shell to the Gnosis engine (the OPEN row in the Gnosis
  `docs/next-steps.md` + `docs/specs/7-2-f2-review.md` §"What a later
  shell-integration unit must own" + `docs/specs/engine-wire-contract.md` §14).
- **Gate:** proposal-review gate (validity ∥ critique → architecture →
  change-analysis).
- **Date:** 2026-09-10.
- **Verdict:** **REJECT the full 7-item unit as written; PROCEED-WITH-AMENDMENTS
  with the re-scoped Option B** (the five genuine remaining deliverables).
  Contingent on the user's go-ahead (GIVEN 2026-09-10).
- **Status:** proposal approved by review (as amended to Option B); the re-scoped
  unit is **code-bearing** (TLS application + a fetch-based SSE client + a shared
  transport refactor) and will go through the full TDD + PBT + adversarial +
  blind-greens + live-scenario + trio gates after the spec.

## What the proposal asked

The shell-integration unit — the transport mechanism connecting the Astrographer
shell to the Gnosis engine. The 7 items it must own: (1) HTTP-over-native-IPC
decision + server host; (2) shell-side SSE client; (3) bind-loopback + auth/TLS
policy; (4) full `RagStore` CRUD routing; (5) engine boot→READY lifecycle +
end-to-end transport test; (6) §11 HTTP-status rendering; (7) D2 engine-absent
behavior.

## The review findings (all read-only passes)

**Validity (INVALID as a fresh unit proposal).** 5 of the 7 items are already
landed: the HTTP-over-native-IPC decision + server host (P2 `gnosis-server` bin),
the shell-side SSE client (Unit GN `engine-rag-store.ts`), bind-loopback +
auth/TLS options (Unit GN + A1 `assertLoopback` + `auth`/`tls`), the §11
HTTP-status map (all 21 rows, `ConflictError`=409), and the D2 engine-absent
behavior (`GNOSIS-D2-ENGINE-ABSENT` + `EngineUnavailable`). Item 4 (full `RagStore`
CRUD routing) is ambiguous — the 11 document-CRUD methods are landed (A1/A2); the
~45-method surface is deferred by `GNOSIS-CRUD-MVP-SCOPE`. The genuine remaining
gap is the end-to-end transport test (the live batteries are parked).

**Critique (PROCEED-WITH-AMENDMENTS).** The genuine remaining deliverables are
narrow: (a) **TLS application** — the proxies accept `auth.tls` (`{ca,cert,key}`)
but never apply it (the standard `fetch` API doesn't accept a custom CA/cert/key
without an https agent); (b) **the SSE-path auth gap** — `EventSource` can't send
custom headers, so the `auth.token` Bearer header is never sent on the SSE stream,
and EventSource auto-reconnects (fights the premature-close `EngineUnavailable`
semantics); (c) **a concrete bind/auth/TLS policy record**; (d) **the D2-fallback
clarification** — the local `RagStore` (RagNode/RagEdge graph) is a different data
model than the engine's document store, so it can't be a fallback for the document
surface; (e) **the e2e transport test / live-battery revisit**. Item 4 as written
is dangerous: it conflates the 22-method local `RagStore` interface with the
45-method engine trait, and would either duplicate the landed A1/A2 document-CRUD
routing or pull the deferred graph wire (P1b/A3) into scope.

**Architecture (PROCEED-WITH-AMENDMENTS — Option B).** Re-scope to the five
genuine remaining items, with the tracker reconciliation as the first step. Pin:
(1) drop item 4 (the 11-method A1/A2 routing is landed; the ~45-method surface
stays deferred per `GNOSIS-CRUD-MVP-SCOPE`); (2) TLS application via a shared
`src/main/engine-transport.ts` module (an https-agent-backed injectable `fetch`
applying `auth.tls` via the undici `dispatcher`); (3) SSE-path auth via a
fetch-based SSE client (not EventSource — it sends the Bearer header + does not
auto-reconnect); (4) the D2-fallback clarification (the document-CRUD surface
surfaces `EngineUnavailable`; the local `rag.*` surface is the parallel D2
fallback); (5) the e2e transport test = the live-battery revisit (opt-in, gated on
the engine); (6) a concrete bind/auth/TLS policy record.

**Change-analysis (PROCEED-WITH-AMENDMENTS — Option B).** The re-scope is correct
and delivers the genuine remaining shell-integration work without re-proposing
landed items or violating the MVP-scope decision. Three mandatory amendments:
(1) **`isLoopbackHost` superset reconciliation** — the shared module must be the
union of both proxies' implementations (adding the hex `::ffff:7f00:1` form to
`engine-rag-store.ts`), with the GN loopback tests re-verified; (2) **undici
dependency scoping** — the TLS `dispatcher` dependency must be justified and
scoped (shell-side only; the engine lib stays at zero new runtime deps);
(3) **SSE premature-close semantics** — the fetch-based client must preserve the
H10 no-reconnect contract and be tested against it.

## The re-scoped Option B change list (the unit's deliverables)

1. **TLS application** — a shared `src/main/engine-transport.ts` module (extract
   the duplicated `isLoopbackHost`/`assertLoopback`/`transportError`/
   `fetchWithTimeout`/`headers()` from both proxies) + an https-agent-backed
   `createEngineFetch(auth)` that applies `auth.tls` via the undici `dispatcher`.
2. **SSE-path auth** — a fetch-based SSE client (replaces `EventSource` as the
   `defaultSseClient`; sends the Bearer header; no auto-reconnect; preserves the
   H10 premature-close `EngineUnavailable` semantics).
3. **A concrete bind/auth/TLS policy record** — a policy section in the unit spec
   (or a dedicated `docs/specs/engine-transport-policy.md`) + a DECIDED/ACTIVE row
   in `docs/decisions.md`.
4. **The D2-fallback clarification** — the document-CRUD surface surfaces
   `EngineUnavailable` (503); the local `rag.*` surface is the parallel D2
   fallback (not a fallback for the document store).
5. **The e2e transport test / live-battery revisit** — extend the parked live
   batteries (P2 M1-M20, A2, GN, GN-MCP-UI) for the document-CRUD live
   round-trips; opt-in + gated on the engine.

## Residual risk (accepted)

- The deferred ~45-method graph/fact/consistency surface (P1b–P1e, A3–A5) stays
  deferred per `GNOSIS-CRUD-MVP-SCOPE` — item 4 is NOT fully delivered (only the
  11-method document slice is landed). Recorded as a residual gap, not silently
  dropped.
- The e2e transport test is opt-in + gated on the engine (non-deterministic in
  CI); the `EngineUnavailable`/`EngineError` split over a real transport remains
  only partially verified.
- The TLS path is lightly tested (only exercised when `auth.tls` is set, GUI-only).
- The undici dependency is a shell-side runtime cost (the engine lib stays at zero
  new runtime deps).
