import type * as TextUtils from '../../../models/text_utils/text_utils.js';
import { type DataGridContextMenusConfiguration } from './DataGrid.js';
import { type Column, type Row, type SortState } from './DataGridUtils.js';
export interface DataGridControllerData {
    columns: Column[];
    rows: Row[];
    filters?: readonly TextUtils.TextUtils.ParsedFilter[];
    /**
     * Sets an initial sort state for the data grid. Is only used if the component
     * hasn't rendered yet. If you pass this in on subsequent renders, it is
     * ignored.
     */
    initialSort?: SortState;
    contextMenus?: DataGridContextMenusConfiguration;
    label?: string;
    paddingRowsCount?: number;
    showScrollbar?: boolean;
    striped?: boolean;
    /**
     * Disable the auto-scroll on new data feature. This is enabled by default.
     */
    autoScrollToBottom?: boolean;
}
export declare class DataGridController extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    get data(): DataGridControllerData;
    set data(data: DataGridControllerData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-data-grid-controller': DataGridController;
    }
}
