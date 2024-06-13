import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function initialize(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export interface InitiatorsData {
    eventToInitiator: Map<Types.TraceEvents.TraceEventData, Types.TraceEvents.TraceEventData>;
    initiatorToEvents: Map<Types.TraceEvents.TraceEventData, Types.TraceEvents.TraceEventData[]>;
}
export declare function data(): InitiatorsData;
