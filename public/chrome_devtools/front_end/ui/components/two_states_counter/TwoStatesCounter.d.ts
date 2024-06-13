export interface TwoStatesCounterData {
    active: number;
    inactive: number;
    width?: string;
    height?: string;
    activeTitle?: string;
    inactiveTitle?: string;
}
export declare class TwoStatesCounter extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: TwoStatesCounterData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-two-states-counter': TwoStatesCounter;
    }
}
