import type * as TraceEngine from '../../../models/trace/trace.js';
export declare class InteractionBreakdown extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set entry(entry: TraceEngine.Types.TraceEvents.SyntheticInteractionPair);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-interaction-breakdown': InteractionBreakdown;
    }
}
