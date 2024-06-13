import * as TraceEngine from '../../models/trace/trace.js';
import type * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
/**
 * Builds the style for the group.
 * Each group has a predefined style and a reference to the definition of the legacy track (which should be removed in the future).
 * @param extra the customized fields with value.
 * @returns the built GroupStyle
 */
export declare function buildGroupStyle(extra?: Partial<PerfUI.FlameChart.GroupStyle>): PerfUI.FlameChart.GroupStyle;
/**
 * Builds the header corresponding to the track. A header is added in the shape of a group in the flame chart data.
 * @param startLevel the flame chart level at which the track header is appended.
 * @param name the display name of the track.
 * @param style the GroupStyle for the track header.
 * @param selectable if the track is selectable.
 * @param expanded if the track is expanded.
 * @param track this is set only when `selectable` is true, and it is used for selecting a track in the details panel.
 * @param showStackContextMenu whether menu with options to merge/collapse entries in track is shown.
 * @returns the group that built from the give data
 */
export declare function buildTrackHeader(startLevel: number, name: string, style: PerfUI.FlameChart.GroupStyle, selectable: boolean, expanded?: boolean, showStackContextMenu?: boolean): PerfUI.FlameChart.Group;
/**
 * Returns the time info shown when an event is hovered in the timeline.
 * @param totalTime the total time of the hovered event.
 * @param selfTime the self time of the hovered event.
 * @returns the formatted time string for highlightedEntryInfo
 */
export declare function getFormattedTime(totalTime?: TraceEngine.Types.Timing.MicroSeconds, selfTime?: TraceEngine.Types.Timing.MicroSeconds): string;
/**
 * Returns the first level that is available for an event.
 * @param event the event.
 * @param lastUsedTimeByLevel the array that stores the last timestamp that is used by a level.
 * @returns the first available level for the event.
 */
export declare function getEventLevel(event: TraceEngine.Types.TraceEvents.TraceEventData, lastUsedTimeByLevel: number[]): number;
export declare function addDecorationToEvent(timelineData: PerfUI.FlameChart.FlameChartTimelineData, eventIndex: number, decoration: PerfUI.FlameChart.FlameChartDecoration): void;
