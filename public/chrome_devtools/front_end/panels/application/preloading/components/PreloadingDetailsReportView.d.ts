import type * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as Protocol from '../../../../generated/protocol.js';
import * as Logs from '../../../../models/logs/logs.js';
import * as LegacyWrapper from '../../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as UI from '../../../../ui/legacy/legacy.js';
export type PreloadingDetailsReportViewData = PreloadingDetailsReportViewDataInternal | null;
interface PreloadingDetailsReportViewDataInternal {
    preloadingAttempt: SDK.PreloadingModel.PreloadingAttempt;
    ruleSets: Protocol.Preload.RuleSet[];
    pageURL: Platform.DevToolsPath.UrlString;
    requestResolver?: Logs.RequestResolver.RequestResolver;
}
export declare class PreloadingDetailsReportView extends LegacyWrapper.LegacyWrapper.WrappableComponent<UI.Widget.VBox> {
    #private;
    static readonly litTagName: import("../../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: PreloadingDetailsReportViewData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-preloading-details-report-view': PreloadingDetailsReportView;
    }
}
export {};
