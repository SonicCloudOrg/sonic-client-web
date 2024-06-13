import { type CSSShadowModel } from './CSSShadowEditor.js';
export declare class BezierSwatch extends HTMLSpanElement {
    private readonly iconElementInternal;
    private textElement;
    constructor();
    static create(): BezierSwatch;
    bezierText(): string;
    setBezierText(text: string): void;
    hideText(hide: boolean): void;
    iconElement(): HTMLSpanElement;
    private static constructorInternal;
}
export declare class CSSShadowSwatch extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    constructor(model: CSSShadowModel);
    model(): CSSShadowModel;
    iconElement(): HTMLSpanElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'css-shadow-swatch': CSSShadowSwatch;
    }
}
