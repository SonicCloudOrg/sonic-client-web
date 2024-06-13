declare global {
    interface HTMLElementTagNameMap {
        'devtools-timeline-section': TimelineSection;
    }
}
export interface TimelineSectionData {
    isFirstSection: boolean;
    isLastSection: boolean;
    isStartOfGroup: boolean;
    isEndOfGroup: boolean;
    isSelected: boolean;
}
export declare class TimelineSection extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    set data(data: TimelineSectionData);
    connectedCallback(): void;
}
