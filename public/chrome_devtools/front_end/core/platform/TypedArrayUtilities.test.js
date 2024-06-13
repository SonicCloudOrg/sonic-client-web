// Copyright (c) 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from './platform.js';
describe('TypedArrayUtilities', () => {
    describe('BigUint32Array', () => {
        it('can be expandable', () => {
            const array = Platform.TypedArrayUtilities.createExpandableBigUint32Array();
            assert.strictEqual(array.length, 0);
            array.setValue(0, 33);
            array.setValue(1, 44);
            assert.strictEqual(array.length, 2);
            assert.strictEqual(array.getValue(0), 33);
            assert.strictEqual(array.getValue(1), 44);
            assert.strictEqual(array.asArrayOrFail(), array);
        });
        it('can act as a Uint32Array', () => {
            const array = Platform.TypedArrayUtilities.createFixedBigUint32Array(15);
            assert.strictEqual(array.length, 15);
            assert.strictEqual(array.getValue(7), 0);
            array.setValue(7, 77);
            assert.strictEqual(array.getValue(7), 77);
            assert.strictEqual(array.asUint32ArrayOrFail(), array);
        });
        it('can be bigger than a Uint32Array', () => {
            const array = Platform.TypedArrayUtilities.createFixedBigUint32Array(12_345_678, /* maxLengthForTesting=*/ 2e6);
            assert.strictEqual(array.length, 12_345_678);
            assert.strictEqual(array.getValue(0), 0);
            assert.strictEqual(array.getValue(500_000), 0);
            assert.strictEqual(array.getValue(5_000_000), 0);
            assert.strictEqual(array.getValue(12_345_677), 0);
            array.setValue(0, 9);
            array.setValue(500_000, 99);
            array.setValue(5_000_000, 999);
            array.setValue(12_345_677, 9999);
            assert.strictEqual(array.getValue(0), 9);
            assert.strictEqual(array.getValue(500_000), 99);
            assert.strictEqual(array.getValue(5_000_000), 999);
            assert.strictEqual(array.getValue(12_345_677), 9999);
            assert.isFalse(array instanceof Array);
            assert.isFalse(array instanceof Uint32Array);
        });
    });
});
//# sourceMappingURL=TypedArrayUtilities.test.js.map