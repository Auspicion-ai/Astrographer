# Unit `PD-UI-6` (THE SETTINGS-MODAL / OVERLAY ADOPTION, wave `W1`) — GREEN-SCENARIO ARTIFACT (blind test writer)

- **Gate this artifact discharges:** `AGENTS.md` item **10a** / **`RCA-4`** — **gate 5 of the unit's cycle** (the
  blind-test writer's green-scenario artifact + run). **A self-verified greens set (authored by the implementer) is a
  review finding; this artifact was authored by a pass that did NOT write the unit's code, its tests or the
  `-greens.md` set itself.**
- **Repo under test:** `/media/ryanr/Shared Files/Projects/Astrographer`, branch **`post-division-rebuild`**, HEAD
  **`91310c3e9149c0cfb7f6107b57c6ad08bf621b56`**. **Tree state at authoring/running:** **DIRTY — 22 changed/untracked
  paths** (`git status --porcelain`), i.e. the unit's own landing is **uncommitted at this head** (the two
  `src/renderer/**` files, the two `tests/pd-ui-6-*.test.ts` files, the pin-refresh files, the trackers and the two
  unit docs). **The readings below are readings of that working tree at that HEAD**, never of the commit alone.
- **Documentation under test (the ONLY authoring sources):** `docs/specs/unit-pd-ui-6-modal-state.md`
  (**contract**, read **in full**, including `§0B` (the `R1`…`R4` remand ledger), `§0C` (the `A-1`…`A-13`
  adversarial ledger), `§0`, `§0.1`, `§0A`, `§1`/`§1.1`–`§1.4`, `§2`/`§2.1`–`§2.8`, `§3`/`§3.1`–`§3.6.1`, `§4`
  (the register and its amended arithmetic), `§5`, `§6`/`§6.1`–`§6.4`, `§7`/`§7.1`–`§7.4`, `§8`, `§9`, `§10`, `§11`)
  · `docs/specs/pd-ui-6-adoption-dossier.md` (**the STEP-0 semantics authority**; `§0A`, `§1` rows 1–8, `§2`) ·
  `docs/specs/post-division-rebuild-proposal.md` `§4.1` / `§4.2` / `§4.5` / `§5` (`G-8`).
  **File digests at this pass:** contract `sha256 1309fa62f56187c1e3c85f0c77be51ca2af289cd34dab7e24a4ce2e0ba1bcde0`
  · dossier `sha256 7d82f233f7f97084c0094ee7200cf2ad4b11fd1b7eabd834d9f64d36644d07d0` (**= the figure the contract's
  `§0` records — row `E9`**). *(The contract's `§0C` item 10 re-owes its own `sha256` to the landing pass; the digest
  above is recorded **as this pass's reading for anchoring**, and no owed item is claimed discharged by it.)*
- **THE RULE THIS ARTIFACT WAS AUTHORED UNDER (binding).** **Documentation only.** **`src/renderer/modal-state.ts`'s
  body was NOT read, and no expected value below was derived from it — the module was IMPORTED AND EXECUTED.** The
  vendored `src/shared/overlay.ts` was likewise **executed, never read as prose**. **No `tests/**` file was read for
  an expectation**; the two unit test files were **counted** (mechanical censuses, rows `E8`/`E7`) and **run** (row
  `G3`). No expectation below comes from the tests.

## Layer declaration (`RCA-12`, mandatory)

**Every row is `[T]` node/pure, `[T]`-static source, `[H]` host-side/census, machine-data, or an ENVIRONMENT probe —
and NOTHING ELSE.** **A node green is ENVELOPE-green, not APP-green.** This artifact asserts **nothing** that is
app-green, envelope-green, store-green or live-green.

| Group | The layer its rows cover | What that layer does NOT prove |
| --- | --- | --- |
| `A` (adapter totality) | **`[T]` pure** — returned values of `createModalController` + the absence/presence of a throw | not a rendered modal, not a DOM read, not the assembled app (`§5` item 1) |
| `B` (the callback arm / the `'escape'` binding) | **`[T]` pure** over the adapter and the vendored mechanism | that a real `Escape` keydown reaches the route (that is `[U]`, `NT-2`) |
| `C` (the adopted matrix / vocabulary / record) | **`[T]` pure** over the vendored `overlayTransition` | that any consumer renders or paints anything |
| `D` (the KEPT wiring) | **`[T]` under a blind-authored minimal dom-shim** | **not** layout, **not** a real CSS `display` decision, **not** a real hit-test, **not** the assembled Electron app (`§5` items 6/7) |
| `E` (vendored-import / kept-half / pin) | **`[H]` host-side census + machine data (digests, counts, name sets)** | that the boot path ran, or that the bundle ships |
| `F` (the declaration's declared pair, the `G-8` trap) | **`[T]` pure** over the vendored declaration | that any attribute is ever applied (`PD-OVERLAY-2` owns the write; `§1.2` (d)) |
| `G` (the legs, the environment) | **`[H]` + one ENVIRONMENT probe** | nothing about the app; the `[U]` leg is **absent** (`NT-1`) |

## How the readings were taken (commands, verbatim)

1. **The greens run** (scratch runner, **outside the repo**, deleted after the run):

   ```
   node --import /tmp/pd6/register.mjs /tmp/pd6/run.mjs
   ```

   `/tmp/pd6/register.mjs` registers `/tmp/pd6/loader.mjs`, a **7-line ESM resolve hook whose only job is to resolve
   the adapter's TypeScript-style `'../shared/overlay.js'` specifier to the real `src/shared/overlay.ts`** (plain node
   24.20.0 strips types but does not perform that `.js` → `.ts` remap; **vitest/vite does**). The runner imports and
   **executes** `src/renderer/modal-state.ts` and `src/shared/overlay.ts`, builds its **own** minimal dom-shim from
   the ids and behaviours the contract names (`§2.2` items 4/6/7/8/9/10, `§2.7`), drives the scenarios, and prints
   one row per scenario. **No file inside the repo was written by the run except this artifact.**
2. **The unit's own rows (cross-check, NOT an authority):**

   ```
   npx vitest run tests/pd-ui-6-modal-state-adoption.test.ts tests/pd-ui-6-modal-state-register.test.ts
   ```

3. **The full suite (the carried baseline check):** `npm test`.
4. **Two machine readings:** `sha256sum` over the two unit docs (header), and `touch /dev/shm/…` (row `G1`).

## A. `createModalController` — totality and the adapter's declared fail-states (`§2.1`, `§3.2`)

| id | Derivation (`§` / row id) | Drive | Expected (from the docs) | Observed | Verdict |
| --- | --- | --- | --- | --- | --- |
| **A1** | `§2.1` (the totality cell) + `§3.2` items 1/2/3/5/8 | **18 malformed-option shapes** (`undefined` · `null` · a number · a string · a `Symbol` · `12n` · a function · `{}` · `{initialOpen}` at `'yes'`/`1`/`0`/`null`/`{}`/`[]`/`NaN` · `{onOpen:42}` · `{onOpen:{},onClose:null,onToggle:'x'}`) × (construct, `isOpen()`, `open()`, `close()`, `toggle()`) | no throw anywhere; `isOpen()` a **boolean === false** (strict `=== true` is the only true form) | **18/18: 0 throws; `isOpen() === false` throughout** | **PASS** |
| **A2** | `§3.2` item 4 | `{initialOpen:true, onOpen}`; read `isOpen()`; count invocations at construction | `isOpen() === true` at construction; **no callback fires at construction** | `isOpen()=true`, `onOpen` fired **0** | **PASS** |
| **A3** | `§3.2` item 5 | **non-function** `onOpen:42` / `onClose:'x'` / `onToggle:null`; `open()`→`close()`→`toggle()` | each is a **no-op**, never invoked, no throw — **and the transition still completes** | no throw; `isOpen` trace `[true,false,true]` | **PASS** |
| **A4** | `§3.2` item 6 | **throwing** `onOpen`/`onClose`/`onToggle`; `open()`→`close()`→`toggle()` | the throw is **absorbed**; the transition still completes; the controller never throws | no throw; callback attempts `[onOpen,onClose,onOpen,onToggle]`; trace `[true,false,true]` | **PASS** |
| **A5** | `§3.2` item 9 | `open()` on open, `close()` on closed (idempotent no-ops) | the state does not move; nothing throws | trace `[false,true,true,false,false]` | **PASS** |
| **A6** | `§3.2` item 11 | **100 consecutive** `isOpen()` reads | stable for 100 reads (free of side effects) | `stable=true value=true` | **PASS** |
| **A7** | `§3.2` item 12 | two controllers from deep-equal options, identical sequences | identical `isOpen()` traces — no module-level state, no memo, no cache | `a=[true,false,false] b=[true,false,false]` | **PASS** |
| **A8** | `§3.2` item 13 | construct + drive with **no global `document`** at all | no throw; no ambient DOM read inside `createModalController` | no throw; final `isOpen=false` | **PASS** |
| **A9** | **`§2.1`'s totality cell**, which names these exact shapes: *"**NEVER — total for every input** (`options` may be omitted, `null`, a number, a string, a `Symbol`, **a frozen object, an object with hostile getters at the four known keys, a revoked `Proxy`**)"; the contradicting clause is **`§3.2` item 7** | a frozen options object; a **THROWING accessor at a known key** (`initialOpen`, and `onOpen`); a **revoked `Proxy`**; a hostile **get-trap `Proxy`** | **never throws** — the cell names the frozen object, the hostile getter and the revoked `Proxy` as total | frozen: **no throw**, `isOpen=true` · throwing getter at `initialOpen`: **THREW `Error: throwing getter at a known key`** · throwing getter at `onOpen`: **THREW** · revoked `Proxy`: **THREW `TypeError: Cannot perform 'get' on a proxy that has been revoked`** · hostile get-trap `Proxy`: **THREW** | **FAIL** — see `X-1` |
| **A10** | `§3.2` items 3/4 + `§2.1` | an **accessor** returning `true`, and one returning `'yes'` | `true` ⇒ `isOpen()` true; junk ⇒ `false`; no throw | `true`-accessor ⇒ `true`; junk-accessor ⇒ `false` | **PASS** |

## B. The callback arm, the `'escape'` binding and the invocation schedule (`§2.5`, `§3.3`, `§3.1`, `§2.3`)

| id | Derivation | Drive | Expected | Observed | Verdict |
| --- | --- | --- | --- | --- | --- |
| **B1** | `§2.5` clauses 3/4 (i)–(iii); `§3.1` items 5/9; `§2.3` item 4 | `createModalController({callback})` (a **recording** callback), then `close()` **from the initial `'closed'`** | **exactly 1** invocation; no throw; the adapter reports closed (the record is `{state:'closed',changed:false}`) | `invocations=1, threw=false, isOpen()=false` | **PASS** |
| **B2** | `§3.1` item 8; `§2.3` item 4 | `open()` → `toggle()` → `close()` with the recording callback | **0** on `open()`/`toggle()`; **1** on the close route | `afterOpen=0 afterToggle=0 afterClose=1` | **PASS** |
| **B3** | `§3.3` arm (a); `§3.1` item 5 | callback **omitted** and explicitly **`undefined`**; `open()` then `close()` | the declared pair is returned; **nothing throws** | both arms: 0 throws; adapter closed | **PASS** |
| **B4** | `§3.3` arm (b) (**the `A-3` CORRECTED reading**, `§0C` item 2); `§3.1` item 6 | **non-callable** callback corpus (`null`, `42`, `'x'`, `{}`, `[]`, a revoked `Proxy`) × (`open()`, `close()`) | the declared pair is returned and **nothing throws**; **an invocation IS ATTEMPTED and its `TypeError` ABSORBED — "unobservable to the caller"** | **6/6: 0 throws**, declared behaviour unchanged. **The "attempted invocation" half is structurally UNOBSERVABLE from outside the mechanism** (the `catch` is inside it) — **recorded as a declared-unobservable, never asserted** | **PASS** |
| **B5** | `§3.3` arm (c); `§3.1` item 7 | a **throwing** callback; `open()` then `close()` twice | ONE attempted invocation per escape drive; the throw **absorbed**; **never retried**; nothing escapes | `threw=false totalAttempts=2` (one per close) | **PASS** |
| **B6** | `§3.1` item 10 (**not retained**) | two `close()` drives with the same callback, then a **second controller** with the same callback | a second call observes a **fresh count of 1** — no retention, no memo, no history | `firstClose=1 secondClose=1 freshController=1` | **PASS** |
| **B7** | `§2.3` items 2/3 (the `4 × 5` matrix); `§3.1` items 3/8/9; `§2.5` clause 1 | the vendored `overlayTransition` over **4 states × 5 verbs = 20 cells**, each with a recording callback | each printed cell exactly; callback count **1 iff `escape`**, `0` otherwise | **20/20 cells exact; the schedule holds 1-iff-escape** | **PASS** |
| **B8** | `§0B` item 1 (the **`R1`** ruling), `§3.1` items 2/**9b**, `§0C` item 7 (i) | **14 out-of-body `state` shapes** (incl. the omitted / explicit-`undefined` pair, `'closed '`, `'OPEN'`, `Symbol`, `12n`, hostile & revoked `Proxy`) × **6 verbs** with a recording callback | **normalize-and-nothing-moves**: `{state:'closed',changed:false}` for **EVERY** verb — **the `('bogus','open')` cell INCLUDED** — and the callback **exactly 1 on `escape`**, `0` on every other verb | **84/84 drives exact** | **PASS** |
| **B9** | `§2.5` clause 1 + `§2.3` item 4 (`close()` binds **`'escape'`**, **not** `'close'`) | a callable callback through `ModalControllerOptions`; the close route fired | the close route must bind `'escape'` — the only verb carrying the invocation obligation (`'close'` deliberately carries none) — so **one invocation on `close()` and none on `open()` is the observable discriminator** | `open()` gave **0**; `close()` gave the **single** invocation. **The verb argument itself is not observable from the landed surface** (no documented seam exposes it) — the binding is asserted by its schedule consequence only | **PASS** (bounded by the instrument; stated) |
| **B10** | `§4` `P-MD-IM-2` (ii) — *"each of the four bodies … the two the fork cannot reach injected through the recording stub"* | drive `close()`/`open()`/`toggle()` from an injected `'held'`/`'closing'` starting word through the adapter | exactly 1 invocation on the close route from **each** injected body | **NOT DERIVABLE:** the documented surface is `createModalController(options?)` with four option members (`§2.1`); **no injection seam, stub hook or transition-override parameter is documented**, so a blind pass cannot put the adapter into `'held'`/`'closing'` (see `X-2`) | **NOT-BLIND-DERIVABLE** |

## C. The adopted matrix, the vocabulary's normalization and the returned record (`§2.3`, `§3.1`)

| id | Derivation | Drive | Expected | Observed | Verdict |
| --- | --- | --- | --- | --- | --- |
| **C1** | `§2.3` item 3 (the matrix); `§3.1` item 1; `§4` `P-MD-TP-1` | **all 20 matrix cells** on the vendored `overlayTransition` | each cell exactly as printed; `changed === (state !== before)` on every cell | **20/20 cells exact + the identity holds on every cell** | **PASS** |
| **C2** | `§2.3` item 3 invariant (ii) | the **9 non-moving cells** | every non-moving cell answers **its own** state; `changed: false` | **9/9 exact** | **PASS** |
| **C3** | `§2.3` item 2 (row 6); `§3.1` item 4 | **16 out-of-alphabet verb shapes** (unnamed strings, `' closed'`, `'CLOSE'`, `'Escape'`, `'is-open'`, `42`, `true`, `Symbol`, `12n`, `{}`, `[]`, a function, a coercion-hook recording object) from a non-moving state | the declared no-move body; **the caller's own normalized state** returned; `changed:false`; **no `String()`/fold/trim/prefix match**; coercion hooks `0` | **16/16 exact**; hooks `{toString:0, valueOf:0}` | **PASS** |
| **C4** | `§3.1` item 11 | two identical calls; inspect key set / prototype / freshness / frozen-ness | `Object.keys` reads **`['state','changed']` in declared order**; a **fresh plain UNFROZEN** record on `Object.prototype`; values equal | `{keys:true, proto:true, fresh:true, frozen:false, equal:true}` | **PASS** |
| **C5** | `§3.1` item 12 | 6 hostile argument triples (revoked `Proxy` ×3, `Symbol`, `12n`, objects, arrays, functions) | **NEVER throws for any argument**; no refusal domain, no `ok`/`code`/`reason`/`thrown` | 6/6: 0 throws; records carried exactly two members | **PASS** |
| **C6** | `§2.3` item 5 (the reachable set is TWO) | the reachable closure of the adapter's three emitted verbs `{open, escape, toggle}` from `'closed'` | closure ⊆ `{'closed','open'}`; `'held'` reachable only from `'held'`, `'closing'` only from `'closing'` | `closure=["closed","open"]`; the two unreachable bodies only ever leave to `'closed'`/`'open'` | **PASS** |
| **C7** | `§4` `P-MD-TP-2` (**6b**) (a)/(c)/(d) + the register's **ADAPTER-ROUTE REQUIREMENT** — *"the adapter's OWN handed-in word equals the injected one"* | drive the adapter with an injected `'held'`/`'closing'` word and observe the handed-in verb/state pair | the adapter emits only declared verbs and never invents a body | **NOT DERIVABLE:** the ADAPTER-ROUTE REQUIREMENT names *"the register's recording-stub route"*, and **no stub/injection seam is documented on `createModalController`**; the verb the adapter passes is **not observable** from the landed surface (`X-2`) | **NOT-BLIND-DERIVABLE** |

## D. The KEPT wiring — the class mirror, the three affordances, idempotence, fail-soft, the re-parent (`§2.2`, `§2.4`, `§2.7`, `§3.4`)

**Instrument:** a blind-authored minimal dom-shim (fresh document per scenario, because `§2.2` item 3's marker is
per-document): the six authored ids + `#app`/`#stage`/`#tab-strip`, `getElementById`, element `addEventListener` +
`dispatch`, single-parent `appendChild`, a **counting** `className` setter (writes are counted, not just read), and
`classList`/`setAttribute('class')` routed through that same setter so **no write path can escape the counter**.

| id | Derivation | Drive | Expected | Observed | Verdict |
| --- | --- | --- | --- | --- | --- |
| **D1** | `§2.2` item 6 (**called ONCE at install**); `§2.4` (the XOR pair) | install on a fresh document; read the frame class + the write count | exactly **one** write at install; **exactly one** of `is-open`/`is-closed`, the hidden default `is-closed` | `classWrites=1 class="settings-modal is-closed"` | **PASS** |
| **D2** | `§2.2` item 7; `§2.4`; `§2.5` clause 6 (`state 10`) | **ONE direct click** on `#settings-toggle` | exactly one class write; the frame flips to `is-open` | `writes=1 class="settings-modal is-open"` | **PASS** |
| **D3** | `§2.2` item 8; `§2.5` clause 6 | a document-level `keydown` with **`e.key === 'Escape'`** while open | exactly one class write; flips to `is-closed`; no throw | `threw=false writes=1 class="settings-modal is-closed"` | **PASS** |
| **D4** | `§2.5` clause 4 (iv)/(v)/(vi); `§3.4` item 11; `F3` | **Escape while already closed** | `changed:false` ⇒ **NO class write**, no `onClose`, no state change | `threw=false writes=0` | **PASS** |
| **D5** | `§2.2` item 9 (**EXACTLY ONE DIRECT** listener, *"not document-delegated"*); `§2.5` clause 6 (`F4`) | a **direct** click on `#settings-modal-scrim` while closed, then while open | closed: idempotent no-op, **0** writes; open: **exactly one** write and it closes | closed `writes=0` · open `writes=1` · scrim-while-open `writes=1` → `is-closed` | **PASS** |
| **D6** | `§2.2` item 9; `§3.4` item 10 | a click on a **nested content child** of `#settings-modal-body` while open | **NOT** a scrim click — the modal **stays open**; no throw | `threw=false writes=0 class="settings-modal is-open"` | **PASS** |
| **D7** | `§3.4` item 9; `§2.5` clause 6 (`F8`) | **8 non-`Escape` key shapes** while open (`Enter`, `KeyE`, `' '`, `Scape`, `''`, `'Escape '`, `KeyEscape`, `escape`) | **ignored** — no close, no write, no throw; the comparison is the literal `e.key === 'Escape'` with **no trim/fold** | 0 throws; `writes=0`; still `is-open` | **PASS** |
| **D8** | `§2.2` item 6 (keep every other token); `§2.4` (sibling preservation, `SH7-ADV3`) | a frame authored with sibling tokens; a full open → Escape cycle | every non-`is-*` token **survives** every write; exactly one of the pair at each stage | `afterOpen="settings-modal sibling-token other is-open"` · `afterClose="… is-closed"` · survivors `true` | **PASS** |
| **D9** | `§2.4` (one write per real transition, **none** on an idempotent no-op); `§2.5` clause 6 (`SH7-ADV2`, `state 13`) | install + toggle + Escape + Escape-again + scrim-while-closed + toggle = **6 affordance calls, 3 real transitions, 2 no-ops** | exactly **4** class writes: 1 at install + 1 per real transition; **0** on both no-ops | `totalClassWrites=4` | **PASS** |
| **D10** | `§3.4` item 4 (a DOUBLE install on the same document); `§2.2` item 3 | install **twice** on the SAME document | a no-op — exactly ONE toggle listener, ONE document keydown, ONE scrim listener, ONE re-parent | `toggleListeners=1 keydownListeners=1 scrimListeners=1 bodyChildren=2 classWrites=1` | **PASS** |
| **D11** | `§3.4` item 5 (the marker is **per-document**) | install on document A, then on a **fresh** document B; drive B | both wire independently; B opens; A is untouched | `A listeners=true B listeners=true`; B → `is-open`; A `writes=1` | **PASS** |
| **D12** | `§2.7` items 1/3/**4 (the HARD INVARIANT)**; `§2.2` item 10; `§2.6` clause 4(a) | install **while the modal is CLOSED**, with `#panes` under `#app` and `#operator-panes` present | `modalBody.children.length === 2`, both mounts present with `parent === body`, resolved by **literal id**; `#app`/stage/`#tab-strip` **NEVER** enter the modal; the re-parent runs while closed | `bodyChildIds=["panes","operator-panes"] foreignInBody=[] parentsOk=true appChildren=["stage","tab-strip"]` | **PASS** |
| **D13** | `§2.7` item 5; `§3.4` item 3 | install with `#operator-panes` **absent** | an absent mount is **skipped, never fabricated**; nothing else is re-parented; never throws | `bodyChildIds=["panes"]` | **PASS** |
| **D14** | `§3.4` item 6; `§2.7` item 5 | install with a `#settings-modal-body` **without `appendChild`** | that mount is skipped; no throw; the mounts are never fabricated into the body | `threw=false bodyChildIds=[]` | **PASS** |
| **D15** | `§3.4` item 2; `§2.2` item 4 | install with **each one** of the four literal ids absent (4 fresh documents) | no-op, no throw — **no listeners, no re-parent, no class write** | all four: `threw=false writes=0 listeners=false` | **PASS** |
| **D16** | `§3.4` item 1; `§2.2` item 2 (the DOM guard) | install with **no `document`** at all, and with a `document` whose `getElementById` is **not a function** | no-op, no throw in both arms | `no-DOM threw=false`; `non-function getElementById threw=false` | **PASS** |
| **D17** | `§3.4` item 3 | `#app`/stage/`#tab-strip` present but **both** mounts absent | no re-parent of anything else; never throws | `bodyChildIds=[] foreignInBody=[]` | **PASS** |
| **D20** | `§2.2` items 7/8/9 (**EXACTLY ONE** each) + item 11 (*"add a listener beyond the three declared"* forbidden) | census **every** listener attached by install over the whole document | exactly **THREE** in total — one toggle click, one document keydown, one scrim click — and **none** on any other node | `total=3 (toggle=1, keydown=1, scrim=1) strays=[]` | **PASS** |
| **D21** | `§3.4` item 8 (a click on `#settings-toggle` before the frame exists) | click the toggle and send Escape in a document whose **frame id is absent** (install returned early) | no throw; nothing happens | `threw=false frameWrites=0 toggleListeners=0` | **PASS** |
| **D19** | `§2.6` clause 1 (**`installSettingsModal(): void`**, the three parameters **DROPPED**) + `§2.1` | read the live export's arity; perform a **zero-argument** install on a fresh document | arity `0`; a zero-argument call wires the modal | `fn.length=0`; zero-arg install `threw=false` | **PASS** |
| **D18** | `§3.4` item 7 (a frozen or read-only frame `className`) | install with a frame whose `className` write fails | the write fails and is **absorbed**; no throw | **NOT DERIVABLE:** the contract marks this `[H]`-class and **UNVERIFIED** and states *"what would settle it: the unit's red run"* — **it fixes no expected observable**, so a blind pass must not invent one | **NOT-BLIND-DERIVABLE** |

## E. Vendored-import discipline, the kept half, the pin (`§2.1`, `§3.6`/`§3.6.1`, `§1.4`, `R-4`)

| id | Derivation | Drive | Expected | Observed | Verdict |
| --- | --- | --- | --- | --- | --- |
| **E1** | `§2.1` (**import census: exactly ONE new import**, *"the row asserts the RESOLVED path, never a spelling"*); `§3.6.1`; `P-MD-SM-3` (c); `D-2` | COUNT-ONLY census of the adapter's import statements, its static specifiers and the four refused evasion forms (`await import(`, `require(`, `new URL(`, `pathToFileURL`) | exactly **one** import statement; its specifier resolves to the **vendored** `src/shared/overlay.ts`; no evasion form | `importStatements=1 staticSpecifiers=["../shared/overlay.js"] refusedEvasionForms=0` — and the specifier's resolution is independently visible in the run: plain node fails exactly at `src/shared/overlay.js` and the remapped import **executes the vendored module** | **PASS** |
| **E2** | `R-4`; `P-MD-SM-3` (a)/(b); dossier row 1 (`md5 931339d71ac0220e400190296d408ee5`, `lineCount 62`) | recompute the vendored module's `md5` and line count against the machine-readable pin; census its imports | digest **equals** the manifest entry's `md5`, line count its `lineCount`; **ZERO** imports | `md5=931339d71ac0220e400190296d408ee5 lines=62 imports=0`; manifest entry `rowStatus:"PD-UI-6"` | **PASS** |
| **E3** | `§2.1` (export census); dossier rows 1/2/5/6; `§0.1` rows 1/7 | the vendored module's **runtime** exports | exactly two value exports (`overlayTransition`, `overlayInertDeclaration`) | `runtimeExports=["overlayInertDeclaration","overlayTransition"]` | **PASS** |
| **E4** | `§1.4` (DENIED: `index.html`, `vitest.config.ts`, `package.json`); `P-MD-SM-4` (a)/(b)/(d) | name census of the working tree's changed set (`git status --porcelain`) | the three DENIED paths are **absent** from the unit's changed set | `changedPaths=22; deniedPathsChanged=[]` | **PASS** |
| **E5** | `§1.4` (`renderer.ts` — **one line**, the call site re-pointed); `§2.2` item 1 | census `installSettingsModal(` occurrences in `src/renderer/renderer.ts` | exactly **one** call site | `occurrences=1` | **PASS** |
| **E6** | `P-MD-SM-3` (e); `§1.2` (d) + `§0C` item 4 (the **`A-6`** ruling: a **write POSITION**, never a check token) | spelling-bound token scan (`setAttribute(`, `removeAttribute(`, a name token) over the unit's write set | **0** applied-write forms anywhere in the write set | `{"setAttribute":0,"removeAttribute":0,"inertName":0}` — **`(bounded)`, exactly as `§4`'s `A-5` amendment states: a spelling-bound scan proves the absence of the write in the declared spellings, never the absence of the write** | **PASS** (bounded, as declared) |
| **E7** | `§3.6.1` (*"the re-statement is PERFORMED"*; **exactly one** added allow-list row for this unit) | COUNT-ONLY census of `unit: 'PD-UI-6'` rows in `tests/pd-vendor-set.test.ts` | exactly **one** declared consumer edge naming this unit | `unitRows=1 memberMatchedRows=1` | **PASS** |
| **E8** | `§6.4` item 1 (`must NOT mock 'electron'`, *"must not bind the vitest mock API in any form"*); `§3.6` item 2; `P-MD-SM-4` (c) | COUNT-ONLY census of vitest mock-API bindings in the unit's own two test files | **zero** bindings of any form — neither `A-12` census moves | `vi.mock( calls=[0,0]` · `vi.spyOn/vi.fn/vi.hoisted calls=[0,0]` | **PASS** |
| **E9** | `§0` (the **content-hash snapshot** cell, *"a RECORDED READING, measured by the SUPERVISOR at this head"*) | recompute the dossier's `sha256` | the recorded snapshot reproduces exactly | `sha256=7d82f233f7f97084c0094ee7200cf2ad4b11fd1b7eabd834d9f64d36644d07d0` | **PASS** |

## F. The declaration's DECLARED PAIR and the `G-8` trap (`§3.1` item 13, `§4` `P-MD-TP-1`, `R-6`, `E-4`)

| id | Derivation | Drive | Expected | Observed | Verdict |
| --- | --- | --- | --- | --- | --- |
| **F1** | `§3.1` item 13; `§0A` note 7; `P-MD-TP-1`; `E-4` | the declaration with `inert === true`, and with **6 other arms** (the **string** `'true'`, `false`, `0`, `undefined`, `null`, `{}`) | the **DECLARED PAIR**: `{value:'true', removal:false}` on the set arm; `{value:false, removal:true}` on **every other** arm | set arm `{value:'true',removal:false}`; the other 6 arms **exact** | **PASS** |
| **F2** | `§3.1` item 13 (**the `G-8` trap**); `§4` `P-MD-TP-1` (*"a corpus asserting `removal === (value !== true)` as an equation MUST FAIL on the set arm — the trap driven so it is visible"*) | evaluate the foundation's **printed identity** `removal === (value !== true)` on the set arm | the printed identity is **UNSATISFIABLE** on the set arm — it must evaluate **false**, and the DECLARED PAIR must be what is asserted | set arm `{value:'true',removal:false}` · **`printedIdentity holds = false`** (`value !== true` ⇒ `true` vs `removal = false`) — **the trap is visible, not latent** | **PASS** |
| **F3** | dossier row 6 (the foundation's `§2.4` item 5 census, quoted in the dossier: `['name','value','removal','target']` **in declared order**) | the declaration record's key set and its `target` echo | four members in declared order; `target` echoed and never consulted | `keys=["name","value","removal","target"]`, `target` echoed | **PASS** |

## G. The legs, the baseline delta, and the environment (`§7`, `§7.1`, `§7.3`; `RCA-11`/`RCA-12`)

| id | Derivation | Drive | Expected | Observed | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G1** | `§7.2` item 1 / `§7.3` (`R-10`) — *"`npm run divergence` is RED for an ENVIRONMENTAL reason: `/dev/shm` denies shared memory"* | **the environment clause only** — the leg itself was **NOT run** (by instruction): `touch /dev/shm/…` in this environment | the documented cause is present: `/dev/shm` is **not writable** | `touch /dev/shm/.__pd6_probe ⇒ Permission denied`; `/dev/shm` is `drwxrwxrwt root root` — **the documented environmental precondition is present**; the divergence **leg reading is not this pass's** | **PASS** (ENVIRONMENT-layer only, labelled) |
| **G2** | `§7.1` (`npm test`) / `§7.3` (**one carried red**) / `§0C` item 8 (*"the branch is back to EXACTLY ONE red"*) | `npm test` | the branch reads **exactly one** red: the carried baseline `P-SM-1` (`tests/unit-stage-active-tab-display-pbt-generators.test.ts`, defect **`PANE-TOGGLE-STAGE-COLLAPSE`**) | **`208 files (1 failed / 207 passed) · 4472 tests (1 failed / 4426 passed / 45 skipped)`**, 15.88 s · the single red is `tests/unit-stage-active-tab-display-pbt-generators.test.ts` → `P-SM-1 [strat:stage-seam-schedule-single-active] BROKEN over 27 attempts` → **exactly one red, and it is the carried one** (counts drift: see `X-3`) | **PASS** |
| **G3** | `§6.1` ② (the two landed test-file names); `§4` (the register and its terms) — **run as a CROSS-CHECK, never as an authority** | `npx vitest run tests/pd-ui-6-modal-state-adoption.test.ts tests/pd-ui-6-modal-state-register.test.ts` | both unit files green, and the register report printing every row `held` with its declared **and** executed term | **`2 passed (2) · 73 tests passed`** (`adoption 62 tests`, `register 11 tests`) · the report: `P-MD-IM-1 32+3=35` · `P-MD-IM-2 15+5=20` · `P-MD-SM-1 14+3=17` · `P-MD-SM-2 20+4+3=27` · `P-MD-TP-1 46+4=50` · **`P-MD-TP-2 22+3=25`** · `P-MD-SM-3 5+3=8` · `P-MD-SM-4 6+3=9` — **all `held`, `counterexamples 0`, executed = declared**, total **`191`** (the `§0C` item 11 re-derivation) | **PASS** |

## NOT-TESTABLE (explicit, with the layer named — never silently dropped)

| id | Derivation | The claim | The layer it needs | Why it cannot be taken here |
| --- | --- | --- | --- | --- |
| **NT-1** | `§7.2` **`L-1`** | a **real click** on `#settings-toggle` opens the modal, the frame's class flipping **in a real document** | **`[U]` assembled / rendered** | requires the assembled renderer + a real CDP click; **no Electron boot and no live leg was run** (instruction + `RCA-11`); the re-pin artifact is **authored but UNEXECUTED** (`A-9`) |
| **NT-2** | `§7.2` **`L-2`** | a **real `Escape` keydown** closes it | **`[U]`** | the real key event through the real document listener; a synthetic `dispatch` under my shim is **not** that (and my shim is my own instrument, not the app's DOM) |
| **NT-3** | `§7.2` **`L-3`**; `§5` item 7 | a **real click on the scrim** lands on the scrim and closes it, and a content click does not | **`[U]` — hit-testing** | the contract records it itself: *"the dom-shim has NO hit-testing"*; my `D5`/`D6` drive **directly dispatched** events to the two nodes, which proves the **listener's placement**, never a real hit-test |
| **NT-4** | `§7.2` **`L-4`** | the **re-parented mounts are PAINTED** inside the modal body (a non-zero box, populated text) | **`[U]` — layout** | requires layout; my `D12` proves **ancestry only** |
| **NT-5** | `§5` item 6 | the modal's **VISIBILITY** (`display:none` / `getComputedStyle`) | **`[U]`/browser** | the node-testable proxy is the **class-token XOR** (`D1`/`D2`/`D3`); *"the `display: none` outcome and `getComputedStyle` are browser-only and NOT node-asserted"* — the contract says so, and this artifact agrees |

**The live-layer state this artifact inherits, stated rather than smoothed:** **`OPEN / live-pending`** (`§7.2`'s
`A-9`/`A-13` amendments): the four `[U]` claims above are **`UNTAKEN`**, and **a node green is envelope-green only**
(`RCA-12`). **This artifact does not and cannot say the app renders or hit-tests the modal.**

## Counts

| Reading | Count |
| --- | --- |
| **Total rows in this artifact** | **68** = 60 runner rows (groups `A`–`F`) + 3 leg/environment rows (`G1`/`G2`/`G3`) + 5 `NOT-TESTABLE` (`NT-1`…`NT-5`) |
| **`PASS`** | **59** = 56 runner rows + `G1`/`G2`/`G3` |
| **`FAIL`** | **1** (`A9`) |
| **`NOT-BLIND-DERIVABLE`** | **3** (`B10`, `C7`, `D18`) |
| **`NOT-TESTABLE`** | **5** (`NT-1`…`NT-5`) |
| **Executed (PASS + FAIL)** | **60** = the runner's 57 executed rows (56 `PASS` + 1 `FAIL`) + the 3 leg/environment readings (`G1`/`G2`/`G3`) |
| **Not executed** | **8** — 3 `NOT-BLIND-DERIVABLE` + 5 `NOT-TESTABLE`, each with its reason |
| **Verdict of the artifact** | **the unit's envelope-level behaviour reproduces the contract on 59 of 60 executed rows, with ONE contract-contradiction (`A9`) and THREE rows the documentation does not make runnable** |

## CONTRADICTIONS

**A FAIL is a doc/spec drift OR an un-hardened regression — NEVER a pass.** Each entry names the clause it
contradicts, the reading, and the split (spec-staleness vs behaviour gap) the follow-up amendment must act on.

### `X-1` — **`§2.1`'s totality cell claims `createModalController` NEVER throws for exactly the shapes that DO throw: a throwing accessor at a known key and a revoked `Proxy` — and `§3.2` item 7 contradicts `§2.1` on the same shapes.** (the artifact's only `FAIL`, row `A9`)

**The contradiction, both clauses quoted.** `§2.1`'s throw column for `createModalController` reads
***"NEVER — total for every input** (`options` may be omitted, `null`, a number, a string, a `Symbol`, **a frozen
object, an object with hostile getters at the four known keys, a revoked `Proxy`** — `§3.3`)"*. `§3.2` item 7
reads, of the same neighbourhood: ***"`options` a frozen object, or one whose known keys are accessors, or a revoked
`Proxy` — `[H]`-class; UNVERIFIED by this pass. The landed implementation reads the four keys by plain property
access, so a throwing getter at a known key would throw — recorded as an INFO-class limit … and carried unchanged.
**This spec does NOT widen the totality claim to cover it**"*.

**The measured reading (row `A9`).** frozen object ⇒ **no throw** (`isOpen()=true`) · **throwing getter at
`initialOpen`** ⇒ **THREW `Error: throwing getter at a known key`** · **throwing getter at `onOpen`** ⇒ **THREW** ·
**revoked `Proxy`** ⇒ **THREW `TypeError: Cannot perform 'get' on a proxy that has been revoked`** · hostile
get-trap `Proxy` ⇒ **THREW**.

**The split, with the evidence for each side.** **(i) SPEC STALENESS (the contract's own internal drift):** the
behaviour matches `§3.2` item 7's recorded limit *exactly*, so the *behaviour* is not new; what is wrong is
**`§2.1`'s cell**, which names the frozen object, the hostile getter and the revoked `Proxy` as total in the same
file that declines to widen the claim to them. **The two cells cannot both stand as filed.** The `§2.1` cell's own
citation is `§3.3` (the seam section — the callback's arms), which is **not** where this limit lives, so the cell's
citation is stale as well. **(ii) BEHAVIOUR GAP (the alternative reading, weaker):** if totality over *every input*
is the intended contract, then `createModalController` is **un-hardened** against a throwing option read — a
`try`/`catch` around the four key reads (or a guarded read) would close it, and `§2.2` item 2/`§3.4` item 14 already
require the *wiring* to be fail-soft, so the asymmetry is visible in the same file. **Which side to act on is the
architect's call, and this artifact takes neither:** it records that **the FAIL is against `§2.1`'s printed cell**
(the only clause naming these shapes), that **no landed row covers the shapes** (`§4` `P-MD-IM-1`'s malformed-option
list names `undefined · null` · a number · a string · a `Symbol` · `{}` · the seven `{initialOpen}` coercion shapes ·
`{onOpen: 42}` · `{onOpen:{},onClose:null,onToggle:'x'}` — **no throwing getter, no revoked `Proxy`**), and that
**`A9` was authored from `§2.1` alone**, which is why it is a FAIL and not a `NOT-BLIND-DERIVABLE`.

### `X-2` — **THE REGISTER'S `ADAPTER-ROUTE REQUIREMENT` REQUIRES A "recording-stub route" THAT NO DOCUMENTED SURFACE PROVIDES: two register rows (`P-MD-IM-2` (ii), `P-MD-TP-2` (6b) (a)/(c)/(d)) cannot be turned into a runnable expectation from the documentation, and `§6.4` item 1 forecloses the module-mock route.**

**The clauses.** `§4`'s shared-machinery **ADAPTER-ROUTE REQUIREMENT** (2026-09-29, findings `A-1`/`A-11`/`A-12`)
states: *"A row whose property text claims that a value is 'passed through `ModalControllerOptions.callback`', that
the 'adapter emits' a verb or state, that the 'adapter fabricates none', or that the 'class mirror' writes or does
not write, **MUST drive the ADAPTER** — the register's **recording-stub route** (the adapter corpus instantiated with
a recording/injected transition) — and **MUST NOT satisfy the claim by calling the vendored `overlayTransition`
directly**."* `P-MD-IM-2` (ii) requires the `'held'`/`'closing'` bodies *"injected through the recording stub"*;
`P-MD-TP-2` (6b) requires *"the adapter's OWN handed-in word equals the injected one"* and four drives *"through the
STUB"*; **`§0C` item 6** (the strongest false-green) requires the **write count** discriminator on drives through the
adapter. **Against these:** `§2.1`'s surface is `createModalController(options?: ModalControllerOptions)` where
`ModalControllerOptions` has **four declared members plus `callback`** — **no injection seam, no transition override,
no factory, no exported stub hook**; and `§6.4` item 1 forbids the unit's own test files from binding the vitest mock
API *"in any form"*, so the obvious injection route (module-mocking `'../shared/overlay.js'`) is closed by the same
contract.

**The reading (rows `B10`, `C7`).** The two rows are marked **`NOT-BLIND-DERIVABLE`** with their reason. **The
landed test files do satisfy their own `§6.4` item 1 oracle** (row `E8`: `vi.mock(` calls `0/0`; `vi.spyOn`/`vi.fn`/
`vi.hoisted` `0/0`), **so the landed register must be reaching the adapter some other way — and that way is not
documented anywhere this pass was allowed to read.** **The split:** **doc-side (a missing derivation), not a
behaviour gap** — the *consequence* to act on is that **the `§4` register's three headline claims
(`P-MD-SM-2`'s adapter-routed write-count equivalence, `P-MD-IM-2`'s state drives, `P-MD-TP-2`'s injected-body
drives) are unassertable by anyone working from the documentation alone**, which is exactly the property this gate
exists to measure. **The follow-up amendment should document the stub route by name** (what is stubbed, at what
seam, and why it is not a `vi.mock` binding) — or restate those clauses as mechanism-routed and accept the weaker
claim. **A reader should also note the second-order effect: the FALSE-GREEN of `§0C` item 6 (`isOpen()`-recomputing
implementations pass every landed row) is not closable from the documented surface**, because the discriminating
assertion (the **write count** under an injected no-op record) needs the undocumented route too.

### `X-3` — **THE RECORDED SUITE READING IS STALE BY +5 TESTS (and by its own accounting rule it is a reading, not a projection).**

**The clause.** `§0C` item 8 consequence **3** and `§7.1`/`§7.3`'s superseding notes record: *"the measured reading at
this head is **`208 files (1 failed / 207 passed) · 4467 tests (1 failed / 4421 passed / 45 skipped)`** — RECORDED
READING, measurer: the supervisor / the implementer."* **My reading (row `G2`):**
**`208 files (1 failed / 207 passed) · 4472 tests (1 failed / 4426 passed / 45 skipped)`**. **The file-level figure
reproduces exactly and the single red is the carried one; the test totals moved `+5`.** **Split: pure spec
staleness** (a count claim, not a behaviour claim) — and the contract itself states the rule that makes it
actionable: *"the reading, not the projection, is what the DONE row carries."* **The follow-up amendment should
re-state the figure and its measurer.** *(The `§6.1` ③ / `§0B` item 3 TestWriter readings — `206/4427`, `206/4387`,
`207/4458` — are explicitly recorded as that pass's own measurements at ITS head and are kept visible; they are not
contradictions, and the pre-red reading's internal `1 failed`-files-beside-`2 failed`-tests discrepancy is already
recorded as unreconciled by the contract itself (`§0B` item 3) — **this pass confirms the branch now reads ONE red,
so the two-red interval it describes is closed**.)*

### `X-4` — **THE CONTRACT'S HEAD STATUS BLOCK IS STILL THE FILING PASS'S READING WHILE THE TREE HAS LANDED (informational; the amendments keep it visible on purpose).**

**The clause.** The file's opening status block reads *"**Status: SPEC — authored 2026-09-28. NO CODE LANDED, NO
TEST LANDED, NOTHING RUN by this pass.**"* **The reading:** at this head the adapter, the two unit test files, the
allow-list row and the pin refresh **have landed** (§0B's tree-state note and §0C item 8 record this; **rows `E1`,
`E4`, `E5`, `E7`, `E8`, `G3` measure the landed state**), and `installSettingsModal` already carries the **reduced
zero-parameter signature** (row `D19`: `fn.length=0`). **Split: spec staleness of the `Status:` line only** — the
annotate-beside discipline keeps the block as the filing pass's own reading, and **nothing is rewritten here.** A
reader who stopped at line 6 would conclude the unit is unlanded; **the `§Tree-state note` / `§0C` ledgers are where
the truth is, and the follow-up documentation review should point the status block at them.**

### `X-5` — **WHERE THE CONTRACT'S PROSE COULD NOT BE TURNED INTO A RUNNABLE EXPECTATION (the complete list, with the missing derivation named)**

| # | The clause | What is missing | This artifact's verdict |
| --- | --- | --- | --- |
| (a) | `§4` `P-MD-IM-2` (ii) / `P-MD-TP-2` (6b) / the ADAPTER-ROUTE REQUIREMENT | the **stub route's shape** (see `X-2`) | `B10`, `C7` = `NOT-BLIND-DERIVABLE` |
| (b) | `§3.4` item 7 (frozen / read-only frame `className`) — *"the write fails and is absorbed; no throw"* while the same item says `[H]`-class, **UNVERIFIED**, *"what would settle it: the unit's red run"* | **an expected observable**: the item declares a behaviour *and* declines to claim it — **the two halves cannot both be asserted** | `D18` = `NOT-BLIND-DERIVABLE` |
| (c) | `§3.2` item 7 vs `§2.1` | the two clauses disagree and neither yields a single expected value for the shapes they share | `A9` was authored from **`§2.1`** (the only clause that states *never throws*), and **FAILS** — `X-1` |
| (d) | `§3.1` item 6's **non-callable** arm (`A-3` corrected): *"an invocation IS ATTEMPTED and its `TypeError` is ABSORBED — unobservable to the caller"* | **an instrument**: the attempt is inside the mechanism's own `try`, so **no caller-side drive can observe it** | `B4` asserts the **observable** half (nothing throws, declared behaviour) and **records the attempted half as a declared-unobservable** — not a FAIL, and not silently dropped |
| (e) | `§6.4` item 1's mock-binding oracle / `§3.6` item 2 | nothing missing — **counted and green** (`E8`) | recorded as **verified-not-contradicted** |

### Verified-NOT-contradicted (checked and cleared, so a reader sees what was looked at)

- **The Escape ruling's union (`§2.5`) holds end to end:** the close route fires the callback exactly once from
  `'closed'` (`B1`) and zero times on `'open'`/`'toggle'` (`B2`); Escape while closed writes nothing (`D4`); the
  toggle click, the document `Escape` and the **direct** scrim click all work while a content click never closes
  (`D2`, `D3`, `D5`, `D6`).
- **The `R1` ruling (`§0B` item 1) reproduces exactly on 84 drives** — including the corrected
  `('bogus','open')` ⇒ `{state:'closed',changed:false}` cell and the out-of-body `'escape'` firing exactly once
  (`B8`); **the `R2` ruling (`§0B` item 2) is consistent with the landed register** (row `G3`'s report: `P-MD-SM-2`
  `20 + 4 + 3 = 27`, `bounded ON THE FOUR INJECTED DRIVES`, `executed 27`).
- **The `§0C` item 11 arithmetic (`P-MD-TP-2` `18 → 22`, row `21 → 25`, total `187 → 191`) matches the landed
  register's own report** (`G3`); **every other row's term is unmoved.**
- **The vendored-import discipline is met** (`E1`: one import, the vendored member, no evasion form; `E2`: the
  digest and line count equal the pin) — **the `§3.6.1` edge that was the `R4` interim red is now a REAL static
  edge**, and the pin's own file is green in row `G2`'s run.
- **The kept half survives the adoption, hard invariant included** (`D12`: body children are exactly the two mounts,
  `#app`/stage/`#tab-strip` outside), and the fail-soft set is total (`D15`, `D16`, `D17`, `D21`).
- **The scope exclusion is intact** (`E6`, bounded as the contract's own `A-5` amendment declares; `F1`–`F3` drive
  only the **returned data**).
- **The two `-greens`-independent readings agree:** this artifact's `A9` is the only disagreement anywhere, and it is
  a contract-internal clause conflict (the landed rows cover a **different** shape set — `P-MD-IM-1`'s
  malformed-option list).

## Repo-tree integrity (this pass's own discipline)

**Written by this pass: THIS FILE ONLY.** No `src/**`, `tests/**`, `scripts/**`, `vendor/**`, tracker
(`docs/next-steps.md`, `docs/pending.md`, `docs/decisions.md`, `docs/defects.md`, `docs/HANDOFF.md`) or other spec
byte was written. **No Electron boot, no live leg, no `scripts/**` invocation, no `npm run build`/`typecheck`/
`battery`/`divergence`/`drift` was run.** The three runs reported above are `npm test` and one `npx vitest run` (both
read-only legs) plus the scratch node runner. **The scratch runner lived in `/tmp/pd6/` (outside the repo) and was
deleted after the run**; the readings it produced are transcribed above verbatim in substance, and the register's
own arithmetic is independently visible in row `G3`'s report.

## DISPOSITIONS OF THIS ARTIFACT'S FINDINGS (2026-09-28, the `PD-UI-6` item-10d documentation review, gates 7 + 8 in one pass)

**LAYER (`RCA-12`): DOC-LAYER ONLY. The review pass ran no leg and holds no shell; every reading below is its own
`VERIFIED-BY-READ` or a RECORDED READING with its measurer named. NOTHING below is app-green, and the unit's live
layer stays `OPEN / live-pending`.** **The artifact's rows above are KEPT as its pass's readings (`RCA-8(c)`);
this block disposes of its findings and its stale tree-state claims.**

| The finding | Its disposition |
| --- | --- |
| **`A9` — the ONE `FAIL`** (`§2.1`'s totality cell vs `§3.2` item 7) | **RULED BY THE SUPERVISOR AND FIXED IN THE CONTRACT IN THIS PASS: `§2.1`'s cell is CORRECTED to `§3.2` item 7's reading** — total over malformed **VALUES**; **a hostile accessor / a revoked `Proxy` that THROWS ON READ is that declared limit**. The `§2.1` cell's stale citation (`§3.3`) is corrected to `§3.2` item 7, and **THE BEHAVIOUR GAP IS MINTED AS AN OWED DEFECT ROW** (`docs/defects.md`, `MODAL-OPTION-READ-NOT-FAIL-SOFT`) with its shapes, its evidence (this row `A9`; no landed row covers them) and its fix shape. **No code change in this pass.** |
| **`X-1`** (the contradiction `A9` rests on) | **DISPOSED WITH `A9`: the two cells can no longer disagree, because `§2.1` now carries `§3.2` item 7's reading.** |
| **`X-2` — the undocumented "recording-stub route"** | **RECORDED AS A DOC-SIDE MISSING DERIVATION, with its two admissible resolutions and its owner, at `§4`'s ADAPTER-ROUTE REQUIREMENT** (the instrument IS landed — the adapter's own bytes compiled with the vendored import binding substituted — but the documented surface never names it). **Owed to a spec pass; owner: the `PD-UI-6` spec's owning pass (supervisor-assigned).** |
| **`X-3` — the stale suite reading (`4467` → `4472`)** | **FIXED: every `4467 / 4421` figure in the contract carries the superseding `4472 / 4426` reading with the as-filed figure kept visible** (the `+5` are the pin-refresh register's re-derivation; the ONE red is unchanged). |
| **`X-4` — the head `Status:` block reading "NO CODE LANDED"** | **FIXED: the contract's head block carries a dated annotation pointing at the tree state and the ledgers; the as-filed block is kept visible.** |
| **`X-5` (a) the stub route** | = `X-2`, recorded with its owner. |
| **`X-5` (b) `§3.4` item 7's *"the write fails and is absorbed"* beside its own UNVERIFIED carve-out** | **RESOLVED BY CLASSIFICATION: the item's declared behaviour is the module's fail-soft discipline and the item itself marks the shape `[H]`-class/UNVERIFIED; the review records that NO landed row asserts it, and that the one shape it shares with `§3.2` item 7 (a hostile accessor) is now the minted defect row's subject.** No contract text change is owed. |
| **`X-5` (c) `§3.2` item 7 vs `§2.1`** | = `A9`, disposed. |
| **`X-5` (d) `§3.1` item 6's attempted-invocation arm** | **RESOLVED AS THE ARTIFACT ITSELF PROPOSED: the arm is declared UNOBSERVABLE from the caller and asserted only in its observable half (nothing throws, the declared pair is returned).** The contract carries that reading at `§3.1` item 6 / `§3.3` arm (b) (`A-3`) and at `§0C` item 2; **no further change is owed.** |
| **`NT-1`'s tree-state clause — *"the re-pin artifact is authored but UNEXECUTED"*** | **SUPERSEDED BY THE TREE: the `§7.2` re-pin IS now authored inside `uf_layout_10` in `scripts/live-drive.mjs` (VERIFIED-BY-READ by the review pass; `tests/live-drive-contract.test.ts` = `30` `it()` blocks, no new `MATRIX_ROWS` slot).** **The four `[U]` claims stay `UNTAKEN` because the LIVE LEG is `PRECONDITION-FAILED`** — the environmental `/dev/shm` denial, owner `U-DIVERGENCE-SPAWN` — **never because the artifact is missing.** |

## Blindness attestation (the blind pass's own; the section above was appended by the later documentation review)

**Blindness attestation, stated so it is checkable.** **I did not read `src/renderer/modal-state.ts`'s body**, and
**no expected value in this artifact was derived from it or from any `tests/**` file.** What I read as prose:
`docs/specs/unit-pd-ui-6-modal-state.md` (full), `docs/specs/pd-ui-6-adoption-dossier.md`, the named sites of
`docs/specs/post-division-rebuild-proposal.md`, and `docs/specs/unit-pd-ui-1-theme-greens.md` (**house artifact
shape only**). What I read as **machine readings, never as prose**: import-statement/occurence **counts**, the
`md5`/`sha256` digests, the manifest JSON, the `git status` name set, and the `unit: 'PD-UI-6'` row count. What I
**executed**: `src/renderer/modal-state.ts`, `src/shared/overlay.ts` and the two unit test files (via `vitest`).
