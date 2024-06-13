// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../../core/i18n/i18n.js';
import * as LitHtml from '../../../lit-html/lit-html.js';
import * as VisualLogging from '../../../visual_logging/visual_logging.js';
import textButtonStyles from '../../textButton.css.legacy.js';
import * as ThemeSupport from '../../theme_support/theme_support.js';
import linkSwatchStyles from './linkSwatch.css.js';
const UIStrings = {
    /**
     *@description Text displayed in a tooltip shown when hovering over a var() CSS function in the Styles pane when the custom property in this function does not exist. The parameter is the name of the property.
     *@example {--my-custom-property-name} PH1
     */
    sIsNotDefined: '{PH1} is not defined',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/inline_editor/LinkSwatch.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html, Directives } = LitHtml;
class BaseLinkSwatch extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-base-link-swatch`;
    shadow = this.attachShadow({ mode: 'open' });
    onLinkActivate = () => undefined;
    #linkElement;
    connectedCallback() {
        this.shadow.adoptedStyleSheets = [linkSwatchStyles];
        ThemeSupport.ThemeSupport.instance().appendStyle(this.shadow, textButtonStyles);
    }
    set data(data) {
        this.onLinkActivate = (linkText, event) => {
            if (event instanceof MouseEvent && event.button !== 0) {
                return;
            }
            data.onLinkActivate(linkText);
            event.consume(true);
        };
        data.showTitle = data.showTitle === undefined ? true : data.showTitle;
        this.render(data);
    }
    get linkElement() {
        return this.#linkElement;
    }
    render(data) {
        const { isDefined, text, title } = data;
        const classes = Directives.classMap({
            'link-style': true,
            'text-button': true,
            'link-swatch-link': true,
            'undefined': !isDefined,
        });
        // The linkText's space must be removed, otherwise it cannot be triggered when clicked.
        const onActivate = isDefined ? this.onLinkActivate.bind(this, text.trim()) : null;
        // We added var popover, so don't need the title attribute when no need for showing title and
        // only provide the data-title for the popover to get the data.
        const { startNode } = render(html `<button .disabled=${!isDefined} class=${classes} title=${LitHtml.Directives.ifDefined(data.showTitle ? title : null)} data-title=${LitHtml.Directives.ifDefined(!data.showTitle ? title : null)} @click=${onActivate} role="link" tabindex="-1">${text}</button>`, this.shadow, { host: this });
        if (startNode?.nextSibling instanceof HTMLButtonElement) {
            this.#linkElement = startNode?.nextSibling;
        }
    }
}
export class CSSVarSwatch extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-css-var-swatch`;
    shadow = this.attachShadow({ mode: 'open' });
    #link;
    constructor() {
        super();
        this.tabIndex = -1;
        this.addEventListener('focus', () => {
            const link = this.shadow.querySelector('[role="link"]');
            if (link) {
                link.focus();
            }
        });
    }
    set data(data) {
        this.render(data);
    }
    get link() {
        return this.#link;
    }
    render(data) {
        const { variableName, fromFallback, computedValue, onLinkActivate } = data;
        const isDefined = Boolean(computedValue) && !fromFallback;
        const title = isDefined ? computedValue ?? '' : i18nString(UIStrings.sIsNotDefined, { PH1: variableName });
        this.#link = new BaseLinkSwatch();
        this.#link.data = {
            title,
            showTitle: false,
            text: variableName,
            isDefined,
            onLinkActivate,
        };
        this.#link.classList.add('css-var-link');
        // clang-format off
        render(html `<span data-title=${data.computedValue || ''}
          jslog=${VisualLogging.link('css-variable').track({ click: true, hover: true })}
        >var(${this.#link}<slot name="fallback">${data.fallbackText ? `, ${data.fallbackText}` : ''}</slot>)</span>`, this.shadow, { host: this });
        // clang-format on
    }
}
export class LinkSwatch extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-link-swatch`;
    shadow = this.attachShadow({ mode: 'open' });
    set data(data) {
        this.render(data);
    }
    render(data) {
        const { text, isDefined, onLinkActivate, jslogContext } = data;
        const title = isDefined ? text : i18nString(UIStrings.sIsNotDefined, { PH1: text });
        render(html `<span title=${data.text} jslog=${VisualLogging.link().track({ click: true }).context(jslogContext)}><${BaseLinkSwatch.litTagName} .data=${{
            text,
            isDefined,
            title,
            onLinkActivate,
        }}></${BaseLinkSwatch.litTagName}></span>`, this.shadow, { host: this });
    }
}
customElements.define('devtools-base-link-swatch', BaseLinkSwatch);
customElements.define('devtools-link-swatch', LinkSwatch);
customElements.define('devtools-css-var-swatch', CSSVarSwatch);
//# sourceMappingURL=LinkSwatch.js.map