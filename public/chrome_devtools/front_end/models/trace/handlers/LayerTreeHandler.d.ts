import * as Types from '../types/types.js';
import { type TraceEventHandlerName } from './types.js';
export declare function reset(): void;
export declare function initialize(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export interface LayerTreeData {
    paints: Types.TraceEvents.TraceEventPaint[];
    snapshots: Types.TraceEvents.TraceEventDisplayItemListSnapshot[];
    paintsToSnapshots: Map<Types.TraceEvents.TraceEventPaint, Types.TraceEvents.TraceEventDisplayItemListSnapshot>;
}
export declare function data(): LayerTreeData;
export declare function deps(): TraceEventHandlerName[];
