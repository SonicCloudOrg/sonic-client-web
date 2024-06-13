// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class ExecutionError extends Error {
}
function stringifyObjectOnThePage() {
    const seenBefore = new WeakMap();
    return JSON.stringify(this, function replacer(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (seenBefore.has(value)) {
                return '(cycle)';
            }
            seenBefore.set(value, true);
        }
        if (value instanceof HTMLElement) {
            const attributesText = [];
            for (const attribute of value.attributes) {
                attributesText.push(`${attribute.name}="${attribute.value}"`);
            }
            return `<${value.nodeName.toLowerCase()}${attributesText.length > 0 ? ` ${attributesText.join(' ')}` : ''}>${value.hasChildNodes() ? '...' : ''}</${value.nodeName.toLowerCase()}>`;
        }
        if (this instanceof CSSStyleDeclaration) {
            // Do not add number keys to the output.
            if (!isNaN(Number(key))) {
                return undefined;
            }
        }
        return value;
    });
}
async function stringifyRemoteObject(object) {
    switch (object.type) {
        case "string" /* Protocol.Runtime.RemoteObjectType.String */:
            return `'${object.value}'`;
        case "bigint" /* Protocol.Runtime.RemoteObjectType.Bigint */:
            return `${object.value}n`;
        case "boolean" /* Protocol.Runtime.RemoteObjectType.Boolean */:
        case "number" /* Protocol.Runtime.RemoteObjectType.Number */:
            return `${object.value}`;
        case "undefined" /* Protocol.Runtime.RemoteObjectType.Undefined */:
            return 'undefined';
        case "symbol" /* Protocol.Runtime.RemoteObjectType.Symbol */:
        case "function" /* Protocol.Runtime.RemoteObjectType.Function */:
            return `${object.description}`;
        case "object" /* Protocol.Runtime.RemoteObjectType.Object */: {
            const res = await object.callFunction(stringifyObjectOnThePage);
            if (!res.object || res.object.type !== "string" /* Protocol.Runtime.RemoteObjectType.String */) {
                throw new Error('Could not stringify the object' + object);
            }
            return res.object.value;
        }
        default:
            throw new Error('Unknown type to stringify ' + object.type);
    }
}
export class FreestylerEvaluateAction {
    static async execute(code, executionContext, options = {}) {
        const response = await executionContext.evaluate({
            expression: code,
            replMode: true,
            includeCommandLineAPI: true,
            returnByValue: false,
            silent: false,
            generatePreview: true,
            allowUnsafeEvalBlockedByCSP: false,
            throwOnSideEffect: options.allowSideEffectForTest ? false : true,
        }, 
        /* userGesture */ false, /* awaitPromise */ true);
        if (!response) {
            throw new Error('Response is not found');
        }
        if ('error' in response) {
            throw new ExecutionError(response.error);
        }
        if (response.exceptionDetails) {
            // TODO(ergunsh): We can return the exception message so that it can tweak the code to run.
            throw new ExecutionError(response.exceptionDetails.exception?.description || 'JS exception');
        }
        return stringifyRemoteObject(response.object);
    }
}
//# sourceMappingURL=FreestylerEvaluateAction.js.map