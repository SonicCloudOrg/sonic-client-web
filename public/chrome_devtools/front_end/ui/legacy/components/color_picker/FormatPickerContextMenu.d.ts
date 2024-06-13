import * as Common from '../../../../core/common/common.js';
type OnSelectFn = (format: Common.Color.Format) => void;
export declare class FormatPickerContextMenu {
    #private;
    constructor(color: Common.Color.Color, format: Common.Color.Format);
    show(e: Event, onSelect: OnSelectFn): Promise<void>;
}
export {};
