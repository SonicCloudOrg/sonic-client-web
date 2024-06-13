/*
 * Copyright (C) 2023 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import { SDKModel } from './SDKModel.js';
import { StorageKeyManager } from './StorageKeyManager.js';
export class StorageBucketsModel extends SDKModel {
    enabled = false;
    storageAgent;
    storageKeyManager;
    bucketsById = new Map();
    trackedStorageKeys = new Set();
    constructor(target) {
        super(target);
        target.registerStorageDispatcher(this);
        this.storageAgent = target.storageAgent();
        this.storageKeyManager = target.model(StorageKeyManager);
    }
    getBuckets() {
        return new Set(this.bucketsById.values());
    }
    getBucketsForStorageKey(storageKey) {
        const buckets = [...this.bucketsById.values()];
        return new Set(buckets.filter(({ bucket }) => bucket.storageKey === storageKey));
    }
    getDefaultBucketForStorageKey(storageKey) {
        const buckets = [...this.bucketsById.values()];
        return buckets.find(({ bucket }) => bucket.storageKey === storageKey && bucket.name === undefined) ?? null;
    }
    getBucketById(bucketId) {
        return this.bucketsById.get(bucketId) ?? null;
    }
    getBucketByName(storageKey, bucketName) {
        if (!bucketName) {
            return this.getDefaultBucketForStorageKey(storageKey);
        }
        const buckets = [...this.bucketsById.values()];
        return buckets.find(({ bucket }) => bucket.storageKey === storageKey && bucket.name === bucketName) ?? null;
    }
    deleteBucket(bucket) {
        void this.storageAgent.invoke_deleteStorageBucket({ bucket });
    }
    enable() {
        if (this.enabled) {
            return;
        }
        if (this.storageKeyManager) {
            this.storageKeyManager.addEventListener("StorageKeyAdded" /* StorageKeyManagerEvents.StorageKeyAdded */, this.storageKeyAdded, this);
            this.storageKeyManager.addEventListener("StorageKeyRemoved" /* StorageKeyManagerEvents.StorageKeyRemoved */, this.storageKeyRemoved, this);
            for (const storageKey of this.storageKeyManager.storageKeys()) {
                this.addStorageKey(storageKey);
            }
        }
        this.enabled = true;
    }
    storageKeyAdded(event) {
        this.addStorageKey(event.data);
    }
    storageKeyRemoved(event) {
        this.removeStorageKey(event.data);
    }
    addStorageKey(storageKey) {
        if (this.trackedStorageKeys.has(storageKey)) {
            throw new Error('Can\'t call addStorageKey for a storage key if it has already been added.');
        }
        this.trackedStorageKeys.add(storageKey);
        void this.storageAgent.invoke_setStorageBucketTracking({ storageKey, enable: true });
    }
    removeStorageKey(storageKey) {
        if (!this.trackedStorageKeys.has(storageKey)) {
            throw new Error('Can\'t call removeStorageKey for a storage key if it hasn\'t already been added.');
        }
        const bucketsForStorageKey = this.getBucketsForStorageKey(storageKey);
        for (const bucket of bucketsForStorageKey) {
            this.bucketRemoved(bucket);
        }
        this.trackedStorageKeys.delete(storageKey);
        void this.storageAgent.invoke_setStorageBucketTracking({ storageKey, enable: false });
    }
    bucketAdded(bucketInfo) {
        this.bucketsById.set(bucketInfo.id, bucketInfo);
        this.dispatchEventToListeners("BucketAdded" /* Events.BucketAdded */, { model: this, bucketInfo });
    }
    bucketRemoved(bucketInfo) {
        this.bucketsById.delete(bucketInfo.id);
        this.dispatchEventToListeners("BucketRemoved" /* Events.BucketRemoved */, { model: this, bucketInfo });
    }
    bucketChanged(bucketInfo) {
        this.dispatchEventToListeners("BucketChanged" /* Events.BucketChanged */, { model: this, bucketInfo });
    }
    bucketInfosAreEqual(bucketInfo1, bucketInfo2) {
        return bucketInfo1.bucket.storageKey === bucketInfo2.bucket.storageKey && bucketInfo1.id === bucketInfo2.id &&
            bucketInfo1.bucket.name === bucketInfo2.bucket.name && bucketInfo1.expiration === bucketInfo2.expiration &&
            bucketInfo1.quota === bucketInfo2.quota && bucketInfo1.persistent === bucketInfo2.persistent &&
            bucketInfo1.durability === bucketInfo2.durability;
    }
    storageBucketCreatedOrUpdated({ bucketInfo }) {
        const curBucket = this.getBucketById(bucketInfo.id);
        if (curBucket) {
            if (!this.bucketInfosAreEqual(curBucket, bucketInfo)) {
                this.bucketChanged(bucketInfo);
            }
        }
        else {
            this.bucketAdded(bucketInfo);
        }
    }
    storageBucketDeleted({ bucketId }) {
        const curBucket = this.getBucketById(bucketId);
        if (curBucket) {
            this.bucketRemoved(curBucket);
        }
        else {
            throw new Error(`Received an event that Storage Bucket '${bucketId}' was deleted, but it wasn't in the StorageBucketsModel.`);
        }
    }
    attributionReportingTriggerRegistered(_event) {
    }
    interestGroupAccessed(_event) {
    }
    interestGroupAuctionEventOccurred(_event) {
    }
    interestGroupAuctionNetworkRequestCreated(_event) {
    }
    indexedDBListUpdated(_event) {
    }
    indexedDBContentUpdated(_event) {
    }
    cacheStorageListUpdated(_event) {
    }
    cacheStorageContentUpdated(_event) {
    }
    sharedStorageAccessed(_event) {
    }
    attributionReportingSourceRegistered(_event) {
    }
}
SDKModel.register(StorageBucketsModel, { capabilities: 8192 /* Capability.Storage */, autostart: false });
//# sourceMappingURL=StorageBucketsModel.js.map