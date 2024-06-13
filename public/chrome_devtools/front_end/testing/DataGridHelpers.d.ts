import * as DataGrid from '../ui/components/data_grid/data_grid.js';
export declare const getFocusableCell: (shadowRoot: ShadowRoot) => HTMLTableCellElement;
export declare const getCellByIndexes: (shadowRoot: ShadowRoot, indexes: {
    column: number;
    row: number;
}) => HTMLTableCellElement;
export declare const getHeaderCells: (shadowRoot: ShadowRoot, options?: {
    onlyVisible: boolean;
}) => HTMLTableCellElement[];
export declare const getValuesOfBodyRowByAriaIndex: (shadowRoot: ShadowRoot, ariaIndex: number, options?: {
    onlyVisible: boolean;
}) => string[];
export declare const getAllRows: (shadowRoot: ShadowRoot) => HTMLTableRowElement[];
export declare const assertCurrentFocusedCellIs: (shadowRoot: ShadowRoot, { column, row }: {
    column: number;
    row: number;
}) => void;
export declare const assertSelectedRowIs: (shadowRoot: ShadowRoot, row: number) => void;
export declare const getDataGrid: (gridComponent: HTMLElement) => DataGrid.DataGrid.DataGrid;
export declare const assertGridContents: (gridComponent: HTMLElement, headerExpected: string[], rowsExpected: string[][]) => DataGrid.DataGrid.DataGrid;
export declare const focusCurrentlyFocusableCell: (shadowRoot: ShadowRoot) => void;
export declare const emulateUserKeyboardNavigation: (shadowRoot: ShadowRoot, key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown') => void;
export declare const emulateUserFocusingCellAt: (shadowRoot: ShadowRoot, position: {
    column: number;
    row: number;
}) => Promise<void>;
export declare const getValuesOfAllBodyRows: (shadowRoot: ShadowRoot, options?: {
    onlyVisible: boolean;
}) => string[][];
export declare const getBodyRowByAriaIndex: (shadowRoot: ShadowRoot, rowIndex: number) => HTMLTableRowElement;
export declare const getHeaderCellForColumnId: (shadowRoot: ShadowRoot, columnId: string) => HTMLTableCellElement;
export declare const getValuesForColumn: (shadowRoot: ShadowRoot, columnId: string) => string[];
