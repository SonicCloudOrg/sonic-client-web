import * as Types from '../types/types.js';
import { type TraceEventHandlerName } from './types.js';
interface NetworkRequestData {
    byOrigin: Map<string, {
        renderBlocking: Types.TraceEvents.SyntheticNetworkRequest[];
        nonRenderBlocking: Types.TraceEvents.SyntheticNetworkRequest[];
        all: Types.TraceEvents.SyntheticNetworkRequest[];
    }>;
    byTime: Types.TraceEvents.SyntheticNetworkRequest[];
}
export declare function reset(): void;
export declare function initialize(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): NetworkRequestData;
export declare function deps(): TraceEventHandlerName[];
export {};
