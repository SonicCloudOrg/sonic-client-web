// Copyright (c) 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import styles from './serviceWorkerRouterView.css.js';
const { html, render } = LitHtml;
export class ServiceWorkerRouterView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    static litTagName = LitHtml.literal `devtools-service-worker-router-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #rules = [];
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [styles];
    }
    update(rules) {
        this.#rules = rules;
        if (this.#rules.length > 0) {
            this.#render();
        }
    }
    #render() {
        // clang-format off
        render(html `
      <ul class="router-rules">
        ${this.#rules.map(this.#renderRouterRule)}
      </ul>
    `, this.#shadow, { host: this });
        // clang-format on
    }
    #renderRouterRule(rule) {
        return html `
      <li class="router-rule">
        <div class="rule-id">Rule ${rule.id}</div>
        <ul class="item">
          <li class="condition">
            <div class="rule-type">Condition</div>
            <div class="rule-value">${rule.condition}</div>
          </li>
          <li class="source">
            <div class="rule-type">Source</div>
            <div class="rule-value">${rule.source}</div>
          </li>
        </ul>
      </li>
    `;
    }
}
customElements.define('devtools-service-worker-router-view', ServiceWorkerRouterView);
//# sourceMappingURL=ServiceWorkerRouterView.js.map