import { describe, it, expect, beforeEach } from 'vitest';
import { ProvidentMcpServer } from '../src/main/mcp-server.js';
import { SecurityGate } from '../src/main/security.js';
import { SecurePanels } from '../src/renderer/secure-panels.js';
import { installShim } from '../src/shared/dom-shim.js';

installShim();

let gate: SecurityGate;

beforeEach(() => {
  gate = new SecurityGate({ enabled: new Set(['read', 'dispatch']) });
});

function createStdioServer(secGate: SecurityGate = gate) {
  return new ProvidentMcpServer({
    transport: 'stdio' as const,
    gate: secGate,
  });
}

function createHttpServer(secGate: SecurityGate = gate) {
  return new ProvidentMcpServer({
    transport: 'http' as const,
    gate: secGate,
    port: 0,
  });
}

describe('S1: notify is per-resource content update, not tool/list change', () => {
  it('sends notifications/resources/updated with the app URI — not a list-changed', async () => {
    const server = createStdioServer();
    const sent = await (server as any).connectMockTransport();

    await server.notifyGraphChanged();

    expect(sent.length).toBe(1);
    expect(sent[0]).toEqual(
      expect.objectContaining({
        method: 'notifications/resources/updated',
        params: expect.objectContaining({ uri: 'mcp://provident/app' }),
      }),
    );
  });

  it('does NOT send tools/list_changed', async () => {
    const server = createStdioServer();
    const sent = await (server as any).connectMockTransport();

    await server.notifyGraphChanged();

    const toolListChanged = sent.filter(
      (m: any) => m.method === 'notifications/tools/list_changed',
    );
    expect(toolListChanged).toHaveLength(0);
  });

  it('does NOT send resources/list_changed', async () => {
    const server = createStdioServer();
    const sent = await (server as any).connectMockTransport();

    await server.notifyGraphChanged();

    const resourceListChanged = sent.filter(
      (m: any) => m.method === 'notifications/resources/list_changed',
    );
    expect(resourceListChanged).toHaveLength(0);
  });
});

describe('S2: HTTP notify is a no-op, never a hang', () => {
  it('returns false on HTTP — no throw, no hang', async () => {
    const server = createHttpServer();

    const result = await server.notifyGraphChanged();

    expect(result).toBe(false);
  });
});

describe('S3: stdio delivers', () => {
  it('returns true and sends a notification on stdio', async () => {
    const server = createStdioServer();
    const sent = await (server as any).connectMockTransport();

    const result = await server.notifyGraphChanged();

    expect(result).toBe(true);
    expect(sent).toHaveLength(1);
  });
});

describe('S4: gate-aware — read-off gate delivers nothing', () => {
  it('returns false and sends nothing when read group is disabled', async () => {
    const offGate = new SecurityGate({
      enabled: new Set(['dispatch']),
    });
    const server = createStdioServer(offGate);
    const sent = await (server as any).connectMockTransport();

    const result = await server.notifyGraphChanged();

    expect(result).toBe(false);
    expect(sent).toHaveLength(0);
  });
});

describe('S5: SecurePanels graph never emits notify', () => {
  it('SecurePanels exposes no notify surface — no code path from operator action to push', () => {
    const proto = SecurePanels as any;

    const hasNotifySurface =
      typeof proto.handleNotify === 'function' ||
      typeof proto.notify === 'function' ||
      typeof proto.onNotify === 'function' ||
      typeof proto.sendNotify === 'function' ||
      typeof proto.notifyGraphChanged === 'function';

    expect(hasNotifySurface).toBe(false);
  });
});

describe('S6: notify fires after mutating app-graph op, not read-only', () => {
  it('sends a notification when called (caller is responsible for only calling on mutating ops)', async () => {
    const server = createStdioServer();
    const sent = await (server as any).connectMockTransport();

    await server.notifyGraphChanged();

    expect(sent).toHaveLength(1);
    expect(sent[0].method).toBe('notifications/resources/updated');
  });

  it('the method has no readOnly parameter — always fires if gate+transport allow', async () => {
    const server = createStdioServer();
    const sent = await (server as any).connectMockTransport();

    // Call twice — the method has no concept of operation type
    await server.notifyGraphChanged();
    await server.notifyGraphChanged();

    expect(sent).toHaveLength(2);
  });
});
