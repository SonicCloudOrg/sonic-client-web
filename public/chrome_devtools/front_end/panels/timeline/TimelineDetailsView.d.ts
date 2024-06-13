import * as TraceEngine from '../../models/trace/trace.js';
import * as UI from '../../ui/legacy/legacy.js';
import { type TimelineModeViewDelegate } from './TimelinePanel.js';
import { TimelineSelection } from './TimelineSelection.js';
export declare class TimelineDetailsView extends UI.Widget.VBox {
    #private;
    private readonly detailsLinkifier;
    private tabbedPane;
    private readonly defaultDetailsWidget;
    private readonly defaultDetailsContentElement;
    private rangeDetailViews;
    private lazyPaintProfilerView?;
    private lazyLayersView?;
    private preferredTabId?;
    private selection?;
    private updateContentsScheduled;
    private lazySelectorStatsView;
    constructor(delegate: TimelineModeViewDelegate);
    private selectorStatsView;
    getDetailsContentElementForTest(): HTMLElement;
    setModel(traceEngineData: TraceEngine.Handlers.Types.TraceParseData | null, selectedEvents: TraceEngine.Types.TraceEvents.TraceEventData[] | null): Promise<void>;
    private setContent;
    private updateContents;
    private appendTab;
    headerElement(): Element;
    setPreferredTab(tabId: string): void;
    /**
     * This forces a recalculation and rerendering of the timings
     * breakdown of a track.
     * User actions like zooming or scrolling can trigger many updates in
     * short time windows, so we debounce the calls in those cases. Single
     * sporadic calls (like selecting a new track) don't need to be
     * debounced. The forceImmediateUpdate param configures the debouncing
     * behaviour.
     */
    private scheduleUpdateContentsFromWindow;
    private updateContentsFromWindow;
    setSelection(selection: TimelineSelection | null): Promise<void>;
    private tabSelected;
    private layersView;
    private paintProfilerView;
    private showSnapshotInPaintProfiler;
    private showSelectorStatsForIndividualEvent;
    private showAggregatedSelectorStats;
    private appendDetailsTabsForTraceEventAndShowDetails;
    private showEventInPaintProfiler;
    private updateSelectedRangeStats;
}
export declare enum Tab {
    Details = "details",
    EventLog = "event-log",
    CallTree = "call-tree",
    BottomUp = "bottom-up",
    PaintProfiler = "paint-profiler",
    LayerViewer = "layer-viewer",
    SelectorStats = "selector-stats"
}
