import * as Types from '../types/types.js';
import { type TraceEventHandlerName } from './types.js';
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): Types.TraceEvents.SyntheticScreenshot[];
export declare function deps(): TraceEventHandlerName[];
