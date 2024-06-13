import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export interface SelectorStatsData {
    dataForUpdateLayoutEvent: Map<Types.TraceEvents.TraceEventUpdateLayoutTree, {
        timings: Types.TraceEvents.SelectorTiming[];
    }>;
}
export declare function data(): SelectorStatsData;
