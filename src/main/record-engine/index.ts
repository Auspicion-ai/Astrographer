// src/main/record-engine/index.ts — THE MODULE'S PUBLIC SURFACE, and nothing else (`docs/L1/unit-b-1-record-engine-seam.md`
// §4 site 5). Named re-exports only: no default, no namespace object, no side effect at import time.
//
// **WHAT A CALLER GETS HERE IS THE WHOLE CROSSING AND EVERY HALF OF IT IS SOMEWHERE ELSE'S TO WIRE.** The seam that constructs the
// store is `src/main/storeroom.ts`; this barrel names the family's shapes and parse, the family object and its two projections, the
// delivery and the record. **The boot's ONE construction is NOT this module's** (`main.ts`'s `createProfileStore` call is a later
// unit's, because the build's `--external` clause lands with it), and nothing here reaches the renderer: the client is
// `src/renderer/display-client.ts` and it takes the payload BY TYPE from `display-shape.ts`, which is why no `src/shared/` carrier
// exists for it at this head.
//
// **AND THE ONE LIST TO KEEP IN STEP IS THE DELIVERY'S.** A second family added to this module needs a spec in
// `display-family.ts` AND an address in `delivery.ts`'s own array in the SAME EDIT; the entries↔roots row
// (`tests/integration/record-engine/declared-entries.test.ts`) is what reds a half-edit, and it is stated here because this barrel
// is where a reader of the module starts.

export {
  DISPLAY_BOUNDARY_MESSAGE,
  DISPLAY_ENTRY_MALFORMED_REASON,
  DISPLAY_ENTRY_MESSAGE,
  DISPLAY_MALFORMED_REASON,
  DISPLAY_SHAPE_MESSAGE,
  DISPLAY_UNDECLARED_MEMBER_MESSAGE,
  DISPLAY_UNUSABLE_MESSAGE,
  displayEntryAdmits,
  displayEntryIn,
  displayEntryMemberAdmits,
  displayPlaceholder,
  isPlainRecord,
  isPrototypeKey,
} from './display-shape.js'
export type { DisplayAdmission, DisplayCaret, DisplayCaretEdge, DisplayEntry, DisplayFamilyValue, DisplayView } from './display-shape.js'

export {
  DISPLAY_ADDRESS,
  DISPLAY_FAMILIES,
  DISPLAY_MUST_STAND_ID,
  DISPLAY_TIER,
  displayConstraintDeclarations,
  displayDeclaredRoots,
  displayFamily,
  displayMustStand,
  repairDisplay,
} from './display-family.js'
export type {
  DisplayConstraintAnswer,
  DisplayConstraintDeclaration,
  DisplayDeclaredRoot,
  DisplayFamily,
  DisplayFamilySpec,
  DisplayPairedFamily,
  DisplayRepair,
  DisplayRepairAnswer,
  DisplayTier,
  DisplayUnpairedFamily,
} from './display-family.js'

export { createDisplayDelivery } from './delivery.js'
export type { DisplayDelivery, DisplayDeliveryEntry } from './delivery.js'

export { DISPLAY_WRITE_EVENTS, createDisplayRecord } from './record.js'
export type { DisplayRecord, DisplayRecordOptions, DisplayWriteAnswer, DisplayWriteEvent } from './record.js'
