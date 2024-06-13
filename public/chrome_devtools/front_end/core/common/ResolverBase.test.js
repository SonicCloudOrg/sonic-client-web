// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from './common.js';
class TestClass {
}
export class ResolverTestImpl extends Common.ResolverBase.ResolverBase {
    items = new Map();
    currentlyListening = false;
    constructor(id, obj) {
        super();
        if (id !== undefined && obj !== undefined) {
            this.items.set(id, obj);
        }
    }
    getForId(id) {
        return this.items.get(id) || null;
    }
    startListening() {
        this.currentlyListening = true;
    }
    stopListening() {
        this.currentlyListening = false;
    }
    assertIsListening() {
        assert.isTrue(this.currentlyListening, 'Expected to be listening');
    }
    assertIsNotListening() {
        assert.isFalse(this.currentlyListening, 'Expected to be listening');
    }
    onResolve(id, obj) {
        super.onResolve(id, obj);
    }
}
describe('ResolverBase', () => {
    const id = 'foo';
    const testObj = new TestClass();
    describe('tryGet', () => {
        it('should resolve a known object', () => {
            const resolver = new ResolverTestImpl(id, testObj);
            const obj = resolver.tryGet(id, () => {
                throw new Error('This should not get called');
            });
            resolver.assertIsNotListening();
            assert.strictEqual(obj, testObj);
        });
        it('should not resolve an unknown object', () => {
            const resolver = new ResolverTestImpl();
            const obj = resolver.tryGet(id, () => {
                throw new Error('This should not get called');
            });
            resolver.assertIsListening();
            assert.strictEqual(obj, null);
            resolver.clear();
        });
        it('should resolve a previously unknown object when it becomes available', async () => {
            const resolver = new ResolverTestImpl();
            const waitForCall = new Promise(resolve => {
                const obj = resolver.tryGet(id, resolve);
                assert.strictEqual(obj, null);
            });
            resolver.assertIsListening();
            resolver.onResolve(id, testObj);
            const obj = await waitForCall;
            resolver.assertIsNotListening();
            assert.strictEqual(obj, testObj);
        });
    });
    describe('waitFor', () => {
        it('should resolve an existing object', async () => {
            const resolver = new ResolverTestImpl(id, testObj);
            const obj = await resolver.waitFor(id);
            resolver.assertIsNotListening();
            assert.strictEqual(obj, testObj);
        });
        it('should reject the promise after `clear` has been called', async () => {
            const resolver = new ResolverTestImpl();
            const obj = resolver.waitFor(id);
            resolver.assertIsListening();
            resolver.clear();
            resolver.assertIsNotListening();
            try {
                await obj;
            }
            catch (e) {
                return;
            }
            assert.fail('Expected `await obj` to throw.');
        });
        it('should resolve a previously unknown object when it becomes available', async () => {
            const resolver = new ResolverTestImpl();
            const objPromise = resolver.waitFor(id);
            resolver.assertIsListening();
            resolver.onResolve(id, testObj);
            const obj = await objPromise;
            resolver.assertIsNotListening();
            assert.strictEqual(obj, obj);
        });
    });
});
//# sourceMappingURL=ResolverBase.test.js.map