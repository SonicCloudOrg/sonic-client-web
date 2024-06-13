import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as TraceEngine from '../../models/trace/trace.js';
import { buildGroupStyle, buildTrackHeader, getFormattedTime } from './AppenderUtils.js';
import * as Extensions from './extensions/extensions.js';
import { TimelineFlameChartMarker } from './TimelineFlameChartView.js';
const UIStrings = {
    /**
     *@description Text in Timeline Flame Chart Data Provider of the Performance panel
     */
    timings: 'Timings',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimingsTrackAppender.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimingsTrackAppender {
    appenderName = 'Timings';
    #colorGenerator;
    #compatibilityBuilder;
    #traceParsedData;
    constructor(compatibilityBuilder, traceParsedData, colorGenerator) {
        this.#compatibilityBuilder = compatibilityBuilder;
        this.#colorGenerator = colorGenerator;
        this.#traceParsedData = traceParsedData;
    }
    /**
     * Appends into the flame chart data the data corresponding to the
     * timings track.
     * @param trackStartLevel the horizontal level of the flame chart events where
     * the track's events will start being appended.
     * @param expanded wether the track should be rendered expanded.
     * @returns the first available level to append more data after having
     * appended the track's events.
     */
    appendTrackAtLevel(trackStartLevel, expanded) {
        const extensionMarkers = this.#traceParsedData.ExtensionTraceData.extensionMarkers;
        const pageloadMarkers = this.#traceParsedData.PageLoadMetrics.allMarkerEvents;
        const extensionMarkersAreEmpty = extensionMarkers.length === 0 ||
            !Root.Runtime.experiments.isEnabled("timeline-extensions" /* Root.Runtime.ExperimentName.TIMELINE_EXTENSIONS */);
        const performanceMarks = this.#traceParsedData.UserTimings.performanceMarks.filter(m => !TraceEngine.Handlers.ModelHandlers.ExtensionTraceData.extensionDataInTiming(m));
        const performanceMeasures = this.#traceParsedData.UserTimings.performanceMeasures.filter(m => !TraceEngine.Handlers.ModelHandlers.ExtensionTraceData.extensionDataInTiming(m));
        const timestampEvents = this.#traceParsedData.UserTimings.timestampEvents;
        const consoleTimings = this.#traceParsedData.UserTimings.consoleTimings;
        if (extensionMarkersAreEmpty && pageloadMarkers.length === 0 && performanceMarks.length === 0 &&
            performanceMeasures.length === 0 && timestampEvents.length === 0 && consoleTimings.length === 0) {
            return trackStartLevel;
        }
        this.#appendTrackHeaderAtLevel(trackStartLevel, expanded);
        let newLevel = this.#appendMarkersAtLevel(trackStartLevel);
        newLevel = this.#compatibilityBuilder.appendEventsAtLevel(performanceMarks, newLevel, this);
        newLevel = this.#compatibilityBuilder.appendEventsAtLevel(performanceMeasures, newLevel, this);
        newLevel = this.#compatibilityBuilder.appendEventsAtLevel(timestampEvents, newLevel, this);
        return this.#compatibilityBuilder.appendEventsAtLevel(consoleTimings, newLevel, this);
    }
    /**
     * Adds into the flame chart data the header corresponding to the
     * timings track. A header is added in the shape of a group in the
     * flame chart data. A group has a predefined style and a reference
     * to the definition of the legacy track (which should be removed
     * in the future).
     * @param currentLevel the flame chart level at which the header is
     * appended.
     */
    #appendTrackHeaderAtLevel(currentLevel, expanded) {
        const trackIsCollapsible = this.#traceParsedData.UserTimings.performanceMeasures.length > 0;
        const style = buildGroupStyle({ useFirstLineForOverview: true, collapsible: trackIsCollapsible });
        const group = buildTrackHeader(currentLevel, i18nString(UIStrings.timings), style, /* selectable= */ true, expanded);
        this.#compatibilityBuilder.registerTrackForGroup(group, this);
    }
    /**
     * Adds into the flame chart data the trace events corresponding
     * to page load markers (LCP, FCP, L, etc.). These are taken straight
     * from the PageLoadMetrics handler.
     * @param currentLevel the flame chart level from which markers will
     * be appended.
     * @returns the next level after the last occupied by the appended
     * page load markers (the first available level to append more data).
     */
    #appendMarkersAtLevel(currentLevel) {
        let markers = this.#traceParsedData.PageLoadMetrics.allMarkerEvents;
        if (Root.Runtime.experiments.isEnabled("timeline-extensions" /* Root.Runtime.ExperimentName.TIMELINE_EXTENSIONS */)) {
            markers = markers.concat(this.#traceParsedData.ExtensionTraceData.extensionMarkers);
        }
        if (markers.length === 0) {
            return currentLevel;
        }
        markers.forEach(marker => {
            const index = this.#compatibilityBuilder.appendEventAtLevel(marker, currentLevel, this);
            this.#compatibilityBuilder.getFlameChartTimelineData().entryTotalTimes[index] = Number.NaN;
        });
        const minTimeMs = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(this.#traceParsedData.Meta.traceBounds.min);
        const flameChartMarkers = markers.map(marker => {
            // The timestamp for user timing trace events is set to the
            // start time passed by the user at the call site of the timing
            // (based on the UserTiming spec), meaning we can use event.ts
            // directly.
            // https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/timing/performance_user_timing.cc;l=236;drc=494419358caf690316f160a1f27d9e771a14c033
            const startTimeMs = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(marker.ts);
            const style = TraceEngine.Types.Extensions.isSyntheticExtensionEntry(marker) ?
                this.markerStyleForExtensionMarker(marker) :
                this.markerStyleForPageLoadEvent(marker);
            return new TimelineFlameChartMarker(startTimeMs, startTimeMs - minTimeMs, style);
        });
        this.#compatibilityBuilder.getFlameChartTimelineData().markers.push(...flameChartMarkers);
        // TODO: we would like to have markers share the level with the rest but...
        //  due to how CompatTrackAppender.appendEventsAtLevel tweaks the legacyEntryTypeByLevel array, it would take some work
        return ++currentLevel;
    }
    /*
      ------------------------------------------------------------------------------------
       The following methods  are invoked by the flame chart renderer to query features about
       events on rendering.
      ------------------------------------------------------------------------------------
    */
    /**
     * Gets the style for a page load marker event.
     */
    markerStyleForPageLoadEvent(markerEvent) {
        const tallMarkerDashStyle = [6, 4];
        let title = '';
        let color = 'grey';
        if (TraceEngine.Types.TraceEvents.isTraceEventMarkDOMContent(markerEvent)) {
            color = '#0867CB';
            title = "DCL" /* TraceEngine.Handlers.ModelHandlers.PageLoadMetrics.MetricName.DCL */;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventMarkLoad(markerEvent)) {
            color = '#B31412';
            title = "L" /* TraceEngine.Handlers.ModelHandlers.PageLoadMetrics.MetricName.L */;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventFirstPaint(markerEvent)) {
            color = '#228847';
            title = "FP" /* TraceEngine.Handlers.ModelHandlers.PageLoadMetrics.MetricName.FP */;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventFirstContentfulPaint(markerEvent)) {
            color = '#1A6937';
            title = "FCP" /* TraceEngine.Handlers.ModelHandlers.PageLoadMetrics.MetricName.FCP */;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventLargestContentfulPaintCandidate(markerEvent)) {
            color = '#1A3422';
            title = "LCP" /* TraceEngine.Handlers.ModelHandlers.PageLoadMetrics.MetricName.LCP */;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventNavigationStart(markerEvent)) {
            color = '#FF9800';
            title = '';
        }
        return {
            title: title,
            dashStyle: tallMarkerDashStyle,
            lineWidth: 0.5,
            color: color,
            tall: true,
            lowPriority: false,
        };
    }
    markerStyleForExtensionMarker(markerEvent) {
        const tallMarkerDashStyle = [6, 4];
        const title = markerEvent.name;
        const color = Extensions.ExtensionUI.extensionEntryColor(markerEvent);
        return {
            title: title,
            dashStyle: tallMarkerDashStyle,
            lineWidth: 0.5,
            color: color,
            tall: true,
            lowPriority: false,
        };
    }
    /**
     * Gets the color an event added by this appender should be rendered with.
     */
    colorForEvent(event) {
        if (TraceEngine.Types.TraceEvents.eventIsPageLoadEvent(event)) {
            return this.markerStyleForPageLoadEvent(event).color;
        }
        if (TraceEngine.Types.Extensions.isSyntheticExtensionEntry(event)) {
            return Extensions.ExtensionUI.extensionEntryColor(event);
        }
        // Performance and console timings.
        return this.#colorGenerator.colorForID(event.name);
    }
    /**
     * Gets the title an event added by this appender should be rendered with.
     */
    titleForEvent(event) {
        const metricsHandler = TraceEngine.Handlers.ModelHandlers.PageLoadMetrics;
        if (TraceEngine.Types.TraceEvents.eventIsPageLoadEvent(event)) {
            switch (event.name) {
                case 'MarkDOMContent':
                    return "DCL" /* metricsHandler.MetricName.DCL */;
                case 'MarkLoad':
                    return "L" /* metricsHandler.MetricName.L */;
                case 'firstContentfulPaint':
                    return "FCP" /* metricsHandler.MetricName.FCP */;
                case 'firstPaint':
                    return "FP" /* metricsHandler.MetricName.FP */;
                case 'largestContentfulPaint::Candidate':
                    return "LCP" /* metricsHandler.MetricName.LCP */;
                case 'navigationStart':
                    return '';
                default:
                    return event.name;
            }
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventTimeStamp(event)) {
            return `${event.name}: ${event.args.data.message}`;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventPerformanceMark(event)) {
            return `[mark]: ${event.name}`;
        }
        return event.name;
    }
    /**
     * Returns the info shown when an event added by this appender
     * is hovered in the timeline.
     */
    highlightedEntryInfo(event) {
        const title = TraceEngine.Types.Extensions.isSyntheticExtensionEntry(event) && event.args.hintText ?
            event.args.hintText :
            this.titleForEvent(event);
        // If an event is a marker event, rather than show a duration of 0, we can instead show the time that the event happened, which is much more useful. We do this currently for:
        // Page load events: DCL, FCP and LCP
        // performance.mark() events
        // console.timestamp() events
        if (TraceEngine.Types.TraceEvents.isTraceEventMarkerEvent(event) ||
            TraceEngine.Types.TraceEvents.isTraceEventPerformanceMark(event) ||
            TraceEngine.Types.TraceEvents.isTraceEventTimeStamp(event)) {
            const timeOfEvent = TraceEngine.Helpers.Timing.timeStampForEventAdjustedByClosestNavigation(event, this.#traceParsedData.Meta.traceBounds, this.#traceParsedData.Meta.navigationsByNavigationId, this.#traceParsedData.Meta.navigationsByFrameId);
            return { title, formattedTime: getFormattedTime(timeOfEvent) };
        }
        return { title, formattedTime: getFormattedTime(event.dur) };
    }
}
//# sourceMappingURL=TimingsTrackAppender.js.map