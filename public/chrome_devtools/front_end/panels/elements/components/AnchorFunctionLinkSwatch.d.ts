import type * as SDK from '../../../core/sdk/sdk.js';
export type AnchorFunctionLinkSwatchData = {
    identifier?: string;
    anchorNode?: SDK.DOMModel.DOMNode;
    needsSpace?: boolean;
    onLinkActivate: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};
export declare class AnchorFunctionLinkSwatch extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor(data: AnchorFunctionLinkSwatchData);
    dataForTest(): AnchorFunctionLinkSwatchData;
    connectedCallback(): void;
    set data(data: AnchorFunctionLinkSwatchData);
    protected render(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-anchor-function-link-swatch': AnchorFunctionLinkSwatch;
    }
}
