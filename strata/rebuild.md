# Astrographer — the rebuild protocol

Procedure for a rebuilt artifact (D-4). Ceiling: 40 lines.

## 1. Eligibility

**Repeat failure** means the same artifact id fails the same test class on **3 consecutive repair
passes**. The count lives in `strata-state` as the per-artifact `streaks` entry and is never counted
by eye, because an undefined "repeat" is the prose trigger that rots first (D-4). Below threshold the
recommendation is rejected; the streak alone is also not enough, and the examiner still judges whether
the code is worth salvaging. An adjudication request from a lower layer counts as one failure (D-4):
asking is not a pause and is not free.

The streak is cleared **per artifact**: that artifact's own `pass` deletes its entry, a `pass` on a
sibling leaves it standing, and `lastFailure` is cleared only by `rebuild` (`platform.md` §4, D-2).

## 2. What the examiner may emit

`examiner.md` §4 — one statement of the rule, not two, and the envelope check enforces it (D-6).

## 3. Who decides

One layer above the examiner (D-4). Recommending a rebuild asserts that the examiner's own layer
designed wrongly — three passes on one design indicts the design, not the code — and a layer cannot
adjudicate its own design (D-4).

## 4. Retrospective, before teardown

The owning layer's designer writes ≤ 20 lines answering exactly three questions: what did we believe
that was false; which test should have caught it and why it did not; what changes next cycle (D-4).
It **supersedes** the recommendation it answers in `strata/records/` — that record keeps the
recommendation as its own dated reading and says it was taken — is never appended to a live design
document, and never re-opens an earlier cycle's reasoning (D-2, §2).

## 5. Then

Teardown, then a fresh cycle from the layer that owns the artifact. The unit keeps its id, the
retrospective is the only carry-over, and the new cycle starts from the artifact spec rather than
from the abandoned code (D-4). A second rebuild of the same artifact escalates again instead of
repeating: two rebuilds are evidence about the upstream design, not about the implementer (D-4).
