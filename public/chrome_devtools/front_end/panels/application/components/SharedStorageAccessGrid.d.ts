import type * as Protocol from '../../../generated/protocol.js';
export declare const i18nString: (id: string, values?: import("../../../core/i18n/i18nTypes.js").Values | undefined) => import("../../../core/platform/UIString.js").LocalizedString;
export declare class SharedStorageAccessGrid extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: Array<Protocol.Storage.SharedStorageAccessedEvent>);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-shared-storage-access-grid': SharedStorageAccessGrid;
    }
}
