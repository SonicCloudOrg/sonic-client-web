// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { createTarget, } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection, } from '../../testing/MockConnection.js';
import * as SDK from './sdk.js';
describeWithMockConnection('ExecutionContext', () => {
    function createExecutionContext(target, name, isDefault) {
        const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
        assert.exists(runtimeModel);
        return new SDK.RuntimeModel.ExecutionContext(runtimeModel, 42, 'uniqueId', name ?? 'name', 'http://www.example.com', Boolean(isDefault));
    }
    it('can be compared based on target type', () => {
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        const mainFrameTargetUnderTab = createTarget({ type: SDK.Target.Type.Frame, parentTarget: tabTarget });
        assert.strictEqual(SDK.RuntimeModel.ExecutionContext.comparator(createExecutionContext(mainFrameTargetUnderTab), createExecutionContext(createTarget({ type: SDK.Target.Type.Frame, parentTarget: mainFrameTargetUnderTab }))), -1);
        assert.strictEqual(SDK.RuntimeModel.ExecutionContext.comparator(createExecutionContext(createTarget({ type: SDK.Target.Type.Frame, parentTarget: mainFrameTargetUnderTab })), createExecutionContext(createTarget({ type: SDK.Target.Type.ServiceWorker, parentTarget: mainFrameTargetUnderTab }))), -1);
        assert.strictEqual(SDK.RuntimeModel.ExecutionContext.comparator(createExecutionContext(createTarget({ type: SDK.Target.Type.ServiceWorker, parentTarget: mainFrameTargetUnderTab })), createExecutionContext(createTarget({ type: SDK.Target.Type.SharedWorker, parentTarget: mainFrameTargetUnderTab }))), -1);
        assert.strictEqual(SDK.RuntimeModel.ExecutionContext.comparator(createExecutionContext(createTarget({ type: SDK.Target.Type.ServiceWorker, parentTarget: mainFrameTargetUnderTab })), createExecutionContext(createTarget({ type: SDK.Target.Type.Worker, parentTarget: mainFrameTargetUnderTab }))), -1);
    });
    it('can be compared based on target depth', () => {
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        const mainFrameTarget = createTarget({ type: SDK.Target.Type.Frame, parentTarget: tabTarget });
        const subframeTarget = createTarget({ type: SDK.Target.Type.Frame, parentTarget: mainFrameTarget });
        assert.strictEqual(SDK.RuntimeModel.ExecutionContext.comparator(createExecutionContext(mainFrameTarget), createExecutionContext(subframeTarget)), -1);
    });
    it('can be compared based on defaultness', () => {
        const target = createTarget({ type: SDK.Target.Type.Frame });
        const defaultExecutionContext = createExecutionContext(target, 'name', /* isDefault=*/ true);
        const notDefaultExecutionContext = createExecutionContext(target, 'name', /* isDefault=*/ false);
        assert.strictEqual(SDK.RuntimeModel.ExecutionContext.comparator(defaultExecutionContext, notDefaultExecutionContext), -1);
    });
    it('can be compared based on name', () => {
        const target = createTarget({ type: SDK.Target.Type.Frame });
        const executionContextA = createExecutionContext(target, /* name=*/ 'a');
        const executionContextB = createExecutionContext(target, /* name=*/ 'b');
        assert.strictEqual(SDK.RuntimeModel.ExecutionContext.comparator(executionContextA, executionContextB), -1);
    });
});
//# sourceMappingURL=RuntimeModel.test.js.map