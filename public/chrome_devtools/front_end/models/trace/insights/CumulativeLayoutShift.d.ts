import * as Types from '../types/types.js';
import { type InsightResult, type NavigationInsightContext, type RequiredData } from './types.js';
export declare function deps(): ['Meta', 'Animations', 'LayoutShifts', 'NetworkRequests'];
export declare const enum AnimationFailureReasons {
    UNSUPPORTED_CSS_PROPERTY = "UNSUPPORTED_CSS_PROPERTY",
    TRANSFROM_BOX_SIZE_DEPENDENT = "TRANSFROM_BOX_SIZE_DEPENDENT",
    FILTER_MAY_MOVE_PIXELS = "FILTER_MAY_MOVE_PIXELS",
    NON_REPLACE_COMPOSITE_MODE = "NON_REPLACE_COMPOSITE_MODE",
    INCOMPATIBLE_ANIMATIONS = "INCOMPATIBLE_ANIMATIONS",
    UNSUPPORTED_TIMING_PARAMS = "UNSUPPORTED_TIMING_PARAMS"
}
export interface NoncompositedAnimationFailure {
    /**
     * Animation name.
     */
    name?: string;
    /**
     * Failure reason based on mask number defined in
     * https://source.chromium.org/search?q=f:compositor_animations.h%20%22enum%20FailureReason%22.
     */
    failureReasons: AnimationFailureReasons[];
    /**
     * Unsupported properties.
     */
    unsupportedProperties?: Types.TraceEvents.TraceEventAnimation['args']['data']['unsupportedProperties'];
}
export interface LayoutShiftRootCausesData {
    iframes: Types.TraceEvents.TraceEventRenderFrameImplCreateChildFrame[];
    fontRequests: Types.TraceEvents.SyntheticNetworkRequest[];
}
export declare function generateInsight(traceParsedData: RequiredData<typeof deps>, context: NavigationInsightContext): InsightResult<{
    animationFailures?: readonly NoncompositedAnimationFailure[];
    shifts?: Map<Types.TraceEvents.TraceEventLayoutShift, LayoutShiftRootCausesData>;
}>;
