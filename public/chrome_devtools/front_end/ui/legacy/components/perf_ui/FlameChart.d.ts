/**
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../../../core/common/common.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as TraceEngine from '../../../../models/trace/trace.js';
import * as UI from '../../legacy.js';
import { type ChartViewportDelegate } from './ChartViewport.js';
import { type Calculator } from './TimelineGrid.js';
export declare const enum HoverType {
    TRACK_CONFIG_UP_BUTTON = "TRACK_CONFIG_UP_BUTTON",
    TRACK_CONFIG_DOWN_BUTTON = "TRACK_CONFIG_DOWN_BUTTON",
    TRACK_CONFIG_HIDE_BUTTON = "TRACK_CONFIG_HIDE_BUTTON",
    TRACK_CONFIG_SHOW_BUTTON = "TRACK_CONFIG_SHOW_BUTTON",
    INSIDE_TRACK_HEADER = "INSIDE_TRACK_HEADER",
    INSIDE_TRACK = "INSIDE_TRACK",
    OUTSIDE_TRACKS = "OUTSIDE_TRACKS",
    ERROR = "ERROR"
}
export declare class FlameChartDelegate {
    windowChanged(_startTime: number, _endTime: number, _animate: boolean): void;
    updateRangeSelection(_startTime: number, _endTime: number): void;
    updateSelectedGroup(_flameChart: FlameChart, _group: Group | null): void;
}
interface GroupExpansionState {
    [groupName: string]: boolean;
}
interface GroupTreeNode {
    index: number;
    nestingLevel: number;
    startLevel: number;
    endLevel: number;
    children: GroupTreeNode[];
}
export interface OptionalFlameChartConfig {
    /**
     * The FlameChart will highlight the entry that is selected by default. In
     * some cases (Performance Panel) we manage this ourselves with the Overlays
     * system, so we disable the built in one.
     */
    selectedElementOutline?: boolean;
    groupExpansionSetting?: Common.Settings.Setting<GroupExpansionState>;
}
declare const FlameChart_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class FlameChart extends FlameChart_base implements Calculator, ChartViewportDelegate {
    #private;
    private readonly groupExpansionSetting?;
    private groupExpansionState;
    private groupHiddenState;
    private readonly flameChartDelegate;
    private chartViewport;
    private dataProvider;
    private candyStripePattern;
    private contextMenu?;
    private viewportElement;
    private canvas;
    private popoverElement;
    private readonly markerHighlighElement;
    readonly highlightElement: HTMLElement;
    readonly revealDescendantsArrowHighlightElement: HTMLElement;
    private readonly selectedElement;
    private rulerEnabled;
    private barHeight;
    private hitMarginPx;
    private textBaseline;
    private textPadding;
    private highlightedMarkerIndex;
    /**
     * Represents the index of the entry that the user's mouse cursor is over.
     * Note that this is updated as the user moves their cursor: they do not have
     * to click for this to be updated.
     **/
    private highlightedEntryIndex;
    /**
     * Represents the index of the entry that is selected. For an entry to be
     * selected, it has to be clicked by the user.
     **/
    private selectedEntryIndex;
    private rawTimelineDataLength;
    private readonly markerPositions;
    private lastMouseOffsetX;
    private selectedGroupIndex;
    private keyboardFocusedGroup;
    private offsetWidth;
    private offsetHeight;
    private dragStartX;
    private dragStartY;
    private lastMouseOffsetY;
    private minimumBoundaryInternal;
    private maxDragOffset;
    private timelineLevels?;
    private visibleLevelOffsets?;
    private visibleLevels?;
    private visibleLevelHeights?;
    private groupOffsets?;
    private rawTimelineData?;
    private forceDecorationCache?;
    private entryColorsCache?;
    private totalTime?;
    private lastPopoverState;
    constructor(dataProvider: FlameChartDataProvider, flameChartDelegate: FlameChartDelegate, optionalConfig?: OptionalFlameChartConfig);
    willHide(): void;
    canvasBoundingClientRect(): DOMRect | null;
    getBarHeight(): number;
    setBarHeight(value: number): void;
    setTextBaseline(value: number): void;
    setTextPadding(value: number): void;
    enableRuler(enable: boolean): void;
    alwaysShowVerticalScroll(): void;
    disableRangeSelection(): void;
    highlightEntry(entryIndex: number): void;
    highlightAllEntries(entries: number[]): void;
    removeSearchResultHighlights(): void;
    hideHighlight(): void;
    private createCandyStripePattern;
    private resetCanvas;
    windowChanged(startTime: number, endTime: number, animate: boolean): void;
    updateRangeSelection(startTime: number, endTime: number): void;
    setSize(width: number, height: number): void;
    private startDragging;
    private dragging;
    private endDragging;
    timelineData(rebuid?: boolean): FlameChartTimelineData | null;
    private revealEntry;
    setWindowTimes(startTime: number, endTime: number, animate?: boolean): void;
    /**
     * Handle the mouse move event.
     *
     * And the handle priority will be:
     * 1. Track configuration icons -> show tooltip for the icons
     * 2. Inside a track header -> mouse style will be a "pointer", show edit icon
     * 3.1 Inside a track -> show edit icon, update the highlight of hovered event
     * 3.2 Outside all tracks -> clear all highlights
     */
    private onMouseMove;
    private updateHighlight;
    private onMouseOut;
    showPopoverForSearchResult(selectedSearchResult: number): void;
    private updatePopoverOffset;
    /**
     * Handle mouse click event in flame chart
     *
     * And the handle priority will be:
     * 1. Track configuration icons -> Config a track
     * 1.1 if it's edit mode ignore others.
     * 2. Inside a track header -> Select and Expand/Collapse a track
     * 3. Inside a track -> Select a track
     * 3.1 shift + click -> Select the time range of clicked event
     * 3.2 click -> update highlight (handle in other functions)
     */
    private onClick;
    private deselectAllGroups;
    private deselectAllEntries;
    private isGroupFocused;
    private scrollGroupIntoView;
    private toggleGroupExpand;
    private expandGroup;
    moveGroupUp(groupIndex: number): void;
    moveGroupDown(groupIndex: number): void;
    hideGroup(groupIndex: number): void;
    showGroup(groupIndex: number): void;
    modifyTree(treeAction: TraceEngine.EntriesFilter.FilterAction, index: number): void;
    getPossibleActions(): TraceEngine.EntriesFilter.PossibleFilterActions | void;
    onContextMenu(event: MouseEvent): void;
    private handleFlameChartTransformEvent;
    private onKeyDown;
    bindCanvasEvent(eventName: string, onEvent: (arg0: Event) => void): void;
    drawTrackOnCanvas(trackName: string, context: CanvasRenderingContext2D, minWidth: number): {
        top: number;
        height: number;
        visibleEntries: Set<number>;
    } | null;
    private handleKeyboardGroupNavigation;
    private selectFirstEntryInCurrentGroup;
    private selectPreviousGroup;
    private selectNextGroup;
    private getGroupIndexToSelect;
    private selectFirstChild;
    private handleSelectionNavigation;
    /**
     * Given offset of the cursor, returns the index of the entry.
     * This function is public for test purpose.
     * @param x
     * @param y
     * @returns the index of the entry
     */
    coordinatesToEntryIndex(x: number, y: number): number;
    /**
     * Given an entry's index and an X coordinate of a mouse click, returns
     * whether the mouse is hovering over the arrow button that reveals hidden children
     */
    isMouseOverRevealChildrenArrow(x: number, index: number): boolean;
    /**
     * Given an entry's index, returns its coordinates relative to the
     * viewport.
     * This function is public for test purpose.
     */
    entryIndexToCoordinates(entryIndex: number): {
        x: number;
        y: number;
    } | null;
    /**
     * Given an entry's index, returns its title
     */
    entryTitle(entryIndex: number): string | null;
    /**
     * Returns the offset of the canvas relative to the viewport.
     */
    getCanvasOffset(): {
        x: number;
        y: number;
    };
    getCanvas(): HTMLCanvasElement;
    /**
     * Returns the y scroll of the chart viewport.
     */
    getScrollOffset(): number;
    getContextMenu(): UI.ContextMenu.ContextMenu | undefined;
    /**
     * Given offset of the cursor, returns the index of the group and the hover type of current mouse position.
     * Will return -1 for index and HoverType.OUTSIDE_TRACKS if no group is hovered/clicked.
     * And the handle priority will be:
     * 1. Track configuration icons
     * 2. Inside a track header (track label and the expansion arrow)
     * 3. Inside a track
     * 4. Outside all tracks
     *
     * This function is public for test purpose.
     * @param x
     * @param y
     * @returns the index of the group and the button user clicked. If there is no button the button type will be
     * undefined.
     */
    coordinatesToGroupIndexAndHoverType(x: number, y: number): {
        groupIndex: number;
        hoverType: HoverType;
    };
    private markerIndexBeforeTime;
    /**
     * Draw the whole flame chart.
     * Make sure |setWindowTimes| is called with correct time range before this function.
     */
    private draw;
    entryWidth(entryIndex: number): number;
    /**
     * Preprocess the data to be drawn to speed the rendering time.
     * Especifically:
     *  - Groups events into color buckets.
     *  - Discards non visible events.
     *  - Gathers marker events (LCP, FCP, DCL, etc.).
     *  - Gathers event titles that should be rendered.
     */
    private getDrawableData;
    /**
     * The function to draw the group headers. It will draw the title by default.
     * And when a group is hovered, it will add a edit button.
     * And will draw the move up/down, hide and save button if user enter the editing mode.
     * @param width
     * @param height
     * @param hoveredGroupIndex This is used to show the edit icon for hovered group. If it is undefined or -1, it means
     * there is no group being hovered.
     */
    private drawGroupHeaders;
    /**
     * Draws page load events in the Timings track (LCP, FCP, DCL, etc.)
     */
    private drawMarkers;
    /**
     * Draws the titles of trace events in the timeline. Also calls `decorateEntry` on the data
     * provider, which can do any custom drawing on the corresponding entry's area (e.g. draw screenshots
     * in the Performance Panel timeline).
     *
     * Takes in the width of the entire canvas so that we know if an event does
     * not fit into the viewport entirely, the max width we can draw is that
     * width, not the width of the event itself.
     */
    private drawEventTitles;
    /**
     * @callback GroupCallback
     * @param groupTop pixels between group top and the top of the flame chart.
     * @param groupIndex
     * @param group
     * @param isFirstGroup if the group is the first one of this nesting level.
     * @param height pixels of height of this group
     */
    /**
     * Process the pixels of start and end, and other data of each group, which are used in drawing the group.
     * @param {GroupCallback} callback
     */
    private forEachGroup;
    private forEachGroupInViewport;
    /**
     * Returns the width of the title label of the group, which include the left padding, arrow and the group header text.
     * This function is public for test reason.
     * |ICON_WIDTH|expansionArrowIndent * (nestingLevel + 1)|
     * |headerLeftPadding|EDIT  ICON|                    |Arrow|LabelXPadding|Title|LabelXPadding|
     *                              |<--                      labelWidth                      -->|
     * @param context canvas context
     * @param group
     * @returns the width of the label of the group.
     */
    labelWidthForGroup(context: CanvasRenderingContext2D, group: Group): number;
    private drawCollapsedOverviewForGroup;
    private drawFlowEvents;
    private drawCircleArroundCollapseArrow;
    /**
     * Draws the vertical dashed lines in the timeline marking where the "Marker" events
     * happened in time.
     */
    private drawMarkerLines;
    private updateMarkerHighlight;
    private processTimelineData;
    /**
     * Builds a tree for the given group array, the tree will be builded based on the nesting level.
     * We will add one fake root to represent the top level parent, and the for each tree node, its children means the
     * group nested in. The order of the children matters because it represent the order of groups.
     * So for example if there are Group 0-7, Group 0, 3, 4 have nestingLevel 0, Group 1, 2, 5, 6, 7 have nestingLevel 1.
     * Then we will get a tree like this.
     *              -1(fake root to represent the top level parent)
     *             / | \
     *            /  |  \
     *           0   3   4
     *          / \    / | \
     *         1   2  5  6  7
     * This function is public for test purpose.
     * @param groups the array of all groups, it should be the one from FlameChartTimelineData
     * @returns the root of the Group tree. The root is the fake one we added, which represent the parent for all groups
     */
    buildGroupTree(groups: Group[]): GroupTreeNode;
    /**
     * Updates the tree for the given group array.
     * For a new timeline data, if the groups remains the same (the same here mean the group order inside the |groups|,
     * the start level, style and other attribute can be changed), but other parts are different.
     * For example the |entryLevels[]| or |maxStackDepth| is changed, then we should update the group tree instead of
     * re-build it.
     * So we can keep the order that user manually set.
     * To do this, we go through the tree, and update the start and end level of each group.
     * This function is public for test purpose.
     * @param groups the array of all groups, it should be the one from FlameChartTimelineData
     * @returns the root of the Group tree. The root is the fake one we added, which represent the parent for all groups
     */
    updateGroupTree(groups: Group[], root: GroupTreeNode): void;
    private updateLevelPositions;
    private isGroupCollapsible;
    groupIsLastVisibleTopLevel(group?: Group): boolean;
    setSelectedEntry(entryIndex: number): void;
    private entryHasDecoration;
    getMarkerPixelsForEntryIndex(entryIndex: number): {
        x: number;
        width: number;
    } | null;
    /**
     * Update position of an Element. By default, the element is treated as a full entry and it's dimentions are set to the full entry width/length/height.
     * If isDecoration parameter is set to true, the element will be positioned on the right side of the entry and have a square shape where width == height of the entry.
     */
    private updateElementPosition;
    private updateHiddenChildrenArrowHighlighPosition;
    private timeToPositionClipped;
    /**
     * Returns the amount of pixels a group is vertically offset in the flame chart.
     * Now this function is only used for tests.
     */
    groupIndexToOffsetForTest(groupIndex: number): number;
    /**
     * Set the edit mode.
     * Now this function is only used for tests.
     */
    setEditModeForTest(editMode: boolean): void;
    /**
     * Returns the visibility of a level in the.
     * flame chart.
     */
    levelIsVisible(level: number): boolean;
    /**
     * Returns the amount of pixels a level is vertically offset in the.
     * flame chart.
     */
    levelToOffset(level: number): number;
    levelHeight(level: number): number;
    private updateBoundaries;
    private updateHeight;
    onResize(): void;
    update(): void;
    reset(): void;
    scheduleUpdate(): void;
    private enabled;
    computePosition(time: number): number;
    formatValue(value: number, precision?: number): string;
    maximumBoundary(): TraceEngine.Types.Timing.MilliSeconds;
    minimumBoundary(): TraceEngine.Types.Timing.MilliSeconds;
    zeroTime(): TraceEngine.Types.Timing.MilliSeconds;
    boundarySpan(): TraceEngine.Types.Timing.MilliSeconds;
}
export declare const RulerHeight = 15;
export declare const MinimalTimeWindowMs = 0.5;
/**
 * initiatorIndex is the index of the initiator entry and
 * eventIndex is the entry initiated by it.
 * However, if isEntryHidden or isInitiatorHidden are set to true,
 * it means that the actual initiator or initiated entry is hidden
 * by some context menu action and the indexes in initiatorIndex
 * or/and eventIndex are for the entries that are the closest
 * modified by an actions ancestors to them.
 */
export interface FlameChartInitiatorData {
    initiatorIndex: number;
    eventIndex: number;
    isEntryHidden?: boolean;
    isInitiatorHidden?: boolean;
}
export declare const enum FlameChartDecorationType {
    CANDY = "CANDY",
    WARNING_TRIANGLE = "WARNING_TRIANGLE",
    HIDDEN_DESCENDANTS_ARROW = "HIDDEN_DESCENDANTS_ARROW"
}
/**
 * Represents a decoration that can be added to event. Each event can have as
 * many decorations as required.
 *
 * It is anticipated in the future that we will add to this as we want to
 * annotate events in more ways.
 *
 * This work is being tracked in crbug.com/1434297.
 **/
export type FlameChartDecoration = {
    type: FlameChartDecorationType.CANDY;
    startAtTime: TraceEngine.Types.Timing.MicroSeconds;
    endAtTime?: TraceEngine.Types.Timing.MicroSeconds;
} | {
    type: FlameChartDecorationType.WARNING_TRIANGLE;
    customEndTime?: TraceEngine.Types.Timing.MicroSeconds;
} | {
    type: FlameChartDecorationType.HIDDEN_DESCENDANTS_ARROW;
};
export declare function sortDecorationsForRenderingOrder(decorations: FlameChartDecoration[]): void;
export declare class FlameChartTimelineData {
    entryLevels: number[] | Uint16Array;
    entryTotalTimes: number[] | Float32Array;
    entryStartTimes: number[] | Float64Array;
    /**
     * An array of entry decorations, where each item in the array is an array of
     * decorations for the event at that index.
     **/
    entryDecorations: FlameChartDecoration[][];
    groups: Group[];
    markers: FlameChartMarker[];
    initiatorsData: FlameChartInitiatorData[];
    selectedGroup: Group | null;
    private constructor();
    static create(data: {
        entryLevels: FlameChartTimelineData['entryLevels'];
        entryTotalTimes: FlameChartTimelineData['entryTotalTimes'];
        entryStartTimes: FlameChartTimelineData['entryStartTimes'];
        groups: FlameChartTimelineData['groups'] | null;
        entryDecorations?: FlameChartDecoration[][];
        initiatorsData?: FlameChartTimelineData['initiatorsData'];
    }): FlameChartTimelineData;
    static createEmpty(): FlameChartTimelineData;
    resetFlowData(): void;
}
export interface FlameChartDataProvider {
    buildFlowForInitiator?(index: number): unknown;
    minimumBoundary(): number;
    totalTime(): number;
    formatValue(value: number, precision?: number): string;
    maxStackDepth(): number;
    timelineData(rebuild?: boolean): FlameChartTimelineData | null;
    prepareHighlightedEntryInfo(entryIndex: number): Element | null;
    prepareHighlightedHiddenEntriesArrowInfo?(entryIndex: number): Element | null;
    canJumpToEntry(entryIndex: number): boolean;
    entryTitle(entryIndex: number): string | null;
    entryFont(entryIndex: number): string | null;
    entryColor(entryIndex: number): string;
    decorateEntry(entryIndex: number, context: CanvasRenderingContext2D, text: string | null, barX: number, barY: number, barWidth: number, barHeight: number, unclippedBarX: number, timeToPixelRatio: number): boolean;
    forceDecoration(entryIndex: number): boolean;
    textColor(entryIndex: number): string;
    mainFrameNavigationStartEvents?(): readonly TraceEngine.Types.TraceEvents.TraceEventNavigationStart[];
    modifyTree?(node: number, action: TraceEngine.EntriesFilter.FilterAction): void;
    findPossibleContextMenuActions?(node: number): TraceEngine.EntriesFilter.PossibleFilterActions | void;
    hasTrackConfigurationMode(): boolean;
    eventByIndex?(entryIndex: number): TraceEngine.Types.TraceEvents.TraceEventData | TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame | null;
    indexForEvent?(event: TraceEngine.Types.TraceEvents.TraceEventData | TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame): number | null;
}
export interface FlameChartMarker {
    startTime(): number;
    color(): string;
    title(): string | null;
    draw(context: CanvasRenderingContext2D, x: number, height: number, pixelsPerMillisecond: number): void;
}
export declare const enum Events {
    /**
     * Emitted when the <canvas> element of the FlameChart is focused by the user.
     **/
    CanvasFocused = "CanvasFocused",
    /**
     * Emitted when an event is selected by either mouse click, or hitting
     * <enter> on the keyboard - e.g. the same actions that would invoke a
     * <button> element.
     *
     * Will be emitted with a number which is the index of the entry that has
     * been selected, or -1 if no entry is selected (e.g the user has clicked
     * away from any events)
     */
    EntryInvoked = "EntryInvoked",
    /**
     * Emitted when an event is selected via keyboard navigation using the arrow
     * keys.
     *
     * Will be emitted with a number which is the index of the entry that has
     * been selected, or -1 if no entry is selected.
     */
    EntrySelected = "EntrySelected",
    /**
     * Emitted when an event is hovered over with the mouse.
     *
     * Will be emitted with a number which is the index of the entry that has
     * been hovered on, or -1 if no entry is selected (the user has moved their
     * mouse off the event)
     */
    EntryHighlighted = "EntryHighlighted",
    ChartPlayableStateChange = "ChartPlayableStateChange",
    LatestDrawDimensions = "LatestDrawDimensions"
}
export type EventTypes = {
    [Events.CanvasFocused]: number | void;
    [Events.EntryInvoked]: number;
    [Events.EntrySelected]: number;
    [Events.EntryHighlighted]: number;
    [Events.ChartPlayableStateChange]: boolean;
    [Events.LatestDrawDimensions]: {
        chart: {
            widthPixels: number;
            heightPixels: number;
            scrollOffsetPixels: number;
            allGroupsCollapsed: boolean;
        };
        traceWindow: TraceEngine.Types.Timing.TraceWindowMicroSeconds;
    };
};
export interface Group {
    name: Common.UIString.LocalizedString;
    startLevel: number;
    expanded?: boolean;
    hidden?: boolean;
    selectable?: boolean;
    style: GroupStyle;
    /** Should be turned on if the track supports user editable stacks. */
    showStackContextMenu?: boolean;
}
export interface GroupStyle {
    height: number;
    padding: number;
    collapsible: boolean;
    /** The color of the group title text. */
    color: string;
    /** The background color of the group title when the track is collapsed,
     * and this is usually around same length as the title text. */
    backgroundColor: string;
    nestingLevel: number;
    itemsHeight?: number;
    /** Allow entries to be placed on the same horizontal level as the text heading. True by default for Timeline */
    shareHeaderLine?: boolean;
    useFirstLineForOverview?: boolean;
    useDecoratorsForOverview?: boolean;
}
export {};
