import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { TimelineRegExp } from './TimelineFilters.js';
import { type TimelineSelection } from './TimelineSelection.js';
export declare class TimelineTreeView extends UI.Widget.VBox implements UI.SearchableView.Searchable {
    #private;
    private searchResults;
    linkifier: Components.Linkifier.Linkifier;
    dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<GridNode>;
    private lastHoveredProfileNode;
    private textFilterInternal;
    private taskFilter;
    protected startTime: TraceEngine.Types.Timing.MilliSeconds;
    protected endTime: TraceEngine.Types.Timing.MilliSeconds;
    splitWidget: UI.SplitWidget.SplitWidget;
    detailsView: UI.Widget.Widget;
    private searchableView;
    private currentThreadSetting?;
    private lastSelectedNodeInternal?;
    private root?;
    private currentResult?;
    textFilterUI?: UI.Toolbar.ToolbarInput;
    private caseSensitiveButton;
    private regexButton;
    private matchWholeWord;
    constructor();
    setSearchableView(searchableView: UI.SearchableView.SearchableView): void;
    setModelWithEvents(selectedEvents: TraceEngine.Types.TraceEvents.TraceEventData[] | null, traceParseData?: TraceEngine.Handlers.Types.TraceParseData | null): void;
    traceParseData(): TraceEngine.Handlers.Types.TraceParseData | null;
    init(): void;
    lastSelectedNode(): TimelineModel.TimelineProfileTree.Node | null | undefined;
    updateContents(selection: TimelineSelection): void;
    setRange(startTime: TraceEngine.Types.Timing.MilliSeconds, endTime: TraceEngine.Types.Timing.MilliSeconds): void;
    filters(): TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    filtersWithoutTextFilter(): TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    textFilter(): TimelineRegExp;
    exposePercentages(): boolean;
    populateToolbar(toolbar: UI.Toolbar.Toolbar): void;
    selectedEvents(): TraceEngine.Types.TraceEvents.TraceEventData[];
    onHover(_node: TimelineModel.TimelineProfileTree.Node | null): void;
    appendContextMenuItems(_contextMenu: UI.ContextMenu.ContextMenu, _node: TimelineModel.TimelineProfileTree.Node): void;
    selectProfileNode(treeNode: TimelineModel.TimelineProfileTree.Node, suppressSelectedEvent: boolean): void;
    refreshTree(): void;
    buildTree(): TimelineModel.TimelineProfileTree.Node;
    buildTopDownTree(doNotAggregate: boolean, groupIdCallback: ((arg0: TraceEngine.Types.TraceEvents.TraceEventData) => string) | null): TimelineModel.TimelineProfileTree.Node;
    populateColumns(columns: DataGrid.DataGrid.ColumnDescriptor[]): void;
    private sortingChanged;
    private onShowModeChanged;
    private updateDetailsForSelection;
    showDetailsForNode(_node: TimelineModel.TimelineProfileTree.Node): boolean;
    private onMouseMove;
    private onContextMenu;
    dataGridNodeForTreeNode(treeNode: TimelineModel.TimelineProfileTree.Node): GridNode | null;
    onSearchCanceled(): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, _shouldJump: boolean, _jumpBackwards?: boolean): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
}
export declare class GridNode extends DataGrid.SortableDataGrid.SortableDataGridNode<GridNode> {
    protected populated: boolean;
    profileNode: TimelineModel.TimelineProfileTree.Node;
    protected treeView: TimelineTreeView;
    protected grandTotalTime: number;
    protected maxSelfTime: number;
    protected maxTotalTime: number;
    linkElement: Element | null;
    constructor(profileNode: TimelineModel.TimelineProfileTree.Node, grandTotalTime: number, maxSelfTime: number, maxTotalTime: number, treeView: TimelineTreeView);
    createCell(columnId: string): HTMLElement;
    private createNameCell;
    private createValueCell;
}
export declare class TreeGridNode extends GridNode {
    constructor(profileNode: TimelineModel.TimelineProfileTree.Node, grandTotalTime: number, maxSelfTime: number, maxTotalTime: number, treeView: TimelineTreeView);
    populate(): void;
}
export declare class AggregatedTimelineTreeView extends TimelineTreeView {
    protected readonly groupBySetting: Common.Settings.Setting<AggregatedTimelineTreeView.GroupBy>;
    private readonly stackView;
    private executionContextNamesByOrigin;
    constructor();
    setGroupBySettingForTests(groupBy: AggregatedTimelineTreeView.GroupBy): void;
    updateContents(selection: TimelineSelection): void;
    private updateExtensionResolver;
    private beautifyDomainName;
    displayInfoForGroupNode(node: TimelineModel.TimelineProfileTree.Node): {
        name: string;
        color: string;
        icon: (Element | undefined);
    };
    populateToolbar(toolbar: UI.Toolbar.Toolbar): void;
    private buildHeaviestStack;
    exposePercentages(): boolean;
    private onStackViewSelectionChanged;
    showDetailsForNode(node: TimelineModel.TimelineProfileTree.Node): boolean;
    protected groupingFunction(groupBy: string): ((arg0: TraceEngine.Types.TraceEvents.TraceEventData) => string) | null;
    private domainByEvent;
    private static isExtensionInternalURL;
    private static isV8NativeURL;
    private static readonly extensionInternalPrefix;
    private static readonly v8NativePrefix;
}
export declare namespace AggregatedTimelineTreeView {
    enum GroupBy {
        None = "None",
        EventName = "EventName",
        Category = "Category",
        Domain = "Domain",
        Subdomain = "Subdomain",
        URL = "URL",
        Frame = "Frame"
    }
}
export declare class CallTreeTimelineTreeView extends AggregatedTimelineTreeView {
    constructor();
    buildTree(): TimelineModel.TimelineProfileTree.Node;
}
export declare class BottomUpTimelineTreeView extends AggregatedTimelineTreeView {
    constructor();
    buildTree(): TimelineModel.TimelineProfileTree.Node;
}
declare const TimelineStackView_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<TimelineStackView.EventTypes>;
    addEventListener<T extends TimelineStackView.Events.SelectionChanged>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<TimelineStackView.EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<TimelineStackView.EventTypes, T>;
    once<T_1 extends TimelineStackView.Events.SelectionChanged>(eventType: T_1): Promise<TimelineStackView.EventTypes[T_1]>;
    removeEventListener<T_2 extends TimelineStackView.Events.SelectionChanged>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<TimelineStackView.EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: TimelineStackView.Events.SelectionChanged): boolean;
    dispatchEventToListeners<T_3 extends TimelineStackView.Events.SelectionChanged>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<TimelineStackView.EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class TimelineStackView extends TimelineStackView_base {
    private readonly treeView;
    private readonly dataGrid;
    constructor(treeView: TimelineTreeView);
    setStack(stack: TimelineModel.TimelineProfileTree.Node[], selectedNode: TimelineModel.TimelineProfileTree.Node): void;
    selectedTreeNode(): TimelineModel.TimelineProfileTree.Node | null;
    private onSelectionChanged;
}
export declare namespace TimelineStackView {
    const enum Events {
        SelectionChanged = "SelectionChanged"
    }
    type EventTypes = {
        [Events.SelectionChanged]: void;
    };
}
export {};
