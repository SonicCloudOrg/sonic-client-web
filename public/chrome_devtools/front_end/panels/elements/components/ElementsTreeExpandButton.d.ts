export interface ElementsTreeExpandButtonData {
    clickHandler: (event?: Event) => void;
}
export declare class ElementsTreeExpandButton extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    set data(data: ElementsTreeExpandButtonData);
    connectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-elements-tree-expand-button': ElementsTreeExpandButton;
    }
}
