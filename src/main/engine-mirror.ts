// src/main/engine-mirror.ts — unit `B-4a` `engine-store-mirror` (`docs/L1/unit-b-4a-engine-store-mirror.md`;
// `docs/L2/gnosis-changes/engine-mirror.md` §2-§6; `docs/L3/gnosis-changes/engine-mirror.md` §1-§5).
//
// WHAT THIS MODULE IS, AND THE DEFECT IT CLOSES (`B6-F1`, HIGH, `D-40`'s grant): the doc-heads read is
// `handleRagDocHeadsIpc(runtime.getDefaultStore())` — ONE LOCAL `RagStore` — while the engine's writes land in two wire
// clients that hold NO store at all (`engineRagStore` / `engineCrudRagStore`). So an engine-originated document could never
// appear in the doc-nav pane: the pane re-read and answered `unchanged`. This module makes an engine-originated write
// VISIBLE in the store the doc-heads read, and does nothing else.
//
// TWO TRIGGERS, ONE PROJECTION, AND THE ORDER IS THE WHOLE OF THE INVARIANT (contract §4):
//   (a) `accepted(write)`  — the engine CRUD surface's ACCEPTED write, called by the proxy BEFORE its own call resolves, so
//                            the projection lands BEFORE the engine's answer reaches the caller. Its fault is CONTAINED: the
//                            engine already accepted the write, so a mirror fault is counted on `status()`, never a rejection.
//   (b) `settle(descriptor)` — the change DESCRIPTOR, a TRIGGER and never a payload (the engine's `nodeIds` are GRAPH node
//                            ids, not document ids — `ASM-B4A-2`). It brings the projection up to date from the engine's
//                            authoritative document-LIST read and RESOLVES BEFORE the caller broadcasts.
// Both converge on ONE projection: the local doc-head triple, written through the store's OWN single writer (`applyBatch`) —
// atomic, ONE journal entry, ONE persist. The mirror is a PROJECTION of an answer the engine gave; the engine stays
// authoritative for engine-side data (`ASM-B4A-1`).
//
// `INV-E`, STRUCTURALLY (contract §5): this module WRITES THE STORE AND NOTHING ELSE. It holds no host, no renderer, no
// Electron, no fs, no socket, no clock and no timer; it broadcasts nothing, emits no descriptor and adds no channel. It
// cannot re-assemble the app graph because it has nothing to re-assemble WITH.
import { ENGINE_ORIGIN_STORE } from './engine-rag-store.js'
import type { RagStoreChangedPayload } from './engine-rag-store.js'
import type { BatchOp, RagNode, RagStore } from './rag-store.js'

/** The document content this module projects — a `Document` (limb a, tags included) or a list summary (limb b, id + title). */
export interface EngineMirrorDocument {
  documentId: string
  title: string
  /** Limb (a) only (`ASM-B4A-5`): the list summary carries no tags. */
  tags?: string[]
  /** The engine's OWN stamp for the local records, so the projection holds no clock. Absent ⇒ a fixed epoch stamp. */
  updatedAt?: string
}

/** §3's two DECLARED writes: an upsert (a `Document` the engine answered) and a remove (an accepted `deleteDocument`). */
export type EngineMirrorWrite = { kind: 'upsert'; document: EngineMirrorDocument } | { kind: 'remove'; documentId: string }

/** The engine document-LIST read, as the host performs it. `complete` is the walk's OWN claim: false ⇒ a partial list. */
export interface EngineMirrorRead {
  documents: EngineMirrorDocument[]
  complete: boolean
}

/** §3's four injected members — and the module holds nothing it is not given (no host, no fs, no socket, no clock, no timer). */
export interface EngineMirrorOptions {
  /** A THUNK, not a store: the shell's hot default-store swap must be honoured (`rag-store-runtime.ts`). */
  store: () => RagStore | null
  /** The engine document-list read. `main.ts` owns the bounded, paged walk its `F-4` finding already requires. */
  read: () => Promise<EngineMirrorRead>
  /** The engine-origin label; defaults to `ENGINE_ORIGIN_STORE`. */
  origin?: string
  /** A bound on how many listed ids ONE walk may project; a list beyond it writes NOTHING (a partial list is not a list). */
  maxPerWalk?: number
}

/** §2's CLOSED count set + the projections held + the last typed failure. A COPY per call. */
export interface EngineMirrorStatus {
  projections: number
  accepted: number
  projected: number
  unchanged: number
  removed: number
  refused: number
  unresolved: number
  failed: number
  walks: number
  lastFailure: string | null
}

export interface EngineMirror {
  accepted(write: EngineMirrorWrite): Promise<void>
  settle(descriptor: RagStoreChangedPayload): Promise<void>
  reconcile(): Promise<RagStoreChangedPayload>
  status(): EngineMirrorStatus
}

// ---------------------------------------------------------------------------
// The projection's vocabulary (§4 of the L2 page).
// ---------------------------------------------------------------------------

/** The MARKER. It is the ONLY thing that licenses an update or a delete of an existing record: an unmarked root holding the
 *  same id is a LOCAL document and the projection is REFUSED, never clobbered (§5's last clause). */
const MARKER_KEY = 'data-engine-mirror'

/** The local doc-head marker the doc-heads read's head node carries (`markdown-parse.ts`'s first section, `:568`). */
const DOC_HEAD_PROP = 'data-doc-head'

/** The stamp a record mints when the engine answers no `updatedAt` — clock-free, so an equal projection stays EQUAL. */
const EPOCH = '1970-01-01T00:00:00.000Z'

/** Default bound on the ids one walk may project (`maxPerWalk`). */
const DEFAULT_MAX_PER_WALK = 2000

/** The descriptor's FOUR keys, in the contract's order (`src/shared/types.ts:415-421`). */
const DESCRIPTOR_KEYS = ['kind', 'nodeIds', 'edgeIds', 'store'] as const

/** Deterministic ids (§4): re-applying the same document names the same records, which is what makes idempotency measurable. */
const HEAD_SUFFIX = ':engine-head'
const headIdFor = (documentId: string): string => `${documentId}${HEAD_SUFFIX}`
const edgeIdFor = (documentId: string): string => `doc-head:${documentId}`

/** The store's OWN tag normalization (`rag-store.ts:419-421`: trim, first-occurrence dedupe, `[]` ⇒ absent) PLUS the one thing the
 *  store will not accept at all — `validateNodeShape` refuses a tag whose `trim()` is empty (`:451-456`), so a whitespace tag is
 *  DROPPED here rather than turned into a batch the whole triple dies with (adversarial `B4A-F2`/`B4A-F8`). Comparing a raw
 *  engine array against a normalized stored one would defeat the equal-projection shortcut for ever. */
function normalizeTags(tags: readonly string[] | undefined): string[] | undefined {
  if (tags === undefined) return undefined
  const out: string[] = []
  for (const tag of tags) {
    const trimmed = tag.trim()
    if (trimmed === '' || out.includes(trimmed)) continue
    out.push(trimmed)
  }
  return out.length > 0 ? out : undefined
}

/** The store's own ISO-8601 test (`rag-store.ts:406-408`), applied to the engine's stamp: an engine answer that cannot be a record
 *  timestamp falls back to the fixed epoch rather than failing the whole batch (adversarial `B4A-F8`). */
function isIsoStamp(value: unknown): value is string {
  return typeof value === 'string' && value !== '' && !Number.isNaN(Date.parse(value))
}

type Verdict =
  | { kind: 'projected'; ops: BatchOp[] }
  | { kind: 'removed'; ops: BatchOp[] }
  | { kind: 'unchanged' }
  | { kind: 'refused' }

interface WalkAnswer {
  ids: string[]
  complete: boolean
}

/** One queued demand at the ONE serialization point: a WALK, a WRITE job (limb a's projection), or a counted NO-OP. */
type DemandKind = 'walk' | 'job' | 'noop'

interface Demand {
  kind: DemandKind
  resolve: (answer: WalkAnswer | null) => void
  job?: () => Promise<void>
}

function describe(err: unknown): string {
  if (err instanceof Error) return err.message
  try {
    return String(err)
  } catch {
    return 'unknown failure'
  }
}

function sameStrings(a: readonly string[] | undefined, b: readonly string[] | undefined): boolean {
  if (a === undefined && b === undefined) return true
  if (a === undefined || b === undefined) return false
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

function sameProps(a: Record<string, unknown> | undefined, b: Record<string, unknown>): boolean {
  if (a === undefined) return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every((key) => a[key] === b[key])
}

function isDocument(value: unknown): value is EngineMirrorDocument {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const document = value as Partial<EngineMirrorDocument>
  if (typeof document.documentId !== 'string' || document.documentId === '') return false
  if (typeof document.title !== 'string') return false
  if (document.tags !== undefined) {
    if (!Array.isArray(document.tags) || !document.tags.every((tag) => typeof tag === 'string')) return false
  }
  if (document.updatedAt !== undefined && typeof document.updatedAt !== 'string') return false
  return true
}

/**
 * §4's marker rule, in one place: a root is a PROJECTION only when it carries the marker. `applicable` is asked of the ROOT
 * alone, so a projection's head/edge are reachable only through their own root.
 */
function isProjectionRoot(node: RagNode): boolean {
  return node.props !== undefined && node.props[MARKER_KEY] === true
}

/**
 * Does `documentId`'s OWN `doc-head` edge already name `headId` as its source? That is the only proof that a record sitting at the
 * derived head id belongs to THIS projection — and it is what keeps the derived namespace from being a licence to write anywhere
 * (adversarial `B4A-F4`: `headIdFor` is not injective over opaque engine ids, so `X`'s head id can BE another document's root, or a
 * local document's root; without this check the projection would overwrite it with an `h1`).
 */
function ownsHead(store: RagStore, documentId: string, headId: string): boolean {
  const edge = store.getEdge(edgeIdFor(documentId))
  return edge !== undefined && edge.kind === 'doc-head' && edge.source === headId && edge.target === documentId
}

/**
 * THE ONE PRODUCER OF A `BatchOp[]` FOR AN UPSERT. The MARKER is checked FIRST: an unmarked root holding the engine's id is a
 * LOCAL document and this planner REFUSES (§`M5`) — equality is never consulted before it (L3 guardrail 1). Then only what
 * DIFFERS is written, and timestamps are ignored by the comparison, so an equal projection produces NO op at all (§`M2`).
 */
function planUpsert(store: RagStore, document: EngineMirrorDocument): Verdict {
  const documentId = document.documentId
  const headId = headIdFor(documentId)
  const edgeId = edgeIdFor(documentId)
  const stamp = isIsoStamp(document.updatedAt) ? document.updatedAt : EPOCH
  const currentRoot = store.getNode(documentId)
  if (currentRoot !== undefined && !isProjectionRoot(currentRoot)) return { kind: 'refused' }
  const currentHead = store.getNode(headId)
  // A record already sitting at the DERIVED head id is only ours when our own `doc-head` edge names it (`B4A-F4`). Anything else is
  // another projection's root or a local document, and a projection never writes over either: it is REFUSED and counted.
  if (currentHead !== undefined && !ownsHead(store, documentId, headId)) return { kind: 'refused' }
  const currentEdge = store.getEdge(edgeId)
  // TAGS: a limb that CARRIES tags (limb (a)'s `Document`) is authoritative — `[]` clears them; a limb that carries NONE (limb (b)'s
  // list summary, `ASM-B4A-5`) must not strip what limb (a) already projected (adversarial `B4A-F1`), so the stored tags are kept.
  const tags = document.tags !== undefined ? normalizeTags(document.tags) : normalizeTags(currentRoot?.tags)
  const rootDiffers =
    currentRoot === undefined ||
    currentRoot.type !== 'div' ||
    currentRoot.content !== '' ||
    !sameStrings(currentRoot.ownedNodeIds, [headId]) ||
    !sameStrings(currentRoot.tags, tags) ||
    !sameProps(currentRoot.props, { [MARKER_KEY]: true })
  const headDiffers =
    currentHead === undefined ||
    currentHead.type !== 'h1' ||
    currentHead.content !== document.title ||
    currentHead.props === undefined ||
    currentHead.props[DOC_HEAD_PROP] !== true ||
    (currentHead.ownedNodeIds ?? []).length !== 0
  const edgeDiffers =
    currentEdge === undefined ||
    currentEdge.kind !== 'doc-head' ||
    currentEdge.source !== headId ||
    currentEdge.target !== documentId ||
    !sameStrings(currentEdge.documentIds, [documentId])
  if (!rootDiffers && !headDiffers && !edgeDiffers) return { kind: 'unchanged' }
  const ops: BatchOp[] = []
  if (rootDiffers) {
    ops.push({
      op: 'putNode',
      node: {
        id: documentId,
        type: 'div',
        content: '',
        ownedNodeIds: [headId],
        props: { [MARKER_KEY]: true },
        ...(tags !== undefined ? { tags } : {}),
        createdAt: currentRoot?.createdAt ?? stamp,
        updatedAt: stamp,
      },
    })
  }
  if (headDiffers) {
    ops.push({
      op: 'putNode',
      node: {
        id: headId,
        type: 'h1',
        content: document.title,
        props: { [DOC_HEAD_PROP]: true },
        ownedNodeIds: [],
        createdAt: currentHead?.createdAt ?? stamp,
        updatedAt: stamp,
      },
    })
  }
  if (edgeDiffers) {
    ops.push({
      op: 'putEdge',
      edge: {
        id: edgeId,
        kind: 'doc-head',
        source: headId,
        target: documentId,
        documentIds: [documentId],
        createdAt: currentEdge?.createdAt ?? stamp,
        updatedAt: stamp,
      },
    })
  }
  return { kind: 'projected', ops }
}

/** The remove planner: an ABSENT projection is `unchanged` (never a write), an UNMARKED one is `refused`. `removeNode` on the
 *  root cascades the `doc-head` edge (the store's own behaviour), so the ops are exactly the root and — only when the edge proves it
 *  is OURS (`B4A-F4`) — its head: a record sitting at the derived head id that this projection does not own is never collateral. */
function planRemove(store: RagStore, documentId: string): Verdict {
  const currentRoot = store.getNode(documentId)
  if (currentRoot === undefined) return { kind: 'unchanged' }
  if (!isProjectionRoot(currentRoot)) return { kind: 'refused' }
  const headId = headIdFor(documentId)
  const ops: BatchOp[] = [{ op: 'removeNode', id: documentId }]
  if (store.getNode(headId) !== undefined && ownsHead(store, documentId, headId)) ops.push({ op: 'removeNode', id: headId })
  return { kind: 'removed', ops }
}

/**
 * Create the mirror. Construction is INERT (`B-4`'s discipline, contract §4's last clause): no read, no walk, no write — so
 * `main.ts` may build it beside the two engine proxies. Throws only on an `opts` the contract cannot make sense of.
 */
export function createEngineMirror(opts: EngineMirrorOptions): EngineMirror {
  if (opts === null || typeof opts !== 'object') throw new Error('engine mirror: opts required')
  if (typeof opts.store !== 'function') throw new Error('engine mirror: store thunk required')
  if (typeof opts.read !== 'function') throw new Error('engine mirror: read required')
  const origin = typeof opts.origin === 'string' && opts.origin !== '' ? opts.origin : ENGINE_ORIGIN_STORE
  const maxPerWalk = typeof opts.maxPerWalk === 'number' && opts.maxPerWalk > 0 ? opts.maxPerWalk : DEFAULT_MAX_PER_WALK

  const counts = { accepted: 0, projected: 0, unchanged: 0, removed: 0, refused: 0, unresolved: 0, failed: 0, walks: 0 }
  let lastFailure: string | null = null

  const fail = (why: string): void => {
    counts.failed += 1
    lastFailure = why
  }

  const currentStore = (): RagStore | null => {
    try {
      const store = opts.store()
      return store === undefined ? null : store
    } catch (err) {
      fail(`store: thunk threw (${describe(err)})`)
      return null
    }
  }

  /** A NON-FAILING store read for the diagnostic surface: `status()` must be side-effect free (adversarial `B4A-F7` — a `status()`
   *  that incremented `failed` was rewriting the very state it reports). */
  const peekStore = (): RagStore | null => {
    try {
      const store = opts.store()
      return store === undefined ? null : store
    } catch {
      return null
    }
  }

  /** §2's `projections`: the MARKED roots the store holds NOW — read from the store, never from bookkeeping (a restart). */
  const countProjections = (): number => {
    const store = peekStore()
    if (store === null) return 0
    try {
      return store.listNodes().filter((node) => isProjectionRoot(node)).length
    } catch {
      return 0
    }
  }

  /** ONE batch through the store's OWN single writer, and the verdict counted — a `{ok:false}` is a CONTAINED failure. */
  const apply = async (store: RagStore, verdict: Verdict): Promise<void> => {
    if (verdict.kind === 'unchanged') {
      counts.unchanged += 1
      return
    }
    if (verdict.kind === 'refused') {
      counts.refused += 1
      return
    }
    try {
      const result = await store.applyBatch(verdict.ops)
      if (!result.ok) {
        fail(`apply: ${result.error}`)
        return
      }
      if (verdict.kind === 'projected') counts.projected += 1
      else counts.removed += 1
    } catch (err) {
      fail(`apply: ${describe(err)}`)
    }
  }

  // -------------------------------------------------------------------------
  // THE ONE SERIALIZATION POINT (L3 §4): a FIFO queue with ONE drain loop. A walk demand coalesces every walk demand already
  // queued when it is taken, and a demand that arrives MID-WALK is a TRAILING demand that runs ONCE — no timer, no interval, no
  // re-arm (`ASM-B4A-4`). Limb (a)'s writes ride the same queue as JOBS, so a write can never land in the middle of a walk's
  // project/remove phase and be deleted by that walk's own "absent from the list" rule.
  // -------------------------------------------------------------------------
  const queue: Demand[] = []
  let running = false

  /** One bounded document-list walk. NEVER throws: every fault is contained, counted `failed`, and named on `lastFailure`. */
  const runWalk = async (): Promise<WalkAnswer> => {
    counts.walks += 1
    let listing: EngineMirrorRead
    try {
      listing = await opts.read()
    } catch (err) {
      fail(`walk: read failed (${describe(err)})`)
      return { ids: [], complete: false }
    }
    // A LIST THAT IS NOT A LIST cannot license anything (adversarial `B4A-F3`): a `documents` that is absent, null or a non-array
    // used to become an EMPTY-but-authoritative list, whose "absent from the list" rule then deleted every projection.
    if (!Array.isArray(listing?.documents)) {
      fail('walk: the read answered no document list')
      return { ids: [], complete: false }
    }
    const documents = listing.documents.filter(isDocument)
    const ids = documents.map((document) => document.documentId)
    // A MALFORMED ENTRY IS A TRUNCATED LIST, not a shorter complete one (the same finding): `complete: true` is trusted only when the
    // list it describes is wholly readable, or one unreadable entry silently licenses deleting that document.
    if (documents.length !== listing.documents.length) {
      fail(`walk: the list carries ${listing.documents.length - documents.length} malformed entry(ies)`)
      return { ids, complete: false }
    }
    if (listing.complete !== true) {
      fail('walk: truncated — the list read did not claim to be complete')
      return { ids, complete: false }
    }
    if (documents.length > maxPerWalk) {
      fail(`walk: over-bound — ${documents.length} id(s) read, maxPerWalk ${maxPerWalk}`)
      return { ids, complete: false }
    }
    const store = currentStore()
    if (store === null) {
      fail('walk: store absent')
      return { ids, complete: false }
    }
    const listed = new Set(ids)
    for (const document of documents) await apply(store, planUpsert(store, document))
    // §5(ii): a COMPLETE walk is the only thing that may delete on ABSENCE, and only for a MARKED root (the mirror's own).
    try {
      const stale = store.listNodes().filter((node) => isProjectionRoot(node) && !listed.has(node.id))
      for (const node of stale) await apply(store, planRemove(store, node.id))
    } catch (err) {
      fail(`walk: store read failed (${describe(err)})`)
    }
    return { ids, complete: true }
  }

  const start = (): void => {
    if (running) return
    running = true
    void drain()
  }

  async function drain(): Promise<void> {
    try {
      while (queue.length > 0) {
        const demand = queue.shift() as Demand
        if (demand.kind === 'noop') {
          demand.resolve(null)
          continue
        }
        if (demand.kind === 'job') {
          // A job's fault is CONTAINED HERE AND NOW (adversarial `B4A-F6`): an uncaught throw inside a demand used to escape the
          // drain, leaving the `accepted` promise — which the CRUD seam AWAITS — pending for ever with no `failed` recorded.
          try {
            await demand.job?.()
          } catch (err) {
            fail(`job: ${describe(err)}`)
          }
          demand.resolve(null)
          continue
        }
        const walkers: Demand[] = [demand]
        while (queue.length > 0 && queue[0] !== undefined && queue[0].kind === 'walk') walkers.push(queue.shift() as Demand)
        let answer: WalkAnswer
        try {
          answer = await runWalk()
        } catch (err) {
          fail(`walk: ${describe(err)}`)
          answer = { ids: [], complete: false }
        }
        for (const walker of walkers) walker.resolve(answer)
      }
    } finally {
      running = false
    }
  }

  const submit = (kind: DemandKind, job?: () => Promise<void>): Promise<WalkAnswer | null> =>
    new Promise<WalkAnswer | null>((resolve) => {
      queue.push({ kind, resolve, job })
      start()
    })

  /** §3's TRIGGER rule. A `structural`, engine-origin, four-key descriptor demands a walk WHATEVER it names — its `nodeIds` are
   *  the engine's GRAPH node ids, never document ids (`ASM-B4A-2`). Everything else is a counted no-op. */
  const isWalkDemand = (descriptor: RagStoreChangedPayload): boolean => {
    if (descriptor === null || typeof descriptor !== 'object' || Array.isArray(descriptor)) return false
    const body = descriptor as unknown as Record<string, unknown>
    const keys = Object.keys(body)
    if (keys.length !== DESCRIPTOR_KEYS.length) return false
    if (!DESCRIPTOR_KEYS.every((key) => keys.includes(key))) return false
    if (body['store'] !== origin) return false
    if (body['kind'] !== 'structural') return false
    if (!Array.isArray(body['nodeIds']) || !Array.isArray(body['edgeIds'])) return false
    return true
  }

  /** LIMB (a). AWAITED by the CRUD seam before its own call resolves; its fault is CONTAINED, so it never rejects. */
  const accepted = async (write: EngineMirrorWrite): Promise<void> => {
    counts.accepted += 1
    const body = write as unknown as Record<string, unknown> | null
    if (body === null || typeof body !== 'object') return fail('accepted: malformed write')
    const kind = body['kind']
    await submit('job', async () => {
      const store = currentStore()
      if (store === null) return fail('accepted: store absent')
      if (kind === 'remove') {
        const documentId = body['documentId']
        if (typeof documentId !== 'string' || documentId === '') return fail('accepted: remove names no document')
        await apply(store, planRemove(store, documentId))
        return
      }
      if (kind === 'upsert') {
        const document = body['document']
        if (!isDocument(document)) return fail('accepted: upsert carries no document')
        await apply(store, planUpsert(store, document))
        return
      }
      fail('accepted: unknown write kind')
    })
  }

  /** LIMB (b), THE ORDERING POINT: resolves only after the walk that STARTED AFTER this demand has finished. */
  const settle = async (descriptor: RagStoreChangedPayload): Promise<void> => {
    if (!isWalkDemand(descriptor)) {
      counts.unresolved += 1
      await submit('noop')
      return
    }
    await submit('walk')
  }

  /** The feed's `reconcile`: walk + project + answer, so the re-read's answer and the projection are ONE act (contract §5 limb (i)).
   *  A walk that could not complete projected NOTHING, so it names NOTHING — a truncated read answering ids it never projected is the
   *  `F-4` lie one layer down (adversarial `B4A-F5`). */
  const reconcile = async (): Promise<RagStoreChangedPayload> => {
    const answer = await submit('walk')
    const ids = answer !== null && answer.complete ? [...answer.ids] : []
    return { kind: 'structural', nodeIds: ids, edgeIds: [], store: origin }
  }

  const status = (): EngineMirrorStatus => ({
    projections: countProjections(),
    accepted: counts.accepted,
    projected: counts.projected,
    unchanged: counts.unchanged,
    removed: counts.removed,
    refused: counts.refused,
    unresolved: counts.unresolved,
    failed: counts.failed,
    walks: counts.walks,
    lastFailure,
  })

  return Object.freeze({ accepted, settle, reconcile, status })
}
