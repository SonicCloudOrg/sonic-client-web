// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as IconButton from '../../../components/icon_button/icon_button.js';
import * as LitHtml from '../../../lit-html/lit-html.js';
import * as VisualLogging from '../../../visual_logging/visual_logging.js';
import * as UI from '../../legacy.js';
import bezierSwatchStyles from './bezierSwatch.css.js';
import cssShadowSwatchStyles from './cssShadowSwatch.css.js';
export class BezierSwatch extends HTMLSpanElement {
    iconElementInternal;
    textElement;
    constructor() {
        super();
        const root = UI.UIUtils.createShadowRootWithCoreStyles(this, {
            cssFile: [bezierSwatchStyles],
            delegatesFocus: undefined,
        });
        this.iconElementInternal = IconButton.Icon.create('bezier-curve-filled', 'bezier-swatch-icon');
        this.iconElementInternal.setAttribute('jslog', `${VisualLogging.showStyleEditor('bezier')}`);
        root.appendChild(this.iconElementInternal);
        this.textElement = this.createChild('span');
        root.createChild('slot');
    }
    static create() {
        let constructor = BezierSwatch.constructorInternal;
        if (!constructor) {
            constructor = UI.UIUtils.registerCustomElement('span', 'bezier-swatch', BezierSwatch);
            BezierSwatch.constructorInternal = constructor;
        }
        return constructor();
    }
    bezierText() {
        return this.textElement.textContent || '';
    }
    setBezierText(text) {
        this.textElement.textContent = text;
    }
    hideText(hide) {
        this.textElement.hidden = hide;
    }
    iconElement() {
        return this.iconElementInternal;
    }
    static constructorInternal = null;
}
export class CSSShadowSwatch extends HTMLElement {
    static litTagName = LitHtml.literal `css-shadow-swatch`;
    #shadow = this.attachShadow({ mode: 'open' });
    #icon;
    #model;
    constructor(model) {
        super();
        this.#model = model;
        this.#shadow.adoptedStyleSheets = [
            cssShadowSwatchStyles,
        ];
        LitHtml.render(LitHtml.html `<${IconButton.Icon.Icon.litTagName} name="shadow" class="shadow-swatch-icon"></${IconButton.Icon.Icon.litTagName}><slot></slot>`, this.#shadow, { host: this });
        this.#icon = this.#shadow.querySelector(IconButton.Icon.Icon.litTagName.value);
    }
    model() {
        return this.#model;
    }
    iconElement() {
        return this.#icon;
    }
}
customElements.define('css-shadow-swatch', CSSShadowSwatch);
//# sourceMappingURL=Swatches.js.map