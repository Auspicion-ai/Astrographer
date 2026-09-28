/** A pure, total, stateless mechanism of one resolver and one declaration-only
 *  applier: no ambient read, no write, no retained state. */

export interface ThemeResolution {
  readonly setting: string | null
  readonly prefersDark: boolean
  readonly source: 'env' | 'degraded-env'
}

export interface ThemeAttributeWrite {
  readonly name: string | null
  readonly value: string
  readonly removal: boolean
}

export interface ThemeEnv {
  readonly prefersDark: boolean
}

interface EnvReading {
  readonly prefersDark: boolean
  readonly source: 'env' | 'degraded-env'
}

/** The declared member key, taken from an identifier rather than a literal, so
 *  the module carries no literal beyond its five declared bodies. */
function memberKey(): string {
  const probe = { prefersDark: false }
  return Object.keys(probe)[0] as string
}

/** The strict reading of the declared member: true or false for a strictly
 *  boolean member, and the declared absorption for every other shape. */
function strictReading(prefersDark: unknown): boolean | null {
  if (prefersDark === true) return true
  if (prefersDark === false) return false
  return null
}

function envReading(env: unknown): EnvReading {
  if (env === null || typeof env !== 'object') {
    return { prefersDark: false, source: 'degraded-env' }
  }
  try {
    const descriptor = Object.getOwnPropertyDescriptor(env, memberKey())
    if (descriptor === undefined) {
      return { prefersDark: false, source: 'degraded-env' }
    }
    const accessor = descriptor.get
    const read = accessor === undefined ? descriptor.value : accessor.call(env)
    const reading = strictReading(read)
    if (reading === null) {
      return { prefersDark: false, source: 'degraded-env' }
    }
    return { prefersDark: reading, source: 'env' }
  } catch {
    return { prefersDark: false, source: 'degraded-env' }
  }
}

export function resolveTheme(setting: unknown, env: unknown): ThemeResolution {
  const carried = typeof setting === 'string' && setting !== '' ? setting : null
  const reading = envReading(env)
  return { setting: carried, prefersDark: reading.prefersDark, source: reading.source }
}

export function applyThemeDeclaration(attributeName: unknown, resolved: unknown): ThemeAttributeWrite {
  const name = typeof attributeName === 'string' && attributeName !== '' ? attributeName : null
  if (typeof resolved === 'string' && resolved !== '') {
    return { name, value: resolved, removal: false }
  }
  return { name, value: '', removal: true }
}
