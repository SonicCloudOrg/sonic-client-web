// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import computedStylePropertyStyles from './computedStyleProperty.css.js';
const { render, html } = LitHtml;
export class NavigateToSourceEvent extends Event {
    static eventName = 'onnavigatetosource';
    constructor() {
        super(NavigateToSourceEvent.eventName, { bubbles: true, composed: true });
    }
}
export class ComputedStyleProperty extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-computed-style-property`;
    #shadow = this.attachShadow({ mode: 'open' });
    #inherited = false;
    #traceable = false;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [computedStylePropertyStyles];
        this.#render();
    }
    set inherited(inherited) {
        if (inherited === this.#inherited) {
            return;
        }
        this.#inherited = inherited;
        this.#render();
    }
    set traceable(traceable) {
        if (traceable === this.#traceable) {
            return;
        }
        this.#traceable = traceable;
        this.#render();
    }
    #onNavigateToSourceClick() {
        this.dispatchEvent(new NavigateToSourceEvent());
    }
    #render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `
      <div class="computed-style-property ${this.#inherited ? 'inherited' : ''}">
        <div class="property-name">
          <slot name="name"></slot>
        </div>
        <span class="hidden" aria-hidden="false">: </span>
        ${this.#traceable ?
            html `<span class="goto" @click=${this.#onNavigateToSourceClick} jslog=${VisualLogging.action('elements.jump-to-style').track({ click: true })}></span>` :
            null}
        <div class="property-value">
          <slot name="value"></slot>
        </div>
        <span class="hidden" aria-hidden="false">;</span>
      </div>
    `, this.#shadow, {
            host: this,
        });
        // clang-format on
    }
}
customElements.define('devtools-computed-style-property', ComputedStyleProperty);
//# sourceMappingURL=ComputedStyleProperty.js.map