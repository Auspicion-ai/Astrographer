// src/main/template-store.ts — Unit I: the content-window template store
// (docs/specs/unit-i-template.md §5.1-§5.2, §5.6). A host-side main-process
// store, SEPARATE from the RAG store. PURE (no Electron) logic over a
// `node:fs` JSON file. The renderer never writes it directly (the
// template-editor pane commits over IPC; the MCP `code.template.*` tools write
// via the main-process handler).
//
// CONTENT-WINDOW-TEMPLATE: the content-window template IS the
// `LegacyInitialData.template` shape (`{ root: LegacyNodeData }`). The default
// (`DEFAULT_CONTENT_WINDOW_TEMPLATE`) is the current FIXED `wiki-root` + one
// `main` zone container (the Unit C baseline). A customized template replaces
// it.
//
// ZONE-CONSISTENCY-INVARIANT: a customized template MUST keep a
// `container`-role producer (a child of `root` with `placement.placementName`)
// for every zone the traversal targets (the Unit C HARD PRECONDITION — a
// missing container leaves the content `unplaced`, silently not
// render-eligible). Enforced at save-time here (the store's `set` rejects an
// invalid template); the traversal adds the defense-in-depth layer.
//
// Persistence (the module-store/RAG-store discipline): a single JSON file at
// `opts.path` — `{ version: 1, source: TemplateSource, template:
// ContentWindowTemplate }`. Atomic write via temp + rename (2-space indent).
// Fail-disabled boot: a missing/corrupt/non-1-version/malformed-template file
// boots to the DEFAULT (source 'default'), NEVER throws. Hash-verification is
// NOT applied to the template (a documented asymmetry vs the RAG node/edge
// records — a corrupt file is caught by fail-disabled boot).
//
// The PURE shape (types + `DEFAULT_CONTENT_WINDOW_TEMPLATE` + `validateTemplate`)
// lives in `template-shape.ts` (no `node:fs`) so the renderer bundle (which
// imports the traversal) can import it without pulling in `node:fs`. This
// module re-exports them and adds the `node:fs`-backed `createTemplateStore`.
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs'
import { dirname } from 'node:path'
import {
  DEFAULT_CONTENT_WINDOW_TEMPLATE,
  validateTemplate,
  type ContentWindowTemplate,
  type TemplateSource,
  type TemplateStatus,
  type TemplateStore,
  type TemplateStoreOptions,
  type TemplateVerdict,
} from './template-shape.js'

export {
  DEFAULT_CONTENT_WINDOW_TEMPLATE,
  validateTemplate,
  type ContentWindowTemplate,
  type TemplateSource,
  type TemplateStatus,
  type TemplateStore,
  type TemplateStoreOptions,
  type TemplateVerdict,
}

// A safe deep copy (drops prototype-pollution keys) so a caller can never
// mutate the store through a returned template.
const DANGEROUS_KEYS = new Set<string>(['__proto__', 'constructor', 'prototype'])
function deepCopy<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => deepCopy(v)) as unknown as T
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) continue
      out[key] = deepCopy((value as Record<string, unknown>)[key])
    }
    return out as T
  }
  return value
}

export function createTemplateStore(opts: TemplateStoreOptions): TemplateStore {
  if (opts === null || opts === undefined || typeof opts.path !== 'string' || opts.path === '') {
    throw new Error('template store: path required')
  }
  const targetedZones = opts.targetedZones ?? ['main']
  let current: ContentWindowTemplate = deepCopy(DEFAULT_CONTENT_WINDOW_TEMPLATE)
  let source: TemplateSource = 'default'

  // Fail-disabled boot: a missing/corrupt/non-1-version/malformed-template file
  // boots to the DEFAULT (source 'default'), NEVER throws.
  if (existsSync(opts.path)) {
    try {
      const parsed: unknown = JSON.parse(readFileSync(opts.path, 'utf8'))
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const file = parsed as { version?: unknown; source?: unknown; template?: unknown }
        if (file.version === 1) {
          const verdict = validateTemplate(file.template, targetedZones)
          if (verdict.ok) {
            current = deepCopy(file.template as ContentWindowTemplate)
            source = file.source === 'custom' ? 'custom' : 'default'
          }
        }
      }
    } catch {
      // fail-disabled — keep the default
    }
  }

  function persist(): void {
    try {
      mkdirSync(dirname(opts.path), { recursive: true })
      const payload = { version: 1, source, template: current }
      const tmp = `${opts.path}.tmp`
      writeFileSync(tmp, JSON.stringify(payload, null, 2))
      renameSync(tmp, opts.path)
    } catch {
      // a persist failure is non-fatal for the process lifetime; never crash.
    }
  }

  return {
    // I5 — return a COPY, never the internal array: a caller mutating the
    // returned array must NOT change which zones set/delete/validate enforce.
    get targetedZones(): string[] {
      return [...targetedZones]
    },
    get(): ContentWindowTemplate {
      // I4 — a DEEP copy (never the internal record): a caller mutating the
      // returned template must NOT mutate the store's internal template,
      // bypassing the zone-consistency validation. The shallow `{ ...current }`
      // shared `current.root`, so a nested mutation leaked into the store.
      return deepCopy(current)
    },
    set(tpl: ContentWindowTemplate): ContentWindowTemplate {
      const verdict = validateTemplate(tpl, targetedZones)
      if (!verdict.ok) {
        if (verdict.reason === 'invalid-shape') {
          throw new Error(`template set: invalid-shape — ${verdict.detail}`)
        }
        throw new Error(`template set: missing-zone — ${verdict.detail}`)
      }
      current = deepCopy(tpl)
      source = 'custom'
      persist()
      return this.get()
    },
    reset(): ContentWindowTemplate {
      current = deepCopy(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      source = 'default'
      persist()
      return this.get()
    },
    status(): TemplateStatus {
      return { source }
    },
  }
}
