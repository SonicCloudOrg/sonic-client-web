// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as Components from './components/components.js';
/**
 * Below the network track there is a resize bar the user can click and drag.
 */
const NETWORK_RESIZE_ELEM_HEIGHT_PX = 8;
export class Overlays {
    /**
     * The list of active overlays. Overlays can't be marked as visible or
     * hidden; every overlay in this list is rendered.
     * We track each overlay against the HTML Element we have rendered. This is
     * because on first render of a new overlay, we create it, but then on
     * subsequent renders we do not destroy and recreate it, instead we update it
     * based on the new position of the timeline.
     */
    #overlaysToElements = new Map();
    #dimensions = {
        trace: {
            visibleWindow: null,
        },
        charts: {
            main: null,
            network: null,
        },
    };
    /**
     * To calculate the Y pixel value for an event we need access to the chart
     * and data provider in order to find out what level the event is on, and from
     * there calculate the pixel value for that level.
     */
    #charts;
    /**
     * The Overlays class will take each overlay, generate its HTML, and add it
     * to the container. This container is provided for us when the class is
     * created so we can manage its contents as overlays come and go.
     */
    #overlaysContainer;
    constructor(init) {
        this.#overlaysContainer = init.container;
        this.#charts = init.charts;
    }
    /**
     * Because entries can be a TimelineFrame, which is not a trace event, this
     * helper exists to return a consistent set of timings regardless of the type
     * of entry.
     */
    #timingsForOverlayEntry(entry) {
        if (entry instanceof TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame) {
            return {
                startTime: entry.startTime,
                endTime: entry.endTime,
                duration: entry.duration,
                selfTime: TraceEngine.Types.Timing.MicroSeconds(0),
            };
        }
        return TraceEngine.Helpers.Timing.eventTimingsMicroSeconds(entry);
    }
    #chartForOverlayEntry(entry) {
        if (entry instanceof TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame) {
            return 'main';
        }
        if (TraceEngine.Types.TraceEvents.isSyntheticNetworkRequestDetailsEvent(entry)) {
            return 'network';
        }
        return 'main';
    }
    /**
     * Add a new overlay to the view.
     */
    add(overlay) {
        if (this.#overlaysToElements.has(overlay)) {
            return overlay;
        }
        // By setting the value to null, we ensure that on the next render that the
        // overlay will have a new HTML element created for it.
        this.#overlaysToElements.set(overlay, null);
        return overlay;
    }
    /**
     * Update an existing overlay without destroying and recreating its
     * associated DOM.
     *
     * This is useful if you need to rapidly update an overlay's data - e.g.
     * dragging to create time ranges - without the thrashing of destroying the
     * old overlay and re-creating the new one.
     */
    updateExisting(existingOverlay, newData) {
        if (!this.#overlaysToElements.has(existingOverlay)) {
            console.error('Trying to update an overlay that does not exist.');
            return;
        }
        for (const [key, value] of Object.entries(newData)) {
            // newData is of type Partial<T>, so each key must exist in T, but
            // Object.entries doesn't carry that information.
            const k = key;
            existingOverlay[k] = value;
        }
    }
    /**
     * @returns the list of overlays associated with a given entry.
     */
    overlaysForEntry(entry) {
        const matches = [];
        for (const [overlay] of this.#overlaysToElements) {
            if ('entry' in overlay && overlay.entry === entry) {
                matches.push(overlay);
            }
        }
        return matches;
    }
    /**
     * Removes any active overlays that match the provided type.
     */
    removeOverlaysOfType(type) {
        const overlaysToRemove = Array.from(this.#overlaysToElements.keys()).filter(overlay => {
            return overlay.type === type;
        });
        for (const overlay of overlaysToRemove) {
            this.remove(overlay);
        }
    }
    /**
     * Removes the provided overlay from the list of overlays and destroys any
     * DOM associated with it.
     */
    remove(overlay) {
        const htmlElement = this.#overlaysToElements.get(overlay);
        if (htmlElement && this.#overlaysContainer) {
            this.#overlaysContainer.removeChild(htmlElement);
        }
        this.#overlaysToElements.delete(overlay);
    }
    /**
     * Update the dimenions of a chart.
     * IMPORTANT: this does not trigger a re-draw. You must call the render() method manually.
     */
    updateChartDimensions(chart, dimensions) {
        this.#dimensions.charts[chart] = dimensions;
    }
    /**
     * Update the visible window of the UI.
     * IMPORTANT: this does not trigger a re-draw. You must call the render() method manually.
     */
    updateVisibleWindow(visibleWindow) {
        this.#dimensions.trace.visibleWindow = visibleWindow;
    }
    /**
     * Clears all overlays and all data. Call this when the trace is changing
     * (e.g. the user has imported/recorded a new trace) and we need to start from
     * scratch and remove all overlays relating to the preivous trace.
     */
    reset() {
        if (this.#overlaysContainer) {
            this.#overlaysContainer.innerHTML = '';
        }
        this.#overlaysToElements.clear();
        // Clear out dimensions from the old Flame Charts.
        this.#dimensions.trace.visibleWindow = null;
        this.#dimensions.charts.main = null;
        this.#dimensions.charts.network = null;
    }
    /**
     * Updates the Overlays UI: new overlays will be rendered onto the view, and
     * existing overlays will have their positions changed to ensure they are
     * rendered in the right place.
     */
    update() {
        for (const [overlay, existingElement] of this.#overlaysToElements) {
            const element = existingElement || this.#createElementForNewOverlay(overlay);
            if (existingElement) {
                this.#updateOverlayElementIfRequired(overlay, element);
            }
            else {
                // This is a new overlay, so we have to store the element and add it to the DOM.
                this.#overlaysToElements.set(overlay, element);
                this.#overlaysContainer.appendChild(element);
            }
            this.#positionOverlay(overlay, element);
        }
    }
    #positionOverlay(overlay, element) {
        switch (overlay.type) {
            case 'ENTRY_SELECTED': {
                if (this.entryIsVisibleOnChart(overlay.entry)) {
                    element.style.visibility = 'visible';
                    this.#positionEntrySelectedOverlay(overlay, element);
                }
                else {
                    element.style.visibility = 'hidden';
                }
                break;
            }
            case 'TIME_RANGE': {
                this.#positionTimeRangeOverlay(overlay, element);
                const component = element.querySelector('devtools-time-range-overlay');
                if (component) {
                    component.afterOverlayUpdate();
                }
                break;
            }
            default: {
                Platform.TypeScriptUtilities.assertNever(overlay, `Unknown overlay: ${JSON.stringify(overlay)}`);
            }
        }
    }
    #positionTimeRangeOverlay(overlay, element) {
        // Time ranges span both charts, it doesn't matter which one we pass here.
        // It's used to get the width of the container, and both charts have the
        // same width.
        const leftEdgePixel = this.#xPixelForMicroSeconds('main', overlay.bounds.min);
        const rightEdgePixel = this.#xPixelForMicroSeconds('main', overlay.bounds.max);
        if (leftEdgePixel === null || rightEdgePixel === null) {
            return;
        }
        const rangeWidth = rightEdgePixel - leftEdgePixel;
        element.style.left = `${leftEdgePixel}px`;
        element.style.width = `${rangeWidth}px`;
    }
    /**
     * Positions an EntrySelected overlay. As we extend the list of overlays,
     * some of the code in here around positioning may be re-used elsewhere.
     * @param overlay - the EntrySelected overlay that we need to position.
     * @param element - the DOM element representing the overlay
     */
    #positionEntrySelectedOverlay(overlay, element) {
        const chartName = this.#chartForOverlayEntry(overlay.entry);
        let x = this.xPixelForEventOnChart(overlay.entry);
        let y = this.yPixelForEventOnChart(overlay.entry);
        if (x === null || y === null) {
            return;
        }
        const { endTime, duration } = this.#timingsForOverlayEntry(overlay.entry);
        const endX = this.#xPixelForMicroSeconds(chartName, endTime);
        if (endX === null) {
            return;
        }
        const totalHeight = this.pixelHeightForEventOnChart(overlay.entry) ?? 0;
        // We might modify the height we use when drawing the overlay, hence copying the totalHeight.
        let height = totalHeight;
        if (height === null) {
            return;
        }
        // The width of the overlay is by default the width of the entry. However
        // we modify that for instant events like LCP markers, and also ensure a
        // minimum width.
        let widthPixels = endX - x;
        if (!duration) {
            // No duration = instant event, so we check in case it's a marker.
            const provider = chartName === 'main' ? this.#charts.mainProvider : this.#charts.networkProvider;
            const chart = chartName === 'main' ? this.#charts.mainChart : this.#charts.networkChart;
            // It could be a marker event, in which case we need to know the
            // exact position the marker was rendered. This is because markers
            // which have the same timestamp are rendered next to each other, so
            // the timestamp is not necessarily exactly where the marker was
            // rendered.
            const index = provider.indexForEvent(overlay.entry);
            const markerPixels = chart.getMarkerPixelsForEntryIndex(index ?? -1);
            if (markerPixels) {
                x = markerPixels.x;
                widthPixels = markerPixels.width;
            }
        }
        // The entry selected overlay is always at least 2px wide.
        const finalWidth = Math.max(2, widthPixels);
        element.style.width = `${finalWidth}px`;
        // If the event is on the main chart, we need to adjust its selected border
        // if the event is cut off the top of the screen, because we need to ensure
        // that it does not overlap the resize element. Unfortunately we cannot
        // z-index our way out of this, so instead we calculate if the event is cut
        // off, and if it is, we draw the partial selected outline and do not draw
        // the top border, making it appear like it is going behind the resizer.
        // We don't need to worry about it going off the bottom, because in that
        // case we don't draw the overlay anyway.
        if (chartName === 'main') {
            const chartTopPadding = this.#networkChartOffsetHeight();
            // We now calculate the available height: if the entry is cut off we don't
            // show the border for the part that is cut off.
            const cutOffTop = y < chartTopPadding;
            height = cutOffTop ? Math.abs(y + height - chartTopPadding) : height;
            element.classList.toggle('cut-off-top', cutOffTop);
            if (cutOffTop) {
                // Adjust the y position: we need to move it down from the top Y
                // position to the Y position of the first visible pixel. The
                // adjustment is totalHeight - height because if the totalHeight is 17,
                // and the visibleHeight is 5, we need to draw the overay at 17-5=12px
                // vertically from the top of the event.
                y = y + totalHeight - height;
            }
        }
        else {
            // If the event is on the network chart, we use the same logic as above
            // for the main chart, but to check if the event is cut off the bottom of
            // the network track and only part of the overlay is visible.
            // We don't need to worry about the even going off the top of the panel
            // as we can show the full overlay and it gets cut off by the minimap UI.
            const networkHeight = this.#dimensions.charts.network?.heightPixels ?? 0;
            const lastVisibleY = y + totalHeight;
            const cutOffBottom = lastVisibleY > networkHeight;
            element.classList.toggle('cut-off-bottom', cutOffBottom);
            if (cutOffBottom) {
                // Adjust the height of the overlay to be the amount of visible pixels.
                height = networkHeight - y;
            }
        }
        element.style.height = `${height}px`;
        element.style.top = `${y}px`;
        element.style.left = `${x}px`;
    }
    #createElementForNewOverlay(overlay) {
        const div = document.createElement('div');
        div.classList.add('overlay-item', `overlay-type-${overlay.type}`);
        if (overlay.type === 'TIME_RANGE') {
            const component = new Components.TimeRangeOverlay.TimeRangeOverlay();
            component.duration = overlay.showDuration ? overlay.bounds.range : null;
            component.label = overlay.label;
            component.canvasRect = this.#charts.mainChart.canvasBoundingClientRect();
            div.appendChild(component);
        }
        return div;
    }
    /**
     * Some of the HTML elements for overlays might need updating between each render
     * (for example, if a time range has changed, we update its duration text)
     */
    #updateOverlayElementIfRequired(overlay, element) {
        switch (overlay.type) {
            case 'ENTRY_SELECTED':
                // Nothing to do here.
                break;
            case 'TIME_RANGE': {
                const component = element.querySelector('devtools-time-range-overlay');
                if (component) {
                    component.duration = overlay.showDuration ? overlay.bounds.range : null;
                    component.label = overlay.label;
                    component.canvasRect = this.#charts.mainChart.canvasBoundingClientRect();
                }
                break;
            }
            default:
                Platform.TypeScriptUtilities.assertNever(overlay, `Unexpected overlay ${overlay}`);
        }
    }
    /**
     * @returns true if the entry is visible on chart, which means that both
     * horizontally and vertically it is at least partially in view.
     */
    entryIsVisibleOnChart(entry) {
        const verticallyVisible = this.#entryIsVerticallyVisibleOnChart(entry);
        const horiziontallyVisible = this.#entryIsHorizontallyVisibleOnChart(entry);
        return verticallyVisible && horiziontallyVisible;
    }
    /**
     * Calculates if an entry is visible horizontally. This is easy because we
     * don't have to consider any pixels and can instead check that its start and
     * end times intersect with the visible window.
     */
    #entryIsHorizontallyVisibleOnChart(entry) {
        if (this.#dimensions.trace.visibleWindow === null) {
            return false;
        }
        const { startTime, endTime } = this.#timingsForOverlayEntry(entry);
        const { min: visibleMin, max: visibleMax } = this.#dimensions.trace.visibleWindow;
        // The event is visible if
        // 1. Its endTime is within the visible window
        // OR
        // 2. Its startTime is within the visible window
        // OR
        // 3. Its startTime is less than the visible window, and its endTime is
        // greater than it. This means that the event spans the entire visible
        // window but starts and ends outside of it.
        // If none of these cases are true, the event must be off screen.
        // 1. End time is within the visible window.
        if (endTime >= visibleMin && endTime <= visibleMax) {
            return true;
        }
        // 2. Start time is within the visible window.
        if (startTime >= visibleMin && startTime <= visibleMax) {
            return true;
        }
        // 3. Start time is before the visible window and end time is after.
        if (startTime <= visibleMin && endTime >= visibleMax) {
            return true;
        }
        return false;
    }
    /**
     * Calculate if an entry is visible vertically on the chart. A bit fiddly as
     * we have to figure out its pixel offset and go on that. Unlike horizontal
     * visibility, we can't work soley from its microsecond values.
     */
    #entryIsVerticallyVisibleOnChart(entry) {
        const chartName = this.#chartForOverlayEntry(entry);
        const y = this.yPixelForEventOnChart(entry);
        if (y === null) {
            return false;
        }
        const eventHeight = this.pixelHeightForEventOnChart(entry);
        if (!eventHeight) {
            return false;
        }
        if (chartName === 'main') {
            if (!this.#dimensions.charts.main?.heightPixels) {
                // Shouldn't happen, but if the main chart has no height, nothing on it is visible.
                return false;
            }
            // The yPixelForEventOnChart method returns the y pixel including an adjustment for the network track.
            // To see if an entry on the main flame chart is visible, we can check
            // its y value without the network track adjustment. If it is < 0, then
            // it's off the top of the screen.
            //
            const yWithoutNetwork = y - this.#networkChartOffsetHeight();
            // Check if the y position + the height is less than 0. We add height so
            // that we correctly consider an event only partially scrolled off to be
            // visible.
            if (yWithoutNetwork + eventHeight < 0) {
                return false;
            }
            if (yWithoutNetwork > this.#dimensions.charts.main.heightPixels) {
                // The event is off the bottom of the screen.
                return false;
            }
        }
        if (chartName === 'network') {
            if (!this.#dimensions.charts.network) {
                // The network chart can be hidden if there are no requests in the trace.
                return false;
            }
            if (y <= -14) {
                // Weird value, but the network chart has the header row with
                // timestamps on it: events stay visible behind those timestamps, so we
                // want any overlays to treat themselves as visible too.
                return false;
            }
            if (y > this.#dimensions.charts.network.heightPixels ?? 0) {
                // The event is off the bottom of the network chart.
                return false;
            }
        }
        // If we got here, none of the conditions to mark an event as invisible got
        // triggered, so the event must be visible.
        return true;
    }
    /**
     * Calculate the X pixel position for an event on the timeline.
     * @param chartName - the chart that the event is on. It is expected that both
     * charts have the same width so this doesn't make a difference - but it might
     * in the future if the UI changes, hence asking for it.
     *
     * @param event - the trace event you want to get the pixel position of
     */
    xPixelForEventOnChart(event) {
        const chartName = this.#chartForOverlayEntry(event);
        const { startTime } = this.#timingsForOverlayEntry(event);
        return this.#xPixelForMicroSeconds(chartName, startTime);
    }
    /**
     * Calculate the xPixel for a given timestamp. To do this we calculate how
     * far in microseconds from the left of the visible window an event is, and
     * divide that by the total time span. This gives us a fraction representing
     * how far along the timeline the event is. We can then multiply that by the
     * width of the canvas to get its pixel position.
     */
    #xPixelForMicroSeconds(chart, timestamp) {
        if (this.#dimensions.trace.visibleWindow === null) {
            console.error('Cannot calculate xPixel without visible trace window.');
            return null;
        }
        const canvasWidthPixels = this.#dimensions.charts[chart]?.widthPixels ?? null;
        if (!canvasWidthPixels) {
            console.error(`Cannot calculate xPixel without ${chart} dimensions.`);
            return null;
        }
        const timeFromLeft = timestamp - this.#dimensions.trace.visibleWindow.min;
        const totalTimeSpan = this.#dimensions.trace.visibleWindow.range;
        return Math.floor(timeFromLeft / totalTimeSpan * canvasWidthPixels);
    }
    /**
     * Calculate the Y pixel position for the event on the timeline relative to
     * the entire window.
     * This means if the event is in the main flame chart and below the network,
     * we add the height of the network chart to the Y value to position it
     * correctly.
     * This can return null if any data waas missing, or if the event is not
     * visible (if the level it's on is hidden because the track is collapsed,
     * for example)
     */
    yPixelForEventOnChart(event) {
        const chartName = this.#chartForOverlayEntry(event);
        const chart = chartName === 'main' ? this.#charts.mainChart : this.#charts.networkChart;
        const provider = chartName === 'main' ? this.#charts.mainProvider : this.#charts.networkProvider;
        const indexForEntry = provider.indexForEvent(event);
        if (typeof indexForEntry !== 'number') {
            return null;
        }
        const timelineData = provider.timelineData();
        if (timelineData === null) {
            return null;
        }
        const level = timelineData.entryLevels.at(indexForEntry);
        if (typeof level === 'undefined') {
            return null;
        }
        if (!chart.levelIsVisible(level)) {
            return null;
        }
        const pixelOffsetForLevel = chart.levelToOffset(level);
        // Now we have the offset for the level, we need to adjust it by the user's scroll offset.
        let pixelAdjustedForScroll = pixelOffsetForLevel - (this.#dimensions.charts[chartName]?.scrollOffsetPixels ?? 0);
        // Now if the event is in the main chart, we need to pad its Y position
        // down by the height of the network chart + the network resize element.
        if (chartName === 'main') {
            pixelAdjustedForScroll += this.#networkChartOffsetHeight();
        }
        return pixelAdjustedForScroll;
    }
    /**
     * Calculate the height of the event on the timeline.
     */
    pixelHeightForEventOnChart(event) {
        const chartName = this.#chartForOverlayEntry(event);
        const chart = chartName === 'main' ? this.#charts.mainChart : this.#charts.networkChart;
        const provider = chartName === 'main' ? this.#charts.mainProvider : this.#charts.networkProvider;
        const indexForEntry = provider.indexForEvent(event);
        if (typeof indexForEntry !== 'number') {
            return null;
        }
        const timelineData = provider.timelineData();
        if (timelineData === null) {
            return null;
        }
        const level = timelineData.entryLevels.at(indexForEntry);
        if (typeof level === 'undefined') {
            return null;
        }
        return chart.levelHeight(level);
    }
    /**
     * Calculate the height of the network chart. If the network chart has
     * height, we also allow for the size of the resize handle shown between the
     * two charts.
     *
     * Note that it is possible for the chart to have 0 height if the user is
     * looking at a trace with no network requests.
     */
    #networkChartOffsetHeight() {
        if (this.#dimensions.charts.network === null) {
            return 0;
        }
        if (this.#dimensions.charts.network.heightPixels === 0) {
            return 0;
        }
        // At this point we know the network track exists and has height. But we
        // need to check if it is collapsed, because if it is collapsed there is no
        // resizer shown.
        if (this.#dimensions.charts.network.allGroupsCollapsed) {
            return this.#dimensions.charts.network.heightPixels;
        }
        return this.#dimensions.charts.network.heightPixels + NETWORK_RESIZE_ELEM_HEIGHT_PX;
    }
}
//# sourceMappingURL=Overlays.js.map