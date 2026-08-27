// src/shared/demo-envelope.ts — the demo legacy envelope the renderer bootstraps.
//
// This is the input to `translateLegacy` (docs/specs/translate.md §1
// `LegacyInitialData`): the legacy JSON envelope. Handler bodies are
// function-STRING data (translate.md §2 — the data format). Every rendered
// element and every handler below ships as DATA — the renderer module is
// core-only plumbing.
//
// The demo exercises the two MCP endpoint surfaces:
//   - synthetic-event access: dispatch 'click' on #inc / #dec / #reset
//     (counter), 'input' on #echo-input (echo) — the graph mutates +
//     re-renders.
//   - rendered-HTML visibility: the live #app innerHTML + the SSR re-emit.
//
// Handler bodies follow the framework's canonical MODERN convention
// `(ctx, value)` where `value` = args[0] (the synthetic event's first arg,
// the Phase B `event.value` equivalent). Inline handler bodies default to
// modern (translate.ts FORMAT MARKER) — no `format` field needed.
//
// CATALOGUED FINDINGS (see docs/defects.md):
//   - Inline `handlers` bodies DEFAULT to the modern (ctx, ...args)
//     convention; the legacy `(event, context)` arg order requires an
//     explicit `format: 'legacy'`. The synthetic-event contract's legacy
//     `event.value = args[0]` stub applies only to wrapped handlers (seam
//     form or explicit format). An MCP/Electron host dispatching with args
//     must know which convention the target handler uses.
//   - The framework's runtime lookup (ctx.tree.getNode / clientAPI.apply /
//     dispatchEvent) is nodeId/wire-scoped — css.id is a RENDER attribute,
//     not a runtime lookup key. A handler body reaching a sibling must scan
//     `ctx.tree.allNodes()` for the authored props.id (the upstream
//     feature-showcase precedent) or hold the minted nodeId. css.id →
//     node resolution is a HOST-side concern (our MCP target resolver).

// Counter increment: find the counter node by authored props.id, write
// content+1.
const INC_BODY = `function (ctx) {
  const all = ctx.tree.allNodes();
  const node = all.find(function (n) { return n && n.props && n.props.id === 'counter'; });
  if (!node) return;
  const cur = Number(node.content ?? 0);
  ctx.clientAPI.apply(node.id, [{ targetProp: 'content', mode: 'replace', value: String(cur + 1) }]);
}`
const DEC_BODY = `function (ctx) {
  const all = ctx.tree.allNodes();
  const node = all.find(function (n) { return n && n.props && n.props.id === 'counter'; });
  if (!node) return;
  const cur = Number(node.content ?? 0);
  ctx.clientAPI.apply(node.id, [{ targetProp: 'content', mode: 'replace', value: String(cur - 1) }]);
}`
const RESET_BODY = `function (ctx) {
  const all = ctx.tree.allNodes();
  const node = all.find(function (n) { return n && n.props && n.props.id === 'counter'; });
  if (!node) return;
  ctx.clientAPI.apply(node.id, [{ targetProp: 'content', mode: 'replace', value: '0' }]);
}`
// Echo: args[0] (the synthetic input event's value) into the echo-out node.
const ECHO_BODY = `function (ctx, value) {
  const all = ctx.tree.allNodes();
  const node = all.find(function (n) { return n && n.props && n.props.id === 'echo-out'; });
  if (!node) return;
  const t = value == null ? '' : String(value);
  ctx.clientAPI.apply(node.id, [{ targetProp: 'content', mode: 'replace', value: t }]);
}`

/** The demo legacy envelope. */
export function demoEnvelope() {
  return {
    template: {
      root: {
        type: 'div',
        css: { classes: ['demo-shell'] },
        children: [
          { type: 'h1', content: 'Provident-Electron — MCP endpoint demo' },
          // ---- counter card ------------------------------------------------
          {
            type: 'section',
            css: { id: 'counter-card', classes: ['card'] },
            children: [
              { type: 'h2', content: 'Counter' },
              {
                type: 'div',
                css: { id: 'counter', classes: ['counter-value'] },
                props: { id: 'counter' },
                content: '0',
              },
              {
                type: 'button',
                css: { id: 'inc', classes: ['btn'] },
                content: 'Increment (+1)',
                handlers: [{ name: 'inc', event: 'click', body: INC_BODY }],
              },
              {
                type: 'button',
                css: { id: 'dec', classes: ['btn'] },
                content: 'Decrement (-1)',
                handlers: [{ name: 'dec', event: 'click', body: DEC_BODY }],
              },
              {
                type: 'button',
                css: { id: 'reset', classes: ['btn'] },
                content: 'Reset',
                handlers: [{ name: 'reset', event: 'click', body: RESET_BODY }],
              },
            ],
          },
          // ---- echo card ---------------------------------------------------
          {
            type: 'section',
            css: { id: 'echo-card', classes: ['card'] },
            children: [
              { type: 'h2', content: 'Echo (input -> echo-out)' },
              {
                type: 'input',
                css: { id: 'echo-input' },
                props: { id: 'echo-input' },
                handlers: [{ name: 'echo', event: 'input', body: ECHO_BODY }],
              },
              {
                type: 'div',
                css: { id: 'echo-out', classes: ['echo-out'] },
                props: { id: 'echo-out' },
                content: '(nothing yet)',
              },
            ],
          },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}