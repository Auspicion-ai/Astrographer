// tests/fixtures/handlers-scenarios-data.mjs — the DATA-ONLY port of the
// upstream handlers-scenarios fixture for the e2e battery §5.5
// (docs/specs/battery-handlers-unit.md).
//
// PROVENANCE: the envelope builders (`userAuthEnvelope` / `mainEnvelope`) + the
// handler body consts below are a faithful data port of the upstream
// `../Preempt-Providence/demo/handlers-scenarios.js` (AUTH_INIT_BODY /
// LOGOUT_BODY / COMMENTS_BODY / CLEAR_BODY / WEATHER_BODY / ADD_TO_CART_BODY /
// FILTER_BODY / SELECT_TAB_BODY / SUBMIT_BODY / VENDOR_BODY / SHOW_TOAST_BODY /
// DISMISS_BODY / LOAD_PANEL_BODY / TOUCH_PANEL_BODY + the anon/alice/main
// envelopes), fetched 2026-08-23. ONLY the DATA half is ported: the upstream
// PAGE/harness half (dist/core/* imports, the runner, the server-data census,
// the browser mount pipeline) is dropped.
//
// Data-only: pure object builders + function-STRING consts; NO imports.

// ---- handler bodies (upstream provenance) -----------------------------------
const AUTH_INIT_BODY = `function (event, context) {
  var node = context.node;
  var ud = context.supervisor ? context.supervisor.userData : null;
  var kids = node && node.children ? node.children : [];
  if (kids.length < 2) return;
  if (ud && ud.username) {
    kids[0].receiveNextState({ content: 'Profile \\u25bc' });
  } else {
    kids[0].receiveNextState({ type: 'a', props: { href: '/api/oauth/login' }, content: 'Sign In' });
    context.clientAPI.apply(kids[1].id, { kind: 'destroy' });
  }
}`

const LOGOUT_BODY = `function (event, context) {
  var container = event.target;
  var chip = null;
  while (container && !chip) {
    chip = container.findNode({ classes: ['chip-slot'] });
    if (!chip) container = container.parent;
  }
  if (!chip) return;
  var kids = chip.children || [];
  if (kids.length >= 2) {
    context.clientAPI.apply(kids[1].id, { kind: 'destroy' });
    kids[0].receiveNextState({ content: 'Sign In' });
  }
}`

const COMMENTS_BODY = `function (event, context) {
  var panel = context.node;
  while (panel && (!panel.css || !panel.css.classes || panel.css.classes.indexOf('comments-panel') === -1)) {
    panel = panel.parent;
  }
  if (!panel) return;
  var comments = [
    { type: 'div', css: { classes: ['comment'] }, props: { id: 'comment-1' }, content: 'First comment' },
    { type: 'div', css: { classes: ['comment'] }, props: { id: 'comment-2' }, content: 'Second comment' },
    { type: 'div', css: { classes: ['comment'] }, props: { id: 'comment-3' }, content: 'Third comment' }
  ];
  panel.receiveNextState({ children: comments });
}`

const CLEAR_BODY = `function (event, context) {
  var panel = event.target && event.target.parent;
  while (panel && (!panel.css || !panel.css.classes || panel.css.classes.indexOf('comments-panel') === -1)) {
    panel = panel.parent;
  }
  if (!panel) return;
  var kids = panel.children || [];
  for (var i = 0; i < kids.length; i++) {
    var k = kids[i];
    if (k.css && k.css.classes && k.css.classes.indexOf('comment') !== -1) {
      context.clientAPI.apply(k.id, { kind: 'destroy' });
    }
  }
}`

const WEATHER_BODY = `function (event, context) {
  var city = String(event.value == null ? '' : event.value).trim() || 'Berlin';
  var cold = city === 'Berlin' || city === 'Oslo';
  var temp = cold ? 12 : 24;
  var card = event.target && event.target.parent;
  if (!card) return;
  var cur = card.css && card.css.classes ? card.css.classes.slice() : [];
  var next = [];
  for (var i = 0; i < cur.length; i++) {
    if (cur[i] !== 'is-cold' && cur[i] !== 'is-warm') next.push(cur[i]);
  }
  next.push(cold ? 'is-cold' : 'is-warm');
  card.receiveNextState({
    content: city + ' ' + temp + '\\u00b0C',
    props: { temperature: String(temp) },
    css: { classes: next }
  });
}`

const ADD_TO_CART_BODY = `function (event, context) {
  var container = event.target && event.target.parent;
  var badge = null;
  while (container && !badge) {
    badge = container.findNode({ classes: ['cart-badge'] });
    if (!badge) container = container.parent;
  }
  if (!badge) return;
  var n = (Number(badge.content) || 0) + 1;
  badge.receiveNextState({ content: String(n) });
}`

const FILTER_BODY = `function (event, context) {
  var titles = ['Home', 'Meta Tools', 'Analysis', 'Meta Guide', 'About'];
  var q = String(event.value == null ? '' : event.value).toLowerCase();
  var filtered = [];
  for (var i = 0; i < titles.length; i++) {
    if (titles[i].toLowerCase().indexOf(q) !== -1) {
      filtered.push({ type: 'div', css: { classes: ['result-item'] }, content: titles[i] });
    }
  }
  var wrap = event.target && event.target.parent;
  var list = wrap ? wrap.findNode({ classes: ['results-list'] }) : null;
  if (!list) return;
  list.receiveNextState({ children: filtered });
}`

const SELECT_TAB_BODY = `function (event, context) {
  var tab = event.target;
  if (!tab || !tab.css || !tab.css.classes || !tab.parent) return;
  var classes = tab.css.classes;
  var key = null;
  for (var i = 0; i < classes.length; i++) {
    if (classes[i].indexOf('tab-') === 0 && classes[i] !== 'tab-panel' && classes[i].indexOf('tab-panel-') !== 0) {
      key = classes[i].slice(4);
      break;
    }
  }
  if (!key) return;
  var container = tab.parent;
  var panelClass = 'tab-panel-' + key;
  var kids = container.children || [];
  for (var i = 0; i < kids.length; i++) {
    var k = kids[i];
    var kc = k.css && k.css.classes ? k.css.classes : [];
    var isTabLike = false;
    for (var j = 0; j < kc.length; j++) {
      if (kc[j] === 'tab' || kc[j] === 'tab-panel' || kc[j].indexOf('tab-panel-') === 0 || (kc[j].indexOf('tab-') === 0 && kc[j] !== 'tab-panel')) {
        isTabLike = true;
        break;
      }
    }
    if (!isTabLike) continue;
    var chosen = kc.indexOf('tab-' + key) !== -1 || kc.indexOf(panelClass) !== -1;
    var hadActive = false;
    var next = [];
    for (var j = 0; j < kc.length; j++) {
      if (kc[j] === 'is-active') { hadActive = true; continue; }
      next.push(kc[j]);
    }
    if (chosen) next.push('is-active');
    if (hadActive !== chosen) k.receiveNextState({ css: { classes: next } });
  }
}`

const SUBMIT_BODY = `function (event, context) {
  event.preventDefault();
  var v = String(event.value == null ? '' : event.value).trim();
  var field = event.target.findNode({ classes: ['newsletter-input'] });
  var status = event.target.findNode({ classes: ['form-status'] });
  if (!field || !status) return;
  var cur = field.css && field.css.classes ? field.css.classes.slice() : [];
  var next = [];
  for (var i = 0; i < cur.length; i++) {
    if (cur[i] !== 'input-error') next.push(cur[i]);
  }
  if (!v) {
    next.push('input-error');
    field.receiveNextState({ css: { classes: next } });
    status.receiveNextState({ content: 'Please enter an email' });
  } else {
    field.receiveNextState({ css: { classes: next } });
    status.receiveNextState({ content: 'Subscribed!' });
  }
}`

const VENDOR_BODY = `function (event, context) {
  if (context.node) context.node.receiveNextState({ content: 'vendor unavailable' });
  throw new Error('vendor-down');
}`

const SHOW_TOAST_BODY = `function (event, context) {
  var parent = event.target && event.target.parent;
  var stack = parent ? parent.findNode({ classes: ['toast-stack'] }) : null;
  if (!stack) return;
  stack.receiveNextState({
    children: [
      { type: 'div', css: { classes: ['toast'] }, props: { id: 'toast-1' }, content: 'Saved! (dismiss below)' }
    ]
  });
}`

const DISMISS_BODY = `function (event, context) {
  var parent = event.target && event.target.parent;
  var stack = parent ? parent.findNode({ classes: ['toast-stack'] }) : null;
  if (!stack) return;
  var kids = stack.children || [];
  for (var i = 0; i < kids.length; i++) {
    if (kids[i].css && kids[i].css.classes && kids[i].css.classes.indexOf('toast') !== -1) {
      context.clientAPI.apply(kids[i].id, { kind: 'destroy' });
    }
  }
}`

const LOAD_PANEL_BODY = `function (event, context) {
  if (context.node) context.node.receiveNextState({ content: 'loaded' });
}`
const TOUCH_PANEL_BODY = `function (event, context) {
  if (context.node) context.node.receiveNextState({ css: { classes: ['touched'] } });
}`

// ---- envelope builders (upstream data port) ---------------------------------

/** S1 — the auth dropdown (AUTH-SEAM). `userData` (the payload's first-wins
 *  passthrough) drives the signed-in branch. Rendered TWICE (anon / alice) —
 *  one envelope per variant, since userData is per-translate. The logout
 *  control is AUTHORED in the header of the signed-in variant. */
export function userAuthEnvelope(userData, prefix) {
  const children = [
    { type: 'span', props: { id: `${prefix}-brand` }, content: 'Preempt News' },
    {
      type: 'div',
      props: { id: `${prefix}-chip` },
      css: { classes: ['chip-slot'] },
      component: [{ reference: 'userAuth', target: 'type' }],
    },
  ]
  if (userData) {
    children.push({
      type: 'button',
      props: { id: `${prefix}-logout` },
      css: { classes: ['logout-btn'] },
      content: 'Log out',
      component: [{ target: 'handlers.click', reference: 'Logout' }],
    })
  }
  return {
    template: {
      root: {
        type: 'div',
        props: { id: `${prefix}-root` },
        children: [
          {
            type: 'header',
            props: { id: `${prefix}-header` },
            css: { classes: ['site-header'] },
            children,
          },
        ],
      },
      component: [
        {
          reference: 'userAuth',
          value: {
            type: 'div',
            css: { classes: ['user-auth-dropdown'] },
            component: [{ target: 'handlers.afterAssembly', reference: 'AuthInit' }],
            children: [
              {
                type: 'button',
                props: { id: `${prefix}-btn` },
                css: { classes: ['auth-main-btn'] },
                content: 'Account',
              },
              {
                type: 'div',
                props: { id: `${prefix}-dropdown` },
                css: { classes: ['dropdown-menu'] },
                content: 'Menu: log out (the logout control is the authored button in the header)',
              },
            ],
          },
        },
        { reference: 'AuthInit', value: { name: 'AuthInit', body: AUTH_INIT_BODY } },
        { reference: 'Logout', value: { name: 'Logout', body: LOGOUT_BODY } },
      ],
    },
    content: userData
      ? [{ userData, content: [{ type: 'div', props: { id: `${prefix}-session` }, content: 'session payload' }] }]
      : [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

/** Scenarios 2–10 — one self-contained envelope (a card per scenario). */
export function mainEnvelope() {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'hs-root' },
        children: [
          // ---- Scenario 2 — comments panel ---------------------------------
          {
            type: 'section',
            props: { id: 's2-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's2-title' }, content: 'Scenario 2 — Server content load: comments panel (mocked fetch)' },
              {
                type: 'div',
                props: { id: 'comments-panel' },
                css: { classes: ['comments-panel'] },
                component: [{ target: 'handlers.load', reference: 'LoadComments' }],
                children: [
                  {
                    type: 'button',
                    props: { id: 'comments-refresh' },
                    css: { classes: ['small-btn'] },
                    content: 'Refresh',
                    component: [{ target: 'handlers.click', reference: 'LoadComments' }],
                  },
                  {
                    type: 'button',
                    props: { id: 'comments-clear' },
                    css: { classes: ['small-btn'] },
                    content: 'Clear',
                    component: [{ target: 'handlers.click', reference: 'ClearComments' }],
                  },
                ],
              },
            ],
          },
          // ---- Scenario 3 — weather card ------------------------------------
          {
            type: 'section',
            props: { id: 's3-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's3-title' }, content: 'Scenario 3 — Third-party widget: weather card (mocked API)' },
              {
                type: 'div',
                props: { id: 'weather-card' },
                css: { classes: ['weather-card'] },
                content: 'no report yet',
                children: [
                  {
                    type: 'button',
                    props: { id: 'weather-btn', 'data-city': 'Berlin' },
                    css: { classes: ['weather-btn'] },
                    content: 'Load weather (Berlin)',
                    component: [{ target: 'handlers.click', reference: 'WeatherHandler' }],
                  },
                ],
              },
            ],
          },
          // ---- Scenario 4 — cart badge --------------------------------------
          {
            type: 'section',
            props: { id: 's4-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's4-title' }, content: 'Scenario 4 — Cart badge: add-to-cart counter' },
              {
                type: 'header',
                props: { id: 'cart-header' },
                css: { classes: ['cart-header'] },
                children: [
                  { type: 'span', props: { id: 'cart-label' }, content: 'Cart: ' },
                  { type: 'span', props: { id: 'cart-badge' }, css: { classes: ['cart-badge'] }, content: '0' },
                ],
              },
              {
                type: 'div',
                props: { id: 'product-list' },
                css: { classes: ['product-list'] },
                children: [
                  {
                    type: 'div',
                    css: { classes: ['product'] },
                    content: 'Widget A',
                    children: [
                      {
                        type: 'button',
                        props: { id: 'add-a' },
                        css: { classes: ['add-btn'] },
                        content: 'Add',
                        component: [{ target: 'handlers.click', reference: 'AddToCart' }],
                      },
                    ],
                  },
                  {
                    type: 'div',
                    css: { classes: ['product'] },
                    content: 'Gadget B',
                    children: [
                      {
                        type: 'button',
                        props: { id: 'add-b' },
                        css: { classes: ['add-btn'] },
                        content: 'Add',
                        component: [{ target: 'handlers.click', reference: 'AddToCart' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          // ---- Scenario 5 — search filter ----------------------------------
          {
            type: 'section',
            props: { id: 's5-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's5-title' }, content: 'Scenario 5 — Search filter: input-driven list (mocked dataset)' },
              {
                type: 'div',
                props: { id: 'search-wrap' },
                css: { classes: ['search-wrap'] },
                children: [
                  {
                    type: 'input',
                    props: { id: 'search-box' },
                    css: { classes: ['search-box'] },
                    component: [{ target: 'handlers.input', reference: 'FilterList' }],
                  },
                  { type: 'div', props: { id: 'results-list' }, css: { classes: ['results-list'] } },
                ],
              },
            ],
          },
          // ---- Scenario 6 — tabs --------------------------------------------
          {
            type: 'section',
            props: { id: 's6-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's6-title' }, content: 'Scenario 6 — Tabs: active-state css toggling across the tree' },
              {
                type: 'div',
                props: { id: 'tabs' },
                css: { classes: ['tabs'] },
                children: [
                  {
                    type: 'button',
                    props: { id: 'tab-a' },
                    css: { classes: ['tab', 'tab-a', 'is-active'] },
                    content: 'Tab A',
                    component: [{ target: 'handlers.click', reference: 'SelectTab' }],
                  },
                  {
                    type: 'button',
                    props: { id: 'tab-b' },
                    css: { classes: ['tab', 'tab-b'] },
                    content: 'Tab B',
                    component: [{ target: 'handlers.click', reference: 'SelectTab' }],
                  },
                  { type: 'div', props: { id: 'tab-panel-a' }, css: { classes: ['tab-panel', 'tab-panel-a', 'is-active'] }, content: 'Panel A' },
                  { type: 'div', props: { id: 'tab-panel-b' }, css: { classes: ['tab-panel', 'tab-panel-b'] }, content: 'Panel B' },
                ],
              },
            ],
          },
          // ---- Scenario 7 — form submit -------------------------------------
          {
            type: 'section',
            props: { id: 's7-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's7-title' }, content: 'Scenario 7 — Form submit: validation + status message (mocked)' },
              {
                type: 'form',
                props: { id: 'newsletter-form' },
                css: { classes: ['newsletter-form'] },
                component: [{ target: 'handlers.submit', reference: 'SubmitNews' }],
                children: [
                  { type: 'input', props: { id: 'newsletter-input' }, css: { classes: ['newsletter-input'] } },
                  { type: 'button', props: { id: 'newsletter-submit' }, content: 'Subscribe' },
                  { type: 'div', props: { id: 'form-status' }, css: { classes: ['form-status'] }, content: '' },
                ],
              },
            ],
          },
          // ---- Scenario 8 — throwing-handler containment --------------------
          {
            type: 'section',
            props: { id: 's8-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's8-title' }, content: 'Scenario 8 — Throwing-handler containment + fallback' },
              {
                type: 'div',
                props: { id: 'broken-widget' },
                css: { classes: ['broken-widget'] },
                content: 'widget placeholder',
                component: [{ target: 'handlers.load', reference: 'VendorWidget' }],
              },
            ],
          },
          // ---- Scenario 9 — toast -------------------------------------------
          {
            type: 'section',
            props: { id: 's9-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's9-title' }, content: 'Scenario 9 — Toast: injected child + dismiss (RE-EXPRESSED: the dismiss binding is authored — the layer-apply mint drops the payload\u2019s anchors)' },
              { type: 'div', props: { id: 'toast-stack' }, css: { classes: ['toast-stack'] } },
              {
                type: 'button',
                props: { id: 'toast-trigger' },
                css: { classes: ['toast-trigger'] },
                content: 'Show toast',
                component: [{ target: 'handlers.click', reference: 'ShowToast' }],
              },
              {
                type: 'button',
                props: { id: 'toast-dismiss' },
                css: { classes: ['toast-dismiss-btn'] },
                content: 'Dismiss toast',
                component: [{ target: 'handlers.click', reference: 'DismissToast' }],
              },
            ],
          },
          // ---- Scenario 10 — multi-handler node -----------------------------
          {
            type: 'section',
            props: { id: 's10-card' },
            css: { classes: ['scenario-card'] },
            children: [
              { type: 'h3', props: { id: 's10-title' }, content: 'Scenario 10 — Multi-handler node: load + click on ONE node' },
              {
                type: 'div',
                props: { id: 'multi-panel' },
                css: { classes: ['multi-panel'] },
                content: 'panel',
                component: [
                  { target: 'handlers.load', reference: 'LoadPanel' },
                  { target: 'handlers.click', reference: 'TouchPanel' },
                ],
              },
            ],
          },
        ],
      },
      component: [
        { reference: 'LoadComments', value: { name: 'LoadComments', body: COMMENTS_BODY } },
        { reference: 'ClearComments', value: { name: 'ClearComments', body: CLEAR_BODY } },
        { reference: 'WeatherHandler', value: { name: 'WeatherHandler', body: WEATHER_BODY } },
        { reference: 'AddToCart', value: { name: 'AddToCart', body: ADD_TO_CART_BODY } },
        { reference: 'FilterList', value: { name: 'FilterList', body: FILTER_BODY } },
        { reference: 'SelectTab', value: { name: 'SelectTab', body: SELECT_TAB_BODY } },
        { reference: 'SubmitNews', value: { name: 'SubmitNews', body: SUBMIT_BODY } },
        { reference: 'VendorWidget', value: { name: 'VendorWidget', body: VENDOR_BODY } },
        { reference: 'ShowToast', value: { name: 'ShowToast', body: SHOW_TOAST_BODY } },
        { reference: 'DismissToast', value: { name: 'DismissToast', body: DISMISS_BODY } },
        { reference: 'LoadPanel', value: { name: 'LoadPanel', body: LOAD_PANEL_BODY } },
        { reference: 'TouchPanel', value: { name: 'TouchPanel', body: TOUCH_PANEL_BODY } },
      ],
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

/** All three envelopes, keyed by mount. */
export function handlersScenariosEnvelopes() {
  return {
    anon: userAuthEnvelope(null, 's1a'),
    alice: userAuthEnvelope({ username: 'alice' }, 's1b'),
    main: mainEnvelope(),
  }
}
