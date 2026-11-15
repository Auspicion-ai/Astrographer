# Astrographer — L0 research

Procedure for the supervisor's fact-finding before a design commitment (D-12). Ceiling: 40 lines.

## 1. When it runs

A note, a feature request, an intake, or a question whose answer depends on something outside this
project: a package's real API, a paradigm's trade-offs, a specification, a competing tool, or another
checkout's state (D-12).

## 2. What it may conclude

It establishes what is true and cites it. It never commits a design, a dependency, or a rule — those
are L0 decisions, and a decision that needs user intent goes to the user (D-1). Every claim carries a
source: a URL, a path, or a command whose output is quoted. An unsourced claim is recorded as
`unsourced` and can never be the sole basis of a decision (D-2).

## 3. The over-fit firewall

A named package or technology is an **option**, never a rule (D-2). Each one is recorded with the
acceptance predicate it satisfies, so a substitute is judged against that predicate rather than
against the named example. Recording the name alone is how one recommendation becomes a locked
dependency list.

## 4. Output

`strata/records/<topic>-research.md`, at most 40 lines, replaced on every pass and never appended
(D-2). One row per finding: claim, source, confidence, and what it would change if false. An intake
that spans more than the record can hold is split by question, one topic per record — never grown
past the ceiling.

## 5. Return

The envelope in `strata/envelope.md` (D-2): `PASS` with the record's path as its citation, or `FAIL`
with the question that could not be answered — which L0 then takes to the user (D-1). A finding that
would change the project's scope is reported as the question it needs, never promoted into a plan.
