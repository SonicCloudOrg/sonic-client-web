// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { expectCall } from '../../testing/ExpectStubCall.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as Emulation from './emulation.js';
describeWithMockConnection('MediaQueryInspector', () => {
    let target;
    let throttler;
    let inspector;
    beforeEach(() => {
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        createTarget({ parentTarget: tabTarget, subtype: 'prerender' });
        target = createTarget({ parentTarget: tabTarget });
        throttler = new Common.Throttler.Throttler(0);
    });
    afterEach(() => {
        inspector.detach();
    });
    it('redners media queries', async () => {
        inspector = new Emulation.MediaQueryInspector.MediaQueryInspector(() => 42, (_) => { }, throttler);
        inspector.markAsRoot();
        inspector.show(document.body);
        assert.strictEqual(inspector.contentElement.querySelectorAll('.media-inspector-marker').length, 0);
        const cssModel = target.model(SDK.CSSModel.CSSModel);
        assert.exists(cssModel);
        const CSS_MEDIA = {
            text: 'foo',
            source: "mediaRule" /* Protocol.CSS.CSSMediaSource.MediaRule */,
            mediaList: [{ expressions: [{ value: 42, computedLength: 42, unit: 'UNIT', feature: 'max-width' }], active: true }],
        };
        sinon.stub(cssModel, 'getMediaQueries').resolves([new SDK.CSSMedia.CSSMedia(cssModel, CSS_MEDIA)]);
        const workScheduled = expectCall(sinon.stub(throttler, 'schedule'));
        cssModel.dispatchEventToListeners(SDK.CSSModel.Events.StyleSheetAdded, {});
        const [work] = await workScheduled;
        await work();
        assert.strictEqual(inspector.contentElement.querySelectorAll('.media-inspector-marker').length, 1);
    });
});
//# sourceMappingURL=MediaQueryInspector.test.js.map