import { type Cell, type Column, type Row } from './DataGridUtils.js';
export declare class ColumnHeaderClickEvent extends Event {
    static readonly eventName = "columnheaderclick";
    data: {
        column: Column;
        columnIndex: number;
    };
    constructor(column: Column, columnIndex: number);
}
export declare class ContextMenuColumnSortClickEvent extends Event {
    static readonly eventName = "contextmenucolumnsortclick";
    data: {
        column: Column;
    };
    constructor(column: Column);
}
export declare class ContextMenuHeaderResetClickEvent extends Event {
    static readonly eventName = "contextmenuheaderresetclick";
    constructor();
}
export declare class NewUserFilterTextEvent extends Event {
    static readonly eventName = "newuserfiltertext";
    data: {
        filterText: string;
    };
    constructor(filterText: string);
}
export declare class BodyCellFocusedEvent extends Event {
    static readonly eventName = "cellfocused";
    /**
     * Although the DataGrid cares only about the focused cell, and has no concept
     * of a focused row, many components that render a data grid want to know what
     * row is active, so on the cell focused event we also send the row that the
     * cell is part of.
     */
    data: {
        cell: Cell;
        row: Row;
    };
    constructor(cell: Cell, row: Row);
}
export declare class RowMouseEnterEvent extends Event {
    static readonly eventName = "rowmouseenter";
    data: {
        row: Row;
    };
    constructor(row: Row);
}
export declare class RowMouseLeaveEvent extends Event {
    static readonly eventName = "rowmouseleave";
    data: {
        row: Row;
    };
    constructor(row: Row);
}
declare global {
    interface HTMLElementEventMap {
        [ColumnHeaderClickEvent.eventName]: ColumnHeaderClickEvent;
        [ContextMenuColumnSortClickEvent.eventName]: ContextMenuColumnSortClickEvent;
        [ContextMenuHeaderResetClickEvent.eventName]: ContextMenuHeaderResetClickEvent;
        [NewUserFilterTextEvent.eventName]: NewUserFilterTextEvent;
        [BodyCellFocusedEvent.eventName]: BodyCellFocusedEvent;
        [RowMouseEnterEvent.eventName]: RowMouseEnterEvent;
        [RowMouseLeaveEvent.eventName]: RowMouseLeaveEvent;
    }
}
