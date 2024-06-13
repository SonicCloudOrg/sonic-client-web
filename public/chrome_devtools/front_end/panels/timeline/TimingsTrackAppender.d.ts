import type * as Common from '../../core/common/common.js';
import * as TraceEngine from '../../models/trace/trace.js';
import { type CompatibilityTracksAppender, type HighlightedEntryInfo, type TrackAppender, type TrackAppenderName } from './CompatibilityTracksAppender.js';
import { type TimelineMarkerStyle } from './TimelineUIUtils.js';
export declare class TimingsTrackAppender implements TrackAppender {
    #private;
    readonly appenderName: TrackAppenderName;
    constructor(compatibilityBuilder: CompatibilityTracksAppender, traceParsedData: TraceEngine.Handlers.Types.TraceParseData, colorGenerator: Common.Color.Generator);
    /**
     * Appends into the flame chart data the data corresponding to the
     * timings track.
     * @param trackStartLevel the horizontal level of the flame chart events where
     * the track's events will start being appended.
     * @param expanded wether the track should be rendered expanded.
     * @returns the first available level to append more data after having
     * appended the track's events.
     */
    appendTrackAtLevel(trackStartLevel: number, expanded?: boolean): number;
    /**
     * Gets the style for a page load marker event.
     */
    markerStyleForPageLoadEvent(markerEvent: TraceEngine.Types.TraceEvents.PageLoadEvent): TimelineMarkerStyle;
    markerStyleForExtensionMarker(markerEvent: TraceEngine.Types.Extensions.SyntheticExtensionMarker): TimelineMarkerStyle;
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
