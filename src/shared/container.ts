// src/shared/container.ts
// U-CONTAINER — the pure selector / normalizer mechanism with the returned-as-text
// `contain` declaration.
//
// PURE, TOTAL, POLICY-FREE and STATELESS: every value is an argument, nothing is
// retained between calls, no realm-rooted value is read, no element is taken and
// NO WRITE OF ANY KIND is performed (a returned class name is a value, never a
// write site). The mirror-class taxonomy it serves is the CALLER's and appears in
// no byte of this module; the one declaration this module owns is an unparsed
// string constant it RETURNS, and the consumer applies it.

/** The caller's token mapping — the first of the module's two contract edges.
 *  REQUIRED. Called EXACTLY ONCE per `tokensFor` invocation, with the chrome value
 *  the caller itself supplied; the answer is handed on unchanged — never coerced,
 *  never merged, never re-keyed, never defaulted.
 *  DECLARED DEGRADATION: absent / non-callable / throwing => the declared
 *  `undefined` answer, and the throw is ABSORBED — never a throw, never a
 *  mechanism default, never a silent no-op. */
export type ChromeTokenFn = (chrome: unknown) => unknown

/** The caller's axis mapping — the second contract edge; its shape is identical to
 *  the family's landed axis seam (a NAME/shape relation, never an edge).
 *  REQUIRED. Called EXACTLY ONCE per `orientationFor` invocation, with the edge
 *  value the caller itself supplied; the answer is handed on unchanged.
 *  DECLARED DEGRADATION: absent / non-callable / throwing => the declared
 *  `undefined` answer, and the throw is ABSORBED. */
export type AxisResolver = (edge: unknown) => unknown

/** What `containerDeclarationFor` returns: TWO members, in this declaration order,
 *  and no third. `className` is the caller's string, returned verbatim;
 *  `declaration` is the pinned text, byte-identical. */
export interface ContainerDeclaration {
  readonly className: string
  readonly declaration: string
}

/** THE SHIPPED DECLARATION, AS RETURNED TEXT — module-owned, OPAQUE, NEVER PARSED
 *  and NEVER APPLIED. No byte of it is read for any decision. */
const DECLARED_TEXT: string = 'contain: layout style paint'

/** THE TOKEN SELECTOR — PURE, TOTAL, STATELESS. Selects the caller's own token
 *  answer for the `chrome` value it is handed by calling `tokenFn` AT MOST ONCE.
 *  It is not a producer and not a formatter: it builds no record, merges nothing,
 *  coerces nothing and reads no member of `chrome` for any decision.
 *  DECLARED SHAPES: a callable `tokenFn` is invoked EXACTLY ONCE and its answer is
 *  the return value, by identity, for EVERY `chrome` value (no shape gate);
 *  otherwise the declared `undefined` answer, with nothing thrown. */
export function tokensFor(chrome: unknown, tokenFn: unknown): unknown {
  if (typeof tokenFn !== 'function') return undefined
  try {
    return tokenFn(chrome)
  } catch {
    return undefined
  }
}

/** THE ORIENTATION NORMALIZER — PURE, TOTAL, STATELESS, and it computes no
 *  orientation of its own: it normalizes the caller's opaque `edge` value to the
 *  caller's OWN orientation value by calling `axisResolver` AT MOST ONCE. The edge
 *  is UNINTERPRETED — no coordinate, no geometry and no element can arrive through
 *  any parameter, and no shape is privileged.
 *  DECLARED SHAPES: a callable `axisResolver` is invoked EXACTLY ONCE and its
 *  answer is the return value, by identity, for EVERY `edge` value; otherwise the
 *  declared `undefined` answer, with nothing thrown. */
export function orientationFor(edge: unknown, axisResolver: unknown): unknown {
  if (typeof axisResolver !== 'function') return undefined
  try {
    return axisResolver(edge)
  } catch {
    return undefined
  }
}

/** THE DECLARATION RETURNER — PURE, TOTAL, STATELESS, and it WRITES NOTHING.
 *  Returns `{ className, declaration }`: `className` is the caller's string
 *  returned VERBATIM where that argument is a string of length >= 1; any other
 *  argument yields the declared `''` answer for the `className` member. The
 *  `declaration` member is always the pinned constant, returned by a constant
 *  reference. Repeated calls return equal member values in a FRESH record. */
export function containerDeclarationFor(className: unknown): ContainerDeclaration {
  return {
    className: typeof className === 'string' && className.length > 0 ? className : '',
    declaration: DECLARED_TEXT,
  }
}
