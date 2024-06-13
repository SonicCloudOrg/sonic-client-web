type SrgbOverlayProps = {
    hue: number;
    width: number;
    height: number;
};
export declare class SrgbOverlay extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    constructor();
    render({ hue, width, height }: SrgbOverlayProps): Promise<void>;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-spectrum-srgb-overlay': SrgbOverlay;
    }
}
export {};
