// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../../core/sdk/sdk.js';
export function getTargetName(target) {
    if (SDK.TargetManager.TargetManager.instance().primaryPageTarget() === target) {
        return 'main';
    }
    return target.id() === 'main' ? 'main' : target.inspectedURL();
}
/**
 * Returns the context for an SDK target and frame.
 * The frame is identified by the path in the resource tree model.
 * And the target is identified by `getTargetName`.
 */
export function getTargetFrameContext(target, frame) {
    const path = [];
    while (frame) {
        const parentFrame = frame.sameTargetParentFrame();
        if (!parentFrame) {
            break;
        }
        const childFrames = parentFrame.childFrames;
        const index = childFrames.indexOf(frame);
        path.unshift(index);
        frame = parentFrame;
    }
    return { target: getTargetName(target), frame: path };
}
export async function evaluateInAllFrames(worldName, target, expression) {
    const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
    const executionContexts = runtimeModel.executionContexts();
    const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
    for (const frame of resourceTreeModel.frames()) {
        const executionContext = executionContexts.find(context => context.frameId === frame.id);
        if (!executionContext) {
            continue;
        }
        // Note: it would return previously created world if it exists for the frame.
        const { executionContextId } = await target.pageAgent().invoke_createIsolatedWorld({ frameId: frame.id, worldName });
        await target.runtimeAgent().invoke_evaluate({
            expression,
            includeCommandLineAPI: true,
            contextId: executionContextId,
        });
    }
}
export function findTargetByExecutionContext(targets, executionContextId) {
    for (const target of targets) {
        const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
        if (!runtimeModel) {
            continue;
        }
        for (const context of runtimeModel.executionContexts()) {
            if (context.id === executionContextId) {
                return target;
            }
        }
    }
    return;
}
export function findFrameIdByExecutionContext(targets, executionContextId) {
    for (const target of targets) {
        const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
        if (!runtimeModel) {
            continue;
        }
        for (const context of runtimeModel.executionContexts()) {
            if (context.id === executionContextId && context.frameId !== undefined) {
                return context.frameId;
            }
        }
    }
    return;
}
export const isFrameTargetInfo = (target) => {
    return target.type === 'page' || target.type === 'iframe';
};
//# sourceMappingURL=SDKUtils.js.map