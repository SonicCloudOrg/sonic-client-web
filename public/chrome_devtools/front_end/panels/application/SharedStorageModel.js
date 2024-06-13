// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
export class SharedStorageForOrigin extends Common.ObjectWrapper.ObjectWrapper {
    #model;
    #securityOrigin;
    constructor(model, securityOrigin) {
        super();
        this.#model = model;
        this.#securityOrigin = securityOrigin;
    }
    get securityOrigin() {
        return this.#securityOrigin;
    }
    async getMetadata() {
        return this.#model.storageAgent.invoke_getSharedStorageMetadata({ ownerOrigin: this.securityOrigin })
            .then(({ metadata }) => metadata);
    }
    async getEntries() {
        return this.#model.storageAgent.invoke_getSharedStorageEntries({ ownerOrigin: this.securityOrigin })
            .then(({ entries }) => entries);
    }
    async setEntry(key, value, ignoreIfPresent) {
        await this.#model.storageAgent.invoke_setSharedStorageEntry({ ownerOrigin: this.securityOrigin, key, value, ignoreIfPresent });
    }
    async deleteEntry(key) {
        await this.#model.storageAgent.invoke_deleteSharedStorageEntry({ ownerOrigin: this.securityOrigin, key });
    }
    async clear() {
        await this.#model.storageAgent.invoke_clearSharedStorageEntries({ ownerOrigin: this.securityOrigin });
    }
    async resetBudget() {
        await this.#model.storageAgent.invoke_resetSharedStorageBudget({ ownerOrigin: this.securityOrigin });
    }
}
export class SharedStorageModel extends SDK.SDKModel.SDKModel {
    #securityOriginManager;
    #storages;
    storageAgent;
    #enabled;
    constructor(target) {
        super(target);
        target.registerStorageDispatcher(this);
        this.#securityOriginManager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        this.#storages = new Map();
        this.storageAgent = target.storageAgent();
        this.#enabled = false;
    }
    async enable() {
        if (this.#enabled) {
            return;
        }
        this.#securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginAdded, this.#securityOriginAdded, this);
        this.#securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginRemoved, this.#securityOriginRemoved, this);
        await this.storageAgent.invoke_setSharedStorageTracking({ enable: true });
        this.#addAllOrigins();
        this.#enabled = true;
    }
    disable() {
        if (!this.#enabled) {
            return;
        }
        this.#securityOriginManager.removeEventListener(SDK.SecurityOriginManager.Events.SecurityOriginAdded, this.#securityOriginAdded, this);
        this.#securityOriginManager.removeEventListener(SDK.SecurityOriginManager.Events.SecurityOriginRemoved, this.#securityOriginRemoved, this);
        void this.storageAgent.invoke_setSharedStorageTracking({ enable: false });
        this.#removeAllOrigins();
        this.#enabled = false;
    }
    dispose() {
        this.disable();
    }
    #addAllOrigins() {
        for (const securityOrigin of this.#securityOriginManager.securityOrigins()) {
            void this.#maybeAddOrigin(securityOrigin);
        }
    }
    #removeAllOrigins() {
        for (const securityOrigin of this.#storages.keys()) {
            this.#removeOrigin(securityOrigin);
        }
    }
    #securityOriginAdded(event) {
        this.#maybeAddOrigin(event.data);
    }
    #maybeAddOrigin(securityOrigin) {
        const parsedSecurityOrigin = new Common.ParsedURL.ParsedURL(securityOrigin);
        // These are "opaque" origins which are not supposed to support shared storage.
        if (!parsedSecurityOrigin.isValid || parsedSecurityOrigin.scheme === 'data' ||
            parsedSecurityOrigin.scheme === 'about' || parsedSecurityOrigin.scheme === 'javascript') {
            return;
        }
        // Only add origin if it's not already added.
        if (this.#storages.has(securityOrigin)) {
            return;
        }
        const storage = new SharedStorageForOrigin(this, securityOrigin);
        this.#storages.set(securityOrigin, storage);
        this.dispatchEventToListeners("SharedStorageAdded" /* Events.SharedStorageAdded */, storage);
    }
    #securityOriginRemoved(event) {
        this.#removeOrigin(event.data);
    }
    #removeOrigin(securityOrigin) {
        const storage = this.storageForOrigin(securityOrigin);
        if (!storage) {
            return;
        }
        this.#storages.delete(securityOrigin);
        this.dispatchEventToListeners("SharedStorageRemoved" /* Events.SharedStorageRemoved */, storage);
    }
    storages() {
        return this.#storages.values();
    }
    storageForOrigin(origin) {
        return this.#storages.get(origin) || null;
    }
    numStoragesForTesting() {
        return this.#storages.size;
    }
    isChangeEvent(event) {
        return [
            "documentSet" /* Protocol.Storage.SharedStorageAccessType.DocumentSet */,
            "documentAppend" /* Protocol.Storage.SharedStorageAccessType.DocumentAppend */,
            "documentDelete" /* Protocol.Storage.SharedStorageAccessType.DocumentDelete */,
            "documentClear" /* Protocol.Storage.SharedStorageAccessType.DocumentClear */,
            "workletSet" /* Protocol.Storage.SharedStorageAccessType.WorkletSet */,
            "workletAppend" /* Protocol.Storage.SharedStorageAccessType.WorkletAppend */,
            "workletDelete" /* Protocol.Storage.SharedStorageAccessType.WorkletDelete */,
            "workletClear" /* Protocol.Storage.SharedStorageAccessType.WorkletClear */,
        ].includes(event.type);
    }
    sharedStorageAccessed(event) {
        if (this.isChangeEvent(event)) {
            const sharedStorage = this.storageForOrigin(event.ownerOrigin);
            if (sharedStorage) {
                const eventData = { accessTime: event.accessTime, type: event.type, mainFrameId: event.mainFrameId, params: event.params };
                // Forward events that may have changed `sharedStorage` to listeners for `sharedStorage`.
                sharedStorage.dispatchEventToListeners("SharedStorageChanged" /* SharedStorageForOrigin.Events.SharedStorageChanged */, eventData);
            }
            else {
                void this.#maybeAddOrigin(event.ownerOrigin);
            }
        }
        this.dispatchEventToListeners("SharedStorageAccess" /* Events.SharedStorageAccess */, event);
    }
    attributionReportingTriggerRegistered(_event) {
    }
    indexedDBListUpdated(_event) {
    }
    indexedDBContentUpdated(_event) {
    }
    cacheStorageListUpdated(_event) {
    }
    cacheStorageContentUpdated(_event) {
    }
    interestGroupAccessed(_event) {
    }
    interestGroupAuctionEventOccurred(_event) {
    }
    interestGroupAuctionNetworkRequestCreated(_event) {
    }
    storageBucketCreatedOrUpdated(_event) {
    }
    storageBucketDeleted(_event) {
    }
    attributionReportingSourceRegistered(_event) {
    }
}
SDK.SDKModel.SDKModel.register(SharedStorageModel, { capabilities: 8192 /* SDK.Target.Capability.Storage */, autostart: false });
//# sourceMappingURL=SharedStorageModel.js.map