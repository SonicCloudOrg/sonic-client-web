import type * as TraceEngine from '../../models/trace/trace.js';
import { type CompatibilityTracksAppender, type HighlightedEntryInfo, type TrackAppender, type TrackAppenderName } from './CompatibilityTracksAppender.js';
export declare class AnimationsTrackAppender implements TrackAppender {
    #private;
    readonly appenderName: TrackAppenderName;
    constructor(compatibilityBuilder: CompatibilityTracksAppender, traceParsedData: TraceEngine.Handlers.Types.TraceParseData);
    appendTrackAtLevel(trackStartLevel: number, expanded?: boolean | undefined): number;
    colorForEvent(): string;
    titleForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    highlightedEntryInfo(event: TraceEngine.Types.TraceEvents.TraceEventData): HighlightedEntryInfo;
}
