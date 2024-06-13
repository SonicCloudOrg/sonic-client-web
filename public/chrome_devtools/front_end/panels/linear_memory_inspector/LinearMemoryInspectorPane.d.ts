import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import { type LazyUint8Array } from './LinearMemoryInspectorController.js';
declare const LinearMemoryInspectorPane_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends Events.ViewClosed>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends Events.ViewClosed>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends Events.ViewClosed>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: Events.ViewClosed): boolean;
    dispatchEventToListeners<T_3 extends Events.ViewClosed>(eventType: import("../../core/platform/TypescriptUtilities.js").NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class LinearMemoryInspectorPane extends LinearMemoryInspectorPane_base {
    #private;
    constructor();
    static instance(): LinearMemoryInspectorPane;
    create(tabId: string, title: string, arrayWrapper: LazyUint8Array, address?: number): void;
    close(tabId: string): void;
    reveal(tabId: string, address?: number): void;
    refreshView(tabId: string): void;
}
export declare const enum Events {
    ViewClosed = "ViewClosed"
}
export type EventTypes = {
    [Events.ViewClosed]: string;
};
export {};
