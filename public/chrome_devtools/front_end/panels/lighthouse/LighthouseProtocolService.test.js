// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
describeWithMockConnection('LighthouseProtocolService', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let Lighthouse;
    let primaryTarget;
    let rootTarget;
    let suspendAllTargets;
    let resumeAllTargets;
    let createParallelConnection;
    beforeEach(async () => {
        Lighthouse = await import('./lighthouse.js');
        rootTarget = createTarget({ type: SDK.Target.Type.Tab });
        createTarget({ parentTarget: rootTarget, subtype: 'prerender' });
        primaryTarget = createTarget({ parentTarget: rootTarget });
        const targetManager = SDK.TargetManager.TargetManager.instance();
        suspendAllTargets = sinon.stub(targetManager, 'suspendAllTargets').resolves();
        resumeAllTargets = sinon.stub(targetManager, 'resumeAllTargets').resolves();
        SDK.ChildTargetManager.ChildTargetManager.install();
        const childTargetManager = primaryTarget.model(SDK.ChildTargetManager.ChildTargetManager);
        assert.exists(childTargetManager);
        sinon.stub(childTargetManager, 'getParentTargetId').resolves(primaryTarget.targetInfo()?.targetId);
        if (rootTarget === primaryTarget) {
            createParallelConnection = sinon.stub(childTargetManager, 'createParallelConnection').resolves({
                connection: { disconnect: () => { } },
                sessionId: 'foo',
            });
        }
        else {
            const rootChildTargetManager = rootTarget.model(SDK.ChildTargetManager.ChildTargetManager);
            assert.exists(rootChildTargetManager);
            sinon.stub(rootChildTargetManager, 'getParentTargetId').resolves(rootTarget.targetInfo()?.targetId);
            createParallelConnection = sinon.stub(rootChildTargetManager, 'createParallelConnection').resolves({
                connection: { disconnect: () => { } },
                sessionId: 'foo',
            });
        }
    });
    it('suspends all targets', async () => {
        const service = new Lighthouse.LighthouseProtocolService.ProtocolService();
        await service.attach();
        assert.isTrue(suspendAllTargets.calledOnce);
    });
    it('creates a parallel connection', async () => {
        const service = new Lighthouse.LighthouseProtocolService.ProtocolService();
        await service.attach();
        assert.isTrue(createParallelConnection.calledOnce);
    });
    it('resumes all targets', async () => {
        const service = new Lighthouse.LighthouseProtocolService.ProtocolService();
        await service.attach();
        await service.detach();
        assert.isTrue(resumeAllTargets.calledOnce);
    });
});
//# sourceMappingURL=LighthouseProtocolService.test.js.map