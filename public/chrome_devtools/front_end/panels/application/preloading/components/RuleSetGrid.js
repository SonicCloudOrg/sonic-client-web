// Copyright 2023 The Chromium Authors. All rights reserved.
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
import * as VisualLogging from '../../../../ui/visual_logging/visual_logging.js';
import * as NetworkForward from '../../../network/forward/forward.js';
import * as PreloadingHelper from '../helper/helper.js';
import * as PreloadingString from './PreloadingString.js';
import ruleSetGridStyles from './ruleSetGrid.css.js';
const UIStrings = {
    /**
     *@description Column header: Short URL of rule set.
     */
    ruleSet: 'Rule set',
    /**
     *@description Column header: Show how many preloads are associated if valid, error counts if invalid.
     */
    status: 'Status',
    /**
     *@description button: Title of button to reveal the corresponding request of rule set in Elements panel
     */
    buttonClickToRevealInElementsPanel: 'Click to reveal in Elements panel',
    /**
     *@description button: Title of button to reveal the corresponding request of rule set in Network panel
     */
    buttonClickToRevealInNetworkPanel: 'Click to reveal in Network panel',
    /**
     *@description Value of status, specifying rule set contains how many errors.
     */
    errors: '{errorCount, plural, =1 {# error} other {# errors}}',
    /**
     *@description button: Title of button to reveal preloading attempts with filter by selected rule set
     */
    buttonRevealPreloadsAssociatedWithRuleSet: 'Reveal speculative loads associated with this rule set',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/preloading/components/RuleSetGrid.ts', UIStrings);
export const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// Grid component to show SpeculationRules rule sets.
export class RuleSetGrid extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    static litTagName = LitHtml.literal `devtools-resources-ruleset-grid`;
    #shadow = this.attachShadow({ mode: 'open' });
    #data = null;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [ruleSetGridStyles];
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
                    widthWeighting: 80,
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
        LitHtml.render(LitHtml.html `
      <div class="ruleset-container"
      jslog=${VisualLogging.pane('preloading-rules')}>
        <${DataGrid.DataGridController.DataGridController.litTagName} .data=${reportsGridData}>
        </${DataGrid.DataGridController.DataGridController.litTagName}>
      </div>
    `, this.#shadow, { host: this });
        // clang-format on
    }
    #buildReportRows() {
        assertNotNullOrUndefined(this.#data);
        const pageURL = this.#data.pageURL;
        return this.#data.rows.map(row => ({
            cells: [
                { columnId: 'id', value: row.ruleSet.id },
                {
                    columnId: 'rule-set',
                    value: '',
                    renderer: () => ruleSetRenderer(row.ruleSet, pageURL),
                },
                {
                    columnId: 'status',
                    value: row.preloadsStatusSummary,
                    renderer: preloadsStatusSummary => statusRenderer(preloadsStatusSummary, row.ruleSet),
                },
            ],
        }));
    }
}
customElements.define('devtools-resources-ruleset-grid', RuleSetGrid);
function ruleSetRenderer(ruleSet, pageURL) {
    function ruleSetRendererInnerDocument(ruleSet, location) {
        assertNotNullOrUndefined(ruleSet.backendNodeId);
        const revealSpeculationRulesInElements = async () => {
            assertNotNullOrUndefined(ruleSet.backendNodeId);
            const target = SDK.TargetManager.TargetManager.instance().scopeTarget();
            if (target === null) {
                return;
            }
            await Common.Revealer.reveal(new SDK.DOMModel.DeferredDOMNode(target, ruleSet.backendNodeId));
        };
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <button class="link" role="link"
        @click=${revealSpeculationRulesInElements}
        title=${i18nString(UIStrings.buttonClickToRevealInElementsPanel)}
        style=${LitHtml.Directives.styleMap({
            border: 'none',
            background: 'none',
            color: 'var(--icon-link)',
            cursor: 'pointer',
            'text-decoration': 'underline',
            'padding-inline-start': '0',
            'padding-inline-end': '0',
        })}
        jslog=${VisualLogging.action('reveal-in-elements').track({ click: true })}
      >
        <${IconButton.Icon.Icon.litTagName}
          .data=${{
            iconName: 'code-circle',
            color: 'var(--icon-link)',
            width: '16px',
            height: '16px',
        }}
          style=${LitHtml.Directives.styleMap({
            'vertical-align': 'sub',
        })}
        >
        </${IconButton.Icon.Icon.litTagName}>
        ${location}
      </button>
    `;
        // clang-format on
    }
    function ruleSetRendererOutOfDocument(ruleSet, location) {
        assertNotNullOrUndefined(ruleSet.url);
        assertNotNullOrUndefined(ruleSet.requestId);
        const revealSpeculationRulesInNetwork = async () => {
            assertNotNullOrUndefined(ruleSet.requestId);
            const request = SDK.TargetManager.TargetManager.instance()
                .scopeTarget()
                ?.model(SDK.NetworkManager.NetworkManager)
                ?.requestForId(ruleSet.requestId) ||
                null;
            if (request === null) {
                return;
            }
            const requestLocation = NetworkForward.UIRequestLocation.UIRequestLocation.tab(request, "preview" /* NetworkForward.UIRequestLocation.UIRequestTabs.Preview */, { clearFilter: false });
            await Common.Revealer.reveal(requestLocation);
        };
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <button class="link" role="link"
        @click=${revealSpeculationRulesInNetwork}
        title=${i18nString(UIStrings.buttonClickToRevealInNetworkPanel)}
        style=${LitHtml.Directives.styleMap({
            border: 'none',
            background: 'none',
            color: 'var(--icon-link)',
            cursor: 'pointer',
            'text-decoration': 'underline',
            'padding-inline-start': '0',
            'padding-inline-end': '0',
        })}
      >
        <${IconButton.Icon.Icon.litTagName}
         .data=${{
            iconName: 'arrow-up-down-circle',
            color: 'var(--icon-link)',
            width: '16px',
            height: '16px',
        }}
          style=${LitHtml.Directives.styleMap({
            'vertical-align': 'sub',
        })}
        >
        </${IconButton.Icon.Icon.litTagName}>
        ${location}
      </button>
    `;
        // clang-format on
    }
    const location = PreloadingString.ruleSetLocationShort(ruleSet, pageURL);
    if (ruleSet.backendNodeId !== undefined) {
        return ruleSetRendererInnerDocument(ruleSet, location);
    }
    if (ruleSet.url !== undefined && ruleSet.requestId) {
        return ruleSetRendererOutOfDocument(ruleSet, location);
    }
    return LitHtml.html `${location}`;
}
function statusRenderer(preloadsStatusSummary, ruleSet) {
    function counts(preloadsStatusSummary, ruleSet) {
        const revealAttemptViewWithFilter = async () => {
            await Common.Revealer.reveal(new PreloadingHelper.PreloadingForward.AttemptViewWithFilter(ruleSet.id));
        };
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <button class="link" role="link"
        @click=${revealAttemptViewWithFilter}
        title=${i18nString(UIStrings.buttonRevealPreloadsAssociatedWithRuleSet)}
        style=${LitHtml.Directives.styleMap({
            color: 'var(--sys-color-primary)',
            'text-decoration': 'underline',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            'padding-inline-start': '0',
            'padding-inline-end': '0',
        })}
        jslog=${VisualLogging.action('reveal-preloads').track({ click: true })}>
        ${preloadsStatusSummary}
      </button>
    `;
        // clang-format on
    }
    function errors() {
        const nErrors = i18nString(UIStrings.errors, { errorCount: 1 });
        return LitHtml.html `
      <span
        style=${LitHtml.Directives.styleMap({
            color: 'var(--sys-color-error)',
        })}
      >
        ${nErrors}
      </span>
    `;
    }
    switch (ruleSet.errorType) {
        case undefined:
            return counts(preloadsStatusSummary, ruleSet);
        case "SourceIsNotJsonObject" /* Protocol.Preload.RuleSetErrorType.SourceIsNotJsonObject */:
            return errors();
        case "InvalidRulesSkipped" /* Protocol.Preload.RuleSetErrorType.InvalidRulesSkipped */:
            return LitHtml.html `${errors()} ${counts(preloadsStatusSummary, ruleSet)}`;
    }
}
//# sourceMappingURL=RuleSetGrid.js.map