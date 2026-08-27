# Green scenarios — Battery §5.5 handler-scenarios (anon/alice/main)

Status: **GREEN (2026-08-23)** — verified against the live battery host by the
battery run (184 checks, 0 failures). This is the blind-test scenario set for
`docs/specs/battery-handlers-unit.md`: an agent who has NOT read the
implementation drives the scenario sequence from these steps against the live
host (`npm run build && node tests/e2e-battery.test.mjs`) and expects every
step to pass.

## Scenario set

### H1 — S1a anon (AUTH-SEAM)

`provident.load { kind:'envelope', envelope: userAuthEnvelope(null, 's1a') }`

- Expect `census.inTree > 1`, `renderedHtml` non-empty, `warnings` an array.
- Drive the after-compile phase: `provident.dispatch { target:'s1a-chip',
  event:'AuthInit' }` → results non-empty (R7).
- `get_rendered_html` shows the chip as a Sign-in link (`Sign In`), NO
  `Log out` (anon has no userData — R8). The `dropdown-menu` string is **ABSENT**
  from the rendered HTML — `AUTH_INIT_BODY` destroys the dropdown child
  (`clientAPI.apply(kids[1].id, {kind:'destroy'})`), and destroyed nodes are
  pruned from the emit (REQ-GAP-11 self-evicting sweep). Assert the `Sign In`
  chip + the absence of BOTH the `Log out` control AND the `dropdown-menu`
  string (D1 — corrected 2026-08-23; earlier revisions claimed the string
  persists).

### H2 — S1b alice (AUTH-SEAM + logout)

`provident.load { kind:'envelope', envelope: userAuthEnvelope({username:'alice'},
's1b'), userData:{username:'alice'} }`

- Drive `AuthInit` on `s1b-chip` → results non-empty.
- `get_rendered_html` shows `Profile ▼` (dropdown survives), `dropdown-menu`
  alive, and the `Log out` control present (R8 — userData alice).
- Dispatch `s1b-logout` (click) → results non-empty; the dropdown is destroyed
  (retention — the `dropdown-menu` string + the authored `Log out` button may
  still emit from the component-def node, but the interactive dropdown state is
  gone) and the page still renders (`Sign In` chip). Assert the dispatch
  succeeded + the page renders, NOT the absence of the `dropdown-menu`/`Log out`
  strings.

### H3 — S2 comments panel (load-phase driven)

`provident.load { kind:'envelope', envelope: mainEnvelope() }`

- Drive the load-phase: dispatch `comments-panel` (load), `broken-widget` (load),
  `multi-panel` (load) — each results non-empty (R7).
- `get_rendered_html` shows exactly 3 `.comment` nodes (`comment-1/2/3`).
- Re-dispatch `comments-panel` (load) → still 3 (idempotent, no dup).

### H4 — S3 weather card

- Dispatch `weather-btn` (click, `value:'Berlin'`) → `Berlin 12°C` + `is-cold`.
- Dispatch `weather-btn` (click, `value:'Madrid'`) → `Madrid 24°C` + `is-warm`.

### H5 — S4 cart badge

- Dispatch `add-a` (click) ×2, `add-b` (click) ×1 → `#cart-badge` = 3.

### H6 — S5 search filter

- Dispatch `search-box` (input, `value:'meta'`) → ≥2 `result-item` (per tree).
- Re-dispatch `search-box` (input, `value:'meta'`) → the count does NOT grow
  (no accumulation — OO-2).

### H7 — S6 tabs

- Dispatch `tab-b` (click) → `tab-b` + `tab-panel-b` gain `is-active`; `tab-a`
  lost it.

### H8 — S7 form submit

- Dispatch `newsletter-form` (submit, `value:''`) → `Please enter an email` +
  `input-error` on the field.
- Dispatch `newsletter-form` (submit, `value:'a@b.co'`) → `Subscribed!` + the
  field lost `input-error`.

### H9 — S8 throwing-handler containment

- `get_rendered_html` shows `vendor unavailable` (the pre-throw write landed).
- Dispatch `broken-widget` (load) → results carry a contained Error
  (`vendor-down`) — the dispatch does NOT throw.

### H10 — S9 toast + dismiss

- Dispatch `toast-trigger` (click) → `toast-1` minted.
- Dispatch `toast-dismiss` (click) → `toast-1` destroyed (retention), the
  `toast-stack` keeps its slot.

### H11 — S10 multi-handler node

- `get_rendered_html` shows `multi-panel` content `loaded` (the load effect).
- Dispatch `multi-panel` (click) → `touched` class added AND the `loaded` effect
  survives (append-with-override).

### H12 — export / validate / teardown (root-only restore)

- `provident.export { format:'legacy' }` → a legacy envelope.
- `provident.validate { kind:'legacy', export }` → `valid === true`. (For the
  seam/def-bearing S1a/S1b/main envelopes that were structurally mutated, the
  `censusMatch` is relaxed per R3 — snapshot-parity only; the export must still
  round-trip VALID.)
- `provident.teardown` → `census.inTree === 1`; `get_rendered_html` is root-only.
  The next scenario boots clean (C4, no cross-scenario leak).

## Cross-scenario leak guard (adversarial hardening)

After the S1b teardown, a subsequent mount must NOT contain any S1b LIVE state
— the teardown restores a root-only graph and clears userData (R8), asserted by
the runner's `assertRootOnly` (`census.inTree === 1`). (The `s1b-dropdown`/
`Log out` strings may still emit from the component-def node in the root-only
view; the leak guard keys on the root-only census, not the def-node string.)
