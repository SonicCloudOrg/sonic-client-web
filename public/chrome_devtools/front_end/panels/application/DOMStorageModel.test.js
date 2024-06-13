// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as Resources from './application.js';
describeWithMockConnection('DOMStorageModel', () => {
    let domStorageModel;
    let domStorage;
    let target;
    const initKey = 'storageKey1';
    beforeEach(() => {
        target = createTarget();
        domStorageModel = new Resources.DOMStorageModel.DOMStorageModel(target);
        domStorage = new Resources.DOMStorageModel.DOMStorage(domStorageModel, initKey, true);
    });
    it('DOMStorage is instantiated correctly', () => {
        assert.strictEqual(domStorage.storageKey, initKey);
        assert.deepStrictEqual(domStorage.id, { storageKey: initKey, isLocalStorage: true });
    });
    it('StorageKey events trigger addition/removal of DOMStorage', () => {
        const testKey = 'storageKey';
        const testId = { storageKey: testKey, isLocalStorage: true };
        domStorageModel.enable();
        const manager = target.model(SDK.StorageKeyManager.StorageKeyManager);
        assert.exists(manager);
        assert.isEmpty(domStorageModel.storages());
        manager.dispatchEventToListeners("StorageKeyAdded" /* SDK.StorageKeyManager.Events.StorageKeyAdded */, testKey);
        assert.exists(domStorageModel.storageForId(testId));
        assert.exists(domStorageModel.storageForId(testId));
        manager.dispatchEventToListeners("StorageKeyRemoved" /* SDK.StorageKeyManager.Events.StorageKeyRemoved */, testKey);
        assert.isUndefined(domStorageModel.storageForId(testId));
    });
});
//# sourceMappingURL=DOMStorageModel.test.js.map