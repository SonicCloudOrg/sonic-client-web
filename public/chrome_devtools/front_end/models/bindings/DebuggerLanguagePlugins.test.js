// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { TestPlugin } from '../../testing/LanguagePluginHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as Workspace from '../workspace/workspace.js';
import * as Bindings from './bindings.js';
describe('DebuggerLanguagePlugins', () => {
    describe('ExtensionRemoteObject', () => {
        describe('isLinearMemoryInspectable', () => {
            it('yields false when the extension object has no linear memory address', () => {
                const callFrame = sinon.createStubInstance(SDK.DebuggerModel.CallFrame);
                const extensionObject = {
                    type: 'object',
                    hasChildren: false,
                };
                const plugin = new TestPlugin('TestPlugin');
                const remoteObject = new Bindings.DebuggerLanguagePlugins.ExtensionRemoteObject(callFrame, extensionObject, plugin);
                assert.isFalse(remoteObject.isLinearMemoryInspectable());
            });
            it('yields true when the extension object has a linear memory address', () => {
                const callFrame = sinon.createStubInstance(SDK.DebuggerModel.CallFrame);
                const extensionObject = {
                    type: 'object',
                    linearMemoryAddress: 42,
                    hasChildren: false,
                };
                const plugin = new TestPlugin('TestPlugin');
                const remoteObject = new Bindings.DebuggerLanguagePlugins.ExtensionRemoteObject(callFrame, extensionObject, plugin);
                assert.isTrue(remoteObject.isLinearMemoryInspectable());
            });
        });
    });
    describe('DebuggerLanguagePluginManager', () => {
        describeWithMockConnection('getFunctionInfo', () => {
            let target;
            let pluginManager;
            const MISSING_DWO_FILE = 'test.dwo';
            const MISSING_DEBUG_FILES = {
                resourceUrl: MISSING_DWO_FILE,
                initiator: {
                    target: null,
                    frameId: null,
                    extensionId: 'chrome-extension-id',
                    initiatorUrl: 'chrome-extension-id',
                },
            };
            const FUNCTION_NAME = 'test';
            class Plugin extends TestPlugin {
                getFunctionInfo(_rawLocation) {
                    return Promise.resolve({ missingSymbolFiles: [] });
                }
                handleScript(_) {
                    return true;
                }
                addRawModule(_rawModuleId, _symbolsURL, _rawModule) {
                    return Promise.resolve(['https://script-host/script.js']);
                }
            }
            beforeEach(() => {
                target = createTarget();
                const workspace = Workspace.Workspace.WorkspaceImpl.instance();
                const targetManager = target.targetManager();
                const resourceMapping = new Bindings.ResourceMapping.ResourceMapping(targetManager, workspace);
                const debuggerWorkspaceBinding = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance({ forceNew: true, resourceMapping, targetManager });
                pluginManager = debuggerWorkspaceBinding.pluginManager;
            });
            function createAndRegisterScript() {
                const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
                const scriptUrl = 'https://script-host/script.js';
                return debuggerModel.parsedScriptSource('0', scriptUrl, 0, 0, 0, 0, 0, '', null, false, undefined, false, false, 0, null, null, null, null, null, null);
            }
            it('correctly processes missing debug info if available', async () => {
                const plugin = new Plugin('TestPlugin');
                sinon.stub(plugin, 'getFunctionInfo').returns(Promise.resolve({ missingSymbolFiles: [MISSING_DWO_FILE] }));
                pluginManager.addPlugin(plugin);
                const script = createAndRegisterScript();
                const location = sinon.createStubInstance(SDK.DebuggerModel.Location);
                const result = await pluginManager.getFunctionInfo(script, location);
                Platform.assertNotNullOrUndefined(result);
                assert.deepStrictEqual(result, { missingSymbolFiles: [MISSING_DEBUG_FILES] });
            });
            it('correctly returns frames if available', async () => {
                const plugin = new Plugin('TestPlugin');
                sinon.stub(plugin, 'getFunctionInfo').returns(Promise.resolve({ frames: [{ name: FUNCTION_NAME }] }));
                pluginManager.addPlugin(plugin);
                const script = createAndRegisterScript();
                const location = sinon.createStubInstance(SDK.DebuggerModel.Location);
                const result = await pluginManager.getFunctionInfo(script, location);
                Platform.assertNotNullOrUndefined(result);
                assert.deepStrictEqual(result, { frames: [{ name: FUNCTION_NAME }] });
            });
            it('correctly returns frames and missing debug info if both are available', async () => {
                const plugin = new Plugin('TestPlugin');
                sinon.stub(plugin, 'getFunctionInfo')
                    .returns(Promise.resolve({ frames: [{ name: FUNCTION_NAME }], missingSymbolFiles: [MISSING_DWO_FILE] }));
                pluginManager.addPlugin(plugin);
                const script = createAndRegisterScript();
                const location = sinon.createStubInstance(SDK.DebuggerModel.Location);
                const result = await pluginManager.getFunctionInfo(script, location);
                Platform.assertNotNullOrUndefined(result);
                assert.deepStrictEqual(result, { frames: [{ name: FUNCTION_NAME }], missingSymbolFiles: [MISSING_DEBUG_FILES] });
            });
        });
    });
});
//# sourceMappingURL=DebuggerLanguagePlugins.test.js.map