import * as Common from '../../../../core/common/common.js';
import * as TraceEngine from '../../../../models/trace/trace.js';
import * as UI from '../../legacy.js';
import { TimelineOverviewCalculator } from './TimelineOverviewCalculator.js';
declare const TimelineOverviewPane_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: import("../../../../core/platform/TypescriptUtilities.js").NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class TimelineOverviewPane extends TimelineOverviewPane_base {
    readonly overviewCalculator: TimelineOverviewCalculator;
    private readonly overviewGrid;
    private readonly cursorArea;
    private cursorElement;
    private overviewControls;
    private markers;
    private readonly overviewInfo;
    private readonly updateThrottler;
    private cursorEnabled;
    private cursorPosition;
    private lastWidth;
    private windowStartTime;
    private windowEndTime;
    private muteOnWindowChanged;
    constructor(prefix: string);
    enableCreateBreadcrumbsButton(): void;
    private onMouseMove;
    private buildOverviewInfo;
    private hideCursor;
    wasShown(): void;
    willHide(): void;
    onResize(): void;
    setOverviewControls(overviewControls: TimelineOverview[]): void;
    set showingScreenshots(isShowing: boolean);
    setBounds(minimumBoundary: TraceEngine.Types.Timing.MilliSeconds, maximumBoundary: TraceEngine.Types.Timing.MilliSeconds): void;
    setNavStartTimes(navStartTimes: readonly TraceEngine.Types.TraceEvents.TraceEventNavigationStart[]): void;
    scheduleUpdate(start?: TraceEngine.Types.Timing.MilliSeconds, end?: TraceEngine.Types.Timing.MilliSeconds): void;
    private update;
    setMarkers(markers: Map<number, Element>): void;
    getMarkers(): Map<number, Element>;
    private updateMarkers;
    reset(): void;
    private onClick;
    private onBreadcrumbAdded;
    private onWindowChanged;
    setWindowTimes(startTime: number, endTime: number): void;
    private updateWindow;
}
export declare const enum Events {
    OverviewPaneWindowChanged = "OverviewPaneWindowChanged",
    OverviewPaneBreadcrumbAdded = "OverviewPaneBreadcrumbAdded"
}
export interface OverviewPaneWindowChangedEvent {
    startTime: TraceEngine.Types.Timing.MilliSeconds;
    endTime: TraceEngine.Types.Timing.MilliSeconds;
}
export interface OverviewPaneBreadcrumbAddedEvent {
    startTime: TraceEngine.Types.Timing.MilliSeconds;
    endTime: TraceEngine.Types.Timing.MilliSeconds;
}
export type EventTypes = {
    [Events.OverviewPaneWindowChanged]: OverviewPaneWindowChangedEvent;
    [Events.OverviewPaneBreadcrumbAdded]: OverviewPaneBreadcrumbAddedEvent;
};
export interface TimelineOverview {
    show(parentElement: Element, insertBefore?: Element | null): void;
    update(start?: TraceEngine.Types.Timing.MilliSeconds, end?: TraceEngine.Types.Timing.MilliSeconds): void;
    dispose(): void;
    reset(): void;
    overviewInfoPromise(x: number): Promise<Element | null>;
    onClick(event: Event): boolean;
    setCalculator(calculator: TimelineOverviewCalculator): void;
}
export declare class TimelineOverviewBase extends UI.Widget.VBox implements TimelineOverview {
    private calculatorInternal;
    private canvas;
    private contextInternal;
    constructor();
    width(): number;
    height(): number;
    context(): CanvasRenderingContext2D;
    calculator(): TimelineOverviewCalculator | null;
    update(): void;
    dispose(): void;
    reset(): void;
    overviewInfoPromise(_x: number): Promise<Element | null>;
    setCalculator(calculator: TimelineOverviewCalculator): void;
    onClick(_event: Event): boolean;
    resetCanvas(): void;
    setCanvasSize(width: number, height: number): void;
}
export declare class OverviewInfo {
    private readonly anchorElement;
    private glassPane;
    private visible;
    private readonly element;
    constructor(anchor: Element);
    setContent(contentPromise: Promise<DocumentFragment>): Promise<void>;
    hide(): void;
}
export {};
