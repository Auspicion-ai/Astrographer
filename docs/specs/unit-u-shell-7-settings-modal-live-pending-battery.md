# Unit U-SHELL-7 — Settings Modal (C3, shell chrome): LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date:** 2026-09-14.
- **Source contract:** `docs/specs/unit-u-shell-7-settings-modal.md` (GREEN /
  LANDED 2026-09-14). §2.2/2.3 (the modal frame + scrim + fixed bottom-left
  toggle + the `is-open` XOR `is-closed` class contract), §2.4 (toggle / Escape /
  scrim-close + content-click-won't-close), §2.5 (hosting `#panes` +
  `#operator-panes` inside the modal, isolation preserved, no-app-graph HARD
  INVARIANT), §2.6/2.7/2.8 (the `installSettingsModal` wiring + dom-shim +
  source-pin), §3a (pure ModalController states 1–7), §3b (wiring states 8–14),
  §3c (SH7-ADV1..6 adversarial pins), §4 fail-states F1–F12.
- **Greens battery (blind-test, docs-only, already run against the live MODULE
  seam):** the greens set is **node-testable pure + source-pin** — the pure,
  DOM-free `ModalController` (§3a states 1–7 + the §5.7 register P-IM-1 /
  P-SM-1 / P-SM-2 / P-TP-1 / P-TP-2 / P-TP-3) is directly node-assertable with
  plain values; the wiring half (§3b states 8–14, §4 F1–F12) is asserted against
  the **dom-shim** (a synthetic `click`/`keydown` dispatch that fires the shim's
  type-based listeners — §2.7) + the literal **§2.8 source-pin** (the toggle /
  document-`Escape` / direct-scrim `addEventListener` calls, the
  `createModalController({ initialOpen:false })` call, the `isOpen()`-read class
  mirror, the `#panes`+`#operator-panes` re-parent). **No scenario in the greens
  set touches a real browser hit-test or a computed `display`** — the greens
  assert only the class-token XOR (`is-open` XOR `is-closed`) as the node-testable
  proxy (§2.3, review finding 4), never a rendered visibility.
- **Status:** **PARKED — NOT run against the live application.** Pattern
  precedent: `docs/specs/unit-u-shell-shell-wiring-live-pending-battery.md` /
  `docs/specs/unit-ujr1-get-journal-live-pending-battery.md` / the same
  surface-absence park shape. This battery is the handoff for a LATER iteration
  of the live-scenario runner, to be executed once the **Astrographer
  Provident-Electron app is running** (`bash scripts/start-app.sh`) with a real
  rendered DOM and a **UI-interactive / DOM-driver** (e.g. CDP or a real
  pointer/click driver) that can click the shell toggle, observe the modal frame
  + the re-parented operator panes, and hit-test the scrim.

> **PARKED IS NOT A FAILURE.** The module seam is green (pure controller +
> dom-shim wiring + source-pin); the park is a **live-shell-DOM surface absence**
> — the C3 modal is shell chrome and the operator mounts are isolated graphs that
> are MCP-invisible **by construction** — not a regression.

---

## 1. Why this battery is parked (the live-surface assessment)

The U-SHELL-7 unit's LIVE behaviors are **shell-chrome DOM interactions that the
MCP endpoints cannot reach** and that have **no running-app session** this pass.
The park is twofold:

1. **The C3 modal is shell chrome, not a provident node.** The modal frame
   (`#settings-modal`), the scrim (`#settings-modal-scrim`), and the fixed
   bottom-left toggle (`#settings-toggle`) are **plain authored shell-chrome
   elements** (AGENTS.md shell-chrome exception — Table C): no `provident` node,
   no `on:*` handler, **NOT MCP-visible**. The MCP tools
   (`provident.get_rendered_html` / `list_targets` / `dispatch` /
   `get_node_state`) address the **app-graph envelope**, so they can neither
   click the toggle nor observe the modal frame — there is **no MCP tool that
   synthesizes a real toggle click / DOM hit-test**.

2. **The operator mounts are MCP-invisible by construction (isolation).** The
   two mounts re-parented into the modal body — `#panes` (the SecurePanels
   graph: Security Settings + Debug + Module) and `#operator-panes` (the
   SidebarPanes operator graph: `settings` + `gnosis-status` operator panes) —
   each render an **isolated `createIsolatedScope()` graph**. The modal is an
   **isolation-system mount (C3)**; the app Runtime's `dispatch` /
   `get_rendered_html` / `list_targets` **never see it by design** (§2.5). So no
   MCP query can confirm the panes render inside the modal — the confirmation
   requires a real DOM observation of the re-parented mounts.

3. **No running-app session exists in this pass.** There is no Electron app up
   (no MCP listener, no real window/DOM) on which to observe the boot-time
   hidden state, the toggle open/close, the Escape/scrim-close, the class XOR,
   or the re-parented panes.

4. **The node-testable half is already green** — the pure `ModalController`
   (§3a + §5.7 register P-IM-1..P-TP-3), the dom-shim-driven wiring states (§3b
   states 8–14, §4 F1–F12 through synthetic dispatch), and the §2.8 source-pin
   (the literal `addEventListener` / `createModalController` / `isOpen()`-mirror
   / re-parent calls). **What remains is confirming the real-DOM observables** —
   the rendered `#settings-modal.is-closed { display:none }` visibility, the
   real scroll of the toggle, the real scrim hit-test (`pointer-events:auto`,
   SH7-ADV1), the real Escape/scrim keying, and the operator panes actually
   rendering inside the open modal — which requires the **running shell + a
   real pointer/DOM driver**.

Per gate 6, this is a **PENDING SCENARIO BATTERY** — every scenario below is
**parked for a later iteration**, recorded here step-by-step so the revisit runs
them without re-deriving them. **Parked scenarios are NOT a failure.**

---

## 2. The live surfaces that WILL exercise the U-SHELL-7 behavior (after the revisit condition)

| Live surface | U-SHELL-7 behavior it exposes | How to drive it live |
| --- | --- | --- |
| A running Astrographer Provident-Electron app (launch via `bash scripts/start-app.sh`) whose real DOM renders the shell chrome: `#settings-toggle` (fixed bottom-left), `#settings-modal` (with `.is-open`/`.is-closed`), `#settings-modal-scrim`, `#settings-modal-body`, and the two operator mounts `#panes` + `#operator-panes` re-parented into the body once the modal is wired | **Real-DOM state + affordances**: hidden-by-default on boot (`.is-closed` + `display:none`); bottom-left toggle opens/closes; Escape + scrim-click (scrim `pointer-events:auto` — SH7-ADV1) close; content-click does NOT close; `#panes` + `#operator-panes` render INSIDE the open modal `#settings-modal-body`; the `is-open` XOR `is-closed` class; no app-graph pane inside the modal | a **UI-interactive / DOM-driver** (CDP, a real pointer/click driver, or `webContents.sendInputEvent`-style) that can **click `#settings-toggle`**, dispatch a real `keydown` `Escape`, hit-test the scrim zone, dispatch a click on the modal content, and **inspect the computed `display` + `getComputedStyle`** + the modal body's child list |
| The modal's **isolation surface** | **MCP-invisibility of the isolated operator graphs**: `provident.get_rendered_html` / `list_targets` / `dispatch` address the app-graph envelope only — they never see `#panes` / `#operator-panes` / the modal body | any MCP client against the running app: confirm the operator panes are NOT listed as targets and are NOT in `get_rendered_html`, while the app-graph panes ARE |

**Prerequisites for the later run (MANDATORY):**

1. **The app must be running.** Launch via `bash scripts/start-app.sh` (defaults
   already fit this host: `--no-sandbox`, `--disable-dev-shm-usage`,
   `--mcp-transport=http`). The app must boot the renderer so the shell chrome
   (frame + scrim + toggle) exists in the DOM and `installSettingsModal` ran
   AFTER the mounts + `installShellPointers(host)` (§2.6 placement).
2. **A UI-interactive / DOM-driver session.** The live runner (or CDP / renderer
   devtools / a `webContents.sendInputEvent`-style driver / a real OS
   pointer+click driver) must be able to: click `#settings-toggle`, dispatch a
   real `keydown`/click on the scrim, hit-test the scrim zone vs. the content
   subtree, and read back **the computed `display` (`getComputedStyle`)**, the
   frame's real class list, and the modal body's real child list. **This is a
   human-operator / interactive surface — the MCP tool surface alone is NOT
   sufficient** (§1).
3. **Authored, populated chrome.** The shell chrome elements must be present in
   the real DOM (they are authored in `src/renderer/index.html`, §2.2), and the
   two operator mounts (`#panes` + `#operator-panes`) must exist with their
   isolated graphs constructed before `installSettingsModal` runs (§2.6), so the
   live run can observe their panes rendering inside the open modal.

**The check that ends the park:**

- The Astrographer app is running **AND** the shell chrome renders
   (`#settings-toggle` / `#settings-modal` / `#settings-modal-scrim` present)
   **AND** the two operator mounts are re-parented inside `#settings-modal-body`
   **AND** a UI-interactive / DOM-driver can click the toggle + dispatch Escape /
   scrim / content clicks + read the computed `display` + class list. When that
   is possible, run every §3 scenario. The MCP surface alone is NOT sufficient
   (§1) — the toggle/click + the scrim hit-test + the re-parented operator panes
   are not MCP-reachable.

---

## 3. The concrete live scenarios to run once the app + DOM driver is up

Each scenario gives a **precondition**, the **action** (the real click / key /
hit-test sequence), the **expected observable (live)**, and a **pass/fail box**.
**A live result that CONTRADICTS the greens or the spec is a FINDING (a real
regression or a doc/spec drift) — never a pass.**

> **Drive shape.** Real DOM: read `getComputedStyle(modalFrame).display` and the
> frame's real `classList`; click `#settings-toggle`; dispatch a real `keydown`
> with `key === 'Escape'` on `document`; dispatch real `click` events on
> `#settings-modal-scrim` and on content inside `#settings-modal-body`; inspect
> `#settings-modal-body.children` and `innerHTML`. Confirm SH7-ADV1's
> `#settings-modal-scrim { pointer-events: auto }` with a **real hit-test** — a
> click routed to the scrim's zone must land on the scrim element (NOT pass
> through to the modal frame / the page behind).

### 3.1 C3 boot state — the modal is hidden by default

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-C3-hidden-boot** | fresh app boot; `installSettingsModal` ran after the mounts | inspect the real DOM frame `#settings-modal` immediately | the frame carries `.is-closed` (and NOT `.is-open`); `getComputedStyle(frame).display === 'none'` (the rendered visibility, §2.2/2.3: `#settings-modal.is-closed { display:none }`); no toggle-close needed — hidden on boot | [ ] PASS / [ ] FAIL |

### 3.2 C3 toggle — open, then close

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-tgl-open** | modal closed (`.is-closed`, `display:none`) | **click `#settings-toggle`** (the fixed bottom-left affordance) | `#settings-modal` flips to `.is-open` (and not `.is-closed`); computed `display` is the default visible value (NOT `none`); `#settings-modal-body` visible with its operator content; exactly ONE frame class write for the transition | [ ] PASS / [ ] FAIL |
| **LIVE-tgl-close** | modal open (`.is-open`) | **click `#settings-toggle` again** | `#settings-modal` flips back to `.is-closed`; `getComputedStyle(frame).display === 'none'`; exactly ONE class write for the transition | [ ] PASS / [ ] FAIL |

### 3.3 C3 close affordances — Escape and scrim-click

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-esc-close** | modal open (`.is-open`) | dispatch a real `keydown` with `key === 'Escape'` on `document` | `#settings-modal` flips to `.is-closed`; `display:none`; one class write, `onClose` fired once (via the open→closed transition) | [ ] PASS / [ ] FAIL |
| **LIVE-esc-closed-noop** | modal closed | dispatch `keydown` `Escape` again | **no-op** — stays `.is-closed`; `display:none` unchanged; **no class write, no `onClose`** (F3) | [ ] PASS / [ ] FAIL |
| **LIVE-scrim-close** | modal open (`.is-open`) | dispatch a real `click` on `#settings-modal-scrim` (the dedicated scrim child) | `#settings-modal` flips to `.is-closed`; `display:none`; one class write, `onClose` once | [ ] PASS / [ ] FAIL |
| **LIVE-scrim-hit** (SH7-ADV1 confirmation) | modal open | **real hit-test** the scrim zone: send a click at a point that lies over `#settings-modal-scrim`'s box | the event target resolves to `#settings-modal-scrim` (the scrim's `pointer-events: auto` hit target — SH7-ADV1); the scrim-click-to-close actually fires (a degenerate / absent scrim hit target → see §5 note 4, a park extension, NOT a unit failure) | [ ] PASS / [ ] FAIL |

### 3.4 C3 scrim boundary — a content click does NOT close

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-content-no-close** | modal open (`.is-open`) | dispatch a real `click` on an element INSIDE `#settings-modal-body` (a content subtree element — e.g. an operator pane body or a settings row) and let it bubble | the click **does NOT** reach the scrim's DIRECT listener (the content subtree is not an ancestor of the scrim, §2.4) → the modal STAYS `.is-open`; **no class write, no `onClose`** (F12) | [ ] PASS / [ ] FAIL |

### 3.5 C3 hosting — both operator mounts render INSIDE the modal

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-panes-hosted** | app booted; modal open (`.is-open`) | inspect `#settings-modal-body`'s real children / subtree | `#panes` (SecurePanels graph: Security Settings + Debug + Module management) and `#operator-panes` (SidebarPanes operator graph: `settings` + `gnosis-status` operator panes) are **both inside `#settings-modal-body`** (re-parented children, §2.5); their panes render visibly inside the open modal | [ ] PASS / [ ] FAIL |

### 3.6 C3 MCP-invisibility of the isolated operator panes

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-mcp-invisible** | modal open with the operator panes rendering | an MCP client: `provident.list_targets` / `get_rendered_html` (any `dispatch`) against the running app | the app **never** sees the operator panes or the modal body — `list_targets`/`get_rendered_html` return the **app-graph** envelope only; the operator mounts stay **MCP-invisible (isolation preserved, §2.5)** | [ ] PASS / [ ] FAIL |

### 3.7 C3 no-app-graph pane inside the modal (HARD INVARIANT)

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-no-app-pane** | app booted; modal open | inspect `#settings-modal-body`'s subtree + try to re-parent an app-graph element (`#app` / an app-graph pane frame / `#tab-strip` / a gutter) under the modal | the modal's children are **EXACTLY `#panes` + `#operator-panes`** — **NO app-graph pane / `#app` / `#tab-strip` / gutter ever appears inside the modal** (HARD INVARIANT, §2.5/§4 F9); the graphs keep their isolated mounts (the re-parent is ancestry-only, not a destroy — F10) | [ ] PASS / [ ] FAIL |

### 3.8 C3 the `is-open` XOR `is-closed` class contract

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-class-xor** | any sequence of real opens/closes — boot(hidden) → toggle-open → Escape-close → toggle-open → scrim-close → toggle-open → content-click (stay-open) | after **EVERY** real open/close/affordance step, read the frame's real `classList` | the frame carries **exactly one** of `{is-open, is-closed}` at every instant — `is-open` ⟺ open (visible), `is-closed` ⟺ closed; never both, never neither; the class set is driven by the real open/close (the §2.3 XOR single source of truth) | [ ] PASS / [ ] FAIL |

---

## 4. LIVE-surface assessment probes (verified before parking)

Probed before parking to record the current, documented live-surface state:

- `ps aux | grep -iE 'electron|astrographer|provident|battery-host'` → **no
  Astrographer/Provident-Electron app process** running (no real DOM to inspect,
  no `#settings-toggle` to click).
- `curl -s http://127.0.0.1:3787/mcp` → **`000`/connection refused** (no
  Streamable-HTTP MCP listener; the default HTTP MCP port per
  `scripts/start-app.sh`).
- **By construction (this unit's core reason to park):** the C3 modal is
  **shell chrome** (not a provident node) and the operator mounts are
  **isolated graphs** (MCP-invisible). Even with the app up, the MCP surface
  exposes the **app graph**, NOT the shell chrome or the isolated operator
  graphs — so neither the toggle/click nor the operator-pane rendering is
  reachable via the MCP endpoints. A **UI-interactive / DOM-driver** is the only
  surface that can exercise this unit's LIVE scenarios (§1, §2).

**Conclusion:** the live surface required to exercise the §3 scenarios — a
running app with a real DOM + a UI-interactive/DOM-driver able to click the
toggle + hit-test the scrim + observe the re-parented operator panes — is **not
available this pass**. All §3 scenarios are parked.

---

## 5. Parked-scenario census

- **Total greens scenarios:** the pure ModalController states (§3a states 1–7) +
  the wiring states (§3b states 8–14) + the §4 fail-states F1–F12 + the §5.7
  register rows P-IM-1 / P-SM-1 / P-SM-2 / P-TP-1 / P-TP-2 / P-TP-3 — all
  **PASS at the module seam** (pure + dom-shim + source-pin).
- **Parked for a live DOM run (require the running app + a real
  UI-interactive/DOM-driver):** the **LIVE-C3 scenarios in §3.1–§3.8** —
  hidden-by-default on boot, toggle open/close, Escape-close + Escape-closed
  no-op, scrim-click-close + scrim hit-test (SH7-ADV1), content-click
  no-close, both operator mounts hosted in the modal, MCP-invisibility of the
  operator panes, no-app-graph-pane-in-modal, and the `is-open` XOR `is-closed`
  class contract — **11 live scenario ids.**
- **Run live this iteration: 0** (no running-app session; the MCP surface does
  not expose the shell chrome or the isolated operator graphs — §1).
- **Not a failure:** the module seam is green (pure + dom-shim + source-pin); the
  park is a **live-shell-DOM surface absence** — the modal is shell chrome, the
  operator mounts are MCP-invisible by construction, and there is no running-app
  session this pass.

---

## 6. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** a **running-app
   (`bash scripts/start-app.sh`) session** with a **UI-interactive / DOM-driver**
   (e.g. CDP or a real pointer/click driver) able to **click `#settings-toggle` +
   observe `#settings-modal` + the re-parented operator panes**. The MCP
   reachability check (`curl -s http://127.0.0.1:3787/mcp`) is NOT by itself
   sufficient for THIS unit — the MCP surface alone exposes the app graph, not
   the shell chrome or the isolated operator graphs (§1).
2. **Drive shape:** real DOM — `getComputedStyle(frame).display`, the real
   `classList`, real `click` on `#settings-toggle`, real `keydown` `Escape` on
   `document`, a **real hit-test** of `#settings-modal-scrim` vs. the content
   subtree, and inspection of `#settings-modal-body.children` / `innerHTML`.
   `webContents.sendInputEvent` (Electron), CDP, or renderer devtools are the
   natural drivers for the interactive gestures.
3. **SH7-ADV6 (INFO) to confirm during the live run (wired-marker commit
   order):** the per-document wired-marker is committed at the **end** of the
   install (`settingsModalWiredDoc`), so a pre-commit throw could in theory let a
   retry duplicate the toggle/Escape/scrim listeners. Today it is unreachable
   (the re-parent `appendChild` is guarded). The live run MUST double-trigger the
   install path (observe the affordance listeners stay singular — clicking the
   toggle once flips the state exactly once, not twice) to confirm
   SH7-ADV6's assumption holds against the real app.
4. **SH7-ADV1 + SH7-ADV6 are the items the live run must confirm.** A
   **degenerate / absent scrim hit-target** (the `#settings-modal-scrim{
   pointer-events:auto }` fix not applying, so the scrim zone passes clicks
   through) is a **park-extension** — record it and re-confirm in the live run;
   it is **NOT** a unit failure (the source-pin for SH7-ADV1 is green). The
   wiring's node seam stays green either way.
5. **A live result that CONTRADICTS the greens or the spec is a FINDING** (a
   real regression or a doc/spec drift) — never a pass. Report it to the
   supervisor with the observed real-DOM outcome (computed `display` / class
   list / scrim hit target / modal-body child list) against the §3 expected
   observable.
6. **No `src/**` or `tests/**` change is sanctioned by this battery** — it is a
   verification artifact only. If a live run finds a HOST defect, record it in
   `docs/defects.md` + `docs/HANDOFF.md` per AGENTS.md; the host is fixed here,
   never handed off.
7. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec §section numbers, the authored `#settings-modal` /
   `#settings-toggle` / `#settings-modal-scrim` / `#settings-modal-body`
   elements in `index.html`, the exact `is-open`/`is-closed` class contract, and
   whether the SH7-ADV1/ADV2/ADV3 fixes still hold in source) and the trackers
   (`docs/next-steps.md`, `docs/pending.md`, `docs/decisions.md`). The unit is
   GREEN / LANDED in source.
