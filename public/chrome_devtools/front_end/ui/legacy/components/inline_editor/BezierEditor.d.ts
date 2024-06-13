import * as Common from '../../../../core/common/common.js';
import * as UI from '../../legacy.js';
import { AnimationTimingModel } from './AnimationTimingModel.js';
declare const BezierEditor_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends Events.BezierChanged>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends Events.BezierChanged>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends Events.BezierChanged>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: Events.BezierChanged): boolean;
    dispatchEventToListeners<T_3 extends Events.BezierChanged>(eventType: import("../../../../core/platform/TypescriptUtilities.js").NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class BezierEditor extends BezierEditor_base {
    private model;
    private previewElement;
    private readonly previewOnion;
    private readonly outerContainer;
    private selectedCategory;
    private readonly presetsContainer;
    private readonly presetUI;
    private readonly presetCategories;
    private animationTimingUI?;
    private readonly header;
    private label;
    private previewAnimation?;
    private debouncedStartPreviewAnimation;
    constructor(model: AnimationTimingModel);
    setModel(model: AnimationTimingModel): void;
    wasShown(): void;
    private onchange;
    private updateUI;
    private createCategory;
    private createPresetModifyIcon;
    private unselectPresets;
    private presetCategorySelected;
    private presetModifyClicked;
    private startPreviewAnimation;
}
export declare const enum Events {
    BezierChanged = "BezierChanged"
}
export type EventTypes = {
    [Events.BezierChanged]: string;
};
export declare const Presets: {
    name: string;
    value: string;
}[][];
export interface PresetCategory {
    presets: {
        name: string;
        value: string;
    }[];
    icon: Element;
    presetIndex: number;
}
export {};
