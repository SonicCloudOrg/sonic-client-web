// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Types from '../types/types.js';
import { getNavigationForTraceEvent } from './Trace.js';
export const millisecondsToMicroseconds = (value) => Types.Timing.MicroSeconds(value * 1000);
export const secondsToMilliseconds = (value) => Types.Timing.MilliSeconds(value * 1000);
export const secondsToMicroseconds = (value) => millisecondsToMicroseconds(secondsToMilliseconds(value));
export const microSecondsToMilliseconds = (value) => Types.Timing.MilliSeconds(value / 1000);
export const microSecondsToSeconds = (value) => Types.Timing.Seconds(value / 1000 / 1000);
export function timeStampForEventAdjustedByClosestNavigation(event, traceBounds, navigationsByNavigationId, navigationsByFrameId) {
    let eventTimeStamp = event.ts - traceBounds.min;
    if (event.args?.data?.navigationId) {
        const navigationForEvent = navigationsByNavigationId.get(event.args.data.navigationId);
        if (navigationForEvent) {
            eventTimeStamp = event.ts - navigationForEvent.ts;
        }
    }
    else if (event.args?.data?.frame) {
        const navigationForEvent = getNavigationForTraceEvent(event, event.args.data.frame, navigationsByFrameId);
        if (navigationForEvent) {
            eventTimeStamp = event.ts - navigationForEvent.ts;
        }
    }
    return Types.Timing.MicroSeconds(eventTimeStamp);
}
export function eventTimingsMicroSeconds(event) {
    return {
        startTime: event.ts,
        endTime: Types.Timing.MicroSeconds(event.ts + (event.dur || Types.Timing.MicroSeconds(0))),
        duration: Types.Timing.MicroSeconds(event.dur || 0),
        // TODO(crbug.com/1434599): Implement selfTime calculation for events
        // from the new engine.
        selfTime: Types.TraceEvents.isSyntheticTraceEntry(event) ? Types.Timing.MicroSeconds(event.selfTime || 0) :
            Types.Timing.MicroSeconds(event.dur || 0),
    };
}
export function eventTimingsMilliSeconds(event) {
    const microTimes = eventTimingsMicroSeconds(event);
    return {
        startTime: microSecondsToMilliseconds(microTimes.startTime),
        endTime: microSecondsToMilliseconds(microTimes.endTime),
        duration: microSecondsToMilliseconds(microTimes.duration),
        selfTime: microSecondsToMilliseconds(microTimes.selfTime),
    };
}
export function eventTimingsSeconds(event) {
    const microTimes = eventTimingsMicroSeconds(event);
    return {
        startTime: microSecondsToSeconds(microTimes.startTime),
        endTime: microSecondsToSeconds(microTimes.endTime),
        duration: microSecondsToSeconds(microTimes.duration),
        selfTime: microSecondsToSeconds(microTimes.selfTime),
    };
}
export function traceWindowMilliSeconds(bounds) {
    return {
        min: microSecondsToMilliseconds(bounds.min),
        max: microSecondsToMilliseconds(bounds.max),
        range: microSecondsToMilliseconds(bounds.range),
    };
}
export function traceWindowMillisecondsToMicroSeconds(bounds) {
    return {
        min: millisecondsToMicroseconds(bounds.min),
        max: millisecondsToMicroseconds(bounds.max),
        range: millisecondsToMicroseconds(bounds.range),
    };
}
export function traceWindowFromMilliSeconds(min, max) {
    const traceWindow = {
        min: millisecondsToMicroseconds(min),
        max: millisecondsToMicroseconds(max),
        range: Types.Timing.MicroSeconds(millisecondsToMicroseconds(max) - millisecondsToMicroseconds(min)),
    };
    return traceWindow;
}
export function traceWindowFromMicroSeconds(min, max) {
    const traceWindow = {
        min,
        max,
        range: Types.Timing.MicroSeconds(max - min),
    };
    return traceWindow;
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
export function boundsIncludeTimeRange(data) {
    const { min: visibleMin, max: visibleMax } = data.bounds;
    const { min: rangeMin, max: rangeMax } = data.timeRange;
    return visibleMin <= rangeMax && visibleMax >= rangeMin;
}
//# sourceMappingURL=Timing.js.map