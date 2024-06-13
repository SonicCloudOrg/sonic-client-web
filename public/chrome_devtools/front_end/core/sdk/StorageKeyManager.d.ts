import { type Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
import type * as Platform from '../platform/platform.js';
export declare class StorageKeyManager extends SDKModel<EventTypes> {
    #private;
    constructor(target: Target);
    updateStorageKeys(storageKeys: Set<string>): void;
    storageKeys(): string[];
    mainStorageKey(): string;
    setMainStorageKey(storageKey: string): void;
}
export declare function parseStorageKey(storageKeyString: string): StorageKey;
export declare const enum StorageKeyComponent {
    TOP_LEVEL_SITE = "0",
    NONCE_HIGH = "1",
    NONCE_LOW = "2",
    ANCESTOR_CHAIN_BIT = "3",
    TOP_LEVEL_SITE_OPAQUE_NONCE_HIGH = "4",
    TOP_LEVEL_SITE_OPAQUE_NONCE_LOW = "5",
    TOP_LEVEL_SITE_OPAQUE_NONCE_PRECURSOR = "6"
}
export interface StorageKey {
    origin: Platform.DevToolsPath.UrlString;
    components: Map<StorageKeyComponent, string>;
}
export declare const enum Events {
    StorageKeyAdded = "StorageKeyAdded",
    StorageKeyRemoved = "StorageKeyRemoved",
    MainStorageKeyChanged = "MainStorageKeyChanged"
}
export interface MainStorageKeyChangedEvent {
    mainStorageKey: string;
}
export type EventTypes = {
    [Events.StorageKeyAdded]: string;
    [Events.StorageKeyRemoved]: string;
    [Events.MainStorageKeyChanged]: MainStorageKeyChangedEvent;
};
