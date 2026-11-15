# Astrographer — the layer return envelope

Every layer return ends with one fenced `json` block and nothing after it (D-2). Ceiling: 40 lines.
The contract is the workflow's, carried whole by the deployment's preset; this file fixes nothing new
and adds no field.

## 1. Fields

Required are `unit`, `from`, `to`, `verdict` and `artifact`; optional are `testIds`, `rootCause`,
`assumptions`, `question`, `citations` and `notes` — the last a free-form remark a reader needs and
no other field carries (D-2). `from` and `to` are layer ids, and a return travels exactly one layer
up, so `to` is one below `from` — except from L4 on any non-`PASS` verdict, which routes to L2,
because L4 owns no design and L3 designed the thing under judgement (D-4).

## 2. Verdicts

The set is closed, and each verdict maps to exactly one state transition, so a return cannot be
ambiguous about what happens next (D-2):

| Verdict | Meaning | Transition |
|---|---|---|
| `PASS` | the layer's battery is green | `strata-state pass` |
| `FAIL` | root cause established, not a rebuild | `strata-state fail` |
| `ADJUDICATION` | cannot proceed without a decision | `strata-state fail --reason adjudication` |
| `REBUILD` | the artifact is not worth salvaging | `strata-state rebuild` |

## 3. Conditions

- A non-`PASS` verdict carries `rootCause`, and an examiner diagnoses rather than patches (D-6).
- A `PASS` verdict carries `citations`, because a green claim names the document that supports it
  (D-5, §2).
- No return carries code to insert: a fenced block whose language is not `json`, or a `@@` hunk,
  fails the envelope check (D-2).
- Every `assumptions` entry carries `{id, text, alternative}`, and the rejected alternative is
  mandatory (D-2, `brief.md` §8).
- Only a `question` that needs user intent climbs past L0; anything a layer can decide itself
  proceeds as an `ASM-n` instead (D-1, D-12).
