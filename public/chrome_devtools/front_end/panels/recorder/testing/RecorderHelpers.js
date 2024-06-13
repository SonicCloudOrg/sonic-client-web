// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../../core/sdk/sdk.js';
import * as Models from '../models/models.js';
export const createCustomStep = () => ({
    type: Models.Schema.StepType.CustomStep,
    name: 'dummy step',
    parameters: {},
});
export const installMocksForRecordingPlayer = () => {
    const mock = {
        page: {
            _client: () => ({
                send: sinon.stub().resolves(),
            }),
            frames: () => [{
                    client: { send: sinon.stub().resolves() },
                }],
            evaluate: () => '',
            url() {
                return '';
            },
            bringToFront() {
                return Promise.resolve();
            },
        },
        browser: {
            pages: () => [mock.page],
            disconnect: () => sinon.stub().resolves(),
        },
    };
    sinon.stub(Models.RecordingPlayer.RecordingPlayer, 'connectPuppeteer').resolves(mock);
};
export const installMocksForTargetManager = () => {
    const stub = {
        suspendAllTargets: sinon.stub().resolves(),
        resumeAllTargets: sinon.stub().resolves(),
        primaryPageTarget: sinon.stub().returns({
            targetAgent: sinon.stub().returns({}),
        }),
    };
    sinon.stub(SDK.TargetManager.TargetManager, 'instance')
        .callsFake(() => stub);
};
//# sourceMappingURL=RecorderHelpers.js.map