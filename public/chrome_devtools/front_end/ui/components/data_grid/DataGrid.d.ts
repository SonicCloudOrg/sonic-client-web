import * as UI from '../../legacy/legacy.js';
import { type Column, type Row, type SortState } from './DataGridUtils.js';
export interface DataGridContextMenusConfiguration {
    headerRow?: (menu: UI.ContextMenu.ContextMenu, columns: readonly Column[]) => void;
    bodyRow?: (menu: UI.ContextMenu.ContextMenu, columns: readonly Column[], row: Readonly<Row>, rows: readonly Row[]) => void;
}
export interface DataGridData {
    columns: Column[];
    rows: Row[];
    activeSort: SortState | null;
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
export declare class DataGrid extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    get data(): DataGridData;
    set data(data: DataGridData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-data-grid': DataGrid;
    }
}
