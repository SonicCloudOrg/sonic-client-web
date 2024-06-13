// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as UI from '../../legacy/legacy.js';
import { DataGrid } from './DataGrid.js';
import dataGridControllerStyles from './dataGridController.css.js';
import { getRowEntryForColumnId, getStringifiedCellValues, } from './DataGridUtils.js';
const UIStrings = {
    /**
     *@description Text announced when the column is sorted in ascending order
     *@example {title} PH1
     */
    sortInAscendingOrder: '{PH1} sorted in ascending order',
    /**
     *@description Text announced when the column is sorted in descending order
     *@example {title} PH1
     */
    sortInDescendingOrder: '{PH1} sorted in descending order',
    /**
     *@description Text announced when the column sorting canceled
     *@example {title} PH1
     */
    sortingCanceled: '{PH1} sorting canceled',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/data_grid/DataGridController.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class DataGridController extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-data-grid-controller`;
    #shadow = this.attachShadow({ mode: 'open' });
    #hasRenderedAtLeastOnce = false;
    #columns = [];
    #rows = [];
    #contextMenus = undefined;
    #label = undefined;
    #showScrollbar = false;
    #striped = false;
    /**
     * Because the controller will sort data in place (e.g. mutate it) when we get
     * new data in we store the original data separately. This is so we don't
     * mutate the data we're given, but a copy of the data. If our `get data` is
     * called, we'll return the original, not the sorted data.
     */
    #originalColumns = [];
    #originalRows = [];
    #sortState = null;
    #filters = [];
    #autoScrollToBottom = true;
    #paddingRowsCount;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [dataGridControllerStyles];
    }
    get data() {
        return {
            columns: this.#originalColumns,
            rows: this.#originalRows,
            filters: this.#filters,
            autoScrollToBottom: this.#autoScrollToBottom,
            contextMenus: this.#contextMenus,
            label: this.#label,
            paddingRowsCount: this.#paddingRowsCount,
            showScrollbar: this.#showScrollbar,
            striped: this.#striped,
        };
    }
    set data(data) {
        this.#originalColumns = data.columns;
        this.#originalRows = data.rows;
        this.#contextMenus = data.contextMenus;
        this.#filters = data.filters || [];
        this.#contextMenus = data.contextMenus;
        this.#label = data.label;
        this.#showScrollbar = data.showScrollbar;
        this.#striped = data.striped;
        if (typeof data.autoScrollToBottom === 'boolean') {
            this.#autoScrollToBottom = data.autoScrollToBottom;
        }
        this.#columns = [...this.#originalColumns];
        this.#rows = this.#cloneAndFilterRows(data.rows, this.#filters);
        if (!this.#hasRenderedAtLeastOnce && data.initialSort) {
            this.#sortState = data.initialSort;
        }
        if (this.#sortState) {
            this.#sortRows(this.#sortState);
        }
        this.#paddingRowsCount = data.paddingRowsCount;
        this.#render();
    }
    #testRowWithFilter(row, filter, visibleColumnIds) {
        let rowMatchesFilter = false;
        const { key, text, negative, regex } = filter;
        let dataToTest;
        if (key) {
            dataToTest = getStringifiedCellValues([getRowEntryForColumnId(row, key)]);
        }
        else {
            dataToTest = getStringifiedCellValues(row.cells.filter(cell => visibleColumnIds.has(cell.columnId)));
        }
        if (regex) {
            rowMatchesFilter = regex.test(dataToTest);
        }
        else if (text) {
            rowMatchesFilter = dataToTest.includes(text.toLowerCase());
        }
        // If `negative` is set to `true`, that means we have to flip the final
        // result, because the filter is matching anything that doesn't match. e.g.
        // {text: 'foo', negative: false} matches rows that contain the text `foo`
        // but {text: 'foo', negative: true} matches rows that do NOT contain the
        // text `foo` so if a filter is marked as negative, we first match against
        // that filter, and then we flip it here.
        return negative ? !rowMatchesFilter : rowMatchesFilter;
    }
    #cloneAndFilterRows(rows, filters) {
        if (filters.length === 0) {
            return [...rows];
        }
        const visibleColumnIds = new Set(this.#columns.filter(column => column.visible).map(column => column.id));
        return rows.map(row => {
            // We assume that the row should be visible by default.
            let rowShouldBeVisible = true;
            for (const filter of filters) {
                const rowMatchesFilter = this.#testRowWithFilter(row, filter, visibleColumnIds);
                // If there are multiple filters, if any return false we hide the row.
                // So if we get a false from testRowWithFilter, we can break early and return false.
                if (!rowMatchesFilter) {
                    rowShouldBeVisible = false;
                    break;
                }
            }
            return {
                ...row,
                hidden: !rowShouldBeVisible,
            };
        });
    }
    #sortRows(state) {
        const { columnId, direction } = state;
        this.#rows.sort((row1, row2) => {
            const cell1 = getRowEntryForColumnId(row1, columnId);
            const cell2 = getRowEntryForColumnId(row2, columnId);
            const value1 = typeof cell1.value === 'number' ? cell1.value : String(cell1.value).toUpperCase();
            const value2 = typeof cell2.value === 'number' ? cell2.value : String(cell2.value).toUpperCase();
            if (value1 < value2) {
                return direction === "ASC" /* SortDirection.ASC */ ? -1 : 1;
            }
            if (value1 > value2) {
                return direction === "ASC" /* SortDirection.ASC */ ? 1 : -1;
            }
            return 0;
        });
        this.#render();
    }
    #onColumnHeaderClick(event) {
        const { column } = event.data;
        if (column.sortable) {
            this.#applySortOnColumn(column);
        }
    }
    #applySortOnColumn(column) {
        if (this.#sortState && this.#sortState.columnId === column.id) {
            const { columnId, direction } = this.#sortState;
            /* When users sort, we go No Sort => ASC => DESC => No sort
             * So if the current direction is DESC, we clear the state.
             */
            if (direction === "DESC" /* SortDirection.DESC */) {
                this.#sortState = null;
            }
            else {
                /* The state is ASC, so toggle to DESC */
                this.#sortState = {
                    columnId,
                    direction: "DESC" /* SortDirection.DESC */,
                };
            }
        }
        else {
            /* The column wasn't previously sorted, so we sort it in ASC order. */
            this.#sortState = {
                columnId: column.id,
                direction: "ASC" /* SortDirection.ASC */,
            };
        }
        const headerName = column.title;
        if (this.#sortState) {
            this.#sortRows(this.#sortState);
            UI.ARIAUtils.alert(this.#sortState.direction === "ASC" /* SortDirection.ASC */ ?
                i18nString(UIStrings.sortInAscendingOrder, { PH1: headerName || '' }) :
                i18nString(UIStrings.sortInDescendingOrder, { PH1: headerName || '' }));
        }
        else {
            // No sortstate = render the original rows.
            this.#rows = this.#cloneAndFilterRows(this.#originalRows, this.#filters);
            this.#render();
            UI.ARIAUtils.alert(i18nString(UIStrings.sortingCanceled, { PH1: headerName || '' }));
        }
    }
    #onContextMenuColumnSortClick(event) {
        this.#applySortOnColumn(event.data.column);
    }
    #onContextMenuHeaderResetClick() {
        this.#sortState = null;
        this.#rows = [...this.#originalRows];
        this.#render();
    }
    #render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <${DataGrid.litTagName} .data=${{
            columns: this.#columns,
            rows: this.#rows,
            activeSort: this.#sortState,
            contextMenus: this.#contextMenus,
            label: this.#label,
            paddingRowsCount: this.#paddingRowsCount,
            showScrollbar: this.#showScrollbar,
            striped: this.#striped,
            autoScrollToBottom: this.#autoScrollToBottom,
        }}
        @columnheaderclick=${this.#onColumnHeaderClick}
        @contextmenucolumnsortclick=${this.#onContextMenuColumnSortClick}
        @contextmenuheaderresetclick=${this.#onContextMenuHeaderResetClick}
     ></${DataGrid.litTagName}>
    `, this.#shadow, {
            host: this,
        });
        // clang-format on
        this.#hasRenderedAtLeastOnce = true;
    }
}
customElements.define('devtools-data-grid-controller', DataGridController);
//# sourceMappingURL=DataGridController.js.map