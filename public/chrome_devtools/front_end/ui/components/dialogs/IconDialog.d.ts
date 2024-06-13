import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import { type DialogHorizontalAlignment, type DialogVerticalPosition } from './Dialog.js';
declare global {
    interface HTMLElementTagNameMap {
        'devtools-icon-dialog': IconDialog;
    }
}
export declare class ShowDialog extends Event {
    static readonly eventName = "showdialog";
    constructor();
}
export interface IconDialogData {
    iconData: IconButton.Icon.IconData;
    closeButton: boolean;
    position: DialogVerticalPosition;
    horizontalAlignment: DialogHorizontalAlignment;
    closeOnESC: boolean;
    closeOnScroll: boolean;
}
export declare class IconDialog extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: IconDialogData);
}
