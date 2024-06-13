import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ApplicationPanelTreeElement, ExpandableApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import { BackgroundServiceModel } from './BackgroundServiceModel.js';
import { BounceTrackingMitigationsTreeElement } from './BounceTrackingMitigationsTreeElement.js';
import { type DOMStorage } from './DOMStorageModel.js';
import { type Database as IndexedDBModelDatabase, type DatabaseId, type Index, IndexedDBModel, type ObjectStore } from './IndexedDBModel.js';
import { InterestGroupTreeElement } from './InterestGroupTreeElement.js';
import type * as PreloadingHelper from './preloading/helper/helper.js';
import { PreloadingSummaryTreeElement } from './PreloadingTreeElement.js';
import { ReportingApiTreeElement } from './ReportingApiTreeElement.js';
import { type ResourcesPanel } from './ResourcesPanel.js';
import { ServiceWorkerCacheTreeElement } from './ServiceWorkerCacheTreeElement.js';
import { SharedStorageListTreeElement } from './SharedStorageListTreeElement.js';
import { StorageBucketsTreeParentElement } from './StorageBucketsTreeElement.js';
import { TrustTokensTreeElement } from './TrustTokensTreeElement.js';
export declare namespace SharedStorageTreeElementDispatcher {
    const enum Events {
        SharedStorageTreeElementAdded = "SharedStorageTreeElementAdded"
    }
    interface SharedStorageTreeElementAddedEvent {
        origin: string;
    }
    type EventTypes = {
        [Events.SharedStorageTreeElementAdded]: SharedStorageTreeElementAddedEvent;
    };
}
export declare class ApplicationPanelSidebar extends UI.Widget.VBox implements SDK.TargetManager.Observer {
    panel: ResourcesPanel;
    private readonly sidebarTree;
    private readonly applicationTreeElement;
    serviceWorkersTreeElement: ServiceWorkersTreeElement;
    localStorageListTreeElement: ExpandableApplicationPanelTreeElement;
    sessionStorageListTreeElement: ExpandableApplicationPanelTreeElement;
    indexedDBListTreeElement: IndexedDBTreeElement;
    interestGroupTreeElement: InterestGroupTreeElement;
    cookieListTreeElement: ExpandableApplicationPanelTreeElement;
    trustTokensTreeElement: TrustTokensTreeElement;
    cacheStorageListTreeElement: ServiceWorkerCacheTreeElement;
    sharedStorageListTreeElement: SharedStorageListTreeElement;
    storageBucketsTreeElement: StorageBucketsTreeParentElement | undefined;
    private backForwardCacheListTreeElement?;
    backgroundFetchTreeElement: BackgroundServiceTreeElement;
    backgroundSyncTreeElement: BackgroundServiceTreeElement;
    bounceTrackingMitigationsTreeElement: BounceTrackingMitigationsTreeElement;
    notificationsTreeElement: BackgroundServiceTreeElement;
    paymentHandlerTreeElement: BackgroundServiceTreeElement;
    periodicBackgroundSyncTreeElement: BackgroundServiceTreeElement;
    pushMessagingTreeElement: BackgroundServiceTreeElement;
    reportingApiTreeElement: ReportingApiTreeElement;
    preloadingSummaryTreeElement: PreloadingSummaryTreeElement | undefined;
    private readonly resourcesSection;
    private domStorageTreeElements;
    private sharedStorageTreeElements;
    private domains;
    private target?;
    private previousHoveredElement?;
    readonly sharedStorageTreeElementDispatcher: Common.ObjectWrapper.ObjectWrapper<SharedStorageTreeElementDispatcher.EventTypes>;
    constructor(panel: ResourcesPanel);
    private addSidebarSection;
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
    focus(): void;
    private initialize;
    private domStorageModelAdded;
    private domStorageModelRemoved;
    private indexedDBModelAdded;
    private indexedDBModelRemoved;
    private interestGroupModelAdded;
    private interestGroupModelRemoved;
    private sharedStorageModelAdded;
    private sharedStorageModelRemoved;
    private storageBucketsModelAdded;
    private storageBucketsModelRemoved;
    private resetWithFrames;
    private treeElementAdded;
    private reset;
    private frameNavigated;
    private interestGroupAccess;
    private addCookieDocument;
    private domStorageAdded;
    private addDOMStorage;
    private domStorageRemoved;
    private removeDOMStorage;
    private sharedStorageAdded;
    private addSharedStorage;
    private sharedStorageRemoved;
    private removeSharedStorage;
    private sharedStorageAccess;
    showResource(resource: SDK.Resource.Resource, line?: number, column?: number): Promise<void>;
    showFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    showFileSystem(view: UI.Widget.Widget): void;
    private innerShowView;
    showPreloadingRuleSetView(revealInfo: PreloadingHelper.PreloadingForward.RuleSetView): void;
    showPreloadingAttemptViewWithFilter(filter: PreloadingHelper.PreloadingForward.AttemptViewWithFilter): void;
    private onmousemove;
    private onmouseleave;
    wasShown(): void;
}
export declare class BackgroundServiceTreeElement extends ApplicationPanelTreeElement {
    private serviceName;
    private view;
    private model;
    private selectedInternal;
    constructor(storagePanel: ResourcesPanel, serviceName: Protocol.BackgroundService.ServiceName);
    private getIconType;
    initialize(model: BackgroundServiceModel | null): void;
    get itemURL(): Platform.DevToolsPath.UrlString;
    get selectable(): boolean;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class ServiceWorkersTreeElement extends ApplicationPanelTreeElement {
    private view?;
    constructor(storagePanel: ResourcesPanel);
    get itemURL(): Platform.DevToolsPath.UrlString;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class AppManifestTreeElement extends ApplicationPanelTreeElement {
    private view;
    constructor(storagePanel: ResourcesPanel);
    get itemURL(): Platform.DevToolsPath.UrlString;
    onselect(selectedByUser?: boolean): boolean;
    generateChildren(): void;
    onInvoke(): void;
    showManifestView(): void;
}
export declare class ManifestChildTreeElement extends ApplicationPanelTreeElement {
    #private;
    constructor(storagePanel: ResourcesPanel, element: Element, childTitle: string, fieldElement: HTMLElement);
    get itemURL(): Platform.DevToolsPath.UrlString;
    onInvoke(): void;
    onInvokeElementKeydown(event: KeyboardEvent): void;
}
export declare class ClearStorageTreeElement extends ApplicationPanelTreeElement {
    private view?;
    constructor(storagePanel: ResourcesPanel);
    get itemURL(): Platform.DevToolsPath.UrlString;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class IndexedDBTreeElement extends ExpandableApplicationPanelTreeElement {
    private idbDatabaseTreeElements;
    private storageBucket?;
    constructor(storagePanel: ResourcesPanel, storageBucket?: Protocol.Storage.StorageBucket);
    private initialize;
    addIndexedDBForModel(model: IndexedDBModel): void;
    removeIndexedDBForModel(model: IndexedDBModel): void;
    onattach(): void;
    private handleContextMenuEvent;
    refreshIndexedDB(): void;
    private databaseInTree;
    private indexedDBAdded;
    private addIndexedDB;
    private indexedDBRemoved;
    private removeIDBDatabaseTreeElement;
    private indexedDBLoaded;
    private indexedDBLoadedForTest;
    private indexedDBContentUpdated;
    private idbDatabaseTreeElement;
}
export declare class IDBDatabaseTreeElement extends ApplicationPanelTreeElement {
    model: IndexedDBModel;
    databaseId: DatabaseId;
    private readonly idbObjectStoreTreeElements;
    private database?;
    private view?;
    constructor(storagePanel: ResourcesPanel, model: IndexedDBModel, databaseId: DatabaseId);
    get itemURL(): Platform.DevToolsPath.UrlString;
    onattach(): void;
    private handleContextMenuEvent;
    private refreshIndexedDB;
    indexedDBContentUpdated(objectStoreName: string): void;
    update(database: IndexedDBModelDatabase, entriesUpdated: boolean): void;
    private updateTooltip;
    get selectable(): boolean;
    onselect(selectedByUser?: boolean): boolean;
    private objectStoreRemoved;
    clear(): void;
}
export declare class IDBObjectStoreTreeElement extends ApplicationPanelTreeElement {
    private model;
    private databaseId;
    private readonly idbIndexTreeElements;
    private objectStore;
    private view;
    constructor(storagePanel: ResourcesPanel, model: IndexedDBModel, databaseId: DatabaseId, objectStore: ObjectStore);
    get itemURL(): Platform.DevToolsPath.UrlString;
    onattach(): void;
    markNeedsRefresh(): void;
    private handleContextMenuEvent;
    private refreshObjectStore;
    private clearObjectStore;
    update(objectStore: ObjectStore, entriesUpdated: boolean): void;
    private updateTooltip;
    onselect(selectedByUser?: boolean): boolean;
    private indexRemoved;
    clear(): void;
}
export declare class IDBIndexTreeElement extends ApplicationPanelTreeElement {
    private model;
    private databaseId;
    private objectStore;
    private index;
    private refreshObjectStore;
    private view?;
    constructor(storagePanel: ResourcesPanel, model: IndexedDBModel, databaseId: DatabaseId, objectStore: ObjectStore, index: Index, refreshObjectStore: () => void);
    get itemURL(): Platform.DevToolsPath.UrlString;
    markNeedsRefresh(): void;
    refreshIndex(): void;
    update(objectStore: ObjectStore, index: Index, entriesUpdated: boolean): void;
    private updateTooltip;
    onselect(selectedByUser?: boolean): boolean;
    clear(): void;
}
export declare class DOMStorageTreeElement extends ApplicationPanelTreeElement {
    private readonly domStorage;
    constructor(storagePanel: ResourcesPanel, domStorage: DOMStorage);
    get itemURL(): Platform.DevToolsPath.UrlString;
    onselect(selectedByUser?: boolean): boolean;
    onattach(): void;
    private handleContextMenuEvent;
}
export declare class CookieTreeElement extends ApplicationPanelTreeElement {
    private readonly target;
    private readonly cookieDomainInternal;
    constructor(storagePanel: ResourcesPanel, frame: SDK.ResourceTreeModel.ResourceTreeFrame, cookieUrl: Common.ParsedURL.ParsedURL);
    get itemURL(): Platform.DevToolsPath.UrlString;
    cookieDomain(): string;
    onattach(): void;
    private handleContextMenuEvent;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class StorageCategoryView extends UI.Widget.VBox {
    private emptyWidget;
    private linkElement;
    constructor();
    setText(text: string): void;
    setLink(link: Platform.DevToolsPath.UrlString | null): void;
}
export declare class ResourcesSection implements SDK.TargetManager.Observer {
    panel: ResourcesPanel;
    private readonly treeElement;
    private treeElementForFrameId;
    private treeElementForTargetId;
    constructor(storagePanel: ResourcesPanel, treeElement: UI.TreeOutline.TreeElement);
    private initialize;
    targetAdded(target: SDK.Target.Target): void;
    private workerAdded;
    targetRemoved(_target: SDK.Target.Target): void;
    private addFrameAndParents;
    private expandFrame;
    revealResource(resource: SDK.Resource.Resource, line?: number, column?: number): Promise<void>;
    revealAndSelectFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    private frameAdded;
    private frameDetached;
    private frameNavigated;
    private resourceAdded;
    private windowOpened;
    private windowDestroyed;
    private windowChanged;
    reset(): void;
}
export declare class FrameTreeElement extends ApplicationPanelTreeElement {
    private section;
    private frame;
    private frameId;
    private readonly categoryElements;
    private readonly treeElementForResource;
    private treeElementForWindow;
    private treeElementForWorker;
    private view;
    constructor(section: ResourcesSection, frame: SDK.ResourceTreeModel.ResourceTreeFrame);
    getIconTypeForFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame): 'frame-crossed' | 'frame' | 'iframe-crossed' | 'iframe';
    frameNavigated(frame: SDK.ResourceTreeModel.ResourceTreeFrame): Promise<void>;
    get itemURL(): Platform.DevToolsPath.UrlString;
    onselect(selectedByUser?: boolean): boolean;
    set hovered(hovered: boolean);
    appendResource(resource: SDK.Resource.Resource): void;
    windowOpened(targetInfo: Protocol.Target.TargetInfo): void;
    workerCreated(targetInfo: Protocol.Target.TargetInfo): void;
    windowChanged(targetInfo: Protocol.Target.TargetInfo): void;
    windowDestroyed(targetId: Protocol.Target.TargetID): void;
    appendChild(treeElement: UI.TreeOutline.TreeElement, comparator?: ((arg0: UI.TreeOutline.TreeElement, arg1: UI.TreeOutline.TreeElement) => number) | undefined): void;
    /**
     * Order elements by type (first frames, then resources, last Document resources)
     * and then each of these groups in the alphabetical order.
     */
    private static presentationOrderCompare;
}
export declare class FrameResourceTreeElement extends ApplicationPanelTreeElement {
    private readonly panel;
    private resource;
    private previewPromise;
    constructor(storagePanel: ResourcesPanel, resource: SDK.Resource.Resource);
    static forResource(resource: SDK.Resource.Resource): FrameResourceTreeElement | undefined;
    get itemURL(): Platform.DevToolsPath.UrlString;
    private preparePreview;
    onselect(selectedByUser?: boolean): boolean;
    ondblclick(_event: Event): boolean;
    onattach(): void;
    private ondragstart;
    private handleContextMenuEvent;
    revealResource(lineNumber?: number, columnNumber?: number): Promise<void>;
}
