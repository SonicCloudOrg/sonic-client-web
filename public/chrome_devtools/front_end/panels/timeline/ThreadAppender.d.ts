import * as TraceEngine from '../../models/trace/trace.js';
import { type CompatibilityTracksAppender, type HighlightedEntryInfo, type TrackAppender, type TrackAppenderName } from './CompatibilityTracksAppender.js';
export declare class ThreadAppender implements TrackAppender {
    #private;
    readonly appenderName: TrackAppenderName;
    readonly threadType: TraceEngine.Handlers.Threads.ThreadType;
    readonly isOnMainFrame: boolean;
    constructor(compatibilityBuilder: CompatibilityTracksAppender, traceParsedData: TraceEngine.Handlers.Types.TraceParseData, processId: TraceEngine.Types.TraceEvents.ProcessID, threadId: TraceEngine.Types.TraceEvents.ThreadID, threadName: string | null, type: TraceEngine.Handlers.Threads.ThreadType);
    processId(): TraceEngine.Types.TraceEvents.ProcessID;
    threadId(): TraceEngine.Types.TraceEvents.ThreadID;
    /**
     * Appends into the flame chart data the data corresponding to the
     * this thread.
     * @param trackStartLevel the horizontal level of the flame chart events where
     * the track's events will start being appended.
     * @param expanded wether the track should be rendered expanded.
     * @returns the first available level to append more data after having
     * appended the track's events.
     */
    appendTrackAtLevel(trackStartLevel: number, expanded?: boolean): number;
    setHeaderNestingLevel(level: number): void;
    setHeaderAppended(headerAppended: boolean): void;
    headerAppended(): boolean;
    trackName(): string;
    getUrl(): string;
    isIgnoreListedEntry(entry: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
    private isIgnoreListedURL;
    /**
     * Gets the color an event added by this appender should be rendered with.
     */
    colorForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    /**
     * Gets the title an event added by this appender should be rendered with.
     */
    titleForEvent(entry: TraceEngine.Types.TraceEvents.TraceEventData): string;
    /**
     * Returns the info shown when an event added by this appender
     * is hovered in the timeline.
     */
    highlightedEntryInfo(event: TraceEngine.Types.TraceEvents.SyntheticTraceEntry): HighlightedEntryInfo;
}
