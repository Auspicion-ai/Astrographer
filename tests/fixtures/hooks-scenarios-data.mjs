// tests/fixtures/hooks-scenarios-data.mjs — the DATA-ONLY port of the upstream
// hooks-scenarios fixture for the e2e battery §5.3 (docs/specs/battery-hooks-unit.md).
//
// PROVENANCE: the envelope builder (`hooksScenariosEnvelope`) + the handler
// body consts below are a faithful data port of the upstream
// `../Preempt-Providence/demo/hooks-scenarios.js` (SET_THEME_BODY / LOGIN_BODY /
// LOGOUT_BODY / COUNTER_TICK_BODY + the theme/user/counter provider envelope),
// fetched 2026-08-23. ONLY the DATA half is ported: the upstream PAGE/harness
// half (dist/core/* imports, the runner, the server-data census) is dropped.
//
// This repo-authored additions (provenance-noted):
//   - the 4 CONTAINMENT PROBE buttons (hook-name-unresolved / hook-mode-blocked /
//     hook-kind-mismatch / hook-seam-exempt) whose handler bodies RETURN the
//     `clientAPI.apply` result so the verdict surfaces in `dispatch.results`;
//   - a `hooksKind: { 'kind-probe': 'component' }` declaration + a scalar
//     `kind-probe` source anchor to REACH the R15 `hook-kind-mismatch` verdict;
//   - a `SetTheme` def-shaped ({name, body}) provider anchor retained so the
//     `hook-seam-exempt` probe has a seam/def-shaped name to target.
//
// Data-only: pure object builders + function-STRING consts; NO imports.

// ---- handler bodies (upstream provenance) -----------------------------------
const SET_THEME_BODY = `function (event, context) {
  var value = event.value == null ? 'dark' : String(event.value);
  var provider = event.target;
  while (provider && provider.parent) { provider = provider.parent; }
  if (!provider) return;
  var res = context.clientAPI.apply(provider.id, [{ targetProp: 'hooks.theme', mode: 'replace', value: value }]);
  return res.status;
}`

const LOGIN_BODY = `function (event, context) {
  var value = event.value == null ? 'alice (admin)' : String(event.value);
  var provider = event.target;
  while (provider && provider.parent) { provider = provider.parent; }
  if (!provider) return;
  var res = context.clientAPI.apply(provider.id, [{ targetProp: 'hooks.user', mode: 'replace', value: value }]);
  return res.status;
}`
const LOGOUT_BODY = `function (event, context) {
  var provider = event.target;
  while (provider && provider.parent) { provider = provider.parent; }
  if (!provider) return;
  var res = context.clientAPI.apply(provider.id, [{ targetProp: 'hooks.user', mode: 'replace', value: 'guest' }]);
  return res.status;
}`
const COUNTER_TICK_BODY = `function (event, context) {
  var v = Number(event.value);
  if (Number.isNaN(v)) return;
  var provider = event.target;
  while (provider && provider.parent) { provider = provider.parent; }
  if (!provider) return;
  var res = context.clientAPI.apply(provider.id, [{ targetProp: 'hooks.counter', mode: 'replace', value: v }]);
  return res.status;
}`

// ---- containment probe bodies (THIS-REPO-authored) ---------------------------
// Each returns the `clientAPI.apply` RESULT object so the verdict (status /
// error.code) surfaces in `dispatch.results` (the Runtime's dispatch report
// only carries handler return values).
const PROBE_NAME_UNRESOLVED = `function (event, context) {
  var provider = event.target;
  while (provider && provider.parent) { provider = provider.parent; }
  if (!provider) return;
  var res = context.clientAPI.apply(provider.id, [{ targetProp: 'hooks.nosuch', mode: 'replace', value: 'x' }]);
  return res;
}`
const PROBE_MODE_BLOCKED = `function (event, context) {
  var provider = event.target;
  while (provider && provider.parent) { provider = provider.parent; }
  if (!provider) return;
  var res = context.clientAPI.apply(provider.id, [{ targetProp: 'hooks.theme', mode: 'append', value: 'x' }]);
  return res;
}`
const PROBE_KIND_MISMATCH = `function (event, context) {
  var provider = event.target;
  while (provider && provider.parent) { provider = provider.parent; }
  if (!provider) return;
  var res = context.clientAPI.apply(provider.id, [{ targetProp: 'hooks.kind-probe', mode: 'replace', value: 'x' }]);
  return res;
}`
const PROBE_SEAM_EXEMPT = `function (event, context) {
  var provider = event.target;
  while (provider && provider.parent) { provider = provider.parent; }
  if (!provider) return;
  var res = context.clientAPI.apply(provider.id, [{ targetProp: 'hooks.SetTheme', mode: 'replace', value: 'x' }]);
  return res;
}`

// ---- the envelope builder (upstream data port) ------------------------------
export function hooksScenariosEnvelope() {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'hooks-root' },
        children: [
          // ---- S1 — the theme switcher card ---------------------------------
          {
            type: 'section',
            props: { id: 'theme-card' },
            css: { classes: ['scenario-card', 'theme-card'] },
            children: [
              { type: 'h3', props: { id: 'theme-title' }, content: 'Scenario 1 — Theme switcher (hooks.theme)' },
              {
                type: 'div',
                props: { id: 'theme-readout' },
                css: { classes: ['theme-readout'] },
                component: [{ reference: 'theme' }],
                derived: { props: { themeName: { $: 'bindings.theme' } } },
              },
              {
                type: 'button',
                props: { id: 'theme-light-btn' },
                css: { classes: ['control-btn'] },
                content: 'Set light theme',
                handlers: [{ name: 'SetTheme', event: 'click', format: 'legacy', body: SET_THEME_BODY }],
              },
              {
                type: 'button',
                props: { id: 'theme-dark-btn' },
                css: { classes: ['control-btn'] },
                content: 'Set dark theme',
                handlers: [{ name: 'SetTheme', event: 'click', format: 'legacy', body: SET_THEME_BODY }],
              },
            ],
          },
          // ---- S2 — the user/session panel card -----------------------------
          {
            type: 'section',
            props: { id: 'session-card' },
            css: { classes: ['scenario-card', 'session-card'] },
            children: [
              { type: 'h3', props: { id: 'session-title' }, content: 'Scenario 2 — User/session panel (hooks.user)' },
              {
                type: 'div',
                props: { id: 'session-readout' },
                css: { classes: ['session-readout'] },
                component: [{ reference: 'user' }],
                derived: { props: { sessionLabel: { $: 'bindings.user' } } },
              },
              {
                type: 'button',
                props: { id: 'login-btn' },
                css: { classes: ['control-btn'] },
                content: 'Log in as alice',
                handlers: [{ name: 'Login', event: 'click', format: 'legacy', body: LOGIN_BODY }],
              },
              {
                type: 'button',
                props: { id: 'logout-btn' },
                css: { classes: ['control-btn'] },
                content: 'Log out',
                handlers: [{ name: 'Logout', event: 'click', format: 'legacy', body: LOGOUT_BODY }],
              },
            ],
          },
          // ---- S3 — the live counter/badge card -----------------------------
          {
            type: 'section',
            props: { id: 'counter-card' },
            css: { classes: ['scenario-card', 'counter-card'] },
            children: [
              { type: 'h3', props: { id: 'counter-title' }, content: 'Scenario 3 — Live counter / badge (hooks.counter)' },
              {
                type: 'div',
                props: { id: 'counter-readout' },
                css: { classes: ['counter-readout', 'counter-badge'] },
                component: [{ reference: 'counter' }],
                derived: { props: { count: { $: 'bindings.counter' } } },
              },
              {
                type: 'button',
                props: { id: 'counter-inc-btn' },
                css: { classes: ['control-btn'] },
                content: '+1',
                handlers: [{ name: 'CounterTick', event: 'click', format: 'legacy', body: COUNTER_TICK_BODY }],
              },
              {
                type: 'button',
                props: { id: 'counter-dec-btn' },
                css: { classes: ['control-btn'] },
                content: '-1',
                handlers: [{ name: 'CounterTick', event: 'click', format: 'legacy', body: COUNTER_TICK_BODY }],
              },
            ],
          },
          // ---- S4 — the containment probes card (this-repo-authored) --------
          {
            type: 'section',
            props: { id: 'probe-card' },
            css: { classes: ['scenario-card', 'probe-card'] },
            children: [
              { type: 'h3', props: { id: 'probe-title' }, content: 'Scenario 4 — hook containment probes' },
              {
                type: 'button',
                props: { id: 'probe-name-btn' },
                css: { classes: ['control-btn'] },
                content: 'name-unresolved',
                handlers: [{ name: 'ProbeName', event: 'click', format: 'legacy', body: PROBE_NAME_UNRESOLVED }],
              },
              {
                type: 'button',
                props: { id: 'probe-mode-btn' },
                css: { classes: ['control-btn'] },
                content: 'mode-blocked',
                handlers: [{ name: 'ProbeMode', event: 'click', format: 'legacy', body: PROBE_MODE_BLOCKED }],
              },
              {
                type: 'button',
                props: { id: 'probe-kind-btn' },
                css: { classes: ['control-btn'] },
                content: 'kind-mismatch',
                handlers: [{ name: 'ProbeKind', event: 'click', format: 'legacy', body: PROBE_KIND_MISMATCH }],
              },
              {
                type: 'button',
                props: { id: 'probe-seam-btn' },
                css: { classes: ['control-btn'] },
                content: 'seam-exempt',
                handlers: [{ name: 'ProbeSeam', event: 'click', format: 'legacy', body: PROBE_SEAM_EXEMPT }],
              },
            ],
          },
        ],
        component: [
          { reference: 'theme', value: 'dark' },
          { reference: 'user', value: 'guest' },
          { reference: 'counter', value: 0 },
          // the R15 hook-kind-mismatch target: a scalar source anchor declared
          // as a NON-value kind (mints nodes) — a scalar value write is rejected.
          { reference: 'kind-probe', value: 0 },
          // the seam-exempt target: a def-shaped {name, body} provider — hooking
          // it would tear down the seam, so the write is exempt (no-op + warn).
          { reference: 'SetTheme', value: { name: 'SetTheme', body: SET_THEME_BODY } },
        ],
        hooks: ['theme', 'user', 'counter'],
        hooksKind: { 'kind-probe': 'component' },
      },
    },
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}
