// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { describeWithRealConnection, getExecutionContext } from '../../testing/RealConnection.js';
import * as Freestyler from './FreestylerEvaluateAction.js';
describe('FreestylerEvaluateAction', () => {
    describe('error handling', () => {
        function executeWithResult(mockResult) {
            const executionContextStub = sinon.createStubInstance(SDK.RuntimeModel.ExecutionContext);
            executionContextStub.evaluate.resolves(mockResult);
            return Freestyler.FreestylerEvaluateAction.execute('', executionContextStub);
        }
        function mockRemoteObject(overrides = {}) {
            return sinon.createStubInstance(SDK.RemoteObject.RemoteObject, {
                ...(overrides.className ? { className: overrides.className } : null),
                ...(overrides.subtype ? { subtype: overrides.subtype } : null),
                ...(overrides.type ? { type: overrides.type } : null),
                ...(overrides.value ? { value: overrides.value } : null),
                ...(overrides.preview ? { preview: overrides.preview } : null),
            });
        }
        function mockExceptionDetails({ description }) {
            return {
                exceptionId: 3,
                text: 'SyntaxError',
                lineNumber: 3,
                columnNumber: 3,
                exception: { type: "string" /* Protocol.Runtime.RemoteObjectType.String */, description },
            };
        }
        beforeEach(() => {
            sinon.restore();
        });
        it('should throw an ExecutionError when the page returned with an error message', async () => {
            try {
                await executeWithResult({ error: 'errorMessage' });
            }
            catch (err) {
                assert.instanceOf(err, Freestyler.ExecutionError);
                assert.strictEqual(err.message, 'errorMessage');
            }
        });
        it('should throw an ExecutionError with the description of the exception if response included exception details', async () => {
            try {
                await executeWithResult({
                    object: mockRemoteObject(),
                    exceptionDetails: mockExceptionDetails({ description: 'Error description' }),
                });
            }
            catch (err) {
                assert.instanceOf(err, Freestyler.ExecutionError);
                assert.strictEqual(err.message, 'Error description');
            }
        });
    });
    describeWithRealConnection('serialization', () => {
        async function executionContextForTest() {
            const targetManager = SDK.TargetManager.TargetManager.instance();
            const target = targetManager.rootTarget();
            const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
            return getExecutionContext(runtimeModel);
        }
        async function executeForTest(code, { allowSideEffectForTest = false } = {}) {
            return Freestyler.FreestylerEvaluateAction.execute(code, await executionContextForTest(), { allowSideEffectForTest });
        }
        it('should serialize primitive values correctly', async () => {
            assert.strictEqual(await executeForTest('"string"'), '\'string\'');
            assert.strictEqual(await executeForTest('999n'), '999n');
            assert.strictEqual(await executeForTest('true'), 'true');
            assert.strictEqual(await executeForTest('undefined'), 'undefined');
            assert.strictEqual(await executeForTest('42'), '42');
            assert.strictEqual(await executeForTest('Symbol("sym")'), 'Symbol(sym)');
        });
        it('should serialize DOM nodes correctly', async () => {
            assert.strictEqual(await executeForTest(`{
        const div = document.createElement('div');
        div.setAttribute('data-custom-attr', 'i exist');
        div
      }`, { allowSideEffectForTest: true }), '"<div data-custom-attr=\\"i exist\\"></div>"');
        });
        it('should serialize arrays correctly', async () => {
            assert.strictEqual(await executeForTest('[]'), '[]');
            assert.strictEqual(await executeForTest('[1]'), '[1]');
            assert.strictEqual(await executeForTest('[1, 2]'), '[1,2]');
            assert.strictEqual(await executeForTest('[{key: 1}]'), '[{"key":1}]');
        });
        it('should serialize objects correctly', async () => {
            assert.strictEqual(await executeForTest('{const object = {key: "str"}; object}'), '{"key":"str"}');
            assert.strictEqual(await executeForTest('{const object = {key: "str", secondKey: "str2"}; object}'), '{"key":"str","secondKey":"str2"}');
            assert.strictEqual(await executeForTest('{const object = {key: 1}; object}'), '{"key":1}');
        });
        it('should not continue serializing cycles', async () => {
            assert.strictEqual(await executeForTest(`{
        const obj = { a: 1 };
        obj.itself = obj;
        obj
      }`), '{"a":1,"itself":"(cycle)"}');
        });
        it('should not include number keys for CSSStyleDeclaration', async () => {
            const result = await executeForTest('getComputedStyle(document.body)');
            const parsedResult = JSON.parse(result);
            assert.isUndefined(parsedResult[0]);
        });
    });
});
//# sourceMappingURL=FreestylerEvaluateAction.test.js.map