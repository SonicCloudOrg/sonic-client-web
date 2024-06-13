import { type DeleteMemoryHighlightEvent } from './LinearMemoryHighlightChipList.js';
import { type HighlightInfo } from './LinearMemoryViewerUtils.js';
import { Endianness, type ValueType, type ValueTypeMode } from './ValueInterpreterDisplayUtils.js';
export interface LinearMemoryInspectorData {
    memory: Uint8Array;
    address: number;
    memoryOffset: number;
    outerMemoryLength: number;
    valueTypes?: Set<ValueType>;
    valueTypeModes?: Map<ValueType, ValueTypeMode>;
    endianness?: Endianness;
    highlightInfo?: HighlightInfo;
}
export type Settings = {
    valueTypes: Set<ValueType>;
    modes: Map<ValueType, ValueTypeMode>;
    endianness: Endianness;
};
export declare class MemoryRequestEvent extends Event {
    static readonly eventName = "memoryrequest";
    data: {
        start: number;
        end: number;
        address: number;
    };
    constructor(start: number, end: number, address: number);
}
export declare class AddressChangedEvent extends Event {
    static readonly eventName = "addresschanged";
    data: number;
    constructor(address: number);
}
export declare class SettingsChangedEvent extends Event {
    static readonly eventName = "settingschanged";
    data: Settings;
    constructor(settings: Settings);
}
export declare class LinearMemoryInspector extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: LinearMemoryInspectorData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-linear-memory-inspector-inspector': LinearMemoryInspector;
    }
    interface HTMLElementEventMap {
        'memoryrequest': MemoryRequestEvent;
        'addresschanged': AddressChangedEvent;
        'settingschanged': SettingsChangedEvent;
        'deletememoryhighlight': DeleteMemoryHighlightEvent;
    }
}
