// Copyright (c) 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as InlineEditor from '../../../ui/legacy/components/inline_editor/inline_editor.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import anchorFunctionLinkSwatchStyles from './anchorFunctionLinkSwatch.css.js';
const UIStrings = {
    /**
     *@description Title in the styles tab for the icon button for jumping to the anchor node.
     */
    jumpToAnchorNode: 'Jump to anchor node',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/components/AnchorFunctionLinkSwatch.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html } = LitHtml;
// clang-format on
export class AnchorFunctionLinkSwatch extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-anchor-function-link-swatch`;
    #shadow = this.attachShadow({ mode: 'open' });
    #data;
    constructor(data) {
        super();
        this.#data = data;
    }
    dataForTest() {
        return this.#data;
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [anchorFunctionLinkSwatchStyles];
        this.render();
    }
    set data(data) {
        this.#data = data;
        this.render();
    }
    #handleIconClick(ev) {
        ev.stopPropagation();
        this.#data.onLinkActivate();
    }
    #renderIdentifierLink() {
        // clang-format off
        return html `<${InlineEditor.LinkSwatch.LinkSwatch.litTagName}
      @mouseenter=${this.#data.onMouseEnter}
      @mouseleave=${this.#data.onMouseLeave}
      .data=${{
            text: this.#data.identifier,
            isDefined: Boolean(this.#data.anchorNode),
            jslogContext: 'anchor-link',
            onLinkActivate: this.#data.onLinkActivate,
        }}></${InlineEditor.LinkSwatch.LinkSwatch.litTagName}>`;
        // clang-format on
    }
    #renderIconLink() {
        // clang-format off
        return html `<${IconButton.Icon.Icon.litTagName}
      role='button'
      title=${i18nString(UIStrings.jumpToAnchorNode)}
      class='icon-link'
      name='open-externally'
      jslog=${VisualLogging.action('jump-to-anchor-node').track({ click: true })}
      @mouseenter=${this.#data.onMouseEnter}
      @mouseleave=${this.#data.onMouseLeave}
      @mousedown=${(ev) => ev.stopPropagation()}
      @click=${this.#handleIconClick}
    ></${IconButton.Icon.Icon.litTagName}>`;
        // clang-format on
    }
    render() {
        if (!this.#data.identifier && !this.#data.anchorNode) {
            return;
        }
        if (this.#data.identifier) {
            // clang-format off
            render(html `${this.#renderIdentifierLink()}${this.#data.needsSpace ? ' ' : ''}`, this.#shadow, { host: this });
            // clang-format on
        }
        else {
            // clang-format off
            render(html `${this.#renderIconLink()}${this.#data.needsSpace ? ' ' : ''}`, this.#shadow, { host: this });
            // clang-format on
        }
    }
}
customElements.define('devtools-anchor-function-link-swatch', AnchorFunctionLinkSwatch);
//# sourceMappingURL=AnchorFunctionLinkSwatch.js.map