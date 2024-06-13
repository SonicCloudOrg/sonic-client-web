import * as Common from '../../../../core/common/common.js';
import * as Platform from '../../../../core/platform/platform.js';
export declare const enum Events {
    ColorChanged = "colorChanged"
}
export interface EventTypes {
    [Events.ColorChanged]: {
        text: string;
    };
}
declare const ColorMixSwatch_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends Events.ColorChanged>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends Events.ColorChanged>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends Events.ColorChanged>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: Events.ColorChanged): boolean;
    dispatchEventToListeners<T_3 extends Events.ColorChanged>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & {
    new (): HTMLElement;
    prototype: HTMLElement;
};
export declare class ColorMixSwatch extends ColorMixSwatch_base {
    #private;
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    private readonly shadow;
    private colorMixText;
    private firstColorText;
    private secondColorText;
    constructor();
    get icon(): Element | null;
    mixedColor(): Common.Color.Color | null;
    setFirstColor(text: string): void;
    setSecondColor(text: string): void;
    setColorMixText(text: string): void;
    setRegisterPopoverCallback(callback: (swatch: ColorMixSwatch) => void): void;
    getText(): string;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-color-mix-swatch': ColorMixSwatch;
    }
}
export {};
