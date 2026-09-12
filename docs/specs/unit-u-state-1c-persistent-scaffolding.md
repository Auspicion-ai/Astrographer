# Unit U-STATE-1c — Persistent Engine Scaffolding + Operator Scope + backRefs — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate
`docs/specs/u-state-1-content-repopulation-review.md`
(PROCEED-WITH-AMENDMENTS; pins A4/A5/A6 + the 2026-09-11 teardown/translate-attach
rules, `ui-overhaul.md` §3.1). This is the per-unit contract required by
AGENTS.md item 9 / umbrella amendment A1 **before any TestWriter red set**.

**Ordering:** this unit lands **before U-STATE-1b's fix** — 1b's attach path
(`placement-attach` into the live graph) depends on the persistent app-graph hub
this unit creates (1b spec §10; gate A6). U-STATE-1a (pure reconciler) is
already complete.

**TestWriter RED (2026-09-11, RCA-1):** `tests/unit-u-state-1c-persistent-scaffolding.test.ts`
— Runtime scaffolding 4 red (`hub` undefined; `admitContentNodes` missing);
operator-scope assertions red too (`mountOperator` non-idempotent;
`refreshOperator` absent). 6 failed + 1 green-on-arrival (the `supervisor`
identity is already stable), **243 ms**. **STATUS: RED — awaiting the
Implementer pass.**

### 6a. RCA — the operator-harness OOM (RESOLVED 2026-09-11)

**Symptom:** the file's operator block OOM'd the vitest worker (heap → ~4 GB,
~38 s, `FATAL ERROR: Ineffective mark-compacts near heap limit`), reported at
collection with 0 tests completed.

**Bisect:** scratch reproductions narrowed it to operator **test 3**; `STEP`
tracing showed both `mountOperator()` calls **completed** before the OOM — it
fires on the failing assertion, not in production code.

**Root cause:** `mountOperator` is (currently) **not idempotent**, so
`expect(internals.operatorScope).toBe(scope1)` **fails**; vitest then
pretty-prints/serializes BOTH large, cyclic `GraphScope` objects to build the
diff message, allocating unboundedly → heap OOM. (The earlier scratch "pass" had
no failing object-identity assertion, so it never serialized.)

**Fix:** assert identity via a boolean — `expect(a === b).toBe(true)` — so the
failure message is `false !== true`, never the objects. Applied to the operator
assertions.

**Lesson (test-authoring):** never `expect(<large/cyclic object>).toBe(<other>)`
in a test whose failure is the point (a red set); compare identity into a
boolean. A red test that OOMs the worker masks the red set and breaks the suite.

---

## 1. What the proposal asks

Today the app Runtime rebuilds its **engine scaffolding** on every RAG change,
which is why C10 can't work:

- `Runtime` constructor (`runtime.ts:156`) and `loadEnvelope` (`:378`) call
  `translateLegacy(...)` with **no `opts.hub`** → each gets a fresh anonymous
  `LinkConfigNameHub`; the hub is not stored. (Placement/component anchors
  resolve **per hub** — provident-ssr `translate.d.ts:149-155`.)
- `loadEnvelope` (`:385`) constructs a **new `Supervisor`** each call → the
  journal/undo stack is discarded (the C16 dependency).
- `SidebarPanes.mountOperator` (`sidebar-panes.ts:624-644`) re-creates the
  operator `GraphScope`, hub, `Supervisor`, `DomAdapter`, and calls
  `replaceChildren()` on **every** `refresh()` (`:674`).
- `recomputeBackRefs` (`:1183`) recomputes the whole map from the assembled
  envelope on every load.

U-STATE-1c makes this scaffolding **persistent across content changes** so that
1b can translate into the live graph and `placement-attach` by node ref.

---

## 2. Contract (pinned)

### 2.1 One persistent app-graph hub

- `Runtime` creates `this.hub = createLinkHub()` **once** in the constructor and
  stores it.
- Every **app-graph** `translateLegacy` call threads `{ hub: this.hub }`:
  constructor, `loadEnvelope`, `loadDoc`, and the U-STATE-1b attach path.
- The operator/secure panes keep their **own** hub + isolated `graphScope`
  (unchanged) — the app-graph hub is never shared with an isolated scope.

### 2.2 One persistent Supervisor for the app graph

- The app-graph `Supervisor` is created once and **reused across content
  changes** (the journal/undo stack survives). A full reset (`loadEnvelope`,
  `loadDoc`, `teardown`) may recreate it; the content-change path must not.
- New content nodes (from 1b) are **registered into the live Supervisor**
  (a pinned `admitContentNodes(nodes)` seam), never a new supervisor.

### 2.3 Persistent operator scope — decoupled from content refreshes

- `mountOperator` runs **once** at boot: it creates the isolated `GraphScope`,
  hub, `Supervisor`, `DomAdapter`, and mounts, then renders.
- **`refresh()` (the app-graph content re-derive) MUST NOT call it.** A content
  change never touches the operator pane — the operator settings are only ever
  written by the operator acting in the isolated panel (the operator-settings
  IPC / registry-manage), so there is no other change source (user ruling
  2026-09-11).
- The operator pane re-renders **only on an operator-initiated change** — the
  `operator-settings-changed` broadcast and the panel's own actions
  (editingMode toggle, registry manage, topK/default-document). Those call
  `refreshOperator()`.
- On such a genuine change, a content rebuild + `Supervisor.dispose()`
  (provident-ssr 0.4.1) of the previous operator Supervisor is acceptable (a
  rare, user-initiated event, not a per-content-change hot path). Full in-place
  `state-slice` reconciliation is NOT required. Preserve unrelated in-progress
  panel input across a re-render where practical.

### 2.4 Incremental backRefs — MOVED to U-STATE-1b

`backRefs` is a pure function of *which content roots exist and their subtrees*,
which is exactly what U-STATE-1b knows when it applies the reconcile buckets
(removed/added/replaced). **Ownership moves to U-STATE-1b**; 1c does not provide
the helper. 1b recomputes from the **live** reconciled graph (not a throwaway
`translateLegacy`) unless profiling shows a cost. (Supersedes the earlier §2.4
"incremental backRefs" 1c deliverable.)

### 2.5 Teardown is full-reset only (restated)

- `tearDownGraph` is called only by boot / `provident.teardown` / `loadDoc`.
- The content-change path never calls it (1b depends on this).

---

## 3. API surface + test-observable seams (pinned)

The 1c behaviors are mostly about **object identity across calls**, so the spec
pins the field/method names the TestWriter targets (read via `as any` casts, the
house pattern — e.g. `tests/sidebar-panes-host.test.ts`):

```ts
// Runtime
private hub: LinkConfigNameHub          // created ONCE in the constructor
private supervisor: Supervisor          // created once; reused across content changes
admitContentNodes(nodes: Node[]): void  // register into the LIVE supervisor + this.nodes

// SidebarPanes
mountOperator(): void                   // IDEMPOTENT: creates the isolated scope +
                                        // adapter + mount ONCE; later calls re-render
refreshOperator(): void                 // re-render the EXISTING operator graph
                                        // (no createIsolatedScope / replaceChildren /
                                        //  new DomAdapter)
```

**Observable assertions the red set uses:**

| Behavior | Observable |
| --- | --- |
| hub created once | `(runtime as any).hub` is defined after construction and is the same object after `admitContentNodes`/content changes (not after a full `loadEnvelope`, which may reset) |
| supervisor reused | `(runtime as any).supervisor` identity stable across `admitContentNodes` |
| `admitContentNodes` | registers into the live supervisor and appends to `this.nodes`; `[]` is a no-op |
| `mountOperator` idempotent | `(host as any).operatorScope` / `operatorAdapter` identity identical across two calls; the mount is not duplicated |
| `refreshOperator` | re-renders; `operatorScope` identity unchanged |

Naming of the private fields is part of the pin (the tests cast to them); the
public method names are pinned as written.

---

## 4. States (TestWriter red set — valid paths)

1. Two successive `translateLegacy` calls on the SAME Runtime share one hub
   (`this.hub` identity stable across a content change).
2. The app-graph `Supervisor` instance is the SAME before/after a content
   reconcile (identity stable) — the journal is not reset.
3. `mountOperator()` called twice creates the scope/adapter ONCE (the second
   call does not call `createIsolatedScope`/`replaceChildren`).
4. Re-rendering on an operator-initiated change keeps the scope/adapter
   identity (no duplicate settings element in the mount).
5. **(MOVED to U-STATE-1b)** `backRefs` update — see §2.4.
6. A full `loadEnvelope` still works (scaffolding may be recreated).
7. Undo/redo survives a content reconcile (the journal stack persists) — the
   minimal check for 1c; the full undo-after-change coverage is U-STATE-1b/1d.
8. `refresh()` (content re-derive) does NOT call `mountOperator` — the operator
   scope/adapter identity is unchanged across a content refresh (the decoupling,
   §2.3).

## 5. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a repeated `mountOperator()` | idempotent — re-render, never a second mount |
| F2 | `admitContentNodes([])` | no-op |
| F3 | a content change with no operator settings change | operator graph untouched |
| F4 | full reset while a content reconcile is pending | reset wins; no partial skeleton |
| F5 | hub reuse across a `loadDoc` (serialized load) | the same hub is threaded (or a documented reset) — pin at implementation |

---

## 6. Numeric / census claims

- 1 Runtime field (`hub`) + 1 Runtime seam (`admitContentNodes`) + 1
  `SidebarPanes` seam (`refreshOperator`); `mountOperator` becomes idempotent.
- No new npm dependency; no `provident-ssr` change.

---

## 7. Cross-references

- Gate `docs/specs/u-state-1-content-repopulation-review.md` A4/A5/A6 + the
  2026-09-11 teardown/translate-attach rules; decision
  `U-STATE-1-CONTENT-REPOPULATION-GATE`.
- `docs/specs/ui-overhaul.md` §3.1 ("The teardown rule" + "The translate+attach
  mechanism"); §7.3 (Reading 2 — zone nodes are graph).
- U-STATE-1a `docs/specs/unit-u-state-1a-content-reconcile.md` (landed).
- U-STATE-1b `docs/specs/unit-u-state-1b-host-application.md` §10 (depends on
  this unit's hub).
- Build: `src/renderer/runtime.ts` (constructor, `loadEnvelope`, `loadDoc`,
  `Supervisor`), `src/renderer/sidebar-panes.ts` (`mountOperator`,
  `renderOperator`, `recomputeBackRefs`).

---

## 8. Delimitation

This unit lands the **persistent scaffolding + operator persistence + backRefs**
only. It does NOT apply the reconcile buckets (U-STATE-1b) or re-anchor the
rebuild-path tests (U-STATE-1d). It must not change the operator/secure-pane hub
isolation or the group-gating.

## 9. Adversarial findings (RCA-3, 2026-09-11) — 1c INCOMPLETE

The red set went green (7/7) but the adversarial pass showed several claims are
validated only through **no-op seams**. Findings:

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **AF1c-1** | HIGH | The live content path (`refresh`→`loadAppGraph`→`loadEnvelope`) STILL recreates the hub+Supervisor; 1c's persistence is not on the production path (that is U-STATE-1b's rewiring, AF12). | **MOVED to U-STATE-1b (Decision 2A)** — 1b rewires `refresh`; 1c's production-path evidence is 1b-gated (documented) |
| **AF1c-2** | HIGH | `applyContentReconcile.attachRoot` still translates with an **anonymous hub** — 1c's hub is not used by the attach path it was built for (the 1b AF1 fix). | **MOVED to U-STATE-1b** — the attach fix uses `this.hub` |
| **AF1c-3** | HIGH | `mountOperator` reused scope+adapter but created a **new hub + Supervisor + node set each call** (scope-node growth; one module-level finalize hook per `new Supervisor`). | **RESOLVED:** package half **FIXED in 0.4.1** (`Supervisor.dispose()`, now called before a rebuild); host half **RESOLVED by the §2.3 decoupling** (operator re-renders only on operator-initiated changes, not per content refresh) |
| **AF1c-4** | MED | `admitContentNodes` is **unwired and incomplete** (no handler-body resolution, no id-index, no payload/compile). | **MOVED to U-STATE-1b** — 1b uses it + it does the full admit |
| **AF1c-5** | MED | §2.4 incremental `backRefs` not implemented. | **MOVED to U-STATE-1b (Decision 3)** — ownership moved (§2.4); 1b recomputes from the live graph |
| **AF1c-6** | MED | Repeated `mountOperator` minted fresh operator node ids → full DOM churn, discarding operator input on any `refresh`. | **RESOLVED by the §2.3 decoupling** — content refreshes no longer remount the operator pane; churn only on an operator-initiated change (acceptable), with input-preservation where practical |
| **AF1c-7** | LOW/INFO | `refreshOperator`, `admitContentNodes`, `applyContentReconcile`, `materializedContentRoots` have **no callers**; test 4 only checks identity. | **OPEN (1b)** — 1b wiring + stronger tests |
| **AF1c-8** | INFO | Full-reset hub recreation in `loadEnvelope`/`loadDoc` is **safe**; `validate*` throwaways correctly never touch `this.hub`. | clean |
| **AF1c-9** | INFO / PACKAGE | Placement anchors survived destroy on a reused hub. | **FIXED in provident-ssr 0.4.1** (`destroyLinks` detaches `content`/`container` anchors) |
| **AF1c-10** | INFO | No app-graph vs operator hub conflation found. | clean |

**Verdict: U-STATE-1c MECHANISM LANDED; production-path evidence is U-STATE-1b
(Decision 2A).** The package-resolved findings (AF1c-3 package half, AF1c-9) are
closed by 0.4.1. The host findings that require the reconcile wiring
(AF1c-1/2/4/7) move to **U-STATE-1b**; `backRefs` (AF1c-5) also moves to 1b
(Decision 3). The operator-decoupling decisions (AF1c-3 host / AF1c-6) are
resolved by §2.3. **PRODUCTION PATH WIRED (2026-09-11c):** U-STATE-1b landed the
content-only path (`applyContentChange`), so 1c's persistence is now exercised
end-to-end (a content re-derive calls `loadEnvelope` 0 times); the earlier
"1b-gated" caveat is discharged. Doc review:
`archive/reviews/2026-09-11-unit-u-state-1b-1c-doc-review.md`.
