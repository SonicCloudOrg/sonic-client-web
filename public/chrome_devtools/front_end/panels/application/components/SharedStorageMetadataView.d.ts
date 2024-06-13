import type * as Protocol from '../../../generated/protocol.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import { StorageMetadataView } from './StorageMetadataView.js';
interface SharedStorageMetadataGetter {
    getMetadata: () => Promise<Protocol.Storage.SharedStorageMetadata | null>;
    resetBudget: () => Promise<void>;
}
export declare class SharedStorageMetadataView extends StorageMetadataView {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor(sharedStorageMetadataGetter: SharedStorageMetadataGetter, owner: string);
    connectedCallback(): void;
    getTitle(): string;
    renderReportContent(): Promise<LitHtml.LitTemplate>;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-shared-storage-metadata-view': SharedStorageMetadataView;
    }
}
export {};
