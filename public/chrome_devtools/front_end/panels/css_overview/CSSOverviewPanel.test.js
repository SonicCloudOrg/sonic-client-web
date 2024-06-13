// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection, } from '../../testing/MockConnection.js';
import * as CSSOverview from './css_overview.js';
describeWithMockConnection('CSSOverviewPanel', () => {
    let target;
    beforeEach(async () => {
        const tabTaget = createTarget({ type: SDK.Target.Type.Tab });
        createTarget({ parentTarget: tabTaget, subtype: 'prerender' });
        target = createTarget({ parentTarget: tabTaget });
    });
    it('reacts to start event and sends completion event', async () => {
        const controller = new CSSOverview.CSSOverviewController.OverviewController();
        new CSSOverview.CSSOverviewPanel.CSSOverviewPanel(controller);
        const overviewCompleted = controller.once("OverviewCompleted" /* CSSOverview.CSSOverviewController.Events.OverviewCompleted */);
        sinon.stub(target.runtimeAgent(), 'invoke_evaluate').resolves({
            result: {},
        });
        sinon.stub(target.domsnapshotAgent(), 'invoke_captureSnapshot').resolves({
            documents: [],
        });
        sinon.stub(target.cssAgent(), 'invoke_getMediaQueries').resolves({
            medias: [],
        });
        controller.dispatchEventToListeners("RequestOverviewStart" /* CSSOverview.CSSOverviewController.Events.RequestOverviewStart */);
        await overviewCompleted;
    });
});
//# sourceMappingURL=CSSOverviewPanel.test.js.map