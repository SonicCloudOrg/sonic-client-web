// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../../../core/sdk/sdk.js';
import { assertGridContents, getCellByIndexes } from '../../../../testing/DataGridHelpers.js';
import { renderElementIntoDOM } from '../../../../testing/DOMHelpers.js';
import { describeWithEnvironment } from '../../../../testing/EnvironmentHelpers.js';
import * as Coordinator from '../../../../ui/components/render_coordinator/render_coordinator.js';
import * as PreloadingComponents from './components.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
async function assertRenderResult(rowsInput, headerExpected, rowsExpected) {
    const component = new PreloadingComponents.PreloadingGrid.PreloadingGrid();
    component.update(rowsInput);
    renderElementIntoDOM(component);
    await coordinator.done();
    return assertGridContents(component, headerExpected, rowsExpected);
}
describeWithEnvironment('PreloadingGrid', () => {
    it('renders grid', async () => {
        await assertRenderResult({
            rows: [{
                    id: 'id',
                    attempt: {
                        action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                        key: {
                            loaderId: 'loaderId:1',
                            action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                            url: 'https://example.com/prefetched.html',
                        },
                        status: "Running" /* SDK.PreloadingModel.PreloadingStatus.Running */,
                        prefetchStatus: null,
                        requestId: 'requestId:1',
                        ruleSetIds: ['ruleSetId:0.1'],
                        nodeIds: [1],
                    },
                    ruleSets: [
                        {
                            id: 'ruleSetId:0.1',
                            loaderId: 'loaderId:1',
                            sourceText: `
{
  "prefetch":[
    {
      "source": "list",
      "urls": ["/prefetched.html"]
    }
  ]
}
`,
                        },
                    ],
                }],
            pageURL: 'https://example.com/',
        }, ['URL', 'Action', 'Rule set', 'Status'], [
            ['/prefetched.html', 'Prefetch', 'example.com/', 'Running'],
        ]);
    });
    it('shows full URL for cross-origin preloading', async () => {
        await assertRenderResult({
            rows: [{
                    id: 'id',
                    attempt: {
                        action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                        key: {
                            loaderId: 'loaderId:1',
                            action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                            url: 'https://cross-origin.example.com/prefetched.html',
                        },
                        status: "Running" /* SDK.PreloadingModel.PreloadingStatus.Running */,
                        prefetchStatus: null,
                        requestId: 'requestId:1',
                        ruleSetIds: ['ruleSetId:0.1'],
                        nodeIds: [1],
                    },
                    ruleSets: [
                        {
                            id: 'ruleSetId:0.1',
                            loaderId: 'loaderId:1',
                            sourceText: `
{
  "prefetch":[
    {
      "source": "list",
      "urls": ["https://cross-origin.example.com/prefetched.html"]
    }
  ]
}
`,
                        },
                    ],
                }],
            pageURL: 'https://example.com/',
        }, ['URL', 'Action', 'Rule set', 'Status'], [
            ['https://cross-origin.example.com/prefetched.html', 'Prefetch', 'example.com/', 'Running'],
        ]);
    });
    it('shows filename for out-of-document speculation rules', async () => {
        await assertRenderResult({
            rows: [{
                    id: 'id',
                    attempt: {
                        action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                        key: {
                            loaderId: 'loaderId:1',
                            action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                            url: 'https://example.com/prefetched.html',
                        },
                        status: "Running" /* SDK.PreloadingModel.PreloadingStatus.Running */,
                        prefetchStatus: null,
                        requestId: 'requestId:1',
                        ruleSetIds: ['ruleSetId:0.1'],
                        nodeIds: [],
                    },
                    ruleSets: [
                        {
                            id: 'ruleSetId:0.1',
                            loaderId: 'loaderId:1',
                            sourceText: `
{
  "prefetch":[
    {
      "source": "list",
      "urls": ["/prefetched.html"]
    }
  ]
}
`,
                            url: 'https://example.com/assets/speculation-rules.json',
                        },
                    ],
                }],
            pageURL: 'https://example.com/',
        }, ['URL', 'Action', 'Rule set', 'Status'], [
            ['/prefetched.html', 'Prefetch', 'example.com/assets/speculation-rules.json', 'Running'],
        ]);
    });
    it('shows the only first speculation rules', async () => {
        await assertRenderResult({
            rows: [
                {
                    id: 'id',
                    attempt: {
                        action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                        key: {
                            loaderId: 'loaderId:1',
                            action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                            url: 'https://example.com/rule-set-missing.html',
                        },
                        status: "Running" /* SDK.PreloadingModel.PreloadingStatus.Running */,
                        prefetchStatus: null,
                        requestId: 'requestId:1',
                        ruleSetIds: ['ruleSetId:0.1'],
                        nodeIds: [1],
                    },
                    ruleSets: [],
                },
                {
                    id: 'id',
                    attempt: {
                        action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                        key: {
                            loaderId: 'loaderId:1',
                            action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                            url: 'https://example.com/multiple-rule-sets.html',
                        },
                        status: "Running" /* SDK.PreloadingModel.PreloadingStatus.Running */,
                        prefetchStatus: null,
                        requestId: 'requestId:2',
                        ruleSetIds: ['ruleSetId:0.2', 'ruleSetId:0.3'],
                        nodeIds: [1],
                    },
                    ruleSets: [
                        {
                            id: 'ruleSetId:0.2',
                            loaderId: 'loaderId:1',
                            sourceText: `
{
  "prefetch":[
    {
      "source": "list",
      "urls": ["/multiple-rule-sets.html"]
    }
  ]
}
`,
                        },
                        {
                            id: 'ruleSetId:0.3',
                            loaderId: 'loaderId:1',
                            sourceText: `
{
  "prefetch":[
    {
      "source": "list",
      "urls": ["/multiple-rule-sets.html"]
    }
  ]
}
`,
                            url: 'https://example.com/assets/speculation-rules.json',
                        },
                    ],
                },
            ],
            pageURL: 'https://example.com/',
        }, ['URL', 'Action', 'Rule set', 'Status'], [
            ['/rule-set-missing.html', 'Prefetch', '', 'Running'],
            ['/multiple-rule-sets.html', 'Prefetch', 'example.com/', 'Running'],
        ]);
    });
    it('shows composed status for failure', async () => {
        const grid = await assertRenderResult({
            rows: [{
                    id: 'id',
                    attempt: {
                        action: "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */,
                        key: {
                            loaderId: 'loaderId:1',
                            action: "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */,
                            url: 'https://example.com/prerendered.html',
                        },
                        status: "Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */,
                        prerenderStatus: "MojoBinderPolicy" /* Protocol.Preload.PrerenderFinalStatus.MojoBinderPolicy */,
                        disallowedMojoInterface: 'device.mojom.GamepadMonitor',
                        mismatchedHeaders: null,
                        requestId: 'requestId:1',
                        ruleSetIds: ['ruleSetId:0.1'],
                        nodeIds: [1],
                    },
                    ruleSets: [
                        {
                            id: 'ruleSetId:0.1',
                            loaderId: 'loaderId:1',
                            sourceText: `
{
  "prerender":[
    {
      "source": "list",
      "urls": ["/prerendered.html"]
    }
  ]
}
`,
                        },
                    ],
                }],
            pageURL: 'https://example.com/',
        }, ['URL', 'Action', 'Rule set', 'Status'], [
            [
                '/prerendered.html',
                'Prerender',
                'example.com/',
                'Failure - The prerendered page used a forbidden JavaScript API that is currently not supported. (Internal Mojo interface: device.mojom.GamepadMonitor)',
            ],
        ]);
        assert.isNotNull(grid.shadowRoot);
        const cell = getCellByIndexes(grid.shadowRoot, { row: 1, column: 3 });
        const div = cell.querySelector('div');
        assert.strictEqual(div.getAttribute('style'), 'color: var(--sys-color-error);');
        const icon = div.children[0];
        assert.include(icon.shadowRoot.innerHTML, 'cross-circle-filled');
    });
});
//# sourceMappingURL=PreloadingGrid.test.js.map