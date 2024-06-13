import * as WindowBoundsService from '../../../services/window_bounds/window_bounds.js';
export declare const CONNECTOR_HEIGHT = 10;
export declare const DIALOG_SIDE_PADDING = 5;
export declare const DIALOG_VERTICAL_PADDING = 3;
export declare const DIALOG_PADDING_FROM_WINDOW: number;
type DialogAnchor = HTMLElement | DOMRect | DOMPoint;
export declare const MODAL = "MODAL";
export type DialogOrigin = DialogAnchor | null | (() => DialogAnchor) | typeof MODAL;
export declare class Dialog extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    get showConnector(): boolean;
    set showConnector(showConnector: boolean);
    get origin(): DialogOrigin;
    set origin(origin: DialogOrigin);
    get position(): DialogVerticalPosition;
    set position(position: DialogVerticalPosition);
    get horizontalAlignment(): DialogHorizontalAlignment;
    set horizontalAlignment(alignment: DialogHorizontalAlignment);
    get windowBoundsService(): WindowBoundsService.WindowBoundsService.WindowBoundsService;
    set windowBoundsService(windowBoundsService: WindowBoundsService.WindowBoundsService.WindowBoundsService);
    get bestVerticalPosition(): DialogVerticalPosition | null;
    get bestHorizontalAlignment(): DialogHorizontalAlignment | null;
    get getConnectorCustomXPosition(): (() => number) | null;
    set getConnectorCustomXPosition(connectorXPosition: (() => number) | null);
    get dialogShownCallback(): (() => unknown) | null;
    get jslogContext(): string;
    set dialogShownCallback(dialogShownCallback: (() => unknown) | null);
    set closeOnESC(closeOnESC: boolean);
    set closeOnScroll(closeOnScroll: boolean);
    set jslogContext(jslogContext: string);
    connectedCallback(): void;
    disconnectedCallback(): void;
    getHitArea(): DOMRect;
    setDialogVisible(show: boolean): Promise<void>;
    getDialogBounds(): DOMRect;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-dialog': Dialog;
    }
}
export declare class PointerLeftDialogEvent extends Event {
    static readonly eventName = "pointerleftdialog";
    constructor();
}
export declare class ClickOutsideDialogEvent extends Event {
    static readonly eventName = "clickoutsidedialog";
    constructor();
}
export declare class ForcedDialogClose extends Event {
    static readonly eventName = "forceddialogclose";
    constructor();
}
export declare const enum DialogVerticalPosition {
    TOP = "top",
    BOTTOM = "bottom",
    AUTO = "auto"
}
export declare const enum DialogHorizontalAlignment {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
    AUTO = "auto"
}
export {};
