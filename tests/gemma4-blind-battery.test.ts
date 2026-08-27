import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { Runtime } from '../src/renderer/runtime.js';
import { installShim, mountEl } from '../src/shared/dom-shim.js';
import { demoEnvelope } from '../src/shared/demo-envelope.js';
import { translateLegacy, serializeSlice } from 'provident-ssr';
import {
  pathForkCycleLegacyData,
} from '../src/shared/path-fork-cycle.js';
import {
  hooksScenariosEnvelope
} from '../tests/fixtures/hooks-scenarios-data.mjs';
import {
  userAuthEnvelope,
} from '../tests/fixtures/handlers-scenarios-data.mjs';
import { SecurePanels } from '../src/renderer/secure-panels.js';

beforeAll(() => {
  installShim();
});

describe('Gemma4 Blind Battery', () => {
  let runtime: Runtime;
  let mount: HTMLElement;

  beforeEach(() => {
    mount = mountEl();
    runtime = new Runtime({ mount, envelope: demoEnvelope() });
    runtime.bootstrap();
  });

  describe('Part 1 — Runtime host capabilities', () => {
    it('S1. loadEnvelope census', () => {
      // PREDICTION: PASS. Census.inTree > 1, registered >= inTree.
      const census = runtime.loadEnvelope(demoEnvelope());
      expect(census.inTree).toBeGreaterThan(1);
      expect(census.registered).toBeGreaterThanOrEqual(census.inTree);
    });

    it('S2. userData no-leak', async () => {
      // PREDICTION: PASS. Second dispatch renders ANON.
      // userEnvelope is NOT pinned (D4): reconstructed from runtime-host.md §3.1
      // R8 prose. The ud-read node carries a legacy-format handler that renders
      // the translate-scoped supervisor.userData.username (or ANON when absent).
      const userEnv = {
        template: {
          root: {
            type: 'div',
            children: [{
              type: 'div',
              css: { id: 'ud-read' },
              handlers: [{
                name: 'ReadUser',
                event: 'click',
                format: 'legacy',
                body: `function (event, context) {
                  var ud = context.supervisor ? context.supervisor.userData : null;
                  var who = ud && ud.username ? ud.username : 'ANON';
                  event.target.receiveNextState({ content: who });
                }`,
              }],
            }],
          },
        },
        content: [],
        clientConfig: { runInstantiation: true, runRendering: true },
      };

      runtime.loadEnvelope(userEnv, { userData: { username: 'alice' } });
      await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' });
      expect(runtime.renderedHtmlResult().renderedHtml).toContain('alice');

      runtime.loadEnvelope(userEnv); // No userData
      await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' });
      expect(runtime.renderedHtmlResult().renderedHtml).toContain('ANON');
      expect(runtime.renderedHtmlResult().renderedHtml).not.toContain('alice');
    });

    it('S3. loadDoc snapshot-parity', () => {
      // PREDICTION: PASS. census.inTree > 1 and renders counter.
      const t = translateLegacy(demoEnvelope());
      const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false });
      const census = runtime.loadDoc(doc);
      expect(census.inTree).toBeGreaterThan(1);
      expect(runtime.renderedHtmlResult().renderedHtml).toContain('counter');
    });

    it('S4. applyCommand reject — non-string node', () => {
      // PREDICTION: PASS. {status: 'rejected'}
      const res = runtime.applyCommand({ kind: 'clone-instance', node: 5 as any, source: 'x', slot: 'y' });
      expect(res).toEqual({ status: 'rejected' });
    });

    it('S5. applyCommand non-object command', () => {
      // PREDICTION: PASS. Both return {status: 'rejected'}.
      // applyCommand(null) is exactly {status:'rejected'}; op() enriches with
      // render views + warnings (R10), so assert .status, not deep-equality.
      expect(runtime.applyCommand(null as any)).toEqual({ status: 'rejected' });
      const opRes = runtime.op(undefined as any);
      expect(opRes.status).toBe('rejected');
    });

    it('S6. applyCommand unknown kind', () => {
      // PREDICTION: PASS. {status: 'rejected'}
      const res = runtime.applyCommand({ kind: 'bogus-kind' } as any);
      expect(res).toEqual({ status: 'rejected' });
    });

    it('S7. op applied shape', () => {
      // PREDICTION: PASS. {status: 'applied', renderedHtml, ssrHtml, warnings}
      // Probing vocab: spec says 'state-slice' in behavior, 'state-slice' in OpCommand list.
      const targets = runtime.listTargets().nodes;
      const counterNodeId = targets.find(n => n.cssId === 'counter')?.nodeId;
      
      const res = runtime.op({
        kind: 'state-slice',
        node: counterNodeId!,
        mutation: [{ targetProp: 'content', mode: 'replace', value: '9' }]
      });
      
      expect(res.status).toBe('applied');
      expect(res).toHaveProperty('renderedHtml');
      expect(res).toHaveProperty('ssrHtml');
      expect(res).toHaveProperty('warnings');
    });

    it('S8. export + validate round-trip', () => {
      // PREDICTION: PASS. valid:true, censusMatch:true.
      // validateExport returns {valid, censusMatch, warnings} with NO
      // treeSigMatch (D5); only validate() adds treeSigMatch (a boolean).
      const exp = runtime.exportLegacy();
      const val = runtime.validateExport('legacy', exp);
      expect(val.valid).toBe(true);
      expect(val.censusMatch).toBe(true);

      const ser = runtime.exportSerialized();
      const valSer = runtime.validate('serialized', ser);
      expect(valSer.valid).toBe(true);
      expect(valSer.censusMatch).toBe(true);
      expect(typeof valSer.treeSigMatch).toBe('boolean');
    });

    it('S9. validateExport bogus kind', () => {
      // PREDICTION: PASS. {valid:false, censusMatch:false}
      const res = runtime.validateExport('bogus' as any, { a: 1 });
      expect(res.valid).toBe(false);
      expect(res.censusMatch).toBe(false);
    });

    it('S10. teardown mount state', async () => {
      // PREDICTION: PASS. inTree === 1, mount.innerHTML === '' (empty).
      // D11 corrected: teardown leaves an EMPTY mount (inTree===1 is the
      // graph's root-only census, but the root element is NOT re-emitted);
      // the unit test runtime-host.test.ts:157 asserts innerHTML === ''.
      const res = await runtime.teardownResult();
      expect(res.census.inTree).toBe(1);
      expect(mount.innerHTML).toBe('');
    });

    it('S11. teardown idempotent', async () => {
      // PREDICTION: PASS. inTree === 1 both times.
      await runtime.teardownResult();
      const c1 = await runtime.teardownResult();
      expect(c1.census.inTree).toBe(1);
    });

    it('S12. destroyed cssId unresolved', async () => {
      // PREDICTION: PASS. THROWS /unresolved target/
      await runtime.teardownResult();
      expect(() => runtime.nodeState({ kind: 'cssId', cssId: 'counter' }))
        .toThrow(/unresolved target/);
    });

    it('S13. listTargets authored ids', () => {
      // PREDICTION: PASS. Root has no authored cssId.
      const nodes = runtime.listTargets().nodes;
      const root = nodes.find(n => n.nodeId === '0'); // Assuming root is 0
      expect(root?.cssId).toBeUndefined();
    });

    it('S14. id-index resolution', () => {
      // PREDICTION: PASS. Equal.
      const targets = runtime.listTargets().nodes;
      const counterNode = targets.find(n => n.cssId === 'counter');
      const state = runtime.nodeState({ kind: 'cssId', cssId: 'counter' });
      expect(state.nodeId).toBe(counterNode?.nodeId);
    });
  });

  describe('Part 2 — Battery / cycle / code-CRUD', () => {
    it('S15. cycle census d12', () => {
      // PREDICTION: PASS. inTree === 23, registered === 23.
      // load() returns {census, …} (D6) — read .census.inTree.
      const res = runtime.load({ kind: 'envelope', envelope: pathForkCycleLegacyData(12) });
      expect(res.census.inTree).toBe(23);
      expect(res.census.registered).toBe(23);
    });

    it('S16. cycle d12 element count — DOM vs SSR', () => {
      // PREDICTION: PASS. 4095 elements in BOTH views (D2 — the root does NOT
      // add a data-node-id beyond the 4095 path-states; corrected 2026-08-23).
      runtime.load({ kind: 'envelope', envelope: pathForkCycleLegacyData(12) });
      const rendered = runtime.renderedHtmlResult().renderedHtml;
      const ssr = runtime.renderedHtmlResult().ssrHtml;

      const domCount = (rendered.match(/data-node-id=/g) || []).length;
      const ssrCount = (ssr.match(/data-node-id=/g) || []).length;

      expect(ssrCount).toBe(4095);
      expect(domCount).toBe(4095);
    });

    it('S17. cycle depth-4 census', () => {
      // PREDICTION: PASS. inTree === 7, data-node-id count > 3.
      const res = runtime.load({ kind: 'envelope', envelope: pathForkCycleLegacyData(4) });
      expect(res.census.inTree).toBe(7);
      const rendered = runtime.renderedHtmlResult().renderedHtml;
      expect((rendered.match(/data-node-id=/g) || []).length).toBeGreaterThan(3);
    });

    it('S18. load commands (A3)', () => {
      // PREDICTION: PASS. renderedHtml contains >7<
      const targets = runtime.listTargets().nodes;
      const counterNodeId = targets.find(n => n.cssId === 'counter')?.nodeId;
      
      runtime.load({
        kind: 'commands', 
        commands: [{ kind: 'state-slice', node: counterNodeId!, mutation: [{ targetProp: 'content', mode: 'replace', value: '7' }] }]
      });
      expect(runtime.renderedHtmlResult().renderedHtml).toContain('>7<');
    });

    it('S19. load empty commands', () => {
      // PREDICTION: PASS. No-op. inTree unchanged.
      const before = runtime.renderedHtmlResult().census;
      runtime.load({ kind: 'commands', commands: [] });
      const after = runtime.renderedHtmlResult().census;
      expect(after.inTree).toBe(before.inTree);
    });

    it('S20. load unknown kind', () => {
      // PREDICTION: PASS. Throws /unknown load kind/
      expect(() => runtime.load({ kind: 'bogus' } as any)).toThrow(/unknown load kind/);
    });

    it('S21. op state-slice render', () => {
      // PREDICTION: PASS. contains >9<
      const targets = runtime.listTargets().nodes;
      const counterNodeId = targets.find(n => n.cssId === 'counter')?.nodeId;
      runtime.op({
        kind: 'state-slice',
        node: counterNodeId!,
        mutation: [{ targetProp: 'content', mode: 'replace', value: '9' }]
      });
      expect(runtime.renderedHtmlResult().renderedHtml).toContain('>9<');
    });

    it('S22. codeCreate non-array', () => {
      // PREDICTION: PASS. Throws /not an array/
      // CRUD envelope is only set by a load path (D9); loadEnvelope first.
      runtime.loadEnvelope(demoEnvelope());
      runtime.codeSet('template.root.hooks', ['theme']);
      expect(() => runtime.codeCreate('template.root', {})).toThrow(/not an array/);
    });

    it('S23. codeDelete out-of-range', () => {
      // PREDICTION: PASS. Throws /out of range/, array untouched.
      runtime.loadEnvelope(demoEnvelope());
      runtime.codeSet('template.root.hooks', ['theme']);
      expect(() => runtime.codeDelete('template.root.hooks', 99)).toThrow(/out of range/);
      expect(() => runtime.codeDelete('template.root.hooks', -1)).toThrow(/out of range/);
      expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme']);
    });

    it('S24. codeValidate malformed', () => {
      // PREDICTION: PASS. {valid:false} NO throw.
      const res = runtime.codeValidate({ template: null, content: 'garbage' } as any);
      expect(res.valid).toBe(false);
    });

    it('S25. codeSet with no envelope (doc load)', () => {
      // PREDICTION: PASS. Throws /no envelope/
      const t = translateLegacy(demoEnvelope());
      const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false });
      runtime.loadDoc(doc);
      expect(() => runtime.codeSet('core.root.hooks', [])).toThrow(/no envelope/);
    });
  });

  describe('Part 3 — battery hooks + handlers', () => {
    it('S26. hooks readout bake', async () => {
      // PREDICTION: PASS. contains themeName="light"
      // args must be an ARRAY (D7); a bare string spreads into chars.
      runtime.loadEnvelope(hooksScenariosEnvelope());
      await runtime.dispatch({ target: 'theme-light-btn', event: 'click', args: ['light'] });
      expect(runtime.renderedHtmlResult().renderedHtml).toContain('themeName="light"');
    });

    it('S27. hooks containment probes', async () => {
      // PREDICTION: PASS. codes appear in results[].error.code; seam-exempt is applied.
      runtime.loadEnvelope(hooksScenariosEnvelope());
      
      const res1 = await runtime.dispatch({ target: 'probe-name-btn', event: 'click' });
      expect(res1.results[0].error.code).toBe('hook-name-unresolved');
      
      const res2 = await runtime.dispatch({ target: 'probe-mode-btn', event: 'click' });
      expect(res2.results[0].error.code).toBe('hook-mode-blocked');
      
      const res3 = await runtime.dispatch({ target: 'probe-kind-btn', event: 'click' });
      expect(res3.results[0].error.code).toBe('hook-kind-mismatch');
      
      const res4 = await runtime.dispatch({ target: 'probe-seam-btn', event: 'click' });
      expect(res4.results[0].status).toBe('applied');
    });

    it('S28. handlers S1a anon', async () => {
      // PREDICTION: PASS. contains Sign In, NO Log out, NO dropdown-menu.
      // D1 corrected: AUTH_INIT_BODY destroys the dropdown; it is pruned from
      // the emit (absent, NOT retained-as-present).
      runtime.loadEnvelope(userAuthEnvelope(null, 's1a'));
      await runtime.dispatch({ target: 's1a-chip', event: 'AuthInit' });
      const html = runtime.renderedHtmlResult().renderedHtml;
      expect(html).toContain('Sign In');
      expect(html).not.toContain('Log out');
      expect(html).not.toContain('dropdown-menu');
    });

    it('S29. handlers S1b alice logout', async () => {
      // PREDICTION: PASS. dropdown-menu destroyed after logout; the authored
      // Log out control string still emits from the def node; page renders.
      runtime.loadEnvelope(userAuthEnvelope({ username: 'alice' }, 's1b'), { userData: { username: 'alice' } });
      await runtime.dispatch({ target: 's1b-chip', event: 'AuthInit' });
      await runtime.dispatch({ target: 's1b-logout', event: 'click' });

      const html = runtime.renderedHtmlResult().renderedHtml;
      // The dropdown's interactive state is destroyed (pruned) — D1.
      expect(html).not.toContain('dropdown-menu');
      // The authored Log out control string still emits from the def node.
      expect(html).toContain('Log out');
      // The page still renders the Sign In chip.
      expect(html).toContain('Sign In');
    });
  });

  describe('Part 4 — Debug panel + divergence', () => {
    it('S30. debug-panel census line', () => {
      // PREDICTION: PASS. matches /inTree \d+ · registered \d+/
      const panels = new SecurePanels(document.createElement('div'));
      panels.refreshDebug(runtime);
      expect(panels.debugText()).toMatch(/inTree \d+ · registered \d+/);
    });

    it('S31. debug-panel truncated preview', () => {
      // PREDICTION: PASS. ends with … and ≤ ~125 chars.
      const panels = new SecurePanels(document.createElement('div'));
      panels.refreshDebug(runtime);
      const lines = panels.debugText().split('\n');
      const preview = lines[1] || '';
      expect(preview.endsWith('…')).toBe(true);
      expect(preview.length).toBeLessThanOrEqual(125);
    });

    it('S32. divergence harness', async () => {
      // This is a bash command, not a unit test. Skipping for now.
    });
  });

  describe('Edge-case bank', () => {
    it('dispatch to MISSING cssId', async () => {
      // PREDICTION: PASS. throws /unresolved target/ (D10 — wording is
      // "unresolved target", not "unresolved node target").
      await expect(runtime.dispatch({ target: { kind: 'cssId', cssId: 'nope' }, event: 'click' }))
        .rejects.toThrow(/unresolved target/);
    });

    it('dispatch unknown event', async () => {
      // PREDICTION: PASS. empty results/dirtied
      const res = await runtime.dispatch({ target: 'counter', event: 'nope' });
      expect(res.results).toEqual([]);
      expect(res.dirtied).toEqual([]);
    });

    it('op bogus kind', () => {
      // PREDICTION: PASS. {status: 'no-usable-state'} on a RESOLVED node (D3).
      // The host's 'rejected' guard covers an unknown kind with NO resolvable
      // node; on a valid node the engine returns 'no-usable-state'.
      const res = runtime.op({ kind: 'bogus-kind', node: 'counter' } as any);
      expect(res.status).toBe('no-usable-state');
    });

    it('loadEnvelope(null)', () => {
      // PREDICTION: PASS. throws legacy-envelope-mismatch
      expect(() => runtime.loadEnvelope(null as any)).toThrow(/legacy-envelope-mismatch/);
    });

    it('second loadEnvelope replace', () => {
      // PREDICTION: PASS. census is the SAME.
      const c1 = runtime.loadEnvelope(demoEnvelope());
      const c2 = runtime.loadEnvelope(demoEnvelope());
      expect(c2.inTree).toBe(c1.inTree);
    });

    it('exportLegacy round-trip cycle', () => {
      // PREDICTION: PASS. valid:true, censusMatch:true.
      runtime.loadEnvelope(pathForkCycleLegacyData(12));
      const exp = runtime.exportLegacy();
      const val = runtime.validateExport('legacy', exp);
      expect(val.valid).toBe(true);
      expect(val.censusMatch).toBe(true);
    });

    it('validate serialized treeSigMatch', () => {
      // PREDICTION: PASS. valid:true, censusMatch:true, treeSigMatch: boolean.
      // treeSigMatch only on validate() (D5), a boolean signal, not a contract.
      const ser = runtime.exportSerialized();
      const val = runtime.validate('serialized', ser);
      expect(val.valid).toBe(true);
      expect(val.censusMatch).toBe(true);
      expect(typeof val.treeSigMatch).toBe('boolean');
    });
  });
});
