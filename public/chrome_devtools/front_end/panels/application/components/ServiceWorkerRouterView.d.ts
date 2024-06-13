import type * as SDK from '../../../core/sdk/sdk.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
export declare class ServiceWorkerRouterView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    update(rules: SDK.ServiceWorkerManager.ServiceWorkerRouterRule[]): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-service-worker-router-view': ServiceWorkerRouterView;
    }
}
