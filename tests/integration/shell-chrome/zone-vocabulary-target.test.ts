// tests/integration/shell-chrome/zone-vocabulary-target.test.ts — unit `U-1a` `zone-vocabulary`'s
// OWN ROW, authored BEFORE any byte of the rename moves (RCA-1) and RUN at the pre-edit head.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-u-1a-zone-vocabulary.md` §3, AS AMENDED BY
// `strata/decisions.md` D-22 — the seven limbs `A`, `B`, `C`, `E`, `E2`, `F`, `G`, and NOTHING
// ELSE. There is **no migration limb and no v1 fixture**: D-22 (2) refuses the persisted-slice
// migration, so `LAYOUT_VERSION` stays `1` and the silent relocation is `docs/defects.md`'s
// `ZONE-RENAME-SILENTLY-RELOCATES-PERSISTED-PLACEMENTS` (ACCEPTED), never a fixture here. A row
// asserting a migration would be asserting a decision the owner refused.
//
// THE TARGET STATE these rows assert (D-14 + D-16; `ASM-U1a-1`/`ASM-U1a-3`/`ASM-U1a-5`):
//   · `LayoutZoneName` = `'top' | 'bottom' | 'left' | 'right'`, and `isLayoutZoneName` is true
//     exactly for those four (`A`);
//   · `LAYOUT_PANE_ZONES` re-grained BY POSITION — `['left','right','top','bottom']`, i.e.
//     header→top and footer→bottom in place, so the payload order keeps its meaning (`B`);
//   · the authored carrier attribute is `zone=` (`data-zone` is GONE, no alias, `ASM-U1a-3`); the
//     four zone containers carry `props.zone === <name>` with `props.id === 'zone:<name>'`, and
//     the four gutter affordances carry `zone` + `data-axis` (`C`);
//   · the source corpus spells the closed four and no old token (`E`); the four D-17-granted spec
//     files and the zone register keep step with it (`E2`); the live driver's `UF-LAYOUT-2` block
//     carries the literal container-id limb change-analysis §2.5 requires (`F`); the track/size
//     token families rename (`G`).
//
// LAYER (MANDATORY, `D-10` / `RCA-12`): every limb here is `[T]`/ENVELOPE-class. The assembly in
// `C` is the fork's real assembler (`assembleAppGraphEnvelope`) under the LAYOUT-LESS DOM shim —
// no grid, no paint, no window. This row therefore proves the AUTHORED MODEL of the zone
// vocabulary and the SOURCE VOCABULARY the app is authored in; it NEVER proves the painted app.
// The paint rows (the zone boxes, the ids `list_targets` returns, the grid areas on a running
// window) are `G8`'s — `node scripts/live-drive.mjs` on a usable display — and this suite cannot
// see them.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`; it writes
// nothing. Every path is derived from THIS FILE's own location (`ROOT`), so a missing substrate
// FAILS (ENOENT) instead of skipping, and each census carries a non-vacuity guard (a file-count
// floor, or a floor on the target spellings) so no negative limb can pass by being blind.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  LAYOUT_PANE_ZONES,
  defaultLayout,
  isLayoutZoneName,
  zoneTrackVars,
} from '../../../src/renderer/layout-state.js'
import { layoutCssVars } from '../../../src/renderer/layout-vars.js'
import { assembleAppGraphEnvelope } from '../../../src/renderer/pane-graph.js'
import { createPaneRegistry } from '../../../src/renderer/pane-registry.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

/** The closed domain, in the foundation's order (`DECLARED_ZONE_IDS`). The DOMAIN is a set, so
 *  every comparison over it sorts; the payload ORDER is limb `B`'s subject alone. */
const CLOSED_ZONES = ['top', 'bottom', 'left', 'right'] as const
/** `ASM-U1a-1` — the enumeration is re-grained BY POSITION: `header→top`, `footer→bottom`. */
const PAYLOAD_ORDER = ['left', 'right', 'top', 'bottom'] as const

/** The ONE file a `data-zone` census may skip, and WHY (stated in the limb that uses it):
 *  `src/shared/dom-shim.ts` DOCUMENTS the generic selector syntax its parser accepts — `[data-zone]`
 *  is a SYNTAX EXAMPLE there, not a carrier the app authors — and the file is md5-pinned outside
 *  this unit's write scope (`tests/pd-ui-1-theme-register.test.ts`). */
const DATA_ZONE_ALLOWED_FILE = 'src/shared/dom-shim.ts'

const SRC_ROOT = `${ROOT}src`
const WALKABLE = /\.(ts|tsx|mts|cts|js|mjs|cjs|html|css)$/

function walkFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) out.push(...walkFiles(path))
    else if (WALKABLE.test(entry.name)) out.push(path)
  }
  return out
}

interface Reading {
  file: string
  line: number
  text: string
}

/** Every LINE of every walked file matching `pattern`, with the repo-relative file, the 1-based
 *  line number and the trimmed source — the reading a failure message prints, so a red is
 *  diagnosable without re-running the grep by hand. */
function readings(paths: readonly string[], pattern: RegExp): Reading[] {
  const global = new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`)
  const out: Reading[] = []
  for (const path of paths) {
    const file = relative(ROOT, path)
    const lines = readText(file).split('\n')
    for (let index = 0; index < lines.length; index++) {
      const text = lines[index]!
      global.lastIndex = 0
      if (global.test(text)) out.push({ file, line: index + 1, text: text.trim().slice(0, 180) })
    }
  }
  return out
}

/** The TOTAL occurrence count of `pattern` over the walked files (a line may carry more than one),
 *  with the per-file breakdown the failure message can quote. */
function counts(paths: readonly string[], pattern: RegExp): { total: number; byFile: Record<string, number> } {
  const global = new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`)
  const byFile: Record<string, number> = {}
  let total = 0
  for (const path of paths) {
    const file = relative(ROOT, path)
    const matches = [...readText(file).matchAll(global)].length
    if (matches > 0) byFile[file] = matches
    total += matches
  }
  return { total, byFile }
}

/** `file:line: text` for the first line of `relativePath` matching `pattern` — the SOURCE reading a
 *  limb quotes beside its value reading, so a red names the declaration and not only the diff. */
function sourceReading(relativePath: string, pattern: RegExp): string {
  const lines = readText(relativePath).split('\n')
  for (let index = 0; index < lines.length; index++) {
    if (pattern.test(lines[index]!)) return `${relativePath}:${index + 1}: ${lines[index]!.trim()}`
  }
  return `${relativePath}: NO LINE MATCHES ${String(pattern)}`
}

/** One line per offender, capped, with the overflow counted rather than truncated silently. */
function format(rs: Reading[]): string {
  if (rs.length === 0) return '0'
  const head = rs
    .slice(0, 6)
    .map((r) => `${r.file}:${r.line}: ${r.text}`)
    .join(' | ')
  return `${rs.length}: ${head}${rs.length > 6 ? ` | … (${rs.length - 6} more)` : ''}`
}

const SRC_FILES = walkFiles(SRC_ROOT)

// ---------------------------------------------------------------------------
// THE ASSEMBLED-ENVELOPE DRIVE (`C`) — the SAME call shape the zone register's own authoring-site
// drive uses (`tests/unit-zone-replacement-register.test.ts:1091-1121`): the fork's REAL assembler
// over a minimal traversal envelope, with a registry carrying ONE enabled `app-graph` pane so the
// assembly is a real one rather than a simulation. No new harness is invented here.
// ---------------------------------------------------------------------------

interface AssembledNode {
  props?: Record<string, unknown>
  children?: unknown[]
}

/** Every node of an assembled envelope, depth-first in authoring order — the template root's own
 *  children AND every content payload's roots, so "no node ANYWHERE carries `data-zone`" is a
 *  whole-envelope statement rather than a root-children scan. `props`/`css`/`placement`/`handlers`
 *  are data, never subtrees, and are not walked. */
function envelopeNodes(envelope: unknown): AssembledNode[] {
  const out: AssembledNode[] = []
  const walk = (value: unknown): void => {
    if (value == null || typeof value !== 'object') return
    if (Array.isArray(value)) {
      for (const entry of value) walk(entry)
      return
    }
    const holder = value as Record<string, unknown>
    const node = holder as AssembledNode
    if (node.props != null || node.children != null) out.push(node)
    for (const [key, child] of Object.entries(holder)) {
      if (key === 'props' || key === 'css' || key === 'placement' || key === 'handlers') continue
      walk(child)
    }
  }
  walk(envelope)
  return out
}

function assembledEnvelopeNodes(): AssembledNode[] {
  const registry = createPaneRegistry()
  registry.register({
    id: 'zone-vocabulary-probe',
    title: 'Zone vocabulary probe',
    scope: 'app-graph',
    defaultZone: 'left',
    render: () => ({ type: 'div', props: { id: 'zone-vocabulary-probe' } }),
  })
  registry.enable('zone-vocabulary-probe')
  const traversalEnvelope = {
    template: { root: { type: 'div', props: { id: 'wiki-root' }, children: [] } },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
  const ctx = {
    snapshot: null,
    docHeads: null,
    currentDocumentId: null,
    currentNodeId: null,
    backRefs: new Map<string, string[]>(),
    crosslinks: [],
  }
  const assembled = assembleAppGraphEnvelope({
    traversalEnvelope: traversalEnvelope as never,
    registry,
    ctx: ctx as never,
  })
  return envelopeNodes(assembled.envelope)
}

const propIdOf = (node: AssembledNode): string =>
  typeof node.props?.['id'] === 'string' ? (node.props['id'] as string) : ''

describe('U-1a zone vocabulary — the closed four, the `zone=` carrier, the `zone:` ids, the tokens', () => {
  it('A — `isLayoutZoneName` accepts exactly top/bottom/left/right and nothing else', () => {
    const accepted = CLOSED_ZONES.filter((zone) => isLayoutZoneName(zone))
    // The eight values contract §3 limb `A` names as MUST-REJECT: the two retired zone names, the
    // two REGIONS (W2-Q2), the legacy compound spelling, and four junk shapes.
    const rejects: unknown[] = ['header', 'footer', 'stage', 'top-bar', '', null, undefined, 1]
    const wronglyAccepted = rejects.filter((value) => isLayoutZoneName(value))
    const show = (values: readonly unknown[]): string =>
      values.map((value) => (value === undefined ? 'undefined' : JSON.stringify(value))).join(', ')
    expect(
      { accepted, wronglyAccepted },
      `the closed domain read: isLayoutZoneName ACCEPTED [${accepted.join(', ')}] of the closed four ` +
        `[${CLOSED_ZONES.join(', ')}] and WRONGLY ACCEPTED [${show(wronglyAccepted)}] of [${show(rejects)}]. ` +
        `READING: ${sourceReading('src/renderer/layout-state.ts', /export function isLayoutZoneName/)}. ` +
        `D-16 makes the domain 'top'|'bottom'|'left'|'right', so 'header'/'footer' must be REJECTED and ` +
        `'stage'/'top-bar' were never pane zones`,
    ).toEqual({ accepted: [...CLOSED_ZONES], wronglyAccepted: [] })
    // the declaration itself, so a red names the type and not only the predicate
    expect(
      sourceReading('src/renderer/layout-state.ts', /export type LayoutZoneName/),
      'the LayoutZoneName declaration must spell the closed four',
    ).toMatch(/LayoutZoneName = [^\n]*'top'[^\n]*'bottom'[^\n]*'left'[^\n]*'right'/)
  })

  it('B — `LAYOUT_PANE_ZONES` deep-equals [left, right, top, bottom], in that order (ASM-U1a-1)', () => {
    const reading = sourceReading('src/renderer/layout-state.ts', /export const LAYOUT_PANE_ZONES/)
    expect(
      [...LAYOUT_PANE_ZONES],
      `the payload enumeration reads [${LAYOUT_PANE_ZONES.join(', ')}], not [${PAYLOAD_ORDER.join(', ')}] — ` +
        `ASM-U1a-1 re-grains it BY POSITION (header→top, footer→bottom IN PLACE) so the assembler's payload ` +
        `order and every order-sensitive assertion keep their meaning. READING: ${reading}`,
    ).toEqual([...PAYLOAD_ORDER])
  })

  it('C — the assembled envelope carries zone=/zone:<name> and never a `data-zone` prop key', () => {
    const nodes = assembledEnvelopeNodes()
    const problems: string[] = []
    const containerIds = nodes.map(propIdOf).filter((id) => id.startsWith('zone:'))
    const dataZoneCarriers = nodes.filter((node) => node.props != null && 'data-zone' in node.props)
    // THE FOUR ZONE CONTAINERS (`C`): `props.zone === <name>` AND `props.id === 'zone:<name>'`.
    for (const zone of CLOSED_ZONES) {
      const container = nodes.find((node) => propIdOf(node) === `zone:${zone}`)
      if (container === undefined) {
        problems.push(`NO node carries props.id "zone:${zone}" (container ids read: [${containerIds.join(', ')}])`)
        continue
      }
      const carrier = container.props?.['zone']
      if (carrier !== zone) problems.push(`the container "zone:${zone}" carries props.zone ${JSON.stringify(carrier ?? null)}`)
    }
    // NO `data-zone` ANYWHERE — the carrier is `zone=`, no alias, no dual read (`ASM-U1a-3`).
    if (dataZoneCarriers.length > 0) {
      problems.push(
        `${dataZoneCarriers.length} node(s) still carry a \`data-zone\` prop key: [${dataZoneCarriers
          .map((node) => propIdOf(node) || '(no props.id)')
          .join(', ')}]`,
      )
    }
    // THE FOUR AUTHORED GUTTER AFFORDANCES: the nodes carrying BOTH a `zone` prop and a `data-axis`
    // prop, read as a closed set equal to the four enumerated members.
    const affordanceZones = nodes
      .filter((node) => typeof node.props?.['zone'] === 'string' && typeof node.props?.['data-axis'] === 'string')
      .map((node) => String(node.props?.['zone']))
      .sort()
    if (affordanceZones.join(',') !== [...CLOSED_ZONES].sort().join(',')) {
      problems.push(
        `the affordances carrying BOTH a \`zone\` prop and a \`data-axis\` prop read [${affordanceZones.join(', ')}] ` +
          `(${affordanceZones.length}), not the closed four`,
      )
    }
    expect(
      problems,
      `the assembled envelope (the fork's own assembleAppGraphEnvelope, ${nodes.length} nodes walked) read: ` +
        `container ids [${containerIds.join(', ')}]; \`data-zone\` prop carriers ${dataZoneCarriers.length}; ` +
        `\`zone\`+data-axis affordance zones [${affordanceZones.join(', ')}]; ${problems.length} problem(s). ` +
        `LAYER: the layout-less shim's assembly (D-10 / RCA-12) — the authored model, never the paint`,
    ).toEqual([])
  })

  it('E — the source census: no old token under src/** + index.html, and the target spellings PRESENT', () => {
    // non-vacuity floor: a shallow or empty walk cannot satisfy any negative below.
    expect(
      SRC_FILES.length,
      `the census walked ${SRC_FILES.length} file(s) under src/ — a corpus that small cannot carry the shell`,
    ).toBeGreaterThan(30)

    const dataZone = readings(SRC_FILES, /data-zone/).filter((reading) => reading.file !== DATA_ZONE_ALLOWED_FILE)
    const headerFooterToken = readings(SRC_FILES, /--zone-(?:header|footer)-/)
    const zoneIdLiteral = readings(SRC_FILES, /zone:(?:header|footer)/)
    const zoneNameLiteral = readings(SRC_FILES, /'(?:header|footer)'|"(?:header|footer)"/)
    // (v) THE GRID AREA NAMES (`ASM-U1a-5`): the areas move with the zones, so a `grid-area: header`
    // left behind is the two-vocabularies tree D-14 forbids, in the file that cannot be typechecked.
    const indexHtml = `${SRC_ROOT}/renderer/index.html`
    const areaNames = readings([indexHtml], /grid-area:\s*(?:header|footer)\b/)
    const areaDecl = /grid-template-areas:([\s\S]*?);/.exec(readText(relative(ROOT, indexHtml)))
    const areaTokens =
      areaDecl === null
        ? []
        : [...areaDecl[1]!.matchAll(/[A-Za-z][A-Za-z-]*/g)]
            .map((match) => match[0])
            .filter((token) => token === 'header' || token === 'footer')

    expect(
      {
        dataZone: dataZone.length,
        headerFooterToken: headerFooterToken.length,
        zoneIdLiteral: zoneIdLiteral.length,
        zoneNameLiteral: zoneNameLiteral.length,
        areaNames: areaNames.length,
        areaTemplateNames: areaTokens.length,
      },
      `the source census over ${SRC_FILES.length} file(s) read — (i) \`data-zone\` ${format(dataZone)} ` +
        `[NAMED EXCEPTION: occurrences INSIDE ${DATA_ZONE_ALLOWED_FILE} are ALLOWED and are NOT counted here — ` +
        `that file documents the generic selector syntax its parser accepts and is md5-pinned OUTSIDE this ` +
        `unit's write scope]; (ii) \`--zone-header-*\`/\`--zone-footer-*\` ${format(headerFooterToken)}; ` +
        `(iii) the \`zone:header\`/\`zone:footer\` literal ${format(zoneIdLiteral)}; (iv) a \`'header'\`/\`'footer'\` ` +
        `zone literal ${format(zoneNameLiteral)}; (v) a grid AREA named header/footer (ASM-U1a-5): ` +
        `${format(areaNames)}${areaTokens.length === 0 ? '' : `, grid-template-areas names [${areaTokens.join(', ')}]`}. ` +
        `D-14/D-16 forbid the tree reading two vocabularies`,
    ).toEqual({
      dataZone: 0,
      headerFooterToken: 0,
      zoneIdLiteral: 0,
      zoneNameLiteral: 0,
      areaNames: 0,
      areaTemplateNames: 0,
    })

    // THE OTHER HALF — the TARGET spellings must be PRESENT, per family, with a non-zero count: a
    // limb that only FORBIDS the old spelling passes just as well on a tree carrying no vocabulary
    // at all, and that blindness is what this half removes.
    const targets: Array<{ label: string; pattern: RegExp; floor: number }> = [
      { label: 'the `[zone=]`/`[zone]` carrier selector', pattern: /\[zone[=\]]/, floor: 2 },
      { label: 'the `zone:top` id literal', pattern: /zone:top/, floor: 1 },
      { label: 'the `zone:bottom` id literal', pattern: /zone:bottom/, floor: 1 },
      { label: 'the `--zone-top-track` token', pattern: /--zone-top-track/, floor: 1 },
      { label: 'the `--zone-top-size` token', pattern: /--zone-top-size/, floor: 1 },
    ]
    const measured = targets.map((target) => ({ ...target, reading: counts(SRC_FILES, target.pattern) }))
    const missing = measured.filter((entry) => entry.reading.total < entry.floor)
    expect(
      missing.map((entry) => `${entry.label}: read ${entry.reading.total}, floor ${entry.floor}`),
      `the TARGET spellings are MISSING from the source census (${SRC_FILES.length} file(s) walked): ` +
        `${missing.map((entry) => `${entry.label} read ${entry.reading.total} < floor ${entry.floor}`).join('; ')} — ` +
        `the landed vocabulary must be PRESENT, not merely free of the old one. Measured: ` +
        `${measured.map((entry) => `${entry.label}=${entry.reading.total}`).join(', ')}`,
    ).toEqual([])
  })

  it('E2 — the four D-17-granted spec files + the zone register keep step with the same census', () => {
    const specFiles = [
      'docs/specs/unit-u-shell-1-layout-zones.md',
      'docs/specs/unit-zone-replacement.md',
      'docs/specs/unit-zone-replacement-greens.md',
      'docs/specs/user-flow-audit-checklist.md',
    ]
    const testFiles = ['tests/unit-zone-replacement-register.test.ts']
    const walked = [...specFiles, ...testFiles].map((relativePath) => `${ROOT}${relativePath}`)
    // THE FLOOR, MADE FALSIFIABLE (⟨adversarial finding⟩: an array compared against its OWN
    // length can never fail, so the as-authored guard certified nothing). Two real guards:
    // every named file must EXIST and be non-empty, and every census PATTERN must match a
    // planted pre-rename sample — a pattern that cannot see the old spelling cannot certify
    // its absence, and a missing file reds here instead of shrinking the census silently.
    for (const relativePath of [...specFiles, ...testFiles]) {
      const text = readText(relativePath)
      expect(
        text.length,
        `${relativePath} is EMPTY (or absent) — the E2 census would have no subject and a ` +
          `negative limb over it would pass with nothing read`,
      ).toBeGreaterThan(500)
    }
    const PLANTED_PRE_RENAME =
      '--zone-header-track zone:header zone: \'header\' data-zone="left" --zone-footer-size zone:footer'
    for (const [label, pattern] of [
      ['the `--zone-<row>-` token pattern', /--zone-(?:header|footer)-/],
      ['the `zone:<row>` id pattern', /zone:(?:header|footer)/],
      ['the zone-NAME literal pattern', /zone:\s*['"](?:header|footer)['"]/],
      ['the `data-zone` attribute pattern', /data-zone/],
    ] as ReadonlyArray<[string, RegExp]>) {
      expect(
        pattern.test(PLANTED_PRE_RENAME),
        `${label} cannot match a planted pre-rename sample (${PLANTED_PRE_RENAME}) — a census ` +
          `that cannot see the old spelling cannot certify its absence`,
      ).toBe(true)
    }

    const tokenOffences = readings(walked, /--zone-(?:header|footer)-/)
    const idOffences = readings(walked, /zone:(?:header|footer)/)
    const nameOffences = readings(walked, /zone:\s*['"](?:header|footer)['"]/)
    // THE `data-zone` ATTRIBUTE is forbidden in the SPEC files ONLY: in the TEST files the prose
    // word is ALLOWED — it is the superseded spelling being LABELLED beside its replacement
    // (`RCA-8(c)` annotate-beside) — so scanning a test file for it would forbid the very record
    // this rename owes.
    const attributeOffences = readings(
      specFiles.map((relativePath) => `${ROOT}${relativePath}`),
      /data-zone/,
    )

    expect(
      {
        tokenOffences: tokenOffences.length,
        idOffences: idOffences.length,
        nameOffences: nameOffences.length,
        attributeOffences: attributeOffences.length,
      },
      `the D-17-granted corpus census read (${walked.length} file(s) walked: 4 spec + 1 register) — ` +
        `\`--zone-header|-footer-\` ${format(tokenOffences)}; \`zone:header|zone:footer\` ${format(idOffences)}; ` +
        `\`zone: 'header'|'footer'\` ${format(nameOffences)}; \`data-zone\` in the SPEC files ` +
        `${format(attributeOffences)}. A granted cell left spelling the old vocabulary goes stale inside the ` +
        `commit D-14/D-16 require to carry ONE vocabulary`,
    ).toEqual({ tokenOffences: 0, idOffences: 0, nameOffences: 0, attributeOffences: 0 })
  })

  it('F — the driver carries the target ids and UF-LAYOUT-2 carries the LITERAL container-id limb', () => {
    const driver = readText('scripts/live-drive.mjs')
    expect(
      driver.length,
      'scripts/live-drive.mjs is empty — the driver census has no subject',
    ).toBeGreaterThan(100_000)

    // (i)-(iii) the driver's own vocabulary, read as SOURCE (no app run).
    const count = (pattern: RegExp): number => [...driver.matchAll(new RegExp(pattern.source, 'g'))].length
    const oldIdRefs = count(/zone:(?:header|footer)/)
    const oldCarrierRefs = count(/\[data-zone/)
    const topRefs = count(/zone:top/)
    const bottomRefs = count(/zone:bottom/)
    const carrierRefs = count(/\[zone[=\]]/)
    expect(
      { oldIdRefs, oldCarrierRefs },
      `the driver census read: \`zone:header|zone:footer\` ${oldIdRefs}; \`[data-zone\` ${oldCarrierRefs}; ` +
        `\`zone:top\` ${topRefs}; \`zone:bottom\` ${bottomRefs}; \`[zone=]/[zone]\` ${carrierRefs} — the ` +
        `driver's own vocabulary moves with the ids it asserts (D-16: the row that checks the agent-visible ` +
        `ids moves with them in the same commit)`,
    ).toEqual({ oldIdRefs: 0, oldCarrierRefs: 0 })
    // THE TARGETS ARE PRESENCE FLOORS, NOT COUNTS: the driver legitimately REPEATS an id
    // (a block reads `zone:top` in its box map, in its prose and in its detail string), so
    // an exact count would red on a CORRECT file and would have to be re-tuned by every
    // later block that adds a reading. The tooth is "the target spelling is carried", and
    // the literal container-id limb below is what pins the closed four.
    for (const [label, reading] of [
      ['zone:top', topRefs],
      ['zone:bottom', bottomRefs],
      ['[zone=] / [zone]', carrierRefs],
    ] as ReadonlyArray<[string, number]>) {
      expect(
        reading,
        `the driver carries NO \`${label}\` (reading ${reading}) — a driver that names only the ` +
          `pre-rename vocabulary would still drive the app it no longer describes`,
      ).toBeGreaterThanOrEqual(1)
    }

    // (iv) THE LITERAL CONTAINER-ID LIMB — the block is located by its OWN `row:'UF-LAYOUT-2'`
    // literal and read from that block's source text alone (change-analysis §2.5: the closed four
    // must be SPELLED and COMPARED, else a rename that moves every id equally keeps the row green).
    const literal = /row\s*:\s*'UF-LAYOUT-2'/.exec(driver)
    expect(
      literal !== null,
      "the driver carries no `row:'UF-LAYOUT-2'` literal, so the UF-LAYOUT-2 block cannot be located and " +
        'its literal container-id limb cannot be read',
    ).toBe(true)
    const literalIndex = literal === null ? 0 : literal.index
    const startsBefore = [...driver.slice(0, literalIndex).matchAll(/\n {2}[a-z_0-9]+:\s*(?:async\s*)?\(/g)]
    const blockStart = startsBefore.length > 0 ? startsBefore[startsBefore.length - 1]!.index : 0
    const endsAfter = /\n {2}[a-z_0-9]+:\s*(?:async\s*)?\(/.exec(driver.slice(literalIndex))
    const blockEnd = endsAfter === null ? driver.length : literalIndex + endsAfter.index
    const block = driver.slice(blockStart, blockEnd)
    const blockLine = driver.slice(0, blockStart).split('\n').length

    const literalPresence = CLOSED_ZONES.map((zone) => ({
      zone,
      count: [...block.matchAll(new RegExp(`zone:${zone}`, 'g'))].length,
    }))
    // THE LITERAL LIST: an array literal whose quoted members are EXACTLY the closed four.
    const closedList = [...block.matchAll(/\[[^[\]\n]*\]/g)]
      .map((match) => match[0])
      .find((text) => {
        const quoted = [...text.matchAll(/'([^']*)'|"([^"]*)"/g)].map((match) => match[1] ?? match[2] ?? '')
        return (
          quoted.length === CLOSED_ZONES.length &&
          quoted.every((token) => token.startsWith('zone:')) &&
          CLOSED_ZONES.every((zone) => quoted.includes(`zone:${zone}`))
        )
      })
    // THE COMPARISON: an equality comparison binding the container ids to that list. Read as a FIXED
    // POINT over the block's own `const NAME = <expr>` bindings, so a list bound to a name AND a name
    // derived from it (`.slice().sort().join(',')`) are both admitted, while a decorative literal
    // nobody compares is not.
    const lines = block.split('\n')
    const closedDerived = new Set<string>()
    if (closedList !== undefined) {
      for (let pass = 0; pass < 3; pass++) {
        for (const line of lines) {
          const binding = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(.*)$/.exec(line)
          if (binding === null) continue
          const name = binding[1]!
          const expression = binding[2]!
          const derived =
            expression.includes(closedList) ||
            [...closedDerived].some((known) => new RegExp(`\\b${known}\\b`).test(expression))
          if (derived) closedDerived.add(name)
        }
      }
    }
    const comparisonHolds =
      closedList !== undefined &&
      lines.some((line) => {
        if (!/===|!==/.test(line)) return false
        const bindsList =
          line.includes(closedList) || [...closedDerived].some((name) => new RegExp(`\\b${name}\\b`).test(line))
        return bindsList && /\.join\(|\.sort\(|\.every\(|\.slice\(/.test(line)
      })
    expect(
      { literalPresence, hasClosedList: closedList !== undefined, comparisonHolds },
      `the UF-LAYOUT-2 block (scripts/live-drive.mjs:${blockLine}, ${lines.length} lines) carries NO literal ` +
        `container-id limb: the closed four literals read in-block ` +
        `{${literalPresence.map((entry) => `${entry.zone}:${entry.count}`).join(', ')}}; the closed-four array ` +
        `literal ${closedList === undefined ? 'is ABSENT' : `reads ${closedList.replace(/\s+/g, ' ').slice(0, 120)}`}; ` +
        `and an equality comparison binding the container ids to it ${comparisonHolds ? 'EXISTS' : 'is ABSENT'} — ` +
        `change-analysis §2.5 makes this limb the MCP-visible half's only possible red, because the row's ` +
        `set-equality proxy stays green under a rename that moves every id equally`,
    ).toEqual({
      // each of the closed four is SPELLED at least once in-block (a presence floor: the
      // block legitimately names an id in its list, its comparison and its detail string)
      literalPresence: CLOSED_ZONES.map((zone) => ({ zone, count: expect.any(Number) })),
      hasClosedList: true,
      comparisonHolds: true,
    })
    for (const entry of literalPresence) {
      expect(
        entry.count,
        `the UF-LAYOUT-2 block spells no \`zone:${entry.zone}\` container id — the closed four must be ` +
          `stated, not merely compared as an opaque set`,
      ).toBeGreaterThanOrEqual(1)
    }
    // THE PRE-RENAME ROW-ZONE GUARD, AS A PATTERN (⟨adversarial finding `F2`⟩): a limb that only
    // compares the closed four can be made UNSATISFIABLE (the first cut of this limb filtered
    // `zone:*`-shaped ids, which necessarily also admitted `zone:main` — the STAGE — and
    // `zone:sidebar`, so the row could never pass). The landed limb therefore (a) filters the
    // PANE zones BY NAME and (b) carries its own rename tooth: a surviving pre-rename row-zone id
    // must read NON-EMPTY. Both halves must be present in the block, or a later edit can drop the
    // rename tooth while this row stays green.
    expect(
      /zone:\(\?:header\|footer\)|zone:\(header\|footer\)/.test(block),
      `the UF-LAYOUT-2 block (scripts/live-drive.mjs:${blockLine}) carries NO pre-rename row-zone ` +
        `guard: nothing in it can catch a surviving pre-rename row-zone id, so the closed-four ` +
        `comparison alone is the only arm and the rename has no tooth in the driver`,
    ).toBe(true)
  })

  it('G — the track/size token families: --zone-top-*/--zone-bottom-* replace the header/footer pair', () => {
    // THE TOKENS BY DRIVE — the record and the projection, never a source census.
    const tracks = zoneTrackVars(undefined, defaultLayout())
    const sizes = layoutCssVars(defaultLayout())
    const trackKeys = Object.keys(tracks)
    const sizeKeys = Object.keys(sizes)
    const problems: string[] = []
    const require_ = (key: string, present: boolean, family: string): void => {
      if (!present) problems.push(`${family} emitted no ${key}`)
    }
    const forbid = (key: string, present: boolean, family: string): void => {
      if (present) problems.push(`${family} still emits ${key}`)
    }
    require_('--zone-top-track', trackKeys.includes('--zone-top-track'), 'zoneTrackVars')
    require_('--zone-bottom-track', trackKeys.includes('--zone-bottom-track'), 'zoneTrackVars')
    require_('--zone-left-track', trackKeys.includes('--zone-left-track'), 'zoneTrackVars')
    require_('--zone-right-track', trackKeys.includes('--zone-right-track'), 'zoneTrackVars')
    forbid('--zone-header-track', trackKeys.includes('--zone-header-track'), 'zoneTrackVars')
    forbid('--zone-footer-track', trackKeys.includes('--zone-footer-track'), 'zoneTrackVars')
    require_('--zone-top-size', sizeKeys.includes('--zone-top-size'), 'layoutCssVars')
    require_('--zone-bottom-size', sizeKeys.includes('--zone-bottom-size'), 'layoutCssVars')
    forbid('--zone-header-size', sizeKeys.includes('--zone-header-size'), 'layoutCssVars')
    forbid('--zone-footer-size', sizeKeys.includes('--zone-footer-size'), 'layoutCssVars')
    expect(
      problems,
      `the tokens by drive read: zoneTrackVars keys [${trackKeys.join(', ')}]; layoutCssVars keys ` +
        `[${sizeKeys.join(', ')}]. Expected the families --zone-top-track/--zone-bottom-track (with the ` +
        `UNCHANGED left/right pair) and --zone-top-size/--zone-bottom-size; ${problems.length} problem(s). ` +
        `READINGS: ${sourceReading('src/renderer/layout-state.ts', /trackProp:/)} | ` +
        `${sourceReading('src/renderer/layout-vars.ts', /'--zone-(?:left|header)-size'/)}`,
    ).toEqual([])
  })
})
