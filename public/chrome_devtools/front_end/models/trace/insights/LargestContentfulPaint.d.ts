import * as Types from '../types/types.js';
import { type InsightResult, type NavigationInsightContext, type RequiredData } from './types.js';
export declare function deps(): ['NetworkRequests', 'PageLoadMetrics', 'LargestImagePaint', 'Meta'];
export interface LCPPhases {
    /**
     * The time between when the user initiates loading the page until when
     * the browser receives the first byte of the html response.
     */
    ttfb: Types.Timing.MilliSeconds;
    /**
     * The time between ttfb and the LCP resource request being started.
     * For a text LCP, this is undefined given no resource is loaded.
     */
    loadDelay?: Types.Timing.MilliSeconds;
    /**
     * The time it takes to load the LCP resource.
     */
    loadTime?: Types.Timing.MilliSeconds;
    /**
     * The time between when the LCP resource finishes loading and when
     * the LCP element is rendered.
     */
    renderDelay: Types.Timing.MilliSeconds;
}
export declare function generateInsight(traceParsedData: RequiredData<typeof deps>, context: NavigationInsightContext): InsightResult<{
    lcpMs?: Types.Timing.MilliSeconds;
    phases?: LCPPhases;
    shouldRemoveLazyLoading?: boolean;
    shouldIncreasePriorityHint?: boolean;
    shouldPreloadImage?: boolean;
}>;
