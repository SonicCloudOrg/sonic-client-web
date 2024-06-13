import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export interface ImagePaintData {
    paintImageByDrawLazyPixelRef: Map<number, Types.TraceEvents.TraceEventPaintImage>;
    paintImageForEvent: Map<Types.TraceEvents.TraceEventData, Types.TraceEvents.TraceEventPaintImage>;
}
export declare function data(): ImagePaintData;
