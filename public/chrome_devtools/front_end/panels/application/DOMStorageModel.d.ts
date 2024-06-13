import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare class DOMStorage extends Common.ObjectWrapper.ObjectWrapper<DOMStorage.EventTypes> {
    private readonly model;
    private readonly storageKeyInternal;
    private readonly isLocalStorageInternal;
    constructor(model: DOMStorageModel, storageKey: string, isLocalStorage: boolean);
    static storageId(storageKey: string, isLocalStorage: boolean): Protocol.DOMStorage.StorageId;
    get id(): Protocol.DOMStorage.StorageId;
    get storageKey(): string | null;
    get isLocalStorage(): boolean;
    getItems(): Promise<Protocol.DOMStorage.Item[] | null>;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
export declare namespace DOMStorage {
    const enum Events {
        DOMStorageItemsCleared = "DOMStorageItemsCleared",
        DOMStorageItemRemoved = "DOMStorageItemRemoved",
        DOMStorageItemAdded = "DOMStorageItemAdded",
        DOMStorageItemUpdated = "DOMStorageItemUpdated"
    }
    interface DOMStorageItemRemovedEvent {
        key: string;
    }
    interface DOMStorageItemAddedEvent {
        key: string;
        value: string;
    }
    interface DOMStorageItemUpdatedEvent {
        key: string;
        oldValue: string;
        value: string;
    }
    type EventTypes = {
        [Events.DOMStorageItemsCleared]: void;
        [Events.DOMStorageItemRemoved]: DOMStorageItemRemovedEvent;
        [Events.DOMStorageItemAdded]: DOMStorageItemAddedEvent;
        [Events.DOMStorageItemUpdated]: DOMStorageItemUpdatedEvent;
    };
}
export declare class DOMStorageModel extends SDK.SDKModel.SDKModel<EventTypes> {
    private readonly storageKeyManagerInternal;
    private storagesInternal;
    readonly agent: ProtocolProxyApi.DOMStorageApi;
    private enabled?;
    constructor(target: SDK.Target.Target);
    get storageKeyManagerForTest(): SDK.StorageKeyManager.StorageKeyManager | null;
    enable(): void;
    clearForStorageKey(storageKey: string): void;
    private storageKeyAdded;
    private addStorageKey;
    private storageKeyRemoved;
    private removeStorageKey;
    private storageKey;
    domStorageItemsCleared(storageId: Protocol.DOMStorage.StorageId): void;
    domStorageItemRemoved(storageId: Protocol.DOMStorage.StorageId, key: string): void;
    domStorageItemAdded(storageId: Protocol.DOMStorage.StorageId, key: string, value: string): void;
    domStorageItemUpdated(storageId: Protocol.DOMStorage.StorageId, key: string, oldValue: string, value: string): void;
    storageForId(storageId: Protocol.DOMStorage.StorageId): DOMStorage;
    storages(): DOMStorage[];
}
export declare const enum Events {
    DOMStorageAdded = "DOMStorageAdded",
    DOMStorageRemoved = "DOMStorageRemoved"
}
export type EventTypes = {
    [Events.DOMStorageAdded]: DOMStorage;
    [Events.DOMStorageRemoved]: DOMStorage;
};
export declare class DOMStorageDispatcher implements ProtocolProxyApi.DOMStorageDispatcher {
    private readonly model;
    constructor(model: DOMStorageModel);
    domStorageItemsCleared({ storageId }: Protocol.DOMStorage.DomStorageItemsClearedEvent): void;
    domStorageItemRemoved({ storageId, key }: Protocol.DOMStorage.DomStorageItemRemovedEvent): void;
    domStorageItemAdded({ storageId, key, newValue }: Protocol.DOMStorage.DomStorageItemAddedEvent): void;
    domStorageItemUpdated({ storageId, key, oldValue, newValue }: Protocol.DOMStorage.DomStorageItemUpdatedEvent): void;
}
