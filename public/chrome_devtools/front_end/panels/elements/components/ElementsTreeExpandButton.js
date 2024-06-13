// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import elementsTreeExpandButtonStyles from './elementsTreeExpandButton.css.js';
const UIStrings = {
    /**
     *@description Aria label for a button expanding collapsed subtree
     */
    expand: 'Expand',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/components/ElementsTreeExpandButton.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ElementsTreeExpandButton extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-elements-tree-expand-button`;
    #shadow = this.attachShadow({ mode: 'open' });
    #clickHandler = () => { };
    set data(data) {
        this.#clickHandler = data.clickHandler;
        this.#update();
    }
    #update() {
        this.#render();
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [elementsTreeExpandButtonStyles];
    }
    #render() {
        // clang-format off
        // This button's innerText will be tested by e2e test and blink layout tests.
        // It can't have any other characters like '\n' or space, otherwise it will break tests.
        LitHtml.render(LitHtml.html `<button
        class="expand-button"
        tabindex="-1"
        aria-label=${i18nString(UIStrings.expand)}
        jslog=${VisualLogging.action('expand').track({ click: true })}
        @click=${this.#clickHandler}><${IconButton.Icon.Icon.litTagName} name="dots-horizontal"></${IconButton.Icon.Icon.litTagName}></button>`, this.#shadow, { host: this });
        // clang-format on
    }
}
customElements.define('devtools-elements-tree-expand-button', ElementsTreeExpandButton);
//# sourceMappingURL=ElementsTreeExpandButton.js.map