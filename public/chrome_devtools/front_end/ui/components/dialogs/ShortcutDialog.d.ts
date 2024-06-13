import type * as Platform from '../../../core/platform/platform.js';
declare global {
    interface HTMLElementTagNameMap {
        'devtools-shortcut-dialog': ShortcutDialog;
    }
}
export declare class ShowDialog extends Event {
    static readonly eventName = "showdialog";
    constructor();
}
export interface Shortcut {
    title: string | Platform.UIString.LocalizedString;
    bindings: string[];
}
export interface ShortcutDialogData {
    shortcuts: Shortcut[];
    open?: boolean;
}
export declare class ShortcutDialog extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: ShortcutDialogData);
}
