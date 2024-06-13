import * as Types from '../types/types.js';
export interface UserTimingsData {
    /**
     * Events triggered with the performance.measure() API.
     * https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure
     */
    performanceMeasures: readonly Types.TraceEvents.SyntheticUserTimingPair[];
    /**
     * Events triggered with the performance.mark() API.
     * https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark
     */
    performanceMarks: readonly Types.TraceEvents.TraceEventPerformanceMark[];
    /**
     * Events triggered with the console.time(), console.timeEnd() and
     * console.timeLog() API.
     * https://developer.mozilla.org/en-US/docs/Web/API/console/time
     */
    consoleTimings: readonly Types.TraceEvents.SyntheticConsoleTimingPair[];
    /**
     * Events triggered with the console.timeStamp() API
     * https://developer.mozilla.org/en-US/docs/Web/API/console/timeStamp
     */
    timestampEvents: readonly Types.TraceEvents.TraceEventTimeStamp[];
}
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): UserTimingsData;
