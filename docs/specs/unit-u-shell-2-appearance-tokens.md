# Unit U-SHELL-2 — Appearance Tokens + Tri-State Theme (C1) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate: UI-overhaul
umbrella gate (PROCEED-WITH-AMENDMENTS); decision `UI-CONFIG-CARRIER`. Open
items: `docs/specs/wave-1-open-decisions.md` W1-Q4/Q5.

---

## 1. What the proposal asks

A **light/dark mode toggle that defaults to the OS theme** (C1). Today
`index.html` uses `:root { color-scheme: light dark }` + a hard-coded
`@media (prefers-color-scheme: dark)` block and there is **no manual toggle or
persistence**.

Deliver: a token layer + a tri-state appearance setting (`system` | `light` |
`dark`) whose default is `system`, persisted in the serialized UI-config
(`UI-CONFIG-CARRIER`, C9), with `system` resolving the OS preference live.

---

## 2. Contract (pinned)

### 2.1 Tokens (shell CSS)

- Replace the hard-coded scheme colors with **CSS custom properties on
  `:root`** (`--bg`, `--fg`, `--muted`, `--card-bg`, `--border`, `--accent`, …).
- Two token sets selected by a root attribute:
  `html[data-theme='light'] { … }` / `html[data-theme='dark'] { … }`.
- The shell chrome + every pane read the tokens (pane CSS uses `var(--…)`), so a
  theme switch is one attribute flip.

### 2.2 Tri-state setting

- `OperatorSettings` gains `theme: 'system' | 'light' | 'dark'` (additive,
  fail-soft `sanitize`: anything but `light`/`dark` → `system`).
- **`system`** → resolve live via `window.matchMedia('(prefers-color-scheme:
  dark)')`; subscribe to its `change` event and re-apply while the setting is
  `system` (W1-Q5 default (a)).
- **`light`/`dark`** → apply that token set; the OS listener is inert.

### 2.3 Application surface

- The **shell** applies the theme by setting `document.documentElement`
  `data-theme` (the renderer). This is Table C shell chrome (must cover the
  shell + the operator scope).
- The **control** is an operator-settings control (`system`/`light`/`dark`),
  persisted through the C9 carrier. Until U-SHELL-7 (the modal) lands, the
  control may live in the existing operator settings pane.

### 2.4 Boot

- Read the persisted `theme` at boot; apply it; when `system`, attach the
  `matchMedia` listener. A missing/corrupt value → `system`.

---

## 3. States (TestWriter red set — valid paths)

1. Default (no setting) → `data-theme` follows the OS preference.
2. `theme='light'` → the light token set; the OS dark preference is ignored.
3. `theme='dark'` → the dark token set.
4. `theme='system'` + OS change event → `data-theme` updates live.
5. Toggling the control persists `theme` through the operator-settings IPC and
   applies immediately.
6. A restart with a persisted `light` shows light before/without a flash (best
   effort — see open item).
7. The operator scope (`#operator-panes`) and the app graph both theme.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | corrupt/unknown `theme` | coerced to `system` (never throws) |
| F2 | `matchMedia` unavailable | degrade to the light default; no throw |
| F3 | a settings write failure | the in-memory theme still applies for the session |
| F4 | credentials | NEVER serialized in the UI-config (carrier rule) |

---

## 5. Census

- Token layer in `src/renderer/index.html`; `theme` field in
  `operator-settings-store.ts` (+ `OperatorSettings` type + `sanitize`); a tiny
  `applyTheme`/`watchSystemTheme` helper (renderer); the operator control.
- 0 new dependencies.

---

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C1, §3.2 (C9 carrier), §4 G10, §7 Q1/Q5.
- `docs/specs/unit-u-shell-7-settings-modal.md` (the eventual control home).
- `src/renderer/index.html`, `src/main/operator-settings-store.ts`,
  `src/main/preload.ts` (operator-settings IPC).

---

## 7. Delimitation

Appearance only. It does NOT build the settings modal (U-SHELL-7) or move the
control there; it does NOT introduce any other UI-config field.
