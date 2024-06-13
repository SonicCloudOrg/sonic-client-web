import * as Types from '../types/types.js';
export interface WorkersData {
    workerSessionIdEvents: readonly Types.TraceEvents.TraceEventTracingSessionIdForWorker[];
    workerIdByThread: Map<Types.TraceEvents.ThreadID, Types.TraceEvents.WorkerId>;
    workerURLById: Map<Types.TraceEvents.WorkerId, string>;
}
export declare function initialize(): void;
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): WorkersData;
