import { type TraceEventHandlerName } from './types.js';
import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function initialize(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export interface GPUHandlerReturnData {
    mainGPUThreadTasks: readonly Types.TraceEvents.TraceEventGPUTask[];
}
export declare function data(): GPUHandlerReturnData;
export declare function deps(): TraceEventHandlerName[];
