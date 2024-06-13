import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare class InterestGroupStorageModel extends SDK.SDKModel.SDKModel<EventTypes> implements ProtocolProxyApi.StorageDispatcher {
    private readonly storageAgent;
    private enabled?;
    constructor(target: SDK.Target.Target);
    enable(): void;
    disable(): void;
    interestGroupAccessed(event: Protocol.Storage.InterestGroupAccessedEvent): void;
    attributionReportingTriggerRegistered(_event: Protocol.Storage.AttributionReportingTriggerRegisteredEvent): void;
    indexedDBListUpdated(_event: Protocol.Storage.IndexedDBListUpdatedEvent): void;
    indexedDBContentUpdated(_event: Protocol.Storage.IndexedDBContentUpdatedEvent): void;
    interestGroupAuctionEventOccurred(_event: Protocol.Storage.InterestGroupAuctionEventOccurredEvent): void;
    interestGroupAuctionNetworkRequestCreated(_event: Protocol.Storage.InterestGroupAuctionNetworkRequestCreatedEvent): void;
    cacheStorageListUpdated(_event: Protocol.Storage.CacheStorageListUpdatedEvent): void;
    cacheStorageContentUpdated(_event: Protocol.Storage.CacheStorageContentUpdatedEvent): void;
    sharedStorageAccessed(_event: Protocol.Storage.SharedStorageAccessedEvent): void;
    storageBucketCreatedOrUpdated(_event: Protocol.Storage.StorageBucketCreatedOrUpdatedEvent): void;
    storageBucketDeleted(_event: Protocol.Storage.StorageBucketDeletedEvent): void;
    attributionReportingSourceRegistered(_event: Protocol.Storage.AttributionReportingSourceRegisteredEvent): void;
}
export declare const enum Events {
    InterestGroupAccess = "InterestGroupAccess"
}
export type EventTypes = {
    [Events.InterestGroupAccess]: Protocol.Storage.InterestGroupAccessedEvent;
};
