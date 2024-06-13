// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import { activate, getMainFrame, LOADER_ID, navigate } from '../../testing/ResourceTreeHelpers.js';
import * as Logs from '../logs/logs.js';
function url(input) {
    return input;
}
describe('NetworkLog', () => {
    describe('initiatorInfoForRequest', () => {
        const { initiatorInfoForRequest } = Logs.NetworkLog.NetworkLog;
        it('uses the passed in initiator info if it exists', () => {
            const request = {
                initiator() {
                    return null;
                },
                redirectSource() {
                    return null;
                },
            };
            const existingInfo = {
                info: null,
                chain: null,
                request: undefined,
            };
            const info = initiatorInfoForRequest(request, existingInfo);
            assert.deepEqual(info, {
                type: "other" /* SDK.NetworkRequest.InitiatorType.Other */,
                url: Platform.DevToolsPath.EmptyUrlString,
                lineNumber: undefined,
                columnNumber: undefined,
                scriptId: null,
                stack: null,
                initiatorRequest: null,
            });
            assert.deepEqual(info, existingInfo.info);
        });
        it('returns "other" if there is no initiator or redirect', () => {
            const request = {
                initiator() {
                    return null;
                },
                redirectSource() {
                    return null;
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "other" /* SDK.NetworkRequest.InitiatorType.Other */,
                url: Platform.DevToolsPath.EmptyUrlString,
                lineNumber: undefined,
                columnNumber: undefined,
                scriptId: null,
                stack: null,
                initiatorRequest: null,
            });
        });
        it('returns the redirect info if the request has a redirect', () => {
            const request = {
                initiator() {
                    return null;
                },
                redirectSource() {
                    return {
                        url() {
                            return url('http://localhost:3000/example.js');
                        },
                    };
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "redirect" /* SDK.NetworkRequest.InitiatorType.Redirect */,
                url: url('http://localhost:3000/example.js'),
                lineNumber: undefined,
                columnNumber: undefined,
                scriptId: null,
                stack: null,
                initiatorRequest: null,
            });
        });
        it('returns the initiator info if the initiator is the parser', () => {
            const request = {
                initiator() {
                    return {
                        type: "parser" /* Protocol.Network.InitiatorType.Parser */,
                        url: url('http://localhost:3000/example.js'),
                        lineNumber: 5,
                        columnNumber: 6,
                    };
                },
                redirectSource() {
                    return null;
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "parser" /* SDK.NetworkRequest.InitiatorType.Parser */,
                url: url('http://localhost:3000/example.js'),
                lineNumber: 5,
                columnNumber: 6,
                scriptId: null,
                stack: null,
                initiatorRequest: null,
            });
        });
        it('returns the initiator info if the initiator is a script with a stack', () => {
            const request = {
                initiator() {
                    return {
                        type: "script" /* Protocol.Network.InitiatorType.Script */,
                        url: url('http://localhost:3000/example.js'),
                        stack: {
                            callFrames: [{
                                    functionName: 'foo',
                                    url: url('http://localhost:3000/example.js'),
                                    scriptId: 'script-id-1',
                                    lineNumber: 5,
                                    columnNumber: 6,
                                }],
                        },
                    };
                },
                redirectSource() {
                    return null;
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "script" /* SDK.NetworkRequest.InitiatorType.Script */,
                url: url('http://localhost:3000/example.js'),
                lineNumber: 5,
                columnNumber: 6,
                scriptId: 'script-id-1',
                stack: {
                    callFrames: [{
                            functionName: 'foo',
                            url: url('http://localhost:3000/example.js'),
                            scriptId: 'script-id-1',
                            lineNumber: 5,
                            columnNumber: 6,
                        }],
                },
                initiatorRequest: null,
            });
        });
        it('deals with a nested stack and finds the top frame to use for the script-id', () => {
            const request = {
                initiator() {
                    return {
                        type: "script" /* Protocol.Network.InitiatorType.Script */,
                        url: url('http://localhost:3000/example.js'),
                        stack: {
                            parent: {
                                callFrames: [{
                                        functionName: 'foo',
                                        url: url('http://localhost:3000/example.js'),
                                        scriptId: 'script-id-1',
                                        lineNumber: 5,
                                        columnNumber: 6,
                                    }],
                            },
                            callFrames: [],
                        },
                    };
                },
                redirectSource() {
                    return null;
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "script" /* SDK.NetworkRequest.InitiatorType.Script */,
                url: url('http://localhost:3000/example.js'),
                lineNumber: 5,
                columnNumber: 6,
                scriptId: 'script-id-1',
                stack: null,
                initiatorRequest: null,
            });
        });
        it('returns the initiator info if the initiator is a script without a stack', () => {
            const request = {
                initiator() {
                    return {
                        type: "script" /* Protocol.Network.InitiatorType.Script */,
                        url: url('http://localhost:3000/example.js'),
                    };
                },
                redirectSource() {
                    return null;
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "script" /* SDK.NetworkRequest.InitiatorType.Script */,
                url: url('http://localhost:3000/example.js'),
                lineNumber: undefined,
                columnNumber: undefined,
                scriptId: null,
                stack: null,
                initiatorRequest: null,
            });
        });
        it('returns the info for a Preload request', () => {
            const request = {
                initiator() {
                    return {
                        type: "preload" /* Protocol.Network.InitiatorType.Preload */,
                    };
                },
                redirectSource() {
                    return null;
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "preload" /* SDK.NetworkRequest.InitiatorType.Preload */,
                url: Platform.DevToolsPath.EmptyUrlString,
                lineNumber: undefined,
                columnNumber: undefined,
                scriptId: null,
                stack: null,
                initiatorRequest: null,
            });
        });
        it('returns the info for a Preflight request', () => {
            const PREFLIGHT_INITIATOR_REQUEST = {};
            const request = {
                initiator() {
                    return {
                        type: "preflight" /* Protocol.Network.InitiatorType.Preflight */,
                    };
                },
                preflightInitiatorRequest() {
                    return PREFLIGHT_INITIATOR_REQUEST;
                },
                redirectSource() {
                    return null;
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "preflight" /* SDK.NetworkRequest.InitiatorType.Preflight */,
                url: Platform.DevToolsPath.EmptyUrlString,
                lineNumber: undefined,
                columnNumber: undefined,
                scriptId: null,
                stack: null,
                initiatorRequest: PREFLIGHT_INITIATOR_REQUEST,
            });
        });
        it('returns the info for a signed exchange request', () => {
            const request = {
                initiator() {
                    return {
                        type: "SignedExchange" /* Protocol.Network.InitiatorType.SignedExchange */,
                        url: url('http://localhost:3000/example.js'),
                    };
                },
                redirectSource() {
                    return null;
                },
            };
            const info = initiatorInfoForRequest(request);
            assert.deepEqual(info, {
                type: "signedExchange" /* SDK.NetworkRequest.InitiatorType.SignedExchange */,
                url: url('http://localhost:3000/example.js'),
                lineNumber: undefined,
                columnNumber: undefined,
                scriptId: null,
                stack: null,
                initiatorRequest: null,
            });
        });
    });
});
describeWithMockConnection('NetworkLog', () => {
    it('clears on main frame navigation', () => {
        const networkLog = Logs.NetworkLog.NetworkLog.instance();
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        const mainFrameTarget = createTarget({ parentTarget: tabTarget });
        const mainFrame = getMainFrame(mainFrameTarget);
        const subframe = getMainFrame(createTarget({ parentTarget: mainFrameTarget }));
        let networkLogResetEvents = 0;
        networkLog.addEventListener(Logs.NetworkLog.Events.Reset, () => ++networkLogResetEvents);
        navigate(subframe);
        assert.strictEqual(networkLogResetEvents, 0);
        navigate(mainFrame);
        assert.strictEqual(networkLogResetEvents, 1);
    });
    describe('on primary page changed', () => {
        let networkLog;
        let target;
        beforeEach(() => {
            Common.Settings.Settings.instance().moduleSetting('network-log.preserve-log').set(false);
            target = createTarget();
            const networkManager = target.model(SDK.NetworkManager.NetworkManager);
            assert.exists(networkManager);
            networkLog = Logs.NetworkLog.NetworkLog.instance();
            const networkDispatcher = new SDK.NetworkManager.NetworkDispatcher(networkManager);
            const requestWillBeSentEvent1 = { requestId: 'mockId1', request: { url: 'example.com' }, loaderId: LOADER_ID };
            networkDispatcher.requestWillBeSent(requestWillBeSentEvent1);
            const requestWillBeSentEvent2 = { requestId: 'mockId2', request: { url: 'foo.com' }, loaderId: 'OTHER_LOADER_ID' };
            networkDispatcher.requestWillBeSent(requestWillBeSentEvent2);
            assert.strictEqual(networkLog.requests().length, 2);
        });
        it('discards requests with mismatched loaderId on navigation', () => {
            navigate(getMainFrame(target));
            assert.deepEqual(networkLog.requests().map(request => request.requestId()), ['mockId1']);
        });
        it('does not discard requests on prerender activation', () => {
            activate(target);
            assert.deepEqual(networkLog.requests().map(request => request.requestId()), ['mockId1', 'mockId2']);
        });
    });
    it('removes preflight requests with a UnexpectedPrivateNetworkAccess CORS error', () => {
        const target = createTarget();
        const networkManager = target.model(SDK.NetworkManager.NetworkManager);
        if (!networkManager) {
            throw new Error('No networkManager');
        }
        const networkLog = Logs.NetworkLog.NetworkLog.instance();
        let removedRequest = null;
        networkLog.addEventListener(Logs.NetworkLog.Events.RequestRemoved, event => {
            assert.isNull(removedRequest, 'Request was removed multiple times.');
            removedRequest = event.data.request;
        });
        const request = {
            requestId: () => 'request-id',
            isPreflightRequest: () => true,
            initiator: () => null,
            corsErrorStatus: () => ({ corsError: "UnexpectedPrivateNetworkAccess" /* Protocol.Network.CorsError.UnexpectedPrivateNetworkAccess */ }),
        };
        networkManager.dispatchEventToListeners(SDK.NetworkManager.Events.RequestStarted, { request, originalRequest: null });
        assert.strictEqual(networkLog.requests().length, 1);
        networkManager.dispatchEventToListeners(SDK.NetworkManager.Events.RequestUpdated, request);
        assert.strictEqual(request, removedRequest);
        assert.strictEqual(networkLog.requests().length, 0);
    });
});
//# sourceMappingURL=NetworkLog.test.js.map