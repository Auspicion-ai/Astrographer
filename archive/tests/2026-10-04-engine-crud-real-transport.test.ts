// tests/engine-crud-real-transport.test.ts — TDD red test for the
// HOST-GET-WITH-BODY-SSE-CRUD fix. The Astrographer CRUD client's DEFAULT
// transport (`createEngineFetch(opts.auth)` → `globalThis.fetch`) rejects a
// GET-with-a-body (`TypeError: Request with GET/HEAD method cannot have body`),
// so the 4 document/wiki READ round-trips fail over a real transport even though
// the Gnosis server ACCEPTS the GET-with-body (its CRUD handler reads the
// request envelope from the body for every method).
//
// This test creates the CRUD client with NO injected `opts.fetch` (the default
// transport), pointing at a REAL loopback HTTP server that reads the request
// body on a GET (mirroring the Gnosis server's `crud_handler`), and asserts the
// READ method resolves to its typed result. RED: fails until the default
// transport is GET-with-body-capable. GREEN: after the fix.
import { describe, it, expect, afterAll } from 'vitest'
import { createServer, type Server } from 'node:http'
import { createEngineCrudRagStore, type EngineCrudRagStore } from '../src/main/engine-crud-rag-store.js'

const READY_REPORT = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: '0.1.0',
  subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true },
  lastError: null,
}

/** A real loopback server mirroring the Gnosis CRUD server: reads the request
 *  BODY on a GET (the P1a envelope-in-body read wire), serves a READY health
 *  report on /engine/status, and a listWikis response on GET /wikis. */
function makeGetBodyServer(): Promise<{ server: Server; port: number; gotBody: () => string | null }> {
  return new Promise((resolve) => {
    let lastBody: string | null = null
    const server = createServer((req, res) => {
      const chunks: Buffer[] = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => {
        lastBody = chunks.length ? Buffer.concat(chunks).toString('utf8') : null
        const url = req.url ?? ''
        if (url === '/engine/status') {
          res.writeHead(200, { 'content-type': 'application/json' })
          res.end(JSON.stringify(READY_REPORT))
          return
        }
        if (url === '/wikis') {
          const env = { schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { method: 'listWikis', result: [{ wiki_id: 'w1', name: 'My Wiki' }] } }
          res.writeHead(200, { 'content-type': 'application/json' })
          res.end(JSON.stringify(env))
          return
        }
        if (url.startsWith('/documents/')) {
          // getDocument — a typed Document result.
          const env = {
            schemaVersion: 1,
            idFormat: 'opaque-string-v1',
            payload: {
              method: 'getDocument',
              result: {
                document_id: 'd1', wiki_id: 'w1', revision: 0, state: 'Draft',
                graph: { nodes: [], edges: [] }, title: 'Doc',
                created_at: '2026-09-09T00:00:00Z', updated_at: '2026-09-09T00:00:00Z',
                tags: [], author: 'alice',
              },
            },
          }
          res.writeHead(200, { 'content-type': 'application/json' })
          res.end(JSON.stringify(env))
          return
        }
        res.writeHead(404, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { method: 'x', error: { code: 'not_found', message: 'nf' } } }))
      })
    })
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number }
      resolve({ server, port: addr.port, gotBody: () => lastBody })
    })
  })
}

describe('createEngineCrudRagStore — DEFAULT transport is GET-with-body capable (HOST-GET-WITH-BODY-SSE-CRUD)', () => {
  let ctx: { server: Server; port: number; gotBody: () => string | null } | null = null
  let store: EngineCrudRagStore | null = null

  afterAll(() => {
    ctx?.server?.close()
  })

  it('READS: listWikis via the DEFAULT transport (no opts.fetch) resolves over a real GET-with-body', async () => {
    ctx = await makeGetBodyServer()
    // NO opts.fetch — exercise the default transport (the regression point).
    store = createEngineCrudRagStore({ baseUrl: `http://127.0.0.1:${ctx.port}` })
    const wikis = await store.listWikis({})
    expect(wikis).toEqual([{ wikiId: 'w1', name: 'My Wiki' }])
    // The READ did send the request envelope as a GET body (the wire it carries).
    expect(ctx.gotBody()).toContain('"method":"listWikis"')
  })

  it('READS: getDocument via the DEFAULT transport over a real GET-with-body', async () => {
    ctx = await makeGetBodyServer()
    store = createEngineCrudRagStore({ baseUrl: `http://127.0.0.1:${ctx.port}` })
    const doc = await store.getDocument({ documentId: 'd1' })
    expect(doc.documentId).toBe('d1')
    expect(ctx.gotBody()).toContain('"method":"getDocument"')
  })
})
