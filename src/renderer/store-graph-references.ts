// src/renderer/store-graph-references.ts — THE INPUT (`§2.1` item 2, `§2.4` item 8).
//
// THE CALLER'S TOP-LEVEL NAME DECLARATIONS: the names that MAKE a name a ROOT NAME
// (`§2.4` item 8's annotation). A declaration contributes NO ROW to the register
// (`§2.4` item 3's annotation) — the register is the graph's own top-level projection
// AND ONLY THAT. This module imports NOTHING (not even at type level), which is what
// keeps the store's own bytes free of the caller's spellings (`§0A` note 1).

/** ONE DECLARED TOP-LEVEL ITEM, as the caller spells it, carried verbatim
 *  (`§2.3` item 1: the tier token is a FILTER and the second segment is the
 *  registered top-level name). `reserved` is the held field name retained
 *  (`§2.4` item 1(d)); its home is the register row for a top-level item. */
export interface StoreGraphDeclarationRow {
  readonly name: string
  readonly reserved?: boolean
}

/** THE DECLARED-ROW INPUT the factory loads (`§2.1`'s factory block). */
export interface StoreGraphDeclarationInput {
  readonly rows: readonly StoreGraphDeclarationRow[]
}

/** THE TEST-ONLY FIXTURE TYPE (`§2.1` item 2): declared here so the fixture's shape
 *  is contract-exact rather than invented at the test site. */
export interface StoreGraphReferenceFixture {
  readonly rows: readonly StoreGraphDeclarationRow[]
}

/** THE ONE VALUE EXPORT — the caller's rows, carried verbatim and uninterpreted
 *  (`§2.1` item 2's annotation: the module adds no default, no policy predicate and no
 *  spelling of its own). The malformed shapes are the STORE's own construction-refusal
 *  subjects (sibling artifact field 5) — this module never filters, rebuilds or re-keys
 *  a row (E-1/D-5: the laundered build is the divergence; the surface carries). */
export function storeGraphReferences(rows: readonly StoreGraphDeclarationRow[]): StoreGraphDeclarationInput {
  return { rows }
}
