// src/renderer/template-pane.ts — Unit I: the template-editor pane
// (docs/specs/unit-i-template.md §5.4). A PURE module (no Electron). A
// provident-rendered `scope: 'app-graph'` pane that renders the current
// content-window template structure (the root + the zones) as editable
// provident content and commits edits via the template IPC (the SAME template
// store the `code.template.*` MCP tools reach). Being app-graph, it is
// MCP-visible by construction.
import type { LegacyNodeData } from 'provident-ssr'
import type { PaneDefinition, PaneContext } from './pane-registry.js'
import type { ContentWindowTemplate, TemplateVerdict } from '../main/template-shape.js'
import { clickableClasses } from './render-shared.js'

/** The template-editor pane's render context: the Unit H PaneContext PLUS the
 *  current content-window template + the traversal-targeted zones. */
export interface TemplatePaneContext extends PaneContext {
  /** The current content-window template (fetched over the template IPC). */
  template: ContentWindowTemplate
  /** The zones the traversal targets (the zones that cannot be dropped — the
   *  ZONE-CONSISTENCY-INVARIANT). Default `['main']`. */
  targetedZones: string[]
  /** U-PARITY-PARTIALS §1.1 (W1-Q11 a) — the last `code.template.validate`
   *  verdict, rendered inline below the controls. `null`/absent → no feedback
   *  block (the pre-validate state). The host sets it from the validate
   *  handler's resolved verdict. */
  validation?: TemplateVerdict | null
}

/** The template-editor pane id. */
export const TEMPLATE_PANE_ID = 'template-editor'

/** U-PARITY-PARTIALS §1.1 (W1-Q11 a) — the Validate control's handler body.
 *  It calls the SAME `code.template.validate` application seam as the MCP tool:
 *  the preload `window.provident.template.validate` → `IPC_TEMPLATE_VALIDATE` →
 *  `handleTemplateTool` against the SAME main-process template store (MCP/UI
 *  equivalence). It validates the store's CURRENT template and hands the
 *  resolved verdict to the host's `sidebar.templateValidateResult`, which
 *  records it so the next re-render shows the inline valid/error feedback.
 *  Guarded: a missing bridge / a rejected IPC is a silent no-op (never throws). */
export const TEMPLATE_VALIDATE_BODY = `function (ctx) {
  var t = window && window.provident && window.provident.template;
  if (!t || typeof t.get !== 'function' || typeof t.validate !== 'function') return;
  Promise.resolve(t.get()).then(function (cur) {
    return t.validate(cur && cur.template);
  }).then(function (verdict) {
    var s = window && window.provident && window.provident.sidebar;
    if (s && typeof s.templateValidateResult === 'function') s.templateValidateResult(verdict);
  }).catch(function () {});
}`

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
            css: { classes: clickableClasses() },
            content: zoneName,
            handlers: [{ name: 'template-zone-remove', event: 'click' }],
          }
        })
      const zoneList: LegacyNodeData =
        zoneLis.length > 0 ? { type: 'ul', children: zoneLis } : { type: 'p', content: '(no zones)' }
      // U-PARITY-PARTIALS §1.1 (W1-Q11 a) — the inline validate result. Absent
      // until a validate has run (`validation == null`); a valid verdict → the
      // "valid" block; an invalid verdict → the reason + detail error block.
      const verdict = ctx?.validation
      const validationNode: LegacyNodeData | null =
        verdict == null
          ? null
          : verdict.ok
            ? {
                type: 'p',
                props: { id: 'template-validation', 'data-validation': 'valid' },
                content: 'Template is valid',
              }
            : {
                type: 'div',
                props: { id: 'template-validation', 'data-validation': 'invalid' },
                children: [
                  {
                    type: 'p',
                    content: `Template is invalid (${verdict.reason}): ${verdict.detail}`,
                  },
                ],
              }
      return {
        type: 'section',
        children: [
          // The template ROOT row (type + props.id).
          { type: 'div', props: { 'data-template-root-id': rootId } },
          zoneList,
          { type: 'input', props: { id: 'template-zone-input' } },
          { type: 'button', content: 'Add zone', css: { classes: clickableClasses() }, handlers: [{ name: 'template-zone-add', event: 'click' }] },
          { type: 'button', content: 'Reset', css: { classes: clickableClasses() }, handlers: [{ name: 'template-reset', event: 'click' }] },
          // U-PARITY-PARTIALS §1.1 — the explicit Validate control (calls the
          // `code.template.validate` seam; the inline result renders below).
          { type: 'button', props: { id: 'template-validate' }, content: 'Validate', css: { classes: clickableClasses() }, handlers: [{ name: 'template-validate', event: 'click', body: TEMPLATE_VALIDATE_BODY }] },
          ...(validationNode ? [validationNode] : []),
        ],
      }
    },
  }
}
