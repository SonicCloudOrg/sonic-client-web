declare global {
    interface HTMLElementTagNameMap {
        'devtools-split-view': SplitView;
    }
}
export declare class SplitView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    get horizontal(): boolean;
    set horizontal(horizontal: boolean);
}
