import type * as TraceEngine from '../../../models/trace/trace.js';
export declare class TimeRangeOverlay extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set canvasRect(rect: DOMRect | null);
    set duration(duration: TraceEngine.Types.Timing.MicroSeconds | null);
    set label(label: string);
    /**
     * We use this method after the overlay has been positioned in order to move
     * the label as required to keep it on screen.
     * If the label is off to the left or right, we fix it to that corner and
     * align the text so the label is visible as long as possible.
     */
    afterOverlayUpdate(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-time-range-overlay': TimeRangeOverlay;
    }
}
