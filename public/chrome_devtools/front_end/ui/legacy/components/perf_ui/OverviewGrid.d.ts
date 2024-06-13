import * as Common from '../../../../core/common/common.js';
import { type Calculator } from './TimelineGrid.js';
export declare class OverviewGrid {
    element: HTMLDivElement;
    private readonly grid;
    private readonly window;
    constructor(prefix: string, calculator?: Calculator);
    enableCreateBreadcrumbsButton(): HTMLElement;
    set showingScreenshots(isShowing: boolean);
    clientWidth(): number;
    updateDividers(calculator: Calculator): void;
    addEventDividers(dividers: Element[]): void;
    removeEventDividers(): void;
    reset(): void;
    windowLeft(): number;
    windowRight(): number;
    setWindow(left: number, right: number): void;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: Common.EventTarget.EventListener<EventTypes, T>, thisObject?: Object): Common.EventTarget.EventDescriptor;
    setClickHandler(clickHandler: ((arg0: Event) => boolean) | null): void;
    zoom(zoomFactor: number, referencePoint: number): void;
    setResizeEnabled(enabled: boolean): void;
}
export declare const MinSelectableSize = 14;
export declare const WindowScrollSpeedFactor = 0.3;
export declare const ResizerOffset = 5;
export declare const OffsetFromWindowEnds = 10;
export declare class Window extends Common.ObjectWrapper.ObjectWrapper<EventTypes> {
    #private;
    private parentElement;
    private calculator;
    private leftResizeElement;
    private rightResizeElement;
    private leftCurtainElement;
    private rightCurtainElement;
    private breadcrumbButtonContainerElement;
    private createBreadcrumbButton;
    private curtainsRange?;
    private breadcrumbZoomIcon?;
    private overviewWindowSelector;
    private offsetLeft;
    private dragStartPoint;
    private dragStartLeft;
    private dragStartRight;
    windowLeft?: number;
    windowRight?: number;
    private enabled?;
    private clickHandler?;
    private resizerParentOffsetLeft?;
    constructor(parentElement: Element, dividersLabelBarElement?: Element, calculator?: Calculator);
    enableCreateBreadcrumbsButton(): HTMLElement;
    set showingScreenshots(isShowing: boolean);
    private onResizerClicked;
    private onRightResizeElementFocused;
    reset(): void;
    setEnabled(enabled: boolean): void;
    setClickHandler(clickHandler: ((arg0: Event) => boolean) | null): void;
    private resizerElementStartDragging;
    private leftResizeElementDragging;
    private rightResizeElementDragging;
    private handleKeyboardResizing;
    private getNewResizerPosition;
    private startWindowSelectorDragging;
    private windowSelectorDragging;
    private endWindowSelectorDragging;
    private startWindowDragging;
    private windowDragging;
    private resizeWindowLeft;
    private resizeWindowRight;
    private resizeWindowMaximum;
    private getRawSliderValue;
    private updateResizeElementPositionValue;
    private updateResizeElementPositionLabels;
    private updateResizeElementPercentageLabels;
    private calculateWindowPosition;
    setWindow(windowLeft: number, windowRight: number): void;
    private updateCurtains;
    private toggleZoomButtonDisplay;
    private getWindowRange;
    private setWindowPosition;
    private onMouseWheel;
    zoom(factor: number, reference: number): void;
}
export declare const enum Events {
    WindowChanged = "WindowChanged",
    WindowChangedWithPosition = "WindowChangedWithPosition",
    BreadcrumbAdded = "BreadcrumbAdded"
}
export interface WindowChangedWithPositionEvent {
    rawStartValue: number;
    rawEndValue: number;
}
export type EventTypes = {
    [Events.WindowChanged]: void;
    [Events.BreadcrumbAdded]: WindowChangedWithPositionEvent;
    [Events.WindowChangedWithPosition]: WindowChangedWithPositionEvent;
};
export declare class WindowSelector {
    private startPosition;
    private width;
    private windowSelector;
    constructor(parent: Element, position: number);
    close(position: number): {
        start: number;
        end: number;
    };
    updatePosition(position: number): void;
}
