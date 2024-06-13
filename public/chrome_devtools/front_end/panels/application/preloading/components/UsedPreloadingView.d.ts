import type * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as LegacyWrapper from '../../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as UI from '../../../../ui/legacy/legacy.js';
export interface UsedPreloadingViewData {
    pageURL: Platform.DevToolsPath.UrlString;
    previousAttempts: SDK.PreloadingModel.PreloadingAttempt[];
    currentAttempts: SDK.PreloadingModel.PreloadingAttempt[];
}
export declare const enum UsedKind {
    DowngradedPrerenderToPrefetchAndUsed = "DowngradedPrerenderToPrefetchAndUsed",
    PrefetchUsed = "PrefetchUsed",
    PrerenderUsed = "PrerenderUsed",
    PrefetchFailed = "PrefetchFailed",
    PrerenderFailed = "PrerenderFailed",
    NoPreloads = "NoPreloads"
}
export declare class UsedPreloadingView extends LegacyWrapper.LegacyWrapper.WrappableComponent<UI.Widget.VBox> {
    #private;
    static readonly litTagName: import("../../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: UsedPreloadingViewData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-used-preloading-view': UsedPreloadingView;
    }
}
