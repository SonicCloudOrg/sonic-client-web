import * as Types from '../types/types.js';
export declare const millisecondsToMicroseconds: (value: Types.Timing.MilliSeconds) => Types.Timing.MicroSeconds;
export declare const secondsToMilliseconds: (value: Types.Timing.Seconds) => Types.Timing.MilliSeconds;
export declare const secondsToMicroseconds: (value: Types.Timing.Seconds) => Types.Timing.MicroSeconds;
export declare const microSecondsToMilliseconds: (value: Types.Timing.MicroSeconds) => Types.Timing.MilliSeconds;
export declare const microSecondsToSeconds: (value: Types.Timing.MicroSeconds) => Types.Timing.Seconds;
export declare function timeStampForEventAdjustedByClosestNavigation(event: Types.TraceEvents.TraceEventData, traceBounds: Types.Timing.TraceWindowMicroSeconds, navigationsByNavigationId: Map<string, Types.TraceEvents.TraceEventNavigationStart>, navigationsByFrameId: Map<string, Types.TraceEvents.TraceEventNavigationStart[]>): Types.Timing.MicroSeconds;
export interface EventTimingsData<ValueType extends Types.Timing.MicroSeconds | Types.Timing.MilliSeconds | Types.Timing.Seconds> {
    startTime: ValueType;
    endTime: ValueType;
    duration: ValueType;
    selfTime: ValueType;
}
export declare function eventTimingsMicroSeconds(event: Types.TraceEvents.TraceEventData): EventTimingsData<Types.Timing.MicroSeconds>;
export declare function eventTimingsMilliSeconds(event: Types.TraceEvents.TraceEventData): EventTimingsData<Types.Timing.MilliSeconds>;
export declare function eventTimingsSeconds(event: Types.TraceEvents.TraceEventData): EventTimingsData<Types.Timing.Seconds>;
export declare function traceWindowMilliSeconds(bounds: Types.Timing.TraceWindowMicroSeconds): Types.Timing.TraceWindowMilliSeconds;
export declare function traceWindowMillisecondsToMicroSeconds(bounds: Types.Timing.TraceWindowMilliSeconds): Types.Timing.TraceWindowMicroSeconds;
export declare function traceWindowFromMilliSeconds(min: Types.Timing.MilliSeconds, max: Types.Timing.MilliSeconds): Types.Timing.TraceWindowMicroSeconds;
export declare function traceWindowFromMicroSeconds(min: Types.Timing.MicroSeconds, max: Types.Timing.MicroSeconds): Types.Timing.TraceWindowMicroSeconds;
export interface BoundsIncludeTimeRange {
    timeRange: Types.Timing.TraceWindowMicroSeconds;
    bounds: Types.Timing.TraceWindowMicroSeconds;
}
/**
 * Checks to see if the timeRange is within the bounds. By "within" we mean
 * "has any overlap":
 *         |------------------------|
 *      ==                                     no overlap (entirely before)
 *       =========                             overlap
 *            =========                        overlap
 *                             =========       overlap
 *                                     ====    no overlap (entirely after)
 *        ==============================       overlap (time range is larger than bounds)
 *         |------------------------|
 */
export declare function boundsIncludeTimeRange(data: BoundsIncludeTimeRange): boolean;
