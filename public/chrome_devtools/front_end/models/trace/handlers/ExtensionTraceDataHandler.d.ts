import * as Types from '../types/types.js';
import { type TraceEventHandlerName } from './types.js';
export interface ExtensionTraceData {
    extensionTrackData: readonly Types.Extensions.ExtensionTrackData[];
    extensionMarkers: readonly Types.Extensions.SyntheticExtensionMarker[];
}
export declare function handleEvent(_event: Types.TraceEvents.TraceEventData): void;
export declare function reset(): void;
export declare function finalize(): Promise<void>;
export declare function extractExtensionEntries(timings: (Types.TraceEvents.SyntheticUserTimingPair | Types.TraceEvents.TraceEventPerformanceMark)[]): void;
export declare function extensionDataInTiming(timing: Types.TraceEvents.SyntheticUserTimingPair | Types.TraceEvents.TraceEventPerformanceMark): Types.Extensions.ExtensionDataPayload | null;
export declare function data(): ExtensionTraceData;
export declare function deps(): TraceEventHandlerName[];
