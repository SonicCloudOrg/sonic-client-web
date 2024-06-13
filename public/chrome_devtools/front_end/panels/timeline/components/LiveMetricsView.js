// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as LiveMetrics from '../../../models/live-metrics/live-metrics.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import liveMetricsViewStyles from './liveMetricsView.css.js';
const { html, nothing, Directives } = LitHtml;
const { until, classMap } = Directives;
export class LiveMetricsNextSteps extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-live-metrics-next-steps`;
    #shadow = this.attachShadow({ mode: 'open' });
    constructor() {
        super();
        this.#render();
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [liveMetricsViewStyles];
    }
    #render() {
        const output = html `
      <div class="next-steps">
        <h3>Next steps</h3>
      </div>
    `;
        LitHtml.render(output, this.#shadow, { host: this });
    }
}
export class LiveMetricsView extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-live-metrics-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #lcpValue;
    #clsValue;
    #inpValue;
    #interactions = [];
    constructor() {
        super();
        this.#render();
    }
    #onMetricStatus(event) {
        this.#lcpValue = event.data.lcp;
        this.#clsValue = event.data.cls;
        this.#inpValue = event.data.inp;
        this.#interactions = event.data.interactions;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [liveMetricsViewStyles];
        const liveMetrics = LiveMetrics.LiveMetrics.instance();
        liveMetrics.addEventListener("status" /* LiveMetrics.Events.Status */, this.#onMetricStatus, this);
        this.#lcpValue = liveMetrics.lcpValue;
        this.#clsValue = liveMetrics.clsValue;
        this.#inpValue = liveMetrics.inpValue;
        this.#interactions = liveMetrics.interactions;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    disconnectedCallback() {
        LiveMetrics.LiveMetrics.instance().removeEventListener("status" /* LiveMetrics.Events.Status */, this.#onMetricStatus, this);
    }
    #renderLiveLcp(lcpValue) {
        const title = 'Largest Contentful Paint (LCP)';
        if (!lcpValue) {
            return this.#renderLiveMetric(title);
        }
        return this.#renderLiveMetric(title, i18n.TimeUtilities.millisToString(lcpValue.value), lcpValue.rating, lcpValue?.node);
    }
    #renderLiveCls(clsValue) {
        const title = 'Cumulative Layout Shift (CLS)';
        if (!clsValue) {
            return this.#renderLiveMetric(title);
        }
        return this.#renderLiveMetric(title, clsValue.value === 0 ? '0' : clsValue.value.toFixed(3), clsValue.rating);
    }
    #renderLiveInp(inpValue) {
        const title = 'Interaction to Next Paint (INP)';
        if (!inpValue) {
            return this.#renderLiveMetric(title);
        }
        return this.#renderLiveMetric(title, i18n.TimeUtilities.millisToString(inpValue.value), inpValue.rating);
    }
    #renderLiveMetric(title, valueStr, rating, node) {
        const ratingClass = rating || 'waiting';
        // clang-format off
        return html `
      <div class="metric-card">
        <div class="metric-card-title">${title}</div>
        <div class=${classMap({
            'metric-card-value': true,
            [ratingClass]: true,
        })}>
          ${valueStr || '-'}
        </div>
        <div class="metric-card-element">
          ${node ? html `
              <div class="metric-card-section-title">Related node</div>
              <div>${until(Common.Linkifier.Linkifier.linkify(node))}</div>`
            : nothing}
        </div>
      </div>
    `;
        // clang-format on
    }
    #render = () => {
        // clang-format off
        const output = html `
      <div class="live-metrics">
        <h3>Local and Field Metrics</h3>
        <div class="metric-cards">
          <div id="lcp">
            ${this.#renderLiveLcp(this.#lcpValue)}
          </div>
          <div id="cls">
            ${this.#renderLiveCls(this.#clsValue)}
          </div>
          <div id="inp">
            ${this.#renderLiveInp(this.#inpValue)}
          </div>
        </div>
        <h3>Interactions</h3>
        <ol class="interactions-list">
          ${this.#interactions.map((interaction, index) => html `
            ${index === 0 ? html `<hr class="divider">` : nothing}
            <li class="interaction">
              <span class="interaction-type">${interaction.interactionType}</span>
              <span class="interaction-node">${interaction.node && until(Common.Linkifier.Linkifier.linkify(interaction.node))}</span>
              <span class=${`interaction-duration ${interaction.rating}`}>${i18n.TimeUtilities.millisToString(interaction.duration)}</span>
            </li>
            <hr class="divider">
          `)}
        </ol>
      </div>
    `;
        LitHtml.render(output, this.#shadow, { host: this });
    };
}
customElements.define('devtools-live-metrics-view', LiveMetricsView);
customElements.define('devtools-live-metrics-next-steps', LiveMetricsNextSteps);
//# sourceMappingURL=LiveMetricsView.js.map