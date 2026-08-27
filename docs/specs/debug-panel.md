# Spec — Renderer Debug Panel (#3)

> **SUPERSEDED (2026-08-25).** The Debug pane is now hosted in the isolated
> `SecurePanels` graph (`src/renderer/secure-panels.ts` + `docs/specs/secure-panels.md`)
> — provident-rendered in its own `GraphScope`, not the hand-written
> `debug-panel.ts` this spec describes. The `SecurePanels.refreshDebug(runtime)`
> surface carries the same behavior (census + truncated SSR preview) into the
> panes graph's `#status` node. Kept for provenance; the ACTIVE contract is
> `docs/specs/secure-panels.md`.

Status: **SUPERSEDED** (originally the delegation gate for the debug-panel unit). Source:
`docs/next-steps.md` #3 ("Renderer debug panel — live census + SSR fragment in
`#status`"). A read-only debugging surface in the Electron renderer that
mirrors the MCP agent's view (census + SSR) into the `#status` pane after
every render, so an operator watching the window sees the live graph state.

## 1. Scope

`src/renderer/debug-panel.ts` (new) + `src/renderer/renderer.ts` (wiring) +
`src/renderer/index.html` (the `#status` pane already exists). The panel reads
the `Runtime`'s `renderedHtmlResult()` (the SAME surface `provident.
get_rendered_html` returns — `renderedHtml` + `ssrHtml` + `census`) and writes a
compact summary to `#status`. It is a DEBUGGING surface only — never an MCP
tool, never a mutation path. No package change.

The panel refreshes:
- once after `runtime.bootstrap()` (the initial render);
- after every handled MCP request (`dispatch`/`load`/`op`/`export` is a
  no-op for the panel; `teardown`/`code.load` change the graph — the panel
  refreshes after each reply).

## 2. The surface (exact)

```ts
export function initDebugPanel(runtime: Runtime): () => void
```

- `initDebugPanel(runtime)` reads `#status` from the DOM; returns a `refresh()`
  function. If `#status` is absent, it is a no-op (returns a no-op refresh).
- `refresh()` reads `runtime.renderedHtmlResult()` and writes a one-line
  census + a truncated SSR fragment into `#status`:
  - census line: `inTree <n> · registered <n> · unplaced <n> · destroyed <n> · prototypes <n>`
  - SSR preview: the first ~120 chars of `ssrHtml` (or `(empty)` if empty),
    collapsed to a single line, appended after the census on a new line.
- The panel is read-only: it NEVER calls `dispatch`/`load`/`teardown` or any
  mutating `Runtime` method; it reads `renderedHtmlResult()` only.

## 3. Behavior (every state / fail-state)

- `#status` absent → `initDebugPanel` returns a no-op refresh (no throw).
- After bootstrap + `refresh()`: `#status.textContent` contains the census line
  with `inTree` + the registered count + a non-empty SSR preview (the demo
  renders 12 elements).
- After a `teardown` reply + `refresh()`: `#status` shows `inTree 1` and an SSR
  preview of the root-only fragment (or `(empty)`-ish; the root element
  remains).
- A `refresh()` call does NOT mutate the graph (`renderedHtmlResult` is
  read-only; calling it twice yields the same text).
- The SSR preview is truncated to 120 chars + an ellipsis when longer; a
  multi-line fragment is collapsed to a single line (newlines → spaces).

## 4. Verify (the TestWriter's exact states)

- `initDebugPanel(runtime)` with `#status` in the DOM → `refresh()` writes a
  string matching `/inTree \d+ · registered \d+/` containing the SSR preview.
- After `runtime.bootstrap()` + `refresh()`: `#status.textContent` includes
  `inTree 12` (the demo) AND a preview containing `data-node-id` (the SSR
  fragment has the attribute).
- After a teardown + `refresh()`: `#status.textContent` includes `inTree 1`.
- `#status` absent → `initDebugPanel` returns a no-op; calling it does NOT
  throw.
- A second `refresh()` produces the SAME text (read-only; no mutation).
- The SSR preview is at most ~120 chars + `…` for a long fragment.

## 5. Wiring (renderer.ts)

`renderer.ts` `main()` calls `const refresh = initDebugPanel(runtime)` after
`runtime.bootstrap()`, refreshes once, and calls `refresh()` after each
`handleRequest(...).then(...)` reply (inside the `.then`). No Electron-API
change; the panel is plain DOM.

## 3a. Adversarial findings (2026-08-23) — landed as fixes

A read-only adversarial review of the debug-panel green landed these host-side
defensive fixes (no package defect; only fire on a `Runtime` contract drift).
The greens (`debug-panel-greens.md` D3) encode them.

| # | Finding | Fix (documented contract) |
| --- | --- | --- |
| F1 | A non-number census field (`undefined`/`NaN`) printed `inTree undefined`/`NaN` to the operator's view, silently breaking the `/inTree \d+/` invariant. | Each census field is coerced: a finite number prints as-is, else `?` (never `undefined`/`NaN`). |
| F2 | A non-string `ssrHtml` (number/object) threw `TypeError: ssrHtml.replace is not a function`, freezing the panel on the last good text (the `?? ''` nullish-coalesce only covered null/undefined). | A `typeof ssrHtml === 'string'` guard coerces a non-string to `''` (→ preview `(empty)`); never a TypeError from a contract drift. |