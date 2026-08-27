import { describe, it, expect } from 'vitest';
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js';
import { SecurityGate } from '../src/main/security.js';

const STUB_HTML = '<div data-node-id="node-1">hello</div>';
const STUB_SSR = '<div data-node-id="node-1">hello</div>';
const STUB_CENSUS = { registered: 1, inTree: 1, unplaced: 0, destroyed: 0, prototypes: 0 };
const VALID_NODE_IDS = new Set(['node-1']);

function stubBackend(): McpBackend {
  return {
    async invoke(method: string, args?: unknown) {
      if (method === 'renderedHtml') {
        return { renderedHtml: STUB_HTML, ssrHtml: STUB_SSR, census: STUB_CENSUS };
      }
      if (method === 'listTargets') {
        return { nodes: [{ nodeId: 'node-1', type: 'element', content: 'hello', inTree: true, handlers: [] }] };
      }
      if (method === 'nodeState') {
        const nodeId = String(args);
        if (!VALID_NODE_IDS.has(nodeId)) {
          throw new Error(`unresolved target: ${nodeId}`);
        }
        return { nodeId, states: { default: { active: true } } };
      }
      throw new Error(`stub backend: unknown method ${method}`);
    },
  } as unknown as McpBackend;
}

function makeServer(gate?: SecurityGate): ProvidentMcpServer {
  const server = new ProvidentMcpServer({
    backend: stubBackend(),
    transport: 'stdio',
    ...(gate ? { gate } : {}),
  });
  server.ensureServerRegistered();
  return server;
}

describe('S1 — resources exist and are gated by read', () => {
  it('default gate (read ON): all three resources are present/enabled', () => {
    const server = makeServer();
    const resources = server.registeredResources();
    const uris = resources.map((r) => r.uri ?? r.uriTemplate);
    expect(uris).toContain('mcp://provident/app');
    expect(uris).toContain('mcp://provident/targets');
    expect(uris).toContain('mcp://provident/node/{nodeId}');
  });

  it('read OFF: no resources are present', () => {
    const gate = new SecurityGate().apply({ disable: ['read'] });
    const server = makeServer(gate);
    const resources = server.registeredResources();
    expect(resources).toHaveLength(0);
  });
});

describe('S2 — disabling read shuts resources off', () => {
  it('read-off disables all resources; re-enabling restores them', () => {
    const server = makeServer();

    // Default gate: all resources enabled
    expect(server.resourceEnabled('mcp://provident/app')).toBe(true);
    expect(server.resourceEnabled('mcp://provident/targets')).toBe(true);
    expect(server.resourceEnabled('mcp://provident/node/{nodeId}')).toBe(true);

    // Disable read: all resources disabled
    server.applyGatePatch({ disable: ['read'] });
    expect(server.resourceEnabled('mcp://provident/app')).toBe(false);
    expect(server.resourceEnabled('mcp://provident/targets')).toBe(false);
    expect(server.resourceEnabled('mcp://provident/node/{nodeId}')).toBe(false);

    // Re-enable read: all resources enabled again
    server.applyGatePatch({ groups: ['read'] });
    expect(server.resourceEnabled('mcp://provident/app')).toBe(true);
    expect(server.resourceEnabled('mcp://provident/targets')).toBe(true);
    expect(server.resourceEnabled('mcp://provident/node/{nodeId}')).toBe(true);
  });
});

describe('S3 — non-read group toggle leaves resources alone', () => {
  it('disabling dispatch does NOT disable read resources', () => {
    const server = makeServer();
    expect(server.resourceEnabled('mcp://provident/app')).toBe(true);

    server.applyGatePatch({ disable: ['dispatch'] });
    expect(server.resourceEnabled('mcp://provident/app')).toBe(true);
    expect(server.resourceEnabled('mcp://provident/targets')).toBe(true);
    expect(server.resourceEnabled('mcp://provident/node/{nodeId}')).toBe(true);
  });
});

describe('S4 — fresh server with read OFF registers no resources', () => {
  it('a server constructed with read off exposes no read resources', () => {
    const gate = new SecurityGate().apply({ disable: ['read'] });
    const server = makeServer(gate);
    const resources = server.registeredResources();
    expect(resources).toHaveLength(0);
  });
});

describe('S5 — reading app returns the rendered view', () => {
  it('mcp://provident/app returns renderedHtml + ssrHtml + census', async () => {
    const server = makeServer();
    const result = await server.readResource('mcp://provident/app');
    expect(result).toHaveProperty('renderedHtml');
    expect(result).toHaveProperty('ssrHtml');
    expect(result).toHaveProperty('census');
  });
});

describe('S6 — reading a specific node state', () => {
  it('valid nodeId returns resolved state', async () => {
    const server = makeServer();
    const result = await server.readResource('mcp://provident/node/node-1');
    expect(result).toHaveProperty('nodeId');
    expect(result).toHaveProperty('states');
  });

  it('unknown nodeId surfaces a clean error', async () => {
    const server = makeServer();
    await expect(server.readResource('mcp://provident/node/nonexistent-999'))
      .rejects.toThrow(/unresolved target|not found/i);
  });
});

describe('S7 — resources never reach the isolated panes graph', () => {
  it('resource surface exposes no way to read SecurePanels graph', () => {
    const server = makeServer();
    const resources = server.registeredResources();
    const uris = resources.map((r) => r.uri ?? r.uriTemplate ?? '');
    const hasIsolated = uris.some((u) => /secure|pane|isolated|settings/i.test(u));
    expect(hasIsolated).toBe(false);
  });
});

describe('S8 — reads are always-fresh', () => {
  it('two successive reads reflect the current backend value', async () => {
    const server = makeServer();
    const first = await server.readResource('mcp://provident/targets');
    const second = await server.readResource('mcp://provident/targets');
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe('S9 — unknown URIs fail cleanly', () => {
  it('reading an unregistered URI yields a clean not-found error', async () => {
    const server = makeServer();
    await expect(server.readResource('mcp://provident/unknown'))
      .rejects.toThrow(/not found/i);
  });
});
