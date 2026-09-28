// tests/pd-vendor-set.test.ts — unit `PD-VENDOR`, the SET / IMPORT-CLOSURE / BASELINE
// / SYMBOL / CONFORMANCE-LEG rows (`P-IM-3`, `P-SM-2`, and the leg-registration
// row that §3.5 + `O-2`/`O-3` make assertable WITHOUT running the vendored suites).
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-pd-vendor-foundation-mechanisms.md
//     §2.1 item 1–2   the set is FIFTEEN modules; NOT ONE member is excluded
//     §2.1 item 5     the import census, MEASURED with its command: FIVE files
//                     carry any import; the three set-internal edges
//                     (`census`→`zones`; `gutter-affordance`→`gutter` +
//                     `gesture-session`; `gutter`/`relocate`→`gesture-session`);
//                     the ONLY out-of-set import in the directory belongs to
//                     `path-fork-cycle.ts`, which is NOT a member
//     §2.1 item 6     no vendored module is imported by this repo today (the
//                     vendoring is INERT); the `theme.ts` STEM collision is by stem,
//                     never by specifier
//     §2.1 item 7     the symbol census (exported values + types per module) and the
//                     five NON-EXPORTED shapes
//     §2.2            `importCensus.internalEdges` (the five edges),
//                     `outOfSetImports` (MUST be empty), `nonMemberNotes`,
//                     `conformance.{leg,config,placement,included,excluded}`
//     §2.3/§3.1       `baselineFilesNotReplaced` — the four files are NOT replaced
//                     (`V-4`: touching `dom-shim.ts` is a REGRESSION)
//     §3.5 item 1–3   the eleven INCLUDED suites and the four EXCLUDED suites, each
//                     with its own recorded reason
//     §3.5 item 4–5   the leg is NOT this unit's red set; a suite may be filed with
//                     its audit rows red; NO vendored suite may mock `'electron'`
//     §3.5 item 6     the leg's own config + placement, INVISIBLE to `npm test`
//     §3.6            the collected-file census: the leg adds ZERO collected files
//     §4 `P-IM-3`     17 = 15 + 2 controls; `(bounded) ON THE CLOSURE READING`
//     §4 `P-SM-2`     10 = 4 + 1 control + 5 converse spot-checks; the baseline files'
//                     digests equal their PRE-VENDORING digests
//     §5 item 5       no consumer-correctness claim: nothing imports the vendored set
//     §9 item 3       `X-11` — the runner for the two uncollected `.mjs` batteries is
//                     NOT this unit's
//   docs/specs/pd-vendor-adoption-dossier.md
//     row 8 / `C-6` / `A-3`  the five non-exported shapes are a recorded CONSUMER
//                     COST: the fork RE-DECLARES them and NEVER patches the bytes
//     `C-7`           the `src/renderer/theme.ts` ↔ `src/shared/theme.ts` stem
//                     collision: CHECKED, NO HIT, RECORDED — no re-name
//
// LAYER (RCA-12): `[T]` / source-layer. Byte-identity to a pinned commit proves the
// COPY matches the pin — it does NOT prove any consumer works and it is NOT app-green.
//
// RED-FIRST (RCA-1): the fifteen `src/shared/<name>.ts` files and
// `vendor/foundation.lock.json` DO NOT EXIST at this branch head. Every row asserts
// existence FIRST and names the absent path, so the red is "does not exist /
// Cannot find module …", never a collection error.
//
// THE BASELINE (PRE-VENDORING) DIGESTS — how this file obtains them. §4 `P-SM-2`
// requires each of the four files' digest to equal "its PRE-VENDORING digest (a
// recorded reading, taken at the unit's first red run)". This branch head IS that
// pre-vendoring state, and `git` is the durable record of it: the rows below read
// the bytes with `git show cf19d4e:<path>`. That is the unit's FIRST RED RUN's tree,
// it is deterministic, and it is INDEPENDENT of the tree the vendoring writes — which
// is exactly what makes `V-4` falsifiable. The mechanism is named here so the
// Implementer is not left guessing, and so a review can see the reading's provenance.
//
// `G-9`/`X-9` PIN SAFETY: this file mocks nothing (never `'electron'`), and it reads
// NEITHER `vitest.config.ts` NOR `src/main/markdown-import.ts` NOR the two
// `DEEP_ROWS` files NOR `tests/fixtures/v5-bridge-capture-fixture.js`. The two rows
// that touch `package.json` read ONLY the presence/absence of the two ADDED keys
// (§2.5) — the PINNED `test`/`test:watch` values are asserted by the protected pin
// file, not here.

import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const MANIFEST_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')

/** The branch head this red set is authored against — the PRE-VENDORING tree. */
const PRE_VENDORING_HEAD = 'cf19d4e'

/** §2.1 item 1 — the pin's fifteen-name list. */
const PINNED_FIFTEEN = [
  'census',
  'container',
  'focus-model',
  'gesture-session',
  'gutter',
  'gutter-affordance',
  'layout-projection',
  'menu-template',
  'mount-invariant-guard',
  'overlay',
  'owned-list-host',
  'relocate',
  'slot-host',
  'theme',
  'zones',
] as const

const PINNED_COMMIT = '8f193a8d1446ed1e64c4ab6c569941e988f82459'

/** §2.1 item 5 — FIVE files carry any import at all; the other TEN of the fifteen
 *  carry none. ⟨Corrected per §12.3(d) (`C-AM-4`, DOC-DRIFT, LOW): the clause's
 *  *"the other FIFTEEN carry ZERO import statements"* counts the foundation
 *  `src/shared/` DIRECTORY's twenty files (`5` with imports + `15` without), never
 *  the fifteen-module set (where the split is `5` + `10`). The two must not be
 *  collapsed (§2.1 item 5's arithmetic block).⟩ */
const FILES_WITH_IMPORTS = ['census', 'gutter-affordance', 'gutter', 'relocate', 'path-fork-cycle'] as const

/** §2.1 item 5 (arithmetic block) / §2.2 rule 8 / §12.3(b) — the FIVE DISTINCT
 *  `(from, to)` edges the manifest's `internalEdges` records. The files carry SIX
 *  set-internal import STATEMENTS (see the separately named statement row below);
 *  the extra statement is `gutter-affordance.ts` importing `./gesture-session.js`
 *  twice (once as a VALUE — `POINTER_TYPES` — once TYPE-ONLY — `GestureHandle`),
 *  and it is ONE edge. */
const RECORDED_INTERNAL_EDGES: Array<[string, string]> = [
  ['census', 'zones'],
  ['gutter-affordance', 'gutter'],
  ['gutter-affordance', 'gesture-session'],
  ['gutter', 'gesture-session'],
  ['relocate', 'gesture-session'],
]

/** §2.2 rule 5 / clause (2) of `R-3` — the four baseline files NOT replaced. */
const BASELINE_FILES = ['dom-shim', 'types', 'demo-envelope', 'path-fork-cycle'] as const

/** §3.5 item 2 — the ELEVEN included suites. */
const INCLUDED_SUITES = [
  'theme.test.ts',
  'zones.test.ts',
  'container.test.ts',
  'overlay.test.ts',
  'menu-template.test.ts',
  'gutter.test.ts',
  'relocate.test.ts',
  'census.test.ts',
  'focus-model.test.ts',
  'gutter-ui.test.ts',
  'gesture-session.test.ts',
] as const

/** §3.5 item 3 — the FOUR excluded suites, each with its own reason. */
const EXCLUDED_SUITES: Record<string, RegExp> = {
  'layout-projection.test.ts': /dom-shim/i,
  'owned-list-host.test.ts': /dom-shim/i,
  'slot-host.test.ts': /dom-shim|security|mcp-server|main/i,
  'mount-invariant-guard.test.ts': /dom-shim|runtime|demo-envelope/i,
}

/** §2.1 item 7 — the exported VALUES per module (the symbol census, value half). */
const EXPORTED_VALUES: Record<string, string[]> = {
  theme: ['resolveTheme', 'applyThemeDeclaration'],
  zones: ['isEmpty', 'trackFor'],
  census: ['computeTrackVars'],
  'layout-projection': ['project', 'projectVar', 'applyProjection', 'applyVarsToRoot'],
  container: ['tokensFor', 'orientationFor', 'containerDeclarationFor'],
  overlay: ['overlayTransition', 'overlayInertDeclaration'],
  'menu-template': ['normalizeCatalog', 'buildMenuTemplate', 'selectCatalogItem'],
  'gesture-session': ['POINTER_TYPES', 'installGestureListeners', 'detachGestureListeners', 'createGestureSession'],
  gutter: ['clampToBounds', 'createResizeController'],
  'gutter-affordance': ['cursorDeclarationFor', 'domEventSource', 'createGutterAffordance'],
  relocate: ['withinProximity', 'createRelocateSession'],
  'focus-model': ['focusTransition', 'focusOrder', 'focusIndex', 'persist'],
  'slot-host': ['createSlotHost'],
  'owned-list-host': ['createOwnedListHost'],
  'mount-invariant-guard': ['probeMountInvariant', 'assertMountInvariant'],
}

/** §0A note 7 / dossier `C-6` — the five shapes the fork RE-DECLARES (never exported). */
const NON_EXPORTED_SHAPES = ['GestureSession', 'RelocateResetResult', 'FocusResult', 'FocusRefusal', 'FocusTransitionArg'] as const

// ---------------------------------------------------------------------------
function shippedPath(name: string): string {
  return join(REPO_ROOT, 'src', 'shared', `${name}.ts`)
}

function readShipped(name: string): string | null {
  const p = shippedPath(name)
  return existsSync(p) ? readFileSync(p, 'utf8') : null
}

function requireShipped(name: string): string {
  const bytes = readShipped(name)
  if (bytes === null) {
    throw new Error(`RED (PD-VENDOR §2.1 item 1 / §3.1): the vendored module ${shippedPath(name)} does not exist`)
  }
  return bytes
}

/** The pre-vendoring bytes of a repo file, read from the branch head this red set
 *  is authored against (`git` is the durable record of the unit's first red run). */
function preVendoringBytes(path: string): string | null {
  const r = spawnSync('git', ['-C', REPO_ROOT, 'show', `${PRE_VENDORING_HEAD}:${path}`], { encoding: 'utf8' })
  return r.status === 0 ? (r.stdout as string) : null
}

/** Every `import`/`export … from '…'` specifier in a source text (§2.1 item 5's
 *  recorded pattern: `^\s*(import|export)\s+.*from\s+['"]`). */
function importSpecifiers(src: string): string[] {
  const out: string[] = []
  const re = /^\s*(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) out.push(m[1]!)
  return out
}

function loadManifest(): Record<string, unknown> | null {
  if (!existsSync(MANIFEST_PATH)) return null
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Record<string, unknown>
  } catch {
    return null
  }
}

function requireManifest(): Record<string, unknown> {
  const m = loadManifest()
  if (m === null) {
    throw new Error(`RED (PD-VENDOR §2.2 / §3.2 item 5): the manifest ${MANIFEST_PATH} does not exist or is not parsable — a loud failure naming the path, never a skip`)
  }
  return m
}

// ===========================================================================
// §2.1 item 1/2 — THE SET: fifteen modules, no member excluded
// ===========================================================================
describe('PD-VENDOR §2.1 — the set is exactly the fifteen, and NOT ONE member is excluded', () => {
  for (const name of PINNED_FIFTEEN) {
    it(`§2.1 item 1 — the vendored member src/shared/${name}.ts exists`, () => {
      const bytes = readShipped(name)
      expect(bytes, `RED (PD-VENDOR §3.1): ${shippedPath(name)} does not exist — the vendored copy is the unit's deliverable`).not.toBeNull()
      expect(bytes!.length).toBeGreaterThan(0)
    })
  }

  it('§2.1 item 2 — every one of the fifteen is claimed by the manifest as a module (not excluded)', () => {
    const modules = requireManifest().modules as Array<Record<string, unknown>>
    const claimed = modules.map((e) => String(e.name))
    for (const name of PINNED_FIFTEEN) {
      expect(claimed, `the pin's member "${name}" is missing from the manifest — NOT ONE member is excluded (§2.1 item 2)`).toContain(name)
    }
    expect(modules.filter((e) => e.excludedFromVendorSet !== false)).toEqual([])
  })

  it('§2.1 item 1 / V-2 — the manifest declares NO SIXTEENTH member and no barrel: the set is the pin’s fifteen, and each member’s `source` is exactly `src/shared/<name>.ts`', () => {
    const modules = (requireManifest().modules as Array<Record<string, unknown>>).map((e) => String(e.name))
    expect(modules.length, 'V-2/V-3: a sixteenth (or fourteenth) member is a set violation').toBe(15)
    expect([...modules].sort()).toEqual([...PINNED_FIFTEEN].sort())
    // a barrel/re-export (`index.ts` or any stem outside the pin's fifteen) would be
    // both a sixteenth member AND an out-of-set import target (P-IM-3)
    expect(modules).not.toContain('index')
    const declaredPaths = (requireManifest().modules as Array<Record<string, unknown>>).map((e) => String(e.source))
    expect(declaredPaths.sort()).toEqual(PINNED_FIFTEEN.map((n) => `src/shared/${n}.ts`).sort())
  })

  it('§2.1 item 1 — the repo’s OTHER `src/shared/` fork modules are OUTSIDE the pin and are neither vendored members nor baseline files', () => {
    // §2.1 item 1 counts the FOUNDATION tree (20 .ts files). THIS repo’s `src/shared/`
    // legitimately carries its own fork modules too; the assertion is that NONE of
    // them is claimed as a vendored member (the set is the pin’s fifteen names, not
    // “every file in the directory”).
    const onDisk = readdirSync(join(REPO_ROOT, 'src', 'shared'), { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.ts'))
      .map((e) => e.name.replace(/\.ts$/, ''))
    const claimed = (requireManifest().modules as Array<Record<string, unknown>>).map((e) => String(e.name))
    const forkModules = onDisk.filter((n) => !(BASELINE_FILES as readonly string[]).includes(n))
    const wronglyClaimed = forkModules.filter((n) => claimed.includes(n) && !(PINNED_FIFTEEN as readonly string[]).includes(n))
    expect(wronglyClaimed, 'a vendored member must be one of the pin’s fifteen — never a fork module that happens to live in src/shared/').toEqual([])
    expect((BASELINE_FILES as readonly string[]).every((b) => onDisk.includes(b)), 'the four baseline files must all be present').toBe(true)
    for (const name of PINNED_FIFTEEN) {
      expect(claimed, `the pin’s member "${name}" must be claimed (§2.1 item 2 — no member excluded)`).toContain(name)
    }
  })

  it('§2.1 item 3 item 4 — `slot-host` and `owned-list-host` ARE vendored (the `KEEP`/deferred rows are §4.1 ROW status, not set membership)', () => {
    expect(PINNED_FIFTEEN).toContain('slot-host')
    expect(PINNED_FIFTEEN).toContain('owned-list-host')
    expect(readShipped('slot-host'), `RED: ${shippedPath('slot-host')} does not exist`).not.toBeNull()
    expect(readShipped('owned-list-host'), `RED: ${shippedPath('owned-list-host')} does not exist`).not.toBeNull()
  })

  it('§2.1 item 2 / dossier `C-7` — the stem collision is by STEM, never by specifier: the two `theme` modules are distinguished by path', () => {
    expect(existsSync(join(REPO_ROOT, 'src', 'renderer', 'theme.ts')), 'the FORK module src/renderer/theme.ts must stay where it is (no re-name, C-7)').toBe(true)
    expect(readShipped('theme'), `RED: ${shippedPath('theme')} does not exist`).not.toBeNull()
    // the specifiers differ: `./theme.js` resolves inside src/renderer, while the
    // vendored module is reached as src/shared/theme.ts.
    expect(join(REPO_ROOT, 'src', 'renderer', 'theme.ts')).not.toBe(join(REPO_ROOT, 'src', 'shared', 'theme.ts'))
  })
})

// ===========================================================================
// §4 `P-IM-3` — IMPORT CLOSURE (bounded ON THE CLOSURE READING)
// ===========================================================================
describe('§4 P-IM-3 — import closure holds (strat:import-closure)', () => {
  it('P-IM-3 — no vendored member imports anything outside the set (15 files + 2 synthetic edge sets = 17 attempts)', () => {
    const offenders: string[] = []
    for (const name of PINNED_FIFTEEN) {
      const src = requireShipped(name)
      for (const spec of importSpecifiers(src)) {
        const internal = /^\.\/([a-z-]+)\.js$/.exec(spec)
        const ok = internal !== null && (PINNED_FIFTEEN as readonly string[]).includes(internal[1]!)
        if (!ok) offenders.push(`${name}.ts imports ${spec}`)
      }
    }
    expect(
      offenders,
      '§2.1 item 5: no vendored module imports anything outside the set — not dom-shim.js, not types.js, not demo-envelope.js, not provident-ssr, not node:*, not electron',
    ).toEqual([])
  })

  it('P-IM-3 — exactly FIVE module files carry any import at all; the other TEN carry ZERO', () => {
    const withImports: string[] = []
    for (const name of PINNED_FIFTEEN) {
      if (importSpecifiers(requireShipped(name)).length > 0) withImports.push(name)
    }
    expect([...withImports].sort()).toEqual([...FILES_WITH_IMPORTS].filter((f) => (PINNED_FIFTEEN as readonly string[]).includes(f)).sort())
  })

  it('§2.1 item 5 / §2.2 rule 4+8 — `importCensus.outOfSetImports` is EMPTY and the manifest’s FIVE DISTINCT `(from,to)` records equal the DISTINCT-edge set read from the files', () => {
    const manifest = requireManifest()
    const census = manifest.importCensus as Record<string, unknown>
    expect(census, 'the manifest carries no importCensus object (§2.2)').toBeDefined()
    expect(census.outOfSetImports, '`outOfSetImports` MUST be empty (§2.2 rule 4)').toEqual([])

    // THE EDGES READ OFF THE FILES, keyed as the `(from, to)` PAIR (§2.2 rule 8;
    // §12.3(b)): the two `gutter-affordance.ts → './gesture-session.js'` STATEMENTS
    // (a value import + a type-only import) are ONE distinct edge, so a DEDUPE here
    // is the contract — never a statement list of 6.
    const readEdges = new Set<string>()
    for (const name of PINNED_FIFTEEN) {
      for (const spec of importSpecifiers(requireShipped(name))) {
        const m = /^\.\/([a-z-]+)\.js$/.exec(spec)
        if (m !== null) readEdges.add(`${name}->${m[1]}`)
      }
    }
    const distinctReadEdges = [...readEdges].sort()
    // the edges RECORDED in the manifest
    const recorded = (census.internalEdges as Array<Record<string, unknown>>).map((e) => `${String(e.from)}->${String(e.to)}`)
    expect(
      recorded.length,
      '`importCensus.internalEdges` carries EXACTLY FIVE records — a DISTINCT-EDGE set keyed by (from, to) (§2.2 rule 8); a SIXTH record (the duplicate statement) and a DROPPED record both fail',
    ).toBe(5)
    expect(distinctReadEdges.length, 'the files’ set-internal DISTINCT edges number 5 (§2.1 item 5 arithmetic block)').toBe(5)
    // a MISSING edge and an EXTRA edge both fail (§4 P-IM-3)
    expect([...recorded].sort(), 'the manifest’s five records must be SET-EQUAL to the DISTINCT edges the files carry (§2.2 rule 8)').toEqual(distinctReadEdges)
    expect(distinctReadEdges).toEqual(RECORDED_INTERNAL_EDGES.map(([f, t]) => `${f}->${t}`).sort())
  })

  it('§2.1 item 5 (arithmetic block) / §12.3(b) — SEPARATELY NAMED: the files carry SIX set-internal import STATEMENTS forming FIVE DISTINCT edges', () => {
    // This row exists so the two quantities are NEVER conflated (§12.3(b)): the
    // statement count is asserted HERE, as its own named row, and never as the
    // equality with the manifest (whose `internalEdges` carries 5 records).
    const statements: string[] = []
    for (const name of PINNED_FIFTEEN) {
      for (const spec of importSpecifiers(requireShipped(name))) {
        const m = /^\.\/([a-z-]+)\.js$/.exec(spec)
        if (m !== null) statements.push(`${name}->${m[1]}`)
      }
    }
    expect(statements.length, 'the fifteen files carry SIX set-internal import STATEMENTS (§2.1 item 5’s arithmetic block)').toBe(6)
    expect(new Set(statements).size, 'and FIVE DISTINCT edges — the two counts are different quantities').toBe(5)
    const duplicates = statements.filter((e, i) => statements.indexOf(e) !== i)
    expect(
      duplicates,
      'the duplicated statement is `gutter-affordance.ts → ./gesture-session.js`, twice: once a VALUE import (`POINTER_TYPES`) and once TYPE-ONLY (`GestureHandle`) — §2.1 item 5',
    ).toEqual(['gutter-affordance->gesture-session'])
  })

  it('P-IM-3 CONTROL — a synthetic edge `theme → dom-shim` MUST fail, and a dropped in-set edge MUST fail', () => {
    const oracle = (edges: string[]): string[] => {
      // the closure oracle: every edge's TARGET must be one of the fifteen
      return edges.filter((e) => {
        const to = e.split('->')[1]!
        return !(PINNED_FIFTEEN as readonly string[]).includes(to)
      })
    }
    const controlOutOfSet = oracle(['theme->dom-shim']).length > 0
    const recordedSet = RECORDED_INTERNAL_EDGES.map(([f, t]) => `${f}->${t}`)
    const dropped = recordedSet.filter((e) => e !== 'census->zones')
    const controlDroppedEdge = [...dropped].sort().join(',') !== [...recordedSet].sort().join(',')
    expect(controlOutOfSet, 'a synthetic out-of-set edge MUST be caught').toBe(true)
    expect(controlDroppedEdge, 'a dropped in-set edge MUST fail the set-equality assertion').toBe(true)
  })

  it('§2.2 — `nonMemberNotes` records that `path-fork-cycle` (NOT a member) is the source of the directory’s only out-of-set import', () => {
    const census = requireManifest().importCensus as Record<string, unknown>
    const notes = (census.nonMemberNotes as string[]).join(' ')
    expect(notes, 'the out-of-set import belongs to a NON-member and must be recorded under nonMemberNotes (§2.2)').toMatch(/path-fork-cycle/)
    expect(notes).toMatch(/provident-ssr/)
  })

  it('§2.1 item 6 / §5 item 5 / §12.3(c) — NO vendored module is imported by this repo today: the hit set is EXACTLY the three stem-collision sites, and NONE resolves to a vendored member', () => {
    // The spec’s own recorded read (§2.1 item 6): *"A read of `src/**` for
    // `from '…/<name>.js'` over the fifteen names"* — the `…` is the whole specifier
    // prefix, so the pattern is `from '[^']*<name>\.js'` (the stem-SUFFIX form).
    const r = spawnSync(
      'grep',
      ['-rnE', PINNED_FIFTEEN.map((n) => `from '[^']*${n}\\.js'`).join('|'), join(REPO_ROOT, 'src')],
      { encoding: 'utf8' },
    )
    const hits = (r.stdout ?? '')
      .split('\n')
      .filter((l) => l.trim() !== '')
      // the `/shared/` exclusion is KEPT: the set-internal edges (census→zones,
      // gutter-affordance→gutter + gesture-session, gutter/relocate→gesture-session)
      // live in `src/shared/` and are the P-IM-3 rows’ subject, not this row’s.
      .filter((l) => !/\/shared\//.test(l))
    // derive each hit’s FILE, its verbatim SPECIFIER, and the module the specifier
    // actually RESOLVES TO (§12.3(c): “deriving each hit’s specifier”).
    const parsed = hits.map((line) => {
      const m = /^(.+?):(\d+):(.*)$/.exec(line)!
      const file = m[1]!
      const text = m[3]!
      const spec = /from\s+['"]([^'"]+)['"]/.exec(text)![1]!
      return { file: relative(REPO_ROOT, file), spec, resolved: resolve(dirname(file), spec.replace(/\.js$/, '.ts')) }
    })
    // THE PREDICATE IS “no hit resolves to a VENDORED MEMBER”, STATED AS AN EXACT SET
    // (§12.3(c)) — never an emptiness: a zero-hit form would require editing
    // `src/renderer/renderer.ts`, which §3.6 / `C-7` forbid.
    expect(
      parsed.map((h) => `${h.file} ${h.spec}`).sort(),
      '§2.1 item 6 MEASURES exactly three legitimate hits: `./pane-gutter.js` ×2 (renderer.ts, sidebar-panes.ts) + `./theme.js` (renderer.ts) — the stem collision `C-7`',
    ).toEqual([
      'src/renderer/renderer.ts ./pane-gutter.js',
      'src/renderer/renderer.ts ./theme.js',
      'src/renderer/sidebar-panes.ts ./pane-gutter.js',
    ])
    // …and NONE of the three resolves to a vendored member: the collision is by STEM,
    // never by SPECIFIER (`./theme.js` from `src/renderer/` resolves to the FORK module
    // `src/renderer/theme.ts`, never to the vendored `src/shared/theme.ts`).
    const vendoredPaths = new Set(PINNED_FIFTEEN.map((n) => shippedPath(n)))
    expect(
      parsed.filter((h) => vendoredPaths.has(h.resolved)),
      'no hit may resolve to one of the pin’s fifteen `src/shared/<name>.ts` files (§2.1 item 6 / §5 item 5 — the vendoring is INERT)',
    ).toEqual([])
    // the three hits are real fork modules: each resolves to an existing file under
    // `src/renderer/`, and every one of them exists.
    expect(parsed.map((h) => h.resolved).every((p) => /[/\\]src[/\\]renderer[/\\]/.test(p))).toBe(true)
    expect(parsed.map((h) => h.resolved).every((p) => existsSync(p)), 'each hit must resolve to a real fork module').toBe(true)
  })
})

// ===========================================================================
// §4 `P-SM-2` — the four baseline files are NOT replaced
// ===========================================================================
describe('§4 P-SM-2 — the four baseline files are NOT replaced, and no vendored member is a baseline file (strat:baseline-non-replacement)', () => {
  for (const name of BASELINE_FILES) {
    it(`P-SM-2 / V-4 — src/shared/${name}.ts is BYTE-UNCHANGED against its pre-vendoring bytes (a vendoring edit here is a REGRESSION)`, () => {
      const before = preVendoringBytes(`src/shared/${name}.ts`)
      expect(before, `could not read the pre-vendoring bytes of src/shared/${name}.ts at ${PRE_VENDORING_HEAD}`).not.toBeNull()
      const now = readFileSync(join(REPO_ROOT, 'src', 'shared', `${name}.ts`), 'utf8')
      expect(now, `src/shared/${name}.ts was MODIFIED by the vendoring pass — V-4 is a REGRESSION, not a cleanup (R-3 clause (2))`).toBe(before)
    })
  }

  it('P-SM-2 — the four baseline names are ABSENT from the manifest’s `modules`, and no set member appears in `baselineFilesNotReplaced`', () => {
    const modules = requireManifest().modules as Array<Record<string, unknown>>
    const moduleNames = modules.map((e) => String(e.name))
    for (const b of BASELINE_FILES) {
      expect(moduleNames, `the baseline file "${b}" must NOT be a vendoring target (§2.2 rule 5)`).not.toContain(b)
    }
    const listed = requireManifest().baselineFilesNotReplaced as string[]
    for (const name of PINNED_FIFTEEN) {
      expect(listed, `the set member "${name}" must NOT appear in baselineFilesNotReplaced`).not.toContain(`src/shared/${name}.ts`)
    }
    expect(listed).toEqual(BASELINE_FILES.map((b) => `src/shared/${b}.ts`))
  })

  it('P-SM-2 — the four baseline files EXIST and the R-3 divergence reading still holds (the fork’s dom-shim/types are strictly larger)', () => {
    // §3.3 item 4: dom-shim 508 vs 238 · types 874 vs 328 · demo-envelope 131 vs 434 ·
    // path-fork-cycle 101 vs 101 (fork first) — the three files DIFFER and
    // path-fork-cycle does not. Only the RELATION is asserted here (the three differ),
    // because the single-line deltas are a newline-counting convention difference.
    const lineCount = (text: string): number => text.split('\n').length
    for (const name of BASELINE_FILES) {
      const nowText = readFileSync(join(REPO_ROOT, 'src', 'shared', `${name}.ts`), 'utf8')
      const preText = preVendoringBytes(`src/shared/${name}.ts`)!
      expect(lineCount(nowText), `the pre-vendoring line count of ${name}.ts changed`).toBe(lineCount(preText))
    }
    expect(PINNED_FIFTEEN as readonly string[]).not.toContain('dom-shim' as never)
  })

  it('P-SM-2 CONTROL — a manifest that lists `dom-shim` as a module MUST fail the same oracle', () => {
    const oracle = (manifestModules: string[]): string[] => manifestModules.filter((n) => (BASELINE_FILES as readonly string[]).includes(n))
    expect(oracle(['dom-shim']), 'a manifest listing dom-shim as a module must be caught (§4 P-SM-2 control)').toEqual(['dom-shim'])
    expect(oracle([...PINNED_FIFTEEN]), 'the real fifteen must be clean under the same oracle').toEqual([])
  })

  it('§2.1 item 2 — the converse over the fifteen: NO set member is a baseline file (five recorded spot-checks + all fifteen)', () => {
    const overlap = PINNED_FIFTEEN.filter((n) => (BASELINE_FILES as readonly string[]).includes(n))
    expect(overlap, 'the four "NOT replaced" files are OUTSIDE the set — no member is a baseline file (§2.1 item 2)').toEqual([])
    expect(['dom-shim', 'types', 'demo-envelope', 'path-fork-cycle'].filter((b) => (PINNED_FIFTEEN as readonly string[]).includes(b))).toEqual([])
  })
})

// ===========================================================================
// §2.1 item 7 — THE SYMBOL CENSUS (and the five non-exported shapes)
// ===========================================================================
describe('PD-VENDOR §2.1 item 7 — the symbol census of the vendored modules', () => {
  for (const [moduleName, values] of Object.entries(EXPORTED_VALUES)) {
    it(`§2.1 item 7 — src/shared/${moduleName}.ts exports exactly its recorded VALUES: ${values.join(', ')}`, () => {
      const src = requireShipped(moduleName)
      const missing = values.filter((v) => !new RegExp(`export\\s+(?:const|function|let|class)\\s+${v}\\b`).test(src))
      expect(missing, `${moduleName}.ts must export its recorded values (§2.1 item 7)`).toEqual([])
    })
  }

  it('§0A note 7 / dossier `C-6` / `A-3` — the five return shapes are NOT exported by the vendored bytes: the fork RE-DECLARES them', () => {
    const exported: string[] = []
    for (const shape of NON_EXPORTED_SHAPES) {
      for (const name of PINNED_FIFTEEN) {
        const src = readShipped(name)
        if (src === null) continue
        if (new RegExp(`export\\s+(?:interface|type|class)\\s+${shape}\\b`).test(src)) exported.push(`${shape} in ${name}.ts`)
      }
    }
    expect(
      exported,
      'the module bytes stay UNMODIFIED: GestureSession / RelocateResetResult / FocusResult / FocusRefusal / FocusTransitionArg are NON-EXPORTED by design and the fork re-declares them (§0A note 7)',
    ).toEqual([])
  })

  it('§2.1 item 7 — `GestureSession` and `RelocateResetResult` are DECLARED without `export` in their own modules', () => {
    const gs = requireShipped('gesture-session')
    expect(gs, '`GestureSession` must be declared in gesture-session.ts').toMatch(/\binterface\s+GestureSession\b/)
    expect(gs, 'and WITHOUT `export` (§0A note 7)').not.toMatch(/export\s+interface\s+GestureSession\b/)
    const rel = requireShipped('relocate')
    expect(rel, '`RelocateResetResult` must be declared in relocate.ts').toMatch(/\b(?:interface|type)\s+RelocateResetResult\b/)
    expect(rel, 'and WITHOUT `export` (§0A note 7)').not.toMatch(/export\s+(?:interface|type)\s+RelocateResetResult\b/)
  })
})

// ===========================================================================
// §3.5 / §3.6 — THE CONFORMANCE LEG, ASSERTED WITHOUT RUNNING THE SUITES
// ===========================================================================
describe('PD-VENDOR §3.5 — the scoped conformance leg, registered by PLACEMENT (not by collection)', () => {
  it('§3.5 item 6 / O-2 — the leg has its OWN config at vitest.conformance.config.ts, and vitest.config.ts is UNTOUCHED', () => {
    expect(existsSync(join(REPO_ROOT, 'vitest.conformance.config.ts')), 'RED (PD-VENDOR §3.5 item 6): vitest.conformance.config.ts does not exist').toBe(true)
    const cfg = readFileSync(join(REPO_ROOT, 'vitest.conformance.config.ts'), 'utf8')
    expect(cfg, '§3.5 item 6: the leg’s include is vendor/Provident-Electron/tests/*.test.ts').toMatch(/vendor\/Provident-Electron\/tests\/\*\.test\.ts|vendor[\\/]Provident-Electron[\\/]tests/)
    expect(cfg, 'the leg’s config must NOT include tests/** — the leg is invisible to `npm test` (§3.5 item 6 / P-TP-1)').not.toMatch(/include\s*:\s*\[[^\]]*['"]tests\/\*\*/)
    expect(cfg).toMatch(/environment\s*:\s*['"]node['"]/)
  })

  it('§2.5 — `package.json` gained the leg’s script key; the pinned `test`/`test:watch` values are NOT read here (the protected pin owns them)', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    const legKey = Object.keys(pkg.scripts).find((k) => /conformance/.test(pkg.scripts[k]!)) ?? (pkg.scripts.conformance !== undefined ? 'conformance' : undefined)
    expect(legKey, '§2.5: ONE added script key runs the leg (the leg is registered by a NAMED script, §3.4 item 1)').toBeDefined()
    const driftKey = Object.keys(pkg.scripts).find((k) => /foundation-drift\.mjs/.test(pkg.scripts[k]!))
    expect(driftKey, '§2.5: one of `conformance`/`drift` is REQUIRED — the A3 monitor must be invoked by a named script (§3.4 item 1)').toBeDefined()
  })

  it('§2.2 / §3.5 item 2 — the manifest’s `conformance.included` is EXACTLY the eleven suites', () => {
    const conformance = requireManifest().conformance as Record<string, unknown>
    expect(conformance, 'the manifest carries no `conformance` block (§2.2)').toBeDefined()
    expect(conformance.config).toBe('vitest.conformance.config.ts')
    expect(conformance.placement, 'D-2 / §0A note 2: the vendored suites place at vendor/Provident-Electron/tests/').toBe('vendor/Provident-Electron/tests/')
    expect(conformance.leg, '§2.2: the leg names the script key added to package.json').toBeTruthy()
    expect([...(conformance.included as string[])].sort()).toEqual([...INCLUDED_SUITES].sort())
  })

  it('§2.2 / §3.5 item 3 — the manifest’s `conformance.excluded` is EXACTLY the four suites, EACH with its own recorded reason', () => {
    const excluded = requireManifest().conformance as Record<string, unknown>
    const rows = excluded.excluded as Array<Record<string, unknown>>
    expect(rows, 'the manifest carries no conformance.excluded list').toBeDefined()
    expect(rows.map((r) => String(r.suite)).sort()).toEqual(Object.keys(EXCLUDED_SUITES).sort())
    const problems: string[] = []
    for (const r of rows) {
      const suite = String(r.suite)
      const reason = String(r.reason ?? '')
      if (reason.trim() === '') problems.push(`${suite}: no reason recorded — each excluded suite carries its OWN reason (§3.5 item 3)`)
      if (!EXCLUDED_SUITES[suite]!.test(reason)) problems.push(`${suite}: the reason does not name its out-of-set import class (${String(EXCLUDED_SUITES[suite])})`)
    }
    expect(problems).toEqual([])
  })

  it('§3.5 item 5 / R-4 / X-9 — the ABSOLUTE prohibition: no suite filed under the leg may mock the electron module', () => {
    // Asserted by PLACEMENT/registration (the leg does not run here): the manifest’s
    // included list is the eleven suites the foundation ships, and NONE of the
    // foundation’s fifteen candidate suites contains an electron mock (MEASURED — a
    // read of `vi.mock('electron'` over the foundation’s tests/** returns no match).
    const included = (requireManifest().conformance as Record<string, unknown>).included as string[]
    expect(included.length).toBe(11)
    expect(included.some((s) => /slot-host|owned-list-host|mount-invariant-guard|layout-projection/.test(s))).toBe(false)
  })

  it('§3.6 — the leg adds ZERO collected files to `npm test` (asserted as PLACEMENT: the suites live outside tests/**)', () => {
    const placement = String((requireManifest().conformance as Record<string, unknown>).placement)
    expect(placement.startsWith('vendor/'), `the leg’s placement must be OUTSIDE tests/** so \`npm test\`’s collected census is UNCHANGED (§3.5 item 6 / §3.6)`).toBe(true)
    expect(placement).not.toMatch(/^tests\//)
  })

  it('§3.5 item 1 / O-3 — the candidate universe is named: all fifteen of the foundation’s suites exist, eleven included + four excluded = fifteen', () => {
    expect(INCLUDED_SUITES.length + Object.keys(EXCLUDED_SUITES).length, 'the candidate universe is the fifteen suites A-8 names (§3.5 item 1)').toBe(15)
    expect(new Set([...INCLUDED_SUITES, ...Object.keys(EXCLUDED_SUITES)]).size).toBe(15)
  })

  it('§9 item 3 (X-11) — this unit does NOT add a runner for the two uncollected `.mjs` batteries', () => {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }
    const values = Object.values(pkg.scripts).join(' ')
    expect(values, 'X-11 is NOT this unit’s: no script may name the two .mjs batteries').not.toMatch(/adapter-parity-battery\.test\.mjs/)
    expect(values).not.toMatch(/mcp-stdio-e2e\.test\.mjs/)
  })

  it('§1.2 — the vendor tree’s suite copies place under vendor/ and NEVER under tests/', () => {
    expect(existsSync(join(REPO_ROOT, 'vendor', 'Provident-Electron', 'tests')), 'RED (PD-VENDOR §0A note 2 / D-2): vendor/Provident-Electron/tests/ does not exist').toBe(true)
  })

  it('§2.2 — the manifest’s `baselines.collectedSuiteCensus` is recorded WITH its layer and its measuredBy (RCA-12)', () => {
    const baselines = requireManifest().baselines as Record<string, Record<string, unknown>>
    const census = baselines.collectedSuiteCensus
    expect(census, 'the collected-suite census reading is recorded (§2.2 / §1.3 O-8)').toBeDefined()
    expect(typeof census.layer).toBe('string')
    expect(typeof census.measuredBy).toBe('string')
    expect(String(census.measuredBy)).not.toBe('')
  })

  it('§3.3 item 2 — the foundation tree is at the pinned commit when present (the monitor’s other arm is the SKIP)', () => {
    const foundation = join(REPO_ROOT, '..', 'Provident-Electron')
    if (!existsSync(foundation)) {
      // standalone is legitimate (§2.3 honesty rule 1) — the row is not a failure
      expect(existsSync(foundation)).toBe(false)
      return
    }
    const r = spawnSync('git', ['-C', foundation, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
    expect(r.status).toBe(0)
    expect((r.stdout ?? '').trim()).toBe(PINNED_COMMIT)
  })
})
