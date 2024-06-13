export declare class NavigateToSourceEvent extends Event {
    static readonly eventName = "onnavigatetosource";
    constructor();
}
export declare class ComputedStyleProperty extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set inherited(inherited: boolean);
    set traceable(traceable: boolean);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-computed-style-property': ComputedStyleProperty;
    }
}
