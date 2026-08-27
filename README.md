# Provident-Electron

Prebuilt Electron shell for apps using the Provident SSR framework
([`provident-ssr`](https://www.npmjs.com/package/provident-ssr)) — with full
**synthetic-event access** and **rendered-HTML visibility** exposed as MCP
endpoints for agentic use and debugging exposure.

This repository has two intended goals:

1. **Implementation test of the `provident-ssr` npm package.** The original
   source + documentation live in the adjacent `Preempt-Providence` folder.
   This project never modifies the package. Any defect or requirement gap
   discovered is catalogued in [`docs/defects.md`](docs/defects.md) and handed
   off as an issue to the original project
   ([`docs/HANDOFF.md`](docs/HANDOFF.md)).
2. **Prebuild baseline for Electron apps using the provident-ssr framework** —
   full synthetic-event access + rendered-HTML visibility for MCP endpoints
   (agentic use + debugging exposure).

## Architecture

```
MCP client (agent/IDE)
   │  stdio  OR  Streamable HTTP (http://127.0.0.1:3787/mcp)
   ▼
Electron MAIN process — MCP server (@modelcontextprotocol/sdk) + IPC bridge
   │  IPC: provident:invoke / provident:reply / provident:ready
   ▼
Electron RENDERER — the provident-ssr producing process (Supervisor graph +
DomAdapter render + SSRFragmentAdapter mirror)
```

The graph is authoritative: a synthetic event mutates the graph (Phase A/B
`Supervisor.dispatchEvent` + flush), then the host re-renders both the live DOM
and the SSR fragment — the HTML is a view, never a live surface (the upstream
Phase B contract).

## Setup & run

Requires Node ≥ 18 for install tooling (Electron is pinned to ^33 so it
installs on Node 18; the Electron runtime embeds its own Node 20).

```sh
npm install
npm run build          # main (cjs) + preload (cjs) + renderer (esm) + html
npm test               # vitest (runtime unit tests)
npm run typecheck      # tsc --noEmit

npm start              # build + launch with the HTTP MCP server
npm start -- --mcp-transport=http --mcp-port=3787   # HTTP (default)
npm start -- --mcp-transport=stdio                  # stdio
```

Transports are also selectable via `PROVIDENT_MCP_TRANSPORT` /
`PROVIDENT_MCP_PORT`.

## MCP tools

| Tool | Purpose |
| --- | --- |
| `provident.dispatch` | Dispatch a synthetic event (`click`/`input`/…) on a node — target by authored css.id (e.g. `inc`, `echo-input`), nodeId, or wire. Uses the engine's shared `Supervisor.dispatchAndReport` (flush-before-response; `dirtied = apply().dirtied ∪ pass-2 keys`); returns `{results, dirtied, renderedHtml, ssrHtml}`. `requestId` is engine-owned idempotency (opt-in bounded dedup — a duplicate echoes the first report). |
| `provident.get_rendered_html` | The live DOM innerHTML + the SSR fragment re-emitted from the same graph + a node/compile census. Every element carries `data-node-id="<nodeId>"` (opt-in render option) so an agent can trace each element back to its graph node. |
| `provident.list_targets` | Every live node with its nodeId, authored css.id / props.id, type, content, state, in-tree flag, and handlers — the addressable vocabulary. |
| `provident.get_node_state` | A node's pass-2 resolved compiled states + the graph census. |

The demo app (the legacy envelope in `src/shared/demo-envelope.ts`) renders a
counter (`inc` / `dec` / `reset` buttons) and an echo input (`echo-input` →
`echo-out`) — drive them with `provident.dispatch` and observe with
`provident.get_rendered_html`.

### Local CLI toolset (`npm run mcp`)

`scripts/mcp-cli.mjs` drives **all 15 MCP endpoints** for development + dynamic
testing. Two targets:

- **battery** (default) — spawns `dist/main/battery-host.mjs` (a real Runtime
  under the DOM shim, all tool groups pre-enabled) over stdio: a throwaway,
  deterministic host for CI-style probing.
- **http** — connects to a **running** app at `http://127.0.0.1:<port>/mcp`
  (the real Electron app, or a standalone server). This is the live
  development target.

```sh
npm run mcp -- --help                       # usage
npm run mcp -- html                         # read the rendered HTML (battery)
npm run mcp -- dispatch inc click           # dispatch a click on #inc
npm run mcp -- targets                      # list dispatch targets
npm run mcp -- node-state counter           # a node's resolved state
npm run mcp -- export legacy                # export the graph
npm run mcp -- teardown                     # reset to root-only
npm run mcp -- code-get template.root.hooks # read the envelope
npm run mcp -- run steps.json               # run a sequence against ONE host

# against a running app (e.g. `npm start -- --mcp-transport=http --mcp-port=3787`):
npm run mcp -- --target http --port 3787 html
npm run mcp -- --target http --port 3787 dispatch inc click
```

`run <steps.json>` executes an array of `{cmd, args}` steps against **one
persistent host**, so a `dispatch` can see a prior `load` — the dynamic-testing
mode. Each step's result prints; the last step's result is the exit value.
`args` is the raw tool-arguments object (targets/values passed verbatim).

### Example agent flow

```text
provident.get_rendered_html
  → renderedHtml contains <button data-node-id="node-6" id="inc" class="btn">…</button>

provident.dispatch { target: { kind: "cssId", cssId: "inc" }, event: "click" }
  → { results: [undefined], dirtied: ["node-5","node-3","node-1"], renderedHtml: "…>1<…", ssrHtml: "…>1<…" }

provident.dispatch { target: { kind: "nodeId", nodeId: "node-6" }, event: "click", requestId: "my-op-1" }
  → { … }  // engine dedup: a repeated requestId echoes the first report, no re-fire
```

## Contract & docs

- `docs/specs/mcp-endpoint.md` — this repo's behavior contract (the MCP
  endpoint surface; implements the upstream's Phase C as a consumer).
- `docs/defects.md` — the implementation-test catalogue (REQ-GAP-1..8 resolved
  by provident-ssr 0.1.1/0.1.2; REQ-GAP-9..12 published in 0.1.3; none open) →
  `docs/HANDOFF.md` (the issue handoff to the upstream project).
- `docs/decisions.md` / `docs/pending.md` / `docs/next-steps.md` — the process
  trackers (imported from the upstream `AGENTS.md` document-archival loop).
- `AGENTS.md` — the process rules for agents working in this repo.

## 0.1.x adoption notes

Provident-Electron consumes the shared multi-host surfaces the upstream landed
across 0.1.1/0.1.2/0.1.3 (`docs/specs/handoffs-review.md`,
`docs/specs/handoffs-review-2.md`): `Supervisor.dispatchAndReport` (engine
`{results, dirtied}` + opt-in `requestId` dedup), the public `flush()`, the
opt-in `data-node-id` render option (the one scoped lift of the no-render-change
pin), the exported canonical re-emit loop `renderProducingProcess` with the
`renderOptions` threading (REQ-GAP-8), and the Round-4 surfaces — the public
`createLinkHub()` + the corrected A1 recipe, the self-evicting sweep
(REQ-GAP-11), and the destroy-cascade flag (REQ-GAP-12). All filed gaps
(REQ-GAP-1..12) are resolved upstream; none remain open.

## License

AGPL-3.0 (matching the `provident-ssr` package license).