export declare class LiveMetricsNextSteps extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    connectedCallback(): void;
}
export declare class LiveMetricsView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-live-metrics-view': LiveMetricsView;
        'devtools-live-metrics-next-steps': LiveMetricsNextSteps;
    }
}
