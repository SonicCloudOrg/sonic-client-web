import * as Common from '../../../../core/common/common.js';
import * as TraceEngine from '../../../../models/trace/trace.js';
import * as UI from '../../legacy.js';
declare const FilmStripView_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: import("../../../../core/platform/TypescriptUtilities.js").NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.HBox;
export declare class FilmStripView extends FilmStripView_base {
    #private;
    private statusLabel;
    private zeroTime;
    constructor();
    static setImageData(imageElement: HTMLImageElement, dataUri: string | null): void;
    setModel(filmStrip: TraceEngine.Extras.FilmStrip.Data): void;
    createFrameElement(frame: TraceEngine.Extras.FilmStrip.Frame): HTMLButtonElement;
    update(): void;
    private onMouseEvent;
    private onDoubleClick;
    reset(): void;
    setStatusText(text: string): void;
}
export declare const enum Events {
    FrameSelected = "FrameSelected",
    FrameEnter = "FrameEnter",
    FrameExit = "FrameExit"
}
export type EventTypes = {
    [Events.FrameSelected]: number;
    [Events.FrameEnter]: number;
    [Events.FrameExit]: number;
};
export declare class Dialog {
    #private;
    private fragment;
    private readonly widget;
    private index;
    private dialog;
    static fromFilmStrip(filmStrip: TraceEngine.Extras.FilmStrip.Data, selectedFrameIndex: number): Dialog;
    private constructor();
    hide(): void;
    private resize;
    private keyDown;
    private onPrevFrame;
    private onNextFrame;
    private onFirstFrame;
    private onLastFrame;
    private render;
}
export {};
