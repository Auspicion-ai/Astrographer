// tests/contenteditable-caret.test.ts — Unit U4 §1.2: the discriminated
// `CaretState` + `RichCaretEdge` in `src/renderer/edit-controller.ts`
// (docs/specs/unit-u4-contenteditable-editor.md §1.2 + §2.1 states 1-7 + the
// textarea-path-kind write, §1.2 "Textarea kind").
//
// This is the TestWriter RED set. What is RED:
//   - The current `CaretState` in `src/renderer/edit-controller.ts` is the Unit L
//     textarea-only `{ offset; focused }` (lines 26-31) — it has NO `kind`
//     discriminator and there is NO `RichCaretEdge` type. The discriminated
//     union + `RichCaretEdge` do NOT exist yet (this is the type-level RED; it
//     fails at `npm run typecheck`, the trio's type leg — vitest erases the
//     type-only references at runtime, per the U3 §1.4 convention).
//   - The HOST textarea path (`textareaBlur` in `src/renderer/sidebar-panes.ts`,
//     lines ~929-947) still writes the OLD `{ offset, focused }` shape — it does
//     NOT write `{ kind: 'textarea', offset, focused }`. That assertion FAILS at
//     RUNTIME (a genuine red).
//
// The controller is PURE (no DOM, no editing-mode knowledge): `saveCaret` /
// `restoreCaret` store/return the FULL discriminated `CaretState` keyed by RAG
// node id WITHOUT branching on `kind` (§1.2 pinned). The discriminated type is
// defined locally here (from the spec §1.2) because the module's `CaretState`
// type does not exist yet; the controller's opaque storage round-trips the
// discriminated object as-is.
//
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, vi } from 'vitest'
import { expectTypeOf } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import type {
  CaretState as ControllerCaretState,
  RichCaretEdge as ControllerRichCaretEdge,
} from '../src/renderer/edit-controller.js'
import type { LegacyInitialData } from 'provident-ssr'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-store.js'
import type { RagSnapshotPayload } from '../src/shared/types.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

// ---- the spec-pinned discriminated types (U4 §1.2) --------------------------
// These are defined locally (they do NOT exist in edit-controller.ts yet). The
// type-level tests below additionally assert the controller's OWN type via a
// `type` import (RED at typecheck, erased at runtime).
interface RichCaretEdge {
  path: number[]
  offset: number
}
type CaretState =
  | { kind: 'textarea'; offset: number; focused: boolean }
  | { kind: 'rich'; ragId: string; anchor: RichCaretEdge; focus: RichCaretEdge; focused: boolean }

const textareaCaret = (): CaretState => ({ kind: 'textarea', offset: 3, focused: true })
const richCaret = (): CaretState => ({
  kind: 'rich',
  ragId: 'n1',
  anchor: { path: [1, 0], offset: 2 },
  focus: { path: [1, 0], offset: 4 },
  focused: true,
})

// ---- the pure controller harness (Unit D) ------------------------------------
function makeController() {
  const backRefs = new Map<string, string[]>()
  const onRebuild = vi.fn()
  const controller = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild,
  })
  return { controller, backRefs, onRebuild }
}

// ===========================================================================
// §1.2 — the discriminated union + RichCaretEdge type shape
// ===========================================================================
describe('the discriminated CaretState + RichCaretEdge (§1.2, §2.1 states 1-2)', () => {
  it('state 1 — TYPE: the controller CaretState is the discriminated union { kind: textarea; offset; focused } | { kind: rich; ragId; anchor; focus; focused }', () => {
    // Typecheck-only RED: `ControllerCaretState` does not exist in the module
    // yet (the current CaretState is { offset; focused }). `expectTypeOf` fails
    // at `npm run typecheck`; vitest erases it at runtime.
    type K = ControllerCaretState extends never ? never : ControllerCaretState
    expectTypeOf<K>().toEqualTypeOf<CaretState>()
  })

  it('state 2 — RichCaretEdge shape: { path: number[]; offset: number } (a path from the root down to the target text node)', () => {
    // Typecheck-only RED (RichCaretEdge does not exist yet).
    type K = ControllerRichCaretEdge extends never ? never : ControllerRichCaretEdge
    expectTypeOf<K>().toEqualTypeOf<RichCaretEdge>()
    // The runtime shape of a path-based edge.
    const edge: RichCaretEdge = { path: [1, 0, 2], offset: 7 }
    expect(Array.isArray(edge.path)).toBe(true)
    expect(edge.path.every((n) => Number.isInteger(n) && n >= 0)).toBe(true)
    expect(Number.isInteger(edge.offset)).toBe(true)
  })

  it('the discriminated union is TOTAL — every saved caret carries exactly one kind (there is NO ambiguous { offset, focused } branch)', () => {
    // A textarea-kinded caret matches the textarea branch; a rich-kinded caret
    // matches the rich branch; neither is ambiguous.
    const t = textareaCaret()
    const r = richCaret()
    if (t.kind === 'textarea') {
      expect(typeof t.offset).toBe('number')
      expect(typeof t.focused).toBe('boolean')
    } else {
      throw new Error('unreachable')
    }
    if (r.kind === 'rich') {
      expect(r.ragId).toBe('n1')
      expect(r.anchor).toEqual({ path: [1, 0], offset: 2 })
      expect(r.focus).toEqual({ path: [1, 0], offset: 4 })
    } else {
      throw new Error('unreachable')
    }
  })
})

// ===========================================================================
// §1.2 — saveCaret / restoreCaret handle both kinds transparently
// ===========================================================================
describe('saveCaret/restoreCaret — both kinds round-trip (§2.1 states 3-6)', () => {
  it('state 3 — a textarea caret is stored + returned with its kind discriminator (deep-equal, incl kind)', () => {
    const { controller, backRefs } = makeController()
    backRefs.set('n1', ['node-1'])
    const caret = textareaCaret()
    controller.saveCaret('n1', caret)
    const restored = controller.restoreCaret('n1')
    expect(restored).toEqual(caret)
    expect(restored?.kind).toBe('textarea')
  })

  it('state 4 — a rich caret is stored + returned with its anchor/focus edges (deep-equal, incl kind)', () => {
    const { controller, backRefs } = makeController()
    backRefs.set('n1', ['node-1'])
    const caret = richCaret()
    controller.saveCaret('n1', caret)
    const restored = controller.restoreCaret('n1')
    expect(restored).toEqual(caret)
    expect(restored?.kind).toBe('rich')
    if (restored?.kind === 'rich') {
      expect(restored.ragId).toBe('n1')
      expect(restored.anchor).toEqual({ path: [1, 0], offset: 2 })
      expect(restored.focus).toEqual({ path: [1, 0], offset: 4 })
    }
  })

  it('state 5 — a dangling back-reference (deleted node) → restoreCaret returns undefined AND clears the stale caret', () => {
    const { controller, backRefs } = makeController()
    // Save a caret for a node that is NOT in backRefs (a deleted/dangling node).
    controller.saveCaret('ghost', richCaret())
    // restoreCaret with no backRefs entry → undefined (L5) + the stale caret is cleared.
    expect(controller.restoreCaret('ghost')).toBeUndefined()
    // A later re-created node with the same id must NOT restore the stale caret.
    backRefs.set('ghost', ['node-ghost'])
    expect(controller.restoreCaret('ghost')).toBeUndefined()
  })

  it('state 6 — a node with no saved caret → restoreCaret returns undefined', () => {
    const { controller, backRefs } = makeController()
    backRefs.set('n1', ['node-1'])
    expect(controller.restoreCaret('n1')).toBeUndefined()
  })

  it('state 7 — clearCaret removes a saved caret of EITHER kind', () => {
    const { controller, backRefs } = makeController()
    backRefs.set('n1', ['node-1'])
    backRefs.set('n2', ['node-2'])
    controller.saveCaret('n1', textareaCaret())
    controller.saveCaret('n2', richCaret())
    controller.clearCaret('n1')
    controller.clearCaret('n2')
    expect(controller.restoreCaret('n1')).toBeUndefined()
    expect(controller.restoreCaret('n2')).toBeUndefined()
  })

  it('the controller is PURE — saveCaret/restoreCaret do NOT branch on kind in storage (no throw, no editing-mode/DOM knowledge)', () => {
    const { controller, backRefs } = makeController()
    backRefs.set('n1', ['node-1'])
    // Both kinds store/return through the SAME opaque path.
    const rich = richCaret()
    controller.saveCaret('n1', rich)
    expect(controller.restoreCaret('n1')).toBe(rich)
    // No throw for either kind + no throw for a node id never seen.
    expect(() => controller.saveCaret('never', richCaret())).not.toThrow()
    expect(() => controller.clearCaret('never')).not.toThrow()
  })
})

// ===========================================================================
// §1.2 "Textarea kind" — the HOST textarea path writes kind:'textarea'
// (supersedes the Unit L `{ offset, focused }` shape)
// ===========================================================================
describe('the textarea path writes kind:\'textarea\' (§1.2 "Textarea kind")', () => {
  // A minimal host harness (rich-splice convention, no boot needed) so the
  // private `textareaBlur` can be driven + the controller's saveCaret spied.
  function makeHarness() {
    installShim()
    const mount = mountEl() as never
    const operatorMount = mountEl() as never
    const registry = createPaneRegistry()
    const backRefs = new Map<string, string[]>()
    const editController = createEditController({
      backRefs,
      commit: vi.fn(async () => ({ ok: true, nodeId: 'n1' })),
      onRebuild: vi.fn(),
    })
    const host = new SidebarPanes({
      mount,
      operatorMount,
      registry,
      bridge: {
        edit: { commit: vi.fn(), onRagStoreChanged: vi.fn(() => () => {}) },
      } as never,
      backRefs,
      editController,
    })
    const runtime = new Runtime({ mount, envelope: {
      template: {
        root: { type: 'div', props: { id: 'wiki-root' }, children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }] },
      },
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    } as unknown as LegacyInitialData })
    return { host, runtime, registry, backRefs, editController }
  }

  it('a dirty textareaBlur saves a kind:\'textarea\' caret (the ONLY change to the textarea path is the added kind discriminator)', () => {
    const { host, editController, backRefs } = makeHarness()
    backRefs.set('n1', ['node-1'])
    editController.markDirty('n1')
    const saveCaret = vi.spyOn(editController, 'saveCaret')
    // Drive the private host textareaBlur (the Unit L path, superseded by U4).
    ;(host as unknown as { textareaBlur(ragId: string, value: string): void }).textareaBlur('n1', 'new value')
    // RED — the current textareaBlur writes { offset, focused } (no kind), so
    // this assertion FAILS until the discriminated shape lands.
    expect(saveCaret).toHaveBeenCalledWith('n1', { kind: 'textarea', offset: 0, focused: true })
  })
})
