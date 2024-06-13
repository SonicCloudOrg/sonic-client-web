// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import controlButtonStyles from './controlButton.css.js';
const { html, Decorators, LitElement } = LitHtml;
const { customElement, property } = Decorators;
let ControlButton = class ControlButton extends LitElement {
    static styles = [controlButtonStyles];
    constructor() {
        super();
        this.label = '';
        this.shape = 'square';
        this.disabled = false;
    }
    #handleClickEvent = (event) => {
        if (this.disabled) {
            event.stopPropagation();
            event.preventDefault();
        }
    };
    render() {
        return html `
            <button
                @click=${this.#handleClickEvent}
                .disabled=${this.disabled}
                class="control"
            >
                <div class="icon ${this.shape}"></div>
                <div class="label">${this.label}</div>
            </button>
        `;
    }
};
__decorate([
    property()
], ControlButton.prototype, "label", void 0);
__decorate([
    property()
], ControlButton.prototype, "shape", void 0);
__decorate([
    property()
], ControlButton.prototype, "disabled", void 0);
ControlButton = __decorate([
    customElement('devtools-control-button')
], ControlButton);
export { ControlButton };
//# sourceMappingURL=ControlButton.js.map