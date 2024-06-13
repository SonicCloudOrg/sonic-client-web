import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class DeveloperResourcesRevealer implements Common.Revealer.Revealer<SDK.PageResourceLoader.ResourceKey> {
    reveal(resourceInitiatorKey: SDK.PageResourceLoader.ResourceKey): Promise<void>;
}
export declare class DeveloperResourcesView extends UI.ThrottledWidget.ThrottledWidget {
    private textFilterRegExp;
    private readonly filterInput;
    private readonly coverageResultsElement;
    private listView;
    private readonly statusToolbarElement;
    private statusMessageElement;
    private readonly loader;
    constructor();
    doUpdate(): Promise<void>;
    select(resource: SDK.PageResourceLoader.PageResource): Promise<void>;
    selectedItem(): Promise<SDK.PageResourceLoader.PageResource | null>;
    private updateStats;
    private isVisible;
    private onFilterChanged;
    wasShown(): void;
}
