// src/renderer/template-pane.ts — Unit I: the template-editor pane
// (docs/specs/unit-i-template.md §5.4). A PURE module (no Electron). A
// provident-rendered `scope: 'app-graph'` pane that renders the current
// content-window template structure (the root + the zones) as editable
// provident content and commits edits via the template IPC (the SAME template
// store the `code.template.*` MCP tools reach). Being app-graph, it is
// MCP-visible by construction.
import type { LegacyNodeData } from 'provident-ssr'
import type { PaneDefinition, PaneContext } from './pane-registry.js'
import type { ContentWindowTemplate } from '../main/template-shape.js'

/** The template-editor pane's render context: the Unit H PaneContext PLUS the
 *  current content-window template + the traversal-targeted zones. */
export interface TemplatePaneContext extends PaneContext {
  /** The current content-window template (fetched over the template IPC). */
  template: ContentWindowTemplate
  /** The zones the traversal targets (the zones that cannot be dropped — the
   *  ZONE-CONSISTENCY-INVARIANT). Default `['main']`. */
  targetedZones: string[]
}

/** The template-editor pane id. */
export const TEMPLATE_PANE_ID = 'template-editor'

/** The template-editor pane definition. `scope: 'app-graph'` (MCP-visible).
 *  `render(ctx)` authors the template's structure as editable provident content
 *  (a LegacyNodeData content root). */
export function createTemplateEditorPane(): PaneDefinition<TemplatePaneContext> {
  return {
    id: TEMPLATE_PANE_ID,
    title: 'Template',
    scope: 'app-graph',
    render(ctx: TemplatePaneContext): LegacyNodeData {
      const tpl = ctx?.template
      const root = tpl?.root
      const rootId = root?.props?.id
      const children = root?.children ?? []
      const targeted = ctx?.targetedZones ?? []
      // One row per zone container producer (a child with a
      // `placement.placementName`). A targeted zone's remove is disabled.
      const zoneLis: LegacyNodeData[] = children
        .filter((c) => {
          const p = c.placement as { placementName?: string } | undefined
          return p !== undefined && typeof p.placementName === 'string'
        })
        .map((c) => {
          const zoneName = (c.placement as { placementName: string }).placementName
          const isTargeted = targeted.includes(zoneName)
          return {
            type: 'li',
            props: {
              'data-template-zone': zoneName,
              ...(isTargeted ? { 'data-targeted': 'true' } : {}),
            },
            content: zoneName,
            handlers: [{ name: 'template-zone-remove', event: 'click' }],
          }
        })
      const zoneList: LegacyNodeData =
        zoneLis.length > 0 ? { type: 'ul', children: zoneLis } : { type: 'p', content: '(no zones)' }
      return {
        type: 'section',
        children: [
          // The template ROOT row (type + props.id).
          { type: 'div', props: { 'data-template-root-id': rootId } },
          zoneList,
          { type: 'input', props: { id: 'template-zone-input' } },
          { type: 'button', content: 'Add zone', handlers: [{ name: 'template-zone-add', event: 'click' }] },
          { type: 'button', content: 'Reset', handlers: [{ name: 'template-reset', event: 'click' }] },
          { type: 'button', content: 'Save', handlers: [{ name: 'template-save', event: 'click' }] },
        ],
      }
    },
  }
}
