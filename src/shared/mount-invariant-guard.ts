// src/shared/mount-invariant-guard.ts — the cross-envelope mount
// cardinality/identity probe (`U-MOUNTGUARD`, the invariant half of `SCH-1`).
//
// Contract: docs/specs/mount-invariant-guard.md — §2.1 (the exact surface),
// §2.2 (the six prohibitions), §2.3 (the short must-not list) and §2.4 (how the
// probe reads the tree).
//
// A PURE READER. The mount element is handed in by the caller and is never
// resolved by a lookup: the probe reads that element's DIRECT children and each
// child's own `data-node-id` value (through the child's own attribute surface,
// else out of the child's serialized form). It creates nothing, writes nothing,
// loads nothing, and keeps no state between calls — every call returns a FRESH
// result object describing the tree as it is at that moment, and the mount is
// echoed back by reference so a caller can assert that it did not change.
//
// Total by contract: no input makes it throw. A malformed mount and a malformed
// expectation are typed refusals (`mount-not-appendable` / `expect-mismatch`),
// never exceptions — a probe that died on a violation could not report one.

/** One engine-emitted element observed as a DIRECT child of the mount. */
export interface MountRootObservation {
  /** The `data-node-id` attribute value exactly as read off the element. */
  readonly nodeId: string
  /** The element itself, by reference (never a copy, never a clone). */
  readonly element: unknown
  /** The element's serialized open tag + inner HTML, as the shim emits it —
   *  recorded so a failure can be reported without re-reading the element. */
  readonly serialization: string
}

/** The six typed refusal codes. The only string union this module carries. */
export type MountViolationCode =
  | 'no-root' // 0 engine-emitted direct children
  | 'multiple-roots' // ≥ 2 engine-emitted direct children
  | 'root-identity-mismatch' // exactly 1, but its nodeId ≠ expect.rootNodeId
  | 'mount-not-appendable' // mount is malformed: not object-like, or has no children array
  | 'mount-reference-mismatch' // expect.mount is supplied and !== mount
  | 'expect-mismatch' // expect is present and not an object

export interface MountViolation {
  readonly code: MountViolationCode
  /** One sentence, in this unit's own voice, naming what was observed. */
  readonly message: string
  /** The count actually observed (0, 1, or N). */
  readonly count: number
  /** Every engine-emitted direct child's nodeId, in document order. Duplicates
   *  are reported as observed — a dedupe would hide a two-root state. */
  readonly nodeIds: readonly string[]
  /** Present only when `expect.rootNodeId` was supplied. */
  readonly expectedRootNodeId?: string
}

export interface MountInvariantResult {
  /** `true` iff there is EXACTLY ONE engine-emitted direct child and, when an
   *  expectation was supplied, its nodeId equals `expect.rootNodeId`. */
  readonly ok: boolean
  /** The number of engine-emitted direct children observed. */
  readonly count: number
  /** Every engine-emitted direct child, in document order. */
  readonly roots: readonly MountRootObservation[]
  /** Every DIRECT child that is NOT engine-emitted (no `data-node-id`). */
  readonly foreignSiblings: readonly unknown[]
  /** The mount element, by reference — returned so a caller can assert that
   *  the mount did not change across re-derivations. */
  readonly mount: unknown
  /** `null` when `ok`; otherwise exactly one typed violation. */
  readonly violation: MountViolation | null
  /** The expected root nodeId, echoed when the caller supplied one. */
  readonly expectedRootNodeId?: string
}

export interface MountExpectation {
  /** The graph's current root nodeId. Omit to assert cardinality only. */
  readonly rootNodeId?: string | null
  /** The mount the caller believes it is probing (identity, by reference). */
  readonly mount?: unknown
}

/** The observed attribute name — the engine's opt-in node-id attribute. */
const NODE_ID_ATTRIBUTE = 'data-node-id'

/** Object-like (the only shape a mount or an expectation may have). */
function isObjectLike(value: unknown): boolean {
  return value !== null && typeof value === 'object'
}

/** Read the node id through the child's OWN attribute surface, if it has one.
 *  A null/absent/blank/non-string value is not a readable id (falls through). */
function readAttributeNodeId(child: unknown): string | null {
  if (!isObjectLike(child)) return null
  const surface = child as Record<string, unknown>
  const read = surface['getAttribute']
  if (typeof read !== 'function') return null
  try {
    const value = (read as (name: string) => unknown).call(child, NODE_ID_ATTRIBUTE)
    return typeof value === 'string' && value.length > 0 ? value : null
  } catch {
    return null
  }
}

/** The child's serialized form, or `null` when it exposes none. */
function readSerialization(child: unknown): string | null {
  if (!isObjectLike(child)) return null
  const surface = child as Record<string, unknown>
  try {
    const value = surface['outerHTML']
    return typeof value === 'string' ? value : null
  } catch {
    return null
  }
}

/** The second read: parse the id out of the serialized form. A blank value is
 *  not an engine id. */
function parseSerializedNodeId(serialization: string | null): string | null {
  if (serialization === null) return null
  const match = /data-node-id="([^"]*)"/.exec(serialization)
  if (match === null) return null
  const value = match[1]
  return value.length > 0 ? value : null
}

/** The id the caller claims, or `undefined` when no usable id was supplied
 *  (an omitted / nullish / non-string `rootNodeId` is cardinality-only). */
function expectationNodeId(expectation: MountExpectation | null): string | undefined {
  if (expectation === null) return undefined
  const value = expectation.rootNodeId
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/** The mount's direct children, or `null` when the mount is malformed (not
 *  object-like, or with no children ARRAY — §2.1). */
function directChildren(mount: unknown): unknown[] | null {
  if (!isObjectLike(mount) || Array.isArray(mount)) return null
  const surface = mount as Record<string, unknown>
  try {
    const kids = surface['children']
    return Array.isArray(kids) ? (kids as unknown[]) : null
  } catch {
    return null
  }
}

/** Assemble a fresh result. The `expectedRootNodeId` field is ADDED only when
 *  the caller supplied a usable id, so an omitted expectation leaves the field
 *  absent rather than present-and-undefined. */
function assemble(
  mount: unknown,
  roots: MountRootObservation[],
  foreignSiblings: unknown[],
  refusal: { code: MountViolationCode; message: string } | null,
  expectedRootNodeId: string | undefined,
): MountInvariantResult {
  const observed = roots.map((root) => root.nodeId)
  const violation: MountViolation | null =
    refusal === null
      ? null
      : {
          code: refusal.code,
          message: refusal.message,
          count: roots.length,
          nodeIds: observed,
          ...(expectedRootNodeId !== undefined ? { expectedRootNodeId } : {}),
        }
  const result = {
    ok: violation === null,
    count: roots.length,
    roots,
    foreignSiblings,
    mount,
    violation,
  }
  return expectedRootNodeId !== undefined ? { ...result, expectedRootNodeId } : result
}

/** PROBE (pure, total, non-throwing). Reads mount.children and each direct
 *  child's `data-node-id`; never renders, loads, tears down or mutates. */
export function probeMountInvariant(
  mount: unknown,
  expect?: MountExpectation | null,
): MountInvariantResult {
  try {
    // The caller's own claim first. A malformed expectation is refused without
    // reading the tree (and without a throw).
    if (expect !== undefined && expect !== null && (!isObjectLike(expect) || Array.isArray(expect))) {
      return assemble(mount, [], [], {
        code: 'expect-mismatch',
        message:
          'the expectation is neither absent nor an object, so the claim it was meant to carry could not be read',
      }, undefined)
    }
    const expectation = (expect ?? null) as MountExpectation | null
    const expectedRootNodeId = expectationNodeId(expectation)

    const children = directChildren(mount)
    if (children === null) {
      return assemble(mount, [], [], {
        code: 'mount-not-appendable',
        message:
          'the mount is not an object-like element carrying a children array, so its engine-emitted direct children cannot be counted',
      }, expectedRootNodeId)
    }

    if (expectation !== null && expectation.mount !== undefined && expectation.mount !== mount) {
      return assemble(mount, [], [], {
        code: 'mount-reference-mismatch',
        message:
          'the probed mount is not the element the expectation named: the caller checked a mount reference that does not match',
      }, expectedRootNodeId)
    }

    // Direct children only (§2.4): an engine-emitted child is one whose
    // NON-EMPTY node id is readable; everything else is a foreign sibling, and
    // is reported by reference rather than swept.
    const roots: MountRootObservation[] = []
    const foreignSiblings: unknown[] = []
    for (const child of children) {
      const serialization = readSerialization(child)
      const nodeId = readAttributeNodeId(child) ?? parseSerializedNodeId(serialization)
      if (nodeId === null) {
        foreignSiblings.push(child)
        continue
      }
      roots.push({ nodeId, element: child, serialization: serialization ?? '' })
    }

    if (roots.length === 0) {
      return assemble(mount, roots, foreignSiblings, {
        code: 'no-root',
        message:
          'the mount holds no engine-emitted direct child: the observed root count is 0 where exactly 1 root is the invariant',
      }, expectedRootNodeId)
    }
    if (roots.length > 1) {
      return assemble(mount, roots, foreignSiblings, {
        code: 'multiple-roots',
        message: `the mount holds ${roots.length} engine-emitted direct children (${roots
          .map((root) => root.nodeId)
          .join(', ')}) where exactly 1 root is the invariant: an earlier root was left behind`,
      }, expectedRootNodeId)
    }
    if (expectedRootNodeId !== undefined && roots[0].nodeId !== expectedRootNodeId) {
      return assemble(mount, roots, foreignSiblings, {
        code: 'root-identity-mismatch',
        message: `the single engine-emitted root is '${roots[0].nodeId}', which is not the expected root node '${expectedRootNodeId}'`,
      }, expectedRootNodeId)
    }
    return assemble(mount, roots, foreignSiblings, null, expectedRootNodeId)
  } catch {
    // Unreachable by construction — every read above is guarded. Kept so the
    // totality clause of §2.1 holds even for a tree that cannot be read at all.
    return assemble(mount, [], [], {
      code: 'mount-not-appendable',
      message: 'the mount tree could not be read, so no engine-emitted direct child could be counted',
    }, undefined)
  }
}

/** ASSERTION (calls the probe once, then throws on a violation). */
export function assertMountInvariant(
  mount: unknown,
  expect?: MountExpectation | null,
): MountInvariantResult {
  const result = probeMountInvariant(mount, expect)
  if (result.violation === null) return result
  throw new Error(`mount invariant violated (${result.violation.code}): ${result.violation.message}`)
}
