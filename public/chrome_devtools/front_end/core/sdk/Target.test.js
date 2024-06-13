// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { createTarget, } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection, } from '../../testing/MockConnection.js';
import * as SDK from './sdk.js';
describeWithMockConnection('Target', () => {
    let tabTarget;
    let mainFrameTargetUnderTab;
    let subframeTarget;
    beforeEach(() => {
        tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        mainFrameTargetUnderTab = createTarget({ type: SDK.Target.Type.Frame, parentTarget: tabTarget });
        subframeTarget = createTarget({ type: SDK.Target.Type.Frame, parentTarget: mainFrameTargetUnderTab });
    });
    it('has capabilities based on the type', () => {
        assert.isTrue(tabTarget.hasAllCapabilities(32 /* SDK.Target.Capability.Target */ | 128 /* SDK.Target.Capability.Tracing */));
        assert.isFalse(tabTarget.hasAllCapabilities(2 /* SDK.Target.Capability.DOM */));
        assert.isTrue(mainFrameTargetUnderTab.hasAllCapabilities(32 /* SDK.Target.Capability.Target */ | 2 /* SDK.Target.Capability.DOM */ | 4096 /* SDK.Target.Capability.DeviceEmulation */));
        assert.isTrue(subframeTarget.hasAllCapabilities(32 /* SDK.Target.Capability.Target */ | 2 /* SDK.Target.Capability.DOM */));
        assert.isFalse(subframeTarget.hasAllCapabilities(4096 /* SDK.Target.Capability.DeviceEmulation */));
    });
    it('notifies about inspected URL change', () => {
        const inspectedURLChanged = sinon.spy(SDK.TargetManager.TargetManager.instance(), 'onInspectedURLChange');
        subframeTarget.setInspectedURL('https://example.com/');
        assert.isTrue(inspectedURLChanged.calledOnce);
        mainFrameTargetUnderTab.setInspectedURL('https://example.com/');
        assert.isTrue(inspectedURLChanged.calledTwice);
    });
    it('determines outermost target', () => {
        assert.isNull(tabTarget.outermostTarget());
        assert.strictEqual(mainFrameTargetUnderTab.outermostTarget(), mainFrameTargetUnderTab);
        assert.strictEqual(subframeTarget.outermostTarget(), mainFrameTargetUnderTab);
        assert.strictEqual(createTarget({ type: SDK.Target.Type.Worker, parentTarget: subframeTarget }).outermostTarget(), mainFrameTargetUnderTab);
        const nodeTarget = createTarget({ type: SDK.Target.Type.Node });
        assert.strictEqual(nodeTarget.outermostTarget(), nodeTarget);
        const browserTarget = createTarget({ type: SDK.Target.Type.Browser });
        assert.isNull(browserTarget.outermostTarget());
        const serviceWorkerTarget = createTarget({ type: SDK.Target.Type.ServiceWorker, parentTarget: browserTarget });
        assert.strictEqual(serviceWorkerTarget.outermostTarget(), serviceWorkerTarget);
    });
});
//# sourceMappingURL=Target.test.js.map