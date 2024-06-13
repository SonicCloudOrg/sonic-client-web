import type * as SDK from '../../../core/sdk/sdk.js';
import * as NetworkForward from '../forward/forward.js';
export interface RequestHeaderSectionData {
    request: SDK.NetworkRequest.NetworkRequest;
    toReveal?: {
        section: NetworkForward.UIRequestLocation.UIHeaderSection;
        header?: string;
    };
}
export declare class RequestHeaderSection extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: RequestHeaderSectionData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-request-header-section': RequestHeaderSection;
    }
}
