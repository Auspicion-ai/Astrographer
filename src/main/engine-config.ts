// src/main/engine-config.ts — Unit GN-MCP-UI §5.4 A4: the Gnosis-engine
// `baseUrl` config seam. A config VALUE (NOT a credential) persisted to userData
// like the operator-settings store. This is STEP 1 of the `resolveEngineBaseUrl`
// priority (config seam → env `PROVIDENT_ENGINE_BASE_URL` → default
// `http://127.0.0.1:8080`): when the config value is SET it wins. `baseUrl` is
// env/CLI config — NOT a GUI-only secret and NOT an MCP tool arg (§5.2/A7).
//
// The module exposes a lightweight in-memory registry (`getEngineConfigBaseUrl`/
// `setEngineConfigBaseUrl`) so the 0-arity `resolveEngineBaseUrl()` (main.ts)
// reads the seam without a parameter; the persistent store backs that value so
// a re-launch restores an operator-set override.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

/** The engine baseUrl config (a nullable override; null = unset → env/default). */
export interface EngineConfig {
  engineBaseUrl: string | null
}

export interface EngineConfigStore {
  get(): EngineConfig
  set(baseUrl: string | null): EngineConfig
}

const DEFAULT_CONFIG: EngineConfig = { engineBaseUrl: null }

/** The pinned coercion rule: ONLY a non-empty string survives; anything else
 *  (null/undefined/number/junk/whitespace) coerces to null (the unset state). */
function sanitize(input: unknown): EngineConfig {
  const src = (input ?? {}) as Partial<EngineConfig>
  return {
    engineBaseUrl:
      typeof src.engineBaseUrl === 'string' && src.engineBaseUrl.trim() !== ''
        ? src.engineBaseUrl
        : null,
  }
}

/** Create an engine-config store backed by `path`. A missing/empty file is
 *  the unset default; a corrupt file falls back to the default (never throws —
 *  a config read must not crash the app). */
export function createEngineConfigStore(opts: { path: string }): EngineConfigStore {
  let current: EngineConfig
  try {
    if (existsSync(opts.path)) {
      current = sanitize(JSON.parse(readFileSync(opts.path, 'utf8')))
    } else {
      current = { ...DEFAULT_CONFIG }
    }
  } catch {
    current = { ...DEFAULT_CONFIG }
  }

  function persist(): void {
    try {
      mkdirSync(dirname(opts.path), { recursive: true })
      writeFileSync(opts.path, JSON.stringify(current, null, 2))
    } catch {
      // persist failures are non-fatal (the in-memory config still applies for
      // this process lifetime); never crash the app on a config write.
    }
  }

  return {
    get(): EngineConfig {
      return { engineBaseUrl: current.engineBaseUrl }
    },
    set(baseUrl: string | null): EngineConfig {
      current = sanitize({ engineBaseUrl: baseUrl })
      persist()
      return this.get()
    },
  }
}

// ---- the in-memory registry `resolveEngineBaseUrl()` reads (0-arity) --------

let mountedBaseUrl: string | null = null

/** Seed the seam from a store (called at boot). null/undefined → unset. */
export function setEngineConfigBaseUrl(baseUrl: string | null | undefined): void {
  mountedBaseUrl = typeof baseUrl === 'string' && baseUrl.trim() !== '' ? baseUrl : null
}

/** The current config-seam baseUrl (null = unset → fall through to env/default). */
export function getEngineConfigBaseUrl(): string | null {
  return mountedBaseUrl
}
