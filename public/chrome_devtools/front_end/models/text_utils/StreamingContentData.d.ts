import * as Common from '../../core/common/common.js';
import { ContentData } from './ContentData.js';
import { type DeferredContent } from './ContentProvider.js';
/**
 * Usage of this class is mostly intended for content that is never "complete".
 * E.g. streaming XHR/fetch requests.
 *
 * Due to the streaming nature this class only supports base64-encoded binary data.
 * Decoding to text only happens on-demand by clients. This ensures that at most we have
 * incomplete unicode at the end and not in-between chunks.
 */
export declare class StreamingContentData extends Common.ObjectWrapper.ObjectWrapper<EventTypes> {
    #private;
    readonly mimeType: string;
    private constructor();
    /**
     * Creates a new StreamingContentData with the given MIME type/charset.
     */
    static create(mimeType: string, charset?: string): StreamingContentData;
    /**
     * Creates a new StringContentData from an existing ContentData instance.
     *
     * Calling `addChunk` is on the resulting `StreamingContentData` is illegal if
     * `content` was not created from base64 data. The reason is that JavaScript TextEncoder
     * only supports UTF-8. We can't convert text with arbitrary encoding back to base64 for concatenation.
     */
    static from(content: ContentData): StreamingContentData;
    get isTextContent(): boolean;
    /** @param chunk base64 encoded data */
    addChunk(chunk: string): void;
    /** @returns An immutable ContentData with all the bytes received so far */
    content(): ContentData;
}
export type StreamingContentDataOrError = StreamingContentData | {
    error: string;
};
export declare const isError: (contentDataOrError: StreamingContentDataOrError) => contentDataOrError is {
    error: string;
};
export declare const asDeferredContent: (contentDataOrError: StreamingContentDataOrError) => DeferredContent;
export declare const enum Events {
    ChunkAdded = "ChunkAdded"
}
export type EventTypes = {
    [Events.ChunkAdded]: {
        content: StreamingContentData;
        chunk: string;
    };
};
