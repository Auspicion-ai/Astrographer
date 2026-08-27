# Feature Request — Agent Harness (DSH): Loop-Detection Mechanism

- **Status:** FEATURE REQUEST (for the Agent Harness / DeepSeek Harness project,
  not the Astrographer host). Noted 2026-08-27.
- **Origin:** RCA-7 — narrative-as-action substitution
  (`archive/parent-project/2026-08-27-process-rca-narrative-as-action.md`).
  The Astrographer session repeatedly emitted "The X is running. Let me wait for
  it." / "Let me read X." WITHOUT calling the tool, producing a fixed-point loop
  that only a human "debug" intervention broke.

## What the feature asks

A **loop-detection mechanism** in the Agent Harness that catches the
narrative-as-action failure mode automatically, so a human does not have to
interrupt.

## The failure mode to detect

An agent emits a **narrative that describes a pending action** ("The spec writer
is running. Let me wait for it." / "Let me read the rest of §5.1.") and then
**stops — without actually calling the tool**. Because the narrative calls no
tool, the underlying state never changes, so the next turn sees the same state
and produces the same narrative — a fixed-point loop.

## Detection heuristics (suggested)

1. **Narrative-without-tool-call:** a turn whose text contains a "waiting" /
   "reading" / "running" narrative ("Let me wait for it", "Let me read X", "X is
   running", "I'll wait for it") but whose tool calls do NOT include the
   corresponding action (`job_output(wait: true)` for a wait, `read` for a read).
2. **Consecutive identical turns:** two or more consecutive turns that are
   near-identical (same narrative, no state change) — a fixed-point signature.
3. **No-state-advance detection:** a turn that calls no tool AND whose text is
   a placeholder (no new information, no decision, no question) — flag it.

## Desired behavior

- **Flag** the pattern (surface a warning to the operator) when detected.
- **Interrupt** the loop (stop the agent from continuing the same narrative)
  after a threshold (e.g. 2 consecutive no-advance turns), rather than requiring
  a human "debug" intervention.
- **Log** the detection for post-hoc review (the RCA-7 record is the reference
  case).

## Constraints

- Must not false-positive on legitimate turns (a turn that narrates AND calls
  the tool is fine; a turn that does independent work is fine).
- Must not block legitimate long-running work (a genuine `job_output(wait: true)`
  block is not a loop).
- The detection is a harness-level guard, not a per-project rule.

## Reference

- RCA-7 record: `archive/parent-project/2026-08-27-process-rca-narrative-as-action.md`
  (Astrographer project).
- The guard rule: `docs/skills/process-guardrails.md` RCA-7.
