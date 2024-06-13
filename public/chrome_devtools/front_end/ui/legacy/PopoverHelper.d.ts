import { GlassPane } from './GlassPane.js';
export declare class PopoverHelper {
    static createPopover: (jslogContext?: string) => GlassPane;
    private disableOnClick;
    private hasPadding;
    private getRequest;
    private scheduledRequest;
    private hidePopoverCallback;
    readonly container: Element;
    private showTimeout;
    private hideTimeout;
    private hidePopoverTimer;
    private showPopoverTimer;
    private readonly boundMouseDown;
    private readonly boundMouseMove;
    private readonly boundMouseOut;
    jslogContext?: string;
    constructor(container: Element, getRequest: (arg0: MouseEvent) => PopoverRequest | null, jslogContext?: string);
    setTimeout(showTimeout: number, hideTimeout?: number): void;
    setHasPadding(hasPadding: boolean): void;
    setDisableOnClick(disableOnClick: boolean): void;
    private eventInScheduledContent;
    private mouseDown;
    private mouseMove;
    private popoverMouseMove;
    private popoverMouseOut;
    private mouseOut;
    private startHidePopoverTimer;
    private startShowPopoverTimer;
    private stopShowPopoverTimer;
    isPopoverVisible(): boolean;
    hidePopover(): void;
    private hidePopoverInternal;
    private showPopover;
    private stopHidePopoverTimer;
    dispose(): void;
}
export interface PopoverRequest {
    box: AnchorBox;
    show: (arg0: GlassPane) => Promise<boolean>;
    hide?: (() => void);
}
