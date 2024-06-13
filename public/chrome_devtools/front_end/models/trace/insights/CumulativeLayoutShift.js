// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as Helpers from '../helpers/helpers.js';
import * as Types from '../types/types.js';
export function deps() {
    return ['Meta', 'Animations', 'LayoutShifts', 'NetworkRequests'];
}
/**
 * Each failure reason is represented by a bit flag. The bit shift operator '<<' is used to define
 * which bit corresponds to each failure reason.
 * https://source.chromium.org/search?q=f:compositor_animations.h%20%22enum%20FailureReason%22
 * @type {{flag: number, failure: AnimationFailureReasons}[]}
 */
const ACTIONABLE_FAILURE_REASONS = [
    {
        flag: 1 << 13,
        failure: "UNSUPPORTED_CSS_PROPERTY" /* AnimationFailureReasons.UNSUPPORTED_CSS_PROPERTY */,
    },
    {
        flag: 1 << 11,
        failure: "TRANSFROM_BOX_SIZE_DEPENDENT" /* AnimationFailureReasons.TRANSFROM_BOX_SIZE_DEPENDENT */,
    },
    {
        flag: 1 << 12,
        failure: "FILTER_MAY_MOVE_PIXELS" /* AnimationFailureReasons.FILTER_MAY_MOVE_PIXELS */,
    },
    {
        flag: 1 << 4,
        failure: "NON_REPLACE_COMPOSITE_MODE" /* AnimationFailureReasons.NON_REPLACE_COMPOSITE_MODE */,
    },
    {
        flag: 1 << 6,
        failure: "INCOMPATIBLE_ANIMATIONS" /* AnimationFailureReasons.INCOMPATIBLE_ANIMATIONS */,
    },
    {
        flag: 1 << 3,
        failure: "UNSUPPORTED_TIMING_PARAMS" /* AnimationFailureReasons.UNSUPPORTED_TIMING_PARAMS */,
    },
];
// 500ms window.
// Use this window to consider events and requests that may have caused a layout shift.
const INVALIDATION_WINDOW = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(0.5));
function isInInvalidationWindow(event, targetEvent) {
    const eventEnd = event.dur ? event.ts + event.dur : event.ts;
    return eventEnd < targetEvent.ts && eventEnd >= targetEvent.ts - INVALIDATION_WINDOW;
}
/**
 * Returns a list of NoncompositedAnimationFailures.
 */
function getNonCompositedAnimations(animations) {
    const failures = [];
    for (const event of animations) {
        const beginEvent = event.args.data.beginEvent;
        const instantEvents = event.args.data.instantEvents || [];
        /**
         * Animation events containing composite information are ASYNC_NESTABLE_INSTANT ('n').
         * An animation may also contain multiple 'n' events, so we look through those with useful non-composited data.
         */
        for (const event of instantEvents) {
            const failureMask = event.args.data.compositeFailed;
            const unsupportedProperties = event.args.data.unsupportedProperties;
            if (!failureMask || !unsupportedProperties) {
                continue;
            }
            const failureReasons = ACTIONABLE_FAILURE_REASONS.filter(reason => failureMask & reason.flag).map(reason => {
                return reason.failure;
            });
            const failure = {
                name: beginEvent.args.data.displayName,
                failureReasons,
                unsupportedProperties,
            };
            failures.push(failure);
        }
    }
    return failures;
}
/**
 * Given an array of layout shift and PrePaint events, returns a mapping from
 * PrePaint events to layout shifts dispatched within it.
 */
function getShiftsByPrePaintEvents(layoutShifts, prePaintEvents) {
    // Maps from PrePaint events to LayoutShifts that occured in each one.
    const shiftsByPrePaint = new Map();
    // Associate all shifts to their corresponding PrePaint.
    for (const prePaintEvent of prePaintEvents) {
        const firstShiftIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(layoutShifts, shift => shift.ts >= prePaintEvent.ts);
        if (firstShiftIndex === null) {
            // No layout shifts registered after this PrePaint start. Continue.
            continue;
        }
        for (let i = firstShiftIndex; i < layoutShifts.length; i++) {
            const shift = layoutShifts[i];
            if (shift.ts >= prePaintEvent.ts && shift.ts <= prePaintEvent.ts + prePaintEvent.dur) {
                const shiftsInPrePaint = Platform.MapUtilities.getWithDefault(shiftsByPrePaint, prePaintEvent, () => []);
                shiftsInPrePaint.push(shift);
            }
            if (shift.ts > prePaintEvent.ts + prePaintEvent.dur) {
                // Reached all layoutShifts of this PrePaint. Break out to continue with the next prePaint event.
                break;
            }
        }
    }
    return shiftsByPrePaint;
}
/**
 * This gets the first prePaint event that follows the provided event and returns it.
 */
function getNextPrePaintEvent(prePaintEvents, targetEvent) {
    // Get the first PrePaint event that happened after the targetEvent.
    const nextPrePaintIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(prePaintEvents, prePaint => prePaint.ts > targetEvent.ts + (targetEvent.dur || 0));
    // No PrePaint event registered after this event
    if (nextPrePaintIndex === null) {
        return undefined;
    }
    return prePaintEvents[nextPrePaintIndex];
}
/**
 * An Iframe is considered a root cause if the iframe event occurs before a prePaint event
 * and within this prePaint event a layout shift(s) occurs.
 */
function getIframeRootCauses(iframeCreatedEvents, prePaintEvents, shiftsByPrePaint, rootCausesByShift) {
    for (const iframeEvent of iframeCreatedEvents) {
        const nextPrePaint = getNextPrePaintEvent(prePaintEvents, iframeEvent);
        // If no following prePaint, this is not a root cause.
        if (!nextPrePaint) {
            continue;
        }
        const shifts = shiftsByPrePaint.get(nextPrePaint);
        // if no layout shift(s), this is not a root cause.
        if (!shifts) {
            continue;
        }
        for (const shift of shifts) {
            const rootCausesForShift = Platform.MapUtilities.getWithDefault(rootCausesByShift, shift, () => {
                return {
                    iframes: [],
                    fontRequests: [],
                };
            });
            rootCausesForShift.iframes.push(iframeEvent);
        }
    }
    return rootCausesByShift;
}
/**
 * A font request is considered a root cause if the request occurs before a prePaint event
 * and within this prePaint event a layout shift(s) occurs. Additionally, this font request should
 * happen within the INVALIDATION_WINDOW of the prePaint event.
 */
function getFontRootCauses(networkRequests, prePaintEvents, shiftsByPrePaint, rootCausesByShift) {
    const fontRequests = networkRequests.filter(req => req.args.data.resourceType === 'Font' && req.args.data.mimeType.startsWith('font'));
    for (const req of fontRequests) {
        const nextPrePaint = getNextPrePaintEvent(prePaintEvents, req);
        if (!nextPrePaint) {
            continue;
        }
        // If the req is outside the INVALIDATION_WINDOW, it could not be a root cause.
        if (!isInInvalidationWindow(req, nextPrePaint)) {
            continue;
        }
        // Get the shifts that belong to this prepaint
        const shifts = shiftsByPrePaint.get(nextPrePaint);
        // if no layout shift(s) in this prePaint, the request is not a root cause.
        if (!shifts) {
            continue;
        }
        // Include the root cause to the shifts in this prePaint.
        for (const shift of shifts) {
            const rootCausesForShift = Platform.MapUtilities.getWithDefault(rootCausesByShift, shift, () => {
                return {
                    iframes: [],
                    fontRequests: [],
                };
            });
            rootCausesForShift.fontRequests.push(req);
        }
    }
    return rootCausesByShift;
}
export function generateInsight(traceParsedData, context) {
    const isWithinSameNavigation = ((event) => {
        const nav = Helpers.Trace.getNavigationForTraceEvent(event, context.frameId, traceParsedData.Meta.navigationsByFrameId);
        return nav?.args.data?.navigationId === context.navigationId;
    });
    const compositeAnimationEvents = traceParsedData.Animations.animations.filter(isWithinSameNavigation);
    const animationFailures = getNonCompositedAnimations(compositeAnimationEvents);
    const iframeEvents = traceParsedData.LayoutShifts.renderFrameImplCreateChildFrameEvents.filter(isWithinSameNavigation);
    const networkRequests = traceParsedData.NetworkRequests.byTime.filter(isWithinSameNavigation);
    const layoutShifts = traceParsedData.LayoutShifts.clusters.flatMap(cluster => 
    // Use one of the events in the cluster to determine if within the same navigation.
    isWithinSameNavigation(cluster.events[0]) ? cluster.events : []);
    const prePaintEvents = traceParsedData.LayoutShifts.prePaintEvents.filter(isWithinSameNavigation);
    // Get root causes.
    const rootCausesByShift = new Map();
    const shiftsByPrePaint = getShiftsByPrePaintEvents(layoutShifts, prePaintEvents);
    for (const shift of layoutShifts) {
        rootCausesByShift.set(shift, { iframes: [], fontRequests: [] });
    }
    getIframeRootCauses(iframeEvents, prePaintEvents, shiftsByPrePaint, rootCausesByShift);
    getFontRootCauses(networkRequests, prePaintEvents, shiftsByPrePaint, rootCausesByShift);
    return {
        animationFailures,
        shifts: rootCausesByShift,
    };
}
//# sourceMappingURL=CumulativeLayoutShift.js.map