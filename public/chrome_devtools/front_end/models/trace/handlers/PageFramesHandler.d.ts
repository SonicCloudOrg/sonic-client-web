import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export interface PageFrameData {
    frames: Map<string, Types.TraceEvents.TraceFrame>;
}
export declare function data(): PageFrameData;
