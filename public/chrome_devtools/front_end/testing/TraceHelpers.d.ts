import * as Bindings from '../models/bindings/bindings.js';
import * as TraceEngine from '../models/trace/trace.js';
import * as Timeline from '../panels/timeline/timeline.js';
import * as PerfUI from '../ui/legacy/components/perf_ui/perf_ui.js';
export declare class MockFlameChartDelegate implements PerfUI.FlameChart.FlameChartDelegate {
    windowChanged(_startTime: number, _endTime: number, _animate: boolean): void;
    updateRangeSelection(_startTime: number, _endTime: number): void;
    updateSelectedGroup(_flameChart: PerfUI.FlameChart.FlameChart, _group: PerfUI.FlameChart.Group | null): void;
}
/**
 * Draws a set of tracks track in the flame chart using the new system.
 * For this to work, every track that will be rendered must have a
 * corresponding track appender registered in the
 * CompatibilityTracksAppender.
 *
 * @param traceFileName The name of the trace file to be loaded into the
 * flame chart.
 * @param trackAppenderNames A Set with the names of the tracks to be
 * rendered. For example, Set("Timings").
 * @param expanded whether the track should be expanded
 * @param trackName optional param to filter tracks by their name.
 * @returns a flame chart element and its corresponding data provider.
 */
export declare function getMainFlameChartWithTracks(traceFileName: string, trackAppenderNames: Set<Timeline.CompatibilityTracksAppender.TrackAppenderName>, expanded: boolean, trackName?: string): Promise<{
    flameChart: PerfUI.FlameChart.FlameChart;
    dataProvider: Timeline.TimelineFlameChartDataProvider.TimelineFlameChartDataProvider;
}>;
/**
 * Draws the network track in the flame chart using the legacy system.
 *
 * @param traceFileName The name of the trace file to be loaded to the flame
 * chart.
 * @param expanded if the track is expanded
 * @returns a flame chart element and its corresponding data provider.
 */
export declare function getNetworkFlameChart(traceFileName: string, expanded: boolean): Promise<{
    flameChart: PerfUI.FlameChart.FlameChart;
    dataProvider: Timeline.TimelineFlameChartNetworkDataProvider.TimelineFlameChartNetworkDataProvider;
}>;
export declare const defaultTraceEvent: TraceEngine.Types.TraceEvents.TraceEventData;
/**
 * Gets the tree in a thread.
 * @see RendererHandler.ts
 */
export declare function getTree(thread: TraceEngine.Handlers.ModelHandlers.Renderer.RendererThread): TraceEngine.Helpers.TreeHelpers.TraceEntryTree;
/**
 * Gets the n-th root from a tree in a thread.
 * @see RendererHandler.ts
 */
export declare function getRootAt(thread: TraceEngine.Handlers.ModelHandlers.Renderer.RendererThread, index: number): TraceEngine.Helpers.TreeHelpers.TraceEntryNode;
/**
 * Gets all nodes in a thread. To finish this task, we Walk through all the nodes, starting from the root node.
 */
export declare function getAllNodes(roots: Set<TraceEngine.Helpers.TreeHelpers.TraceEntryNode>): TraceEngine.Helpers.TreeHelpers.TraceEntryNode[];
/**
 * Gets the node with an id from a tree in a thread.
 * @see RendererHandler.ts
 */
export declare function getNodeFor(thread: TraceEngine.Handlers.ModelHandlers.Renderer.RendererThread, nodeId: TraceEngine.Helpers.TreeHelpers.TraceEntryNodeId): TraceEngine.Helpers.TreeHelpers.TraceEntryNode;
/**
 * Gets all the `events` for the `nodes`.
 */
export declare function getEventsIn(nodes: IterableIterator<TraceEngine.Helpers.TreeHelpers.TraceEntryNode>): TraceEngine.Types.TraceEvents.TraceEventData[];
/**
 * Pretty-prints a tree.
 */
export declare function prettyPrint(tree: TraceEngine.Helpers.TreeHelpers.TraceEntryTree, predicate?: (node: TraceEngine.Helpers.TreeHelpers.TraceEntryNode, event: TraceEngine.Types.TraceEvents.SyntheticTraceEntry) => boolean, indentation?: number, delimiter?: string, prefix?: string, newline?: string, out?: string): string;
/**
 * Builds a mock TraceEventComplete.
 */
export declare function makeCompleteEvent(name: string, ts: number, dur: number, cat?: string, pid?: number, tid?: number): TraceEngine.Types.TraceEvents.TraceEventComplete;
export declare function makeAsyncStartEvent(name: string, ts: number, pid?: number, tid?: number): TraceEngine.Types.TraceEvents.TraceEventAsync;
export declare function makeAsyncEndEvent(name: string, ts: number, pid?: number, tid?: number): TraceEngine.Types.TraceEvents.TraceEventAsync;
export declare function makeCompleteEventInMilliseconds(name: string, tsMillis: number, durMillis: number, cat?: string, pid?: number, tid?: number): TraceEngine.Types.TraceEvents.TraceEventComplete;
/**
 * Builds a mock TraceEventInstant.
 */
export declare function makeInstantEvent(name: string, tsMicroseconds: number, cat?: string, pid?: number, tid?: number, s?: TraceEngine.Types.TraceEvents.TraceEventScope): TraceEngine.Types.TraceEvents.TraceEventInstant;
/**
 * Builds a mock TraceEventBegin.
 */
export declare function makeBeginEvent(name: string, ts: number, cat?: string, pid?: number, tid?: number): TraceEngine.Types.TraceEvents.TraceEventBegin;
/**
 * Builds a mock TraceEventEnd.
 */
export declare function makeEndEvent(name: string, ts: number, cat?: string, pid?: number, tid?: number): TraceEngine.Types.TraceEvents.TraceEventEnd;
export declare function makeProfileCall(functionName: string, tsMs: number, durMs: number, pid?: TraceEngine.Types.TraceEvents.ProcessID, tid?: TraceEngine.Types.TraceEvents.ThreadID, nodeId?: number, url?: string): TraceEngine.Types.TraceEvents.SyntheticProfileCall;
export declare const DevToolsTimelineCategory = "disabled-by-default-devtools.timeline";
/**
 * Mocks an object compatible with the return type of the
 * RendererHandler using only an array of ordered entries.
 */
export declare function makeMockRendererHandlerData(entries: TraceEngine.Types.TraceEvents.SyntheticTraceEntry[]): TraceEngine.Handlers.ModelHandlers.Renderer.RendererHandlerData;
/**
 * Mocks an object compatible with the return type of the
 * SamplesHandler using only an array of ordered profile calls.
 */
export declare function makeMockSamplesHandlerData(profileCalls: TraceEngine.Types.TraceEvents.SyntheticProfileCall[]): TraceEngine.Handlers.ModelHandlers.Samples.SamplesHandlerData;
export declare class FakeFlameChartProvider implements PerfUI.FlameChart.FlameChartDataProvider {
    minimumBoundary(): number;
    hasTrackConfigurationMode(): boolean;
    totalTime(): number;
    formatValue(value: number): string;
    maxStackDepth(): number;
    prepareHighlightedEntryInfo(_entryIndex: number): Element | null;
    canJumpToEntry(_entryIndex: number): boolean;
    entryTitle(entryIndex: number): string | null;
    entryFont(_entryIndex: number): string | null;
    entryColor(entryIndex: number): string;
    decorateEntry(): boolean;
    forceDecoration(_entryIndex: number): boolean;
    textColor(_entryIndex: number): string;
    timelineData(): PerfUI.FlameChart.FlameChartTimelineData | null;
}
export declare function getMainThread(data: TraceEngine.Handlers.ModelHandlers.Renderer.RendererHandlerData): TraceEngine.Handlers.ModelHandlers.Renderer.RendererThread;
type TraceParseData = TraceEngine.Handlers.Types.TraceParseData;
export declare function getBaseTraceParseModelData(overrides?: Partial<TraceParseData>): TraceParseData;
/**
 * A helper that will query the given array of events and find the first event
 * matching the predicate. It will also assert that a match is found, which
 * saves the need to do that for every test.
 */
export declare function getEventOfType<T extends TraceEngine.Types.TraceEvents.TraceEventData>(events: TraceEngine.Types.TraceEvents.TraceEventData[], predicate: (e: TraceEngine.Types.TraceEvents.TraceEventData) => e is T): T;
/**
 * The Performance Panel is integrated with the IgnoreListManager so in tests
 * that render a flame chart or a track appender, it needs to be setup to avoid
 * errors.
 */
export declare function setupIgnoreListManagerEnvironment(): {
    ignoreListManager: Bindings.IgnoreListManager.IgnoreListManager;
};
export {};
