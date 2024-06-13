import * as SDK from '../../../core/sdk/sdk.js';
import * as Protocol from '../../../generated/protocol.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
export interface FrameDetailsReportViewData {
    frame: SDK.ResourceTreeModel.ResourceTreeFrame;
    target?: SDK.Target.Target;
    adScriptId: Protocol.Page.AdScriptId | null;
}
export declare class FrameDetailsReportView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor(frame: SDK.ResourceTreeModel.ResourceTreeFrame);
    connectedCallback(): void;
    render(): Promise<void>;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-frame-details-view': FrameDetailsReportView;
    }
}
