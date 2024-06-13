export interface EditableSpanData {
    value: string;
}
export declare class EditableSpan extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: EditableSpanData);
    get value(): string;
    set value(value: string);
    focus(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-editable-span': EditableSpan;
    }
}
