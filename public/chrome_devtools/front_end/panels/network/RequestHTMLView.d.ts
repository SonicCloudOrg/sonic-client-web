import type * as TextUtils from '../../models/text_utils/text_utils.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class RequestHTMLView extends UI.Widget.VBox {
    private readonly dataURL;
    private constructor();
    static create(contentData: TextUtils.ContentData.ContentData): RequestHTMLView | null;
    wasShown(): void;
    willHide(): void;
    private createIFrame;
}
