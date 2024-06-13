import * as LitHtml from '../../../ui/lit-html/lit-html.js';
declare const LitElement: typeof LitHtml.LitElement;
declare global {
    interface HTMLElementTagNameMap {
        'devtools-control-button': ControlButton;
    }
}
export declare class ControlButton extends LitElement {
    #private;
    static styles: CSSStyleSheet[];
    label: string;
    shape: string;
    disabled: boolean;
    constructor();
    protected render(): unknown;
}
export {};
