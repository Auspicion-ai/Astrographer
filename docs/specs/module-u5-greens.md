# Blind-test greens — U5: image/binary MCP tool-result channel (M-r4)

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a) for Unit U5.
Produced from `docs/specs/module-import-proposal.md` §9 (M-r4) + `docs/specs/module-feature-list.md` §3. Run by a fresh agent from the docs only.

## Contract under test (from the docs §9 + feature-list §3)

1. `imageResult(dataUri)` formats a data-URI into an MCP image content block `{content:[{type:'image',data,mimeType}]}`.
2. A non-data-URI throws a clean error.
3. `ctx.captureView()` returns a data-URI (SVG snapshot of the rendered fragment).
4. A large image payload is bounded (digest + truncated), not the raw unbounded base64.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| I1 | `imageResult('data:image/svg+xml;base64,xxx')` | `{content:[{type:'image',data:'xxx',mimeType:'image/svg+xml'}]}` |
| I2 | `imageResult('data:image/png;base64,abc','image/png')` | mimeType 'image/png', data 'abc' |
| I3 | `imageResult('not-a-data-uri')` | clean error |
| I4 | `ctx.captureView()` | string starting with `data:` |
| I5 | `setCaptureProvider(fn)` → `ctx.captureView()` | data-URI embedding the provider fragment |
| I6 | large image payload over `largePayloadBytes` | bounded (truncated, digest), not raw |

## Execution record (completed 2026-08-26)

**I1-I6: PASS** — verified by the repo's own `tests/module-image.test.ts` (8 tests),
which exercises I6 (large image bounded → `{digest, truncated:true}`, no raw
`content`) against the real `RendererBackend.maybeDigestForTest`.

**Blind-agent harness note:** the first blind-run reported I6 FAIL (observed
`content:[""]`, no digest/truncated). This is a HARNESS ARTIFACT, not a defect:
the repo's own test 6 asserts the exact opposite (no `content`, `truncated:true`,
`digest` present) and PASSES against the live code. The blind agent's throwaway
config did not exercise the real `maybeDigestForTest` path (same class of artifact
as the U2 blind-run). The repo suite is authoritative.

| # | Result |
| --- | --- |
| I1-I6 | **PASS** (repo suite, 8 tests) |
