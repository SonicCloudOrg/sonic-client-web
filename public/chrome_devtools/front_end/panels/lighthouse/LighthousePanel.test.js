// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget, stubNoopSettings } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
describeWithMockConnection('LighthousePanel', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let Lighthouse;
    let target;
    let resourceTreeModelNavigate;
    let protocolService;
    let controller;
    const URL = 'http://example.com';
    const LH_REPORT = {
        lhr: {
            finalDisplayedUrl: URL,
            configSettings: {},
            audits: {},
            categories: { _: { auditRefs: [], id: '' } },
            lighthouseVersion: '',
            userAgent: '',
            fetchTime: 0,
            environment: { benchmarkIndex: 0 },
            i18n: { rendererFormattedStrings: {} },
        },
    };
    beforeEach(async () => {
        Lighthouse = await import('./lighthouse.js');
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        createTarget({ parentTarget: tabTarget, subtype: 'prerender' });
        target = createTarget({ parentTarget: tabTarget });
        sinon.stub(target.pageAgent(), 'invoke_getNavigationHistory').resolves({
            currentIndex: 0,
            entries: [{ url: URL }],
            getError: () => null,
        });
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        assert.exists(resourceTreeModel);
        resourceTreeModelNavigate = sinon.stub(resourceTreeModel, 'navigate').resolves();
        sinon.stub(resourceTreeModel, 'addEventListener')
            .callThrough()
            .withArgs(SDK.ResourceTreeModel.Events.Load, sinon.match.any)
            .callsArgWithAsync(1, { resourceTreeModel, loadTime: 0 })
            .returns({});
        protocolService = new Lighthouse.LighthouseProtocolService.ProtocolService();
        sinon.stub(protocolService, 'attach').resolves();
        sinon.stub(protocolService, 'detach').resolves();
        sinon.stub(protocolService, 'collectLighthouseResults').resolves(LH_REPORT);
        controller = new Lighthouse.LighthouseController.LighthouseController(protocolService);
        stubNoopSettings();
    });
    // Failing due to StartView not finding settings title.
    it.skip('[crbug.com/326214132] restores the original URL when done', async () => {
        const instance = Lighthouse.LighthousePanel.LighthousePanel.instance({ forceNew: true, protocolService, controller });
        void instance.handleCompleteRun();
        await new Promise(resolve => resourceTreeModelNavigate.withArgs(URL).callsFake(() => {
            resolve();
            return Promise.resolve();
        }));
    });
    // Failing due to StartView not finding settings title.
    it.skip('[crbug.com/326214132] waits for main taget to load before linkifying', async () => {
        const instance = Lighthouse.LighthousePanel.LighthousePanel.instance({ forceNew: true, protocolService, controller });
        void instance.handleCompleteRun();
        await new Promise(resolve => sinon.stub(Lighthouse.LighthouseReportRenderer.LighthouseReportRenderer, 'linkifyNodeDetails')
            .callsFake((_) => {
            resolve();
            return Promise.resolve();
        }));
    });
});
//# sourceMappingURL=LighthousePanel.test.js.map