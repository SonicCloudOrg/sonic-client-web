import * as SDK from '../../../core/sdk/sdk.js';
import * as Protocol from '../../../generated/protocol.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
export declare class RequestTrustTokensView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    wasShown(): void;
    willHide(): void;
    connectedCallback(): void;
    render(): Promise<void>;
}
export declare function statusConsideredSuccess(status: Protocol.Network.TrustTokenOperationDoneEventStatus): boolean;
declare global {
    interface HTMLElementTagNameMap {
        'devtools-trust-token-report': RequestTrustTokensView;
    }
}
