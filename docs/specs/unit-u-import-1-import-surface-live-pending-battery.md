# Unit U-IMPORT-1 — File → Import… FS/Browse Surface (C17): LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date:** 2026-09-14.
- **Source contract:** `docs/specs/unit-u-import-1-import-surface.md` (SPEC-RATIFIED /
  READY-FOR-TDD 2026-09-14+). §2.2/§2.3 (the platform-aware dialog shape — W1-N2: the
  multi-file `Import…` DEFAULT on all platforms, the separate `Import folder…`
  `['openDirectory']` item on win/linux, macOS-only combined file+directory dialog),
  §2.4 (the `resolveImportSelection` → `importMarkdownCorpus` routing with a
  **server-fixed** default-store `corpusRoot`), §2.5 (the one-way main→renderer
  `IPC_IMPORT_RESULT` broadcast), §2.8 (the source-pin), §3a (pure core states 1–6),
  §3b (wiring states 7–10), §3c (IMPORT-ADV-1..3, adversarial — fixed), §4 fail-states
  F1–F15, §5.7 (P-IM-1..3 / P-TP-1..5 register), §5.8 (the census).
- **Greens battery (blind-test, docs-only, already run against the live MODULE
  seam):** the greens set is **node-testable pure + source-pin** — the pure,
  DOM/Electron-free core (§2.1 `expandImportDirectory` / `buildImportDialogOptions` /
  `resolveImportSelection`, §3a states 1–6, §4 F1–F15 via temp-dir fixtures + plain
  values, §5.7 P-IM-1..3 / P-TP-1..5) is directly node-assertable with `node:fs`
  temp-dir fixtures; the integration wiring (§3b states 7–10, §2.4, §2.8) is asserted
  against the **§2.8 source-pin** (the literal `buildMenuTemplate` two-item File menu,
  the `AppMenuActions.openImportFolder()` seam, the
  `dialog.showOpenDialog(win, buildImportDialogOptions(platform))` +
  `{ properties:['openDirectory'] }` calls, the `resolveImportSelection(selection,
  { max })` branch, the `importMarkdownCorpus(ctx, { files,
  corpusRoot: defaultEntry.corpusRoot }, storeCtx)` call, and the
  `backend.broadcast(IPC_IMPORT_RESULT, payload)` / `IPC_RAG_STORE_CHANGED`
  exactly-once wires). **No scenario in the greens set touches a real native menu click
  or a real `dialog.showOpenDialog`** — the greens assert the pure outcomes and the
  statically-pinned source shape only, never the OS dialog.
- **Status:** **PARKED — NOT run against the live application.** Pattern precedent:
  `docs/specs/unit-u-shell-7-settings-modal-live-pending-battery.md` /
  `docs/specs/unit-u-shell-shell-wiring-live-pending-battery.md` (the same
  live-surface-absence park shape). This battery is the handoff for a LATER iteration
  of the live-scenario runner, to be executed once the **Astrographer
  Provident-Electron app is running** (`bash scripts/start-app.sh`) with a
  **UI-interactive / OS-dialog driver** that can click the native **File → Import… /
  Import folder…** menu items and drive `dialog.showOpenDialog`.

> **PARKED IS NOT A FAILURE.** The module seam is green (pure `import-directory.ts` +
> source-pin + the blind-greens set); the park is a **live-native-dialog-surface
> absence** — the File menu is a native Electron menu and the picker is an
> **OS-owned `dialog.showOpenDialog`**, neither reachable via the node test surface
> or the MCP endpoints — not a regression.

---

## 1. Why this battery is parked (the live-surface assessment)

The U-IMPORT-1 unit's LIVE behaviors are **native Electron menu + OS-file-dialog
interactions that neither the node test surface nor the MCP endpoints can reach** and
that have **no running-app session** this pass. The park is:

1. **The File → Import… menu is a NATIVE Electron menu (the shell carve-out).** The
   File menu is authored in the Electron shell (`buildMenuTemplate` /
   `AppMenuActions`, `src/main/app-menu.ts`) — **AGENTS.md shell-chrome exception**
   (ui-overhaul §2.1 Table C): it is **not** a provident node, has **no `on:*`
   handler**, and is **NOT reachable** through the MCP dispatch surface. No MCP tool
   can click a native Electron menu item.
2. **The picker is `dialog.showOpenDialog` — OS-owned.** Selecting
   `.md`/`.markdown` files or a directory happens in the **operating system's
   file-picker window**, not in the renderer DOM. The MCP `dispatch` /
   `get_rendered_html` / `list_targets` tools address the **app-graph envelope / the
   renderer DOM**, so they can neither open the dialog nor drive a selection inside
   it. The dialog is owned by the OS — a live run MUST automate the OS picker (or
   verify the menu opens the dialog and then inject a **fixed selection** to exercise
   the **post-dialog path**).
3. **The `IPC_IMPORT_RESULT` broadcast** (`provident:import-result` → renderer) is a
   main→renderer one-way channel observable only in a **running Electron app**. The
   result surface (a status visible in the renderer) requires the real renderer to be
   up.
4. **No running-app session exists in this pass.** There is no Electron app up (no MCP
   listener, no real window/DOM) on which to observe the native menu, the OS dialog,
   or the renderer-side status.
5. **The node-testable half is already green** — the pure `import-directory.ts` core
   (§2.1 `expandImportDirectory` / `buildImportDialogOptions` /
   `resolveImportSelection`, §3a states 1–6, §4 F1–F15 through temp-dir fixtures +
   plain values, §5.7), the §2.8 source-pin (the two-item File menu, the
   `openImportFolder()` seam, the `buildImportDialogOptions(platform)` +
   `['openDirectory']` dialog calls, the `importMarkdownCorpus` server-fixed-`corpusRoot`
   call, the `IPC_IMPORT_RESULT`/`IPC_RAG_STORE_CHANGED` exactly-once wires), and the
   §3c adversarial fixes (IMPORT-ADV-1..3). **What remains is confirming the
   real-OS observables** — the native `Import…` / `Import folder…` items actually
   opening their dialogs, a real selection flowing through `importMarkdownCorpus` into
   a new doc in the store/doc-nav, the directory expansion against a real picked
   directory, the fail-loud on a real >512-file directory, and the
   `IPC_IMPORT_RESULT` broadcast — which requires the **running shell + an OS-dialog /
   post-dialog driver**.

Per gate 6, this is a **PENDING SCENARIO BATTERY** — every scenario below is
**parked for a later iteration**, recorded here step-by-step so the revisit runs
them without re-deriving them. **Parked scenarios are NOT a failure.**

---

## 2. The live surfaces that WILL exercise the U-IMPORT-1 behavior (after the revisit condition)

| Live surface | U-IMPORT-1 behavior it exposes | How to drive it live |
| --- | --- | --- |
| A running Astrographer Provident-Electron app (launch via `bash scripts/start-app.sh`) whose **native File menu** carries the platform-aware items: `Import…` (all platforms) and, on win/linux, the separate **`Import folder…`** | **Real menu affordances + the OS dialog launch**: `Import…` opens the multi-file `dialog.showOpenDialog` (`.md`/`.markdown` filter, `['openFile','multiSelections']`); on win/linux `Import folder…` opens the `['openDirectory']` dialog | a **UI-interactive / OS-dialog driver** (CDP + an OS-picker automator e.g. the platform's dialog-drive API, or a `webContents`/`sendInputEvent`-style menu-dispatch) that can **click the native File → Import… / Import folder… items** and drive the **OS-owned `dialog.showOpenDialog`** picker — OR verify the items open the dialog and then inject a **fixed selection** to exercise the **post-dialog path** |
| The OS `dialog.showOpenDialog` picker (the `md`/`markdown`-filtered file dialog; the win/linux `['openDirectory']` dialog) | **Real selection → `resolveImportSelection` → `importMarkdownCorpus`**: select one `.md`; select multiple `.md`; pick a directory (top-level `.md` only, nested excluded); pick a >512-file directory (fail-loud, no silent truncate); cancel/dismiss (no-op) | **OS-picker automation** (the dialog is OS-owned — see §4 for the concrete options); the **post-dialog path** (resolution + import + broadcast) is exercised by injecting a fixed selection |
| The running renderer / the main-process broadcast wiring | **The `IPC_IMPORT_RESULT` broadcast** (`provident:import-result`): a renderer-visible status fires **exactly once** on a success (ok summary), once for a fail-loud outcome, and **zero** times for a cancel | a renderer listener / the running app's status surface; confirm the channel fires with the pinned `ImportResultPayload` (§2.5) the expected number of times |
| The running app's store / doc-nav | **A new document appears** after a successful single/multi-file import via `importMarkdownCorpus` | observe the default store / doc-nav gains the imported document(s) in the live UI |
| The MCP `edit.import_markdown` tool | **MCP-UI equivalence (unchanged handler)**: the tool still routes through the SAME `importMarkdownCorpus` handler and its schema stays `files`-only; it is UNCHANGED by the browse surface | an MCP client against the running app: call `edit.import_markdown` and confirm it is byte-equivalent behavior to the browse route on the same files |

**Prerequisites for the later run (MANDATORY):**

1. **The app must be running.** Launch via `bash scripts/start-app.sh` (defaults
   already fit this host: `--no-sandbox`, `--disable-dev-shm-usage`,
   `--mcp-transport=http`). The app must boot the Electron shell so the **native File
   menu** exists (`buildMenuTemplate` ran), the two action seams
   (`openImport()` / `openImportFolder()`) are wired in `main.ts`, and the renderer is
   up to receive the `IPC_IMPORT_RESULT` broadcast.
2. **An OS-dialog / post-dialog driver session.** The live runner (or CDP +
   OS-picker automation, `webContents`-style native-menu dispatch, or a real
   OS pointer+click driver) must be able to: **click the native File → Import… /
   Import folder… items** and either automate the **OS-owned `dialog.showOpenDialog`**
   picker OR verify the items open the dialog and then **inject a fixed selection** to
   exercise the post-dialog path. **The MCP tool surface alone is NOT sufficient**
   (§1) — no MCP tool clicks a native menu item or drives the OS dialog.
3. **Authored, wired shell.** The File menu must carry the platform-aware item set
   (`Import…`, and on win/linux `Import folder…` — §2.3), and the two
   `AppMenuActions` seams must be wired to their dialogs in `main.ts` (§2.4/§2.8), with
   `IPC_IMPORT_RESULT` registered in `src/shared/types.ts` (§2.5).

**The check that ends the park:**

- The Astrographer app is running **AND** its native File menu exposes the
  platform-aware `Import…` / `Import folder…` items (the `md`/`markdown`-filtered
  multi-file dialog on all platforms; `['openDirectory']` on win/linux)
  **AND** an **OS-dialog / post-dialog driver** can click those items and either drive
  the **OS-owned picker** (or inject a fixed selection to exercise the post-dialog
  path) **AND** the renderer can observe the `IPC_IMPORT_RESULT` broadcast. When that
  is possible, run every §3 scenario. The MCP surface alone is NOT sufficient (§1) —
  the native menu click + the OS dialog selection are not MCP-reachable.

---

## 3. The concrete live scenarios to run once the app + OS-dialog driver is up

Each scenario gives a **precondition**, the **action** (the real native-menu click /
OS-dialog selection / post-dialog injection sequence), the **expected observable
(live)**, and a **pass/fail box**. **A live result that CONTRADICTS the greens or the
spec is a FINDING (a real regression or a doc/spec drift) — never a pass.**

> **Drive shape.** Real native menu: click **File → Import…** (all platforms) and, on
> win/linux, **File → Import folder…** (`['openDirectory']`). Drive the **OS-owned
> `dialog.showOpenDialog`** picker — select `.md` file(s), a directory, or **cancel/
> dismiss** — OR, if the OS picker cannot be automated headless, **verify the menu item
> opens the dialog** and then **inject a fixed selection** (a synthetic
> `resolveImportSelection` input / a stubbed dialog result) to exercise the
> **post-dialog path** (resolution + `importMarkdownCorpus` + broadcast). Observe the
> **`IPC_IMPORT_RESULT` broadcast** and the **store / doc-nav** in the live renderer.

### 3.1 C17 the native File menu — platform-aware import items

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-menuitem-import** (all platforms) | app booted; the native File menu is present | **click File → Import…** | the OS **`dialog.showOpenDialog`** opens with the **`.md`/`.markdown` filter** (`[{ name:'Markdown', extensions:['md','markdown'] }]`) and multi-file selection (`['openFile','multiSelections']`) (W1-N2, §2.2/§2.3) — the dialog actually opens | [ ] PASS / [ ] FAIL |
| **LIVE-menuitem-import-folder** (win/linux only) | app booted on a **win32/linux** platform | **click File → Import folder…** (the SEPARATE item) | a SEPARATE `dialog.showOpenDialog` opens with `{ properties:['openDirectory'] }` (directory bulk upload, W1-N2 §2.3) — distinct from the `Import…` multi-file dialog | [ ] PASS / [ ] FAIL |
| **LIVE-menuitem-darwin-combined** (darwin only) | app booted on **darwin** | **click File → Import…** | the combined dialog opens with `['openFile','multiSelections','openDirectory']` (file AND directory in ONE dialog, §2.2 table) — **no separate `Import folder…` item** exists | [ ] PASS / [ ] FAIL |

### 3.2 C17 live select-one → import

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-single-md** | app booted; File → Import… dialog open (or a fixed single-`.md` selection injected) | select ONE `.md` file (or inject the single-`.md` selection) and confirm | the file **imports via `importMarkdownCorpus`** (the SAME handler the MCP tool uses); **a new document appears in the store / doc-nav**; an **`IPC_IMPORT_RESULT` broadcast fires once** with the `ok:true` summary (`documentIds`/`nodeCount`/`edgeCount`/`resolvedCount===1`, §2.5) | [ ] PASS / [ ] FAIL |

### 3.3 C17 live multi-select → all imported

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-multi-md** | app booted; File → Import… dialog open (or a fixed N-`.md` selection injected) | select MULTIPLE `.md` files (multi-file DEFAULT) and confirm | ALL selected files import via `importMarkdownCorpus` (one aggregate `files: string[]`, deduped + codepoint-sorted, §2.1); **ALL appear as new documents in the store / doc-nav**; `IPC_IMPORT_RESULT` fires once with `resolvedCount === N`; `IPC_RAG_STORE_CHANGED` fires once (the structural re-traversal, §2.4) | [ ] PASS / [ ] FAIL |

### 3.4 C17 live select-directory → top-level `.md` imported (nested excluded)

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-dir-expand** | app booted; File → Import… / Import folder… dialog open (or a fixed directory selection injected) | select a directory holding top-level `a.md`/`b.markdown` + a nested `sub/c.md` + dot-entries + non-md files, and confirm | the directory **expands to its TOP-LEVEL `.md`/`.markdown` only** (`a.md`, `b.markdown`); the **nested `sub/c.md` is NOT imported** (non-recursive, Q17); dot-entries / non-md / symlinks dropped (§2.1 rules); those files import via `importMarkdownCorpus` and appear in the store/doc-nav | [ ] PASS / [ ] FAIL |

### 3.5 C17 live fail-loud — a >`MAX_IMPORT_FILES` (512) directory

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-cap-exceeded** | app booted; a directory containing **>512** matching top-level `.md`/`.markdown` files | select that directory and confirm | **FAIL-LOUD — no silent truncate**: NO import at all; `IPC_IMPORT_RESULT` fires once with `{ ok:false, reason:'cap-exceeded', cap:512 }` (§2.5); NOT a truncated subset (F6); `IPC_RAG_STORE_CHANGED` fires 0 times (F12 discipline) | [ ] PASS / [ ] FAIL |

### 3.6 C17 live broadcast discipline

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-broadcast-once-ok** | a successful import completes | observe the `IPC_IMPORT_RESULT` channel | the `IPC_IMPORT_RESULT` broadcast fires **EXACTLY ONCE** on success (a renderer-visible status), with the `ok:true` summary (§2.5) | [ ] PASS / [ ] FAIL |
| **LIVE-cancel-noop** | File → Import… dialog open | **cancel / dismiss** the OS dialog (or return a `null` selection) | **zero** resolution, **zero** import, **zero** broadcast — the cancelled dialog fires **NOTHING** on `IPC_IMPORT_RESULT` (F4, §2.4 step 2); no new document appears | [ ] PASS / [ ] FAIL |
| **LIVE-broadcast-import-failed** | a selected file fails inside `importMarkdownCorpus` (domain failure) | drive an import that returns `{ ok:false, error, failedFile? }` | `IPC_IMPORT_RESULT` fires once with the `import-failed` outcome; the engine is NOT reconciled; `IPC_RAG_STORE_CHANGED` fires 0 times (F12) | [ ] PASS / [ ] FAIL |

### 3.7 C17 MCP-UI equivalence — the MCP `edit.import_markdown` tool is UNCHANGED

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-mcp-unchanged** | app booted with the MCP surface up | an MCP client calls `edit.import_markdown` with the same `files` a browse run would resolve | the tool routes through the **SAME `importMarkdownCorpus` handler** (identical result shape — the browse surface is a parallel entry path, NOT a new/changed handler); the tool schema stays **`files`-only** (ADV-1); the browse surface adds **NO MCP tool and does not change the existing tool** (§6/§7 — the browse surface does NOT trigger a native dialog via MCP) | [ ] PASS / [ ] FAIL |

### 3.8 C17 the `corpusRoot` stays server-fixed

| Scenario id | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **LIVE-corpusroot-fixed** | app booted; a browse/directory import resolves a set of files | confirm the `importMarkdownCorpus` call feeds the **default store's `corpusRoot`** (`defaultEntry.corpusRoot`), never a root derived from the selection | the browse surface **never re-roots** — `corpusRoot` stays the default store's **server-fixed** value (the project root when unconfigured; §2.4 step 5); an empty resolved dir inside a non-root corpus means "no md at that scope", never a root change (F11) | [ ] PASS / [ ] FAIL |

---

## 4. LIVE-surface assessment probes (verified before parking)

Probed before parking to record the current, documented live-surface state:

- `ps aux | grep -iE 'electron|astrographer|provident|battery-host'` → **no
  Astrographer/Provident-Electron app process** running (the only Electron process is
  an unrelated Discord crashpad handler; no native File menu to click, no OS dialog,
  no renderer to receive the broadcast).
- `curl -s http://127.0.0.1:3787/mcp` → **`000`/connection refused** (no
  Streamable-HTTP MCP listener; the default HTTP MCP port per `scripts/start-app.sh`).
- **By construction (this unit's core reason to park):** the **File → Import… /
  Import folder… items are a NATIVE Electron menu** (AGENTS.md shell-chrome carve-out,
  ui-overhaul §2.1 Table C) and the picker is an **OS-owned `dialog.showOpenDialog`** —
  neither is a provident node nor a renderer-DOM element. Even with the app up, the
  MCP surface exposes the **app graph / renderer DOM**, NOT the native menu, and **no
  MCP tool can drive the OS file dialog**. A **UI-interactive / OS-dialog (or
  post-dialog injection) driver** is the only surface that can exercise this unit's
  LIVE scenarios (§1, §2).

**Conclusion:** the live surface required to exercise the §3 scenarios — a running
app with the native File menu + an OS-dialog / post-dialog driver able to click
**File → Import… / Import folder…**, drive (or inject a fixed result after verifying)
the **`dialog.showOpenDialog`**, and observe the **`IPC_IMPORT_RESULT` broadcast** in
the renderer — is **not available this pass**. All §3 scenarios are parked.

---

## 5. Parked-scenario census

- **Total greens scenarios:** the pure core states (§3a states 1–6) + the wiring states
  (§3b states 7–10) + the §4 fail-states F1–F15 + the §5.7 register rows
  P-IM-1..3 / P-TP-1..5 — all **PASS at the module seam** (pure node test + source-pin;
  the §3c adversarial fixes IMPORT-ADV-1..3 are host-fixed).
- **Parked for a live OS-dialog run (require the running app + a real UI-interactive /
  OS-dialog driver):** the **LIVE-C17 scenarios in §3.1–§3.8** — the native
  `Import…` / `Import folder…` menu items opening their dialogs, select-one → import →
  new-doc, multi-select → all imported, select-directory → top-level-only expansion,
  the >512-file fail-loud (no silent truncate), the `IPC_IMPORT_RESULT`
  exactly-once / cancel-zero / import-failed broadcast discipline, the MCP
  `edit.import_markdown` unchanged-equivalence, and the server-fixed `corpusRoot` —
  **10 live scenario ids.**
- **Run live this iteration: 0** (no running-app session; the native-menu + OS-dialog
  surface is not MCP-reachable and no OS-dialog driver exists this pass — §1).
- **Not a failure:** the module seam is green (pure core + source-pin + the §3c
  fixes); the park is a **live-native-dialog-surface absence** — the File menu is
  native Electron shell chrome, the picker is OS-owned, and there is no running-app
  session (nor an OS-dialog driver) this pass.

---

## 6. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** a **running-app
   (`bash scripts/start-app.sh`) session** with a **UI-interactive / OS-dialog driver**
   able to **click the native File → Import… / Import folder… items** and drive the
   `dialog.showOpenDialog`. **CDP alone cannot drive a native dialog** — the dialog is
   **OS-owned**, so the live run MUST automate the **OS picker** (the platform's
   dialog-drive API / accessibility automator) **OR** verify the menu items open the
   dialog and then **inject a fixed selection** to exercise the **post-dialog path**
   (resolution → `importMarkdownCorpus` → `IPC_IMPORT_RESULT` broadcast → new doc in
   the store/doc-nav). The MCP reachability check
   (`curl -s http://127.0.0.1:3787/mcp`) is NOT by itself sufficient for THIS unit —
   the MCP surface alone exposes the app graph/renderer DOM, not the native menu or the
   OS dialog (§1).
2. **Drive shape:** real native menu — click **File → Import…** (all platforms) / on
   win/linux **File → Import folder…**; drive the **OS** picker (or, headless-inject,
   verify the menu opens the dialog then stub the dialog result to a fixed selection);
   observe the **`IPC_IMPORT_RESULT` channel** in the running renderer and the **store/
   doc-nav** for the new documents. `webContents`-style native-menu dispatch, CDP +
   OS-picker automation, or a real OS pointer+click driver + the platform's picker
   automator are the natural drivers for the interactive gestures.
3. **Note on driving the native dialog:** the OS-owned `dialog.showOpenDialog` cannot
   be driven by CDP/headless renderer tools — it is a modal OS window. The live run
   MUST either (a) automate the OS picker, or (b) — the documented fallback — verify
   the menu item opens the dialog, dismiss it, and **inject a fixed selection** (a
   synthetic `resolveImportSelection` input at the §2.4 seam / a stubbed dialog result)
   so the **post-dialog path** (resolution + `importMarkdownCorpus` + the
   `IPC_IMPORT_RESULT` broadcast exactly-once) is exercised against the live wiring.
   Either shape is a valid §3 run; a menu item that does NOT open its dialog at all is
   a FAIL.
4. **The items the live run must confirm:** the native win/linux **TWO-item** File menu
   (`Import…` + `Import folder…`) vs. darwin ONE combined item (§3.1); the
   **top-level-only, nested-excluded, dot/symlink-skipped, non-md-dropped** directory
   expansion against a REAL picked directory (§3.4); the **>512-file FAIL-LOUD** with
   `cap:512`, **no silent truncate**, and **0 × `IPC_RAG_STORE_CHANGED`** (§3.5); the
   **`IPC_IMPORT_RESULT` exactly-once / cancel-zero / import-failed** discipline
   (§3.6); the **MCP `edit.import_markdown` unchanged** (same handler, `files`-only
   schema, no new MCP tool, no native dialog via MCP — §3.7); and the **server-fixed
   `corpusRoot`** (never re-rooted by the browse surface — §3.8).
5. **A live result that CONTRADICTS the greens or the spec is a FINDING** (a real
   regression or a doc/spec drift) — never a pass. Report it to the supervisor with the
   observed real-OS outcome (which menu item, what the dialog opened with, what the
   import broadcast/doc-nav showed) against the §3 expected observable.
6. **No `src/**` or `tests/**` change is sanctioned by this battery** — it is a
   verification artifact only. If a live run finds a HOST defect, record it in
   `docs/defects.md` + `docs/HANDOFF.md` per AGENTS.md; the host is fixed here, never
   handed off.
7. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec §section numbers, the authored `Import…` / `Import folder…`
   menu items + `AppMenuActions.openImport()` / `.openImportFolder()` in
   `src/main/app-menu.ts`, the `import-directory.ts` exports, the
   `src/main/main.ts` wiring, `IPC_IMPORT_RESULT` in `src/shared/types.ts`, and whether
   the §3c IMPORT-ADV-1..3 fixes still hold in source) and the trackers
   (`docs/next-steps.md`, `docs/pending.md`, `docs/decisions.md`). The unit is GREEN at
   the module seam; the live native-dialog surface remains unverified.
