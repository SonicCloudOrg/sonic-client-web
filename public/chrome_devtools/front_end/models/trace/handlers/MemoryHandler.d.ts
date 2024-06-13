import * as Types from '../types/types.js';
export interface MemoryData {
    updateCountersByProcess: Map<Types.TraceEvents.ProcessID, Types.TraceEvents.TraceEventUpdateCounters[]>;
}
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function data(): MemoryData;
