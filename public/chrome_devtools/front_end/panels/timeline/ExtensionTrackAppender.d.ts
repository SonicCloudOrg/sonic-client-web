import * as TraceEngine from '../../models/trace/trace.js';
import { type CompatibilityTracksAppender, type HighlightedEntryInfo, type TrackAppender, type TrackAppenderName } from './CompatibilityTracksAppender.js';
import { type TrackData } from './ExtensionDataGatherer.js';
export declare class ExtensionTrackAppender implements TrackAppender {
    #private;
    readonly appenderName: TrackAppenderName;
    constructor(compatibilityBuilder: CompatibilityTracksAppender, trackData: TrackData);
    appendTrackAtLevel(trackStartLevel: number, expanded?: boolean): number;
    colorForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    titleForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    /**
     * Returns the info shown when an event added by this appender
     * is hovered in the timeline.
     */
    highlightedEntryInfo(event: TraceEngine.Types.TraceEvents.TraceEventData): HighlightedEntryInfo;
}
