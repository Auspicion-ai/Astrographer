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
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
// `typescript` is an EXISTING devDependency (§4's machinery forbids a NEW one) and is
// the idiom the sibling `pd-vendor-manifest.test.ts` row uses to derive a census.
import ts from 'typescript'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const MANIFEST_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const MONITOR_PATH = join(REPO_ROOT, 'scripts', 'foundation-drift.mjs')

/** The branch head this red set is authored against — the PRE-VENDORING tree.
 *  `⟨A-7 CORRECTION⟩` This constant is now only the recorded FALLBACK: the rows read
 *  the pre-vendoring revision from the MANIFEST at run time (`preVendoringRevision()`
 *  consumes `foundation.commit` and the `baselines` block's recorded red-set revision)
 *  and use this literal only when the manifest records none. The two revisions agree
 *  on all four baseline files (byte-identical at `cf19d4e` and `7d3b55c`, measured
 *  this pass), so the fallback is a provenance note, not the anchor. */
const PRE_VENDORING_HEAD_FALLBACK = 'cf19d4e'

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

const PINNED_COMMIT = 'd7b98b574adc7fa63fbabda617eba2a753f52cb5'

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

/** ⟨RE-STATED 2026-09-28 — unit `PD-UI-1` §9 item 1 (the escalated blocking pin
 *  re-statement); spec shape at §9 item 1 item (b).⟩ THE DECLARED CONSUMER-EDGE
 *  ALLOW-LIST — the explicit, PER-ROW set of `(file, specifier)` pairs that the
 *  re-pointed consumer units deliberately import a VENDORED MEMBER through. It grows by
 *  ONE ROW PER ADOPTING UNIT, with the vendored member it targets named.
 *
 *  The two limbs of the pin stay DISTINGUISHABLE: a hit that resolves to a vendored
 *  member and is NOT on this list STILL FAILS (the row's negative control proves it), and
 *  a hit on this list must still be a REAL, statically-declared edge of the tree — a
 *  dynamic `import(...)`, a `require(...)` or a `new URL(...)` spelling of the SAME edge
 *  is NOT this row, because a form the pin cannot SEE would make the pin green by hiding
 *  the very consumer edge it exists to declare (§0A note 2; §3a `ADV-T7`).
 *
 *  NOT on this list, and never will be: the three Phase-0 stem-collision sites
 *  (`renderer.ts ./theme.js`, `renderer.ts|sidebar-panes.ts ./pane-gutter.js`) — they
 *  resolve to FORK modules, which is exactly what makes the `theme` collision by STEM and
 *  never by SPECIFIER (`C-7`), and `importCensus.outOfSetImports` stays EMPTY. */
const DECLARED_CONSUMER_EDGES: Array<{ file: string; specifier: string; member: string; unit: string }> = [
  // ⟨READING TAKEN, so it is visible rather than silent: the unit spec `§2.1` records the
  //   specifier as `'../../shared/theme.js'` AND says, in the same paragraph, *"(`../../shared/theme.js`
  //   is the correct relative form from `src/renderer/`; the implementer may write the equivalent
  //   form the bundler/typechecker accepts, and the row asserts the RESOLVED path, never a
  //   spelling)"*. From `src/renderer/` the SPECIFIER THAT RESOLVES to `src/shared/theme.ts` is
  //   `'../shared/theme.js'` — `dirname('src/renderer/theme.ts') = 'src/renderer'`, and
  //   `src/renderer/../../shared/theme.ts` escapes `src/` entirely. The SPEC'S OWN RESOLUTION
  //   CLAUSE is therefore the binding one: this allow-list names BOTH spellings, a row is
  //   satisfied by whichever the tree carries, and the row asserts the RESOLVED path. The
  //   divergence is REPORTED to the supervisor as a documentation nit in `unit-pd-ui-1-theme.md`
  //   `§2.1` (no behaviour depends on it — the vendored member is the same either way).⟩
  { file: 'src/renderer/theme.ts', specifier: '../../shared/theme.js', member: 'theme', unit: 'PD-UI-1' },
  { file: 'src/renderer/theme.ts', specifier: '../shared/theme.js', member: 'theme', unit: 'PD-UI-1' },
  // ⟨RE-STATED 2026-09-28 — unit `PD-UI-6` §3.6.1 / §9 item 6 (`E-6`); the supervisor's
  //   disposition ① of the unit's red-set delegation.⟩ THE ONE ROW THE OVERLAY ADOPTION
  //   ADDS. `src/renderer/modal-state.ts` is the unit's named adapter, and its single new
  //   import statement is the vendored member this row declares:
  //   `import { overlayTransition } from '../shared/overlay.js'`, whose RESOLVED path is
  //   `src/shared/overlay.ts` (the row asserts the RESOLVED path, never a spelling — the
  //   limb below already does). `overlay` is one of the pin's fifteen and has NO fork
  //   sibling, so the adoption is a VENDORED-RESOLVING edge and NOT a stem-collision hit:
  //   the three-hit stem-collision limb above is UNAFFECTED and stays exactly as landed.
  //   NO EVASION FORM is taken (`await import(...)` / `require(...)` / `new URL(...)` stay
  //   refused and caught by the extended derivation), and the NEGATIVE CONTROL row below is
  //   left INTACT — a relaxation would replace the allow-list limb with "any
  //   vendored-resolving hit passes", which is FORBIDDEN and is not what this row does.⟩
  { file: 'src/renderer/modal-state.ts', specifier: '../shared/overlay.js', member: 'overlay', unit: 'PD-UI-6' },
]

/** The vendored member a specifier stem names (`./theme.js` → `theme`), or `null`. */
function vendoredStemOf(spec: string): string | null {
  const m = /(?:^|\/)([a-z-]+)\.js$/.exec(spec)
  return m !== null && (PINNED_FIFTEEN as readonly string[]).includes(m[1]!) ? m[1]! : null
}

/** The stem-SUFFIX pattern the pin's own recorded `grep -rnE` used (§2.1 item 6): it
 *  matches the STATIC `from '…<name>.js'` form ONLY — never a dynamic `import(...)`, a
 *  `require(...)` or a `new URL(...)` spelling. Kept as the DISCRIMINATING control's
 *  subject, so the four shapes it misses are shown rather than asserted. */
function staticTextDerivation(src: string): string[] {
  const re = new RegExp(`from\\s+['"]([^'"]*(?:${PINNED_FIFTEEN.join('|')})\\.js)['"]`, 'g')
  return [...src.matchAll(re)].map((m) => m[1]!)
}

interface DerivedEdge {
  file: string
  spec: string
  /** 'static-from' is the form the pin's recorded grep matched; the other three are the
   *  refused evasion forms, CAUGHT here rather than hidden behind (§9 item 1). */
  kind: 'static-from' | 'dynamic-import' | 'require' | 'new-URL'
  /** the module the specifier RESOLVES to, or `<bare:…>` for an out-of-repo specifier */
  resolved: string
  /** the vendored member the RESOLVED path names, or `null` */
  member: string | null
}

/** THE DERIVATION, extended from the pin's `grep` arm to an AST arm so the four statement
 *  SHAPES that match no `from '…'` pattern are CATCHABLE. A construct inside a STRING is
 *  never a hit (an AST reader is not a text scan), and the TYPE-position `import('./x.js').T`
 *  form the repo's renderer files carry is a type reference, not an edge. */
function derivedConsumerEdges(src: string, file: string): DerivedEdge[] {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const out: DerivedEdge[] = []
  const push = (spec: string, kind: DerivedEdge['kind']): void => {
    const stem = vendoredStemOf(spec)
    if (stem === null) return
    // THE RESOLVED PATH IS THE PREDICATE (§2.1's own census clause: "the row asserts the
    // RESOLVED path, never a spelling") — the specifier is resolved relative to the file's
    // own directory, never to a fixed depth.
    const resolved = spec.startsWith('.') ? resolve(dirname(resolve(REPO_ROOT, file)), spec.replace(/\.js$/, '.ts')) : ''
    const member = resolved !== '' && resolved === shippedPath(stem) ? stem : null
    out.push({ file, spec, kind, resolved: resolved === '' ? `<bare:${spec}>` : resolved, member })
  }
  const walk = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteralLike(node.moduleSpecifier)) push(node.moduleSpecifier.text, 'static-from')
    if (ts.isExportDeclaration(node) && node.moduleSpecifier !== undefined && ts.isStringLiteralLike(node.moduleSpecifier)) push(node.moduleSpecifier.text, 'static-from')
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'require') {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'require')
      }
      // an indirection by a `URL`-shaped helper — BOTH shapes: a call whose CALLEE reads
      // `.resolve`/`.href` (`URL.resolve('…')`), and a call that is the OBJECT of a `.href`
      // property access (`pathToFileURL('…').href`, the `import.meta.url` + `fileURLToPath`
      // route §3a `ADV-T7` names).
      const calleeReadsUrl = ts.isPropertyAccessExpression(callee) && (callee.name.text === 'resolve' || callee.name.text === 'href')
      const parentNode = node.parent as ts.Node | undefined
      const calledThenHref = parentNode !== undefined && ts.isPropertyAccessExpression(parentNode) && parentNode.expression === node && parentNode.name.text === 'href'
      if (calleeReadsUrl || calledThenHref) {
        const arg = node.arguments[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL')
      }
    }
    if (ts.isNewExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && callee.text === 'URL') {
        const arg = node.arguments?.[0]
        if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'new-URL')
      }
    }
    // `import('…')` parses as an ImportExpression whose expression is the `import` keyword —
    // a RUNTIME edge. The TYPE-position form (`import('./x.js').T` inside a type annotation,
    // which `sidebar-panes.ts`/`renderer.ts` carry) is a type reference and NOT an edge.
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0]
      if (arg !== undefined && ts.isStringLiteralLike(arg)) push(arg.text, 'dynamic-import')
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return out
}

/** Every `src/**\/*.ts` file in the repo, repo-relative and POSIX-shaped. */
function listSrcFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return listSrcFiles(p)
    return e.name.endsWith('.ts') ? [relative(REPO_ROOT, p).split('\\').join('/')] : []
  })
}

/** The pin's derivation over the WHOLE `src/**` tree: every import-shaped hit that names
 *  one of the pin's fifteen stems, by any statement shape. */
function allSrcConsumerEdges(): DerivedEdge[] {
  return [...listSrcFiles(join(REPO_ROOT, 'src'))].sort().flatMap((f) => derivedConsumerEdges(readFileSync(join(REPO_ROOT, f), 'utf8'), f))
}

/** ⟨TEST-DEFECT CORRECTED 2026-09-28 (remand 2 of 2 on unit `PD-UI-1`).⟩ Is the SOURCE file of
 *  an edge itself one of the pin's FIFTEEN VENDORED MEMBERS? An edge whose source is a vendored
 *  member is an **INTRA-VENDORED** edge — the vendored set's own internal wiring
 *  (`src/shared/<one of the fifteen>.ts`, repo-relative and POSIX-shaped). */
function isVendoredMemberFile(file: string): boolean {
  return (PINNED_FIFTEEN as readonly string[]).some((n) => file === `src/shared/${n}.ts`)
}

/** THE RE-STATED PIN'S ORACLE — the exact set of VENDORED-RESOLVING hits that are NOT on
 *  the declared consumer-edge allow-list. Non-vendored hits (the stem-collision sites) are
 *  not this oracle's subject; they are asserted by the pin's own array limb.
 *
 *  ⟨THE INTRA-VENDORED EXCLUSION — the correction this oracle owed (`unit-pd-vendor-foundation-mechanisms.md`
 *  §9 item 1, and this row's OWN derivation above).⟩ The pin is about edges **FROM this repo's
 *  CONSUMERS INTO the vendored set**. An edge whose SOURCE FILE is itself a vendored member
 *  (the five recorded `(from, to)` internal edges: `census.ts → ./zones.js`,
 *  `gutter-affordance.ts → ./gutter.js` + `./gesture-session.js` (×2 statements),
 *  `gutter.ts → ./gesture-session.js`, `relocate.ts → ./gesture-session.js`) is an
 *  **INTRA-VENDORED** edge — the Phase-0 spec's §9 item 1 assigns it to **`P-IM-3`**
 *  (`importCensus.internalEdges`), **not** to this consumer-edge pin. The row's own derivation
 *  already states exactly this (`allSrcConsumerEdges` is fed the whole `src/**` tree, while the
 *  row's grep limb filters `/shared/` out as "the P-IM-3 rows' subject, not this row's"), but
 *  this oracle never filtered on the SOURCE file being a vendored member — so the six
 *  intra-vendored STATEMENTS (five distinct edges) red it. At the Phase-0 baseline that was
 *  UNREACHABLE (the declared-edge limb threw first, before this assertion); the re-statement
 *  made it reachable, so the re-statement was INCOMPLETE rather than wrong. The exclusion is
 *  applied here, and the consumer-edge limbs below are NOT weakened by it: a hit whose source is
 *  a CONSUMER file and which resolves to a vendored member still fails unless it is on the
 *  allow-list (the NEGATIVE CONTROL row drives exactly that). */
function unlistedVendoredEdges(edges: DerivedEdge[], declared: ReadonlyArray<{ file: string; specifier: string }> = DECLARED_CONSUMER_EDGES): DerivedEdge[] {
  const listed = new Set(declared.map((d) => `${d.file} ${d.specifier}`))
  return edges.filter((e) => !isVendoredMemberFile(e.file) && e.member !== null && !listed.has(`${e.file} ${e.spec}`))
}

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

/** The pre-vendoring bytes of a repo file, read from the RECORDED revision (`git` is
 *  the durable record of the unit's first red run). */
function preVendoringBytes(path: string, revision: string = preVendoringRevision()): string | null {
  const r = spawnSync('git', ['-C', REPO_ROOT, 'show', `${revision}:${path}`], { encoding: 'utf8' })
  return r.status === 0 ? (r.stdout as string) : null
}

/** `⟨A-7`/`A-3 CORRECTION⟩` THE RECORDED pre-vendoring revision — read from the MANIFEST
 *  rather than hard-coded: the manifest's own `foundation.commit`, then any
 *  `baselines` row that records the red-set revision, then the named fallback. A row
 *  that anchors on a MUTABLE literal is what `A-7` rules out; this keeps the reading
 *  driven by the manifest while never inventing a revision. */
function preVendoringRevision(): string {
  const m = loadManifest()
  if (m !== null) {
    const baselines = m.baselines as Record<string, Record<string, unknown>> | undefined
    if (baselines !== undefined) {
      for (const row of Object.values(baselines)) {
        const text = `${String(row?.measuredBy ?? '')} ${String(row?.reading ?? '')}`
        const hex = /\b([0-9a-f]{7,40})\b/.exec(text)
        if (hex !== null && /red|pre-vendoring|baseline/i.test(text)) return hex[1]!
      }
    }
    const commit = (m.foundation as Record<string, unknown> | undefined)?.commit
    if (typeof commit === 'string' && /^[0-9a-f]{40}$/.test(commit)) return commit
  }
  return PRE_VENDORING_HEAD_FALLBACK
}

/** The adjacent foundation tree (§2.2's `foundation.path` neighbourhood). */
const FOUNDATION = join(REPO_ROOT, '..', 'Provident-Electron')

/** The foundation's `src/shared/` directory — the cross-tree readings' source. */
function foundationSharedDir(): string {
  return join(FOUNDATION, 'src', 'shared')
}

/** `node:crypto`'s md5, the algorithm the manifest records (§3.2 item 2 / §3.3). */
function md5(text: string): string {
  return createHash('md5').update(text).digest('hex')
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

/** §2.2 / `§3a` `A-10` — the monitor's AST-based closure oracle, loaded by name.
 *  The row that drives it is the NEGATIVE GENERATOR §3a's PBT audit tasked: the
 *  single-line REGEX at `importSpecifiers` above misses four statement SHAPES. */
async function loadImportSpecifiersOracle(): Promise<(sourceText: string) => string[]> {
  expect(existsSync(MONITOR_PATH), `RED (PD-VENDOR §2.3): the A3 monitor ${MONITOR_PATH} does not exist`).toBe(true)
  const mod = (await import(/* @vite-ignore */ pathToFileURL(MONITOR_PATH).href)) as Record<string, unknown>
  const fn = (mod.importSpecifiers ?? (mod.default as Record<string, unknown> | undefined)?.importSpecifiers) as
    | ((text: string) => string[])
    | undefined
  return fn as (text: string) => string[]
}

/** The single-line REGEX the landed row uses — kept here as the DISCRIMINATING
 *  control, so the row shows the four shapes it misses rather than asserting it. */
const SINGLE_LINE_IMPORT_RE = /^\s*(?:import|export)\s+.*?from\s+['"]([^'"]+)['"]/gm

function regexImportSpecifiers(src: string): string[] {
  return [...src.matchAll(SINGLE_LINE_IMPORT_RE)].map((m) => m[1]!)
}

/** `§3a` `A-12` — every BINDING of the vitest mock API in a source text, by any
 *  access form: `vi.mock(...)`, `vi['mock'](...)`, or a call through a name that
 *  resolves to `vi` (an aliased import, or a local alias). The protected census
 *  matches `callee === 'vi.mock'` on the literal `vi`, so an aliased or computed
 *  call joins NEITHER the census NOR the copy's derivation. */
interface MockBindingSite {
  /** the access form that was bound, e.g. `vi.mock` / `v.mock` / `vitest['mock']` */
  binding: string
  /** the first argument's literal text, or `null` when it is not a string literal */
  target: string | null
}

function mockBindingSites(src: string): MockBindingSite[] {
  const sf = ts.createSourceFile('scan.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const aliases = new Set<string>()
  const sites: MockBindingSite[] = []
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier) || stmt.moduleSpecifier.text !== 'vitest') continue
    const clause = stmt.importClause
    if (clause === undefined) continue
    if (clause.name !== undefined) aliases.add(clause.name.text)
    const named = clause.namedBindings
    if (named !== undefined && ts.isNamespaceImport(named)) aliases.add(named.name.text)
    if (named !== undefined && ts.isNamedImports(named)) {
      for (const el of named.elements) {
        const imported = (el.propertyName ?? el.name).text
        if (imported === 'vi') aliases.add(el.name.text)
      }
    }
  }
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue
    for (const decl of stmt.declarationList.declarations) {
      if (decl.initializer !== undefined && ts.isIdentifier(decl.initializer) && aliases.has(decl.initializer.text) && ts.isIdentifier(decl.name)) {
        aliases.add(decl.name.text)
      }
    }
  }
  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      let binding: string | null = null
      if (ts.isPropertyAccessExpression(callee)) {
        if (callee.name.text === 'mock' && ts.isIdentifier(callee.expression) && aliases.has(callee.expression.text)) {
          binding = `${callee.expression.text}.mock`
        }
      } else if (ts.isElementAccessExpression(callee)) {
        const arg = callee.argumentExpression
        if (
          arg !== undefined &&
          ((ts.isStringLiteral(arg) && arg.text === 'mock') || (ts.isIdentifier(arg) && arg.text === 'mock')) &&
          ts.isIdentifier(callee.expression) &&
          aliases.has(callee.expression.text)
        ) {
          binding = `${callee.expression.text}['mock']`
        }
      }
      if (binding !== null) {
        const first = node.arguments[0]
        sites.push({ binding, target: first !== undefined && ts.isStringLiteral(first) ? first.text : null })
      }
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return sites
}

/** Every `tests/**\/*.test.ts` path in this repo. */
function listTestFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return listTestFiles(p)
    return e.name.endsWith('.test.ts') ? [p] : []
  })
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

  it('P-IM-3 — 4 OF THE FIFTEEN carry imports; 11 carry ZERO (5 of the directory’s 20, one a non-member) ⟨A-9: title and terms corrected — the assertion is unchanged⟩', () => {
    const withImports: string[] = []
    for (const name of PINNED_FIFTEEN) {
      if (importSpecifiers(requireShipped(name)).length > 0) withImports.push(name)
    }
    // ⟨CORRECTED 2026-09-28 per §3a `A-9` (`TEST-DEFECT`, MED) / §2.1 item 5’s
    // arithmetic block.⟩ The arithmetic is `4 + 11 = 15`, NOT `5 + 10 = 15`: the
    // directory’s five import-carrying files are `census` · `gutter-affordance` ·
    // `gutter` · `relocate` · `path-fork-cycle`, and `path-fork-cycle.ts` is a
    // NON-MEMBER (it is the out-of-set import §2.1 item 5 records and §2.2 records
    // under `nonMemberNotes`). So of the FIFTEEN-MODULE SET: **4 carry imports**
    // and **11 carry zero**. The `5`/`15` split is the DIRECTORY’s 20 files
    // (`5` with imports + `15` without), which is what §2.1 item 5 measures and
    // what the `FILES_WITH_IMPORTS` doc-comment above counts. The two scopes must
    // not be collapsed (`C-AM-4`).
    expect(withImports.length, 'exactly 4 of the fifteen carry any import statement').toBe(4)
    expect(PINNED_FIFTEEN.length - withImports.length, 'the other 11 of the fifteen carry ZERO import statements').toBe(11)
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

  it('§2.1 item 6 / §5 item 5 / §12.3(c) ⟨RE-STATED 2026-09-28, unit PD-UI-1 §9 item 1⟩ — the stem-collision hit set is STILL EXACTLY the three hits, and every VENDORED-RESOLVING hit is a DECLARED CONSUMER EDGE named per row', () => {
    // ⟨THE RE-STATEMENT, and why it is not a relaxation.⟩ As filed, this row asserted BOTH
    // (a) the exact sorted three-hit array of `src/**` consumer edges AND (b) that NO hit
    // resolves to a vendored member — a fact that is TRUE at the Phase-0 head and FALSE the
    // moment a `SUBSET+ADAPTER` unit’s adapter imports the vendored module it adopts. Unit
    // `PD-UI-1`’s adapter is that first consumer, and its import resolves to the vendored
    // `src/shared/theme.ts`, so both limbs red. The pin’s subject changed with a later unit’s
    // landing, so the pin is RE-STATED to the shape `unit-pd-ui-1-theme.md` §9 item 1 asks for:
    // the exact set of `(file, specifier)` pairs PLUS an explicit allow-list of consumer edges
    // (`DECLARED_CONSUMER_EDGES`, top of this file), and the assertion that every hit resolving
    // to a vendored member is a DECLARED edge — with an UN-listed vendored-resolving hit still
    // failing (the control row below proves it). The derivation is also EXTENDED (AST) so a
    // dynamic `import(...)`, a `require(...)` or a `new URL(...)` spelling of the same consumer
    // edge is CAUGHT rather than hidden behind — the rejected evasion route (§0A note 2; §3a
    // `ADV-T7`), whose remedy is this re-statement and never a spelling change.
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
    // LIMB 1 (kept, narrowed to its own subject): the THREE PHASE-0 STEM-COLLISION HITS are
    // unchanged as the pin recorded them — the `./theme.js` and `./pane-gutter.js` sites that
    // resolve to FORK modules. They are NOT on the allow-list, and they must NOT be: what makes
    // the `theme` collision by STEM and never by SPECIFIER (`C-7`) is exactly that
    // `./theme.js` from `src/renderer/` resolves to `src/renderer/theme.ts`.
    const stemCollisionHits = parsed
      .filter((h) => h.resolved === join(REPO_ROOT, 'src', 'renderer', 'theme.ts') || h.resolved === join(REPO_ROOT, 'src', 'renderer', 'pane-gutter.ts'))
      .map((h) => `${h.file} ${h.spec}`)
      .sort()
    expect(
      stemCollisionHits,
      '§2.1 item 6 MEASURES exactly three legitimate stem-collision hits: `./pane-gutter.js` ×2 (renderer.ts, sidebar-panes.ts) + `./theme.js` (renderer.ts) — the `C-7` collision',
    ).toEqual([
      'src/renderer/renderer.ts ./pane-gutter.js',
      'src/renderer/renderer.ts ./theme.js',
      'src/renderer/sidebar-panes.ts ./pane-gutter.js',
    ])
    // each of the three stem-collision hits resolves to a real FORK module under
    // `src/renderer/`, and it exists. (The `src/**`-wide derivation below carries the
    // VENDORED-resolving hits, which are a different subject: this limb is the collision’s.)
    const stemCollisionResolved = parsed
      .filter((h) => h.resolved === join(REPO_ROOT, 'src', 'renderer', 'theme.ts') || h.resolved === join(REPO_ROOT, 'src', 'renderer', 'pane-gutter.ts'))
      .map((h) => h.resolved)
    expect(stemCollisionResolved.length, 'the three stem-collision hits resolve to exactly two FORK modules (`theme.ts` once via renderer.ts, `pane-gutter.ts` twice)').toBe(3)
    expect(stemCollisionResolved.every((p) => /[/\\]src[/\\]renderer[/\\]/.test(p))).toBe(true)
    expect(stemCollisionResolved.every((p) => existsSync(p)), 'each stem-collision hit must resolve to a real fork module').toBe(true)

    // LIMB 2 (RE-STATED): every hit that RESOLVES to one of the pin’s fifteen members must be
    // a DECLARED CONSUMER EDGE, named per row with the vendored member it targets. The reading
    // is driven over the WHOLE `src/**` tree, not only the grep’s static-form hits, so the four
    // SHAPES the recorded pattern cannot see are caught rather than hidden behind.
    const declared = DECLARED_CONSUMER_EDGES.filter((d) => d.unit === 'PD-UI-1')
    expect(declared.length, 'the allow-list is not empty: a pin that would pass for ANY consumer is worthless (§9 item 1 item (b))').toBeGreaterThan(0)
    for (const d of DECLARED_CONSUMER_EDGES) {
      expect((PINNED_FIFTEEN as readonly string[]).includes(d.member), `the allow-list row ${d.file} ${d.specifier} must name one of the pin’s fifteen members as its target`).toBe(true)
    }
    // the DECLARED edge must be a REAL, statically-declared edge of the tree — never a row
    // that exists only on paper, and never one hidden behind a dynamic form.
    const allEdges = allSrcConsumerEdges()
    for (const d of DECLARED_CONSUMER_EDGES) {
      expect(existsSync(shippedPath(d.member)), `the vendored member \`${d.member}\` must exist at the pin’s path`).toBe(true)
      // a declared row is satisfied by whichever equivalent spelling the tree carries (§2.1's
      // resolution clause) — a row with NO edge behind it in ANY of its spellings is a
      // fabricated declaration and must fail.
      const spellings = DECLARED_CONSUMER_EDGES.filter((x) => x.file === d.file && x.member === d.member).map((x) => x.specifier)
      const matching = allEdges.filter((e) => e.file === d.file && spellings.includes(e.spec))
      // RED-FIRST (RCA-1): at the PRE-LANDING head the edge does not exist yet, so an EMPTY
      // reading is the declaration's red state — a LOUD one, naming the file and the member.
      // The reading is a real assertion of the tree, not a vacuous pass: it reds today and can
      // be taken only once the declared edge is really there.
      expect(
        matching.length,
        `RED (PD-UI-1 §9 item 1 / §2.1): the declared consumer edge \`${d.file} <${spellings.join('|')}>\` → \`${d.member}\` does not exist in the tree yet — a declaration with no edge behind it is a fabricated row, and the adopting unit’s adapter is the edge this allow-list exists to declare`,
      ).toBeGreaterThan(0)
      // a NON-EMPTY reading must be the static `from '…'` form, never one of the refused evasions.
      expect(
        matching.filter((e) => e.kind !== 'static-from').map((e) => `${e.spec} (${e.kind})`),
        `the declared consumer edge \`${d.file} <${spellings.join('|')}>\` must use the STATIC \`from '…'\` form — a \`await import(...)\`/\`require(...)\`/\`new URL(...)\` spelling would match no pattern in this pin and would hide the consumer edge it exists to declare (§0A note 2; §3a \`ADV-T7\`)`,
      ).toEqual([])
      expect(matching[0]!.member, `the declared edge must resolve to the vendored member the row names (\`${d.member}\`)`).toBe(d.member)
      expect(existsSync(matching[0]!.resolved), `the declared edge must resolve to a real file: ${relative(REPO_ROOT, matching[0]!.resolved)}`).toBe(true)
    }
    // …and NO hit outside the allow-list resolves to a vendored member: the two limbs stay
    // distinguishable, and this is the limb a fourth, un-declared adoption would red.
    expect(
      unlistedVendoredEdges(allEdges).map((e) => `${e.file} ${e.spec} (${e.kind}) → ${relative(REPO_ROOT, e.resolved)}`),
      '§2.1 item 6 / §5 item 5: a hit that resolves to a vendored member and is NOT on the declared consumer-edge allow-list STILL FAILS — an un-declared adoption cannot ride this pin green',
    ).toEqual([])
  })

  it('⟨RE-STATED 2026-09-28 — the NEGATIVE CONTROL the re-statement must carry⟩ an un-listed vendored-resolving edge FAILS the same oracle, and the four refused EVASION forms are CAUGHT by the extended derivation', () => {
    // The control exists because a pin that passes for ANY consumer is worthless. It is driven
    // through the SAME oracle the row above uses (`unlistedVendoredEdges`) and the SAME AST
    // derivation (`derivedConsumerEdges`) — never through a copy of either.
    const oracle = (edges: DerivedEdge[]): string[] => unlistedVendoredEdges(edges).map((e) => `${e.file} ${e.spec}`)

    // (1) the DECLARED edge passes: it is the one row on the allow-list.
    const declaredEdge = derivedConsumerEdges(`import { resolveTheme } from '../shared/theme.js'\n`, 'src/renderer/theme.ts')
    expect(declaredEdge.map((e) => e.member), 'the declared edge must be recognised as resolving to the vendored `theme` member').toEqual(['theme'])
    expect(oracle(declaredEdge), 'the DECLARED consumer edge must PASS the oracle — otherwise the allow-list is inert').toEqual([])

    // (2) a synthetic UN-LISTED, vendored-resolving edge FAILS. `src/renderer/other.ts`
    //     importing the vendored module is exactly the shape a fourth adoption would
    //     produce, and it is not on the list.
    const unListedSameSpelling = derivedConsumerEdges(`import { resolveTheme } from '../shared/theme.js'\n`, 'src/renderer/other.ts')
    expect(unListedSameSpelling.map((e) => e.member), 'the synthetic edge must really resolve to a vendored member, else the control proves nothing').toEqual(['theme'])
    expect(
      oracle(unListedSameSpelling),
      'AN UN-LISTED VENDORED-RESOLVING EDGE MUST FAIL — this is the discriminating control of the re-stated pin',
    ).toEqual(['src/renderer/other.ts ../shared/theme.js'])

    // (3) the SAME edge RE-SPELLED through one of the three refused evasion routes is ALSO an
    //     un-listed, vendored-resolving edge: the extended derivation CATCHES it, so the
    //     re-statement cannot be satisfied by hiding the consumer edge from the pin.
    const refusalForms: Array<{ form: string; source: string; kind: DerivedEdge['kind'] }> = [
      { form: 'a dynamic `import(...)`', source: `const later = () => import('../shared/theme.js')\n`, kind: 'dynamic-import' },
      { form: 'a `require(...)`', source: `const legacy = require('../shared/theme.js')\n`, kind: 'require' },
      { form: 'a `new URL(...)` indirection', source: `const p = new URL('../shared/theme.js', import.meta.url)\n`, kind: 'new-URL' },
      { form: 'a `pathToFileURL(...).href` indirection', source: `const p = pathToFileURL('../shared/theme.js').href\n`, kind: 'new-URL' },
    ]
    for (const f of refusalForms) {
      const hits = derivedConsumerEdges(f.source, 'src/renderer/other.ts')
      expect(hits.map((h) => h.kind), `${f.form} MUST be caught by the extended derivation (§9 item 1: the pin is EXTENDED to catch those forms rather than hide behind them)`).toEqual([f.kind])
      expect(hits.map((h) => h.member), `${f.form} must be recognised as resolving to the vendored member`).toEqual(['theme'])
      expect(oracle(hits), `${f.form} written from an UN-listed file MUST still fail — the evasion route is refused, never green`).toEqual(['src/renderer/other.ts ../shared/theme.js'])
    }

    // (4) the recorded single-line grep pattern is shown MISSING all four shapes — the proxy
    //     §3a `A-10` named — so this row’s extension is driven, not merely asserted.
    for (const f of refusalForms) {
      expect(
        staticTextDerivation(f.source),
        `the pin’s recorded \`from '…'\` pattern must be shown to MISS ${f.form} — that is WHY the derivation is extended`,
      ).toEqual([])
      expect(staticTextDerivation(`import { resolveTheme } from '../shared/theme.js'\n`), 'the recorded pattern must still catch the static form, else this control proves nothing').toEqual(['../shared/theme.js'])
    }

    // (5) the three stem-collision edges are NOT vendored-resolving, so they are outside this
    //     oracle’s subject and the allow-list must never grow to cover them (they are FORK
    //     modules — `C-7`).
    // `pane-gutter` is the OTHER stem collision and it is NOT one of the pin's fifteen — the
    // derivation must see NO vendored stem in it, which is exactly why its two hits are absent
    // from the allow-list and why `importCensus.outOfSetImports` stays EMPTY.
    expect(vendoredStemOf('./theme.js'), '`./theme.js` names the pin’s stem `theme`, so the derivation MUST see it').toBe('theme')
    expect(vendoredStemOf('./pane-gutter.js'), '`pane-gutter` is the stem collision’s OTHER side and is NOT one of the pin’s fifteen').toBeNull()
    const forkThemeEdge = derivedConsumerEdges(`import { applyThemeToRoot } from './theme.js'\n`, 'src/renderer/renderer.ts')
    expect(forkThemeEdge.map((e) => e.member), '`./theme.js` from `src/renderer/` resolves to the FORK module — never to a vendored member').toEqual([null])
    expect(oracle(forkThemeEdge), 'a stem-collision edge is not this oracle’s subject: it passes the VENDORED limb and is asserted by the pin’s own array limb').toEqual([])

    // (6) ⟨THE INTRA-VENDORED EXCLUSION, DRIVEN (`unit-pd-vendor-foundation-mechanisms.md` §9
    //     item 1).⟩ An edge whose SOURCE FILE is itself a vendored member is `P-IM-3`’s subject —
    //     the vendored set’s OWN internal wiring — and is NOT this consumer-edge pin’s. The
    //     exclusion must therefore NOT red the corrected oracle, while the consumer edge of (2)
    //     (a NON-member source) still does. Both limbs are driven through the SAME oracle.
    const intraVendored = derivedConsumerEdges(`import type { GestureHandle } from './gesture-session.js'\n`, 'src/shared/gutter.ts')
    expect(intraVendored.map((e) => e.member), 'the synthetic intra-vendored edge must REALLY resolve to a vendored member, else this limb proves nothing').toEqual(['gesture-session'])
    expect(
      isVendoredMemberFile('src/shared/gutter.ts'),
      'the exclusion must recognise a vendored member as a SOURCE file (the five recorded internal edges’ sources: census, gutter-affordance, gutter, relocate)',
    ).toBe(true)
    expect(
      isVendoredMemberFile('src/renderer/other.ts'),
      'and it must NOT swallow a CONSUMER source — otherwise the whole consumer-edge pin would pass for any adoption',
    ).toBe(false)
    expect(
      oracle(intraVendored),
      'AN INTRA-VENDORED EDGE IS NOT THIS ROW’S SUBJECT (§9 item 1): it is `P-IM-3`’s, and it must NOT red the corrected consumer-edge oracle',
    ).toEqual([])
    expect(
      oracle(unListedSameSpelling),
      '…while the SAME oracle STILL FAILS an un-listed CONSUMER edge (2), re-driven AFTER the exclusion: the correction discriminates on the SOURCE file, never on the target',
    ).toEqual(['src/renderer/other.ts ../shared/theme.js'])
    expect(
      oracle(derivedConsumerEdges(`import { POINTER_TYPES } from '../shared/gesture-session.js'\n`, 'src/renderer/other.ts')),
      'and an un-listed CONSUMER file importing the SAME member the intra-vendored edge targets MUST still fail — the exclusion is by source, not by member',
    ).toEqual(['src/renderer/other.ts ../shared/gesture-session.js'])
  })

})

// ===========================================================================
// §4 `P-SM-2` — the four baseline files are NOT replaced
// ===========================================================================

/** ⟨RE-STATED 2026-09-29 — unit `U-APP-HARNESS-READINESS` (this pass's date; that unit's spec is
 *  filed 2026-10-15, so the note carries the PASS date, never an invented one).⟩
 *
 *  WHY: a LATER, RECORDED unit legitimately moved ONE of the four baseline files —
 *  `src/shared/types.ts` gains the boot-install observable's channel constant
 *  (`U-APP-HARNESS-READINESS` §2.2 `B-1` item 4) — so this row's AS-FILED current-bytes limb
 *  (`now === the pre-vendoring blob`) now reads as a FALSE red against a byte-identity claim whose
 *  SUBJECT is a PAST ACT of the VENDORING: *that* pass did not replace these bytes.
 *
 *  WHAT IS KEPT, VERBATIM AND STILL DRIVEN (never relaxed):
 *   (1) THE VENDORING CLAIM, as the row filed it: the MANIFEST-RECORDED PRE-VENDORING BLOB still
 *       reads at the manifest's recorded revision with its RECORDED md5 — the SUPERSEDED pin value
 *       `303e63d28ec430920aebf0d4a8f3fd3f` stays VISIBLE below as a recorded, asserted value, so a
 *       history rewrite (or a moved recorded revision) still FAILS;
 *   (2) THE V-4 REGRESSION CLAIM itself, still LIVE for the re-stated file: the current bytes are
 *       still the FORK's file and NOT the foundation's blob at the manifest's recorded
 *       `foundation.commit` — a vendoring-style REPLACEMENT of the fork file by the foundation's
 *       copy FAILS here (the fork's `types.ts` and the foundation's differ: 888 vs 328 lines);
 *   (3) THE CURRENT-BYTES LIMB, RE-STATED ONLY: it now asserts the NEW RECORDED md5 of the current
 *       bytes, so an UNRECORDED move of `types.ts` still FAILS — a later pass may move the file only
 *       by re-stating it here.
 *  The other three baseline files are UNTOUCHED by this re-statement and keep the as-filed
 *  byte-identity + digest limbs exactly. */
const BASELINE_CURRENT_BYTES_RE_STATEMENTS: Record<string, { supersededPreVendoringMd5: string; restatedMd5: string }> = {
  types: { supersededPreVendoringMd5: '303e63d28ec430920aebf0d4a8f3fd3f', restatedMd5: 'ff8c0b9a7cfb2f37cc94c6b018c1f756' },
}

describe('§4 P-SM-2 — the four baseline files are NOT replaced, and no vendored member is a baseline file (strat:baseline-non-replacement)', () => {
  for (const name of BASELINE_FILES) {
    it(`P-SM-2 / V-4 ⟨A-7 retitled⟩ — src/shared/${name}.ts is BYTE-IDENTICAL to the MANIFEST-RECORDED PRE-VENDORING BLOB (a vendoring edit here is a REGRESSION) ⟨RE-STATED 2026-09-29 for \`types\` ONLY — unit U-APP-HARNESS-READINESS; the as-filed title and claim stand for the other three⟩`, () => {
      // ⟨CORRECTED 2026-09-28 per §3a `A-7` (`TEST-DEFECT`, MED).⟩ The title now says
      // what the row DRIVES: a byte comparison against the recorded pre-vendoring blob
      // of the manifest's RED-SET commit — not a claim about `dom-shim`/`types` being
      // "strictly larger" (that premise is asserted in its OWN row below), and not an
      // anchor on a mutable hard-coded SHA (the revision is read from the manifest at
      // run time; `cf19d4e` survives only as the recorded FALLBACK for a manifest that
      // predates the red-set commit, and its provenance is stated in the header).
      const revision = preVendoringRevision()
      expect(revision, 'the recorded pre-vendoring revision must be read, never invented').toMatch(/^[0-9a-f]{7,40}$/)
      const before = preVendoringBytes(`src/shared/${name}.ts`, revision)
      expect(before, `could not read the pre-vendoring bytes of src/shared/${name}.ts at ${revision}`).not.toBeNull()
      const now = readFileSync(join(REPO_ROOT, 'src', 'shared', `${name}.ts`), 'utf8')
      const restated = BASELINE_CURRENT_BYTES_RE_STATEMENTS[name]
      if (restated === undefined) {
        expect(now, `src/shared/${name}.ts was MODIFIED by the vendoring pass — V-4 is a REGRESSION, not a cleanup (R-3 clause (2))`).toBe(before)
        // the digest, not only the text, is compared — and it is the DIGEST the row
        // records, so a later reader sees the reading as a value
        expect(md5(now), `src/shared/${name}.ts: the md5 of the current bytes must equal the md5 of the recorded pre-vendoring blob`).toBe(md5(before!))
        return
      }
      // ⟨RE-STATED 2026-09-29 — unit `U-APP-HARNESS-READINESS`⟩ the file this unit legitimately moved:
      // the VENDORING claim (limb 1) and the V-4 REGRESSION claim (limb 2) are re-asserted over the
      // recorded values, and ONLY the current-bytes limb is re-stated to a NEW RECORDED digest.
      expect(
        md5(before!),
        `src/shared/${name}.ts: the VENDORING claim stays LIVE and UNRELAXED — the recorded pre-vendoring blob still reads at ${revision} as the RECORDED (SUPERSEDED) digest ${restated.supersededPreVendoringMd5}; a history rewrite fails here`,
      ).toBe(restated.supersededPreVendoringMd5)
      expect(
        md5(now),
        `src/shared/${name}.ts: ⟨RE-STATED 2026-09-29, unit U-APP-HARNESS-READINESS: the file gains the boot-install observable's channel constant; superseded current-bytes value ${restated.supersededPreVendoringMd5} (== the pre-vendoring blob's, the as-filed reading)⟩ the CURRENT bytes must equal the NEW RECORDED md5 — an UNRECORDED move of this file still FAILS this row`,
      ).toBe(restated.restatedMd5)
      // limb 2 — V-4's OWN regression, still live: the fork's file is NOT the foundation's copy.
      const m = loadManifest()
      const commit = (m?.foundation as Record<string, unknown> | undefined)?.commit
      expect(commit, 'the manifest records no `foundation.commit` — the V-4 replacement limb cannot be taken').toMatch(/^[0-9a-f]{40}$/)
      const blob = spawnSync('git', ['-C', FOUNDATION, 'show', `${String(commit)}:src/shared/${name}.ts`], { encoding: 'utf8' })
      expect(
        blob.status,
        `RED (PD-VENDOR §4 P-SM-2): the foundation's src/shared/${name}.ts could not be read at the manifest's recorded commit ${String(commit)} — ${(blob.stderr ?? '').trim()} — the V-4 REPLACEMENT limb would then be a record here rather than an instrument`,
      ).toBe(0)
      expect(
        md5(now),
        `src/shared/${name}.ts: the V-4 REGRESSION claim stays LIVE — the current bytes must still be the FORK's file and NOT the foundation's blob at ${String(commit)} (a vendoring-style REPLACEMENT fails here)`,
      ).not.toBe(md5(blob.stdout as string))
    })
  }

  it('⟨A-7 CORRECTION⟩ the divergence PREMISE is asserted, not just named in a title: the fork’s dom-shim / types / demo-envelope DIFFER from the pinned foundation blobs, and path-fork-cycle does not', () => {
    // §3.3 item 4's recorded reading (fork first, foundation second):
    // dom-shim 508 vs 238 · types 874 vs 328 · demo-envelope 131 vs 434 ·
    // path-fork-cycle 101 vs 101. The row asserts the RELATION (differ / do not
    // differ) and says why the single-line deltas are not asserted.
    const foundation = foundationSharedDir()
    const differs: string[] = []
    const identical: string[] = []
    for (const name of BASELINE_FILES) {
      const ourBytes = readFileSync(join(REPO_ROOT, 'src', 'shared', `${name}.ts`), 'utf8')
      const theirPath = join(foundation, `${name}.ts`)
      expect(existsSync(theirPath), `the foundation's ${name}.ts must exist at ${foundation} — the divergence reading has no meaning without it`).toBe(true)
      const theirBytes = readFileSync(theirPath, 'utf8')
      if (ourBytes === theirBytes) identical.push(name)
      else differs.push(name)
    }
    expect(differs.sort(), 'the three files the R-3 divergence records as DIFFERENT must really differ').toEqual(['demo-envelope', 'dom-shim', 'types'])
    expect(identical, 'and `path-fork-cycle.ts` does NOT differ (101 vs 101) — both readings are asserted, so the premise cannot be quoted without being driven').toEqual(['path-fork-cycle'])
  })

  it('⟨A-7 CORRECTION / A-3⟩ the manifest’s `foundation.commit` is CONSUMED: every vendored module equals the BLOB AT THE RECORDED COMMIT, and the adjacent working tree is not consulted', () => {
    // §3a `A-3`: "the manifest's `foundation.commit` must be actually consumed by
    // something". This is the read-only `git -C <foundation> show <commit>:<path>` arm
    // the finding authorises, run over the FIFTEEN VENDORED MODULES (the paths that
    // exist at the pinned commit — the four baseline files are FORK files and do not
    // exist in the foundation at all, so they are pinned by §3.3 item 4's recorded
    // values instead, in the rows above). It is deliberately independent of the
    // adjacent WORKING TREE, which is the arm `A-3` shows can move unnoticed.
    const manifest = requireManifest()
    const commit = String((manifest.foundation as Record<string, unknown>).commit)
    expect(commit, 'the manifest records no `foundation.commit`').toMatch(/^[0-9a-f]{40}$/)
    const r = spawnSync('git', ['-C', FOUNDATION, 'rev-parse', '--verify', `${commit}^{commit}`], { encoding: 'utf8' })
    if (r.status !== 0) {
      // the foundation tree is absent / not a repository: this row CANNOT be taken
      // (§2.3 honesty rule 1 — a SKIP is not a pass), so it fails loudly rather than
      // reporting a reading it did not take
      throw new Error(
        `RED (PD-VENDOR §3a A-7/A-3): the recorded commit ${commit} could not be read from ${FOUNDATION} — ${(r.stderr ?? '').trim()} — the commit would then be a RECORD here rather than an instrument; run this row where the foundation tree is present`,
      )
    }
    const mismatches: string[] = []
    for (const name of PINNED_FIFTEEN) {
      const rel = `src/shared/${name}.ts`
      const blob = spawnSync('git', ['-C', FOUNDATION, 'show', `${commit}:${rel}`], { encoding: 'utf8' })
      if (blob.status !== 0) {
        mismatches.push(`${rel}: not present at the recorded commit ${commit}`)
        continue
      }
      const current = readFileSync(join(REPO_ROOT, rel))
      if (!current.equals(Buffer.from(blob.stdout as string))) mismatches.push(`${rel}: the local bytes differ from the blob at the recorded commit ${commit}`)
    }
    expect(
      mismatches,
      'every vendored module must equal the blob at the manifest’s recorded `foundation.commit` — a comparison against the adjacent WORKING TREE is exactly the arm §3a `A-3` shows to be evadable',
    ).toEqual([])
  })

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

  it('⟨A-7 retitled⟩ P-SM-2 — the current baseline LINE COUNTS equal the MANIFEST-RECORDED values read beside the pin (the recorded values, never a hard-coded SHA) ⟨RE-STATED 2026-09-29 for `types` ONLY — unit U-APP-HARNESS-READINESS⟩', () => {
    // §3.3 item 4's recorded FORK-side line counts — dom-shim 508 · types 874 ·
    // demo-envelope 131 · path-fork-cycle 101 — are the `read` tool's total-line
    // figure, a CONVENTION this row must not re-invent: `demo-envelope.ts` carries no
    // trailing newline, so `split('\n').length` reads it 132 and a naive count would
    // report a false regression. THE ASSERTED FACT is therefore the RECORDED INVARIANT
    // and not the counting convention: the current line count equals the line count of
    // the MANIFEST-RECORDED pre-vendoring BLOB (read at the manifest's recorded
    // revision), and each file's own recorded figure is carried as a documented
    // reading. The byte-identity row above is the stronger, convention-free assertion.
    const recordedForkLineCounts: Record<string, number> = { 'dom-shim': 508, types: 874, 'demo-envelope': 131, 'path-fork-cycle': 101 }
    const lineCount = (text: string): number => text.split('\n').length
    // ⟨RE-STATED 2026-09-29 — unit `U-APP-HARNESS-READINESS` (the unit's spec is filed 2026-10-15;
    //  this note carries the PASS date).⟩ `src/shared/types.ts` legitimately gains the boot-install
    //  observable's channel constant, so its line count moves +14 (as filed `read` 874 → now 888;
    //  this row's `split('\n').length` convention reads it 875 → 889). The SUPERSEDED VALUES STAY
    //  VISIBLE (`recordedForkLineCounts` above and `supersededPreVendoring` below, both still
    //  ASSERTED against the pre-vendoring blob), and the CURRENT count is re-recorded — an
    //  UNRECORDED move of `types.ts` still FAILS, the file being then neither 889 nor 875.
    //  The other three baseline files keep the as-filed invariant limb exactly.
    const restatedLineCounts: Record<string, { supersededPreVendoring: number; restatedCurrent: number }> = {
      types: { supersededPreVendoring: 875, restatedCurrent: 889 },
    }
    const revision = preVendoringRevision()
    const problems: string[] = []
    for (const name of BASELINE_FILES) {
      const nowText = readFileSync(join(REPO_ROOT, 'src', 'shared', `${name}.ts`), 'utf8')
      const preText = preVendoringBytes(`src/shared/${name}.ts`, revision)!
      const restated = restatedLineCounts[name]
      if (restated === undefined) {
        if (lineCount(nowText) !== lineCount(preText)) {
          problems.push(`${name}.ts: the line count moved against the recorded pre-vendoring blob at ${revision} (recorded fork figure: ${recordedForkLineCounts[name]})`)
        }
        continue
      }
      if (lineCount(preText) !== restated.supersededPreVendoring) {
        problems.push(
          `${name}.ts: the RECORDED PRE-VENDORING line count moved (recorded ${restated.supersededPreVendoring} in this row's convention, read ${lineCount(preText)} at ${revision}) — the historical claim is not relaxed, it is asserted`,
        )
      }
      if (lineCount(nowText) !== restated.restatedCurrent) {
        problems.push(
          `${name}.ts: ⟨RE-STATED 2026-09-29, unit U-APP-HARNESS-READINESS: the superseded reading was 875 (this row's convention) / 874 (\`read\`), the as-filed \`now === pre-vendoring\` limb⟩ the CURRENT line count must equal the NEW RECORDED value ${restated.restatedCurrent} — an UNRECORDED move of this file still fails`,
        )
      }
    }
    expect(problems, 'the fork-side line counts are RECORDED values (§3.3 item 4) and a vendoring edit must not move them').toEqual([])
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

// ===========================================================================
// §3a `A-10` — THE CLOSURE ORACLE IS AST-BASED (HOST-FIX; RED at HEAD).
// THE NEGATIVE GENERATOR §3a’s PBT audit TASKED (i): a generator over synthetic
// IMPORT-STATEMENT SHAPES. The single-line regex the landed row uses misses a
// bare side-effect import, a MULTI-LINE statement, a dynamic `import(…)` and a
// `require(…)` — §3a’s prose counterexample (a) — so `P-IM-3`’s closure claim is
// asserted by a PROXY. The row is RED until the monitor derives the import set
// with the `typescript` devDependency (AST `ImportDeclaration` /
// `ImportExpression` / a `require` `CallExpression`).
// ===========================================================================
describe('§3a A-10 — the import-closure oracle is AST-based, over every statement SHAPE (negative generator i; RED at HEAD by design)', () => {
  /** The synthetic SHAPES. Each targets one of the pin’s fifteen, so the closure
   *  oracle must see it; `./dom-shim.js` is the OUT-OF-SET control. */
  const SHAPES: Array<{ shape: string; source: string; expectedSpecifier: string }> = [
    { shape: 'a BARE side-effect import', source: `import './zones.js'\n`, expectedSpecifier: './zones.js' },
    {
      shape: 'a MULTI-LINE `import type { … } from`',
      source: `import type {\n  TrackSpec,\n  ZoneId,\n} from '../zones.js'\n`,
      expectedSpecifier: '../zones.js',
    },
    { shape: 'a DYNAMIC `import(…)`', source: `const later = () => import('./census.js')\n`, expectedSpecifier: './census.js' },
    { shape: 'a `require(…)`', source: `const legacy = require('./theme.js')\n`, expectedSpecifier: './theme.js' },
  ]

  it('⟨A-10 CORRECTION⟩ the single-line REGEX is shown missing all four SHAPES — the proxy §3a’s prose counterexample names', () => {
    const missed = SHAPES.filter((s) => !regexImportSpecifiers(s.source).includes(s.expectedSpecifier)).map((s) => s.shape)
    expect(
      missed,
      'the landed oracle is a single-line regex: it must be shown to MISS the bare, multi-line, dynamic and `require` forms (this is the control that makes the row below non-vacuous)',
    ).toEqual(['a BARE side-effect import', 'a MULTI-LINE `import type { … } from`', 'a DYNAMIC `import(…)`', 'a `require(…)`'])
    // …and the regex is not vacuous: it DOES catch the plain single-line form
    expect(regexImportSpecifiers(`import { isEmpty } from './zones.js'\n`), 'the regex must still catch the plain form, else this control proves nothing').toContain('./zones.js')
  })

  it('⟨A-10 CORRECTION⟩ a generator over the four SHAPES: the monitor’s AST oracle detects EVERY one (RED until the monitor exports it)', async () => {
    const oracle = await loadImportSpecifiersOracle()
    expect(
      typeof oracle,
      'RED (PD-VENDOR §3a `A-10` / §2.2 rule 8): the monitor must EXPORT its AST-based `importSpecifiers(text)` so the closure oracle is a driven function rather than a single-line regex. §3a’s disposition is `HOST-FIX`: derive the import set with the `typescript` devDependency already used by `P-SM-1`',
    ).toBe('function')
    const missedByOracle = SHAPES.filter((s) => !oracle(s.source).includes(s.expectedSpecifier)).map((s) => s.shape)
    expect(missedByOracle, 'the AST oracle must detect ALL FOUR forms — bare · multi-line · dynamic · `require`').toEqual([])
    for (const s of SHAPES) {
      const spec = oracle(s.source)[0]!
      const internal = /\.\.?\/?([a-z-]+)\.js$/.exec(spec)
      expect(internal, `${s.shape}: the oracle must yield a specifier the closure rule can resolve, got ${spec}`).not.toBeNull()
    }
    // the CONTROL, the other way: an out-of-set specifier must be YIELDED (so the
    // closure rule can then refuse it) and a construct inside a STRING must not be.
    const outOfSet = oracle(`import type { X } from './dom-shim.js'\n`)
    expect(outOfSet, 'an out-of-set specifier must still be YIELDED by the oracle — the closure rule, not the extractor, is what refuses it').toContain('./dom-shim.js')
    expect(
      oracle(`const fixture = "import { X } from './zones.js'"\n`),
      'a construct inside a string literal must NOT be yielded — an AST oracle is not a text scan',
    ).toEqual([])
  })
})

// ===========================================================================
// §3a `A-12` — THE `'electron'`-MOCK PROHIBITION IS EVADABLE BY AN ALIASED OR
// COMPUTED CALL (TEST-DEFECT; the frozen pin is NOT edited — that is an
// ARCHITECT escalation, §3b). This row flags any BINDING of the vitest mock API
// in `tests/**` by any access form.
// ===========================================================================
describe('§3a A-12 — no test file binds the vitest mock API (aliased or computed forms included)', () => {
  it('⟨A-12 CORRECTION⟩ every `vi.mock` / `vi[\'mock\']` / aliased BINDING in tests/** is flagged; the control discriminates', () => {
    // the control, driven on SYNTHETIC texts — never by writing a file into tests/**
    const syntheticDirect = `import { vi } from 'vitest'\nvi.mock('electron', () => ({}))\n`
    const syntheticAliased = `import { vi as v } from 'vitest'\nv.mock('electron', () => ({}))\n`
    const syntheticComputed = `import * as vitest from 'vitest'\nvitest['mock']('electron', () => ({}))\n`
    const syntheticLocalAlias = `import { vi } from 'vitest'\nconst m = vi\nm.mock('electron', () => ({}))\n`
    const syntheticFixture = `const fixture = "vi.mock('electron', () => ({}))"\n`
    const bindings = (text: string): string[] => mockBindingSites(text).map((s) => s.binding)
    expect(bindings(syntheticDirect), 'the direct form must be flagged').toContain('vi.mock')
    expect(bindings(syntheticAliased), 'an ALIASED import binding must be flagged — §3a `A-12`: the census matches `callee === \'vi.mock\'` on the literal `vi`, so this form joins nothing today').toContain('v.mock')
    expect(bindings(syntheticComputed), 'a COMPUTED access must be flagged').toContain("vitest['mock']")
    expect(bindings(syntheticLocalAlias), 'a LOCAL alias of the binding must be flagged').toContain('m.mock')
    expect(bindings(syntheticFixture), 'a construct inside a string fixture must NOT be flagged').toEqual([])
    expect(
      mockBindingSites(syntheticAliased).map((s) => s.target),
      'the row reads the mock TARGET too, so an aliased `\'electron\'` mock can be named as such',
    ).toEqual(['electron'])

    // THE REAL READING — three facts, so a legitimate non-`'electron'` mock in the
    // wider suite is not miscounted as an evasion of THIS prohibition:
    const testFiles = listTestFiles(join(REPO_ROOT, 'tests'))
    const rel = (f: string): string => relative(REPO_ROOT, f).split('\\').join('/')
    const electronBinders = testFiles.filter((f) => mockBindingSites(readFileSync(f, 'utf8')).some((s) => s.target === 'electron')).map(rel).sort()
    // (1) every `'electron'` mock in the tree, in ANY access form, is one of the
    //     protected five — an aliased sixth form would be the evasion §3a names.
    expect(
      electronBinders,
      'the set of test files that mock `\'electron\'` — by `vi.mock`, `vi[\'mock\']` or an alias — must still be EXACTLY the five protected census names; a sixth (in any form) reds the protected census, and an aliased form evades the census’s own derivation (§3a `A-12`)',
    ).toEqual([
      'tests/template-adversarial.test.ts',
      'tests/unit-live11-bridge-seams.test.ts',
      'tests/unit-u5-rich-commit-ipc.test.ts',
      'tests/unit-v5-bridge-capture.test.ts',
      'tests/unit-wave-1-bridge-wiring.test.ts',
    ])
    // (2) every file that binds the mock API AT ALL is NAMED here, so a later pass
    //     can see the evasion surface rather than a count (§3a `A-12`).
    const allBinders = testFiles.filter((f) => mockBindingSites(readFileSync(f, 'utf8')).length > 0).map(rel).sort()
    expect(
      allBinders.length,
      'the mock-binding census is EMPTY — a prohibition that scans nothing is not evidence',
    ).toBeGreaterThan(0)
    expect(
      allBinders.filter((f) => !electronBinders.includes(f)),
      'these files bind the mock API for a NON-`\'electron\'` module — recorded as the named evasion surface (the prohibition is scoped to `\'electron\'`: §2.4 item 1 / `R-4` / `X-9`)',
    ).toEqual(['tests/blind-unit-shell-integration-greens.test.ts', 'tests/props-shell-integration.test.ts', 'tests/unit-import-batch-persist-contract.test.ts', 'tests/vector-cache.test.ts'])
    // (3) none of THIS unit’s three files binds the mock API in any form.
    expect(
      allBinders.filter((f) => /pd-vendor/.test(f)),
      'none of this unit’s three test files may bind the mock API in any form',
    ).toEqual([])
  })
})
