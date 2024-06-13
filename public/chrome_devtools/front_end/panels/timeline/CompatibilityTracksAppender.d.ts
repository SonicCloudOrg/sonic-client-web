import * as TraceEngine from '../../models/trace/trace.js';
import type * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import { AnimationsTrackAppender } from './AnimationsTrackAppender.js';
import { GPUTrackAppender } from './GPUTrackAppender.js';
import { InteractionsTrackAppender } from './InteractionsTrackAppender.js';
import { LayoutShiftsTrackAppender } from './LayoutShiftsTrackAppender.js';
import { ThreadAppender } from './ThreadAppender.js';
import { EntryType, type TimelineFlameChartEntry } from './TimelineFlameChartDataProvider.js';
import { TimingsTrackAppender } from './TimingsTrackAppender.js';
export type HighlightedEntryInfo = {
    title: string;
    formattedTime: string;
    warningElements?: HTMLSpanElement[];
};
/**
 * Track appenders add the data of each track into the timeline flame
 * chart. Each track appender also implements functions tha allow the
 * canvas renderer to gather more information about an event in a track,
 * like its display name or color.
 *
 * At the moment, tracks in the timeline flame chart are appended in
 * two locations: in the TimelineFlameChartDataProvider and in the track
 * appenders exported by this module. As part of the work to use a new
 * trace parsing engine, a track appender will be defined with this API
 * for each of the tracks in the timeline. With this implementation in
 * place its counterpart in the TimelineFlameChartDataProvider can be
 * removed. This processes of doing this for a track is referred to as
 * "migrating the track" to the new system.
 *
 * The migration implementation will result beneficial among other
 * things because the complexity of rendering the details of each track
 * is distributed among multiple standalone modules.
 * Read more at go/rpp-flamechart-arch
 */
export interface TrackAppender {
    /**
     * The unique name given to the track appender.
     */
    appenderName: TrackAppenderName;
    /**
     * Appends into the flame chart data the data corresponding to a track.
     * @param level the horizontal level of the flame chart events where the
     * track's events will start being appended.
     * @param expanded wether the track should be rendered expanded.
     * @returns the first available level to append more data after having
     * appended the track's events.
     */
    appendTrackAtLevel(level: number, expanded?: boolean): number;
    /**
     * Returns the color an event is shown with in the timeline.
     */
    colorForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    /**
     * Returns the title an event is shown with in the timeline.
     */
    titleForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    /**
     * Returns the info shown when an event in the timeline is hovered.
     */
    highlightedEntryInfo(event: TraceEngine.Types.TraceEvents.TraceEventData): HighlightedEntryInfo;
}
export declare const TrackNames: readonly ["Animations", "Timings", "Interactions", "GPU", "LayoutShifts", "Thread", "Thread_AuctionWorklet", "Extension"];
export type TrackAppenderName = typeof TrackNames[number] | 'Network';
export declare class CompatibilityTracksAppender {
    #private;
    /**
     * @param flameChartData the data used by the flame chart renderer on
     * which the track data will be appended.
     * @param traceParsedData the trace parsing engines output.
     * @param entryData the array containing all event to be rendered in
     * the flamechart.
     * @param legacyEntryTypeByLevel an array containing the type of
     * each entry in the entryData array. Indexed by the position the
     * corresponding entry occupies in the entryData array. This reference
     * is needed only for compatibility with the legacy flamechart
     * architecture and should be removed once all tracks use the new
     * system.
     */
    constructor(flameChartData: PerfUI.FlameChart.FlameChartTimelineData, traceParsedData: TraceEngine.Handlers.Types.TraceParseData, entryData: TimelineFlameChartEntry[], legacyEntryTypeByLevel: EntryType[]);
    setFlameChartDataAndEntryData(flameChartData: PerfUI.FlameChart.FlameChartTimelineData, entryData: TimelineFlameChartEntry[], legacyEntryTypeByLevel: EntryType[]): void;
    getFlameChartTimelineData(): PerfUI.FlameChart.FlameChartTimelineData;
    timingsTrackAppender(): TimingsTrackAppender;
    animationsTrackAppender(): AnimationsTrackAppender;
    interactionsTrackAppender(): InteractionsTrackAppender;
    gpuTrackAppender(): GPUTrackAppender;
    layoutShiftsTrackAppender(): LayoutShiftsTrackAppender;
    threadAppenders(): ThreadAppender[];
    eventsInTrack(trackAppender: TrackAppender): TraceEngine.Types.TraceEvents.TraceEventData[];
    /**
     * Gets the events to be shown in the tree views of the details pane
     * (Bottom-up, Call tree, etc.). These are the events from the track
     * that can be arranged in a tree shape.
     */
    eventsForTreeView(trackAppender: TrackAppender): TraceEngine.Types.TraceEvents.TraceEventData[];
    /**
     * Caches the track appender that owns a flame chart group. FlameChart
     * groups are created for each track in the timeline. When an user
     * selects a track in the UI, the track's group is passed to the model
     * layer to inform about the selection.
     */
    registerTrackForGroup(group: PerfUI.FlameChart.Group, appender: TrackAppender): void;
    /**
     * Returns number of tracks of given type already appended.
     * Used to name the "Raster Thread 6" tracks, etc
     */
    getCurrentTrackCountForThreadType(threadType: TraceEngine.Handlers.Threads.ThreadType.RASTERIZER | TraceEngine.Handlers.Threads.ThreadType.THREAD_POOL): number;
    /**
     * Looks up a FlameChart group for a given appender.
     */
    groupForAppender(targetAppender: TrackAppender): PerfUI.FlameChart.Group | null;
    /**
     * Given a FlameChart group, gets the events to be shown in the tree
     * views if that group was registered by the appender system.
     */
    groupEventsForTreeView(group: PerfUI.FlameChart.Group): TraceEngine.Types.TraceEvents.TraceEventData[] | null;
    /**
     * Caches the track appender that owns a level. An appender takes
     * ownership of a level when it appends data to it.
     * The cache is useful to determine what appender should handle a
     * query from the flame chart renderer when an event's feature (like
     * style, title, etc.) is needed.
     */
    registerTrackForLevel(level: number, appender: TrackAppender): void;
    /**
     * Adds an event to the flame chart data at a defined level.
     * @param event the event to be appended,
     * @param level the level to append the event,
     * @param appender the track which the event belongs to.
     * @returns the index of the event in all events to be rendered in the flamechart.
     */
    appendEventAtLevel(event: TraceEngine.Types.TraceEvents.TraceEventData, level: number, appender: TrackAppender): number;
    /**
     * Adds into the flame chart data a list of trace events.
     * @param events the trace events that will be appended to the flame chart.
     * The events should be taken straight from the trace handlers. The handlers
     * should sort the events by start time, and the parent event is before the
     * child.
     * @param trackStartLevel the flame chart level from which the events will
     * be appended.
     * @param appender the track that the trace events belong to.
     * @param eventAppendedCallback an optional function called after the
     * event has been added to the timeline data. This allows the caller
     * to know f.e. the position of the event in the entry data. Use this
     * hook to customize the data after it has been appended, f.e. to add
     * decorations to a set of the entries.
     * @returns the next level after the last occupied by the appended these
     * trace events (the first available level to append next track).
     */
    appendEventsAtLevel<T extends TraceEngine.Types.TraceEvents.TraceEventData>(events: readonly T[], trackStartLevel: number, appender: TrackAppender, eventAppendedCallback?: (event: T, index: number) => void): number;
    entryIsVisibleInTimeline(entry: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
    /**
     * Gets the all track appenders that have been set to be visible.
     */
    allVisibleTrackAppenders(): TrackAppender[];
    allThreadAppendersByProcess(): Map<TraceEngine.Types.TraceEvents.ProcessID, ThreadAppender[]>;
    /**
     * Sets the visible tracks internally
     * @param visibleTracks set with the names of the visible track
     * appenders. If undefined, all tracks are set to be visible.
     */
    setVisibleTracks(visibleTracks?: Set<TrackAppenderName>): void;
    /**
     * Returns the color an event is shown with in the timeline.
     */
    colorForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData, level: number): string;
    /**
     * Returns the title an event is shown with in the timeline.
     */
    titleForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData, level: number): string;
    /**
     * Returns the info shown when an event in the timeline is hovered.
     */
    highlightedEntryInfo(event: TraceEngine.Types.TraceEvents.TraceEventData, level: number): HighlightedEntryInfo;
}
