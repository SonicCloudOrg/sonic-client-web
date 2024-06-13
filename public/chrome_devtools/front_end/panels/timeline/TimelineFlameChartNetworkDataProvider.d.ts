import * as TraceEngine from '../../models/trace/trace.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import { TimelineSelection } from './TimelineSelection.js';
export declare class TimelineFlameChartNetworkDataProvider implements PerfUI.FlameChart.FlameChartDataProvider {
    #private;
    constructor();
    setModel(traceEngineData: TraceEngine.Handlers.Types.TraceParseData | null): void;
    isEmpty(): boolean;
    maxStackDepth(): number;
    hasTrackConfigurationMode(): boolean;
    timelineData(): PerfUI.FlameChart.FlameChartTimelineData;
    minimumBoundary(): number;
    totalTime(): number;
    setWindowTimes(startTime: number, endTime: number): void;
    createSelection(index: number): TimelineSelection | null;
    indexForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData | TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame): number | null;
    eventByIndex(entryIndex: number): TraceEngine.Types.TraceEvents.SyntheticNetworkRequest | null;
    entryIndexForSelection(selection: TimelineSelection | null): number;
    entryColor(index: number): string;
    textColor(_index: number): string;
    entryTitle(index: number): string | null;
    entryFont(_index: number): string | null;
    /**
     * Returns the pixels needed to decorate the event.
     * The pixels compare to the start of the earliest event of the request.
     *
     * Request.beginTime(), which is used in FlameChart to calculate the unclippedBarX
     * v
     *    |----------------[ (URL text)    waiting time   |   request  ]--------|
     *    ^start           ^sendStart                     ^headersEnd  ^Finish  ^end
     * @param request
     * @param unclippedBarX The start pixel of the request. It is calculated with request.beginTime() in FlameChart.
     * @param timeToPixelRatio
     * @returns the pixels to draw waiting time and left and right whiskers and url text
     */
    getDecorationPixels(event: TraceEngine.Types.TraceEvents.SyntheticNetworkRequest, unclippedBarX: number, timeToPixelRatio: number): {
        sendStart: number;
        headersEnd: number;
        finish: number;
        start: number;
        end: number;
    };
    /**
     * Decorates the entry:
     *   Draw a waiting time between |sendStart| and |headersEnd|
     *     By adding a extra transparent white layer
     *   Draw a whisk between |start| and |sendStart|
     *   Draw a whisk between |finish| and |end|
     *     By draw another layer of background color to "clear" the area
     *     Then draw the whisk
     *   Draw the URL after the |sendStart|
     *
     *   |----------------[ (URL text)    waiting time   |   request  ]--------|
     *   ^start           ^sendStart                     ^headersEnd  ^Finish  ^end
     * @param index
     * @param context
     * @param barX The x pixel of the visible part request
     * @param barY The y pixel of the visible part request
     * @param barWidth The width of the visible part request
     * @param barHeight The height of the visible part request
     * @param unclippedBarX The start pixel of the request compare to the visible area. It is calculated with request.beginTime() in FlameChart.
     * @param timeToPixelRatio
     * @returns if the entry needs to be decorate, which is alway true if the request has "timing" field
     */
    decorateEntry(index: number, context: CanvasRenderingContext2D, _text: string | null, barX: number, barY: number, barWidth: number, barHeight: number, unclippedBarX: number, timeToPixelRatio: number): boolean;
    forceDecoration(_index: number): boolean;
    prepareHighlightedEntryInfo(index: number): Element | null;
    preferredHeight(): number;
    isExpanded(): boolean;
    formatValue(value: number, precision?: number): string;
    canJumpToEntry(_entryIndex: number): boolean;
    /**
     * Returns a map of navigations that happened in the main frame, ignoring any
     * that happened in other frames.
     * The map's key is the frame ID.
     **/
    mainFrameNavigationStartEvents(): readonly TraceEngine.Types.TraceEvents.TraceEventNavigationStart[];
}
