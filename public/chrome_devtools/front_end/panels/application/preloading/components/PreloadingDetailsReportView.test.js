// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../../../core/sdk/sdk.js';
import { getCleanTextContentFromElements, getElementWithinComponent, renderElementIntoDOM, } from '../../../../testing/DOMHelpers.js';
import { describeWithEnvironment } from '../../../../testing/EnvironmentHelpers.js';
import * as Coordinator from '../../../../ui/components/render_coordinator/render_coordinator.js';
import * as ReportView from '../../../../ui/components/report_view/report_view.js';
import * as PreloadingComponents from './components.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
const zip2 = (xs, ys) => {
    assert.strictEqual(xs.length, ys.length);
    return Array.from(xs.map((_, i) => [xs[i], ys[i]]));
};
const renderPreloadingDetailsReportView = async (data) => {
    const component = new PreloadingComponents.PreloadingDetailsReportView.PreloadingDetailsReportView();
    component.data = data;
    renderElementIntoDOM(component);
    assert.isNotNull(component.shadowRoot);
    await coordinator.done();
    return component;
};
// Note that testing Inspect/Activate buttons requires setup for targets.
// These are tested in test/unittests/front_end/panels/application/preloading/PreloadingView.test.ts.
describeWithEnvironment('PreloadingDetailsReportView', () => {
    it('renders place holder if not selected', async () => {
        const data = null;
        const component = await renderPreloadingDetailsReportView(data);
        assert.isNotNull(component.shadowRoot);
        const placeholder = component.shadowRoot.querySelector('.preloading-noselected');
        assert.include(placeholder?.textContent, 'Select an element for more details');
    });
    it('renders prerendering details', async () => {
        const url = 'https://example.com/prerendered.html';
        const data = {
            preloadingAttempt: {
                action: "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */,
                key: {
                    loaderId: 'loaderId',
                    action: "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */,
                    url,
                    targetHint: undefined,
                },
                status: "Running" /* SDK.PreloadingModel.PreloadingStatus.Running */,
                prerenderStatus: null,
                disallowedMojoInterface: null,
                mismatchedHeaders: null,
                ruleSetIds: ['ruleSetId'],
                nodeIds: [1],
            },
            ruleSets: [
                {
                    id: 'ruleSetId',
                    loaderId: 'loaderId',
                    sourceText: `
{
  "prefetch": [
    {
      "source": "list",
      "urls": ["/subresource.js"]
    }
  ]
}
`,
                },
            ],
            pageURL: 'https://example.com/',
        };
        const component = await renderPreloadingDetailsReportView(data);
        const report = getElementWithinComponent(component, 'devtools-report', ReportView.ReportView.Report);
        const keys = getCleanTextContentFromElements(report, 'devtools-report-key');
        const values = getCleanTextContentFromElements(report, 'devtools-report-value');
        assert.deepEqual(zip2(keys, values), [
            ['URL', url],
            ['Action', 'Prerender'],
            ['Status', 'Speculative load is running.'],
            ['Rule set', 'example.com/'],
        ]);
    });
    // TODO(https://crbug.com/1317959): Add cancelled reason once
    // finalStatus and disallowedApiMethod added to prerenderStatusUpdated.
    it('renders prerendering details with cancelled reason', async () => {
        const url = 'https://example.com/prerendered.html';
        const data = {
            preloadingAttempt: {
                action: "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */,
                key: {
                    loaderId: 'loaderId',
                    action: "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */,
                    url,
                    targetHint: undefined,
                },
                status: "Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */,
                prerenderStatus: "MojoBinderPolicy" /* Protocol.Preload.PrerenderFinalStatus.MojoBinderPolicy */,
                disallowedMojoInterface: 'device.mojom.GamepadMonitor',
                mismatchedHeaders: null,
                ruleSetIds: ['ruleSetId'],
                nodeIds: [1],
            },
            ruleSets: [
                {
                    id: 'ruleSetId',
                    loaderId: 'loaderId',
                    sourceText: `
{
  "prefetch": [
    {
      "source": "list",
      "urls": ["/subresource.js"]
    }
  ]
}
`,
                },
            ],
            pageURL: 'https://example.com/',
        };
        const component = await renderPreloadingDetailsReportView(data);
        const report = getElementWithinComponent(component, 'devtools-report', ReportView.ReportView.Report);
        const keys = getCleanTextContentFromElements(report, 'devtools-report-key');
        const values = getCleanTextContentFromElements(report, 'devtools-report-value');
        assert.deepEqual(zip2(keys, values), [
            ['URL', url],
            ['Action', 'Prerender'],
            ['Status', 'Speculative load failed.'],
            [
                'Failure reason',
                'The prerendered page used a forbidden JavaScript API that is currently not supported. (Internal Mojo interface: device.mojom.GamepadMonitor)',
            ],
            ['Rule set', 'example.com/'],
        ]);
    });
    it('renders prefetch details with cancelled reason', async () => {
        const fakeRequestResolver = {
            waitFor: (_requestId) => {
                return Promise.reject();
            },
        };
        const url = 'https://example.com/prefetch.html';
        const data = {
            preloadingAttempt: {
                action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                key: {
                    loaderId: 'loaderId',
                    action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                    url,
                    targetHint: undefined,
                },
                status: "Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */,
                prefetchStatus: "PrefetchFailedNon2XX" /* Protocol.Preload.PrefetchStatus.PrefetchFailedNon2XX */,
                requestId: 'requestId:1',
                ruleSetIds: ['ruleSetId'],
                nodeIds: [1],
            },
            ruleSets: [
                {
                    id: 'ruleSetId',
                    loaderId: 'loaderId',
                    sourceText: `
{
  "prefetch": [
    {
      "source": "list",
      "urls": ["/subresource.js"]
    }
  ]
}
`,
                },
            ],
            pageURL: 'https://example.com/',
            requestResolver: fakeRequestResolver,
        };
        const component = await renderPreloadingDetailsReportView(data);
        const report = getElementWithinComponent(component, 'devtools-report', ReportView.ReportView.Report);
        const keys = getCleanTextContentFromElements(report, 'devtools-report-key');
        const values = getCleanTextContentFromElements(report, 'devtools-report-value');
        values[0] = report.querySelector('devtools-report-value:nth-of-type(1) devtools-request-link-icon')
            ?.shadowRoot?.textContent?.trim() ||
            values[0];
        assert.deepEqual(zip2(keys, values), [
            ['URL', url],
            ['Action', 'Prefetch'],
            ['Status', 'Speculative load failed.'],
            ['Failure reason', 'The prefetch failed because of a non-2xx HTTP response status code.'],
            ['Rule set', 'example.com/'],
        ]);
    });
    it('renders prefetch details with out-of-document Speculation Rules', async () => {
        const fakeRequestResolver = {
            waitFor: (_requestId) => {
                return Promise.reject();
            },
        };
        const url = 'https://example.com/prefetch.html';
        const data = {
            preloadingAttempt: {
                action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                key: {
                    loaderId: 'loaderId',
                    action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                    url,
                    targetHint: undefined,
                },
                status: "Ready" /* SDK.PreloadingModel.PreloadingStatus.Ready */,
                prefetchStatus: null,
                requestId: 'requestId:1',
                ruleSetIds: ['ruleSetId'],
                nodeIds: [1],
            },
            ruleSets: [
                {
                    id: 'ruleSetId',
                    loaderId: 'loaderId',
                    sourceText: `
{
  "prefetch": [
    {
      "source": "list",
      "urls": ["/subresource.js"]
    }
  ]
}
`,
                    url: 'https://example.com/speculation-rules.json',
                },
            ],
            pageURL: 'https://example.com/',
            requestResolver: fakeRequestResolver,
        };
        const component = await renderPreloadingDetailsReportView(data);
        const report = getElementWithinComponent(component, 'devtools-report', ReportView.ReportView.Report);
        const keys = getCleanTextContentFromElements(report, 'devtools-report-key');
        const values = getCleanTextContentFromElements(report, 'devtools-report-value');
        values[0] = report.querySelector('devtools-report-value:nth-of-type(1) devtools-request-link-icon')
            ?.shadowRoot?.textContent?.trim() ||
            values[0];
        assert.deepEqual(zip2(keys, values), [
            ['URL', url],
            ['Action', 'Prefetch'],
            ['Status', 'Speculative load finished and the result is ready for the next navigation.'],
            ['Rule set', 'example.com/speculation-rules.json'],
        ]);
    });
});
//# sourceMappingURL=PreloadingDetailsReportView.test.js.map