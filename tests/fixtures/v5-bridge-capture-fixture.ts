// tests/fixtures/v5-bridge-capture-fixture.ts — shared helper for the V5
// MIGRATION red set (docs/specs/unit-v5-migration.md §3.1 / §4 P-SM-2).
//
// WHY THIS FILE EXISTS: the source-contract pin scans every `tests/**/*.test.ts`
// for the electron-mock factory and forbids ANY `.mock.calls[` capture read in
// that set (§2a C-4). A pin file that DEMONSTRATES the old pattern (and the
// companion negative half of P-SM-1) would therefore flag itself. Both the
// demonstration and the checker live here, OUTSIDE the `.test.ts` census, so
// the pin files carry only conforming code.
//
// This is a test-side helper: it imports nothing from src/ and changes no
// behavior under test.

/** The OLD, forbidden capture pattern: the exposed api is read out of the mock's
 *  call history — exactly what vitest 5's `clearMocks` erases (§1.1 Class A). */
export function makeCallHistoryHarness(): {
  expose: (name: string, api: unknown) => unknown
  capturedBridge: () => unknown
} {
  let calls: unknown[][] = []
  const expose = (name: string, api: unknown): unknown => {
    calls.push([name, api])
    return undefined
  }
  return {
    expose,
    capturedBridge: () => calls[0]?.[1],
  }
}

/**
 * The per-file construct checks of §3.1 / P-SM-2. Returns the list of
 * violations (EMPTY = the file conforms). It never throws: a malformed draw is a
 * counterexample, not an exception (§5 throw patterns). Every message names the
 * construct and the spec clause, so a failure is reviewable.
 */
export function checkBridgeSource(src: string): string[] {
  const errors: string[] = []
  // C-1 — the capture box is created INSIDE vi.hoisted (a module-scope binding
  // is in the TDZ when the hoisted mock factory runs).
  if (!/vi\.hoisted\(\s*\(\s*\)\s*=>\s*\(\s*\{[^}]*\bcurrent\b/.test(src)) {
    errors.push('the capture box is not created inside vi.hoisted (an object literal with a `current` property) — a module-scope binding is in the TDZ when the hoisted mock factory runs (§2a C-1 / F3)')
  }
  // C-2 — exposeInMainWorld is a vi.fn CARRYING an implementation (the store).
  if (!/exposeInMainWorld\s*:\s*vi\.fn\(\s*\(/.test(src)) {
    errors.push('contextBridge.exposeInMainWorld is not a vi.fn carrying an implementation — the §2a C-2 store must assign the exposed api to the box')
  }
  // C-3 — capturedBridge() reads the box's `current`.
  if (!/function\s+capturedBridge\s*\([^)]*\)[^{]*\{\s*return\s+[A-Za-z_$][\w$]*\.current\b/.test(src)) {
    errors.push('capturedBridge() does not return <box>.current — the accessor must be a pure read of the box (§2a C-3)')
  }
  // C-4 — ZERO call-history reads against the electron mock: EITHER the
  // `exposeInMainWorldMock` binding (deleted by C-4) OR a call-history read
  // IMMEDIATELY on the exposed function (`exposeInMainWorld.mock.calls[…]`).
  // A narrow pattern on purpose: a per-file hygiene row may legitimately read
  // the IPC spy's own history (`invokeMock.mock.calls.length`), which is legal
  // under §2a C-5 — the check must not conflate the two spies. The pattern is
  // assembled from parts so this helper's own text is not itself an occurrence.
  const mockBinding = 'exposeInMainWorld' + 'Mock'
  const tightAccess = new RegExp('exposeInMainWorld[^\\n]{0,12}\\.mock\\.\\s*(calls|lastCall|results)')
  if (src.includes(mockBinding) || tightAccess.test(src)) {
    errors.push('the file still reads raw mock call history (the electron-mock call-history read) — the sanctioned capture is the bridgeBox pattern (§2a C-4 / F2)')
  }
  return errors
}

/** Synthetic OLD-pattern file text — the NEGATIVE half of the census row: it
 *  must FAIL the same checks a real call-history capture fails. Assembled by
 *  concatenation for the same reason as above. */
export function oldPatternFileText(): string {
  const mockName = 'exposeInMainWorld' + 'Mock'
  return [
    `const ${mockName} = vi.hoisted(() => vi.fn())`,
    `vi.mock('electron', () => ({ contextBridge: { exposeInMainWorld: ${mockName} } }))`,
    `function capturedBridge(): any { return ${mockName}.mock.` + 'calls[0]?.[1] }',
  ].join('\n')
}

/** Synthetic OLD-pattern file text, SECOND form: the call-history read sits
 *  IMMEDIATELY on the exposed function (no `…Mock` binding) — it must be caught
 *  by the same C-4 check. */
export function oldPatternInlineFileText(): string {
  return [
    `vi.mock('electron', () => ({ contextBridge: { exposeInMainWorld: vi.fn() } }))`,
    `function capturedBridge(): any { return contextBridge.exposeInMainWorld.mock.` + 'calls[0]?.[1] }',
  ].join('\n')
}

/** Synthetic CONFORMING file text — the checker must not reject a correct file. */
export function sanctionedFileText(): string {
  return [
    `const invokeMock = vi.hoisted(() => vi.fn())`,
    `const bridgeBox = vi.hoisted(() => ({ current: undefined as Record<string, unknown> | undefined }))`,
    `vi.mock('electron', () => ({`,
    `  contextBridge: { exposeInMainWorld: vi.fn((_name: string, api: Record<string, unknown>) => { bridgeBox.current = api }) },`,
    `}))`,
    `beforeEach(() => { invokeMock.mockReset() })`,
    `function capturedBridge(): unknown { return bridgeBox.current }`,
  ].join('\n')
}
