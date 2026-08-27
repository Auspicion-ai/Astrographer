# Green Scenarios — Renderer Debug Panel (#3)

> **SUPERSEDED (2026-08-25).** The Debug pane's behavior is now covered by
> `SecurePanels.refreshDebug(runtime)` in the isolated panes graph
> (`docs/specs/secure-panels.md`). The blind scenarios here (`initDebugPanel`)
> were re-authored against the new surface in `tests/blind-renderer-debug.test.ts`
> (D1.1/D1.3/D2.6/D3.8/D3.9) + the gemma4 S30/S31. Kept for provenance.

Status: **SUPERSEDED** (originally the green-scenario set).
Each scenario below is a behavior `docs/specs/debug-panel.md` claims; the
blind-test agent runs it against the live `initDebugPanel` + the Runtime
(under the DOM shim) and confirms it PASSES. A failure is a doc bug OR an
un-hardened regression — never a pass.

Module under test: `src/renderer/debug-panel.ts` `initDebugPanel`. Tests:
`tests/debug-panel.test.ts`. The Runtime + DOM shim provide `#status` +
`renderedHtmlResult()` (`{ renderedHtml, ssrHtml, census }`).

## D1 — install + refresh

1. `initDebugPanel(runtime)` returns a function; calling `refresh()` writes a
   string matching `/inTree \d+ · registered \d+/` with the SSR preview on a
   new line.
2. After `runtime.bootstrap()` + `refresh()`: `#status.textContent` contains
   `inTree 12` (the demo) AND a preview containing `data-node-id` (the SSR
   fragment carries the attribute).
3. After `await runtime.teardownResult()` + `refresh()`: `#status.textContent`
   contains `inTree 1` (root-only).
4. A second `refresh()` produces the SAME text (read-only; no mutation).
5. `refresh()` does not change `renderedHtmlResult().census` (read-only).

## D2 — SSR preview truncation

6. The demo SSR fragment is > 120 chars; the preview line ends with `…` and is
   ≤ ~125 chars (the first 120 collapsed chars + `…`).
7. An empty/whitespace-only `ssrHtml` → preview `(empty)`.

## D3 — adversarial hardening (F1/F2)

8. **F1** — a non-number census field (`undefined`/`NaN`) is coerced to `?`:
   `#status.textContent` contains `inTree ?`, never `undefined`/`NaN`.
9. **F2** — a non-string `ssrHtml` (number/object/null) does NOT throw
   (coerced to `''`); a null/whitespace `ssrHtml` → preview `(empty)`.

## D4 — absent `#status` (real-DOM guard)

10. `initDebugPanel` with `document.getElementById('status')` returning null →
    returns a no-op refresh; calling it does NOT throw. (Not testable with the
    shim — the real-DOM guard is the `if (!el) return () => undefined` path.)

## How the blind-test uses this

- The blind-test agent reads ONLY `docs/specs/debug-panel.md` (+ this file's
  claims) and runs each scenario against `initDebugPanel`, asserting PASS.
- The green set is the regression net for the debug panel + the F1/F2
  adversarial fixes (F1→8, F2→9).