// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * This handler stores page load metrics, including web vitals,
 * and exports them in the shape of a map with the following shape:
 * Map(FrameId -> Map(navigationID -> metrics) )
 *
 * It also exports all markers in a trace in an array.
 *
 * Some metrics are taken directly from a page load events (AKA markers) like DCL.
 * Others require processing multiple events to be determined, like CLS and TBT.
 */
import * as Platform from '../../../core/platform/platform.js';
import * as Helpers from '../helpers/helpers.js';
import * as Types from '../types/types.js';
import { data as metaHandlerData } from './MetaHandler.js';
/**
 * This represents the metric scores for all navigations, for all frames in a trace.
 * Given a frame id, the map points to another map from navigation id to metric scores.
 * The metric scores include the event related to the metric as well as the data regarding
 * the score itself.
 */
const metricScoresByFrameId = new Map();
/**
 * Page load events with no associated duration that happened in the
 * main frame.
 */
let allMarkerEvents = [];
export function reset() {
    metricScoresByFrameId.clear();
    pageLoadEventsArray = [];
    allMarkerEvents = [];
    selectedLCPCandidateEvents.clear();
}
let pageLoadEventsArray = [];
// Once we've found the LCP events in the trace we want to fetch their DOM Node
// from the backend. We could do this by parsing through our Map of frame =>
// navigation => metric, but it's easier to keep a set of LCP events. As we
// parse the trace, any time we store an LCP candidate as the potential LCP
// event, we store the event here. If we later find a new candidate in the
// trace, we store that and delete the prior event. When we've parsed the
// entire trace this set will contain all the LCP events that were used - e.g.
// the candidates that were the actual LCP events.
const selectedLCPCandidateEvents = new Set();
export function handleEvent(event) {
    if (!Types.TraceEvents.eventIsPageLoadEvent(event)) {
        return;
    }
    pageLoadEventsArray.push(event);
}
function storePageLoadMetricAgainstNavigationId(navigation, event) {
    const navigationId = navigation.args.data?.navigationId;
    if (!navigationId) {
        throw new Error('Navigation event unexpectedly had no navigation ID.');
    }
    const frameId = getFrameIdForPageLoadEvent(event);
    const { rendererProcessesByFrame } = metaHandlerData();
    // If either of these pieces of data do not exist, the most likely
    // explanation is that the page load metric we found is for a frame/process
    // combo that the MetaHandler discarded. This typically happens if we get a
    // navigation event with an empty URL. Therefore, we will silently return and
    // drop this metric. If we didn't care about the navigation, we certainly do
    // not need to care about metrics for that navigation.
    const rendererProcessesInFrame = rendererProcessesByFrame.get(frameId);
    if (!rendererProcessesInFrame) {
        return;
    }
    const processData = rendererProcessesInFrame.get(event.pid);
    if (!processData) {
        return;
    }
    if (Types.TraceEvents.isTraceEventNavigationStart(event)) {
        return;
    }
    if (Types.TraceEvents.isTraceEventFirstContentfulPaint(event)) {
        const fcpTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
        const classification = scoreClassificationForFirstContentfulPaint(fcpTime);
        const metricScore = { event, metricName: "FCP" /* MetricName.FCP */, classification, navigation, timing: fcpTime };
        storeMetricScore(frameId, navigationId, metricScore);
        return;
    }
    if (Types.TraceEvents.isTraceEventFirstPaint(event)) {
        const paintTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
        const classification = "unclassified" /* ScoreClassification.UNCLASSIFIED */;
        const metricScore = { event, metricName: "FP" /* MetricName.FP */, classification, navigation, timing: paintTime };
        storeMetricScore(frameId, navigationId, metricScore);
        return;
    }
    if (Types.TraceEvents.isTraceEventMarkDOMContent(event)) {
        const dclTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
        const metricScore = {
            event,
            metricName: "DCL" /* MetricName.DCL */,
            classification: scoreClassificationForDOMContentLoaded(dclTime),
            navigation,
            timing: dclTime,
        };
        storeMetricScore(frameId, navigationId, metricScore);
        return;
    }
    if (Types.TraceEvents.isTraceEventInteractiveTime(event)) {
        const ttiValue = Types.Timing.MicroSeconds(event.ts - navigation.ts);
        const tti = {
            event,
            metricName: "TTI" /* MetricName.TTI */,
            classification: scoreClassificationForTimeToInteractive(ttiValue),
            navigation,
            timing: ttiValue,
        };
        storeMetricScore(frameId, navigationId, tti);
        const tbtValue = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(event.args.args.total_blocking_time_ms));
        const tbt = {
            event,
            metricName: "TBT" /* MetricName.TBT */,
            classification: scoreClassificationForTotalBlockingTime(tbtValue),
            navigation,
            timing: tbtValue,
        };
        storeMetricScore(frameId, navigationId, tbt);
        return;
    }
    if (Types.TraceEvents.isTraceEventMarkLoad(event)) {
        const loadTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
        const metricScore = {
            event,
            metricName: "L" /* MetricName.L */,
            classification: "unclassified" /* ScoreClassification.UNCLASSIFIED */,
            navigation,
            timing: loadTime,
        };
        storeMetricScore(frameId, navigationId, metricScore);
        return;
    }
    if (Types.TraceEvents.isTraceEventLargestContentfulPaintCandidate(event)) {
        const candidateIndex = event.args.data?.candidateIndex;
        if (!candidateIndex) {
            throw new Error('Largest Contenful Paint unexpectedly had no candidateIndex.');
        }
        const lcpTime = Types.Timing.MicroSeconds(event.ts - navigation.ts);
        const lcp = {
            event,
            metricName: "LCP" /* MetricName.LCP */,
            classification: scoreClassificationForLargestContentfulPaint(lcpTime),
            navigation,
            timing: lcpTime,
        };
        const metricsByNavigation = Platform.MapUtilities.getWithDefault(metricScoresByFrameId, frameId, () => new Map());
        const metrics = Platform.MapUtilities.getWithDefault(metricsByNavigation, navigationId, () => new Map());
        const lastLCPCandidate = metrics.get("LCP" /* MetricName.LCP */);
        if (lastLCPCandidate === undefined) {
            selectedLCPCandidateEvents.add(lcp.event);
            storeMetricScore(frameId, navigationId, lcp);
            return;
        }
        const lastLCPCandidateEvent = lastLCPCandidate.event;
        if (!Types.TraceEvents.isTraceEventLargestContentfulPaintCandidate(lastLCPCandidateEvent)) {
            return;
        }
        const lastCandidateIndex = lastLCPCandidateEvent.args.data?.candidateIndex;
        if (!lastCandidateIndex) {
            // lastCandidateIndex cannot be undefined because we don't store candidates with
            // with an undefined candidateIndex value. This check is only to make TypeScript
            // treat the field as not undefined below.
            return;
        }
        if (lastCandidateIndex < candidateIndex) {
            selectedLCPCandidateEvents.delete(lastLCPCandidateEvent);
            selectedLCPCandidateEvents.add(lcp.event);
            storeMetricScore(frameId, navigationId, lcp);
        }
        return;
    }
    if (Types.TraceEvents.isTraceEventLayoutShift(event)) {
        return;
    }
    return Platform.assertNever(event, `Unexpected event type: ${event}`);
}
function storeMetricScore(frameId, navigationId, metricScore) {
    const metricsByNavigation = Platform.MapUtilities.getWithDefault(metricScoresByFrameId, frameId, () => new Map());
    const metrics = Platform.MapUtilities.getWithDefault(metricsByNavigation, navigationId, () => new Map());
    // If an entry with that metric name is present, delete it so that the new entry that
    // will replace it is added at the end of the map. This way we guarantee the map entries
    // are ordered in ASC manner by timestamp.
    metrics.delete(metricScore.metricName);
    metrics.set(metricScore.metricName, metricScore);
}
export function getFrameIdForPageLoadEvent(event) {
    if (Types.TraceEvents.isTraceEventFirstContentfulPaint(event) ||
        Types.TraceEvents.isTraceEventInteractiveTime(event) ||
        Types.TraceEvents.isTraceEventLargestContentfulPaintCandidate(event) ||
        Types.TraceEvents.isTraceEventNavigationStart(event) || Types.TraceEvents.isTraceEventLayoutShift(event) ||
        Types.TraceEvents.isTraceEventFirstPaint(event)) {
        return event.args.frame;
    }
    if (Types.TraceEvents.isTraceEventMarkDOMContent(event) || Types.TraceEvents.isTraceEventMarkLoad(event)) {
        const frameId = event.args.data?.frame;
        if (!frameId) {
            throw new Error('MarkDOMContent unexpectedly had no frame ID.');
        }
        return frameId;
    }
    Platform.assertNever(event, `Unexpected event type: ${event}`);
}
function getNavigationForPageLoadEvent(event) {
    if (Types.TraceEvents.isTraceEventFirstContentfulPaint(event) ||
        Types.TraceEvents.isTraceEventLargestContentfulPaintCandidate(event) ||
        Types.TraceEvents.isTraceEventFirstPaint(event)) {
        const navigationId = event.args.data?.navigationId;
        if (!navigationId) {
            throw new Error('Trace event unexpectedly had no navigation ID.');
        }
        const { navigationsByNavigationId } = metaHandlerData();
        const navigation = navigationsByNavigationId.get(navigationId);
        if (!navigation) {
            // This event's navigation has been filtered out by the meta handler as a noise event.
            return null;
        }
        return navigation;
    }
    if (Types.TraceEvents.isTraceEventMarkDOMContent(event) || Types.TraceEvents.isTraceEventInteractiveTime(event) ||
        Types.TraceEvents.isTraceEventLayoutShift(event) || Types.TraceEvents.isTraceEventMarkLoad(event)) {
        const frameId = getFrameIdForPageLoadEvent(event);
        const { navigationsByFrameId } = metaHandlerData();
        return Helpers.Trace.getNavigationForTraceEvent(event, frameId, navigationsByFrameId);
    }
    if (Types.TraceEvents.isTraceEventNavigationStart(event)) {
        // We don't want to compute metrics of the navigation relative to itself, so we'll avoid avoid all that.
        return null;
    }
    return Platform.assertNever(event, `Unexpected event type: ${event}`);
}
/**
 * Classifications sourced from
 * https://web.dev/fcp/
 */
export function scoreClassificationForFirstContentfulPaint(fcpScoreInMicroseconds) {
    const FCP_GOOD_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(1.8));
    const FCP_MEDIUM_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(3.0));
    let scoreClassification = "bad" /* ScoreClassification.BAD */;
    if (fcpScoreInMicroseconds <= FCP_MEDIUM_TIMING) {
        scoreClassification = "ok" /* ScoreClassification.OK */;
    }
    if (fcpScoreInMicroseconds <= FCP_GOOD_TIMING) {
        scoreClassification = "good" /* ScoreClassification.GOOD */;
    }
    return scoreClassification;
}
/**
 * Classifications sourced from
 * https://web.dev/interactive/#how-lighthouse-determines-your-tti-score
 */
export function scoreClassificationForTimeToInteractive(ttiTimeInMicroseconds) {
    const TTI_GOOD_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(3.8));
    const TTI_MEDIUM_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(7.3));
    let scoreClassification = "bad" /* ScoreClassification.BAD */;
    if (ttiTimeInMicroseconds <= TTI_MEDIUM_TIMING) {
        scoreClassification = "ok" /* ScoreClassification.OK */;
    }
    if (ttiTimeInMicroseconds <= TTI_GOOD_TIMING) {
        scoreClassification = "good" /* ScoreClassification.GOOD */;
    }
    return scoreClassification;
}
/**
 * Classifications sourced from
 * https://web.dev/lcp/#what-is-lcp
 */
export function scoreClassificationForLargestContentfulPaint(lcpTimeInMicroseconds) {
    const LCP_GOOD_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(2.5));
    const LCP_MEDIUM_TIMING = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(4));
    let scoreClassification = "bad" /* ScoreClassification.BAD */;
    if (lcpTimeInMicroseconds <= LCP_MEDIUM_TIMING) {
        scoreClassification = "ok" /* ScoreClassification.OK */;
    }
    if (lcpTimeInMicroseconds <= LCP_GOOD_TIMING) {
        scoreClassification = "good" /* ScoreClassification.GOOD */;
    }
    return scoreClassification;
}
/**
 * DCL does not have a classification.
 */
export function scoreClassificationForDOMContentLoaded(_dclTimeInMicroseconds) {
    return "unclassified" /* ScoreClassification.UNCLASSIFIED */;
}
/**
 * Classifications sourced from
 * https://web.dev/lighthouse-total-blocking-#time/
 */
export function scoreClassificationForTotalBlockingTime(tbtTimeInMicroseconds) {
    const TBT_GOOD_TIMING = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(200));
    const TBT_MEDIUM_TIMING = Helpers.Timing.millisecondsToMicroseconds(Types.Timing.MilliSeconds(600));
    let scoreClassification = "bad" /* ScoreClassification.BAD */;
    if (tbtTimeInMicroseconds <= TBT_MEDIUM_TIMING) {
        scoreClassification = "ok" /* ScoreClassification.OK */;
    }
    if (tbtTimeInMicroseconds <= TBT_GOOD_TIMING) {
        scoreClassification = "good" /* ScoreClassification.GOOD */;
    }
    return scoreClassification;
}
/**
 * Gets all the Largest Contentful Paint scores of all the frames in the
 * trace.
 */
function gatherFinalLCPEvents() {
    const allFinalLCPEvents = [];
    const dataForAllFrames = [...metricScoresByFrameId.values()];
    const dataForAllNavigations = dataForAllFrames.flatMap(frameData => [...frameData.values()]);
    for (let i = 0; i < dataForAllNavigations.length; i++) {
        const navigationData = dataForAllNavigations[i];
        const lcpInNavigation = navigationData.get("LCP" /* MetricName.LCP */);
        if (!lcpInNavigation || !lcpInNavigation.event) {
            continue;
        }
        allFinalLCPEvents.push(lcpInNavigation.event);
    }
    return allFinalLCPEvents;
}
export async function finalize() {
    pageLoadEventsArray.sort((a, b) => a.ts - b.ts);
    for (const pageLoadEvent of pageLoadEventsArray) {
        const navigation = getNavigationForPageLoadEvent(pageLoadEvent);
        if (navigation) {
            // Event's navigation was not filtered out as noise.
            storePageLoadMetricAgainstNavigationId(navigation, pageLoadEvent);
        }
    }
    // NOTE: if you are looking for the TBT calculation, it has temporarily been
    // removed. See crbug.com/1424335 for details.
    const allFinalLCPEvents = gatherFinalLCPEvents();
    const mainFrame = metaHandlerData().mainFrameId;
    // Filter out LCP candidates to use only definitive LCP values
    const allEventsButLCP = pageLoadEventsArray.filter(event => !Types.TraceEvents.isTraceEventLargestContentfulPaintCandidate(event));
    const markerEvents = [...allFinalLCPEvents, ...allEventsButLCP].filter(Types.TraceEvents.isTraceEventMarkerEvent);
    // Filter by main frame and sort.
    allMarkerEvents =
        markerEvents.filter(event => getFrameIdForPageLoadEvent(event) === mainFrame).sort((a, b) => a.ts - b.ts);
}
export function data() {
    return {
        metricScoresByFrameId,
        allMarkerEvents,
    };
}
export function deps() {
    return ['Meta'];
}
//# sourceMappingURL=PageLoadMetricsHandler.js.map