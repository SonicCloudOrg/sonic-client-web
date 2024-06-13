import * as Types from '../types/types.js';
import { type TraceEventHandlerName } from './types.js';
export interface WarningsData {
    perEvent: Map<Types.TraceEvents.TraceEventData, Warning[]>;
    perWarning: Map<Warning, Types.TraceEvents.TraceEventData[]>;
}
export type Warning = 'LONG_TASK' | 'IDLE_CALLBACK_OVER_TIME' | 'FORCED_REFLOW' | 'LONG_INTERACTION';
export declare const FORCED_REFLOW_THRESHOLD: Types.Timing.MicroSeconds;
export declare const LONG_MAIN_THREAD_TASK_THRESHOLD: Types.Timing.MicroSeconds;
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function deps(): TraceEventHandlerName[];
export declare function finalize(): Promise<void>;
export declare function data(): WarningsData;
