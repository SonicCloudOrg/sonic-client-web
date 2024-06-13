import * as Types from '../types/types.js';
import { type TraceEventHandlerName } from './types.js';
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function getFrameIdForPageLoadEvent(event: Types.TraceEvents.PageLoadEvent): string;
/**
 * Classifications sourced from
 * https://web.dev/fcp/
 */
export declare function scoreClassificationForFirstContentfulPaint(fcpScoreInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
/**
 * Classifications sourced from
 * https://web.dev/interactive/#how-lighthouse-determines-your-tti-score
 */
export declare function scoreClassificationForTimeToInteractive(ttiTimeInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
/**
 * Classifications sourced from
 * https://web.dev/lcp/#what-is-lcp
 */
export declare function scoreClassificationForLargestContentfulPaint(lcpTimeInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
/**
 * DCL does not have a classification.
 */
export declare function scoreClassificationForDOMContentLoaded(_dclTimeInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
/**
 * Classifications sourced from
 * https://web.dev/lighthouse-total-blocking-#time/
 */
export declare function scoreClassificationForTotalBlockingTime(tbtTimeInMicroseconds: Types.Timing.MicroSeconds): ScoreClassification;
export declare function finalize(): Promise<void>;
export type PageLoadMetricsData = {
    /**
     * This represents the metric scores for all navigations, for all frames in a trace.
     * Given a frame id, the map points to another map from navigation id to metric scores.
     * The metric scores include the event related to the metric as well as the data regarding
     * the score itself.
     */
    metricScoresByFrameId: Map<string, Map<string, Map<MetricName, MetricScore>>>;
    /**
     * Page load events with no associated duration that happened in the
     * main frame.
     */
    allMarkerEvents: Types.TraceEvents.PageLoadEvent[];
};
export declare function data(): PageLoadMetricsData;
export declare function deps(): TraceEventHandlerName[];
export declare const enum ScoreClassification {
    GOOD = "good",
    OK = "ok",
    BAD = "bad",
    UNCLASSIFIED = "unclassified"
}
export declare const enum MetricName {
    FCP = "FCP",
    FP = "FP",
    L = "L",
    LCP = "LCP",
    DCL = "DCL",
    TTI = "TTI",
    TBT = "TBT",
    CLS = "CLS"
}
export interface MetricScore {
    metricName: MetricName;
    classification: ScoreClassification;
    event?: Types.TraceEvents.PageLoadEvent;
    navigation?: Types.TraceEvents.TraceEventNavigationStart;
    estimated?: boolean;
    timing: Types.Timing.MicroSeconds;
}
