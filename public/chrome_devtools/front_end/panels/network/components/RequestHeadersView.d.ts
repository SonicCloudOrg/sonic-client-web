import * as Common from '../../../core/common/common.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as NetworkForward from '../../../panels/network/forward/forward.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
export declare class RequestHeadersView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    wasShown(): void;
    willHide(): void;
    revealHeader(section: NetworkForward.UIRequestLocation.UIHeaderSection, header?: string): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): Promise<void>;
}
export declare class ToggleRawHeadersEvent extends Event {
    static readonly eventName = "togglerawevent";
    constructor();
}
export interface CategoryData {
    name: string;
    title: Common.UIString.LocalizedString;
    headerCount?: number;
    checked?: boolean;
    additionalContent?: LitHtml.LitTemplate;
    forceOpen?: boolean;
    loggingContext: string;
}
export declare class Category extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: CategoryData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-request-headers': RequestHeadersView;
        'devtools-request-headers-category': Category;
    }
}
