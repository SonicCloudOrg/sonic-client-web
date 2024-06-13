import * as TraceEngine from '../../models/trace/trace.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import { type HighlightedEntryInfo, type TrackAppender, type TrackAppenderName } from './CompatibilityTracksAppender.js';
export declare class NetworkTrackAppender implements TrackAppender {
    #private;
    readonly appenderName: TrackAppenderName;
    constructor(traceParsedData: TraceEngine.Handlers.Types.TraceParseData, flameChartData: PerfUI.FlameChart.FlameChartTimelineData);
    group(): PerfUI.FlameChart.Group | undefined;
    font(): string;
    /**
     * Appends into the flame chart data the data corresponding to the
     * Network track.
     * @param trackStartLevel the horizontal level of the flame chart events where
     * the track's events will start being appended.
     * @param expanded wether the track should be rendered expanded.
     * @returns the first available level to append more data after having
     * appended the track's events.
     */
    appendTrackAtLevel(trackStartLevel: number, expanded?: boolean | undefined): number;
    /**
     * Update the flame chart data.
     * When users zoom in the flamechart, we only want to show them the network
     * requests between startTime and endTime. This function will append those
     * invisible events to the last level, and hide them.
     * @returns the number of levels used by this track
     */
    filterTimelineDataBetweenTimes(startTime: TraceEngine.Types.Timing.MilliSeconds, endTime: TraceEngine.Types.Timing.MilliSeconds): number;
    /**
     * Gets the color an event added by this appender should be rendered with.
     */
    colorForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    /**
     * Gets the title an event added by this appender should be rendered with.
     */
    titleForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    /**
     * Returns the info shown when an event added by this appender
     * is hovered in the timeline.
     */
    highlightedEntryInfo(event: TraceEngine.Types.TraceEvents.TraceEventData): HighlightedEntryInfo;
}
