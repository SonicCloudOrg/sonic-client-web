// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import { assertNotNullOrUndefined } from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as DataGrid from '../../../../ui/components/data_grid/data_grid.js';
import * as IconButton from '../../../../ui/components/icon_button/icon_button.js';
import * as LegacyWrapper from '../../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as LitHtml from '../../../../ui/lit-html/lit-html.js';
import preloadingGridStyles from './preloadingGrid.css.js';
import * as PreloadingString from './PreloadingString.js';
const UIStrings = {
    /**
     *@description Column header: Action of preloading (prefetch/prerender)
     */
    action: 'Action',
    /**
     *@description Column header: A rule set of preloading
     */
    ruleSet: 'Rule set',
    /**
     *@description Column header: Status of preloading attempt
     */
    status: 'Status',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/preloading/components/PreloadingGrid.ts', UIStrings);
export const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html } = LitHtml;
// Grid component to show prerendering attempts.
export class PreloadingGrid extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    static litTagName = LitHtml.literal `devtools-resources-preloading-grid`;
    #shadow = this.attachShadow({ mode: 'open' });
    #data = null;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [preloadingGridStyles];
        this.#render();
    }
    update(data) {
        this.#data = data;
        this.#render();
    }
    #render() {
        if (this.#data === null) {
            return;
        }
        const reportsGridData = {
            columns: [
                {
                    id: 'url',
                    title: i18n.i18n.lockedString('URL'),
                    widthWeighting: 40,
                    hideable: false,
                    visible: true,
                    sortable: true,
                },
                {
                    id: 'action',
                    title: i18nString(UIStrings.action),
                    widthWeighting: 15,
                    hideable: false,
                    visible: true,
                    sortable: true,
                },
                {
                    id: 'rule-set',
                    title: i18nString(UIStrings.ruleSet),
                    widthWeighting: 20,
                    hideable: false,
                    visible: true,
                    sortable: true,
                },
                {
                    id: 'status',
                    title: i18nString(UIStrings.status),
                    widthWeighting: 40,
                    hideable: false,
                    visible: true,
                    sortable: true,
                },
            ],
            rows: this.#buildReportRows(),
            striped: true,
        };
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `
      <div class="preloading-container">
        <${DataGrid.DataGridController.DataGridController.litTagName} .data=${reportsGridData}>
        </${DataGrid.DataGridController.DataGridController.litTagName}>
      </div>
    `, this.#shadow, { host: this });
        // clang-format on
    }
    #buildReportRows() {
        function statusRenderer(statusString, status) {
            if (status !== "Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */) {
                return LitHtml.html `<div>${statusString}</div>`;
            }
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            return LitHtml.html `
        <div
          style=${LitHtml.Directives.styleMap({
                color: 'var(--sys-color-error)',
            })}
        >
          <${IconButton.Icon.Icon.litTagName}
            .data=${{
                iconName: 'cross-circle-filled',
                color: 'var(--sys-color-error)',
                width: '16px',
                height: '16px',
            }}
            style=${LitHtml.Directives.styleMap({
                'vertical-align': 'sub',
            })}
          >
          </${IconButton.Icon.Icon.litTagName}>
          ${statusString}
        </div>
      `;
            // clang-format on
        }
        assertNotNullOrUndefined(this.#data);
        const pageURL = this.#data.pageURL;
        const securityOrigin = pageURL === '' ? null : (new Common.ParsedURL.ParsedURL(pageURL)).securityOrigin();
        return this.#data.rows.map(row => ({
            cells: [
                { columnId: 'id', value: row.id },
                {
                    columnId: 'url',
                    value: this.#urlShort(row, securityOrigin),
                    title: row.attempt.key.url,
                },
                { columnId: 'action', value: PreloadingString.capitalizedAction(row.attempt.action) },
                {
                    columnId: 'rule-set',
                    value: row.ruleSets.length === 0 ? '' : PreloadingString.ruleSetLocationShort(row.ruleSets[0], pageURL),
                },
                {
                    columnId: 'status',
                    value: PreloadingString.composedStatus(row.attempt),
                    renderer: status => statusRenderer(status, row.attempt.status),
                },
            ],
        }));
    }
    // Shorten URL if a preloading attempt is same-origin.
    #urlShort(row, securityOrigin) {
        const url = row.attempt.key.url;
        return securityOrigin && url.startsWith(securityOrigin) ? url.slice(securityOrigin.length) : url;
    }
}
customElements.define('devtools-resources-preloading-grid', PreloadingGrid);
//# sourceMappingURL=PreloadingGrid.js.map