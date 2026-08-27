// src/main/template-shape.ts — Unit I: the PURE content-window template shape
// (docs/specs/unit-i-template.md §5.1, §5.6). No `node:fs`/Electron — importable
// in main AND the renderer bundle (the traversal, which the renderer imports,
// needs the default + the type). `template-store.ts` re-exports these and adds
// the `node:fs`-backed `createTemplateStore`.
import type { LegacyNodeData } from 'provident-ssr'

/** The content-window template — the `LegacyInitialData.template` shape that
 *  defines the content-window layout for rendering a retrieved document (the
 *  root structure + the container zones). This is the envelope's `template`
 *  field (Unit C §5.2) that `buildTraversal` emits. */
export interface ContentWindowTemplate {
  /** The content-window root node (e.g. the `wiki-root` div). Its DIRECT
   *  children are the zone container producers (each a `container`-role node
   *  carrying `placement.placementName`). */
  root: LegacyNodeData
}

/** The DEFAULT content-window template — the current FIXED `wiki-root` +
 *  per-zone containers (the Unit C baseline, `src/main/traversal.ts`). It
 *  offers ONE zone: `main`. */
export const DEFAULT_CONTENT_WINDOW_TEMPLATE: ContentWindowTemplate = {
  root: {
    type: 'div',
    props: { id: 'wiki-root' },
    children: [
      { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
    ],
  },
}

export interface TemplateStoreOptions {
  /** The JSON file the template persists to (usually in userData). */
  path: string
  /** The zones the traversal targets — the content-window zones a customized
   *  template MUST keep a `container`-role producer for (the
   *  ZONE-CONSISTENCY-INVARIANT). Default `['main']` (the traversal's
   *  `zoneName`). A customized template may add OTHER zones, but these cannot
   *  be dropped. */
  targetedZones?: string[]
}

export type TemplateSource = 'default' | 'custom'

export interface TemplateStatus {
  /** 'default' (no customization) or 'custom' (a saved custom template). */
  source: TemplateSource
}

export interface TemplateStore {
  /** The zones the traversal targets (the ZONE-CONSISTENCY-INVARIANT). The
   *  `code.template.validate` tool validates against these. */
  readonly targetedZones: string[]
  /** Read the current content-window template (a shallow copy — never the
   *  internal record). */
  get(): ContentWindowTemplate
  /** Replace the content-window template. VALIDATES it against the store's
   *  targetedZones BEFORE persisting — an invalid template (missing a targeted
   *  zone, or a malformed shape) is REJECTED (throws; the store is unchanged).
   *  On success persists + sets source='custom'. Returns the stored template. */
  set(tpl: ContentWindowTemplate): ContentWindowTemplate
  /** Restore the DEFAULT template (source='default'), persist, return it. */
  reset(): ContentWindowTemplate
  /** The template source. */
  status(): TemplateStatus
}

export type TemplateVerdict =
  | { ok: true }
  | { ok: false; reason: 'invalid-shape' | 'missing-zone'; detail: string; zones: string[] }

/** Validate a content-window template against the targeted zones. A template
 *  that is malformed (`invalid-shape`) or that drops a container producer for a
 *  targeted zone (`missing-zone`) is INVALID. PURE. */
export function validateTemplate(tpl: unknown, zones: string[]): TemplateVerdict {
  if (zones === null || zones === undefined || !Array.isArray(zones)) {
    throw new Error('validateTemplate: zones required')
  }
  // invalid-shape: null/undefined/non-object, or a missing/malformed root.
  if (tpl === null || tpl === undefined || typeof tpl !== 'object' || Array.isArray(tpl)) {
    return { ok: false, reason: 'invalid-shape', detail: 'template is not an object', zones }
  }
  const t = tpl as { root?: unknown }
  if (t.root === null || t.root === undefined || typeof t.root !== 'object' || Array.isArray(t.root)) {
    return { ok: false, reason: 'invalid-shape', detail: 'root is missing or not an object', zones }
  }
  const root = t.root as { type?: unknown; props?: unknown; children?: unknown }
  if (typeof root.type !== 'string' || root.type === '') {
    return { ok: false, reason: 'invalid-shape', detail: 'root.type is missing', zones }
  }
  if (root.props === null || root.props === undefined || typeof root.props !== 'object' || Array.isArray(root.props)) {
    return { ok: false, reason: 'invalid-shape', detail: 'root.props is missing', zones }
  }
  // missing-zone: every targeted zone must have a container-role producer.
  // root.children missing/non-array is treated as an empty set.
  const children = Array.isArray(root.children) ? root.children : []
  for (const zone of zones) {
    const has = children.some((c) => {
      if (c === null || typeof c !== 'object' || Array.isArray(c)) return false
      const p = (c as { placement?: unknown }).placement
      return p !== null && typeof p === 'object' && (p as { placementName?: unknown }).placementName === zone
    })
    if (!has) {
      return { ok: false, reason: 'missing-zone', detail: `missing container for zone "${zone}"`, zones }
    }
  }
  return { ok: true }
}
