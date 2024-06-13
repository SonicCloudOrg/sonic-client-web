/*
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
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as TraceEngine from '../../../../models/trace/trace.js';
import * as IconButton from '../../../components/icon_button/icon_button.js';
import * as UI from '../../legacy.js';
import * as ThemeSupport from '../../theme_support/theme_support.js';
import overviewGridStyles from './overviewGrid.css.legacy.js';
import { TimelineGrid } from './TimelineGrid.js';
const UIStrings = {
    /**
     *@description Label for the window for Overview grids
     */
    overviewGridWindow: 'Overview grid window',
    /**
     *@description Label for left window resizer for Overview grids
     */
    leftResizer: 'Left Resizer',
    /**
     *@description Label for right window resizer for Overview grids
     */
    rightResizer: 'Right Resizer',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/perf_ui/OverviewGrid.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class OverviewGrid {
    element;
    grid;
    window;
    constructor(prefix, calculator) {
        this.element = document.createElement('div');
        this.element.id = prefix + '-overview-container';
        this.grid = new TimelineGrid();
        this.grid.element.id = prefix + '-overview-grid';
        this.grid.setScrollTop(0);
        this.element.appendChild(this.grid.element);
        this.window = new Window(this.element, this.grid.dividersLabelBarElement, calculator);
    }
    enableCreateBreadcrumbsButton() {
        return this.window.enableCreateBreadcrumbsButton();
    }
    set showingScreenshots(isShowing) {
        this.window.showingScreenshots = isShowing;
    }
    clientWidth() {
        return this.element.clientWidth;
    }
    updateDividers(calculator) {
        this.grid.updateDividers(calculator);
    }
    addEventDividers(dividers) {
        this.grid.addEventDividers(dividers);
    }
    removeEventDividers() {
        this.grid.removeEventDividers();
    }
    reset() {
        this.window.reset();
    }
    windowLeft() {
        return this.window.windowLeft || 0;
    }
    windowRight() {
        return this.window.windowRight || 0;
    }
    setWindow(left, right) {
        this.window.setWindow(left, right);
    }
    addEventListener(eventType, listener, thisObject) {
        return this.window.addEventListener(eventType, listener, thisObject);
    }
    setClickHandler(clickHandler) {
        this.window.setClickHandler(clickHandler);
    }
    zoom(zoomFactor, referencePoint) {
        this.window.zoom(zoomFactor, referencePoint);
    }
    setResizeEnabled(enabled) {
        this.window.setEnabled(enabled);
    }
}
export const MinSelectableSize = 14;
export const WindowScrollSpeedFactor = .3;
export const ResizerOffset = 5;
export const OffsetFromWindowEnds = 10;
export class Window extends Common.ObjectWrapper.ObjectWrapper {
    parentElement;
    calculator;
    leftResizeElement;
    rightResizeElement;
    leftCurtainElement;
    rightCurtainElement;
    breadcrumbButtonContainerElement;
    createBreadcrumbButton;
    curtainsRange;
    breadcrumbZoomIcon;
    overviewWindowSelector;
    offsetLeft;
    dragStartPoint;
    dragStartLeft;
    dragStartRight;
    windowLeft;
    windowRight;
    enabled;
    clickHandler;
    resizerParentOffsetLeft;
    #breadcrumbsEnabled = false;
    #mouseOverGridOverview = false;
    constructor(parentElement, dividersLabelBarElement, calculator) {
        super();
        this.parentElement = parentElement;
        this.parentElement.classList.add('parent-element');
        UI.ARIAUtils.markAsGroup(this.parentElement);
        this.calculator = calculator;
        UI.ARIAUtils.setLabel(this.parentElement, i18nString(UIStrings.overviewGridWindow));
        UI.UIUtils.installDragHandle(this.parentElement, this.startWindowSelectorDragging.bind(this), this.windowSelectorDragging.bind(this), this.endWindowSelectorDragging.bind(this), 'text', null);
        if (dividersLabelBarElement) {
            UI.UIUtils.installDragHandle(dividersLabelBarElement, this.startWindowDragging.bind(this), this.windowDragging.bind(this), null, '-webkit-grabbing', '-webkit-grab');
        }
        this.parentElement.addEventListener('wheel', this.onMouseWheel.bind(this), true);
        this.parentElement.addEventListener('dblclick', this.resizeWindowMaximum.bind(this), true);
        ThemeSupport.ThemeSupport.instance().appendStyle(this.parentElement, overviewGridStyles);
        this.leftResizeElement = parentElement.createChild('div', 'overview-grid-window-resizer');
        UI.UIUtils.installDragHandle(this.leftResizeElement, this.resizerElementStartDragging.bind(this), this.leftResizeElementDragging.bind(this), null, 'ew-resize');
        this.rightResizeElement = parentElement.createChild('div', 'overview-grid-window-resizer');
        UI.UIUtils.installDragHandle(this.rightResizeElement, this.resizerElementStartDragging.bind(this), this.rightResizeElementDragging.bind(this), null, 'ew-resize');
        UI.ARIAUtils.setLabel(this.leftResizeElement, i18nString(UIStrings.leftResizer));
        UI.ARIAUtils.markAsSlider(this.leftResizeElement);
        const leftKeyDown = (event) => this.handleKeyboardResizing(event, false);
        this.leftResizeElement.addEventListener('keydown', leftKeyDown);
        this.leftResizeElement.addEventListener('click', this.onResizerClicked);
        UI.ARIAUtils.setLabel(this.rightResizeElement, i18nString(UIStrings.rightResizer));
        UI.ARIAUtils.markAsSlider(this.rightResizeElement);
        const rightKeyDown = (event) => this.handleKeyboardResizing(event, true);
        this.rightResizeElement.addEventListener('keydown', rightKeyDown);
        this.rightResizeElement.addEventListener('focus', this.onRightResizeElementFocused.bind(this));
        this.rightResizeElement.addEventListener('click', this.onResizerClicked);
        this.leftCurtainElement = parentElement.createChild('div', 'window-curtain-left');
        this.rightCurtainElement = parentElement.createChild('div', 'window-curtain-right');
        this.breadcrumbButtonContainerElement =
            parentElement.createChild('div', 'create-breadcrumb-button-container');
        this.createBreadcrumbButton =
            this.breadcrumbButtonContainerElement.createChild('div', 'create-breadcrumb-button');
        this.reset();
    }
    enableCreateBreadcrumbsButton() {
        this.curtainsRange = this.createBreadcrumbButton.createChild('div');
        this.breadcrumbZoomIcon = new IconButton.Icon.Icon();
        this.breadcrumbZoomIcon.data = {
            iconName: 'zoom-in',
            color: 'var(--icon-default)',
            width: '20px',
            height: '20px',
        };
        this.createBreadcrumbButton.appendChild(this.breadcrumbZoomIcon);
        this.createBreadcrumbButton.addEventListener('click', () => {
            this.#createBreadcrumb();
        });
        this.#breadcrumbsEnabled = true;
        this.#changeBreadcrumbButtonVisibilityOnInteraction(this.parentElement);
        this.#changeBreadcrumbButtonVisibilityOnInteraction(this.rightResizeElement);
        this.#changeBreadcrumbButtonVisibilityOnInteraction(this.leftResizeElement);
        return this.breadcrumbButtonContainerElement;
    }
    set showingScreenshots(isShowing) {
        this.breadcrumbButtonContainerElement.classList.toggle('with-screenshots', isShowing);
    }
    #changeBreadcrumbButtonVisibilityOnInteraction(element) {
        if (!this.#breadcrumbsEnabled) {
            return;
        }
        element.addEventListener('mouseover', () => {
            if ((this.windowLeft ?? 0) <= 0 && (this.windowRight ?? 1) >= 1) {
                this.breadcrumbButtonContainerElement.classList.toggle('is-breadcrumb-button-visible', false);
                this.#mouseOverGridOverview = false;
            }
            else {
                this.breadcrumbButtonContainerElement.classList.toggle('is-breadcrumb-button-visible', true);
                this.#mouseOverGridOverview = true;
            }
        });
        element.addEventListener('mouseout', () => {
            this.breadcrumbButtonContainerElement.classList.toggle('is-breadcrumb-button-visible', false);
            this.#mouseOverGridOverview = false;
        });
    }
    onResizerClicked(event) {
        if (event.target) {
            event.target.focus();
        }
    }
    onRightResizeElementFocused() {
        // To prevent browser focus from scrolling the element into view and shifting the contents of the strip
        this.parentElement.scrollLeft = 0;
    }
    reset() {
        this.windowLeft = 0.0;
        this.windowRight = 1.0;
        this.setEnabled(true);
        this.updateCurtains();
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        this.rightResizeElement.tabIndex = enabled ? 0 : -1;
        this.leftResizeElement.tabIndex = enabled ? 0 : -1;
    }
    setClickHandler(clickHandler) {
        this.clickHandler = clickHandler;
    }
    resizerElementStartDragging(event) {
        const mouseEvent = event;
        const target = event.target;
        if (!this.enabled) {
            return false;
        }
        this.resizerParentOffsetLeft = mouseEvent.pageX - mouseEvent.offsetX - target.offsetLeft;
        event.stopPropagation();
        return true;
    }
    leftResizeElementDragging(event) {
        const mouseEvent = event;
        this.resizeWindowLeft(mouseEvent.pageX - (this.resizerParentOffsetLeft || 0));
        event.preventDefault();
    }
    rightResizeElementDragging(event) {
        const mouseEvent = event;
        this.resizeWindowRight(mouseEvent.pageX - (this.resizerParentOffsetLeft || 0));
        event.preventDefault();
    }
    handleKeyboardResizing(event, moveRightResizer) {
        const keyboardEvent = event;
        const target = event.target;
        let increment = false;
        if (keyboardEvent.key === 'ArrowLeft' || keyboardEvent.key === 'ArrowRight') {
            if (keyboardEvent.key === 'ArrowRight') {
                increment = true;
            }
            const newPos = this.getNewResizerPosition(target.offsetLeft, increment, keyboardEvent.ctrlKey);
            if (moveRightResizer) {
                this.resizeWindowRight(newPos);
            }
            else {
                this.resizeWindowLeft(newPos);
            }
            event.consume(true);
        }
    }
    getNewResizerPosition(offset, increment, ctrlPressed) {
        let newPos;
        // We shift by 10px if the ctrlKey is pressed and 2 otherwise.  1px shifts result in noOp due to rounding in updateCurtains
        let pixelsToShift = ctrlPressed ? 10 : 2;
        pixelsToShift = increment ? pixelsToShift : -Math.abs(pixelsToShift);
        const offsetLeft = offset + ResizerOffset;
        newPos = offsetLeft + pixelsToShift;
        if (increment && newPos < OffsetFromWindowEnds) {
            // When incrementing, snap to the window offset value (10px) if the new position is between 0px and 10px
            newPos = OffsetFromWindowEnds;
        }
        else if (!increment && newPos > this.parentElement.clientWidth - OffsetFromWindowEnds) {
            // When decrementing, snap to the window offset value (10px) from the rightmost side if the new position is within 10px from the end.
            newPos = this.parentElement.clientWidth - OffsetFromWindowEnds;
        }
        return newPos;
    }
    startWindowSelectorDragging(event) {
        if (!this.enabled) {
            return false;
        }
        const mouseEvent = event;
        this.offsetLeft = this.parentElement.getBoundingClientRect().left;
        const position = mouseEvent.x - this.offsetLeft;
        this.overviewWindowSelector = new WindowSelector(this.parentElement, position);
        return true;
    }
    windowSelectorDragging(event) {
        this.#mouseOverGridOverview = true;
        if (!this.overviewWindowSelector) {
            return;
        }
        const mouseEvent = event;
        this.overviewWindowSelector.updatePosition(mouseEvent.x - this.offsetLeft);
        event.preventDefault();
    }
    endWindowSelectorDragging(event) {
        if (!this.overviewWindowSelector) {
            return;
        }
        const mouseEvent = event;
        const window = this.overviewWindowSelector.close(mouseEvent.x - this.offsetLeft);
        // prevent selecting a window on clicking the minimap if breadcrumbs are enabled
        if (this.#breadcrumbsEnabled && window.start === window.end) {
            return;
        }
        delete this.overviewWindowSelector;
        const clickThreshold = 3;
        if (window.end - window.start < clickThreshold) {
            if (this.clickHandler && this.clickHandler.call(null, event)) {
                return;
            }
            const middle = window.end;
            window.start = Math.max(0, middle - MinSelectableSize / 2);
            window.end = Math.min(this.parentElement.clientWidth, middle + MinSelectableSize / 2);
        }
        else if (window.end - window.start < MinSelectableSize) {
            if (this.parentElement.clientWidth - window.end > MinSelectableSize) {
                window.end = window.start + MinSelectableSize;
            }
            else {
                window.start = window.end - MinSelectableSize;
            }
        }
        this.setWindowPosition(window.start, window.end);
    }
    startWindowDragging(event) {
        const mouseEvent = event;
        this.dragStartPoint = mouseEvent.pageX;
        this.dragStartLeft = this.windowLeft || 0;
        this.dragStartRight = this.windowRight || 0;
        event.stopPropagation();
        return true;
    }
    windowDragging(event) {
        this.#mouseOverGridOverview = true;
        if (this.#breadcrumbsEnabled) {
            this.breadcrumbButtonContainerElement.classList.toggle('is-breadcrumb-button-visible', true);
        }
        const mouseEvent = event;
        mouseEvent.preventDefault();
        let delta = (mouseEvent.pageX - this.dragStartPoint) / this.parentElement.clientWidth;
        if (this.dragStartLeft + delta < 0) {
            delta = -this.dragStartLeft;
        }
        if (this.dragStartRight + delta > 1) {
            delta = 1 - this.dragStartRight;
        }
        this.setWindow(this.dragStartLeft + delta, this.dragStartRight + delta);
    }
    resizeWindowLeft(start) {
        this.#mouseOverGridOverview = true;
        // Glue to edge.
        if (start < OffsetFromWindowEnds) {
            start = 0;
        }
        else if (start > this.rightResizeElement.offsetLeft - 4) {
            start = this.rightResizeElement.offsetLeft - 4;
        }
        this.setWindowPosition(start, null);
    }
    resizeWindowRight(end) {
        this.#mouseOverGridOverview = true;
        // Glue to edge.
        if (end > this.parentElement.clientWidth - OffsetFromWindowEnds) {
            end = this.parentElement.clientWidth;
        }
        else if (end < this.leftResizeElement.offsetLeft + MinSelectableSize) {
            end = this.leftResizeElement.offsetLeft + MinSelectableSize;
        }
        this.setWindowPosition(null, end);
    }
    resizeWindowMaximum() {
        this.setWindowPosition(0, this.parentElement.clientWidth);
    }
    getRawSliderValue(leftSlider) {
        if (!this.calculator) {
            throw new Error('No calculator to calculate boundaries');
        }
        const minimumValue = this.calculator.minimumBoundary();
        const valueSpan = this.calculator.maximumBoundary() - minimumValue;
        if (leftSlider) {
            return minimumValue + valueSpan * (this.windowLeft || 0);
        }
        return minimumValue + valueSpan * (this.windowRight || 0);
    }
    updateResizeElementPositionValue(leftValue, rightValue) {
        const roundedLeftValue = leftValue.toFixed(2);
        const roundedRightValue = rightValue.toFixed(2);
        UI.ARIAUtils.setAriaValueNow(this.leftResizeElement, roundedLeftValue);
        UI.ARIAUtils.setAriaValueNow(this.rightResizeElement, roundedRightValue);
        // Left and right sliders cannot be within 0.5% of each other (Range of AriaValueMin/Max/Now is from 0-100).
        const leftResizeCeiling = Number(roundedRightValue) - 0.5;
        const rightResizeFloor = Number(roundedLeftValue) + 0.5;
        UI.ARIAUtils.setAriaValueMinMax(this.leftResizeElement, '0', leftResizeCeiling.toString());
        UI.ARIAUtils.setAriaValueMinMax(this.rightResizeElement, rightResizeFloor.toString(), '100');
    }
    updateResizeElementPositionLabels() {
        if (!this.calculator) {
            return;
        }
        const startValue = this.calculator.formatValue(TraceEngine.Types.Timing.MilliSeconds(this.getRawSliderValue(/* leftSlider */ true)));
        const endValue = this.calculator.formatValue(TraceEngine.Types.Timing.MilliSeconds(this.getRawSliderValue(/* leftSlider */ false)));
        UI.ARIAUtils.setAriaValueText(this.leftResizeElement, String(startValue));
        UI.ARIAUtils.setAriaValueText(this.rightResizeElement, String(endValue));
    }
    updateResizeElementPercentageLabels(leftValue, rightValue) {
        UI.ARIAUtils.setAriaValueText(this.leftResizeElement, leftValue);
        UI.ARIAUtils.setAriaValueText(this.rightResizeElement, rightValue);
    }
    calculateWindowPosition() {
        return {
            rawStartValue: Number(this.getRawSliderValue(/* leftSlider */ true)),
            rawEndValue: Number(this.getRawSliderValue(/* leftSlider */ false)),
        };
    }
    setWindow(windowLeft, windowRight) {
        this.windowLeft = windowLeft;
        this.windowRight = windowRight;
        this.updateCurtains();
        if (this.calculator) {
            this.dispatchEventToListeners("WindowChangedWithPosition" /* Events.WindowChangedWithPosition */, this.calculateWindowPosition());
        }
        this.dispatchEventToListeners("WindowChanged" /* Events.WindowChanged */);
        this.#changeBreadcrumbButtonVisibility(windowLeft, windowRight);
    }
    // "Create breadcrumb" button is only visible when the window is set to
    // something other than the full range and mouse is hovering over the MiniMap
    #changeBreadcrumbButtonVisibility(windowLeft, windowRight) {
        if (!this.#breadcrumbsEnabled) {
            return;
        }
        if ((windowRight >= 1 && windowLeft <= 0) || !this.#mouseOverGridOverview) {
            this.breadcrumbButtonContainerElement.classList.toggle('is-breadcrumb-button-visible', false);
        }
        else {
            this.breadcrumbButtonContainerElement.classList.toggle('is-breadcrumb-button-visible', true);
        }
    }
    #createBreadcrumb() {
        this.dispatchEventToListeners("BreadcrumbAdded" /* Events.BreadcrumbAdded */, this.calculateWindowPosition());
    }
    updateCurtains() {
        const windowLeft = this.windowLeft || 0;
        const windowRight = this.windowRight || 0;
        let left = windowLeft;
        let right = windowRight;
        const width = right - left;
        // OverviewGrids that are instantiated before the parentElement is shown will have a parent element client width of 0 which throws off the 'factor' calculation
        if (this.parentElement.clientWidth !== 0) {
            // We allow actual time window to be arbitrarily small but don't want the UI window to be too small.
            const widthInPixels = width * this.parentElement.clientWidth;
            const minWidthInPixels = MinSelectableSize / 2;
            if (widthInPixels < minWidthInPixels) {
                const factor = minWidthInPixels / widthInPixels;
                left = ((windowRight + windowLeft) - width * factor) / 2;
                right = ((windowRight + windowLeft) + width * factor) / 2;
            }
        }
        const leftResizerPercLeftOffset = (100 * left);
        const rightResizerPercLeftOffset = (100 * right);
        const rightResizerPercRightOffset = (100 - (100 * right));
        const leftResizerPercLeftOffsetString = leftResizerPercLeftOffset + '%';
        const rightResizerPercLeftOffsetString = rightResizerPercLeftOffset + '%';
        this.leftResizeElement.style.left = leftResizerPercLeftOffsetString;
        this.rightResizeElement.style.left = rightResizerPercLeftOffsetString;
        this.leftCurtainElement.style.width = leftResizerPercLeftOffsetString;
        this.rightCurtainElement.style.width = rightResizerPercRightOffset + '%';
        this.breadcrumbButtonContainerElement.style.marginLeft =
            (leftResizerPercLeftOffset > 0) ? leftResizerPercLeftOffset + '%' : '0%';
        this.breadcrumbButtonContainerElement.style.marginRight =
            (rightResizerPercRightOffset > 0) ? rightResizerPercRightOffset + '%' : '0%';
        if (this.curtainsRange) {
            this.curtainsRange.textContent = this.getWindowRange().toFixed(0) + ' ms';
        }
        this.updateResizeElementPositionValue(leftResizerPercLeftOffset, rightResizerPercLeftOffset);
        if (this.calculator) {
            this.updateResizeElementPositionLabels();
        }
        else {
            this.updateResizeElementPercentageLabels(leftResizerPercLeftOffsetString, rightResizerPercLeftOffsetString);
        }
        this.toggleZoomButtonDisplay();
    }
    toggleZoomButtonDisplay() {
        if (this.breadcrumbZoomIcon) {
            // disable button that creates breadcrumbs and hide the zoom icon
            // when the selected window is smaller than 4.5 ms
            // 4.5 is rounded to 5 in the UI
            if (this.getWindowRange() < 4.5) {
                this.breadcrumbZoomIcon.style.display = 'none';
                this.breadcrumbButtonContainerElement.style.pointerEvents = 'none';
            }
            else {
                this.breadcrumbZoomIcon.style.display = 'flex';
                this.breadcrumbButtonContainerElement.style.pointerEvents = 'auto';
            }
        }
    }
    getWindowRange() {
        if (!this.calculator) {
            throw new Error('No calculator to calculate window range');
        }
        const left = (this.windowLeft && this.windowLeft > 0) ? this.windowLeft : 0;
        const right = (this.windowRight && this.windowRight < 1) ? this.windowRight : 1;
        return (this.calculator.boundarySpan() * (right - left));
    }
    setWindowPosition(start, end) {
        const clientWidth = this.parentElement.clientWidth;
        const windowLeft = typeof start === 'number' ? start / clientWidth : this.windowLeft;
        const windowRight = typeof end === 'number' ? end / clientWidth : this.windowRight;
        this.setWindow(windowLeft || 0, windowRight || 0);
    }
    onMouseWheel(event) {
        const wheelEvent = event;
        if (!this.enabled) {
            return;
        }
        if (wheelEvent.deltaY) {
            const zoomFactor = 1.1;
            const wheelZoomSpeed = 1 / 53;
            const reference = wheelEvent.offsetX / this.parentElement.clientWidth;
            this.zoom(Math.pow(zoomFactor, wheelEvent.deltaY * wheelZoomSpeed), reference);
        }
        if (wheelEvent.deltaX) {
            let offset = Math.round(wheelEvent.deltaX * WindowScrollSpeedFactor);
            const windowLeft = this.leftResizeElement.offsetLeft + ResizerOffset;
            const windowRight = this.rightResizeElement.offsetLeft + ResizerOffset;
            if (windowLeft - offset < 0) {
                offset = windowLeft;
            }
            if (windowRight - offset > this.parentElement.clientWidth) {
                offset = windowRight - this.parentElement.clientWidth;
            }
            this.setWindowPosition(windowLeft - offset, windowRight - offset);
            wheelEvent.preventDefault();
        }
    }
    zoom(factor, reference) {
        let left = this.windowLeft || 0;
        let right = this.windowRight || 0;
        const windowSize = right - left;
        let newWindowSize = factor * windowSize;
        if (newWindowSize > 1) {
            newWindowSize = 1;
            factor = newWindowSize / windowSize;
        }
        left = reference + (left - reference) * factor;
        left = Platform.NumberUtilities.clamp(left, 0, 1 - newWindowSize);
        right = reference + (right - reference) * factor;
        right = Platform.NumberUtilities.clamp(right, newWindowSize, 1);
        this.setWindow(left, right);
    }
}
export class WindowSelector {
    startPosition;
    width;
    windowSelector;
    constructor(parent, position) {
        this.startPosition = position;
        this.width = parent.offsetWidth;
        this.windowSelector = document.createElement('div');
        this.windowSelector.className = 'overview-grid-window-selector';
        this.windowSelector.style.left = this.startPosition + 'px';
        this.windowSelector.style.right = this.width - this.startPosition + 'px';
        parent.appendChild(this.windowSelector);
    }
    close(position) {
        position = Math.max(0, Math.min(position, this.width));
        this.windowSelector.remove();
        return this.startPosition < position ? { start: this.startPosition, end: position } :
            { start: position, end: this.startPosition };
    }
    updatePosition(position) {
        position = Math.max(0, Math.min(position, this.width));
        if (position < this.startPosition) {
            this.windowSelector.style.left = position + 'px';
            this.windowSelector.style.right = this.width - this.startPosition + 'px';
        }
        else {
            this.windowSelector.style.left = this.startPosition + 'px';
            this.windowSelector.style.right = this.width - position + 'px';
        }
    }
}
//# sourceMappingURL=OverviewGrid.js.map