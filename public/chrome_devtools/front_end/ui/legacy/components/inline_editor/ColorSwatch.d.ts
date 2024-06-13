import * as Common from '../../../../core/common/common.js';
export declare class ColorChangedEvent extends Event {
    static readonly eventName = "colorchanged";
    data: {
        text: string;
    };
    constructor(text: string);
}
export declare class ClickEvent extends Event {
    static readonly eventName = "swatchclick";
    constructor();
}
export declare class ColorSwatch extends HTMLElement {
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    private readonly shadow;
    private tooltip;
    private text;
    private color;
    private format;
    private readonly;
    constructor();
    static isColorSwatch(element: Element): element is ColorSwatch;
    getReadonly(): boolean;
    setReadonly(readonly: boolean): void;
    getColor(): Common.Color.Color | null;
    getFormat(): Common.Color.Format | null;
    getText(): string | null;
    get anchorBox(): AnchorBox | null;
    /**
     * Render this swatch given a color object or text to be parsed as a color.
     * @param color The color object or string to use for this swatch.
     * @param formatOrUseUserSetting Either the format to be used as a string, or true to auto-detect the user-set format.
     * @param tooltip The tooltip to use on the swatch.
     */
    renderColor(color: Common.Color.Color | string, formatOrUseUserSetting?: string | boolean, tooltip?: string): void;
    private renderTextOnly;
    private render;
    private onClick;
    private consume;
    setFormat(format: Common.Color.Format): void;
    private showFormatPicker;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-color-swatch': ColorSwatch;
    }
    interface HTMLElementEventMap {
        [ColorChangedEvent.eventName]: ColorChangedEvent;
        [ClickEvent.eventName]: Event;
    }
}
