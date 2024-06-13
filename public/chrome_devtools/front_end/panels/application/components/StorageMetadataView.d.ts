import * as SDK from '../../../core/sdk/sdk.js';
import type * as Protocol from '../../../generated/protocol.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
export declare class StorageMetadataView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    getShadow(): ShadowRoot;
    setStorageKey(storageKey: string): void;
    setStorageBucket(storageBucket: Protocol.Storage.StorageBucketInfo): void;
    enableStorageBucketControls(model: SDK.StorageBucketsModel.StorageBucketsModel): void;
    render(): Promise<void>;
    getTitle(): string | undefined;
    key(content: string | LitHtml.TemplateResult): LitHtml.TemplateResult;
    value(content: string | LitHtml.TemplateResult): LitHtml.TemplateResult;
    renderReportContent(): Promise<LitHtml.LitTemplate>;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-storage-metadata-view': StorageMetadataView;
    }
}
