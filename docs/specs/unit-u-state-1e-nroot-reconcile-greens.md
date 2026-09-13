# Unit U-STATE-1e — N-Root Multi-Document Reconcile — Blind Greens

**Role:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-12.
**Source of expectations:** `docs/specs/unit-u-state-1e-nroot-reconcile.md`
ONLY (§2.1/§2.2 + §3 states 1–10 + §4 F1–F8 + §2.2 adversarial pins). No
implementation source was read to derive expectations.
**Probe:** throwaway `tests/__blind_u_state_1e.test.ts` (imports + executes the
live `src/renderer/content-reconcile.ts` only). Deleted after the run; not
committed.

**Verdict: 24 scenarios — 22 PASS / 0 FAIL / 2 NOT-TESTED (final).**
The initial run was **19 PASS / 3 FAIL / 2 NOT-TESTED**; the 3 FAILs were all
the same §2.2 `documentIds`-scope drift (F2/F5/F8, see §FAIL). Both the
reconciler drift and the host application were subsequently FIXED, the blind
scenarios were re-run, and F2/F5/F8 reconciled to **PASS** (drift history in
§FAIL). The 2 NOT-TESTEDs remain host-layer pins with no pure-module seam.

---

## Census

| Bucket | Count | IDs |
| --- | --- | --- |
| PASS | 22 | S1, S2, S3, S4, S5a, S5b, S6 (H2a), S7, S8 (L3a), S9, F1, F2, F3, F4, F5, F6, F7, F8, H1a, H1b/L1, H2b, L3b |
| FAIL | 0 | — (F2/F5/F8 reconciled to PASS after the stale-root-scope fix; see §FAIL) |
| NOT-TESTED | 2 | S10, H3 |

---

## §3 Valid paths

### S1 — two document ids materialized; both roots returned; neither is a pane
- **Spec:** §3.1.
- **Input:** `previous=[{A,rag-X},{B,rag-Y}]`, `next=[{A,env(rag-X)},{B,env(rag-Y)}]`, `change={kind:'content',nodeIds:[],edgeIds:[]}`, `documentIds=['A','B']`.
- **Expected (spec):** both roots returned in `kept`; no pane css id appears; `usedFallback=false`.
- **Observed:** `kept=[A|rag-X, B|rag-Y]`; other buckets empty; `usedFallback=false`.
- **Verdict: PASS.**

### S2 — content change editing document A only
- **Spec:** §3.2.
- **Input:** `previous=[{A,rag-X('old')},{B,rag-Y('b1')}]`, `next=[{A,rag-X('new')},{B,rag-Y('b1')}]`, `change={kind:'content',nodeIds:['X'],edgeIds:[]}`, `documentIds=['A','B']`.
- **Expected (spec):** only A's root group replaced; B's kept; template/zone nodes persist (not in buckets); `usedFallback=false`.
- **Observed:** `replaced=[A|rag-X]`, `kept=[B|rag-Y]`, `added=[]`, `removed=[]`; zone ids `zone-main`/`zone-side` absent from all buckets; `usedFallback=false`.
- **Verdict: PASS.**

### S3 — structural change adding document C
- **Spec:** §3.3.
- **Input:** `previous=[{A,rag-X},{B,rag-Y}]`, `next=[{A,...},{B,...},{C,rag-Z}]`, `change={kind:'structural'}`, `documentIds=['A','B','C']`.
- **Expected (spec):** C's roots attach (`added`); A/B kept; `usedFallback=true`.
- **Observed:** `added=[C|rag-Z]`, `kept=[A|rag-X,B|rag-Y]`, `usedFallback=true`.
- **Verdict: PASS.**

### S4 — structural change removing document B
- **Spec:** §3.4.
- **Input:** `previous=[{A,rag-X},{B,rag-Y},{C,rag-Z}]`, `next=[{A,...},{C,...}]`, `change={kind:'structural'}`, `documentIds=['A','C']`.
- **Expected (spec):** B destroyed (`removed`); A/C kept; `usedFallback=true`.
- **Observed:** `removed=[B|rag-Y]`, `kept=[A|rag-X,C|rag-Z]`, `usedFallback=true`.
- **Verdict: PASS.**

### S5a — shared RAG node materialized in A and B; change to it replaces both
- **Spec:** §3.5.
- **Input:** `previous=[{A,rag-X},{B,rag-X}]`, `next=[{A,rag-X},{B,rag-X}]`, `change={kind:'content',nodeIds:['X']}`, `documentIds=['A','B']`.
- **Expected (spec):** two distinct roots `(A,rag-X)` and `(B,rag-X)`; both replaced; `usedFallback=false`.
- **Observed:** `replaced=[A|rag-X, B|rag-X]`, `usedFallback=false`.
- **Verdict: PASS.**

### S5b — change to a node only in A leaves B's shared root kept
- **Spec:** §3.5.
- **Input:** `previous/next = [{A, rag-X with nested rag-Y},{B, rag-X}]`, `change={kind:'content',nodeIds:['Y']}`, `documentIds=['A','B']`.
- **Expected (spec):** A's root replaced (subtree contains Y); B's shared root kept.
- **Observed:** `replaced=[A|rag-X]`, `kept=[B|rag-X]`, `usedFallback=false`.
- **Verdict: PASS.**

### S6 — per-root identity replace (fork in A; B's rag-X kept) — also H2a
- **Spec:** §3.6, §2.2 pins.
- **Input:** `previous=[{A,rag-X},{B,rag-X}]`, `next=[{A,rag-X'},{B,rag-X}]`, `change={kind:'content',nodeIds:['X',"X'"]}`, `documentIds=['A','B']`.
- **Expected (spec):** `identityReplaced=[{documentId:'A', from:rag-X, to:rag-X'}]`; A/X NOT in `removed`; A/X' NOT in `added`; B/X `kept`.
- **Observed:** `identityReplaced=[{documentId:'A', from:{cssId:'rag-X',ragNodeId:'X'}, to:{cssId:"rag-X'",ragNodeId:"X'"}}]`; `added=[]`, `removed=[]`, `kept=[B|rag-X]`.
- **Verdict: PASS.**

### S7 — `usedFallback` semantics preserved
- **Spec:** §3.7 (1a §3.3 / AF9).
- **Input matrix (same prev/next):** clean content empty `nodeIds`; clean content `nodeIds:['X']`; `structural`; content with `edgeIds:['e1']`; `change=null`; malformed `change` missing arrays.
- **Expected (spec):** `false / false / true / true / true / true`.
- **Observed:** `false / false / true / true / true / true`.
- **Verdict: PASS.**

### S8 — single-root no-regression (non-identity) — also L3a
- **Spec:** §3.8, §2.2 (L3 exempts identity).
- **Input:** one document, `previous=[root X]`, `next` identical, `change={kind:'content'}`; compared against `reconcileContentRoots` with the same `previous`/`next`/`change`.
- **Expected (spec):** identical buckets (after stripping the N-root `documentId`) and identical `usedFallback`.
- **Observed:** N-root `{kept:[rag-X|X], usedFallback:false}` === one-root `{kept:[rag-X|X], usedFallback:false}`.
- **Verdict: PASS.**

### S9 — determinism + bucket order
- **Spec:** §3.9.
- **Input:** `previous=[{A,rag-R1},{A,rag-K1},{A,rag-R2}]`, `next=[{A,env(rag-N1,rag-K1)}]`, `change={kind:'structural'}`, `documentIds=['A']`.
- **Expected (spec):** `added` follows `next` order `[N1]`; `kept=[K1]`; `removed` follows `previous` order `[R1,R2]`; two runs deep-equal.
- **Observed:** `added=[A|rag-N1]`, `kept=[A|rag-K1]`, `removed=[A|rag-R1,A|rag-R2]`, `deterministic=true`.
- **Verdict: PASS.**

### S10 — content path calls `loadEnvelope` 0 times (C10)
- **Spec:** §3.10.
- **Expected (spec):** host-level call count 0 on a content re-derive.
- **Observed:** not exercised — the pin is a `SidebarPanes`/`Runtime` host claim (`tests/unit-u-state-1b-host-application.test.ts` / the re-anchored `contenteditable-editor-host` CRITICAL #1 own this), not a pure-module claim. No host harness was built for this probe.
- **Verdict: NOT-TESTED (host layer; reason recorded).**

---

## §4 Fail-states / edge cases

### F1 — `documentId` in `documentIds` absent from `next`
- **Spec:** §4 F1.
- **Input:** `documentIds=['A','B','C']`, `next` only A,B, `previous=[{A,rag-X}]`.
- **Expected (spec):** no roots for C; never throws.
- **Observed:** all emitted keys `[A|rag-X, B|rag-Y]`; no `C|`; no throw.
- **Verdict: PASS.**

### F2 — empty `documentIds`
- **Spec:** §4 F2 (`no-op result`).
- **Input:** `previous=[{A,rag-X}]`, `next=[{A,env(rag-X)}]`, `change={kind:'content'}`, `documentIds=[]`.
- **Expected (spec):** no-op result — no roots in any bucket (the empty set is not reconciled; the boot/empty-store path keeps the full load).
- **Observed (initial):** `added=[]`, `replaced=[]`, `kept=[]`, **`removed=[A|rag-X]`**.
- **Verdict: PASS (fixed post-run).** The initial run FAILED: the reconciler
  reported the out-of-scope previous root as `removed` instead of a no-op (same
  root cause as F5/F8). **FIXED** by the out-of-scope-previous-root drop on a
  content/`null` change (spec §4 F8 + the stale-root drop nuance in §4/§9),
  re-run PASS.

### F3 — malformed `next` / missing `template.root`
- **Spec:** §4 F3.
- **Input:** `next=undefined`; `next` non-array; envelope missing `template`; `template` present but `root` missing.
- **Expected (spec):** a documented guard throw, never a raw `TypeError`.
- **Observed:** all four throw a non-`TypeError` `Error`:
  - `next undefined` → `Error: reconcileDocumentRoots: next envelopes array required`
  - `next non-array` → `Error: reconcileDocumentRoots: next envelopes array required`
  - missing `template.root` → `Error: reconcileDocumentRoots: next envelope with template.root and content required`
  - `template` w/o `root` → `Error: reconcileDocumentRoots: next envelope with template.root and content required`
- **Verdict: PASS.**

### F4 — duplicate `(documentId, cssId)` in `previous`
- **Spec:** §4 F4 (first wins, deterministic).
- **Input:** `previous=[{A,rag-A('first')},{A,rag-A('different')}]`, `next=[{A,rag-A('first')}]`, `change={kind:'content'}`.
- **Expected (spec):** first wins → `kept` (because the next shape matches the first); deterministic.
- **Observed:** `kept=[A|rag-A]`, `replaced=[]`, `added=[]`, `removed=[]`, `deterministic=true`.
- **Verdict: PASS.**

### F5 — a `rag-` root not scoped to any open document
- **Spec:** §4 F5 (`out of the N-root set; never emitted (no phantom document)`).
- **Input:** `previous=[{Z,rag-X},{A,rag-A}]`, `next=[{A,env(rag-A)}]`, `documentIds=['A']`.
- **Expected (spec):** the `Z` root is never emitted.
- **Observed (initial):** all emitted keys `[Z|rag-X, A|rag-A]` — the out-of-scope `Z|rag-X` WAS emitted (as `removed`).
- **Verdict: PASS (fixed post-run).** The initial run FAILED: `Z|rag-X` was
  emitted; spec says never emitted. **FIXED** by the same out-of-scope-previous-
  root drop (spec §4 F8/§9), re-run PASS.

### F6 — a fork batch fails mid-commit
- **Spec:** §4 F6.
- **Input:** `change=null` (no change event), same prev/next; purity check on the input object.
- **Expected (spec):** no partial mutation; the reconciler sees no change event. The `applyBatch` atomicity itself is host-layer (Option-C).
- **Observed:** input object byte-identical before/after; no throw.
- **Verdict: PASS** (pure-module half; the atomic `applyBatch` half is U-SHELL-9b host-layer and is not exercised here).

### F7 — a `pane-` root present among document roots
- **Spec:** §4 F7 + §2.2 (`documentId:''`; keyed by `cssId`; shape-compared always).
- **Input:** `previous=[{'',pane-nav('old')},{A,rag-A}]`, `next=[{A,env(pane-nav('new'), rag-A)}]`, `change={kind:'content',nodeIds:[]}`, `documentIds=['A']`.
- **Expected (spec):** pane reconciled separately with `documentId:''`; shape-compared always → `replaced` (content changed) even under a no-op content change; never attributed to A.
- **Observed:** `replaced=[''|pane-nav]` (doc `''`, not `A`), `kept=[A|rag-A]`; exactly one pane entry.
- **Verdict: PASS.**

### F8 — a mounted document not in `documentIds` (stale)
- **Spec:** §4 F8 (`dropped from the result`).
- **Input:** `previous=[{A,rag-A},{B,rag-B}]`, `next=[{A,env(rag-A)}]`, `documentIds=['A']`.
- **Expected (spec):** B dropped from the result; A kept.
- **Observed (initial):** all emitted keys `[B|rag-B, A|rag-A]` — stale `B|rag-B` WAS emitted (as `removed`).
- **Verdict: PASS (fixed post-run).** The initial run FAILED: `B|rag-B` was
  emitted; spec says dropped. **FIXED** by the same out-of-scope-previous-root
  drop on a content/`null` change (spec §4 F8/§9 — now nuanced: a **structural**
  close still reports the closed document's roots as `removed`, per §3 state 4),
  re-run PASS.

---

## §2.2 pins + adversarial regressions

### H1a — a root moves from A to B
- **Spec:** §2.2 (`removed from A and added to B, never global kept`).
- **Input:** `previous=[{A,rag-X}]`, `next=[{B,rag-X}]`, `change={kind:'content',nodeIds:['X']}`, `documentIds=['A','B']`.
- **Expected (spec):** `removed=[A|rag-X]` AND `added=[B|rag-X]`; never kept.
- **Observed:** exactly that; `kept=[]`.
- **Verdict: PASS.**

### H1b / L1 — duplicate `documentIds` de-duped
- **Spec:** §2.2 (`Duplicate documentIds are de-duped before the ordered traverse (H1/L1)`).
- **Input:** `documentIds=['A','A','B','A']`, `previous/next` A,B; `change={kind:'content'}`.
- **Expected (spec):** de-duped; one scoped root per `(documentId,cssId)`; deterministic.
- **Observed:** `kept=[A|rag-A,B|rag-B]`, all scoped keys unique, two runs deep-equal.
- **Verdict: PASS.**

### H2b — B's own same-cssId add/remove not suppressed by A's identity replace
- **Spec:** §2.2 (`B's own same-cssId add/remove is never suppressed by A's identity replace`).
- **Input:** `previous=[{A,rag-X},{B,rag-X}]`, `next=[{A,rag-X'},{B}]`, `change={kind:'content',nodeIds:['X',"X'"]}`, `documentIds=['A','B']`.
- **Expected (spec):** A identity replace; B's `rag-X` still `removed`.
- **Observed:** `identityReplaced=[A: rag-X→rag-X']`; `removed=[B|rag-X]`.
- **Verdict: PASS.** (H2a is S6 above.)

### L3b — an identity replace deliberately diverges from single-root no-regression
- **Spec:** §2.2 (`identityReplaced` vs `removed`+`added`; L3 exemptions).
- **Input:** one document, `previous=[{A,rag-X}]`, `next=[{A,rag-X'}]`, `change={kind:'content',nodeIds:['X',"X'"]}`.
- **Expected (spec):** `identityReplaced` populated; the pair NOT in `removed`+`added`.
- **Observed:** `identityReplaced=[A: rag-X→rag-X']`; `removed=[]`, `added=[]` (and `replaced=[]`).
- **Verdict: PASS.** (L3a / non-identity no-regression is S8 above.)

### H3 (deferred) — multi-scope same-cssId identity replace at the host
- **Spec:** §2.2 (`H3 deferred + documented`: host identity apply ignores `documentId`; unsupported until U-SHELL-9b).
- **Expected (spec):** host-layer deferral; not a pure-reconciler claim.
- **Observed:** not exercised — `Runtime.applyContentReconcile`/`destroyRoot` are host code; the per-document id-namespace/mount is U-SHELL-9b's (§8 item 2).
- **Verdict: NOT-TESTED (host layer; documented deferral).**

---

## FAIL detail + citation (RECONCILED — all FIXED)

| ID | Spec section | Observed (initial) | Expected (spec) | Resolution |
| --- | --- | --- | --- | --- |
| F2 | §4 F2 | `documentIds=[]` → `removed=[A|rag-X]` | `no-op result` (all buckets empty) | **FIXED** — drop out-of-scope previous roots on a content/`null` change; re-run PASS |
| F5 | §4 F5 | `documentIds=['A']`, `previous` scoped to `'Z'` → emitted `Z|rag-X` | `never emitted (no phantom document)` | **FIXED** — same drop; re-run PASS |
| F8 | §4 F8 | `documentIds=['A']`, `previous` scoped to `'B'` → emitted `B|rag-B` | `dropped from the result` | **FIXED** — same drop (a structural close still emits `removed`); re-run PASS |

**Common root cause (single drift):** previous roots whose `documentId` is not in
`documentIds` were classified as `removed` and emitted, instead of being excluded
from the N-root set. This contradicted the §2.2 keying pin ("classify content
roots against all open documents"; keyed by `(documentId, cssId)`) and the three
§4 fail-states. Per the blind-test contract this was a **FAIL** (spec drift /
un-hardened regression), not a pass. It was host code
(`src/renderer/content-reconcile.ts`), so it was fixed here by the Implementer
(not handed off): the `prevByDoc` build + the `removed` loop now drop a previous
document root whose non-empty `documentId` ∉ `documentIds` **on a content/`null`
change**, while a **structural** close still reports it as `removed` (§4 F8/§9).
The drift is therefore **RECONCILED to PASS**; the post-fix unit file is
**28 pass** (`tests/unit-u-state-1e-nroot-reconcile.test.ts`).

**Alternative reading for the Architect (recorded, superseded):** one could
argue emitting stale-scope previous roots as `removed` lets the host detach them
(F8's parenthetical "the host detaches it"). The Architect ruled the literal
spec ("never emitted" / "dropped from the result") for content changes and
preserved the structural-close `removed` case as the explicit exception, so the
alternative is not adopted.

---

## Not tested (spec statements with no pure-module seam)

| ID | Spec statement | Why not tested |
| --- | --- | --- |
| S10 | The content path still calls `loadEnvelope` **0 times** (C10) | Host-layer (`SidebarPanes`/`Runtime`); owned by the 1b host suite + the `contenteditable-editor-host` CRITICAL #1. This probe imports only the pure reconciler. |
| H3 | Host identity apply ignores `documentId`; multi-scope same-cssId identity replace unsupported until U-SHELL-9b | Host-layer (`Runtime.applyContentReconcile` / global `destroyRoot`); deliberately deferred per §2.2/§8 item 2. |

Additional spec statements not independently asserted here because they are
input-shape constraints already covered by §2.1/the 1a suite: `reconcileContentRoots`
kept unchanged (only compared in S8/L3a); `buildTraversal` unchanged (no
interface exercised).
