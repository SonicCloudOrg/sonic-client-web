import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare class SharedStorageForOrigin extends Common.ObjectWrapper.ObjectWrapper<SharedStorageForOrigin.EventTypes> {
    #private;
    constructor(model: SharedStorageModel, securityOrigin: string);
    get securityOrigin(): string;
    getMetadata(): Promise<Protocol.Storage.SharedStorageMetadata | null>;
    getEntries(): Promise<Protocol.Storage.SharedStorageEntry[] | null>;
    setEntry(key: string, value: string, ignoreIfPresent: boolean): Promise<void>;
    deleteEntry(key: string): Promise<void>;
    clear(): Promise<void>;
    resetBudget(): Promise<void>;
}
export declare namespace SharedStorageForOrigin {
    const enum Events {
        SharedStorageChanged = "SharedStorageChanged"
    }
    interface SharedStorageChangedEvent {
        accessTime: Protocol.Network.TimeSinceEpoch;
        type: Protocol.Storage.SharedStorageAccessType;
        mainFrameId: Protocol.Page.FrameId;
        params: Protocol.Storage.SharedStorageAccessParams;
    }
    type EventTypes = {
        [Events.SharedStorageChanged]: SharedStorageChangedEvent;
    };
}
export declare class SharedStorageModel extends SDK.SDKModel.SDKModel<EventTypes> implements ProtocolProxyApi.StorageDispatcher {
    #private;
    readonly storageAgent: ProtocolProxyApi.StorageApi;
    constructor(target: SDK.Target.Target);
    enable(): Promise<void>;
    disable(): void;
    dispose(): void;
    storages(): IterableIterator<SharedStorageForOrigin>;
    storageForOrigin(origin: string): SharedStorageForOrigin | null;
    numStoragesForTesting(): number;
    isChangeEvent(event: Protocol.Storage.SharedStorageAccessedEvent): boolean;
    sharedStorageAccessed(event: Protocol.Storage.SharedStorageAccessedEvent): void;
    attributionReportingTriggerRegistered(_event: Protocol.Storage.AttributionReportingTriggerRegisteredEvent): void;
    indexedDBListUpdated(_event: Protocol.Storage.IndexedDBListUpdatedEvent): void;
    indexedDBContentUpdated(_event: Protocol.Storage.IndexedDBContentUpdatedEvent): void;
    cacheStorageListUpdated(_event: Protocol.Storage.CacheStorageListUpdatedEvent): void;
    cacheStorageContentUpdated(_event: Protocol.Storage.CacheStorageContentUpdatedEvent): void;
    interestGroupAccessed(_event: Protocol.Storage.InterestGroupAccessedEvent): void;
    interestGroupAuctionEventOccurred(_event: Protocol.Storage.InterestGroupAuctionEventOccurredEvent): void;
    interestGroupAuctionNetworkRequestCreated(_event: Protocol.Storage.InterestGroupAuctionNetworkRequestCreatedEvent): void;
    storageBucketCreatedOrUpdated(_event: Protocol.Storage.StorageBucketCreatedOrUpdatedEvent): void;
    storageBucketDeleted(_event: Protocol.Storage.StorageBucketDeletedEvent): void;
    attributionReportingSourceRegistered(_event: Protocol.Storage.AttributionReportingSourceRegisteredEvent): void;
}
export declare const enum Events {
    SharedStorageAccess = "SharedStorageAccess",
    SharedStorageAdded = "SharedStorageAdded",
    SharedStorageRemoved = "SharedStorageRemoved"
}
export type EventTypes = {
    [Events.SharedStorageAccess]: Protocol.Storage.SharedStorageAccessedEvent;
    [Events.SharedStorageAdded]: SharedStorageForOrigin;
    [Events.SharedStorageRemoved]: SharedStorageForOrigin;
};
